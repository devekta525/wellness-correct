import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
// import { Toaster } from "@/components/ui/sonner"; // Import the Toaster

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      {/* <Toaster position="top-right" richColors closeButton /> */}
    </>
  );
}
