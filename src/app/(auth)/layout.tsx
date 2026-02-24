import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-grid opacity-70" />
      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  );
}
