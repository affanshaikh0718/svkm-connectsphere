'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { messagingService } from '@/services/messaging.service';
import { useMessaging } from '@/hooks/use-messaging';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTimeAgo } from '@/lib/utils';
import { ArrowRight, Bot, Loader2, MessageSquare, Send, Sparkles, UserPlus } from 'lucide-react';

function MessagesPageContent() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const queryUserId = searchParams.get('userId');
  const queryConversationId = searchParams.get('conversationId');

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isConnected } = useMessaging(activeConversation?.id);

  // Auto-scroll to bottom of messages container
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoadingConversations(true);
        const res = await messagingService.getMyConversations();
        let list = Array.isArray(res) ? res : (res?.data || []);

        // If target userId specified in query, ensure direct conversation is created/selected
        if (queryUserId && user?.id && queryUserId !== user.id) {
          try {
            const targetConv = await messagingService.getOrCreateDirectConversation(queryUserId);
            if (targetConv?.id) {
              const existingIdx = list.findIndex((c: any) => c.id === targetConv.id);
              if (existingIdx === -1) {
                list = [targetConv, ...list];
              }
              setActiveConversation(targetConv);
            }
          } catch {
            // fallback
          }
        } else if (queryConversationId) {
          const match = list.find((c: any) => c.id === queryConversationId);
          if (match) setActiveConversation(match);
          else if (list.length > 0) setActiveConversation(list[0]);
        } else if (list.length > 0 && !activeConversation) {
          setActiveConversation(list[0]);
        }

        setConversations(list);
      } catch {
        // error
      } finally {
        setIsLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [queryUserId, queryConversationId, user?.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text || !activeConversation || isSending) return;

    try {
      setIsSending(true);
      const sent = await sendMessage(text);
      setInputMessage('');

      // Update conversations list state to show latest message preview and bump active to top
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              updatedAt: new Date().toISOString(),
              messages: [{ content: text, createdAt: new Date().toISOString() }],
            };
          }
          return c;
        });
        // Sort active conversation to top
        return [
          ...updated.filter((c) => c.id === activeConversation.id),
          ...updated.filter((c) => c.id !== activeConversation.id),
        ];
      });
    } catch {
      // error handled
    } finally {
      setIsSending(false);
    }
  };

  const getOtherParticipant = (conv: any) => {
    const other = conv?.members?.find((m: any) => m.userId !== user?.id);
    return other?.user || { firstName: 'User', lastName: '' };
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4">
      <Card className="border-border/50 shadow-sm overflow-hidden h-[680px] flex">
        {/* Left: Conversations List */}
        <div className="w-80 border-r border-border/50 flex flex-col bg-card shrink-0">
          <div className="p-4 border-b border-border/50 flex justify-between items-center bg-card">
            <h2 className="font-bold text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Messaging
            </h2>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isConnected ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-amber-500'
                }`}
                title={isConnected ? 'Live WebSocket Connected' : 'Connecting to chat stream...'}
              />
              <span className="text-[10px] text-muted-foreground font-medium">
                {isConnected ? 'Online' : 'Connecting'}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {isLoadingConversations ? (
              <div className="p-3 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-2.5 w-36" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">No conversations yet</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px] mx-auto">
                    Connect with SVKM students, alumni, and faculty to exchange direct messages.
                  </p>
                </div>
                <Link href="/network">
                  <Button size="sm" variant="outline" className="text-xs h-7 mt-2 gap-1">
                    <UserPlus className="h-3 w-3" /> Find Connections
                  </Button>
                </Link>
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isActive = activeConversation?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                      isActive ? 'bg-secondary/60 font-medium' : 'hover:bg-secondary/20'
                    }`}
                  >
                    <Avatar className="h-10 w-10 border shadow-xs">
                      <AvatarImage src={other.profile?.profilePictureUrl} />
                      <AvatarFallback className="text-xs font-semibold text-primary bg-primary/10">
                        {other.firstName?.[0] || 'U'}
                        {other.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-semibold text-xs truncate text-foreground">
                          {other.firstName} {other.lastName}
                        </h4>
                        {conv.updatedAt && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatTimeAgo(conv.updatedAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {conv.messages?.[0]?.content || 'Started a conversation'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Thread */}
        <div className="flex-1 flex flex-col bg-background">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-border/50 flex items-center justify-between gap-3 bg-card">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border shadow-xs">
                    <AvatarImage
                      src={getOtherParticipant(activeConversation).profile?.profilePictureUrl}
                    />
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {getOtherParticipant(activeConversation).firstName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-xs text-foreground">
                      {getOtherParticipant(activeConversation).firstName}{' '}
                      {getOtherParticipant(activeConversation).lastName}
                    </h3>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {getOtherParticipant(activeConversation).profile?.headline || 'SVKM Ecosystem Member'}
                    </p>
                  </div>
                </div>

                {getOtherParticipant(activeConversation).username && (
                  <Link
                    href={`/in/${getOtherParticipant(activeConversation).username}`}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    View Profile
                  </Link>
                )}
              </div>

              {/* Messages Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-background/50">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-sm">
                      Say hello to {getOtherParticipant(activeConversation).firstName}!
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                      You are connected on ConnectSphere. Start exchanging ideas, academic collaborations, or project notes.
                    </p>
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    if (msg.type === 'SYSTEM') {
                      return (
                        <div key={msg.id} className="flex justify-center my-3">
                          <div className="max-w-[85%] rounded-xl px-4 py-2.5 bg-primary/10 border border-primary/20 text-xs text-foreground flex items-start gap-2.5 shadow-xs">
                            <Bot className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="font-semibold text-primary block text-[11px]">
                                ConnectSphere Assistant
                              </span>
                              <p className="leading-relaxed text-muted-foreground">{msg.content}</p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    const isMine = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs ${
                            isMine
                              ? 'bg-primary text-primary-foreground rounded-br-xs'
                              : 'bg-secondary text-secondary-foreground rounded-bl-xs'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-muted-foreground mt-1 px-1">
                          {formatTimeAgo(msg.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSend} className="p-3 border-t border-border/50 flex gap-2 bg-card">
                <Input
                  placeholder={`Write a message to ${getOtherParticipant(activeConversation).firstName}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isSending}
                  className="text-xs h-9 flex-1"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!inputMessage.trim() || isSending}
                  className="px-4 font-semibold text-xs"
                >
                  {isSending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground">
                <MessageSquare className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Select a conversation</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Pick a discussion thread from the left or visit a 1st-degree connection&apos;s profile to send a direct message.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-5xl mx-auto py-6 px-4">
          <Card className="h-[680px] flex items-center justify-center text-xs text-muted-foreground">
            Loading conversations...
          </Card>
        </div>
      }
    >
      <MessagesPageContent />
    </Suspense>
  );
}
