import { Suspense } from "react";
import IntakeForm from "@/components/IntakeForm";
import SiteFooter from "@/components/SiteFooter";
import CtaButton from "@/components/CtaButton";

const STEPS = [
  {
    number: "1",
    title: "Tell us about your parent",
    body: "A few details about their needs, timeline, and budget. Takes about three minutes.",
  },
  {
    number: "2",
    title: "We identify potential matches",
    body: "We personally research St. Louis-area communities that fit what you've told us.",
  },
  {
    number: "3",
    title: "You decide which communities to explore",
    body: "We send you options. You choose who to talk to, on your own timeline.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 pt-16 pb-16 sm:pt-24 sm:pb-24 lg:pt-28 lg:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.15] text-forest">
              Find the Right Senior Living in St. Louis
            </h1>
            <p className="mt-7 text-lg sm:text-xl text-body-secondary max-w-2xl mx-auto">
              Helping families find assisted living and memory care options that fit
              their parent&apos;s needs, budget, and location.
            </p>
            <p className="mt-4 text-forest font-medium">Free. No obligation.</p>

            <div className="mt-10">
              <CtaButton
                href="#intake-form"
                location="hero"
                className="inline-block bg-gold hover:bg-gold-light text-white px-9 py-4 text-lg font-medium transition-colors"
              >
                Find My Options
              </CtaButton>
            </div>

            <p className="mt-5 text-sm text-body-secondary max-w-md mx-auto">
              A real person reviews every submission personally. No call centers, no
              automated matching.
            </p>
          </div>
        </section>

        {/* Not sure where to start */}
        <section className="bg-cream-alt border-y border-border px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl sm:text-4xl text-forest">
              Not sure where to start?
            </h2>
            <p className="mt-5 text-lg text-body-secondary">
              You shouldn&apos;t have to call dozens of communities to figure out where
              your parent might fit. Tell us a little about your situation and
              we&apos;ll research appropriate St. Louis-area options for you.
            </p>
          </div>
        </section>

        {/* Process */}
        <section id="how-it-works" className="scroll-mt-20 px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-10 lg:gap-14 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.number}>
                  <span className="font-display text-4xl text-gold">
                    {step.number}
                  </span>
                  <h3 className="mt-3 font-display text-xl text-forest">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-body-secondary">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Intake form */}
        <section className="px-6 pb-20 sm:pb-28 lg:pb-32">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl sm:text-4xl text-forest">
                Tell us about your situation
              </h2>
              <p className="mt-3 text-body-secondary">
                Takes about three minutes. No obligation.
              </p>
            </div>
            <Suspense fallback={<div className="h-[600px]" />}>
              <IntakeForm />
            </Suspense>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
