'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { recommendationsService } from '@/services/recommendations.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo } from '@/lib/utils';
import {
  AlertCircle,
  Award,
  Check,
  Clock,
  Edit3,
  ExternalLink,
  Inbox,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Recommendation, RecommendationsInboxResponse } from '@/types';
import { WriteRecommendationModal } from './write-recommendation-modal';
import { RequestRevisionModal } from './request-revision-modal';

interface RecommendationsInboxWidgetProps {
  onRefreshParent?: () => void;
}

export function RecommendationsInboxWidget({
  onRefreshParent,
}: RecommendationsInboxWidgetProps) {
  const [inbox, setInbox] = useState<RecommendationsInboxResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active modals
  const [activeFulfillRequest, setActiveFulfillRequest] = useState<Recommendation | null>(
    null
  );
  const [activeRevisionRequest, setActiveRevisionRequest] = useState<Recommendation | null>(
    null
  );

  const fetchInbox = async () => {
    try {
      setIsLoading(true);
      const res = await recommendationsService.getInbox();
      setInbox(res);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const handleAccept = async (recId: string) => {
    try {
      await recommendationsService.acceptRecommendation(recId);
      toast.success('Recommendation accepted and added to your profile!');
      fetchInbox();
      onRefreshParent?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to accept recommendation');
    }
  };

  const handleDismiss = async (recId: string) => {
    if (!window.confirm('Are you sure you want to decline this recommendation?')) return;
    try {
      await recommendationsService.dismissRecommendation(recId);
      toast.success('Recommendation declined');
      fetchInbox();
      onRefreshParent?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to decline recommendation');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-xs text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        Loading recommendations activity...
      </div>
    );
  }

  const incomingRequests = inbox?.incomingRequests || [];
  const pendingApprovals = inbox?.pendingApprovals || [];
  const revisionsRequested = inbox?.revisionsRequested || [];
  const sentRequests = inbox?.sentRequests || [];

  const totalActionable =
    incomingRequests.length + pendingApprovals.length + revisionsRequested.length;

  if (totalActionable === 0 && sentRequests.length === 0) {
    return (
      <div className="text-center py-12 px-4 space-y-2">
        <Award className="h-8 w-8 text-muted-foreground mx-auto opacity-40" />
        <h4 className="text-sm font-semibold text-foreground">
          No pending recommendation requests
        </h4>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          You are all caught up! When connections request recommendations or submit one for
          you, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* 1. Pending Approvals (Recommendations written for me) */}
      {pendingApprovals.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-blue-600" />
              Recommendations Waiting for Your Approval ({pendingApprovals.length})
            </h4>
            <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-500/30">
              Action Required
            </Badge>
          </div>

          <div className="space-y-2">
            {pendingApprovals.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src={rec.sender?.profile?.profilePictureUrl} />
                      <AvatarFallback className="text-xs font-semibold text-primary">
                        {rec.sender?.firstName?.[0]}
                        {rec.sender?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {rec.sender?.firstName} {rec.sender?.lastName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Position: <span className="font-semibold">{rec.positionTitle}</span>{' '}
                        • {rec.relationship}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatTimeAgo(rec.createdAt)}
                  </span>
                </div>

                {rec.content && (
                  <p className="text-xs text-foreground/90 italic pl-3 border-l-2 border-primary/40 line-clamp-3">
                    &quot;{rec.content}&quot;
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDismiss(rec.id)}
                    className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1"
                  >
                    <X className="h-3.5 w-3.5" /> Decline
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveRevisionRequest(rec)}
                    className="h-7 text-xs gap-1 border-amber-500/40 text-amber-700 dark:text-amber-400"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Request Revision
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAccept(rec.id)}
                    className="h-7 text-xs gap-1 bg-primary text-primary-foreground font-semibold"
                  >
                    <Check className="h-3.5 w-3.5" /> Accept & Display
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Incoming Requests (Connections asking me to write for them) */}
      {incomingRequests.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Incoming Requests to Write Recommendations ({incomingRequests.length})
            </h4>
            <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
              Requests
            </Badge>
          </div>

          <div className="space-y-2">
            {incomingRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-3 flex-wrap"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={req.requester?.profile?.profilePictureUrl} />
                    <AvatarFallback className="text-xs font-semibold text-primary">
                      {req.requester?.firstName?.[0]}
                      {req.requester?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">
                      {req.requester?.firstName} {req.requester?.lastName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Role: <span className="font-semibold">{req.positionTitle}</span> •{' '}
                      {req.relationship}
                    </p>
                    {req.requestMessage && (
                      <p className="text-xs text-foreground/80 italic pt-0.5">
                        &quot;{req.requestMessage}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => setActiveFulfillRequest(req)}
                  className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Write Recommendation
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Revisions Requested on recommendations I wrote */}
      {revisionsRequested.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Edit3 className="h-3.5 w-3.5 text-amber-600" />
              Revisions Requested from You ({revisionsRequested.length})
            </h4>
            <Badge
              variant="outline"
              className="text-[10px] text-amber-600 border-amber-500/30"
            >
              Revision Needed
            </Badge>
          </div>

          <div className="space-y-2">
            {revisionsRequested.map((rev) => (
              <div
                key={rev.id}
                className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src={rev.recipient?.profile?.profilePictureUrl} />
                      <AvatarFallback className="text-xs font-semibold text-primary">
                        {rev.recipient?.firstName?.[0]}
                        {rev.recipient?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {rev.recipient?.firstName} {rev.recipient?.lastName} requested changes
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Role: {rev.positionTitle}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setActiveFulfillRequest(rev)}
                    className="h-7 text-xs gap-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Revise Recommendation
                  </Button>
                </div>

                {rev.revisionNote && (
                  <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-xs text-foreground/90">
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      Feedback Note:{' '}
                    </span>
                    &quot;{rev.revisionNote}&quot;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Sent Requests waiting for connection */}
      {sentRequests.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-semibold text-muted-foreground">
            Sent Requests Awaiting Response ({sentRequests.length})
          </h4>
          <div className="divide-y divide-border/30 rounded-xl border border-border/40 bg-secondary/10">
            {sentRequests.map((s) => (
              <div
                key={s.id}
                className="p-3 flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7 border">
                    <AvatarImage src={s.sender?.profile?.profilePictureUrl} />
                    <AvatarFallback className="text-[10px] text-primary">
                      {s.sender?.firstName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground">
                    Requested from{' '}
                    <span className="font-semibold">
                      {s.sender?.firstName} {s.sender?.lastName}
                    </span>{' '}
                    for {s.positionTitle}
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  Pending Response
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write/Revise Modal */}
      {activeFulfillRequest && (
        <WriteRecommendationModal
          isOpen={!!activeFulfillRequest}
          onClose={() => setActiveFulfillRequest(null)}
          recipient={
            activeFulfillRequest.requester || activeFulfillRequest.recipient || ({} as any)
          }
          recommendation={activeFulfillRequest}
          mode={
            activeFulfillRequest.status === 'REVISION_REQUESTED' ? 'revise' : 'respond'
          }
          onSuccess={() => {
            fetchInbox();
            onRefreshParent?.();
          }}
        />
      )}

      {/* Request Revision Modal */}
      {activeRevisionRequest && (
        <RequestRevisionModal
          isOpen={!!activeRevisionRequest}
          onClose={() => setActiveRevisionRequest(null)}
          recommendation={activeRevisionRequest}
          onSuccess={() => {
            fetchInbox();
            onRefreshParent?.();
          }}
        />
      )}
    </div>
  );
}
