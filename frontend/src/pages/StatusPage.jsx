import React from 'react';
import { Link, useRouteError } from 'react-router-dom';

function StatusPage({ code = '404', title = 'Page not found', message = 'The page you are looking for is unavailable or has moved.' }) {
  const error = useRouteError();
  const resolvedCode = error?.status || code;
  return <main className="app-canvas grid min-h-screen place-items-center px-5"><div className="max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow-md)]"><p className="text-sm font-semibold tracking-[.18em] text-[var(--brand)]">ERROR {resolvedCode}</p><h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--ink)]">{title}</h1><p className="mt-4 app-muted">{message}</p><Link to="/" className="mt-8 inline-flex rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-ink)] hover:bg-[var(--brand-hover)]">Return to BodhyaAI</Link></div></main>;
}
export default StatusPage;
