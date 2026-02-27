import { Metadata } from "next";
import ProductScienceSection from "@/components/about/ProductScienceSection";

export const metadata: Metadata = {
  title: "Science-Based Wellness | Wellness Fuel",
  description: "Learn about the science behind Wellness Fuel's premium product formulations.",
};

export default function SciencePage() {
  return (
    <>
      <ProductScienceSection />
    </>
  );
}
