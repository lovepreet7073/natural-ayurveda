"use client";

import { useCallback, useRef, useState } from "react";

export type PincodeArea = {
  pincode: string;
  district: string;
  state: string;
  postOffices: string[];
};

export type PincodeStatus =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "found"; area: PincodeArea }
  | { kind: "notFound" }
  /** Upstream unreachable — the customer types the address themselves instead. */
  | { kind: "unavailable" };

export function usePincodeLookup() {
  const [status, setStatus] = useState<PincodeStatus>({ kind: "idle" });
  // Someone typing quickly fires several lookups; only the newest may win.
  const latest = useRef(0);

  const reset = useCallback(() => {
    latest.current += 1;
    setStatus({ kind: "idle" });
  }, []);

  const lookup = useCallback(async (pin: string): Promise<PincodeArea | null> => {
    const ticket = ++latest.current;
    setStatus({ kind: "checking" });

    try {
      const res = await fetch(`/api/pincode/${pin}`);
      const body = await res.json();
      if (ticket !== latest.current) return null;

      if (res.ok) {
        const area = body.data as PincodeArea;
        setStatus({ kind: "found", area });
        return area;
      }

      setStatus(body?.error?.code === "PIN_NOT_FOUND" ? { kind: "notFound" } : { kind: "unavailable" });
      return null;
    } catch {
      if (ticket === latest.current) setStatus({ kind: "unavailable" });
      return null;
    }
  }, []);

  return { status, lookup, reset };
}
