'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { connectionsService } from '@/services/connections.service';
import { usersService } from '@/services/users.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check, UserPlus, Users, X, Eye, ArrowRight, Sparkles, Send, Clock, Undo2 } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function NetworkPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [pendingReceived, setPendingReceived] = useState<any[]>([]);
  const [pendingSent, setPendingSent] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [recentViewers, setRecentViewers] = useState<any[]>([]);
  const [sentRequestIds, setSentRequestIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'received' | 'sent' | 'connections'>('all');

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
        setPendingSent(pendingRes.data.sent);
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

  const handleWithdraw = async (id: string, targetUserId?: string) => {
    try {
      await connectionsService.withdrawConnectionRequest(id);
      setPendingSent((prev) => prev.filter((item) => item.id !== id));
      if (targetUserId) {
        setSentRequestIds((prev) => prev.filter((uid) => uid !== targetUserId));
      }
      toast.success('Connection request withdrawn');
      loadData();
    } catch {
      toast.error('Failed to withdraw request');
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
      {/* Network Overview Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> My SVKM Professional Network
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your incoming invitations, outgoing pending requests, and peer connections
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1 text-primary border-primary/30">
            {connections.length} Connected Members
          </Badge>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-xl h-9 p-0.5 bg-secondary/50 border border-border/50">
          <TabsTrigger value="all" className="text-xs font-medium">
            Explore All
          </TabsTrigger>
          <TabsTrigger value="received" className="text-xs font-medium gap-1.5">
            Received
            {pendingReceived.length > 0 && (
              <Badge className="text-[9px] h-3.5 px-1 rounded-full bg-primary text-primary-foreground">
                {pendingReceived.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="text-xs font-medium gap-1.5">
            Sent Pending
            {pendingSent.length > 0 && (
              <Badge variant="secondary" className="text-[9px] h-3.5 px-1 rounded-full bg-primary/10 text-primary">
                {pendingSent.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="connections" className="text-xs font-medium">
            Connections ({connections.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab: Received Invitations */}
        <TabsContent value="received" className="pt-4 space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="py-3.5 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Received Invitations ({pendingReceived.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/40 p-0">
              {pendingReceived.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground">
                  No pending incoming connection invitations
                </div>
              ) : (
                pendingReceived.map((req) => (
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
                        {req.message && (
                          <p className="text-[11px] text-foreground/80 italic mt-0.5">&ldquo;{req.message}&rdquo;</p>
                        )}
                      </div>
                    </Link>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleReject(req.id)} className="h-8 text-xs">
                        Ignore
                      </Button>
                      <Button size="sm" onClick={() => handleAccept(req.id)} className="h-8 text-xs font-semibold">
                        Accept
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Sent Pending Invitations (Block 4) */}
        <TabsContent value="sent" className="pt-4 space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="py-3.5 border-b border-border/40">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" /> Outgoing Pending Requests ({pendingSent.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Invitations you have sent awaiting response from recipients
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border/40 p-0">
              {pendingSent.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-2">
                  <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-xs font-semibold text-foreground">No pending outgoing requests</p>
                  <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                    When you send connection invitations to SVKM students, alumni, or faculty, they will appear here.
                  </p>
                </div>
              ) : (
                pendingSent.map((req) => {
                  const targetUser = req.addressee;
                  return (
                    <div key={req.id} className="p-4 flex items-center justify-between gap-4 hover:bg-secondary/20 transition-colors">
                      <Link href={`/in/${targetUser?.username}`} className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-12 w-12 border shrink-0">
                          <AvatarImage src={targetUser?.profile?.profilePictureUrl} />
                          <AvatarFallback className="font-semibold text-primary">
                            {targetUser?.firstName?.[0] || 'U'}
                            {targetUser?.lastName?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm hover:underline truncate">
                              {targetUser?.firstName} {targetUser?.lastName}
                            </h4>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-500/30 text-amber-600 bg-amber-500/10">
                              PENDING
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                            {targetUser?.profile?.headline || 'SVKM Member'}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>Sent {formatTimeAgo(req.createdAt)}</span>
                          </div>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWithdraw(req.id, targetUser?.id)}
                          className="h-8 text-xs gap-1.5 hover:border-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Undo2 className="h-3.5 w-3.5" /> Withdraw Request
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: My Connections */}
        <TabsContent value="connections" className="pt-4 space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="py-3.5 border-b border-border/40">
              <CardTitle className="text-sm font-semibold">
                My SVKM Connections ({connections.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/40 p-0">
              {connections.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground">
                  You haven&apos;t connected with any members yet.
                </div>
              ) : (
                connections.map((c) => (
                  <div key={c.connectionId} className="p-4 flex items-center justify-between">
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

                    <div className="flex gap-2">
                      <Link href={`/messages`}>
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          Message
                        </Button>
                      </Link>
                      <Link href={`/in/${c.user.username}`}>
                        <Button variant="ghost" size="sm" className="text-xs h-8 text-primary">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Explore All (Default View) */}
        <TabsContent value="all" className="pt-4 space-y-6">
          {/* Pending Invitations Banner if any */}
          {pendingReceived.length > 0 && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="py-3.5 border-b border-border/40">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Invitations ({pendingReceived.length})</span>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('received')} className="text-xs text-primary h-7 px-2">
                    View All →
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border/40 p-0">
                {pendingReceived.slice(0, 3).map((req) => (
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
                      <Button variant="outline" size="sm" onClick={() => handleReject(req.id)} className="h-8 text-xs">
                        Ignore
                      </Button>
                      <Button size="sm" onClick={() => handleAccept(req.id)} className="h-8 text-xs font-semibold">
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Pending Sent Section Quick Summary if any */}
          {pendingSent.length > 0 && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="py-3.5 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Send className="h-4 w-4 text-primary" /> Outgoing Pending Requests ({pendingSent.length})
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('sent')} className="text-xs text-primary h-7 px-2">
                    Manage Sent Requests →
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="divide-y divide-border/40 p-0">
                {pendingSent.slice(0, 2).map((req) => {
                  const targetUser = req.addressee;
                  return (
                    <div key={req.id} className="p-3.5 flex items-center justify-between gap-4">
                      <Link href={`/in/${targetUser?.username}`} className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-10 w-10 border shrink-0">
                          <AvatarImage src={targetUser?.profile?.profilePictureUrl} />
                          <AvatarFallback className="font-semibold text-primary text-xs">
                            {targetUser?.firstName?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-xs hover:underline truncate">
                            {targetUser?.firstName} {targetUser?.lastName}
                          </h4>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {targetUser?.profile?.headline || 'SVKM Member'}
                          </p>
                        </div>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleWithdraw(req.id, targetUser?.id)}
                        className="h-7 text-[11px] gap-1 hover:border-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Undo2 className="h-3 w-3" /> Withdraw
                      </Button>
                    </div>
                  );
                })}
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

                      <div className="flex gap-2">
                        <Link href={`/messages`}>
                          <Button variant="outline" size="sm" className="text-xs h-8">
                            Message
                          </Button>
                        </Link>
                        <Link href={`/in/${c.user.username}`}>
                          <Button variant="ghost" size="sm" className="text-xs h-8 text-primary">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
