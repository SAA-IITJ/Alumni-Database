"use client"; // Mark this file as a Client Component

import { SessionProvider } from "next-auth/react";
import React from "react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </SessionProvider>
  );
}
