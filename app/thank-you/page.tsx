import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Thanks. We're on it. | Gateway Senior Advisors",
  description: "Someone from our team will personally review your situation and follow up within one business day.",
};

export default function ThankYou() {
  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 flex items-center">
        <section className="px-6 py-24 sm:py-32 w-full">
          <div className="mx-auto max-w-xl text-center">
            <h1 className="font-display text-4xl sm:text-5xl text-forest">
              Thanks. We&apos;re on it.
            </h1>
            <p className="mt-6 text-lg text-body-secondary">
              Someone from our team will personally review your situation and follow up
              within one business day with options that fit.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
