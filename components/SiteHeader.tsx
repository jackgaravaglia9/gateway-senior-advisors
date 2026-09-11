import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-5 flex justify-center sm:justify-start">
        <Link href="/" className="inline-block">
          <img
            src="/gsa-logo-wordmark.svg"
            alt="Gateway Senior Advisors"
            className="h-7 sm:h-8 w-auto"
          />
        </Link>
      </div>
    </header>
  );
}
