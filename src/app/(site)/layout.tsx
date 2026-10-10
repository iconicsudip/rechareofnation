"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";
import RevealOnScroll from "@/components/RevealOnScroll";
import LuxeBackdrop from "@/components/LuxeBackdrop";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="luxe flex flex-col min-h-screen">
      <RevealOnScroll />
      <LuxeBackdrop />
      <Navbar />
      <main className="relative z-[2] flex-grow flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
