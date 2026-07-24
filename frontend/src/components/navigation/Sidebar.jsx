import React, { useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, ChevronLeft, Compass, LayoutDashboard, LogOut, Menu, MessageSquare, Search, Settings, Sparkles, UserCircle, Users, UserPlus, Brain, ShieldQuestion, BookOpen, ClipboardList, Activity, Link2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const navigationByRole = {
  student: [
    { label: 'Workspace', items: [{ to: '/dashboard/student/overview', icon: LayoutDashboard, label: 'Overview' }, { to: '/dashboard/student/study-plan', icon: BookOpen, label: 'Study plan' }, { to: '/dashboard/student/survey', icon: ClipboardList, label: 'Check-in survey' }] },
    { label: 'Insights', items: [{ to: '/dashboard/student/personality', icon: Brain, label: 'Cognitive profile' }, { to: '/dashboard/student/risk-explanation', icon: ShieldQuestion, label: 'Risk insights' }, { to: '/dashboard/student/chatbot', icon: Sparkles, label: 'AI advisor' }] },
    { label: 'Connect', items: [{ to: '/dashboard/student/chat', icon: MessageSquare, label: 'Messages' }] },
  ],
  mentor: [
    { label: 'Workspace', items: [{ to: '/dashboard/mentor/overview', icon: LayoutDashboard, label: 'Overview' }, { to: '/dashboard/mentor/mentees', icon: Users, label: 'My mentees' }, { to: '/dashboard/mentor/assign-student', icon: UserPlus, label: 'Assign student' }] },
    { label: 'Support', items: [{ to: '/dashboard/mentor/alerts', icon: Bell, label: 'Priority alerts' }, { to: '/dashboard/mentor/survey-links', icon: Link2, label: 'Survey links' }, { to: '/dashboard/mentor/chat', icon: MessageSquare, label: 'Messages' }] },
  ],
  admin: [
    { label: 'Manage', items: [{ to: '/dashboard/admin/overview', icon: LayoutDashboard, label: 'Overview' }, { to: '/dashboard/admin/users', icon: Users, label: 'People & access' }, { to: '/dashboard/admin/alerts', icon: Bell, label: 'Alerts' }] },
    { label: 'Monitor', items: [{ to: '/dashboard/admin/activity', icon: Activity, label: 'Activity log' }, { to: '/dashboard/admin/chat', icon: MessageSquare, label: 'Messages' }] },
  ],
};

function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const groups = useMemo(() => navigationByRole[user?.role] || [], [user?.role]);
  const filteredGroups = useMemo(() => groups.map(group => ({ ...group, items: group.items.filter(item => item.label.toLowerCase().includes(query.toLowerCase())) })).filter(group => group.items.length), [groups, query]);
  const settingsPath = `/dashboard/${user?.role}/settings`;
  const alertsPath = user?.role === 'student' ? '/dashboard/student/chat' : `/dashboard/${user?.role}/alerts`;

  if (!user) return null;
  const goHome = () => navigate('/');
  const signOut = () => { logout(); navigate('/login'); };

  return <aside className={`relative z-50 flex h-screen flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] shadow-[var(--shadow-lg)] transition-[width] duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
    <div className={`flex h-16 items-center border-b border-[var(--sidebar-border)] ${isCollapsed ? 'justify-center px-3' : 'justify-between px-5'}`}>
      <Link to="/" onClick={goHome} aria-label="BodhyaAI home" className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-[var(--brand)]">
        <img src={logo} alt="" className="h-8 w-8 shrink-0 object-contain" />
        {!isCollapsed && <span className="truncate text-base font-semibold tracking-tight text-[var(--ink)]">BodhyaAI</span>}
      </Link>
    </div>

    <button onClick={() => setIsCollapsed(!isCollapsed)} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="absolute -right-3 top-[4.5rem] grid h-6 w-6 place-items-center rounded-full border-2 border-[var(--sidebar-bg)] bg-[var(--surface)] text-[var(--ink-muted)] shadow-[var(--shadow-md)] transition hover:text-[var(--brand)]">
      {isCollapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
    </button>

    {!isCollapsed && <div className="px-3 pt-4"><label className="relative block"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" /><input value={query} onChange={event => setQuery(event.target.value)} aria-label="Search navigation" placeholder="Find a page" className="w-full rounded-lg border border-[var(--sidebar-border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]" /></label></div>}

    <nav aria-label="Dashboard navigation" className="flex-1 overflow-y-auto px-3 py-4">
      {filteredGroups.map(group => <section key={group.label} className="mb-5"><p className={`mb-1 px-3 text-[10px] font-semibold uppercase tracking-[.14em] text-[var(--ink-muted)] ${isCollapsed ? 'sr-only' : ''}`}>{group.label}</p>{group.items.map(item => { const Icon = item.icon; return <NavLink key={item.to} to={item.to} title={isCollapsed ? item.label : undefined} className={({ isActive }) => `group relative flex items-center rounded-lg px-3 py-2.5 text-sm transition ${isCollapsed ? 'justify-center' : 'gap-3'} ${isActive ? 'bg-[var(--sidebar-active)] font-semibold text-[var(--sidebar-text-active)] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-[var(--brand)]' : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--ink)]'}`}><Icon size={18} className="shrink-0" />{!isCollapsed && <span className="truncate">{item.label}</span>}{isCollapsed && <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--ink)] shadow-[var(--shadow-md)] group-hover:block">{item.label}</span>}</NavLink>; })}</section>)}
      {!filteredGroups.length && !isCollapsed && <div className="rounded-lg border border-dashed border-[var(--line)] p-4 text-center"><Compass className="mx-auto h-5 w-5 text-[var(--ink-muted)]" /><p className="mt-2 text-xs text-[var(--ink-muted)]">No workspace page found.</p></div>}
    </nav>

    <div className="border-t border-[var(--sidebar-border)] p-3"><div className="mb-2 flex gap-1"><NavLink to={alertsPath} aria-label="Notifications" className="grid h-9 flex-1 place-items-center rounded-lg text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--brand)]"><Bell size={17} /></NavLink><NavLink to={settingsPath} aria-label="Settings" className="grid h-9 flex-1 place-items-center rounded-lg text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--brand)]"><Settings size={17} /></NavLink></div><div className="relative"><button onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen} className={`flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-[var(--sidebar-hover)] ${isCollapsed ? 'justify-center' : ''}`}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-xs font-semibold text-[var(--accent-ink)]">{user.name?.charAt(0).toUpperCase()}</span>{!isCollapsed && <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-[var(--ink)]">{user.name}</span><span className="block truncate text-xs capitalize text-[var(--ink-muted)]">{user.role}</span></span>}{!isCollapsed && <ChevronDown size={15} className="text-[var(--ink-muted)]" />}</button>{profileOpen && <div className={`absolute bottom-full z-50 mb-2 min-w-52 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-1 shadow-[var(--shadow-lg)] ${isCollapsed ? 'left-12' : 'left-0 right-0'}`}><button onClick={() => navigate(settingsPath)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)]"><UserCircle size={16}/>Account settings</button><button onClick={signOut} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--danger)] hover:bg-[var(--danger-muted)]"><LogOut size={16}/>Sign out</button></div>}</div></div>
  </aside>;
}
export default Sidebar;
