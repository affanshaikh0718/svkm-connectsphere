'use client';

import { useState } from 'react';
import { jobsService } from '@/services/jobs.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

interface ApplyModalProps {
  job: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
  onApplied?: () => void;
}

export function ApplyModal({ job, isOpen, onClose, onApplied }: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await jobsService.applyToJob(job.id, {
        coverLetter: coverLetter.trim() || undefined,
        resumeUrl: resumeUrl.trim() || undefined,
      });
      toast.success(`Application submitted for ${job.title}!`);
      onApplied?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleApply}>
          <DialogHeader>
            <DialogTitle>Apply to {job.company.name}</DialogTitle>
            <DialogDescription className="text-xs">
              Role: <span className="font-semibold text-foreground">{job.title}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="resume">Resume Document URL (optional)</Label>
              <Input
                id="resume"
                placeholder="https://drive.google.com/your-resume.pdf"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coverLetter">Why are you a great fit? (Cover Note)</Label>
              <Textarea
                id="coverLetter"
                placeholder="Highlight your relevant experience, technical achievements, and passion for the role..."
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
