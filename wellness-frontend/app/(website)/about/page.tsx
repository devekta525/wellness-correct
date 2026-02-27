import { Metadata } from "next";
import AboutScrollSection from "@/components/home/about-scroll-section";

export const metadata: Metadata = {
  title: "About Us | Wellness Fuel",
  description: "About Us | Wellness Fuel",
};

export default function AboutPage() {
  return (
    <>
      <AboutScrollSection />
    </>
  );
}
