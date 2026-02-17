"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Star,
  MapPin,
  Calendar,
  MessageCircle,
  Award,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Redux Imports
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchDoctors,
  selectUsersData,
  selectUsersLoading,
  selectUsersError,
  User,
} from "@/lib/redux/features/userSlice";

// Define interface for UI Display
interface DoctorUI {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  patients: string;
  location: string;
  imageUrl: string;
  fallbackInitials: string;
  languages: string[];
  education: string;
  consultationFee: string;
  about: string;
}

const DoctorsSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const rawUsers = useAppSelector(selectUsersData);
  const isLoading = useAppSelector(selectUsersLoading);
  const error = useAppSelector(selectUsersError);

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Fetch Doctors on Mount
  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  // Debug: Log raw users whenever they change
  useEffect(() => {}, [rawUsers]);

  // Filter and Map Redux Data to UI Structure
  const doctors: DoctorUI[] = rawUsers
    .filter((user) => user.role === "Doctor") // Keep explicit filtering for safety
    .map((user: User) => ({
      id: user._id,
      name: `Dr. ${user.firstName} ${user.lastName}`,
      specialty: user.specialization || user.occupation || "General Specialist",
      experience: user.experience ? `${user.experience} years` : "New",
      rating: 5.0,
      patients: user.followers ? `${user.followers}+` : "100+",
      location: user.location || user.address || "Online",
      imageUrl: user.imageUrl || "",
      fallbackInitials: `${user.firstName[0]}${user.lastName[0]}`,
      languages:
        user.language && user.language.length > 0 ? user.language : ["English"],
      education: user.qualifications || "Medical Specialist",
      consultationFee: user.consultationFee
        ? `$${user.consultationFee}`
        : "Free",
      about:
        user.bio ||
        `Dr. ${user.lastName} is a dedicated specialist committed to providing top-tier healthcare.`,
    }));

  const handleImageError = (doctorId: string): void => {
    setImageErrors((prev) => ({ ...prev, [doctorId]: true }));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? "text-[#ea8f39] fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Enhanced Animated Blobs (Background) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/8 to-blue-400/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-r from-indigo-500/8 to-indigo-400/5 rounded-full blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], rotate: [360, 180, 0] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
            <span className="text-foreground">
              Meet Our <span className="text-primary">Expert Doctors</span>
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Our team of board-certified medical professionals is dedicated to
            providing you with the highest quality healthcare services.
          </motion.p>
        </motion.div>

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
              Failed to load doctors
            </p>
            <p className="text-slate-500 dark:text-slate-400 mb-4">{error}</p>
            <Button
              onClick={() => dispatch(fetchDoctors())}
              variant="outline"
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && doctors.length === 0 && (
          <div className="text-center text-slate-500 py-10">
            <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg">No doctors available at the moment.</p>
            <p className="text-sm text-slate-400 mt-2">
              Please check back later or contact support.
            </p>
          </div>
        )}

        {/* Doctors Grid */}
        {!isLoading && !error && doctors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
            {doctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              >
                {/* Doctor Image & Info */}
                <div className="relative p-4 pb-3 flex-grow">
                  <div className="relative w-24 h-24 mx-auto mb-3">
                    {!imageErrors[doctor.id] && doctor.imageUrl ? (
                      <Image
                        src={doctor.imageUrl}
                        alt={`Portrait of ${doctor.name}`}
                        fill
                        className="object-cover rounded-full border-4 border-white dark:border-slate-700 shadow-lg"
                        sizes="96px"
                        onError={() => handleImageError(doctor.id)}
                      />
                    ) : (
                      <div className="w-full h-full bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-slate-700 shadow-lg">
                        {doctor.fallbackInitials}
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {doctor.name}
                    </h3>
                    <p className="text-[#ea8f39] font-semibold text-base mb-2">
                      {doctor.specialty}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                      {doctor.education}
                    </p>

                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="flex gap-1">
                        {renderStars(doctor.rating)}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {doctor.rating}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({doctor.patients})
                      </span>
                    </div>
                  </div>

                  {/* Stats & Details */}
                  <div className="mt-4 px-2">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <Award className="w-3 h-3 text-[#bed16b]" />
                        <span>{doctor.experience}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <Users className="w-3 h-3 text-[#bed16b]" />
                        <span>{doctor.patients} Patients</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-3">
                      <MapPin className="w-3 h-3 text-[#bed16b]" />
                      <span>{doctor.location}</span>
                    </div>

                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {doctor.languages.map((lang, langIndex) => (
                          <span
                            key={langIndex}
                            className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full border"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 h-8">
                      {doctor.about}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 pt-0 mt-auto">
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-primary text-white py-2 text-md font-semibold rounded-full">
                      <Calendar className="w-4 h-4 mr-1" />
                      Book ({doctor.consultationFee})
                    </Button>
                    <Button
                      variant="outline"
                      className="px-3 py-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-full"
                      title="Send Message"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DoctorsSection;
