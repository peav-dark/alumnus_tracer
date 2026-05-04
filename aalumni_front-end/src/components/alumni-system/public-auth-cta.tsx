"use client";

import { usePublicAuthState } from "@/lib/public-auth";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PublicAuthModal, type PublicAuthView } from "./public-auth-modal";

type PublicAuthCtaProps = {
  wrapperClassName?: string;
  loginLabel?: string;
  registerLabel?: string;
  loginClassName?: string;
  registerClassName?: string;
};

export function PublicAuthCta({
  wrapperClassName,
  loginLabel,
  registerLabel,
  loginClassName,
  registerClassName,
}: PublicAuthCtaProps) {
  const { isLoggedIn, isLoading } = usePublicAuthState();
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<PublicAuthView>("sign-in");

  if (isLoading || isLoggedIn) {
    return null;
  }

  const openModal = (view: PublicAuthView) => {
    setAuthView(view);
    setAuthOpen(true);
  };

  return (
    <>
      <div className={wrapperClassName}>
        {registerLabel ? (
          <button
            type="button"
            onClick={() => openModal("sign-up")}
            className={cn(registerClassName)}
          >
            {registerLabel}
          </button>
        ) : null}

        {loginLabel ? (
          <button
            type="button"
            onClick={() => openModal("sign-in")}
            className={cn(loginClassName)}
          >
            {loginLabel}
          </button>
        ) : null}
      </div>

      <PublicAuthModal
        open={authOpen}
        view={authView}
        publicSignupEnabled
        onViewChange={setAuthView}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}
