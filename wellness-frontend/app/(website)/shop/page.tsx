import { Metadata } from "next";
import CollabPage from "../collab/collab-page";

export const metadata: Metadata = {
    title: "Shop | Wellness Fuel",
    description: "Shop our scientifically formulated supplements.",
};

export default function Page() {
    return <CollabPage />;
}
