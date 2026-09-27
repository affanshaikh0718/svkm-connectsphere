'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import {
  Home,
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Moon,
  Sun,
  Shield,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import { authService } from '@/services/auth.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/network', icon: Users, label: 'Network' },
  { href: '/jobs', icon: Briefcase, label: 'Jobs' },
  { href: '/messages', icon: MessageSquare, label: 'Messages' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Logout even if API fails
    } finally {
      logout();
      router.push('/login');
      toast.success('Logged out successfully');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const displayName = user ? `${user.firstName} ${user.lastName}` : '';
  const initials = user ? getInitials(user.firstName, user.lastName) : '';
  const avatarUrl = user?.profile?.profilePictureUrl;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4 max-w-7xl mx-auto gap-4">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2.5 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-black text-lg tracking-tight">CS</span>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-bold text-base leading-tight text-foreground flex items-center gap-1.5">
              ConnectSphere
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                SVKM
              </span>
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">SVKM Professional Network</span>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search SVKM students, alumni, faculty, jobs..."
              className="pl-9 bg-muted border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Nav Icons */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md text-xs transition-colors',
                  isActive
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}

          {/* Notifications */}
          <Link
            href="/notifications"
            className={cn(
              'relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md text-xs transition-colors',
              pathname === '/notifications'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <Bell className="h-5 w-5" />
            <span>Alerts</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                <AvatarFallback className="text-xs bg-brand-100 text-brand-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:block text-sm font-medium max-w-[100px] truncate">
                {user?.firstName}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {user && (
              <>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                      <AvatarFallback className="bg-brand-100 text-brand-700">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild>
              <Link href={`/in/${user?.username}`} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            {user?.role === 'ADMIN' && (
              <DropdownMenuItem asChild>
                <Link href="/admin" className="cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
