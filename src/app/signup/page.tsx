"use client";

import { useRouter, useSearchParams } from "next/navigation";
import AuthModal from "@/components/AuthModal";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorMessage = error
    ? "GitHub sign-in is not available. Please use email & password."
    : null;

  return (
    <div className="min-h-screen bg-blueprint">
      {errorMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white border border-border-light rounded-card px-4 py-2 text-xs text-text-secondary" style={{ boxShadow: "var(--shadow-card)" }}>
          {errorMessage}
        </div>
      )}
      <AuthModal isOpen onClose={() => router.push("/")} defaultTab="signup" />
    </div>
  );
}
