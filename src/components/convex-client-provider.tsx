"use client"
import { ReactNode } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
// 🔥 THE FIX: Imported raw ConvexProvider for the public route
import { ConvexReactClient, Authenticated, Unauthenticated, AuthLoading, ConvexProvider } from "convex/react";
import { FullscreenLoader } from "./fullscreen-loader";
import { IntroPage } from "./intro-page";
import { usePathname } from "next/navigation"; 

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname(); 

  // 🔥 THE FIX: Pure ConvexProvider. 
  // No Clerk. No Auth requests. Just pure database read access for guests.
  if (pathname?.startsWith("/share")) {
    return (
      <ConvexProvider client={convex}>
        {children}
      </ConvexProvider>
    );
  }

  // 🔒 REGULAR FLOW: Strict Authentication for editors and owners
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <ConvexProviderWithClerk 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useAuth={useAuth as any} 
        client={convex}
      >
        <Authenticated>
           {children}
        </Authenticated>
        <Unauthenticated>
          <IntroPage />
         </Unauthenticated>
         <AuthLoading>
            <FullscreenLoader label="Auth loading..." />
         </AuthLoading>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}