'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { recommendationsService } from '@/services/recommendations.service';
import { RecommendationCard } from './recommendation-card';
import { RequestRecommendationModal } from './request-recommendation-modal';
import { WriteRecommendationModal } from './write-recommendation-modal';
import {
  Award,
  Clock,
  Edit,
  Eye,
  Inbox,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import type { Recommendation, UserRecommendationsResponse } from '@/types';

interface RecommendationsSectionProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    profile?: {
      headline?: string;
      profilePictureUrl?: string;
    };
  };
  currentUser?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    profile?: {
      headline?: string;
      profilePictureUrl?: string;
    };
  } | null;
}

export function RecommendationsSection({
  user,
  currentUser,
}: RecommendationsSectionProps) {
  const [data, setData] = useState<UserRecommendationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'given' | 'pending'>('received');

  // Modal states
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [activeFulfillRequest, setActiveFulfillRequest] = useState<Recommendation | null>(null);

  const isOwner = currentUser?.id === user.id;

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const res = await recommendationsService.getUserRecommendations(user.id);
      setData(res);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchRecommendations();
    }
  }, [user?.id, currentUser?.id]);

  if (isLoading) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-44" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const receivedList = data?.received || [];
  const givenList = data?.given || [];
  const pendingApprovals = data?.pendingApprovals || [];
  const pendingRequests = data?.pendingRequests || [];
  const isConnected = data?.isConnected || false;

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden bg-card">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Award className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-bold">Recommendations</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Endorsements and testimonials from colleagues, managers, and partners.
            </CardDescription>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 1st-Degree Connection Action Buttons */}
            {!isOwner && isConnected && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsRequestModalOpen(true)}
                  className="text-xs gap-1.5 h-8 font-medium text-foreground hover:bg-secondary/60"
                >
                  <Send className="h-3.5 w-3.5 text-primary" />
                  Request a recommendation
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setActiveFulfillRequest(null);
                    setIsWriteModalOpen(true);
                  }}
                  className="text-xs gap-1.5 h-8 font-semibold bg-primary text-primary-foreground shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Recommend {user.firstName}
                </Button>
              </>
            )}

            {/* Profile Owner Action Button */}
            {isOwner && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsRequestModalOpen(true)}
                className="text-xs gap-1.5 h-8 font-medium border-border/60 hover:border-primary/40 text-foreground"
              >
                <Plus className="h-3.5 w-3.5 text-primary" />
                Ask for a recommendation
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Pending Approvals Notice Banner for Profile Owner */}
        {isOwner && pendingApprovals.length > 0 && (
          <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-xs text-foreground font-medium">
                You have{' '}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {pendingApprovals.length} pending{' '}
                  {pendingApprovals.length === 1 ? 'recommendation' : 'recommendations'}
                </span>{' '}
                waiting for your approval!
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab('pending')}
              className="text-xs h-7 gap-1 border-blue-500/40 text-blue-600 hover:bg-blue-500/20"
            >
              Review Now
            </Button>
          </div>
        )}

        {/* Recommendations Tabs Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-flex h-9 p-0.5 bg-secondary/50 border border-border/50">
            <TabsTrigger value="received" className="text-xs font-medium gap-1.5">
              Received
              <Badge
                variant="secondary"
                className="text-[10px] h-4 min-w-4 px-1 rounded-full bg-background/80"
              >
                {receivedList.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="given" className="text-xs font-medium gap-1.5">
              Given
              <Badge
                variant="secondary"
                className="text-[10px] h-4 min-w-4 px-1 rounded-full bg-background/80"
              >
                {givenList.length}
              </Badge>
            </TabsTrigger>
            {isOwner && pendingApprovals.length > 0 && (
              <TabsTrigger
                value="pending"
                className="text-xs font-medium gap-1.5 text-blue-600 dark:text-blue-400"
              >
                Pending Review
                <Badge
                  variant="outline"
                  className="text-[10px] h-4 min-w-4 px-1 rounded-full border-blue-500 text-blue-600 bg-blue-500/10"
                >
                  {pendingApprovals.length}
                </Badge>
              </TabsTrigger>
            )}
          </TabsList>

          {/* TAB 1: Received Recommendations */}
          <TabsContent value="received" className="space-y-4 pt-1">
            {receivedList.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border/70 bg-secondary/10">
                <Award className="h-9 w-9 text-muted-foreground mx-auto mb-2 opacity-40" />
                <h4 className="text-sm font-semibold text-foreground">
                  No recommendations received yet
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                  {isOwner
                    ? 'Recommendations from coworkers and leaders strengthen your credibility and unlock career opportunities.'
                    : `${user.firstName} has not received recommendations yet.`}
                </p>
                {isOwner && (
                  <Button
                    size="sm"
                    onClick={() => setIsRequestModalOpen(true)}
                    className="text-xs gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Ask for a recommendation
                  </Button>
                )}
                {!isOwner && isConnected && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setActiveFulfillRequest(null);
                      setIsWriteModalOpen(true);
                    }}
                    className="text-xs gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Be the first to recommend {user.firstName}
                  </Button>
                )}
              </div>
            ) : (
              receivedList.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  type="received"
                  currentUserId={currentUser?.id}
                  isProfileOwner={isOwner}
                  onRefresh={fetchRecommendations}
                />
              ))
            )}
          </TabsContent>

          {/* TAB 2: Given Recommendations */}
          <TabsContent value="given" className="space-y-4 pt-1">
            {/* If profile owner, show requests from connections asking me to write for them */}
            {isOwner && pendingRequests.length > 0 && (
              <div className="space-y-3 mb-6">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Inbox className="h-3.5 w-3.5 text-primary" />
                  Requests from Connections ({pendingRequests.length})
                </h4>
                <div className="space-y-2.5">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-3 flex-wrap"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">
                          {req.requester?.firstName} {req.requester?.lastName} requested a
                          recommendation
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Role: <span className="font-medium">{req.positionTitle}</span> •{' '}
                          {req.relationship}
                        </p>
                        {req.requestMessage && (
                          <p className="text-xs text-foreground/80 italic pt-1">
                            &quot;{req.requestMessage}&quot;
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setActiveFulfillRequest(req);
                          setIsWriteModalOpen(true);
                        }}
                        className="text-xs h-8 gap-1.5 bg-primary text-primary-foreground font-semibold"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Write Recommendation
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {givenList.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border/70 bg-secondary/10">
                <Award className="h-9 w-9 text-muted-foreground mx-auto mb-2 opacity-40" />
                <h4 className="text-sm font-semibold text-foreground">
                  No recommendations given yet
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                  {isOwner
                    ? 'Support your colleagues and team members by endorsing their contributions.'
                    : `${user.firstName} has not given recommendations to others yet.`}
                </p>
              </div>
            ) : (
              givenList.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  type="given"
                  currentUserId={currentUser?.id}
                  isProfileOwner={isOwner}
                  onRefresh={fetchRecommendations}
                />
              ))
            )}
          </TabsContent>

          {/* TAB 3: Pending Review (Owner Only) */}
          {isOwner && (
            <TabsContent value="pending" className="space-y-4 pt-1">
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  These recommendations have been submitted for you. Accept them to display
                  on your public profile, or request revisions.
                </p>
                {pendingApprovals.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    type="pending"
                    currentUserId={currentUser?.id}
                    isProfileOwner={true}
                    onRefresh={fetchRecommendations}
                  />
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>

      {/* Modal 1: Request Recommendation Modal */}
      {isRequestModalOpen && (
        <RequestRecommendationModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          targetUser={!isOwner ? user : undefined}
          userPositions={data?.viewerPositions || []}
          onSuccess={fetchRecommendations}
        />
      )}

      {/* Modal 2: Write / Fulfill Recommendation Modal */}
      {isWriteModalOpen && (
        <WriteRecommendationModal
          isOpen={isWriteModalOpen}
          onClose={() => {
            setIsWriteModalOpen(false);
            setActiveFulfillRequest(null);
          }}
          recipient={activeFulfillRequest?.requester || user}
          recommendation={activeFulfillRequest}
          recipientPositions={data?.targetPositions || []}
          mode={activeFulfillRequest ? 'respond' : 'give'}
          onSuccess={fetchRecommendations}
        />
      )}
    </Card>
  );
}
