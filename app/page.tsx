import { Suspense } from "react";
import IntakeForm from "@/components/IntakeForm";
import SiteFooter from "@/components/SiteFooter";

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
        <section className="px-6 pt-16 pb-16 sm:pt-24 sm:pb-24 lg:pt-36 lg:pb-36 2xl:pt-44 2xl:pb-44">
          <div className="mx-auto max-w-3xl lg:max-w-5xl 2xl:max-w-6xl text-center">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl 2xl:text-8xl leading-[1.05] text-forest">
              Find the Right Senior Living in St. Louis
            </h1>
            <p className="mt-8 lg:mt-10 text-lg sm:text-xl lg:text-3xl text-body-secondary max-w-2xl lg:max-w-4xl mx-auto">
              Helping families find assisted living and memory care options that fit
              their parent&apos;s needs, budget, and location.
            </p>
            <p className="mt-4 lg:mt-6 text-forest font-medium lg:text-2xl">Free. No obligation.</p>

            <div className="mt-10 lg:mt-14">
              <a
                href="#intake-form"
                className="inline-block bg-gold hover:bg-gold-light text-white px-9 py-4 lg:px-14 lg:py-6 text-lg lg:text-2xl font-medium transition-colors"
              >
                Find My Options
              </a>
            </div>

            <p className="mt-5 lg:mt-8 text-sm lg:text-base text-body-secondary max-w-md lg:max-w-lg mx-auto">
              A real person reviews every submission personally. No call centers, no
              automated matching.
            </p>
          </div>
        </section>

        {/* Not sure where to start */}
        <section className="bg-cream-alt border-y border-border px-6 py-16 sm:py-20 lg:py-32">
          <div className="mx-auto max-w-3xl lg:max-w-5xl text-center">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl text-forest">
              Not sure where to start?
            </h2>
            <p className="mt-5 lg:mt-8 text-lg lg:text-2xl text-body-secondary lg:max-w-4xl lg:mx-auto">
              You shouldn&apos;t have to call dozens of communities to figure out where
              your parent might fit. Tell us a little about your situation and
              we&apos;ll research appropriate St. Louis-area options for you.
            </p>
          </div>
        </section>

        {/* Process */}
        <section className="px-6 py-16 sm:py-20 lg:py-32">
          <div className="mx-auto max-w-4xl lg:max-w-6xl">
            <div className="grid gap-10 lg:gap-20 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.number}>
                  <span className="font-display text-4xl lg:text-6xl text-gold">
                    {step.number}
                  </span>
                  <h3 className="mt-3 lg:mt-6 font-display text-xl lg:text-3xl text-forest">
                    {step.title}
                  </h3>
                  <p className="mt-2 lg:mt-4 lg:text-xl text-body-secondary">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Intake form */}
        <section className="px-6 pb-20 sm:pb-28 lg:pb-40">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-10 lg:mb-14">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl text-forest">
                Tell us about your situation
              </h2>
              <p className="mt-3 lg:mt-5 lg:text-2xl text-body-secondary">
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
