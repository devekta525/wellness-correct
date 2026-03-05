import React from "react";
import FeaturedCollectionSection from "@/components/home/featured-collection-section";

export const metadata = {
  title: "Shipping Policy | Wellness Fuel",
  description: "Shipping policy and delivery information",
};

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24">
      <div className="bg-blue-600 text-white py-16 px-4 sm:px-6 lg:px-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Shipping Policy</h1>
        <p className="text-blue-100 text-lg">
          Details about shipping times, costs and delivery.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white dark:bg-slate-900 shadow-sm rounded-2xl -mt-8 relative z-10 mb-16 border border-slate-100 dark:border-slate-800">
        <div className="prose prose-blue dark:prose-invert max-w-none">
          <h2>Shipping Regions</h2>
          <p>
            We ship across India. International shipping may be available on
            request.
          </p>

          <h2>Delivery Time</h2>
          <p>
            Orders are processed within 1-2 business days. Delivery typically
            takes 3-7 business days depending on location.
          </p>

          <h2>Shipping Charges</h2>
          <p>
            Shipping is free for orders above ₹999. For smaller orders, standard
            shipping charges apply.
          </p>

          <h2>Tracking</h2>
          <p>
            Once your order is shipped, you'll receive a tracking number to
            follow delivery progress.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <FeaturedCollectionSection />
      </div>
    </main>
  );
}
