'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, Calendar, Users, Clock, BookOpen, UserCheck, Megaphone, Shield, GraduationCap, User, ArrowLeftRight, Package, FileText, ClipboardList, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole, Role } from '@/lib/role-context';

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

const allLinks: NavLink[] = [
  { href: '/', label: 'Dashboard', icon: Music, roles: ['admin'] },
  { href: '/availability', label: 'Instructors', icon: Clock, roles: ['admin'] },
  { href: '/students', label: 'Students', icon: Users, roles: ['admin'] },
  { href: '/schedule', label: 'Schedule', icon: Calendar, roles: ['admin'] },
  { href: '/bookings', label: 'Bookings', icon: BookOpen, roles: ['admin'] },
  { href: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['admin'] },
  { href: '/rentals', label: 'Rentals', icon: Package, roles: ['admin'] },
  { href: '/resources', label: 'Resources', icon: FileText, roles: ['admin'] },
  { href: '/lesson-requests', label: 'Lesson Requests', icon: ClipboardList, roles: ['admin'] },
  // Instructor
  { href: '/my-profile', label: 'My Profile', icon: User, roles: ['instructor'] },
  { href: '/instructors', label: 'Directory', icon: UserCheck, roles: ['instructor'] },
  { href: '/students', label: 'Students', icon: Users, roles: ['instructor'] },
  { href: '/bookings', label: 'My Schedule', icon: BookOpen, roles: ['instructor'] },
  { href: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['instructor'] },
  { href: '/rentals', label: 'Rentals', icon: Package, roles: ['instructor'] },
  { href: '/resources', label: 'Resources', icon: FileText, roles: ['instructor'] },
  // Student
  { href: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['student'] },
  { href: '/instructors', label: 'Instructors', icon: UserCheck, roles: ['student'] },
  { href: '/my-profile', label: 'My Profile', icon: User, roles: ['student'] },
  { href: '/bookings', label: 'My Lessons', icon: BookOpen, roles: ['student'] },
  { href: '/rentals', label: 'Rentals', icon: Package, roles: ['student'] },
  { href: '/resources', label: 'Resources', icon: FileText, roles: ['student'] },
];

const roleBadge: Record<Role, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'bg-primary text-primary-foreground' },
  instructor: { label: 'Instructor', color: 'bg-primary/20 text-primary' },
  student: { label: 'Student', color: 'bg-primary/20 text-primary' },
};

export function Nav() {
  const pathname = usePathname();
  const { role, clearRole } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  if (!role) return null;

  const links = allLinks.filter(l => l.roles.includes(role));
  const badge = roleBadge[role];

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5">
          <Music className="h-6 w-6 text-primary shrink-0" />
          <div className="leading-tight">
            <span className="font-bold text-sm text-primary tracking-wide">ELEVATED</span>
            <span className="block text-[10px] text-[#8a8a8a] tracking-widest uppercase">Music Center</span>
          </div>
        </Link>
      </div>

      {/* Role badge */}
      <div className="px-4 pt-4 pb-2">
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', badge.color)}>
          <Shield className="h-3 w-3" />
          {badge.label}
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href + label}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-[#8a8a8a] hover:bg-[#1c1708] hover:text-[#D4AF37]'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Switch role */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={clearRole}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#8a8a8a] hover:bg-[#1c1708] hover:text-[#D4AF37] transition-all duration-150"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Switch Role
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-[#111111] border-b border-border flex items-center px-4 z-40 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 text-[#8a8a8a] hover:text-primary transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 flex items-center justify-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          <span className="font-bold text-sm text-primary tracking-wide">ELEVATED</span>
        </div>
        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold', badge.color)}>
          <Shield className="h-2.5 w-2.5" />
          {badge.label}
        </span>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - desktop: always visible, mobile: slide-in overlay */}
      <aside className={cn(
        'fixed top-0 left-0 h-screen w-56 bg-[#111111] border-r border-border flex flex-col z-50 transition-transform duration-300 ease-in-out',
        'md:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-3 p-1 text-[#8a8a8a] hover:text-primary transition-colors md:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
