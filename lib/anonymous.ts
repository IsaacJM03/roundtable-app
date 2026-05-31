"use client";

import { v4 as uuidv4 } from "uuid";

const KEY = "rt_anon_token";

export function getOrCreateAnonToken(): string {
  if (typeof window === "undefined") return "";
  let token = localStorage.getItem(KEY);
  if (!token) {
    token = uuidv4();
    localStorage.setItem(KEY, token);
  }
  return token;
}

export function getAnonToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}
