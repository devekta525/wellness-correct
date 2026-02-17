import { Metadata } from "next";
import Science from "./science";

export const metadata: Metadata = {
  title: "Science | Wellness Fuel",
  description: "Science | Wellness Fuel",
};

export default function SciencePage() {
  return <Science />;
}
