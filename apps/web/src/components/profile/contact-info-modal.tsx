'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Phone,
  Globe,
  Github,
  Linkedin,
  Twitter,
  ExternalLink,
  GraduationCap,
  Copy,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    firstName: string;
    lastName: string;
    username: string;
    email?: string;
    profile?: {
      phoneNumber?: string;
      website?: string;
      githubUrl?: string;
      linkedinUrl?: string;
      twitterUrl?: string;
    };
  };
}

export function ContactInfoModal({ isOpen, onClose, user }: ContactInfoModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const email = user.email || `${user.username}@svkm.ac.in`;
  const phone = user.profile?.phoneNumber;
  const website = user.profile?.website;
  const github = user.profile?.githubUrl;
  const linkedin = user.profile?.linkedinUrl;
  const twitter = user.profile?.twitterUrl;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    toast.success('Email copied to clipboard');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-3 border-b border-border/50">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            Contact Information
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Connect with {user.firstName} {user.lastName} across institute and personal channels.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Email */}
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20">
            <div className="p-2 rounded-md bg-primary/10 text-primary mt-0.5">
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Institute Email</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                  Verified
                </Badge>
              </div>
              <a
                href={`mailto:${email}`}
                className="text-primary hover:underline font-mono text-[11px] block truncate mt-0.5"
              >
                {email}
              </a>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleCopyEmail}
              title="Copy Email"
            >
              {copiedEmail ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20">
            <div className="p-2 rounded-md bg-primary/10 text-primary mt-0.5">
              <Phone className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-foreground block">Phone</span>
              {phone ? (
                <a href={`tel:${phone}`} className="text-muted-foreground hover:text-foreground text-[11px] mt-0.5 block">
                  {phone}
                </a>
              ) : (
                <span className="text-muted-foreground text-[11px] mt-0.5 block italic">
                  Not publicly listed
                </span>
              )}
            </div>
          </div>

          {/* Institute Affiliation Links */}
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20">
            <div className="p-2 rounded-md bg-primary/10 text-primary mt-0.5">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-foreground block">SVKM Institute Portals</span>
              <div className="space-y-1 mt-1 text-[11px]">
                <a
                  href="https://svkm.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  SVKM Official Portal <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://nmims.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  NMIMS Deemed-to-be-University <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Social / Web Links */}
          {(website || github || linkedin || twitter) && (
            <div className="pt-2 border-t border-border/40">
              <span className="font-semibold text-foreground block mb-2">Web & Social Profiles</span>
              <div className="grid grid-cols-2 gap-2">
                {website && (
                  <a
                    href={website.startsWith('http') ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded border border-border/50 hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    <span className="truncate">Website</span>
                  </a>
                )}
                {github && (
                  <a
                    href={github.startsWith('http') ? github : `https://github.com/${github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded border border-border/50 hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="h-3.5 w-3.5 text-foreground" />
                    <span className="truncate">GitHub</span>
                  </a>
                )}
                {linkedin && (
                  <a
                    href={linkedin.startsWith('http') ? linkedin : `https://linkedin.com/in/${linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded border border-border/50 hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Linkedin className="h-3.5 w-3.5 text-[#0A66C2]" />
                    <span className="truncate">LinkedIn</span>
                  </a>
                )}
                {twitter && (
                  <a
                    href={twitter.startsWith('http') ? twitter : `https://twitter.com/${twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded border border-border/50 hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Twitter className="h-3.5 w-3.5 text-[#1DA1F2]" />
                    <span className="truncate">Twitter</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
