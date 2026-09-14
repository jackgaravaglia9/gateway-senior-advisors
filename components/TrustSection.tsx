const TRUST_ITEMS = [
  "Personalized recommendations",
  "St. Louis-area research",
  "No cost to families",
  "No obligation",
  "Your information isn't sold",
];

function CheckMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      className="shrink-0 mt-0.5"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="10" stroke="#9A6C2C" strokeWidth="1.4" />
      <path
        d="M6.5 11.3L9.4 14.2L15.5 8"
        stroke="#9A6C2C"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TrustSection() {
  return (
    <section className="px-6 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-4xl border border-border bg-cream-alt px-6 py-12 sm:px-12 sm:py-14">
        <h2 className="font-display text-3xl sm:text-4xl text-forest text-center">
          Why families use Gateway
        </h2>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-6 max-w-2xl mx-auto">
          {TRUST_ITEMS.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckMark />
              <span className="text-body text-lg">{item}</span>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center text-sm text-body-secondary max-w-2xl mx-auto">
          Helping families across St. Louis County, St. Charles, West County, South
          County, and surrounding communities.
        </p>
      </div>
    </section>
  );
}
