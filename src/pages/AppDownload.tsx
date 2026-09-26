import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Salad, Dumbbell, ShieldCheck, LineChart, Trophy, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

const APK_DOWNLOAD_URL = 'https://drive.google.com/uc?export=download&id=1IW41GwU3MYapIi_XhYcGIOkKxhMP4L52';

const SCREENS = [
  { src: '/dashboard.jpg', label: 'Dashboard' },
  { src: '/meal.jpg', label: 'Meal Plan' },
  { src: '/workout.jpg', label: 'Workout' },
  { src: '/progress.jpg', label: 'Progress' },
  { src: '/achievements.jpg', label: 'Achievements' },
  { src: '/profile.jpg', label: 'Profile' },
  { src: '/calendar.jpg', label: 'Calendar' },
];

const FEATURES = [
  {
    Icon: Salad,
    title: 'AI-Personalized Meal Plans',
    body: 'AI-generated meal plans based on your calorie and macronutrient needs.',
  },
  {
    Icon: Dumbbell,
    title: 'AI-Generated Workouts',
    body: 'Weekly workout plans automatically built around your fitness goal and equipment.',
  },
  {
    Icon: ShieldCheck,
    title: 'Allergen-Aware',
    body: 'Meals are automatically filtered or substituted based on your allergies.',
  },
  {
    Icon: LineChart,
    title: 'Progress Tracking',
    body: 'Log your weight and meals to track your fitness journey over time.',
  },
  {
    Icon: Trophy,
    title: 'Achievements',
    body: 'Earn badges and share your progress as you stay consistent.',
  },
];

function SideGlow({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      aria-hidden="true"
      className={`hidden lg:block fixed top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-full w-24 z-0 pointer-events-none`}
      style={{
        background:
          side === 'left'
            ? 'linear-gradient(to right, rgba(76,175,80,0.10), transparent)'
            : 'linear-gradient(to left, rgba(76,175,80,0.10), transparent)',
      }}
    >
      <div
        className={`absolute top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-full w-[3px]`}
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--nf-green) 20%, var(--nf-green) 80%, transparent)',
          opacity: 0.35,
        }}
      />
    </div>
  );
}

export default function AppDownload() {
  const navigate = useNavigate();

  const marqueeScreens = [...SCREENS, ...SCREENS];

  useEffect(() => {
    document.title = 'NutriFit \u2014 Get the App';
  }, []);

  return (
    <div style={{ background: 'var(--nf-paper)', color: 'var(--nf-ink)' }} className="min-h-screen relative">
      <style>{`
        :root {
          --nf-ink: #16241C;
          --nf-paper: #F5F6F3;
          --nf-green: #4CAF50;
          --nf-green-dark: #2E7D32;
          --nf-amber: #FF9800;
          --nf-line: #D6DED7;
        }
        .nf-display { font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif; }
        .nf-body { font-family: 'Inter', system-ui, sans-serif; }
        @keyframes nf-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .nf-marquee-track {
          animation: nf-marquee 26s linear infinite;
          will-change: transform;
        }
        .nf-marquee-track:hover { animation-play-state: paused; }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <SideGlow side="left" />
      <SideGlow side="right" />

      <div className="relative z-10">
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
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <PhoneFrame src="/dashboard.jpg" alt="NutriFit dashboard" featured />
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
            <div className="nf-marquee-track flex gap-6 w-max">
              {marqueeScreens.map((screen, i) => (
                <PhoneFrame key={`${screen.label}-${i}`} src={screen.src} alt={screen.label} caption={screen.label} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ WHAT'S INSIDE ============ */}
        <section className="max-w-3xl mx-auto px-6 md:px-10 pb-20">
          <h2 className="nf-display text-2xl font-semibold mb-6" style={{ color: 'var(--nf-ink)' }}>
            What's Inside
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
            &copy; 2026 NutriFit
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
    </div>
  );
}

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
      <div className="rounded-[2rem] p-2 shadow-xl" style={{ background: 'var(--nf-ink)', width }}>
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