"use client"; // Mark this file as a Client Component

import { SessionProvider } from "next-auth/react";
import React from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          </body>
      </html>
    </SessionProvider>
  );
}
