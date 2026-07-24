import type { Metadata } from "next";
import { Bricolage_Grotesque, Karla, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/app/ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const karla = Karla({
  variable: "--font-body",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cato",
  description:
    "A quiet place to plan your day, break tasks into focused steps, and work one bucket at a time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={{
        signIn: {
          start: {
            title: "Sign in to Cato",
            titleCombined: "Sign in to Cato",
          },
        },
      }}
    >
      <html
        lang="en"
        className={`${bricolageGrotesque.variable} ${karla.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <TooltipProvider>
            <ConvexClientProvider>{children}</ConvexClientProvider>
            <Toaster />
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
