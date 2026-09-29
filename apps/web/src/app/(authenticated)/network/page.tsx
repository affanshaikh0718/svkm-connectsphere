'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { connectionsService } from '@/services/connections.service';
import { usersService } from '@/services/users.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, UserPlus, Users, X, Eye, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NetworkPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [pendingReceived, setPendingReceived] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [recentViewers, setRecentViewers] = useState<any[]>([]);
  const [sentRequestIds, setSentRequestIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [connRes, pendingRes, suggRes, analyticsRes] = await Promise.all([
        connectionsService.getMyConnections().catch(() => ({ data: [] })),
        connectionsService.getPendingRequests().catch(() => ({ data: { received: [], sent: [] } })),
        connectionsService.getSuggestions().catch(() => ({ data: [] })),
        usersService.getAnalytics().catch(() => null),
      ]);

      if (connRes?.data) setConnections(connRes.data);
      if (pendingRes?.data?.received) setPendingReceived(pendingRes.data.received);
      if (pendingRes?.data?.sent) {
        const sentIds = pendingRes.data.sent.map((item: any) => item.addresseeId || item.addressee?.id).filter(Boolean);
        setSentRequestIds(sentIds);
      }
      if (suggRes?.data) setSuggestions(suggRes.data);
      if (analyticsRes?.recentViewers) setRecentViewers(analyticsRes.recentViewers);
    } catch {
      // error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await connectionsService.acceptConnectionRequest(id);
      toast.success('Connection request accepted!');
      loadData();
    } catch {
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await connectionsService.rejectConnectionRequest(id);
      toast.success('Connection request declined');
      loadData();
    } catch {
      toast.error('Failed to decline request');
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      await connectionsService.sendConnectionRequest(userId);
      setSentRequestIds((prev) => [...prev, userId]);
      toast.success('Connection request sent');
      loadData();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        '';
      if (
        errorMsg.toLowerCase().includes('already connected') ||
        errorMsg.toLowerCase().includes('already pending') ||
        err?.response?.status === 409
      ) {
        setSentRequestIds((prev) => [...prev, userId]);
        toast(errorMsg || 'Connection status updated', { icon: '🤝' });
        loadData();
      } else {
        toast.error(errorMsg || 'Failed to send request');
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Pending Invitations */}
      {pendingReceived.length > 0 && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="py-3.5 border-b border-border/40">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Invitations ({pendingReceived.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/40 p-0">
            {pendingReceived.map((req) => (
              <div key={req.id} className="p-4 flex items-center justify-between gap-4">
                <Link href={`/in/${req.requester.username}`} className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={req.requester.profile?.profilePictureUrl} />
                    <AvatarFallback className="font-semibold text-primary">
                      {req.requester.firstName[0]}
                      {req.requester.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-sm hover:underline">
                      {req.requester.firstName} {req.requester.lastName}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                      {req.requester.profile?.headline}
                    </p>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleReject(req.id)} className="h-8">
                    Ignore
                  </Button>
                  <Button size="sm" onClick={() => handleAccept(req.id)} className="h-8">
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Who Viewed Your Profile - Network Insight Card */}
      {recentViewers.length > 0 && (
        <Card className="border-border/50 shadow-sm bg-gradient-to-r from-blue-500/5 via-card to-primary/5">
          <CardHeader className="py-4 border-b border-border/40">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  Who Viewed Your Profile
                </CardTitle>
                <CardDescription className="text-xs">
                  SVKM peers, alumni, and recruiters who checked out your profile recently
                </CardDescription>
              </div>
              <Link href="/profile/analytics">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-primary gap-1 font-semibold">
                  View Analytics <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recentViewers.slice(0, 3).map((viewer: any) => (
                <div
                  key={viewer.id}
                  className="p-3.5 rounded-xl border border-border/60 bg-card/80 hover:bg-card hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  <Link href={`/in/${viewer.username}`} className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border shrink-0">
                      <AvatarImage src={viewer.avatarUrl} />
                      <AvatarFallback className="font-semibold text-primary text-sm">
                        {viewer.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs truncate hover:underline">
                          {viewer.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {viewer.headline || 'SVKM Member'}
                      </p>
                      {viewer.statusBadge && (
                        <span className="inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded bg-primary/10 text-primary mt-1">
                          #{viewer.statusBadge.replace(/\s+/g, '')}
                        </span>
                      )}
                    </div>
                  </Link>

                  {sentRequestIds.includes(viewer.id) ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled
                      className="w-full mt-3 text-xs font-semibold gap-1.5 h-8"
                    >
                      <Check className="h-3.5 w-3.5 text-primary" /> Request Sent
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleConnect(viewer.id)}
                      className="w-full mt-3 text-xs font-semibold gap-1.5 h-8 border-primary/30 hover:bg-primary/5 text-primary"
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Connect
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* People You May Know */}
      {suggestions.length > 0 && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              People you may know
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {suggestions.map((person) => (
                <div
                  key={person.id}
                  className="p-4 rounded-xl border border-border/60 bg-card text-center flex flex-col justify-between items-center hover:border-primary/40 transition-all"
                >
                  <Link href={`/in/${person.username}`} className="w-full flex flex-col items-center">
                    <Avatar className="h-16 w-16 mb-2.5 border">
                      <AvatarImage src={person.profile?.profilePictureUrl} />
                      <AvatarFallback className="font-semibold text-primary text-lg">
                        {person.firstName[0]}
                        {person.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="font-semibold text-sm hover:underline line-clamp-1">
                      {person.firstName} {person.lastName}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 h-8 mt-0.5 leading-snug">
                      {person.profile?.headline || `@${person.username}`}
                    </p>
                  </Link>

                  {sentRequestIds.includes(person.id) ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled
                      className="w-full mt-4 text-xs font-semibold gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5 text-primary" /> Request Sent
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleConnect(person.id)}
                      className="w-full mt-4 text-xs font-semibold gap-1.5"
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Connect
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Connections Grid */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="py-4">
          <CardTitle className="text-base font-bold">
            My Connections ({connections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              No connections yet. Connect with professionals above to expand your network.
            </p>
          ) : (
            <div className="divide-y divide-border/40">
              {connections.map((c) => (
                <div key={c.connectionId} className="py-3 flex items-center justify-between">
                  <Link href={`/in/${c.user.username}`} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={c.user.profile?.profilePictureUrl} />
                      <AvatarFallback className="font-semibold text-primary">
                        {c.user.firstName[0]}
                        {c.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-sm hover:underline">
                        {c.user.firstName} {c.user.lastName}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {c.user.profile?.headline}
                      </p>
                    </div>
                  </Link>

                  <Link href={`/in/${c.user.username}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      View Profile
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
