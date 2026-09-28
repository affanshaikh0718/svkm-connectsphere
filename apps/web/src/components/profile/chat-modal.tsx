'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMessaging } from '@/hooks/use-messaging';
import { useAuthStore } from '@/stores/auth.store';
import { formatTimeAgo } from '@/lib/utils';
import { Bot, ExternalLink, Loader2, MessageSquare, Send } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    profile?: {
      headline?: string;
      profilePictureUrl?: string;
    };
  };
  conversationId: string;
}

export function ChatModal({
  isOpen,
  onClose,
  recipient,
  conversationId,
}: ChatModalProps) {
  const currentUser = useAuthStore((s) => s.user);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, isConnected } = useMessaging(conversationId);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;

    try {
      setIsSending(true);
      await sendMessage(trimmed);
      setInputText('');
      inputRef.current?.focus();
    } catch {
      // error handled by hook
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden flex flex-col h-[560px] max-h-[90vh]">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-border/50 bg-card shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border shadow-sm">
                  <AvatarImage src={recipient.profile?.profilePictureUrl} />
                  <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                    {recipient.firstName[0]}
                    {recipient.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${
                    isConnected ? 'bg-emerald-500' : 'bg-muted-foreground'
                  }`}
                  title={isConnected ? 'Connected' : 'Offline'}
                />
              </div>
              <div className="text-left">
                <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
                  {recipient.firstName} {recipient.lastName}
                  <span className="text-[11px] font-normal text-muted-foreground">
                    @{recipient.username}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-[11px] text-muted-foreground line-clamp-1">
                  {recipient.profile?.headline || 'SVKM Network Member'}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mr-6">
              <Link
                href={`/messages?conversationId=${conversationId}`}
                className="text-xs text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-secondary/60 transition-colors flex items-center gap-1"
                title="Open in full inbox"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </DialogHeader>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-background/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-sm">Start your conversation</h4>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Say hello to {recipient.firstName}! You are 1st-degree connections on SVKM
                ConnectSphere.
              </p>
            </div>
          ) : (
            messages.map((msg: any) => {
              if (msg.type === 'SYSTEM') {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <div className="max-w-[90%] rounded-xl px-3 py-2 bg-primary/10 border border-primary/20 text-xs text-foreground flex items-start gap-2 shadow-xs">
                      <Bot className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              }

              const isMine = msg.senderId === currentUser?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs ${
                      isMine
                        ? 'bg-primary text-primary-foreground rounded-br-xs'
                        : 'bg-secondary text-secondary-foreground rounded-bl-xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-muted-foreground mt-0.5 px-1">
                    {formatTimeAgo(msg.createdAt)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form
          onSubmit={handleSend}
          className="p-3 border-t border-border/50 bg-card flex items-center gap-2 shrink-0"
        >
          <Input
            ref={inputRef}
            placeholder={`Message ${recipient.firstName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            className="text-xs h-9 flex-1"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!inputText.trim() || isSending}
            className="h-9 px-4 text-xs font-semibold gap-1"
          >
            {isSending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Send
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
