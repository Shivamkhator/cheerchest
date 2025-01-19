import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const metadata: Metadata = {
  title: "CheerChest | Support Your Favorite Creators",
  description:
    "CheerChest is a platform that allows fans to support their favorite creators through subscriptions, one-time payments, and personalized messages. Discover top creators, explore exclusive content, and empower the creative community to thrive. Join CheerChest today and make a difference in the lives of the creators you love!",
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <html lang="en">
      <body>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <main>
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
