import { Suspense } from "react";
import Image from "next/image";
import IntakeForm from "@/components/IntakeForm";
import SiteFooter from "@/components/SiteFooter";
import CtaButton from "@/components/CtaButton";
import TrustSection from "@/components/TrustSection";
import ProcessCards from "@/components/ProcessCards";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
          <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-1 lg:order-2">
              <div className="relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/5] overflow-hidden">
                <Image
                  src="/images/hero-family.jpg"
                  alt="An adult daughter with her hand on her senior mother's shoulder, both smiling over coffee"
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover object-[32%_18%] lg:object-[38%_22%]"
                />
              </div>
            </div>

            <div className="order-2 lg:order-1 text-center lg:text-left">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.15] text-forest">
                Find the Right Senior Living in St. Louis
              </h1>
              <p className="mt-7 text-lg sm:text-xl text-body-secondary max-w-xl mx-auto lg:mx-0">
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

              <p className="mt-5 text-sm text-body-secondary max-w-md mx-auto lg:mx-0">
                A real person reviews every submission personally. No call centers, no
                automated matching.
              </p>
            </div>
          </div>
        </section>

        <TrustSection />

        {/* Not sure where to start */}
        <section className="bg-cream-alt border-y border-border px-6 py-16 sm:py-20 lg:py-28">
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

        <ProcessCards />

        {/* Intake form */}
        <section className="px-6 pb-24 sm:pb-32 lg:pb-36">
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
