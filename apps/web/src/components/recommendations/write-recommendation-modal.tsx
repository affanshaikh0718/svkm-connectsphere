'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { recommendationsService } from '@/services/recommendations.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, CheckCircle2, Edit3, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Recommendation, RecommendationUserSummary } from '@/types';

interface WriteRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: RecommendationUserSummary;
  recommendation?: Recommendation | null;
  recipientPositions?: Array<{
    id: string;
    position: string;
    companyName: string;
  }>;
  mode?: 'give' | 'respond' | 'revise';
  onSuccess?: () => void;
}

const RELATIONSHIP_OPTIONS = [
  'Managed them directly',
  'Reported directly to them',
  'Worked with them in the same team / group',
  'Worked with them in different groups',
  'Mentored them',
  'They mentored me',
  'Studied together / Academic peer',
  'Collaborated on a project together',
  'Client or service provider relationship',
];

export function WriteRecommendationModal({
  isOpen,
  onClose,
  recipient,
  recommendation,
  recipientPositions = [],
  mode = 'give',
  onSuccess,
}: WriteRecommendationModalProps) {
  const [selectedPosition, setSelectedPosition] = useState('');
  const [customPosition, setCustomPosition] = useState('');
  const [relationship, setRelationship] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (recommendation) {
      setSelectedPosition(recommendation.positionTitle || '');
      setRelationship(recommendation.relationship || '');
      setContent(recommendation.content || '');
    } else if (recipientPositions.length > 0) {
      setSelectedPosition(
        `${recipientPositions[0].position} at ${recipientPositions[0].companyName}`
      );
    }
  }, [recommendation, recipientPositions, isOpen]);

  const isRevising = mode === 'revise' || recommendation?.status === 'REVISION_REQUESTED';
  const isResponding = mode === 'respond' || recommendation?.status === 'REQUESTED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalPosition =
      selectedPosition === '__custom__'
        ? customPosition.trim()
        : selectedPosition.trim();

    if (!finalPosition && !recommendation) {
      toast.error('Please specify a position title.');
      return;
    }
    if (!relationship && !recommendation) {
      toast.error('Please choose your professional relationship.');
      return;
    }
    if (!content.trim() || content.trim().length < 10) {
      toast.error('Recommendation must be at least 10 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (isResponding && recommendation?.id) {
        await recommendationsService.respondToRequest(recommendation.id, {
          content: content.trim(),
          relationship: relationship || undefined,
        });
        toast.success(`Recommendation submitted for ${recipient.firstName}!`);
      } else if (isRevising && recommendation?.id) {
        await recommendationsService.reviseRecommendation(recommendation.id, {
          content: content.trim(),
        });
        toast.success(`Updated recommendation submitted for ${recipient.firstName}!`);
      } else {
        await recommendationsService.giveRecommendation({
          recipientId: recipient.id,
          positionTitle: finalPosition,
          relationship,
          content: content.trim(),
        });
        toast.success(`Recommendation sent to ${recipient.firstName} for review!`);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to submit recommendation';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              {isRevising ? (
                <Edit3 className="h-5 w-5" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {isRevising
                  ? `Revise Recommendation for ${recipient.firstName}`
                  : isResponding
                  ? `Fulfill Request from ${recipient.firstName}`
                  : `Recommend ${recipient.firstName} ${recipient.lastName}`}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Highlight their skills, character, and key contributions.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Recipient Identity Header */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-secondary/30">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={recipient.profile?.profilePictureUrl} />
            <AvatarFallback className="font-semibold text-xs text-primary">
              {recipient.firstName?.[0]}
              {recipient.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {recipient.firstName} {recipient.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {recipient.profile?.headline || '1st-degree connection'}
            </p>
          </div>
        </div>

        {/* If recipient requested a revision, show their feedback note! */}
        {recommendation?.revisionNote && (
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              <span>Requested Revision Note from {recipient.firstName}:</span>
            </div>
            <p className="text-xs text-foreground/90 pl-5 italic">
              &quot;{recommendation.revisionNote}&quot;
            </p>
          </div>
        )}

        {/* If this fulfills an incoming request with an introductory note */}
        {isResponding && recommendation?.requestMessage && (
          <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-1">
            <p className="text-[11px] font-semibold text-primary">
              Message from {recipient.firstName}:
            </p>
            <p className="text-xs text-foreground/90 italic">
              &quot;{recommendation.requestMessage}&quot;
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* Position Selector */}
          {!recommendation ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Which position are you recommending them for?
              </Label>
              {recipientPositions.length > 0 ? (
                <div className="space-y-2">
                  <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                    <SelectTrigger className="w-full h-10 text-xs">
                      <SelectValue placeholder="Select their position..." />
                    </SelectTrigger>
                    <SelectContent>
                      {recipientPositions.map((pos) => {
                        const title = `${pos.position} at ${pos.companyName}`;
                        return (
                          <SelectItem key={pos.id} value={title} className="text-xs">
                            {title}
                          </SelectItem>
                        );
                      })}
                      <SelectItem
                        value="__custom__"
                        className="text-xs text-primary font-medium"
                      >
                        + Enter custom position
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {selectedPosition === '__custom__' && (
                    <Input
                      placeholder="e.g., Lead Product Designer"
                      value={customPosition}
                      onChange={(e) => setCustomPosition(e.target.value)}
                      className="h-10 text-xs"
                      autoFocus
                    />
                  )}
                </div>
              ) : (
                <Input
                  placeholder="e.g., Senior Software Engineer"
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="h-10 text-xs"
                  required
                />
              )}
            </div>
          ) : (
            <div className="text-xs p-2.5 rounded-lg border bg-secondary/20 flex items-center justify-between">
              <span className="text-muted-foreground">Position:</span>
              <span className="font-semibold text-foreground">
                {recommendation.positionTitle}
              </span>
            </div>
          )}

          {/* Relationship Selector */}
          {!recommendation ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Relationship</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger className="w-full h-10 text-xs">
                  <SelectValue placeholder="Select your relationship..." />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_OPTIONS.map((rel) => (
                    <SelectItem key={rel} value={rel} className="text-xs">
                      {rel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="text-xs p-2.5 rounded-lg border bg-secondary/20 flex items-center justify-between">
              <span className="text-muted-foreground">Relationship:</span>
              <span className="font-semibold text-foreground">
                {recommendation.relationship}
              </span>
            </div>
          )}

          {/* Content Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Recommendation</Label>
              <span className="text-[10px] text-muted-foreground">
                {content.length} characters (min 10)
              </span>
            </div>
            <Textarea
              placeholder={`Write what makes ${recipient.firstName} great to work with, specific accomplishments, and key strengths...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[140px] text-xs resize-none leading-relaxed"
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
              disabled={isSubmitting || content.trim().length < 10}
              className="text-xs gap-1.5 font-semibold"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              {isRevising ? 'Submit Revisions' : 'Submit Recommendation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
