import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, className = '' }) => {
  const Trend = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendClass = trend > 0 ? 'text-[var(--success)]' : trend < 0 ? 'text-[var(--danger)]' : 'app-muted';
  return <div className={`app-card p-5 transition ${className}`}><div className="flex items-start justify-between"><div><p className="text-sm font-medium app-muted">{title}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">{value}</p></div>{Icon&&<span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]"><Icon size={20}/></span>}</div>{trend !== undefined?<div className={`mt-4 flex items-center gap-1.5 text-xs font-medium ${trendClass}`}><Trend size={14}/><span>{trend > 0 ? '+' : ''}{trend}%</span><span className="app-muted">vs last month</span></div>:subtitle&&<p className="mt-4 text-xs app-muted">{subtitle}</p>}</div>;
};
export default StatCard;
