'use client'

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

let scriptLoadingPromise = null;

function loadTurnstileScript() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile script"));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

/**
 * Cloudflare Turnstile bot-verification widget.
 *
 * Renders nothing if NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured,
 * so the app keeps working even before the env var is set up.
 *
 * Usage:
 *   const turnstileRef = useRef(null);
 *   <TurnstileWidget ref={turnstileRef} onVerify={setToken} onExpire={() => setToken("")} />
 *   // after a failed login attempt, tokens are single-use, so reset it:
 *   turnstileRef.current?.reset();
 */
const TurnstileWidget = forwardRef(function TurnstileWidget(
  { onVerify, onExpire, className = "" },
  ref,
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && typeof window !== "undefined" && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch {
          // ignore
        }
      }
    },
  }));

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "dark",
          size: "flexible",
          callback: (token) => onVerify?.(token),
          "expired-callback": () => onExpire?.(),
          "error-callback": () => onExpire?.(),
        });
      })
      .catch(() => {
        // If the script fails to load (e.g. offline), silently skip.
        // The backend falls back to rejecting login in production in that case,
        // so the user will see a clear error rather than a silent hang.
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && typeof window !== "undefined" && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
      }
    };
     
  }, [siteKey]);

  if (!siteKey) return null;

  return <div ref={containerRef} className={cn("w-full", className)} />;
});

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default TurnstileWidget;
