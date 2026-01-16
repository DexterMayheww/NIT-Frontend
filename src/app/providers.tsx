'use client';

import { SessionProvider } from "next-auth/react";
import { SnackProvider } from "@/app/SnackProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SnackProvider>
                {children}
            </SnackProvider>
        </SessionProvider>
    );
}
