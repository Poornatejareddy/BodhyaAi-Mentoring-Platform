import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BrainCircuit,
  ChartNoAxesCombined,
  ShieldCheck,
  UsersRound,
  Sparkles,
  HeartHandshake,
  ChevronDown,
  CheckCircle
} from 'lucide-react';

const homeFeatures = [
  { icon: ChartNoAxesCombined, title: 'Proactive early signals', text: 'Synthesize attendance, grade reports, and student surveys into an explainable success view.' },
  { icon: UsersRound, title: 'Structured mentor workflows', text: 'Coordinate assigned mentees, set tasks, and monitor goals in a dedicated workspace.' },
  { icon: BrainCircuit, title: 'Student self-coaching hub', text: 'Empower learners with cognitive learning strategies, study plan generators, and AI advice.' },
];

const steps = [
  { num: '01', title: 'Collect Onboarding Insights', text: 'Students complete research-validated surveys assessing motivation, test anxiety, and learning preferences.' },
  { num: '02', title: 'Generate Explainable Risk Warnings', desc: 'Predictive intelligence flags academic challenges early, listing specific driving factors.' },
  { num: '03', title: 'Coordinate Mentoring Support', text: 'Mentors receive the flags and coordinate with students directly via integrated chat, plans, and surveys.' }
];

const faqs = [
  { q: "How is BodhyaAI different from legacy LMS early warning systems?", a: "Legacy systems look purely at past grades and attendance, flagging students when it's often too late. BodhyaAI evaluates cognitive onboarding indicators (like study habits, motivation, and test anxiety) using explainable models to raise proactive alerts in the first three weeks." },
  { q: "Does the platform protect student privacy?", a: "Yes, security is a core pillar. We use strict role guards, JWT authentication, fully logged activity streams, and keep sensitive mentoring session notes private from third parties." },
  { q: "Is training required for mentors?", a: "No training is required. The mentor workspace is intuitive, providing self-explanatory SHAP graphs that explain risk factors directly and suggest helpful next actions." }
];

function HomePage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="app-canvas overflow-hidden animate-fade-in">
      {/* Hero Section */}
      <section className="relative border-b border-[var(--line)] py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[var(--surface-muted)]" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/20 bg-[var(--brand-light)] px-3 py-1.5 text-xs font-semibold text-[var(--brand)]">
              <Sparkles size={13} className="animate-pulse" /> Student success, made proactive
            </div>
            
            <h1 className="text-display text-[var(--ink)] tracking-[-0.04em] leading-none">
              Better signals. <span className="text-[var(--brand)] font-bold">Stronger</span> student retention.
            </h1>
            
            <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-[var(--ink-secondary)]">
              BodhyaAI coordinates student onboarding metrics, explainable risk warnings, and mentor action boards into a unified enterprise platform.
            </p>
            
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/register" className="btn btn-primary text-sm font-semibold px-6 py-3">
                Get started free <ArrowRight size={16} />
              </Link>
              <Link to="/features" className="btn btn-outline text-sm font-semibold px-6 py-3 bg-[var(--surface)]">
                Explore features
              </Link>
            </div>
          </div>

          {/* Interactive Statistics Mockup Panel */}
          <div className="mx-auto mt-16 max-w-4xl rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 shadow-lg">
            <div className="rounded-xl bg-[var(--canvas)] p-5 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] pb-5 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">
                    BodhyaAI Success Console
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-[var(--ink)]">
                    Academic Support Analytics
                  </h2>
                </div>
                <span className="self-start sm:self-auto rounded-full bg-[var(--success-muted)] px-3 py-1 text-xs font-semibold text-[var(--success)] border border-[var(--success)]">
                  Live System Metrics
                </span>
              </div>
              
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  ['Students Monitored', '1,248', 'Across 3 departments'],
                  ['Intervention Efficiency', '86%', 'Avg. action time < 24h'],
                  ['Resolved Risk Flags', '92 Cases', 'In the current semester']
                ].map(([label, value, sub]) => (
                  <div key={label} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 hover:border-[var(--brand)] transition duration-200">
                    <p className="text-xs text-[var(--ink-muted)] font-medium">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-[var(--ink)]">{value}</p>
                    <p className="mt-1 text-[10px] text-[var(--ink-muted)]">{sub}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-[var(--ink-secondary)]">Active study goals on track</span>
                  <span className="text-xs font-bold text-[var(--brand)]">74% Complete</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--canvas)] overflow-hidden">
                  <div className="h-full w-[74%] rounded-full bg-[var(--brand)] transition-all" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature section */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
              Built for universities
            </p>
            <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
              Everything your academic success team needs.
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed">
              Equip advisors, students, and coordinators with coordinates of success, reducing support friction and boosting persistence rates.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-3">
            {homeFeatures.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <article key={i} className="app-card border border-[var(--line)] bg-[var(--surface)] p-5 hover:translate-y-[-2px]">
                  <div className="w-9 h-9 rounded-lg bg-[var(--brand-light)] flex items-center justify-center text-[var(--brand)]">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-5 text-sm font-semibold text-[var(--ink)]">{feat.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--ink-muted)]">{feat.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
              Support Pipeline
            </p>
            <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
              A structured, accountable support cycle.
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed">
              Maintain visibility from the initial onboarding diagnostics to the final study schedule milestone, keeping students at the center of the outcome.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <CheckCircle size={16} className="text-[var(--success)]" />
              <span className="text-xs font-medium text-[var(--ink-secondary)]">WCAG AA Compliant Interfaces</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <CheckCircle size={16} className="text-[var(--success)]" />
              <span className="text-xs font-medium text-[var(--ink-secondary)]">Real-time alerts via WebSockets</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {steps.map((st) => (
              <div key={st.num} className="flex gap-4 p-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] hover:border-[var(--brand)] transition">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--brand-light)] text-xs font-bold text-[var(--brand)]">
                  {st.num}
                </span>
                <div>
                  <h3 className="text-xs font-bold text-[var(--ink)]">{st.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--ink-muted)]">
                    {st.text || st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-b border-[var(--line)]">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Testimonial</p>
          <p className="text-lg sm:text-xl font-medium text-[var(--ink)] leading-relaxed italic">
            "We were able to lower student support preparation times by 80% and assign mentors immediately to flagged cases inside our department."
          </p>
          <div>
            <p className="text-xs font-semibold text-[var(--ink)]">Prof. Helen Martinez</p>
            <p className="text-[10px] text-[var(--ink-muted)] uppercase tracking-wider">Dean of Computing, Central State University</p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 bg-[var(--surface-muted)]">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)]">Frequently Asked Questions</h2>
            <p className="text-xs text-[var(--ink-muted)] mt-2">Find answers to common platform queries.</p>
          </div>
          
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isExpanded = openFaq === idx;
              return (
                <div key={idx} className="border border-[var(--line)] bg-[var(--surface)] rounded-xl overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaq(isExpanded ? null : idx)}
                    className="flex items-center justify-between w-full p-4 text-left text-sm font-semibold text-[var(--ink)] hover:bg-[var(--surface-hover)] transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={16} className={`text-[var(--ink-muted)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {isExpanded && (
                    <div className="p-4 border-t border-[var(--line)] text-xs leading-relaxed text-[var(--ink-secondary)] bg-[var(--surface-hover)]/30 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust, Security, Privacy Panel */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-6 rounded-2xl bg-[var(--surface-muted)] p-8 text-[var(--ink)] md:grid-cols-[1fr_auto] md:items-center md:p-12">
          <div>
            <ShieldCheck className="h-7 w-7 text-[var(--brand)]" />
            <h2 className="mt-4 text-xl sm:text-2xl font-semibold">Security and FERPA compliance at the core.</h2>
            <p className="mt-2 text-xs sm:text-sm text-[var(--ink)] leading-relaxed max-w-3xl">
              BodhyaAI enforces strict JWT sessions, access token refreshes, parameter sanitization, and audit trails to keep student datasets secure.
            </p>
          </div>
          <Link to="/security" className="btn btn-outline border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surface)] text-xs font-semibold px-5 py-2.5 shrink-0">
            Read Security Policy
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
