import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Salad, Dumbbell, ShieldCheck, LineChart, Trophy, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

const APK_DOWNLOAD_URL = 'https://expo.dev/accounts/arnyinson/projects/NutriFit/builds/0aeae059-0b94-4edf-a1e8-7ecc77c88a6d';

const SCREENS = [
  { src: '/dashboard.jpg', label: 'Dashboard' },
  { src: '/meal.jpg', label: 'Meal Plan' },
  { src: '/workout.jpg', label: 'Workout' },
  { src: '/progress.jpg', label: 'Progress' },
  { src: '/achievements.jpg', label: 'Achievements' },
  { src: '/profile.jpg', label: 'Profile' },
  { src: '/calendar.jpg', label: 'Calendar' },
];

const FACTS = [
  { label: 'Meal Recommendations', value: 'AI-Personalized', note: 'Content-Based Filtering, matched to your calorie & macro targets' },
  { label: 'Workout Plans', value: 'Auto-Generated', note: 'Rule-based, adjusted to your experience level and equipment' },
  { label: 'Allergen Filtering', value: '10 Types Tracked', note: 'Meals excluded or substituted automatically' },
  { label: 'Progress Adjustment', value: 'Weekly & Adaptive', note: 'Calorie targets shift based on your real results' },
];

const FEATURES = [
  {
    Icon: Salad,
    title: 'Personalized Meal Plans',
    body: 'Every meal is chosen to match your calorie and macronutrient targets, calculated from your own height, weight, age, and activity level.',
  },
  {
    Icon: Dumbbell,
    title: 'Structured Workouts',
    body: 'A full weekly training split, generated around the equipment you actually have and the experience level you\u2019re at right now.',
  },
  {
    Icon: ShieldCheck,
    title: 'Allergen-Aware',
    body: 'Declare what you\u2019re allergic to once. NutriFit quietly substitutes or excludes affected meals from every plan it builds.',
  },
  {
    Icon: LineChart,
    title: 'Progress That Adapts',
    body: 'Log your weight weekly and the app nudges your calorie target up or down to keep you on pace \u2014 no manual recalculating.',
  },
  {
    Icon: Trophy,
    title: 'Achievements & Sharing',
    body: 'Unlock milestones as you stay consistent, and share your progress or a single achievement as a real image, not just text.',
  },
];

export default function AppDownload() {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);

  // Duplicate the screenshot list once so the CSS marquee can loop seamlessly
  const marqueeScreens = [...SCREENS, ...SCREENS];

  useEffect(() => {
    document.title = 'NutriFit \u2014 Get the App';
  }, []);

  return (
    <div style={{ background: 'var(--nf-paper)', color: 'var(--nf-ink)' }} className="min-h-screen">
      <style>{`
        :root {
          --nf-ink: #16241C;
          --nf-paper: #F5F6F3;
          --nf-green: #4CAF50;
          --nf-green-dark: #2E7D32;
          --nf-amber: #FF9800;
          --nf-line: #D6DED7;
        }
        .nf-display {
          font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
        }
        .nf-body {
          font-family: 'Inter', system-ui, sans-serif;
        }
        @keyframes nf-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .nf-marquee-track {
          animation: nf-marquee 38s linear infinite;
        }
        .nf-marquee-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .nf-marquee-track { animation: none; }
        }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* ============ HEADER ============ */}
      <header className="max-w-6xl mx-auto px-6 md:px-10 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo size={32} />
          <span className="nf-display text-xl font-semibold" style={{ color: 'var(--nf-ink)' }}>
            NutriFit
          </span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="nf-body text-sm font-medium px-4 py-2 rounded-full border transition-colors hover:bg-white"
          style={{ borderColor: 'var(--nf-line)', color: 'var(--nf-ink)' }}
        >
          Admin Login
        </button>
      </header>

      {/* ============ HERO ============ */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-10 pb-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="nf-body text-sm font-medium mb-4" style={{ color: 'var(--nf-green-dark)' }}>
            For San Jose Del Monte, Bulacan
          </p>
          <h1 className="nf-display text-4xl md:text-5xl font-semibold leading-[1.08] mb-5" style={{ color: 'var(--nf-ink)' }}>
            Your meals and workouts,
            <br />
            planned around your body.
          </h1>
          <p className="nf-body text-base leading-relaxed mb-8 max-w-md" style={{ color: '#3F4B43' }}>
            NutriFit builds a personalized meal and workout plan from your own numbers, filters
            out anything you're allergic to, and adjusts itself as your progress comes in.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={APK_DOWNLOAD_URL}
              className="nf-body inline-flex items-center gap-2 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
              style={{ background: 'var(--nf-green)' }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'var(--nf-green-dark)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'var(--nf-green)')}
            >
              Get the App
              <ArrowRight size={18} />
            </a>
            <span className="nf-body text-sm" style={{ color: '#6B7A70' }}>
              Android \u00b7 Free \u00b7 No account needed to browse
            </span>
          </div>
        </div>

        {/* Featured phone mockup */}
        <div className="flex justify-center md:justify-end">
          <PhoneFrame src="/dashboard.jpg" alt="NutriFit dashboard" featured />
        </div>
      </section>

      {/* ============ SYSTEM FACTS PANEL ============ */}
      <section className="max-w-3xl mx-auto px-6 md:px-10 pb-16">
        <div className="bg-white" style={{ border: '3px solid var(--nf-ink)', borderRadius: '4px' }}>
          <div className="px-6 pt-5 pb-3" style={{ borderBottom: '8px solid var(--nf-ink)' }}>
            <h2 className="nf-display text-2xl font-bold" style={{ color: 'var(--nf-ink)' }}>
              System Facts
            </h2>
            <p className="nf-body text-xs" style={{ color: '#6B7A70' }}>
              What's actually running under the hood
            </p>
          </div>
          {FACTS.map((fact, i) => (
            <div
              key={fact.label}
              className="px-6 py-4 flex items-baseline justify-between gap-6"
              style={{ borderBottom: i < FACTS.length - 1 ? '1px solid var(--nf-line)' : 'none' }}
            >
              <div>
                <p className="nf-body text-sm font-semibold" style={{ color: 'var(--nf-ink)' }}>
                  {fact.label}
                </p>
                <p className="nf-body text-xs mt-0.5" style={{ color: '#6B7A70' }}>
                  {fact.note}
                </p>
              </div>
              <span className="nf-display text-lg font-semibold whitespace-nowrap" style={{ color: 'var(--nf-green-dark)' }}>
                {fact.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ SCREENSHOT MARQUEE ============ */}
      <section className="pb-16 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 md:px-10 mb-6">
          <h2 className="nf-display text-2xl font-semibold" style={{ color: 'var(--nf-ink)' }}>
            See it in action
          </h2>
        </div>
        <div className="relative">
          <div ref={trackRef} className="nf-marquee-track flex gap-6 w-max">
            {marqueeScreens.map((screen, i) => (
              <PhoneFrame key={`${screen.label}-${i}`} src={screen.src} alt={screen.label} caption={screen.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="max-w-3xl mx-auto px-6 md:px-10 pb-20">
        <h2 className="nf-display text-2xl font-semibold mb-6" style={{ color: 'var(--nf-ink)' }}>
          What's inside
        </h2>
        <div>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="py-6 flex gap-5"
              style={{ borderBottom: i < FEATURES.length - 1 ? '1px solid var(--nf-line)' : 'none' }}
            >
              <div
                className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: '#E8F5E9' }}
              >
                <f.Icon size={20} style={{ color: 'var(--nf-green-dark)' }} />
              </div>
              <div>
                <h3 className="nf-body text-base font-semibold mb-1" style={{ color: 'var(--nf-ink)' }}>
                  {f.title}
                </h3>
                <p className="nf-body text-sm leading-relaxed" style={{ color: '#556059' }}>
                  {f.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-16">
        <div
          className="rounded-2xl px-8 py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: 'var(--nf-ink)' }}
        >
          <div>
            <h2 className="nf-display text-2xl font-semibold text-white mb-1">Ready to start?</h2>
            <p className="nf-body text-sm" style={{ color: '#B7C4BB' }}>
              Install NutriFit and set up your profile in under two minutes.
            </p>
          </div>
          <a
            href={APK_DOWNLOAD_URL}
            className="nf-body inline-flex items-center gap-2 text-white font-semibold px-6 py-3.5 rounded-xl whitespace-nowrap"
            style={{ background: 'var(--nf-green)' }}
          >
            Get the App
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="max-w-6xl mx-auto px-6 md:px-10 pb-10 flex items-center justify-between">
        <p className="nf-body text-xs" style={{ color: '#8A968E' }}>
          \u00a9 2026 NutriFit
        </p>
        <button
          onClick={() => navigate('/login')}
          className="nf-body text-xs font-medium underline"
          style={{ color: '#6B7A70' }}
        >
          Admin Login
        </button>
      </footer>
    </div>
  );
}

// Reusable phone-frame wrapper for screenshots \u2014 CSS-only device frame, no external
// mockup image needed, keeps the bundle self-contained
function PhoneFrame({
  src,
  alt,
  caption,
  featured = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  featured?: boolean;
}) {
  const width = featured ? 260 : 190;
  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div
        className="rounded-[2rem] p-2 shadow-xl"
        style={{ background: 'var(--nf-ink)', width }}
      >
        <div className="rounded-[1.5rem] overflow-hidden bg-black" style={{ aspectRatio: '9 / 19.5' }}>
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        </div>
      </div>
      {caption && (
        <span className="nf-body text-xs font-medium" style={{ color: '#6B7A70' }}>
          {caption}
        </span>
      )}
    </div>
  );
}