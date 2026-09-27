'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { messagingService } from '@/services/messaging.service';
import { useMessaging } from '@/hooks/use-messaging';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { formatTimeAgo } from '@/lib/utils';
import { MessageSquare, Send } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [inputMessage, setInputMessage] = useState('');

  const { messages, sendMessage, isConnected } = useMessaging(activeConversation?.id);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await messagingService.getMyConversations();
        if (res.data) {
          setConversations(res.data);
          if (res.data.length > 0) {
            setActiveConversation(res.data[0]);
          }
        }
      } catch {
        // error
      }
    };

    fetchConversations();
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConversation) return;
    sendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const getOtherParticipant = (conv: any) => {
    const other = conv?.members?.find((m: any) => m.userId !== user?.id);
    return other?.user || { firstName: 'User', lastName: '' };
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4">
      <Card className="border-border/50 shadow-sm overflow-hidden h-[680px] flex">
        {/* Left: Conversations List */}
        <div className="w-80 border-r border-border/50 flex flex-col bg-card">
          <div className="p-4 border-b border-border/50 flex justify-between items-center">
            <h2 className="font-bold text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Messaging
            </h2>
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-12 px-4">
                No conversations yet. Visit someone&apos;s profile to start chatting.
              </p>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isActive = activeConversation?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                      isActive ? 'bg-secondary/60' : 'hover:bg-secondary/20'
                    }`}
                  >
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={other.profile?.profilePictureUrl} />
                      <AvatarFallback className="text-xs font-semibold text-primary">
                        {other.firstName[0]}
                        {other.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs truncate">
                        {other.firstName} {other.lastName}
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate">
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
              <div className="p-3.5 border-b border-border/50 flex items-center gap-3 bg-card">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={getOtherParticipant(activeConversation).profile?.profilePictureUrl}
                  />
                  <AvatarFallback className="text-xs font-semibold">
                    {getOtherParticipant(activeConversation).firstName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-xs">
                    {getOtherParticipant(activeConversation).firstName}{' '}
                    {getOtherParticipant(activeConversation).lastName}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    {getOtherParticipant(activeConversation).profile?.headline || 'Active now'}
                  </p>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((msg: any) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                          isMine
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-secondary text-secondary-foreground rounded-bl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-1 px-1">
                        {formatTimeAgo(msg.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSend} className="p-3 border-t border-border/50 flex gap-2 bg-card">
                <Input
                  placeholder="Write a message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="text-xs h-9"
                />
                <Button type="submit" size="sm" disabled={!inputMessage.trim()} className="px-4">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
