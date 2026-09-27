'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from './use-socket';
import { messagingService } from '@/services/messaging.service';
import type { Message, Conversation } from '@/types';

export function useMessaging(conversationId?: string) {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  let typingTimeout: ReturnType<typeof setTimeout> | null = null;

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    messagingService
      .getMessages(conversationId)
      .then((res) => {
        if (res?.data) {
          setMessages(res.data);
        }
      })
      .catch(() => {});
  }, [conversationId]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join conversation room
    socket.emit('join_conversation', { conversationId });

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [message, ...prev.filter((m) => m.id !== message.id)]);

      queryClient.setQueryData(
        ['messages', conversationId],
        (old: { pages: Array<{ data: Message[]; nextCursor?: string; hasMore: boolean }> } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page, index) =>
              index === 0 ? { ...page, data: [message, ...page.data] } : page
            ),
          };
        }
      );

      // Update conversation list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    // Listen for typing indicators
    const handleTypingStart = ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
    };

    const handleTypingStop = ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== userId));
    };

    // Listen for message read status
    const handleMessageRead = ({ messageId, userId }: { messageId: string; userId: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, readBy: [...(msg.readBy || []), userId], isRead: true }
            : msg
        )
      );

      queryClient.setQueryData(
        ['messages', conversationId],
        (old: { pages: Array<{ data: Message[] }> } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((msg) =>
                msg.id === messageId
                  ? { ...msg, readBy: [...msg.readBy, userId], isRead: true }
                  : msg
              ),
            })),
          };
        }
      );
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);
    socket.on('message_read', handleMessageRead);

    return () => {
      socket.emit('leave_conversation', { conversationId });
      socket.off('new_message', handleNewMessage);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
      socket.off('message_read', handleMessageRead);
    };
  }, [socket, conversationId, queryClient]);

  const sendTypingIndicator = useCallback(() => {
    if (!socket || !conversationId) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', { conversationId });
    }

    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_stop', { conversationId });
    }, 2000);
  }, [socket, conversationId, isTyping]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !content.trim()) return;
      const sent = await messagingService.sendMessage(conversationId, content);
      if (sent) {
        setMessages((prev) => [sent, ...prev.filter((m) => m.id !== sent.id)]);
      }
      return sent;
    },
    [conversationId]
  );

  return { messages, typingUsers, sendTypingIndicator, sendMessage, isConnected };
}
