import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy | Gateway Senior Advisors",
  description: "How Gateway Senior Advisors collects and uses your information.",
};

export default function Privacy() {
  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1">
        <section className="px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl">
            <h1 className="font-display text-4xl text-forest">Privacy</h1>
            <p className="mt-4 text-body-secondary">
              This page explains, in plain language, what information we collect and
              how we use it.
            </p>

            <div className="mt-10 space-y-8 text-body">
              <div>
                <h2 className="font-display text-2xl text-forest">
                  What we collect
                </h2>
                <p className="mt-2 text-body-secondary">
                  When you fill out our intake form, we collect your name, phone
                  number, and email address, along with details about your parent or
                  loved one&apos;s care needs, such as the type of care they&apos;re
                  looking for, their general location, current living situation,
                  budget range, and timeline. We also collect basic information about
                  how you found this page, like which ad or search brought you here,
                  so we can understand what&apos;s working.
                </p>
              </div>

              <div>
                <h2 className="font-display text-2xl text-forest">
                  How we use it
                </h2>
                <p className="mt-2 text-body-secondary">
                  We use this information to personally research and recommend
                  St. Louis-area senior living communities that may fit your
                  situation, and to follow up with you about what we find.
                </p>
              </div>

              <div>
                <h2 className="font-display text-2xl text-forest">
                  What we don&apos;t do
                </h2>
                <p className="mt-2 text-body-secondary">
                  We don&apos;t sell your data. We don&apos;t share your information
                  with any senior living community unless you&apos;ve specifically
                  told us it&apos;s okay to, and even then, only with communities you
                  approve.
                </p>
              </div>

              <div>
                <h2 className="font-display text-2xl text-forest">
                  Questions
                </h2>
                <p className="mt-2 text-body-secondary">
                  If you have questions about your information or want it removed,
                  reach out to us and we&apos;ll take care of it.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
