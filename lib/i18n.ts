"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_LANG,
  LANGUAGES,
  isLang,
  translate,
  type Lang,
  type MessageKey,
  type Vars,
} from "@/lib/dictionary";

const STORAGE_KEY = "na-lang-v1";

// Same external-store pattern as the cart: the chosen language lives in
// localStorage, which is outside React, so it is read through
// useSyncExternalStore rather than hydrated inside an effect.
let current: Lang = DEFAULT_LANG;
let hydrated = false;
const listeners = new Set<() => void>();

function readStored(): Lang {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isLang(raw) ? raw : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

function hydrate(): void {
  if (hydrated) return;
  current = readStored();
  hydrated = true;
  syncDocumentLang();
}

/** Keeps <html lang> honest for screen readers and browser translation prompts. */
function syncDocumentLang(): void {
  if (typeof document !== "undefined") document.documentElement.lang = current;
}

function subscribe(listener: () => void): () => void {
  hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = (): Lang => current;
// The server has no way to know the preference, so it always renders the default
// and the browser swaps on hydration.
const getServerSnapshot = (): Lang => DEFAULT_LANG;

export function setLang(next: Lang): void {
  if (!isLang(next) || next === current) return;
  current = next;
  hydrated = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Private browsing — the choice still holds for this session.
  }
  syncDocumentLang();
  for (const listener of listeners) listener();
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useT(): (key: MessageKey, vars?: Vars) => string {
  const lang = useLang();
  return (key, vars) => translate(lang, key, vars);
}

export { LANGUAGES, translate, type Lang, type MessageKey, type Vars };
