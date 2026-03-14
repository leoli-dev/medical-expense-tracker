import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Toast } from "../ui/Toast";

export function SWUpdateToast() {
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      if (r) setRegistration(r);
    },
  });

  // Periodic checks: every 60 s + on visibility/focus restore
  useEffect(() => {
    if (!registration) return;

    const check = () => registration.update().catch(() => undefined);
    const interval = setInterval(check, 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    const onFocus = () => check();

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [registration]);

  // When update is ready: show toast briefly then reload
  useEffect(() => {
    if (!needRefresh) return;
    const t = setTimeout(() => updateServiceWorker(true), 1500);
    return () => clearTimeout(t);
  }, [needRefresh, updateServiceWorker]);

  if (!needRefresh) return null;

  return (
    <Toast
      message="Updating app…"
      type="success"
      onClose={() => setNeedRefresh(false)}
    />
  );
}
