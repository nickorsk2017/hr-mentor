"use client";

import React from "react";
import { MentorProvider } from "./mentor-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <MentorProvider>{children}</MentorProvider>;
}

