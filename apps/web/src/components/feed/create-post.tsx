'use client';

import { useRef, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { postsService } from '@/services/posts.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  BookOpen,
  Image as ImageIcon,
  Loader2,
  Play,
  Send,
  Sparkles,
  Video,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ArticleModal } from './article-modal';

interface CreatePostProps {
  onPostCreated?: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<
    { url: string; isVideo: boolean; name: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, isVideo = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingMedia(true);
      const res = await postsService.uploadMedia(file);
      if (res?.url) {
        setMediaUrls((prev) => [...prev, res.url]);
        setMediaPreviews((prev) => [
          ...prev,
          { url: res.url, isVideo: res.isVideo || isVideo, name: file.name },
        ]);
        toast.success(isVideo ? 'Video uploaded!' : 'Photo uploaded!');
      }
    } catch {
      toast.error('Failed to upload media file');
    } finally {
      setIsUploadingMedia(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && mediaUrls.length === 0) || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const postType = mediaPreviews.some((m) => m.isVideo)
        ? 'VIDEO'
        : mediaUrls.length > 0
        ? 'IMAGE'
        : 'TEXT';

      await postsService.createPost({
        content: content.trim(),
        visibility: 'PUBLIC',
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        type: postType,
      });

      setContent('');
      setMediaUrls([]);
      setMediaPreviews([]);
      toast.success('Post published successfully!');
      onPostCreated?.();
    } catch {
      toast.error('Failed to publish post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Card className="mb-6 shadow-sm border border-border/50">
        <CardContent className="pt-5">
          <div className="flex gap-3">
            <Avatar className="h-11 w-11 border">
              <AvatarImage src={user.profile?.profilePictureUrl} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user.firstName[0]}
                {user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <form onSubmit={handleSubmit}>
                <Textarea
                  placeholder="What do you want to talk about? Share an insight, project, photo, or achievement..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  className="resize-none border-border/60 focus-visible:ring-primary/20 text-sm"
                />

                {/* Uploaded Media Previews */}
                {mediaPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 p-2 bg-secondary/30 rounded-lg border border-border/40">
                    {mediaPreviews.map((media, index) => (
                      <div
                        key={index}
                        className="relative group rounded-md overflow-hidden border border-border/60 bg-black/10 max-h-32"
                      >
                        {media.isVideo ? (
                          <div className="relative w-36 h-24 bg-zinc-900 flex items-center justify-center">
                            <video
                              src={media.url}
                              className="w-full h-full object-cover opacity-75"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="h-6 w-6 text-white drop-shadow" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={media.url}
                            alt="Upload preview"
                            className="h-24 w-28 object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(index)}
                          className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors"
                          title="Remove media"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={(e) => handleMediaUpload(e, false)}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={(e) => handleMediaUpload(e, true)}
                  accept="video/*"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-between mt-3 pt-2.5 border-t border-border/40 gap-2">
                  {/* Media Action Buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={isUploadingMedia}
                      className="text-xs text-muted-foreground hover:text-primary gap-1.5 h-8 px-2.5"
                    >
                      {isUploadingMedia ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-emerald-500" />
                      )}
                      <span>Photo</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={isUploadingMedia}
                      className="text-xs text-muted-foreground hover:text-primary gap-1.5 h-8 px-2.5"
                    >
                      <Video className="h-4 w-4 text-blue-500" />
                      <span>Video</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsArticleModalOpen(true)}
                      className="text-xs text-muted-foreground hover:text-primary gap-1.5 h-8 px-2.5"
                    >
                      <BookOpen className="h-4 w-4 text-amber-500" />
                      <span>Write article</span>
                    </Button>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={
                        (!content.trim() && mediaUrls.length === 0) ||
                        isSubmitting ||
                        isUploadingMedia
                      }
                      className="font-medium px-4 h-8 text-xs gap-1.5"
                    >
                      {isSubmitting ? 'Posting...' : 'Post'}
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formatted Article Creation Modal */}
      <ArticleModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        onArticlePublished={onPostCreated}
      />
    </>
  );
}

