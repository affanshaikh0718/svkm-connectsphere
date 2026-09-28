'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { connectionsService } from '@/services/connections.service';
import { usersService } from '@/services/users.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  Check,
  Edit3,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Sparkles,
  UserCheck,
  UserPlus,
  UserX,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ContactInfoModal } from './contact-info-modal';
import { EditProfileModal } from './edit-profile-modal';
import { ChatModal } from './chat-modal';
import { messagingService } from '@/services/messaging.service';

interface ProfileHeaderProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email?: string;
    connectionStatus?: string;
    isFollowing?: boolean;
    isBlocked?: boolean;
    isBlockedByMe?: boolean;
    profile?: {
      headline?: string;
      bio?: string;
      location?: string;
      website?: string;
      phoneNumber?: string;
      githubUrl?: string;
      linkedinUrl?: string;
      twitterUrl?: string;
      profilePictureUrl?: string;
      coverImageUrl?: string;
      isOpenToWork?: boolean;
      skills?: any[];
    };
  };
  onProfileUpdated?: (updated: any) => void;
}

export function ProfileHeader({ user, onProfileUpdated }: ProfileHeaderProps) {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const isMe = currentUser?.id === user.id;

  const [connectionStatus, setConnectionStatus] = useState(user.connectionStatus || 'NONE');
  const [isFollowing, setIsFollowing] = useState(!!user.isFollowing);
  const [isBlocked, setIsBlocked] = useState(!!user.isBlocked || !!user.isBlockedByMe);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.profile?.profilePictureUrl);
  const [coverUrl, setCoverUrl] = useState(user.profile?.coverImageUrl);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatConversationId, setChatConversationId] = useState<string | null>(null);
  const [isStartingChat, setIsStartingChat] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const res = await usersService.uploadProfilePicture(file);
      if (res?.profilePictureUrl) {
        setAvatarUrl(res.profilePictureUrl);
        if (currentUser?.profile) {
          updateUser({
            profile: {
              ...currentUser.profile,
              profilePictureUrl: res.profilePictureUrl,
            },
          });
        }
        toast.success('Profile photo updated successfully!');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      await connectionsService.sendConnectionRequest(user.id);
      setConnectionStatus('PENDING');
      toast.success('Connection request sent!');
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        '';

      // Gracefully handle already connected or pending without error alert popup
      if (
        errorMsg.toLowerCase().includes('already connected') ||
        err?.response?.status === 409
      ) {
        if (errorMsg.toLowerCase().includes('pending')) {
          setConnectionStatus('PENDING');
          toast('A connection request is already pending with this user.', {
            icon: 'ℹ️',
          });
        } else {
          setConnectionStatus('ACCEPTED');
          toast('You are already connected with this user.', { icon: '🤝' });
        }
      } else {
        toast.error(errorMsg || 'Failed to send connection request');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await connectionsService.unfollowUser(user.id);
        setIsFollowing(false);
        toast.success(`Unfollowed @${user.username}`);
      } else {
        await connectionsService.followUser(user.id);
        setIsFollowing(true);
        toast.success(`Following @${user.username}`);
      }
    } catch {
      toast.error('Action failed');
    }
  };

  const handleMessageUser = async () => {
    const isFirstDegree = connectionStatus === 'ACCEPTED' || user.connectionStatus === 'ACCEPTED';
    if (!isFirstDegree) {
      toast('Direct messaging is available for 1st-degree connections. Send a connection request first!', {
        icon: '🔒',
      });
      return;
    }

    try {
      setIsStartingChat(true);
      const conv = await messagingService.getOrCreateDirectConversation(user.id);
      if (conv?.id) {
        setChatConversationId(conv.id);
        setIsChatModalOpen(true);
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to start messaging thread';
      toast.error(errorMsg);
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleBlockToggle = async () => {
    if (!isBlocked) {
      const confirmed = window.confirm(
        `Are you sure you want to block @${user.username}? They will no longer be able to message or view your activity.`
      );
      if (!confirmed) return;
    }

    try {
      setIsBlocking(true);
      if (isBlocked) {
        await connectionsService.unblockUser(user.id);
        setIsBlocked(false);
        setConnectionStatus('NONE');
        toast.success(`Unblocked @${user.username}`);
      } else {
        await connectionsService.blockUser(user.id);
        setIsBlocked(true);
        setConnectionStatus('BLOCKED');
        setIsFollowing(false);
        toast.success(`Blocked @${user.username}`);
      }
    } catch {
      toast.error('Failed to update block state');
    } finally {
      setIsBlocking(false);
    }
  };

  const isCoverGradient = coverUrl?.startsWith('linear-gradient');

  return (
    <>
      <Card className="mb-6 overflow-hidden border-border/50 shadow-sm">
        {/* Cover Banner Component */}
        <div
          className="h-36 sm:h-48 w-full relative transition-all"
          style={{
            background: isCoverGradient
              ? coverUrl
              : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #93c5fd 100%)',
          }}
        >
          {coverUrl && !isCoverGradient && (
            <img
              src={coverUrl}
              alt="Cover Banner"
              className="w-full h-full object-cover"
            />
          )}

          {isMe && (
            <div className="absolute top-3 right-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="h-8 text-xs bg-background/80 backdrop-blur-md hover:bg-background shadow border border-border/40 gap-1.5 font-medium"
              >
                <Camera className="h-3.5 w-3.5" />
                Customize Banner
              </Button>
            </div>
          )}
        </div>

        <CardContent className="pt-0 relative px-6 pb-6">
          {/* Avatar and Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 sm:-mt-20 mb-4 gap-4">
            <div className="relative group">
              <Avatar className="h-28 w-28 sm:h-36 sm:w-36 border-4 border-background shadow-md">
                <AvatarImage src={avatarUrl || user.profile?.profilePictureUrl} />
                <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-primary/10 text-primary">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              {isMe && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="absolute bottom-1 right-1 p-2 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all border-2 border-background"
                    title="Upload profile photo"
                  >
                    {isUploadingPhoto ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Profile Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {isMe ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs gap-1.5 font-medium border-border/80"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              ) : (
                <>
                  {/* Follow Button */}
                  {!isBlocked && (
                    <Button
                      variant={isFollowing ? 'outline' : 'secondary'}
                      size="sm"
                      onClick={handleFollowToggle}
                      className="text-xs font-medium"
                    >
                      {isFollowing ? 'Following' : '+ Follow'}
                    </Button>
                  )}

                  {/* Direct Messaging CTA */}
                  {!isBlocked && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isStartingChat}
                      onClick={handleMessageUser}
                      className={`text-xs gap-1.5 font-medium hover:bg-secondary/50 ${
                        connectionStatus === 'ACCEPTED'
                          ? 'text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 font-semibold'
                          : 'text-foreground'
                      }`}
                    >
                      {isStartingChat ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      ) : (
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                      )}
                      Message
                    </Button>
                  )}

                  {/* Dynamic Connection States */}
                  {isBlocked ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="text-xs gap-1.5 text-destructive border-destructive/30"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" /> Blocked
                    </Button>
                  ) : connectionStatus === 'ACCEPTED' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="text-xs gap-1.5 text-emerald-600 border-emerald-500/30 bg-emerald-500/5 cursor-default font-semibold"
                    >
                      <UserCheck className="h-4 w-4" /> Connected
                    </Button>
                  ) : connectionStatus === 'PENDING' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled
                      className="text-xs gap-1.5 bg-secondary/80 font-medium cursor-default"
                    >
                      <Check className="h-3.5 w-3.5 text-primary" /> Pending Request Sent
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleConnect}
                      disabled={isLoading}
                      className="text-xs gap-1.5 font-semibold"
                    >
                      {isLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserPlus className="h-3.5 w-3.5" />
                      )}
                      Connect
                    </Button>
                  )}

                  {/* Block / Unblock User Moderation Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBlockToggle}
                    disabled={isBlocking}
                    className="text-xs text-muted-foreground hover:text-destructive gap-1 px-2.5"
                    title={isBlocked ? 'Unblock user' : 'Block user'}
                  >
                    <UserX className="h-3.5 w-3.5" />
                    {isBlocked ? 'Unblock' : 'Block'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {user.firstName} {user.lastName}
              </h1>
              <span className="text-sm text-muted-foreground font-normal">
                @{user.username}
              </span>
              {user.profile?.isOpenToWork && (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[11px]"
                >
                  #OpenToWork
                </Badge>
              )}
            </div>

            {user.profile?.headline && (
              <p className="text-sm sm:text-base text-foreground/90 font-medium max-w-2xl leading-snug">
                {user.profile.headline}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              {user.profile?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {user.profile.location}
                </span>
              )}

              {/* Contact Info Modal Trigger */}
              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="text-primary hover:underline font-semibold flex items-center gap-1 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" /> Contact info
              </button>
            </div>

            {user.profile?.bio && (
              <div className="pt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line border-t border-border/40 mt-3">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">
                  About
                </p>
                {user.profile.bio}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Info Modal */}
      <ContactInfoModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        user={user}
      />

      {/* Edit Profile Modal */}
      {isMe && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onProfileUpdated={(updated) => {
            if (updated.profile?.coverImageUrl) {
              setCoverUrl(updated.profile.coverImageUrl);
            }
            onProfileUpdated?.(updated);
          }}
        />
      )}

      {/* Quick Direct Chat Modal */}
      {chatConversationId && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          recipient={user}
          conversationId={chatConversationId}
        />
      )}
    </>
  );
}

