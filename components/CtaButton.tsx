"use client";

import { captureEvent } from "@/lib/posthog";

export default function CtaButton({
  href,
  className,
  children,
  location,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  location: string;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => captureEvent("cta_clicked", { cta_text: "Find My Options", location })}
    >
      {children}
    </a>
  );
}
