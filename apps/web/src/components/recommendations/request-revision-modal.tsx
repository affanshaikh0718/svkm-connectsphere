'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { recommendationsService } from '@/services/recommendations.service';
import { Edit3, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Recommendation } from '@/types';

interface RequestRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: Recommendation;
  onSuccess?: () => void;
}

export function RequestRevisionModal({
  isOpen,
  onClose,
  recommendation,
  onSuccess,
}: RequestRevisionModalProps) {
  const [revisionNote, setRevisionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const senderName = recommendation.sender
    ? `${recommendation.sender.firstName} ${recommendation.sender.lastName}`
    : 'the author';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNote.trim() || revisionNote.trim().length < 5) {
      toast.error('Please provide specific feedback for the revision.');
      return;
    }

    try {
      setIsSubmitting(true);
      await recommendationsService.requestRevision(recommendation.id, {
        revisionNote: revisionNote.trim(),
      });
      toast.success(`Revision request sent to ${senderName}!`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to request revision';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Request a Revision
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Ask {senderName} to make adjustments before adding to your profile.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Existing Content Snippet */}
        <div className="p-3 rounded-xl border border-border/60 bg-secondary/30 space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground">
            Current recommendation for {recommendation.positionTitle}:
          </p>
          <p className="text-xs text-foreground/80 line-clamp-3 italic">
            &quot;{recommendation.content}&quot;
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Your Feedback Note</Label>
              <span className="text-[10px] text-muted-foreground">
                {revisionNote.length}/1000
              </span>
            </div>
            <Textarea
              placeholder="e.g., Thank you so much! Could you please also mention our work leading the system redesign project?"
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              className="min-h-[110px] text-xs resize-none leading-relaxed"
              required
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || revisionNote.trim().length < 5}
              className="text-xs gap-1.5 font-semibold bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Send Revision Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
