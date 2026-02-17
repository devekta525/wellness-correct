import { Metadata } from "next";
import CollabPage from "../collab/collab-page";

export const metadata: Metadata = {
  title: "Products | Wellness Fuel",
  description: "Shop our scientifically formulated supplements.",
};

export default function ProductsPage() {
  return <CollabPage />;
}