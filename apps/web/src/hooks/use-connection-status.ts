'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionsService } from '@/services/connections.service';
import toast from 'react-hot-toast';
import type { ConnectionStatus } from '@/types';

export function useConnectionStatus(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['connection-status', userId],
    queryFn: () => connectionsService.getConnectionStatus(userId!),
    enabled: Boolean(userId),
  });

  const sendRequest = useMutation({
    mutationFn: () => connectionsService.sendConnectionRequest(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-status', userId] });
      toast.success('Connection request sent!');
    },
    onError: () => toast.error('Failed to send request'),
  });

  const acceptRequest = useMutation({
    mutationFn: (connectionId: string) => connectionsService.acceptConnectionRequest(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-status', userId] });
      queryClient.invalidateQueries({ queryKey: ['connections', 'pending'] });
      toast.success('Connection accepted!');
    },
    onError: () => toast.error('Failed to accept request'),
  });

  const declineRequest = useMutation({
    mutationFn: (connectionId: string) => connectionsService.declineConnectionRequest(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-status', userId] });
      queryClient.invalidateQueries({ queryKey: ['connections', 'pending'] });
      toast.success('Request declined');
    },
    onError: () => toast.error('Failed to decline request'),
  });

  const withdraw = useMutation({
    mutationFn: (connectionId: string) => connectionsService.withdrawConnectionRequest(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-status', userId] });
      toast.success('Request withdrawn');
    },
    onError: () => toast.error('Failed to withdraw request'),
  });

  return {
    status: data?.status as ConnectionStatus | undefined,
    connectionId: data?.connectionId,
    isLoading,
    sendRequest,
    acceptRequest,
    declineRequest,
    withdraw,
  };
}
