'use client';

import { useState, useRef } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { usersService } from '@/services/users.service';
import { useAuthStore } from '@/stores/auth.store';
import {
  Camera,
  Image as ImageIcon,
  Loader2,
  Plus,
  Sparkles,
  X,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PRESET_BANNERS = [
  {
    name: 'SVKM Indigo',
    value: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #93c5fd 100%)',
  },
  {
    name: 'Slate Tech',
    value: 'linear-gradient(135deg, #0f172a 0%, #334155 50%, #64748b 100%)',
  },
  {
    name: 'Emerald Campus',
    value: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%)',
  },
  {
    name: 'Sunset Horizon',
    value: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #facc15 100%)',
  },
  {
    name: 'Royal Violet',
    value: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #c084fc 100%)',
  },
];

const SKILL_SUGGESTIONS = [
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Python',
  'PostgreSQL',
  'Tailwind CSS',
  'Machine Learning',
  'Data Science',
  'Docker',
  'System Design',
  'Cloud Architecture',
  'DevOps',
  'Cybersecurity',
  'UI/UX Design',
  'GraphQL',
  'Java',
  'Spring Boot',
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updated: any) => void;
  user: any;
}

export function EditProfileModal({
  isOpen,
  onClose,
  onProfileUpdated,
  user,
}: EditProfileModalProps) {
  const { updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [headline, setHeadline] = useState(user?.profile?.headline || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [location, setLocation] = useState(user?.profile?.location || '');
  const [website, setWebsite] = useState(user?.profile?.website || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.profile?.phoneNumber || '');
  const [coverImageUrl, setCoverImageUrl] = useState(user?.profile?.coverImageUrl || '');

  // Skills multi-select state
  const initialSkills = (user?.profile?.skills || []).map(
    (s: any) => s.skill?.name || s.customName || s.name
  ).filter(Boolean);
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [skillInput, setSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Skill already added');
      return;
    }
    setSkills([...skills, trimmed]);
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingBanner(true);
      const res = await usersService.uploadCoverImage(file);
      if (res?.coverImageUrl) {
        setCoverImageUrl(res.coverImageUrl);
        toast.success('Cover banner uploaded!');
      }
    } catch {
      toast.error('Failed to upload cover banner');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updated = await usersService.updateProfile({
        firstName,
        lastName,
        headline,
        bio,
        location,
        website,
        phoneNumber,
        coverImageUrl,
      });

      // Update skills that are newly added
      for (const skillName of skills) {
        if (!initialSkills.includes(skillName)) {
          try {
            await usersService.addSkill(skillName);
          } catch {
            // Ignore duplicate
          }
        }
      }

      // Update user in auth store
      updateUser({
        firstName,
        lastName,
        profile: {
          ...(user?.profile || {}),
          ...updated,
          headline,
          bio,
          location,
          website,
          phoneNumber,
          coverImageUrl,
        },
      });

      toast.success('Profile updated successfully!');
      onProfileUpdated?.({
        ...user,
        firstName,
        lastName,
        profile: {
          ...(user?.profile || {}),
          ...updated,
          headline,
          bio,
          location,
          website,
          phoneNumber,
          coverImageUrl,
          skills: skills.map((name, i) => ({ id: `temp-${i}`, skill: { name } })),
        },
      });
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSuggestions = SKILL_SUGGESTIONS.filter(
    (s) =>
      !skills.some((sk) => sk.toLowerCase() === s.toLowerCase()) &&
      s.toLowerCase().includes(skillInput.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-border/50">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update your academic headline, customizable banner, contact details, and skill tags.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Cover Banner Customizer */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Customizable Cover Banner</Label>
            <div
              className="h-28 w-full rounded-xl overflow-hidden relative border border-border/60 flex items-center justify-center shadow-inner"
              style={{
                background: coverImageUrl.startsWith('linear-gradient')
                  ? coverImageUrl
                  : undefined,
              }}
            >
              {coverImageUrl && !coverImageUrl.startsWith('linear-gradient') && (
                <img
                  src={coverImageUrl}
                  alt="Cover Banner"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleBannerUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingBanner}
                  className="h-8 text-xs gap-1.5 shadow"
                >
                  {isUploadingBanner ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                  Upload Image
                </Button>
              </div>
            </div>

            {/* Gradient Preset Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-[11px] text-muted-foreground shrink-0 flex items-center gap-1 mr-1">
                <Sparkles className="h-3 w-3 text-primary" /> Presets:
              </span>
              {PRESET_BANNERS.map((preset) => {
                const isSelected = coverImageUrl === preset.value;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setCoverImageUrl(preset.value)}
                    className={`h-6 px-2.5 rounded-full text-[10px] font-medium border transition-all shrink-0 flex items-center gap-1 ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 text-foreground font-semibold'
                        : 'border-border/60 text-muted-foreground hover:border-foreground/40'
                    }`}
                    style={{ background: preset.value, color: '#ffffff' }}
                  >
                    {isSelected && <Check className="h-2.5 w-2.5" />}
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">First Name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Last Name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Headline</Label>
            <Input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Student at MPSTME | Full-Stack Developer | AI Enthusiast"
              className="text-xs h-9"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">About / Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Share your academic interests, engineering background, and aspirations..."
              className="text-xs resize-none"
            />
          </div>

          {/* Location & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Mumbai, Maharashtra"
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Phone Number</Label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Website / Portfolio</Label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourportfolio.dev"
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* Skills Multi-Select Input */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold">Skills & Expertise (Multi-select)</Label>
              <span className="text-[10px] text-muted-foreground">
                {skills.length} skills selected
              </span>
            </div>

            {/* Selected Skill Tags */}
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-lg border border-border/60 bg-secondary/20">
              {skills.length === 0 ? (
                <span className="text-xs text-muted-foreground self-center">
                  No skills selected yet. Select from below or type a custom skill.
                </span>
              ) : (
                skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-xs gap-1 py-1 px-2.5 bg-primary/10 text-primary border border-primary/20"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-red-500 transition-colors"
                      title="Remove skill"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>

            {/* Skill Input with Enter to Add */}
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(skillInput);
                  }
                }}
                placeholder="Type a skill and press Enter..."
                className="text-xs h-8 flex-1"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!skillInput.trim()}
                onClick={() => handleAddSkill(skillInput)}
                className="h-8 text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>

            {/* Quick Suggestion Chips */}
            {filteredSuggestions.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] text-muted-foreground block mb-1">
                  Suggested for SVKM students & alumni:
                </span>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {filteredSuggestions.slice(0, 10).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddSkill(s)}
                      className="px-2 py-0.5 rounded-full text-[11px] border border-border/50 bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all text-muted-foreground"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-border/50 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="text-xs font-semibold px-5"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
