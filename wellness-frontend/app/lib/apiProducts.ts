import { getApiV1Url } from "@/lib/utils/api";

// Utility to fetch products from backend
export async function fetchProducts() {
  // Update the URL to your backend endpoint as needed
  const res = await fetch(getApiV1Url("/products/public"), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}
