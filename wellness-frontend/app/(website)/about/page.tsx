import { Metadata } from "next";
import AboutBrandSection from "@/components/about/AboutBrandSection";

export const metadata: Metadata = {
  title: "About Us | Wellness Fuel",
  description: "About Us | Wellness Fuel",
};

export default function AboutPage() {
  return (
    <>
      <AboutBrandSection />
    </>
  );
}
