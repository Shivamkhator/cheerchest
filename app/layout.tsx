import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CheerChest | Support Your Favorite Creators",
  description:
    "CheerChest is a platform that allows fans to support their favorite creators through subscriptions, one-time payments, and personalized messages. Discover top creators, explore exclusive content, and empower the creative community to thrive. Join CheerChest today and make a difference in the lives of the creators you love!",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
