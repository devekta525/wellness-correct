import Header from "@/components/layouts/website/Header"
import Footer from "@/components/layouts/website/Footer"
import { Providers } from "@/app/providers"; // Adjust path if necessary
// import { Toaster } from "@/components/ui/sonner"; // Import the Toaster

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <Header />
      <main>{children}</main>
      <Footer />
      {/* <Toaster position="top-right" richColors closeButton /> */}
    </Providers>
  );
}