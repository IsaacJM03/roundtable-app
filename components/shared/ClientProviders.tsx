"use client";

import { MouseProvider } from "./MouseProvider";
import { CursorGlow } from "./CursorGlow";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <MouseProvider>
      <CursorGlow />
      {children}
    </MouseProvider>
  );
}
