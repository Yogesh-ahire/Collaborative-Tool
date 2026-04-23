"use client"
import { ReactNode } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { FullscreenLoader } from "./fullscreen-loader";
import { IntroPage } from "./intro-page";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
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