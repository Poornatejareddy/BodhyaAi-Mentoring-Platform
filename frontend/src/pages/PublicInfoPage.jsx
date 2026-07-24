import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Star,
  Shield,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  MessageSquare,
  BrainCircuit,
  Users,
  Award,
  Cpu,
  ChevronDown,
  Sparkles,
  BookOpen,
  Clock,
  Activity,
  Database,
  Lock,
  HeartHandshake
} from 'lucide-react';

const pageData = {
  about: {
    eyebrow: 'About BodhyaAI',
    title: 'Transforming student support through understanding.',
    subtitle: 'We build technology that helps mentors understand student challenges, enabling timely and structured human support when it matters most.',
    icon: Award,
    stats: [
      { label: 'Institutions Partnered', value: '45+' },
      { label: 'Active Mentors', value: '1,200+' },
      { label: 'Students Supported', value: '50k+' },
      { label: 'Retention Increase', value: '14%' }
    ],
    features: [
      { title: 'Our Core Mission', desc: 'To provide academic success teams and mentors with clarify, context, and actionable signals, without reducing the student to a mere score.' },
      { title: 'The Human Connection', desc: 'AI doesn\'t replace mentors; it highlights who needs support and why, streamlining the preparation and follow-through.' },
      { title: 'Built with Ethics', desc: 'Designed alongside educators to ensure explainable indicators, data security, and student-focused privacy controls.' }
    ],
    testimonials: [
      { quote: "BodhyaAI helped our advisors identify at-risk students three weeks earlier than our previous system.", author: "Dr. Karen Vance", role: "Dean of Student Affairs, Western Tech" }
    ],
    faqs: [
      { q: "What does Bodhya mean?", a: "Bodhya originates from Sanskrit, meaning 'to be realized' or 'enlightened'—representing our goal of bringing clear visibility and understanding to student pathways." },
      { q: "Who is this platform built for?", a: "It is built for universities, colleges, student success managers, academic mentors, and the students they support." }
    ]
  },
  features: {
    eyebrow: 'Platform Features',
    title: 'Precision tools for institutional student success.',
    subtitle: 'A unified suite of explainable risk models, mentoring workflows, and interactive student planning interfaces.',
    icon: Cpu,
    features: [
      { title: 'Explainable AI Risk Engine', desc: 'Analyze attendance, performance, and survey responses to flags risks with clear, explainable academic and cognitive factors.' },
      { title: 'Structured Mentor Workspaces', desc: 'Give mentors a dedicated console with assignment histories, survey records, direct chats, and intervention trackers.' },
      { title: 'Student Growth Hub', desc: 'Self-guided cognitive profiles, personalized study planners, and a friendly AI advisor to answer student questions.' }
    ],
    comparison: {
      headers: ['Feature', 'BodhyaAI', 'Legacy LMS', 'Spreadsheets'],
      rows: [
        ['Early Risk Flagging', 'Proactive (First 3 weeks)', 'Reactive (Midterms/Finals)', 'Manual / Retrospective'],
        ['Explainable Factors', 'Yes (SHAP/XAI explanations)', 'No (Black box or none)', 'No (Subjective opinion)'],
        ['Integrated Messaging', 'Yes (Real-time socket chat)', 'Basic email alerts', 'Disjointed chats'],
        ['Student Growth Profile', 'Yes (Cognitive & study plans)', 'No', 'No']
      ]
    },
    faqs: [
      { q: "How does the early warning risk engine work?", a: "It analyzes historical performance, attendance patterns, and onboarding cognitive surveys using an XGBoost model. It highlights specific risk contributors like study habits or engagement levels." },
      { q: "Is it difficult to integrate with existing LMS?", a: "No, BodhyaAI supports standard integrations and bulk uploads to quickly sync roster and class data." }
    ]
  },
  'why-bodhyai': {
    eyebrow: 'Why BodhyaAI',
    title: 'The human-first alternative to black-box analytics.',
    subtitle: 'Most analytics platforms flag students as numbers. BodhyaAI provides context, explainable indicators, and clear paths of action.',
    icon: Sparkles,
    features: [
      { title: 'Actionable Insights', desc: 'Instead of high/low scores, see precisely which areas (e.g., test anxiety, time management) are driving academic stress.' },
      { title: 'Structured Intervention', desc: 'Ensure no flagged student falls through the cracks with automated assignment queues and status tracking.' },
      { title: 'Unparalleled Engagement', desc: 'Empower students to explore their own learning styles rather than feeling labeled or monitored.' }
    ],
    testimonials: [
      { quote: "Our mentors love the clarity. They no longer waste time guessing who needs help or what to say to them.", author: "Prof. Alan Mercer", role: "Mentorship Director, SV University" }
    ],
    faqs: [
      { q: "How does BodhyaAI protect student dignity?", a: "By giving students agency. Students view their cognitive profiles and use the AI advisor to build confidence, reframing mentoring as support rather than correction." }
    ]
  },
  'how-it-works': {
    eyebrow: 'How It Works',
    title: 'Three simple steps to coordinate student success.',
    subtitle: 'From a first early signal to a completed plan, see how BodhyaAI keeps academic teams and students in perfect sync.',
    icon: BookOpen,
    features: [
      { title: '1. Onboard & Survey', desc: 'Students complete a quick, research-backed cognitive and learning styles survey during onboarding.' },
      { title: '2. Explainable Analytics', desc: 'Our engine identifies students who may face challenges, attributing risks to specific factors (like time allocation or anxiety).' },
      { title: '3. Coordinate Support', desc: 'Mentors receive flags, review the context, assign tasks, and maintain real-time chat support to ensure progress.' }
    ],
    faqs: [
      { q: "How long does the student onboarding survey take?", a: "Approximately 8-10 minutes. It covers study habits, motivation, study strategies, and peer support indicators." }
    ]
  },
  solutions: {
    eyebrow: 'Solutions Overview',
    title: 'Coordinated success workflows for every stakeholder.',
    subtitle: 'Tailored consoles and views that bring students, mentors, and administrators into one productive circle.',
    icon: HeartHandshake,
    features: [
      { title: 'For Students', desc: 'Take charge of your academic journey. Generate personalized study schedules, explore cognitive strengths, and request support.' },
      { title: 'For Mentors', desc: 'Maximize your coaching impact. Monitor assigned student flags, review historical survey changes, and chat in real-time.' },
      { title: 'For Administrators', desc: 'Institutional control. Manage user accounts, customize alert thresholds, inspect activity logs, and track overall success rates.' }
    ],
    comparison: {
      headers: ['Benefit', 'Student', 'Mentor', 'Administrator'],
      rows: [
        ['Core Goal', 'Build confidence & study habits', 'Save time, scale quality guidance', 'Increase student retention & compliance'],
        ['Key Tools', 'Study Planner, AI Chat, Profile', 'Mentee lists, risk explainers, chat', 'User management, activity logs, dashboards'],
        ['Primary View', 'Simple, encouraging dashboard', 'Action-oriented flag console', 'High-level analytics & audit trials']
      ]
    }
  },
  students: {
    eyebrow: 'For Students',
    title: 'Understand your learning style. Own your success.',
    subtitle: 'Access the resources and guidance you need to navigate challenging courses and build lasting study habits.',
    icon: Users,
    features: [
      { title: 'Cognitive Learning Profile', desc: 'Discover how you process information, manage stress, and structure study sessions.' },
      { title: 'Dynamic Study Planner', desc: 'Let our planner break down complex subjects into bite-sized, weekly task schedules tailored to your routine.' },
      { title: '24/7 AI Academic Advisor', desc: 'Stuck or anxious? Ask the AI advisor for tips on exam preparation, focus techniques, or writing structures.' }
    ],
    testimonials: [
      { quote: "The study plan generator changed how I study. I stopped cramming at the last minute and my grades went up.", author: "Sarah Jenkins", role: "Computer Science Sophomore" }
    ]
  },
  mentors: {
    eyebrow: 'For Mentors',
    title: 'Spend less time digging. More time mentoring.',
    subtitle: 'Stop searching through spreadsheets. Get clear, structured insights that tell you who to contact, why, and what to discuss.',
    icon: HeartHandshake,
    features: [
      { title: 'Unified Mentee Roster', desc: 'See all assigned students at a glance, categorized by risk urgency and recent activities.' },
      { title: 'Explainable Warning Flags', desc: 'Review detailed SHAP impact charts explaining the exact academic and behavioral factors driving a student\'s risk status.' },
      { title: 'Integrated Chat & Notes', desc: 'Send real-time follow-ups directly inside the platform. Log private session notes to maintain continuity.' }
    ]
  },
  universities: {
    eyebrow: 'For Universities',
    title: 'Enterprise retention software built for scale.',
    subtitle: 'Equip your institution with the analytics and coordination tools required to support hundreds of mentors and thousands of learners.',
    icon: Shield,
    features: [
      { title: 'Retention Uplift', desc: 'Identify early-term signs of disengagement to deploy support before midterms, directly improving retention rates.' },
      { title: 'Institutional Compliance', desc: 'Robust auditing, full activity logging, and strict role-based access to preserve student records and security.' },
      { title: 'Scalable Architecture', desc: 'Designed to host multiple departments, manage custom rules, and support high concurrent users with low latency.' }
    ],
    comparison: {
      headers: ['Metric', 'With BodhyaAI', 'Without BodhyaAI'],
      rows: [
        ['Avg. Response Time to Risk', '24 - 48 Hours', '3 - 5 Weeks'],
        ['Mentor Prep Time', '5 Mins per student', '45 Mins per student'],
        ['Student Satisfaction', '89%', '62%'],
        ['Institutional Retention', '+12.4% avg. increase', 'Flat or declining']
      ]
    }
  },
  'ai-technology': {
    eyebrow: 'AI Technology',
    title: 'Transparent machine learning you can audit.',
    subtitle: 'No black boxes. We combine advanced predictive modeling with explainable AI techniques so you always understand why a flag was raised.',
    icon: Cpu,
    features: [
      { title: 'XGBoost Risk Classifiers', desc: 'Trained on historical academic datasets to identify multivariate indicators that suggest potential challenges.' },
      { title: 'SHAP Feature Explanation', desc: 'We calculate game-theoretic feature contributions for every model prediction, exposing them as clear risk factors.' },
      { title: 'Private LLM Reasoning', desc: 'Our AI Academic Advisor operates under strictly bounded contexts to prevent hallucinations and secure dialogue data.' }
    ],
    testimonials: [
      { quote: "Having explainable factors meant our mentors could trust the AI, because they could see the exact rationale behind every alarm.", author: "Dr. Marcus Vance", role: "CIO, Horizon College" }
    ]
  },
  research: {
    eyebrow: 'Our Research',
    title: 'Grounded in cognitive and educational science.',
    subtitle: 'Our survey indicators and risk variables are developed from peer-reviewed studies on student self-efficacy, test anxiety, and learning strategies.',
    icon: BrainCircuit,
    features: [
      { title: 'Self-Efficacy Metrics', desc: 'Assessing students\' belief in their ability to succeed, which research shows is a prime predictor of college persistence.' },
      { title: 'Resource Management', desc: 'Evaluating study environments, peer support networks, and time allocation habits to locate operational hurdles.' },
      { title: 'Anxiety & Motivation', desc: 'Distinguishing between positive extrinsic motivators and high-stress test anxiety factors that degrade performance.' }
    ]
  },
  pricing: {
    eyebrow: 'Pricing & Tiers',
    title: 'Simple, predictable plans for institutions of any size.',
    subtitle: 'From single-department pilots to university-wide deployments. Start building a proactive support workflow today.',
    icon: Award,
    comparison: {
      headers: ['Tier', 'Standard Pilot', 'Enterprise Campus', 'University Network'],
      rows: [
        ['Target Audience', 'Single department or pilot group', 'Full college or campus site', 'Multi-campus university systems'],
        ['Max Active Students', 'Up to 500 students', 'Up to 5,000 students', 'Unlimited'],
        ['Included Mentors', 'Up to 25 mentors', 'Up to 250 mentors', 'Unlimited'],
        ['Integration Support', 'Self-service CSV upload', 'Full LMS API integration', 'Dedicated solutions engineer'],
        ['Price', '$1,900 / year', '$7,500 / year', 'Contact for quote']
      ]
    }
  },
  faq: {
    eyebrow: 'Common Questions',
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about the BodhyaAI platform, technology, and implementation.',
    icon: HelpCircle,
    faqs: [
      { q: "Is student data secure?", a: "Absolutely. BodhyaAI uses industry-standard JWT sessions, database-level encryption, role-based controls, and audits every data read. We do not sell or share student data." },
      { q: "Can we customize the survey questions?", a: "Yes, institution administrators can coordinate with our support team to adjust the onboarding survey parameters and customize risk thresholds." },
      { q: "How do mentors communicate with students?", a: "Mentors can message students using our integrated real-time WebSocket chat. Students receive immediate in-app notifications." },
      { q: "Do students see their own risk status?", a: "No, students do not see a raw 'Risk Alert'. Instead, they see their cognitive profile and suggested resources. Only mentors and administrators see risk categories." }
    ]
  },
  contact: {
    eyebrow: 'Contact Us',
    title: 'Let\'s start a conversation.',
    subtitle: 'Have questions about onboarding, piloting, or academic features? Our team is here to help you design the perfect mentoring layout.',
    icon: Mail,
    contactInfo: [
      { icon: Mail, label: 'Email', value: 'support@bodhyaai.edu' },
      { icon: Phone, label: 'Phone', value: '+1 (555) 019-2834' },
      { icon: MapPin, label: 'Headquarters', value: 'San Francisco, CA' }
    ]
  },
  privacy: {
    eyebrow: 'Privacy Policy',
    title: 'How we handle and protect student data.',
    subtitle: 'We are committed to absolute transparency regarding data collection, processing, and role-based access.',
    icon: Lock,
    features: [
      { title: 'Data Minimization', desc: 'We only collect records directly required to predict academic challenges, such as class logins, grades, and survey answers.' },
      { title: 'Strict Role Guards', desc: 'Mentor details are hidden from other students; sensitive student notes are locked to the assigned mentor and admin logs.' },
      { title: 'Right to Erasure', desc: 'Institutions can request full deletion of student rosters, survey entries, and message history at any time.' }
    ]
  },
  terms: {
    eyebrow: 'Terms of Service',
    title: 'Fair terms for institutions, mentors, and students.',
    subtitle: 'Our terms define safe platform usage, intellectual property, and institutional responsibilities.',
    icon: Shield,
    features: [
      { title: 'Account Integrity', desc: 'Users must maintain secure credentials. Shared or automated accounts without authorization are strictly prohibited.' },
      { title: 'Responsible AI Usage', desc: 'Risk flags are suggestions to support mentors, not definitive statements of student failure or automatic grading.' },
      { title: 'Service Level Agreement', desc: 'We target 99.9% uptime for core API endpoints and socket servers to ensure constant connectivity.' }
    ]
  },
  support: {
    eyebrow: 'Support Center',
    title: 'We are here to help your team succeed.',
    subtitle: 'Access implementation manuals, mentor onboarding guides, and support ticketing details.',
    icon: HelpCircle,
    features: [
      { title: 'Mentor Training Videos', desc: 'Short, 3-minute tutorials showing mentors how to review SHAP explanations and manage assignments.' },
      { title: 'Admin Setup Guide', desc: 'Technical documentation for syncing roster CSVs and setting up custom webhook alerts.' },
      { title: 'Ticketing Portal', desc: 'Submit a ticket directly from your settings dashboard for 24-hour response on technical queries.' }
    ]
  }
};

function PublicInfoPage({ type = 'about' }) {
  const content = pageData[type] || pageData.about;
  const HeroIcon = content.icon || BrainCircuit;
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="app-canvas overflow-hidden animate-fade-in">
      {/* Hero Section */}
      <section className="relative border-b border-[var(--line)] py-20 lg:py-28">
        <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[var(--surface-muted)]" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
                {content.eyebrow}
              </p>
              <h1 className="text-display text-[var(--ink)] leading-tight">
                {content.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[var(--ink-secondary)]">
                {content.subtitle}
              </p>
              {type !== 'contact' && (
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link to="/register" className="btn btn-primary text-sm font-semibold">
                    Get started <ArrowRight size={16} />
                  </Link>
                  <Link to="/contact" className="btn btn-outline text-sm font-semibold">
                    Speak with an expert
                  </Link>
                </div>
              )}
            </div>

            <div className="app-card relative p-8 border border-[var(--line)] bg-[var(--surface)] shadow-md hover:translate-y-[-2px] duration-300">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-12 h-12 rounded-full bg-[var(--brand-light)] flex items-center justify-center text-[var(--brand)] shadow-sm">
                <HeroIcon size={20} />
              </div>
              <h3 className="text-sm font-semibold text-[var(--ink)] mb-3">Enterprise Grade Success</h3>
              <p className="text-xs leading-relaxed text-[var(--ink-secondary)] mb-4">
                BodhyaAI coordinates all student risk profiles, mentoring notes, and cognitive reports into an auditable, high-performance workspace.
              </p>
              <div className="flex items-center gap-1 text-[var(--brand)] text-xs font-semibold hover:underline">
                <Link to="/features" className="flex items-center gap-1">Learn about our model <ArrowRight size={12} /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter (If About Page) */}
      {content.stats && (
        <section className="border-b border-[var(--line)] bg-[var(--surface-muted)] py-12">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {content.stats.map((stat, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-3xl sm:text-4xl font-bold text-[var(--brand)]">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wider text-[var(--ink-muted)] font-semibold">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Feature Grid / Core Info Points */}
      {content.features && (
        <section className="py-20 border-b border-[var(--line)] bg-[var(--surface)]">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)]">Core Values & Workflows</h2>
              <p className="text-sm text-[var(--ink-muted)] mt-3">Designed by design system architects, developers, and advisors.</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {content.features.map((feat, index) => (
                <div key={index} className="app-card border border-[var(--line)] p-6 hover:translate-y-[-2px]">
                  <span className="text-xs font-bold text-[var(--brand)] bg-[var(--brand-light)] px-2.5 py-1 rounded-full">
                    0{index + 1}
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-[var(--ink)]">{feat.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--ink-muted)]">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Custom Info Section */}
      {type === 'contact' && content.contactInfo && (
        <section className="py-16 border-b border-[var(--line)] bg-[var(--surface)]">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="space-y-8">
                <h3 className="text-xl font-semibold text-[var(--ink)]">Direct Contact Directory</h3>
                <div className="grid gap-6">
                  {content.contactInfo.map((info, idx) => {
                    const InfoIcon = info.icon;
                    return (
                      <div key={idx} className="flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-lg bg-[var(--brand-light)] flex items-center justify-center text-[var(--brand)] shrink-0">
                          <InfoIcon size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-[var(--ink-muted)]">{info.label}</p>
                          <p className="text-sm font-medium text-[var(--ink)]">{info.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="app-card p-8 border border-[var(--line)] bg-[var(--surface)]">
                <h3 className="text-base font-semibold text-[var(--ink)] mb-4">Send a Direct Message</h3>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">First Name</label>
                      <input type="text" className="w-full text-xs p-2.5 border border-[var(--line)] rounded-lg bg-[var(--canvas)] text-[var(--ink)] focus:outline-[var(--brand)]" placeholder="Alex" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">Email Address</label>
                      <input type="email" className="w-full text-xs p-2.5 border border-[var(--line)] rounded-lg bg-[var(--canvas)] text-[var(--ink)] focus:outline-[var(--brand)]" placeholder="alex@univ.edu" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">Institution</label>
                    <input type="text" className="w-full text-xs p-2.5 border border-[var(--line)] rounded-lg bg-[var(--canvas)] text-[var(--ink)] focus:outline-[var(--brand)]" placeholder="State University" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">Message</label>
                    <textarea rows="4" className="w-full text-xs p-2.5 border border-[var(--line)] rounded-lg bg-[var(--canvas)] text-[var(--ink)] focus:outline-[var(--brand)]" placeholder="How can we help you coordinate mentoring?"></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary w-full text-xs font-semibold mt-2">Send Message</button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Comparison / Pricing Matrix */}
      {content.comparison && (
        <section className="py-20 border-b border-[var(--line)] bg-[var(--surface-hover)]/30">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">Performance Comparison Matrix</h2>
              <p className="text-xs text-[var(--ink-muted)] mt-2">See how BodhyaAI outmatches spreadsheets and legacy student advisors.</p>
            </div>
            
            <div className="table-container shadow-md">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    {content.comparison.headers.map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {content.comparison.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} className={j === 0 ? 'font-semibold text-[var(--ink)]' : ''}>
                          {cell === 'Yes' ? (
                            <span className="inline-flex items-center gap-1 text-[var(--success)] font-semibold text-xs">
                              <Check size={14} /> Yes
                            </span>
                          ) : cell === 'No' ? (
                            <span className="text-[var(--danger)] font-semibold text-xs">
                              ✕ No
                            </span>
                          ) : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Block */}
      {content.testimonials && (
        <section className="py-20 border-b border-[var(--line)] bg-[var(--surface)]">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="flex justify-center gap-1 var-warning">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} fill="currentColor" />
                ))}
              </div>
              {content.testimonials.map((t, idx) => (
                <div key={idx} className="space-y-4">
                  <p className="text-lg sm:text-xl font-medium text-[var(--ink)] leading-relaxed italic">
                    "{t.quote}"
                  </p>
                  <div>
                    <p className="text-xs font-semibold text-[var(--ink)]">{t.author}</p>
                    <p className="text-[10px] text-[var(--ink-muted)] uppercase tracking-wider">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Accordion Section */}
      {content.faqs && (
        <section className="py-20 bg-[var(--surface-muted)]">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">Frequently Asked Questions</h2>
              <p className="text-xs text-[var(--ink-muted)] mt-2">Get quick answers to operational and security queries.</p>
            </div>
            
            <div className="space-y-3">
              {content.faqs.map((faq, idx) => {
                const isExpanded = openFaq === idx;
                return (
                  <div key={idx} className="border border-[var(--line)] bg-[var(--surface)] rounded-xl overflow-hidden transition-all duration-200">
                    <button
                      onClick={() => setOpenFaq(isExpanded ? null : idx)}
                      className="flex items-center justify-between w-full p-5 text-left text-sm font-semibold text-[var(--ink)] hover:bg-[var(--surface-hover)] transition cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown size={16} className={`text-[var(--ink-muted)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="p-5 border-t border-[var(--line)] text-xs leading-relaxed text-[var(--ink-secondary)] bg-[var(--surface-hover)]/30 animate-fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action (CTA) */}
      <section className="py-16 bg-[var(--surface-muted)] text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 text-center space-y-6">
          <Sparkles className="mx-auto h-7 w-7 text-[var(--brand)]" />
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Deploy a student success workspace today.</h2>
          <p className="mx-auto max-w-lg text-xs sm:text-sm text-[var(--ink)] leading-relaxed">
            Protect your institution's retention outcomes and give mentors the tools they need to make every conversation impact-driven.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/register" className="btn btn-primary bg-[var(--brand)] hover:bg-[var(--brand)] text-xs font-semibold px-6 py-2.5">
              Create a free account
            </Link>
            <Link to="/contact" className="btn btn-outline border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surface)] text-xs font-semibold px-6 py-2.5">
              Request a walkthrough
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PublicInfoPage;
