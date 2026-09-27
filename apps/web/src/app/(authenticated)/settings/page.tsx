'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { usersService } from '@/services/users.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuthStore();

  const [headline, setHeadline] = useState(user?.profile?.headline || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usersService.updateProfile({ headline, bio, location });
      toast.success('Profile details saved successfully!');
    } catch {
      toast.error('Failed to update profile');
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
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="headline">Headline</Label>
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
                    placeholder="e.g. San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <Button type="submit" size="sm" className="font-semibold">
                  Save Changes
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
