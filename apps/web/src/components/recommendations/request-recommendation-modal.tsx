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
import { connectionsService } from '@/services/connections.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface RequestRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    profile?: {
      headline?: string;
      profilePictureUrl?: string;
    };
  };
  userPositions?: Array<{
    id: string;
    position: string;
    companyName: string;
  }>;
  onSuccess?: () => void;
}

const RELATIONSHIP_OPTIONS = [
  'Managed me directly',
  'Reported directly to me',
  'Worked with me in the same team / group',
  'Worked with me in different groups',
  'Mentored me',
  'I mentored them',
  'Studied together / Academic peer',
  'Collaborated on a project together',
  'Client or service provider relationship',
];

export function RequestRecommendationModal({
  isOpen,
  onClose,
  targetUser: initialTargetUser,
  userPositions = [],
  onSuccess,
}: RequestRecommendationModalProps) {
  const [connections, setConnections] = useState<any[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    initialTargetUser?.id || ''
  );
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [customPosition, setCustomPosition] = useState<string>('');
  const [relationship, setRelationship] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set initial selected target or load connections list if none provided
  useEffect(() => {
    if (initialTargetUser?.id) {
      setSelectedTargetId(initialTargetUser.id);
    } else if (isOpen) {
      const loadConnections = async () => {
        try {
          setIsLoadingConnections(true);
          const res = await connectionsService.getMyConnections(1, 50);
          const list = Array.isArray(res) ? res : res?.data || [];
          setConnections(list);
          if (list.length > 0 && !selectedTargetId) {
            setSelectedTargetId(list[0]?.id || list[0]?.user?.id || '');
          }
        } catch {
          // fallback
        } finally {
          setIsLoadingConnections(false);
        }
      };
      loadConnections();
    }
  }, [isOpen, initialTargetUser]);

  // Set default position if userPositions available
  useEffect(() => {
    if (userPositions.length > 0 && !selectedPosition) {
      setSelectedPosition(`${userPositions[0].position} at ${userPositions[0].companyName}`);
    }
  }, [userPositions]);

  // Target user details resolution
  const activeTarget = initialTargetUser
    ? initialTargetUser
    : connections.find(
        (c) => c.id === selectedTargetId || c.user?.id === selectedTargetId
      )?.user ||
      connections.find(
        (c) => c.id === selectedTargetId || c.user?.id === selectedTargetId
      );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPosition =
      selectedPosition === '__custom__'
        ? customPosition.trim()
        : selectedPosition.trim();

    if (!selectedTargetId) {
      toast.error('Please choose a 1st-degree connection.');
      return;
    }
    if (!finalPosition) {
      toast.error('Please select or specify a position title.');
      return;
    }
    if (!relationship) {
      toast.error('Please choose your professional relationship.');
      return;
    }

    try {
      setIsSubmitting(true);
      await recommendationsService.requestRecommendation({
        targetUserId: selectedTargetId,
        positionTitle: finalPosition,
        relationship,
        requestMessage: message.trim() || undefined,
      });

      toast.success(
        `Recommendation request sent to ${
          activeTarget?.firstName || 'your connection'
        }!`
      );
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send recommendation request';
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
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Request a Recommendation
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Ask a 1st-degree connection who knows your work to endorse your skills.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Connection Target Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Who do you want to ask?</Label>
            {initialTargetUser ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-secondary/30">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={initialTargetUser.profile?.profilePictureUrl} />
                  <AvatarFallback className="font-semibold text-xs text-primary">
                    {initialTargetUser.firstName?.[0]}
                    {initialTargetUser.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {initialTargetUser.firstName} {initialTargetUser.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {initialTargetUser.profile?.headline || '1st-degree connection'}
                  </p>
                </div>
              </div>
            ) : isLoadingConnections ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground p-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Loading your 1st-degree connections...
              </div>
            ) : connections.length === 0 ? (
              <div className="text-xs text-amber-600 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                You need 1st-degree connections before you can request recommendations.
              </div>
            ) : (
              <Select value={selectedTargetId} onValueChange={setSelectedTargetId}>
                <SelectTrigger className="w-full h-11 text-xs">
                  <SelectValue placeholder="Select a connection..." />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {connections.map((c) => {
                    const connUser = c.user || c;
                    return (
                      <SelectItem key={connUser.id} value={connUser.id} className="text-xs">
                        {connUser.firstName} {connUser.lastName}
                        {connUser.profile?.headline ? ` - ${connUser.profile.headline}` : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Position Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              What position do you want to be recommended for?
            </Label>
            {userPositions.length > 0 ? (
              <div className="space-y-2">
                <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                  <SelectTrigger className="w-full h-10 text-xs">
                    <SelectValue placeholder="Select your position..." />
                  </SelectTrigger>
                  <SelectContent>
                    {userPositions.map((pos) => {
                      const title = `${pos.position} at ${pos.companyName}`;
                      return (
                        <SelectItem key={pos.id} value={title} className="text-xs">
                          {title}
                        </SelectItem>
                      );
                    })}
                    <SelectItem value="__custom__" className="text-xs text-primary font-medium">
                      + Enter a custom position title
                    </SelectItem>
                  </SelectContent>
                </Select>

                {selectedPosition === '__custom__' && (
                  <Input
                    placeholder="e.g., Lead Full Stack Engineer"
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

          {/* Relationship Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">What is your relationship?</Label>
            <Select value={relationship} onValueChange={setRelationship}>
              <SelectTrigger className="w-full h-10 text-xs">
                <SelectValue placeholder="Select relationship..." />
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

          {/* Personalized Request Message */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Personalized Note</Label>
              <span className="text-[10px] text-muted-foreground">Optional</span>
            </div>
            <Textarea
              placeholder={`Hi ${
                activeTarget?.firstName || 'there'
              }, could you please write me a recommendation for our work together? It would mean a lot!`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[85px] text-xs resize-none"
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
              disabled={isSubmitting || !selectedTargetId}
              className="text-xs gap-1.5 font-semibold"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
