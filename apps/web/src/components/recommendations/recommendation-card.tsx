'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo } from '@/lib/utils';
import { recommendationsService } from '@/services/recommendations.service';
import {
  Check,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  MoreHorizontal,
  Quote,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Recommendation } from '@/types';
import { RequestRevisionModal } from './request-revision-modal';
import { WriteRecommendationModal } from './write-recommendation-modal';

interface RecommendationCardProps {
  recommendation: Recommendation;
  type: 'received' | 'given' | 'pending';
  currentUserId?: string;
  isProfileOwner?: boolean;
  onRefresh?: () => void;
}

export function RecommendationCard({
  recommendation,
  type,
  currentUserId,
  isProfileOwner,
  onRefresh,
}: RecommendationCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);

  // Counterparty user to display
  const counterparty =
    type === 'given' ? recommendation.recipient : recommendation.sender;
  const isSender = currentUserId === recommendation.senderId;
  const isRecipient = currentUserId === recommendation.recipientId;

  // Accept Action (Recipient)
  const handleAccept = async () => {
    try {
      setIsUpdating(true);
      await recommendationsService.acceptRecommendation(recommendation.id);
      toast.success('Recommendation accepted and added to your profile!');
      onRefresh?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to accept recommendation');
    } finally {
      setIsUpdating(false);
    }
  };

  // Dismiss / Decline Action (Recipient)
  const handleDismiss = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to decline this recommendation?'
    );
    if (!confirmed) return;

    try {
      setIsUpdating(true);
      await recommendationsService.dismissRecommendation(recommendation.id);
      toast.success('Recommendation dismissed');
      onRefresh?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to dismiss recommendation');
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle Hide / Unhide (Recipient)
  const handleToggleHide = async () => {
    try {
      setIsUpdating(true);
      const res = await recommendationsService.toggleHideRecommendation(
        recommendation.id
      );
      toast.success(
        res.isHidden
          ? 'Recommendation hidden from your public profile'
          : 'Recommendation is now visible on your profile'
      );
      onRefresh?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update visibility');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Action (Author / Recipient)
  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this recommendation? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      setIsUpdating(true);
      await recommendationsService.deleteRecommendation(recommendation.id);
      toast.success('Recommendation deleted');
      onRefresh?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete recommendation');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div
        className={`p-4 sm:p-5 rounded-xl border transition-all ${
          recommendation.status === 'PENDING_APPROVAL'
            ? 'border-blue-500/30 bg-blue-500/5'
            : recommendation.status === 'REVISION_REQUESTED'
            ? 'border-amber-500/30 bg-amber-500/5'
            : recommendation.isHidden
            ? 'border-dashed border-border/80 bg-muted/20 opacity-80'
            : 'border-border/60 bg-card hover:border-border'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Link
              href={counterparty?.username ? `/in/${counterparty.username}` : '#'}
              className="shrink-0 hover:opacity-90 transition-opacity"
            >
              <Avatar className="h-11 w-11 border shadow-xs">
                <AvatarImage src={counterparty?.profile?.profilePictureUrl} />
                <AvatarFallback className="font-semibold text-xs text-primary">
                  {counterparty?.firstName?.[0]}
                  {counterparty?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={counterparty?.username ? `/in/${counterparty.username}` : '#'}
                  className="font-bold text-sm text-foreground hover:underline hover:text-primary transition-colors"
                >
                  {counterparty?.firstName} {counterparty?.lastName}
                </Link>

                {/* Status Badges */}
                {recommendation.isHidden && isProfileOwner && (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-amber-600 border-amber-500/30 bg-amber-500/10 gap-1 py-0"
                  >
                    <EyeOff className="h-3 w-3" /> Hidden from profile
                  </Badge>
                )}

                {recommendation.status === 'PENDING_APPROVAL' && (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-blue-600 border-blue-500/30 bg-blue-500/10 gap-1 py-0 font-medium"
                  >
                    <Clock className="h-3 w-3" /> Pending your approval
                  </Badge>
                )}

                {recommendation.status === 'REVISION_REQUESTED' && (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-amber-600 border-amber-500/30 bg-amber-500/10 gap-1 py-0 font-medium"
                  >
                    <Edit3 className="h-3 w-3" /> Revision Requested
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground line-clamp-1">
                {counterparty?.profile?.headline || 'Professional on ConnectSphere'}
              </p>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-0.5 flex-wrap">
                <span className="font-medium text-foreground/80">
                  {recommendation.positionTitle}
                </span>
                <span>•</span>
                <span>{recommendation.relationship}</span>
                <span>•</span>
                <span>{formatTimeAgo(recommendation.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Revise/Delete for Author, Hide for Recipient) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isSender && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsReviseModalOpen(true)}
                  title="Revise Recommendation"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  title="Delete Recommendation"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}

            {isRecipient && recommendation.status === 'ACCEPTED' && isProfileOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleHide}
                disabled={isUpdating}
                className="text-xs h-7 gap-1 font-medium text-muted-foreground hover:text-foreground"
              >
                {recommendation.isHidden ? (
                  <>
                    <Eye className="h-3 w-3 text-primary" /> Show on profile
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3" /> Hide
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Revision Note Banner if applicable */}
        {recommendation.revisionNote && (
          <div className="mt-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/10 space-y-0.5">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Edit3 className="h-3 w-3" /> Revision Note from{' '}
              {recommendation.recipient?.firstName || 'recipient'}:
            </span>
            <p className="text-xs text-foreground/90 italic pl-4">
              &quot;{recommendation.revisionNote}&quot;
            </p>
          </div>
        )}

        {/* Recommendation Content */}
        {recommendation.content && (
          <div className="mt-3.5 relative pl-4 border-l-2 border-primary/40 text-xs text-foreground/90 leading-relaxed font-normal">
            <p className="whitespace-pre-wrap">{recommendation.content}</p>
          </div>
        )}

        {/* Recipient Actions for PENDING_APPROVAL */}
        {isRecipient && recommendation.status === 'PENDING_APPROVAL' && (
          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground">
              Review recommendation before displaying on your profile:
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                disabled={isUpdating}
                className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1"
              >
                <X className="h-3.5 w-3.5" /> Decline
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsRevisionModalOpen(true)}
                disabled={isUpdating}
                className="h-8 text-xs gap-1 border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
              >
                <Edit3 className="h-3.5 w-3.5" /> Request Revision
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                disabled={isUpdating}
                className="h-8 text-xs gap-1 bg-primary text-primary-foreground font-semibold"
              >
                <Check className="h-3.5 w-3.5" /> Accept & Display
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Revision Request Modal */}
      {isRevisionModalOpen && (
        <RequestRevisionModal
          isOpen={isRevisionModalOpen}
          onClose={() => setIsRevisionModalOpen(false)}
          recommendation={recommendation}
          onSuccess={onRefresh}
        />
      )}

      {/* Revise Modal (Sender) */}
      {isReviseModalOpen && counterparty && (
        <WriteRecommendationModal
          isOpen={isReviseModalOpen}
          onClose={() => setIsReviseModalOpen(false)}
          recipient={counterparty}
          recommendation={recommendation}
          mode="revise"
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}
