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
      .then((res: any) => {
        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (res?.data?.data || []));
        setMessages(list);
      })
      .catch(() => {});
  }, [conversationId]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join conversation room
    socket.emit('join_conversation', { conversationId });
    socket.emit('join:conversation', { conversationId });

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });

      queryClient.setQueryData(
        ['messages', conversationId],
        (old: { pages: Array<{ data: Message[]; nextCursor?: string; hasMore: boolean }> } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page, index) =>
              index === 0 ? { ...page, data: [...page.data, message] } : page
            ),
          };
        }
      );

      // Update conversation list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    // Listen for typing indicators
    const handleTypingStart = (data: { userId: string }) => {
      const userId = data?.userId;
      if (userId) {
        setTypingUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
      }
    };

    const handleTypingStop = (data: { userId: string }) => {
      const userId = data?.userId;
      if (userId) {
        setTypingUsers((prev) => prev.filter((id) => id !== userId));
      }
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
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message:received', handleNewMessage);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing:indicator', (data) => {
      if (data?.isTyping) handleTypingStart(data);
      else handleTypingStop(data);
    });
    socket.on('typing_stop', handleTypingStop);
    socket.on('message_read', handleMessageRead);

    return () => {
      socket.emit('leave_conversation', { conversationId });
      socket.emit('leave:conversation', { conversationId });
      socket.off('new_message', handleNewMessage);
      socket.off('message:received', handleNewMessage);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing:indicator');
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
        setMessages((prev) => {
          if (prev.some((m) => m.id === sent.id)) return prev;
          return [...prev, sent];
        });
      }
      return sent;
    },
    [conversationId]
  );

  return { messages, typingUsers, sendTypingIndicator, sendMessage, isConnected };
}
