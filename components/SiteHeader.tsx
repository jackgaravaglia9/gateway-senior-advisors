import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-6 flex justify-center sm:justify-start">
        <Link href="/" className="inline-block">
          <img
            src="/gsa-logo-wordmark.svg"
            alt="Gateway Senior Advisors"
            className="h-10 sm:h-12 w-auto"
          />
        </Link>
      </div>
    </header>
  );
}
