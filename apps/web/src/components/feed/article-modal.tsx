'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  Quote,
  Code,
  Eye,
  Edit,
  Loader2,
  Send,
  BookOpen,
} from 'lucide-react';
import { postsService } from '@/services/posts.service';
import toast from 'react-hot-toast';

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArticlePublished?: () => void;
}

export function ArticleModal({ isOpen, onClose, onArticlePublished }: ArticleModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const insertFormatting = (prefix: string, suffix = '') => {
    setContent((prev) => {
      return prev + `\n${prefix}Text${suffix}\n`;
    });
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const formattedArticle = `📰 **${title.trim()}**\n\n${content.trim()}`;
      await postsService.createPost({
        content: formattedArticle,
        visibility: 'PUBLIC',
        type: 'TEXT',
      });

      toast.success('Article published to ConnectSphere feed!');
      setTitle('');
      setContent('');
      onArticlePublished?.();
      onClose();
    } catch {
      toast.error('Failed to publish article. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-border/50">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Write Institute Article & Thought Piece
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Publish long-form research, technical writeups, or campus insights with rich formatting.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handlePublish} className="space-y-4 py-2">
          {/* Article Title */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Article Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Building Scalable Microservices: Lessons from SVKM Hackathon"
              required
              className="text-sm font-semibold h-10"
            />
          </div>

          {/* Editor Mode Tabs & Formatting Toolbar */}
          <div className="border border-border/60 rounded-xl overflow-hidden bg-card">
            <div className="flex items-center justify-between p-2 border-b border-border/50 bg-secondary/30">
              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => insertFormatting('**', '**')}
                  title="Bold"
                >
                  <Bold className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => insertFormatting('*', '*')}
                  title="Italic"
                >
                  <Italic className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => insertFormatting('# ')}
                  title="Heading 1"
                >
                  <Heading1 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => insertFormatting('## ')}
                  title="Heading 2"
                >
                  <Heading2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => insertFormatting('- ')}
                  title="Bullet List"
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => insertFormatting('> ')}
                  title="Quote"
                >
                  <Quote className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => insertFormatting('```\n', '\n```')}
                  title="Code Block"
                >
                  <Code className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* View Toggle */}
              <div className="flex gap-1 bg-secondary/60 p-0.5 rounded-lg border border-border/40">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md flex items-center gap-1 transition-all ${
                    activeTab === 'edit'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Edit className="h-3 w-3" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md flex items-center gap-1 transition-all ${
                    activeTab === 'preview'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Eye className="h-3 w-3" /> Preview
                </button>
              </div>
            </div>

            {/* Editor vs Preview Area */}
            {activeTab === 'edit' ? (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                placeholder="Write your article body here... Use Markdown for headings, code snippets, or quotes."
                className="border-0 focus-visible:ring-0 rounded-none resize-none p-4 text-xs font-mono leading-relaxed"
                required
              />
            ) : (
              <div className="p-4 min-h-[280px] max-h-[400px] overflow-y-auto space-y-3 text-xs leading-relaxed">
                <h2 className="text-base font-bold text-foreground border-b border-border/40 pb-2">
                  {title || 'Untitled Article'}
                </h2>
                <div className="whitespace-pre-line text-foreground/90 font-sans">
                  {content || 'Your formatted preview will appear here as you type.'}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2 border-t border-border/50">
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
              disabled={!title.trim() || !content.trim() || isSubmitting}
              className="text-xs font-semibold px-4 gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Publish Article
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
