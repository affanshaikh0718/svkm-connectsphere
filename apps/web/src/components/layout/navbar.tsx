'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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
  Loader2,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import { authService } from '@/services/auth.service';
import { searchService } from '@/services/search.service';
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
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced live search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      setIsDropdownOpen(false);
      return;
    }

    setIsSearching(true);
    setIsDropdownOpen(true);

    const timer = setTimeout(async () => {
      try {
        const res = await searchService.globalSearch(trimmed);
        setSearchResults(res);
      } catch {
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setIsDropdownOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const displayName = user ? `${user.firstName} ${user.lastName}` : '';
  const initials = user ? getInitials(user.firstName, user.lastName) : '';
  const avatarUrl = user?.profile?.profilePictureUrl;

  const peopleList = searchResults?.users || searchResults?.people || [];
  const jobsList = searchResults?.jobs || [];
  const companiesList = searchResults?.companies || [];
  const hasResults = peopleList.length > 0 || jobsList.length > 0 || companiesList.length > 0;

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

        {/* Search Bar with Debounced Dropdown */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-md">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search SVKM students, alumni, faculty, jobs..."
                className="pl-9 pr-9 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary text-xs h-9"
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setIsDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsDropdownOpen(false);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
              )}
            </div>
          </form>

          {/* Search Dropdown Results */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-card/95 backdrop-blur-md border border-border/60 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-border/40 animate-in fade-in slide-in-from-top-2 duration-150">
              {isSearching ? (
                <div className="p-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Searching SVKM network...</span>
                </div>
              ) : !hasResults ? (
                <div className="p-6 text-center space-y-1">
                  <Search className="h-6 w-6 text-muted-foreground mx-auto mb-1.5 opacity-40" />
                  <p className="text-xs font-semibold text-foreground">
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Try searching by name, title (e.g. Engineer), or tags (e.g. React, Python).
                  </p>
                </div>
              ) : (
                <div className="max-h-[380px] overflow-y-auto divide-y divide-border/30">
                  {/* People Section */}
                  {peopleList.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-primary" />
                        <span>People ({peopleList.length})</span>
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {peopleList.slice(0, 5).map((person: any) => (
                          <Link
                            key={person.id}
                            href={`/in/${person.username}`}
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-secondary/60 transition-colors group"
                          >
                            <Avatar className="h-8 w-8 border shadow-xs shrink-0">
                              <AvatarImage src={person.profile?.profilePictureUrl} />
                              <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                                {person.firstName?.[0] || 'U'}
                                {person.lastName?.[0] || ''}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                  {person.firstName} {person.lastName}
                                </span>
                                <span className="text-[10px] text-muted-foreground truncate">
                                  @{person.username}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {person.profile?.headline || 'SVKM Ecosystem Member'}
                              </p>
                              {/* Display matched skills tags */}
                              {person.profile?.skills && person.profile.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {person.profile.skills.slice(0, 2).map((sk: any, i: number) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] bg-primary/10 text-primary font-medium"
                                    >
                                      {sk.skill?.name || sk.customName}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Jobs Section */}
                  {jobsList.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Briefcase className="h-3 w-3 text-emerald-600" />
                        <span>Jobs ({jobsList.length})</span>
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {jobsList.slice(0, 3).map((job: any) => (
                          <Link
                            key={job.id}
                            href="/jobs"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/60 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">
                                {job.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {job.company?.name || 'SVKM Partner'} • {job.location || 'Remote'}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Companies Section */}
                  {companiesList.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="h-3 w-3 text-blue-500" />
                        <span>Companies ({companiesList.length})</span>
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {companiesList.slice(0, 2).map((company: any) => (
                          <Link
                            key={company.id}
                            href={`/search?q=${encodeURIComponent(company.name)}`}
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/60 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">
                                {company.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {company.industry || company.location || 'Enterprise'}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View all results footer */}
                  <Link
                    href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="p-2.5 bg-secondary/30 hover:bg-secondary/60 text-xs font-medium text-primary flex items-center justify-center gap-1.5 transition-colors border-t border-border/40"
                  >
                    <span>View all search results for &ldquo;{searchQuery}&rdquo;</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

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
