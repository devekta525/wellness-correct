import { Metadata } from "next";
import CollabPage from "./collab-page";

export const metadata: Metadata = {
    title: "  Wellness | Wellness Fuel",
    description: "Built by Science. Tested by .",
};

export default function Page() {
    return <CollabPage />;
}
