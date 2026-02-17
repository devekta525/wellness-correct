"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Star,
  MapPin,
  Clock,
  Phone,
  Award,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import CommonHero from "@/components/common/common-hero";

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
  specialization: string;
  qualification: string;
  experience: string;
  rating: number;
  location: string;
  imageUrl: string;
  fallbackInitials: string;
  availability: string;
  consultationFee: string;
  languages: string[];
  about: string;
}

const OurDoctorsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const rawUsers = useAppSelector(selectUsersData);
  const isLoading = useAppSelector(selectUsersLoading);
  const error = useAppSelector(selectUsersError);

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Fetch Doctors on Mount
  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  // Map Redux Data to UI Structure
  const doctors: DoctorUI[] = rawUsers
    .filter((user) => user.role === "Doctor")
    .map((user: User) => ({
      id: user._id,
      name: `Dr. ${user.firstName} ${user.lastName}`,
      specialization:
        user.specialization || user.occupation || "General Specialist",
      qualification: user.qualifications || "Medical Specialist",
      experience: user.experience ? `${user.experience} years` : "New",
      rating: 4.8, // Default rating
      location: user.location || user.address || "Online",
      imageUrl: user.imageUrl || "",
      fallbackInitials: `${user.firstName[0]}${user.lastName[0]}`,
      availability: user.availability || "Mon-Fri, 9 AM - 6 PM",
      consultationFee: user.consultationFee
        ? `₹${user.consultationFee}`
        : "Free",
      languages:
        user.language && user.language.length > 0 ? user.language : ["English"],
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
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Hero Section */}
      <CommonHero
        title="Our Doctors"
        description="Connect with certified healthcare professionals who are passionate about your wellness journey. Our doctors specialize in holistic and natural healing approaches."
        image="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=800&auto=format&fit=crop"
        breadcrumbs={[{ label: "Our Doctors", href: "/our-doctors" }]}
      />

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-slate-800">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {doctors.length}+
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Expert Doctors
              </div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                10,000+
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Happy Patients
              </div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                15+
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Years Experience
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Grid Section */}
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
              Failed to load doctors
            </p>
            <p className="text-slate-500 dark:text-slate-400 mb-4">{error}</p>
            <button
              onClick={() => dispatch(fetchDoctors())}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <div className="flex flex-col justify-center items-center py-24">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Loading doctors...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && doctors.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-20 h-20 mx-auto mb-4 text-slate-300" />
            <p className="text-xl text-slate-500 mb-2">
              No doctors available at the moment.
            </p>
            <p className="text-sm text-slate-400">
              Please check back later or contact support.
            </p>
          </div>
        )}

        {/* Doctors Grid */}
        {!isLoading && !error && doctors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {doctors.map((doctor: DoctorUI) => (
              <div
                key={doctor.id}
                className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xl shadow-blue-500/10 border border-blue-200/50 dark:border-blue-700/30 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2"
              >
                {/* Doctor Image */}
                <div className="relative h-64 w-full">
                  {!imageErrors[doctor.id] && doctor.imageUrl ? (
                    <Image
                      src={doctor.imageUrl}
                      alt={`Portrait of ${doctor.name}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={() => handleImageError(doctor.id)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-6xl font-bold mb-2">
                          {doctor.fallbackInitials}
                        </div>
                        <p className="text-xl font-semibold">{doctor.name}</p>
                      </div>
                    </div>
                  )}

                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-full px-3 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold text-sm">
                      {doctor.rating}
                    </span>
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                      {doctor.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold">
                      {doctor.specialization}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {doctor.qualification}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">{renderStars(doctor.rating)}</div>
                    <span className="text-sm text-muted-foreground">
                      ({doctor.rating}/5.0)
                    </span>
                  </div>

                  {/* Experience & Location */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span>{doctor.experience} experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{doctor.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>{doctor.availability}</span>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Languages:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {doctor.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded-full"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* About */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {doctor.about}
                  </p>

                  {/* Consultation Fee */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Consultation Fee:
                    </span>
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {doctor.consultationFee}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-semibold rounded-full shadow-xl shadow-blue-500/50 transition-all duration-300 transform hover:scale-105">
                      <Calendar className="w-4 h-4" />
                      Book Consultation
                    </button>
                    <button className="p-2 rounded-full bg-blue-50 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors border border-blue-200 dark:border-slate-600">
                      <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent mb-4">
            Can&apos;t Find the Right Doctor?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Our wellness experts can help you find the perfect healthcare
            professional for your specific needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-semibold rounded-full shadow-xl shadow-blue-500/50 transition-all duration-300 transform hover:scale-105">
              Get Personalized Recommendations
            </button>
            <Link
              href="/contact"
              className="px-8 py-3 border-2 border-blue-500/50 dark:border-indigo-500/50 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-600 dark:hover:border-indigo-400 font-semibold rounded-full shadow-lg backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 transition-all duration-300"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurDoctorsPage;