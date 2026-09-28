'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { usersService } from '@/services/users.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Lock, Loader2, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [headline, setHeadline] = useState(user?.profile?.headline || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [location, setLocation] = useState(user?.profile?.location || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.profilePictureUrl || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setHeadline(user.profile?.headline || '');
      setBio(user.profile?.bio || '');
      setLocation(user.profile?.location || '');
      setAvatarUrl(user.profile?.profilePictureUrl || '');
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const res = await usersService.uploadProfilePicture(file);
      if (res?.profilePictureUrl) {
        setAvatarUrl(res.profilePictureUrl);
        if (user?.profile) {
          updateUser({
            profile: {
              ...user.profile,
              profilePictureUrl: res.profilePictureUrl,
            },
          });
        }
        toast.success('Profile photo uploaded successfully!');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      const updated = await usersService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        location: location.trim(),
      });

      // Synchronize state in Zustand store
      updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ...(user?.profile
          ? {
              profile: {
                ...user.profile,
                ...updated,
                headline: headline.trim(),
                bio: bio.trim(),
                location: location.trim(),
              },
            }
          : {}),
      });
      toast.success('Profile details saved successfully!');
    } catch (err: any) {
      const errorMsg = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join('. ')
        : (err?.response?.data?.message || err?.message || 'Failed to update profile');
      toast.error(errorMsg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || isUpdatingPassword) return;

    try {
      setIsUpdatingPassword(true);
      await authService.changePassword({ oldPassword, newPassword });
      toast.success('Password changed successfully! Please log in again.');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Password update failed');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-6 px-4">
      <h1 className="text-xl font-bold mb-6">Settings & Privacy</h1>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="bg-secondary/40 border border-border/50">
          <TabsTrigger value="account" className="text-xs gap-1.5">
            <User className="h-3.5 w-3.5" /> Account Preferences
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Sign in & Security
          </TabsTrigger>
        </TabsList>

        {/* Profile / Account Settings */}
        <TabsContent value="account">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold">Profile Info</CardTitle>
              <CardDescription className="text-xs">
                Update how your name, headline, and bio appear across ConnectSphere.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo Upload */}
              <div className="flex items-center gap-4 pb-4 border-b border-border/40">
                <Avatar className="h-16 w-16 border-2 border-border shadow-sm">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-base font-bold bg-primary/10 text-primary">
                    {firstName[0] || user?.firstName?.[0] || 'U'}
                    {lastName[0] || user?.lastName?.[0] || ''}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">Profile Picture</p>
                  <p className="text-[11px] text-muted-foreground">PNG, JPG or WEBP up to 5MB.</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-7 text-xs gap-1.5 mt-1 font-medium"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="h-3.5 w-3.5" /> Change Photo
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="e.g. John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="e.g. Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="headline">Headline / Role</Label>
                  <Input
                    id="headline"
                    placeholder="e.g. Senior Software Engineer at TechNova"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Mumbai, India"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bio">About / Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Write a brief professional summary about your background, interests, and goals..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="text-xs"
                  />
                </div>

                <Button type="submit" size="sm" disabled={isSavingProfile} className="font-semibold gap-1.5">
                  {isSavingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isSavingProfile ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold">Change Password</CardTitle>
              <CardDescription className="text-xs">
                Choose a strong password with at least 8 characters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 text-xs max-w-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="oldPassword">Current Password</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" size="sm" disabled={isUpdatingPassword} className="font-semibold">
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
