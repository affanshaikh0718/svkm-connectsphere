'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { postsService } from '@/services/posts.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommentSection } from './comment-section';
import { formatTimeAgo } from '@/lib/utils';
import {
  Bookmark,
  Edit3,
  Flag,
  Globe,
  Heart,
  Link2,
  Loader2,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Send,
  Trash2,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    createdAt: string;
    visibility?: string;
    likeCount: number;
    commentCount: number;
    isLiked?: boolean;
    isSaved?: boolean;
    media?: { id?: string; url: string; mimeType?: string }[];
    author: {
      id: string;
      firstName: string;
      lastName: string;
      username: string;
      profile?: {
        headline?: string;
        profilePictureUrl?: string;
      };
    };
  };
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (updatedPost: any) => void;
}

export function PostCard({ post, onPostDeleted, onPostUpdated }: PostCardProps) {
  const { user: currentUser } = useAuthStore();
  const isAuthor =
    !!currentUser?.id &&
    (currentUser.id === post.author.id || currentUser.id === (post as any).authorId);

  const [content, setContent] = useState(post.content);
  const [visibility, setVisibility] = useState(post.visibility || 'PUBLIC');
  const [isLiked, setIsLiked] = useState(!!post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [isSaved, setIsSaved] = useState(!!post.isSaved);
  const [showComments, setShowComments] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editVisibility, setEditVisibility] = useState(post.visibility || 'PUBLIC');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('SPAM');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  if (isDeleted) return null;

  const handleLike = async () => {
    try {
      const nextLiked = !isLiked;
      setIsLiked(nextLiked);
      setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
      await postsService.likePost(post.id);
    } catch {
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleSave = async () => {
    try {
      const nextSaved = !isSaved;
      setIsSaved(nextSaved);
      await postsService.savePost(post.id);
      toast.success(nextSaved ? 'Post saved to bookmarks' : 'Post removed from saved');
    } catch {
      setIsSaved(!isSaved);
      toast.error('Failed to update saved status');
    }
  };

  const handleCopyLink = async () => {
    try {
      const url =
        typeof window !== 'undefined'
          ? `${window.location.origin}/feed#post-${post.id}`
          : `/feed#post-${post.id}`;
      await navigator.clipboard.writeText(url);
      toast.success('Post link copied to clipboard!');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleSend = async () => {
    try {
      const url =
        typeof window !== 'undefined'
          ? `${window.location.origin}/feed#post-${post.id}`
          : `/feed#post-${post.id}`;
      await navigator.clipboard.writeText(url);
      toast.success('Post link ready! Copied to clipboard to share.');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    try {
      setIsSavingEdit(true);
      const updated = await postsService.updatePost(post.id, {
        content: editContent.trim(),
        visibility: editVisibility,
      });
      setContent(editContent.trim());
      setVisibility(editVisibility);
      setIsEditModalOpen(false);
      toast.success('Post updated successfully!');
      onPostUpdated?.(updated);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update post');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      setIsDeleting(true);
      await postsService.deletePost(post.id);
      setIsDeleted(true);
      setIsDeleteModalOpen(false);
      toast.success('Post deleted successfully');
      onPostDeleted?.(post.id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingReport(true);
      const fullReason = reportDetails.trim()
        ? `${reportReason}: ${reportDetails.trim()}`
        : reportReason;
      await postsService.reportPost(post.id, fullReason);
      setIsReportModalOpen(false);
      setReportDetails('');
      toast.success('Thank you. Your report has been submitted for moderation.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <>
      <Card id={`post-${post.id}`} className="mb-4 shadow-sm border border-border/50 hover:border-border/80 transition-all">
        <CardContent className="pt-5 pb-4">
          {/* Author Header & 3-Dots Dropdown */}
          <div className="flex items-start justify-between mb-3 gap-2">
            <Link href={`/in/${post.author.username}`} className="flex gap-3 items-center group flex-1 min-w-0">
              <Avatar className="h-11 w-11 border shrink-0">
                <AvatarImage src={post.author.profile?.profilePictureUrl} />
                <AvatarFallback className="font-semibold text-primary">
                  {post.author.firstName[0]}
                  {post.author.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm group-hover:text-primary transition-colors flex items-center gap-1.5 truncate">
                  <span className="truncate">
                    {post.author.firstName} {post.author.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground font-normal shrink-0">
                    @{post.author.username}
                  </span>
                </h4>
                {post.author.profile?.headline && (
                  <p className="text-xs text-muted-foreground line-clamp-1 max-w-[420px]">
                    {post.author.profile.headline}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                  <span>{formatTimeAgo(post.createdAt)}</span>
                  <span>•</span>
                  {visibility === 'PUBLIC' && (
                    <span className="flex items-center gap-0.5" title="Public post">
                      <Globe className="h-3 w-3" /> Public
                    </span>
                  )}
                  {visibility === 'CONNECTIONS' && (
                    <span className="flex items-center gap-0.5" title="Connections only">
                      <Users className="h-3 w-3" /> Connections
                    </span>
                  )}
                  {visibility === 'PRIVATE' && (
                    <span className="flex items-center gap-0.5" title="Only you">
                      <Lock className="h-3 w-3" /> Only you
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Professional 3-Dots Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-full"
                  aria-label="Post actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1.5 shadow-lg">
                {isAuthor ? (
                  <>
                    {/* Author Actions: Edit, Delete, Send, Copy Link, Save */}
                    <DropdownMenuItem
                      onClick={() => {
                        setEditContent(content);
                        setEditVisibility(visibility);
                        setIsEditModalOpen(true);
                      }}
                      className="cursor-pointer gap-2 text-xs py-2 font-medium"
                    >
                      <Edit3 className="h-4 w-4 text-primary" />
                      <span>Edit post</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleSend}
                      className="cursor-pointer gap-2 text-xs py-2 font-medium"
                    >
                      <Send className="h-4 w-4 text-muted-foreground" />
                      <span>Send in message</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleCopyLink}
                      className="cursor-pointer gap-2 text-xs py-2 font-medium"
                    >
                      <Link2 className="h-4 w-4 text-muted-foreground" />
                      <span>Copy link to post</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleSave}
                      className="cursor-pointer gap-2 text-xs py-2 font-medium"
                    >
                      <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                      <span>{isSaved ? 'Remove from saved' : 'Save post'}</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuItem
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="cursor-pointer gap-2 text-xs py-2 font-medium text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete post</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    {/* Viewer Actions: Send, Copy Link, Save, Report */}
                    <DropdownMenuItem
                      onClick={handleSend}
                      className="cursor-pointer gap-2 text-xs py-2 font-medium"
                    >
                      <Send className="h-4 w-4 text-muted-foreground" />
                      <span>Send in message</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleCopyLink}
                      className="cursor-pointer gap-2 text-xs py-2 font-medium"
                    >
                      <Link2 className="h-4 w-4 text-muted-foreground" />
                      <span>Copy link to post</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleSave}
                      className="cursor-pointer gap-2 text-xs py-2 font-medium"
                    >
                      <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                      <span>{isSaved ? 'Remove from saved' : 'Save post'}</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuItem
                      onClick={() => setIsReportModalOpen(true)}
                      className="cursor-pointer gap-2 text-xs py-2 font-medium text-amber-600 focus:text-amber-600 focus:bg-amber-500/10"
                    >
                      <Flag className="h-4 w-4" />
                      <span>Report post</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Post Content */}
          <div className="text-sm whitespace-pre-line text-foreground/90 leading-relaxed mb-4">
            {content}
          </div>

          {/* Attached Media (Photos / Videos) */}
          {post.media && post.media.length > 0 && (
            <div className="mb-4 space-y-2">
              {post.media.map((item, idx) => {
                const isVideo =
                  item.mimeType?.startsWith('video/') ||
                  /\.(mp4|webm|mov|mkv)$/i.test(item.url);
                if (isVideo) {
                  return (
                    <div
                      key={item.id || idx}
                      className="rounded-xl overflow-hidden border border-border/60 bg-black/5"
                    >
                      <video
                        src={item.url}
                        controls
                        className="w-full max-h-[420px] rounded-xl object-contain bg-black"
                      />
                    </div>
                  );
                }
                return (
                  <div
                    key={item.id || idx}
                    className="rounded-xl overflow-hidden border border-border/60 bg-secondary/10"
                  >
                    <img
                      src={item.url}
                      alt="Post media attachment"
                      className="w-full max-h-[460px] object-cover rounded-xl"
                      loading="lazy"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Engagement Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground py-2 border-y border-border/40">
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500 inline" />
              {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </span>
            <div className="flex gap-3">
              <span>{post.commentCount || 0} comments</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex-1 text-xs font-medium gap-1.5 ${
                isLiked ? 'text-red-500 font-semibold' : 'text-muted-foreground'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500' : ''}`} />
              Like
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex-1 text-xs font-medium text-muted-foreground gap-1.5"
            >
              <MessageSquare className="h-4 w-4" />
              Comment
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={`flex-1 text-xs font-medium gap-1.5 ${
                isSaved ? 'text-primary font-semibold' : 'text-muted-foreground'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-primary' : ''}`} />
              Save
            </Button>
          </div>

          {/* Expandable Comments */}
          {showComments && <CommentSection postId={post.id} />}
        </CardContent>
      </Card>

      {/* Author: Edit Post Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-primary" /> Edit Post
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify the post content or update the audience visibility.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={5}
              placeholder="What do you want to share?"
              className="resize-none text-sm border-border/60"
              required
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Who can view this post?
              </label>
              <div className="flex gap-2">
                {[
                  { key: 'PUBLIC', label: 'Public', icon: Globe },
                  { key: 'CONNECTIONS', label: 'Connections', icon: Users },
                  { key: 'PRIVATE', label: 'Only Me', icon: Lock },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = editVisibility === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setEditVisibility(item.key)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                          : 'border-border/60 text-muted-foreground hover:bg-secondary/40'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSavingEdit}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingEdit || !editContent.trim()}
                className="text-xs font-semibold px-4"
              >
                {isSavingEdit ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Author: Delete Post Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Delete Post
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteSubmit}
              disabled={isDeleting}
              className="text-xs font-semibold px-4"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Deleting...
                </>
              ) : (
                'Delete Post'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Viewer: Report Post Dialog */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-amber-600">
              <Flag className="h-4 w-4" /> Report Post
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Help us maintain an academic, constructive community by selecting why you are reporting this content.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReportSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              {[
                { value: 'SPAM', label: 'Spam, advertising or bot activity' },
                { value: 'HARASSMENT', label: 'Harassment, hate speech, or abuse' },
                { value: 'INAPPROPRIATE', label: 'Inappropriate or offensive content' },
                { value: 'SCAM', label: 'Scam, fraud or impersonation' },
                { value: 'OTHER', label: 'Other violation of community guidelines' },
              ].map((reason) => (
                <label
                  key={reason.value}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    reportReason === reason.value
                      ? 'border-primary bg-primary/5 text-foreground font-medium'
                      : 'border-border/60 text-muted-foreground hover:bg-secondary/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.value}
                    checked={reportReason === reason.value}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="accent-primary"
                  />
                  <span>{reason.label}</span>
                </label>
              ))}
            </div>

            <Textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              rows={3}
              placeholder="Provide optional additional context for the moderation team..."
              className="resize-none text-xs"
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReportModalOpen(false)}
                disabled={isSubmittingReport}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingReport}
                className="text-xs font-semibold px-4 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isSubmittingReport ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

