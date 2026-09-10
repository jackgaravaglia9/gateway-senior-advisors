import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-cream-alt">
      <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-body-secondary">
        <p className="max-w-3xl">
          Gateway Senior Advisors operates St. Louis Senior Living Match, an independent
          service. We are not affiliated with any specific community and do not charge
          families for this research.
        </p>
        <p className="mt-4">
          <Link href="/privacy" className="underline hover:text-body">
            Privacy
          </Link>
        </p>
      </div>
    </footer>
  );
}
