"use client";

/**
 * Authenticated fetch wrapper — attaches the in-memory session user
 * as headers so server API routes can authorize admin actions.
 */
import { useCallback } from "react";
import { useApp } from "@/lib/store";

export function useAuthedFetch() {
  const session = useApp((s) => s.session);
  const sessionId = session?.id;
  const sessionRole = session?.role;

  return useCallback(
    async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const headers = new Headers(init.headers || {});
      if (sessionId && sessionRole) {
        headers.set("x-actor-id", sessionId);
        headers.set("x-actor-role", sessionRole);
      }
      return fetch(input, { ...init, headers });
    },
    [sessionId, sessionRole]
  );
}

