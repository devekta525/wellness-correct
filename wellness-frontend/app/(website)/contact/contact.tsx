"use client";
import React, { useState } from "react";
import Image from "next/image";
import { getApiV1Url } from "@/lib/utils/api";
import { Phone, Mail, MapPin, Send, Loader2, Globe, Building2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

const Contact = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(getApiV1Url("/contacts"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire({
          title: "Message Sent!",
          text:
            data.message ||
            "Thank you for contacting us. We will get back to you shortly.",
          icon: "success",
          confirmButtonColor: "#2563eb",
        });
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "General Inquiry",
          message: "",
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: data.error || "Failed to send message. Please try again later.",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      Swal.fire({
        title: "Error!",
        text: "An unexpected error occurred.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] w-full flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1556745753-b2904692b3cd?q=80&w=2000&auto=format&fit=crop"
            alt="Customer support team"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Soft Dark Overlay & Smooth Gradient */}
        <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/50 to-blue-900/50 mix-blend-overlay" />

        {/* Soft Fade Bottom Transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent pointer-events-none" />

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            {/* Teal Accent Pill */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl shadow-teal-500/10 text-teal-50 font-semibold tracking-wide uppercase text-sm"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400"></span>
              </span>
              Support Team
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400 drop-shadow-sm">Us</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              We&apos;re here to help with your wellness journey.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Contact Info Side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-10"
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                  Let&apos;s start a conversation
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  Whether you have a question about our products, pricing, or wellness goals, our team at <span className="text-blue-600 font-bold">Wellness Fuel</span> is ready to assist you.
                </p>
              </div>

              <div className="grid gap-6">
                {/* Official Info Cards */}
                <div className="group flex items-start gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                      Registered Office
                    </h3>
                    <div className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                      <p className="font-bold text-slate-800 dark:text-slate-200">Wellness Fuel Private Limited</p>
                      <p>304, 3rd Floor, Procapitus Business Park,</p>
                      <p>D-247, 4A, D Block, Sector 63,</p>
                      <p>Noida, Uttar Pradesh – 201309, India</p>
                    </div>
                    <div className="pt-2 flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold bg-slate-50 dark:bg-slate-800 p-2 px-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 w-fit">
                      <Ticket className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">GSTIN: 09AAECW2566L1ZS</span>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <a
                    href="mailto:dr.ritesh@wellnessfuel.in"
                    className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-center"
                  >
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1">Email Us</h3>
                      <p className="text-blue-600 font-medium group-hover:underline decoration-2 underline-offset-4">dr.ritesh@wellnessfuel.in</p>
                    </div>
                  </a>

                  <a
                    href="tel:+919667766523"
                    className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-center"
                  >
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1">Call Us</h3>
                      <p className="text-blue-600 font-medium group-hover:underline decoration-2 underline-offset-4">+91 9667766523</p>
                    </div>
                  </a>
                </div>

                <a
                  href="https://www.wellnessfuel.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <Globe className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-all" />
                  <span className="text-slate-700 dark:text-slate-300 font-bold group-hover:text-blue-700">www.wellnessfuel.in</span>
                </a>
              </div>
            </motion.div>

            {/* Form Side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-blue-500/5 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 md:p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Send us a message
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  We&apos;ll get back to you within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="+91 9667766523"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-inner"
                    placeholder="How can we help you?"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-lg shadow-xl shadow-blue-500/20 transition-all hover:shadow-blue-500/40 hover:-translate-y-1"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Sending Message...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-3">
                      <Send className="w-6 h-6" />
                      Send Message
                    </span>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
