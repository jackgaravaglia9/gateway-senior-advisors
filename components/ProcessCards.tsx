const STEPS = [
  {
    title: "Tell us about your parent",
    body: "A few details about their needs, timeline, and budget. Takes about three minutes.",
    Icon: NotesIcon,
  },
  {
    title: "We identify potential matches",
    body: "We personally research St. Louis-area communities that fit what you've told us.",
    Icon: SearchIcon,
  },
  {
    title: "You decide which communities to explore",
    body: "We send you options. You choose who to talk to, on your own timeline.",
    Icon: PathIcon,
  },
];

function NotesIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="6" y="4" width="16" height="20" rx="1" stroke="#223129" strokeWidth="1.4" />
      <path d="M10 10.5H18M10 14.5H18M10 18.5H14.5" stroke="#223129" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M18.5 3L21 5.5L14.5 12L11.5 12.5L12 9.5L18.5 3Z" stroke="#9A6C2C" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="12.5" cy="12.5" r="7" stroke="#223129" strokeWidth="1.4" />
      <path d="M17.5 17.5L23 23" stroke="#223129" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.5 12.5C9.5 10.8 10.8 9.5 12.5 9.5" stroke="#9A6C2C" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PathIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="6" cy="21" r="2.2" stroke="#223129" strokeWidth="1.3" />
      <circle cx="22" cy="7" r="2.2" stroke="#223129" strokeWidth="1.3" />
      <path
        d="M8 20C13 20 11 10 16 8C18 7.2 19 7.2 20 7.2"
        stroke="#9A6C2C"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeDasharray="1 3.2"
      />
      <path d="M17.5 5.5L20.5 7L18.5 9.8" stroke="#223129" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProcessCards() {
  return (
    <section id="how-it-works" className="scroll-mt-20 px-6 py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="flex flex-col bg-white border border-border px-7 py-9 shadow-[0_1px_3px_rgba(34,49,41,0.06)]"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream-alt">
                  <step.Icon />
                </span>
                <span className="font-display text-2xl text-gold">{i + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-xl text-forest">{step.title}</h3>
              <p className="mt-2 text-body-secondary">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
