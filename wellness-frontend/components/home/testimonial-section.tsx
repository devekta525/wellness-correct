"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Star, Quote, CheckCircle, Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchTestimonialsReviews,
  selectTestimonialsData,
  selectTestimonialsError,
  selectTestimonialsLoading,
} from "@/lib/redux/features/reviewSlice";

// Define interface for Testimonial
interface Testimonial {
  id: number | string;
  name: string;
  role: string;
  imageUrl: string;
  fallbackInitials: string;
  rating: number;
  text: string;
  location?: string;
  verified: boolean;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const fallbackTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Patient",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108755-2616b612b1c7?q=80&w=400&auto=format&fit=crop",
    fallbackInitials: "SJ",
    rating: 5,
    text: "Wellness Fuel transformed my healthcare experience. The doctors are incredibly knowledgeable and the platform is so easy to use. I can get medical advice anytime, anywhere.",
    location: "New York, NY",
    verified: true,
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    role: "Cardiologist",
    imageUrl:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop",
    fallbackInitials: "MC",
    rating: 5,
    text: "As a healthcare provider, I love how this platform streamlines patient care. The telemedicine features are excellent and help me reach more patients effectively.",
    location: "Los Angeles, CA",
    verified: true,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Patient",
    imageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop",
    fallbackInitials: "ER",
    rating: 5,
    text: "The personalized wellness programs have been life-changing. I've never felt more supported in my health journey. Highly recommend to anyone looking for quality healthcare.",
    location: "Miami, FL",
    verified: true,
  },
  {
    id: 4,
    name: "Dr. Lisa Thompson",
    role: "Family Medicine",
    imageUrl:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
    fallbackInitials: "LT",
    rating: 5,
    text: "This platform has revolutionized how I practice medicine. The patient management tools are intuitive and the 24/7 support system is outstanding.",
    location: "Seattle, WA",
    verified: true,
  },
  {
    id: 5,
    name: "James Wilson",
    role: "Patient",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    fallbackInitials: "JW",
    rating: 5,
    text: "The emergency care coordination saved my life. The response time was incredible and the follow-up care was comprehensive. I'm forever grateful.",
    location: "Chicago, IL",
    verified: true,
  },
  {
    id: 6,
    name: "Dr. Amanda Foster",
    role: "Mental Health Specialist",
    imageUrl:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=400&auto=format&fit=crop",
    fallbackInitials: "AF",
    rating: 5,
    text: "The mental health resources and support system are exceptional. It's wonderful to see technology being used to make mental healthcare more accessible.",
    location: "Boston, MA",
    verified: true,
  },
];

const TestimonialSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const remoteTestimonials = useAppSelector(selectTestimonialsData);
  const testimonialsLoading = useAppSelector(selectTestimonialsLoading);
  const testimonialsError = useAppSelector(selectTestimonialsError);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    dispatch(fetchTestimonialsReviews(8));
  }, [dispatch]);

  const normalizedTestimonials = useMemo(() => {
    if (!remoteTestimonials.length) return [];
    return remoteTestimonials.map((review) => ({
      id: review._id,
      name: review.name,
      role: review.title || "Patient",
      imageUrl: review.images?.[0] || "",
      fallbackInitials: getInitials(review.name),
      rating: review.rating || 5,
      text: review.review,
      location: review.email,
      verified: review.status === "Approved",
    }));
  }, [remoteTestimonials]);

  const testimonials =
    normalizedTestimonials.length > 0 ? normalizedTestimonials : fallbackTestimonials;

  const handleImageError = (testimonialId: number | string): void => {
    setImageErrors((prev) => ({ ...prev, [String(testimonialId)]: true }));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${index < rating ? "text-primary fill-current" : "text-gray-300"
          }`}
      />
    ));
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Enhanced Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary Blue Blob - Top Right */}
        <motion.div
          className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/8 to-blue-400/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Secondary Indigo Blob - Bottom Left */}
        <motion.div
          className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-r from-indigo-500/8 to-indigo-400/5 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Accent Sky Blob - Top Left */}
        <motion.div
          className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-sky-400/6 to-blue-500/6 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        {/* Primary Blue Blob - Bottom Right */}
        <motion.div
          className="absolute bottom-10 right-10 w-56 h-56 bg-gradient-to-r from-sky-400/6 to-blue-600/6 rounded-full blur-2xl"
          animate={{
            scale: [1.1, 1, 1.1],
            x: [0, -25, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />

        {/* Center Accent Blob */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/4 to-indigo-500/4 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />

        {/* Small Floating Particles */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-500 rounded-full"
          animate={{
            y: [0, -20, 0],
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />

        <motion.div
          className="absolute top-3/4 right-1/4 w-2 h-2 bg-indigo-500 rounded-full"
          animate={{
            y: [0, -25, 0],
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />

        <motion.div
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-sky-400 rounded-full"
          animate={{
            y: [0, -15, 0],
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2.5
          }}
        />
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-4xl sm:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-foreground">What Our <span className="text-primary">Patients Say</span></span>
          </motion.h2>
          <motion.p
            className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Don&apos;t just take our word for it. Here&apos;s what patients and
            healthcare professionals are saying about their experience with
            Wellness Fuel.
          </motion.p>

          {/* Trust Indicators */}
          <motion.div
            className="flex items-center justify-center gap-8 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">4.9/5</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Average Rating
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">10,000+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Happy Patients
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">50+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Expert Doctors
              </div>
            </div>
          </motion.div>
        </motion.div>

        {testimonialsError && (
          <p className="text-center text-sm text-red-500 mt-4 mb-8">
            {testimonialsError}
          </p>
        )}

        {testimonialsLoading && (
          <div className="flex items-center justify-center mb-8 text-primary">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {/* Testimonials Marquee */}
        <div className="relative overflow-hidden mb-16 space-y-8">
          {/* First Row - Left to Right */}
          <motion.div
            className="flex gap-6 cursor-pointer mt-6 mb-12"
            animate={{
              x: [0, -50 * testimonials.length + "%"],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
            whileHover={{
              animationPlayState: "paused",
            }}
          >
            {/* First set of testimonials */}
            {testimonials.map((testimonial: Testimonial, index: number) => (
              <motion.div
                key={`first-${testimonial.id}`}
                className="flex-shrink-0 w-80 h-64 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-between relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              >
                {/* Quote Icon - Behind Card */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg -z-10">
                  <Quote className="w-4 h-4 text-white" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3 mt-1">
                  <div className="flex gap-1">
                    {renderStars(testimonial.rating)}
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {testimonial.rating}.0
                  </span>
                </div>

                {/* Testimonial Text */}
                <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed text-sm line-clamp-4 flex-grow">
                  &quot;{testimonial.text}&quot;
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-lg">
                      {!imageErrors[String(testimonial.id)] ? (
                        <Image
                          src={testimonial.imageUrl}
                          alt={`Portrait of ${testimonial.name}`}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                          onError={() => handleImageError(testimonial.id)}
                        />
                      ) : (
                        <div className="w-full h-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                          {testimonial.fallbackInitials}
                        </div>
                      )}
                    </div>

                    {/* Verification Badge */}
                    {testimonial.verified && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-white dark:border-slate-800">
                        <CheckCircle className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">
                        {testimonial.name}
                      </div>
                      {testimonial.role.includes("Dr.") && (
                        <Heart className="w-3 h-3 text-red-500 fill-current" />
                      )}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Duplicate set for seamless loop */}
            {testimonials.map((testimonial: Testimonial) => (
              <motion.div
                key={`second-${testimonial.id}`}
                className="flex-shrink-0 w-80 h-64 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-between relative"
              >
                {/* Quote Icon - Behind Card */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center shadow-lg -z-10">
                  <Quote className="w-4 h-4 text-white" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3 mt-1">
                  <div className="flex gap-1">
                    {renderStars(testimonial.rating)}
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {testimonial.rating}.0
                  </span>
                </div>

                {/* Testimonial Text */}
                <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed text-sm line-clamp-4 flex-grow">
                  &quot;{testimonial.text}&quot;
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-lg">
                      {!imageErrors[String(testimonial.id)] ? (
                        <Image
                          src={testimonial.imageUrl}
                          alt={`Portrait of ${testimonial.name}`}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                          onError={() => handleImageError(testimonial.id)}
                        />
                      ) : (
                        <div className="w-full h-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                          {testimonial.fallbackInitials}
                        </div>
                      )}
                    </div>

                    {/* Verification Badge */}
                    {testimonial.verified && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-white dark:border-slate-800">
                        <CheckCircle className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">
                        {testimonial.name}
                      </div>
                      {testimonial.role.includes("Dr.") && (
                        <Heart className="w-3 h-3 text-red-500 fill-current" />
                      )}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>

    </section>
  );
};

export default TestimonialSection;
