"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  HeartPulse,
  Users,
  Lightbulb,
  ShieldCheck,
  Target,
  Eye,
  Award,
  Globe,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Twitter,
  Linkedin,
  User,
  GraduationCap,
  Briefcase,
  MessageCircle,
  Zap,
  Brain,
  Activity,
} from "lucide-react";
import Link from "next/link";
import CommonHero from "@/components/common/common-hero";
import AboutScrollSection from "@/components/home/about-scroll-section";

// Define interfaces for TypeScript
interface TeamMember {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  fallbackUrl: string;
  experience: string;
  education: string;
  achievements: string[];
  social: {
    linkedin?: string;
    twitter?: string;
  };
}

interface CoreValue {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

interface Milestone {
  year: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Stat {
  number: string;
  label: string;
  icon: React.ReactNode;
}

// Team members data with working image URLs
const teamMembers: TeamMember[] = [
  {
    name: "Dr. Anya Sharma",
    role: "Founder & Chief Wellness Officer",
    bio: "With over 15 years in holistic medicine, Dr. Sharma founded Wellness Fuel to make personalized health accessible to everyone. She's a pioneer in integrating traditional healing with modern technology.",
    imageUrl:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=400&auto=format&fit=crop",
    fallbackUrl: "https://via.placeholder.com/400x400/bed16b/ffffff?text=AS",
    experience: "15+ Years",
    education: "MD (Ayurveda), PhD (Holistic Medicine)",
    achievements: [
      "Published 50+ Research Papers",
      "Awarded Best Doctor 2023",
      "Speaker at 100+ Conferences",
    ],
    social: {
      linkedin: "https://linkedin.com/in/dr-anya-sharma",
      twitter: "https://twitter.com/dr_anya_sharma",
    },
  },
  {
    name: "Rohan Verma",
    role: "Head of Technology & Co-Founder",
    bio: "Rohan is the architect behind our innovative platform, ensuring a seamless and secure experience for all our users. He's passionate about using technology to solve real-world health problems.",
    imageUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
    fallbackUrl: "https://via.placeholder.com/400x400/bed16b/ffffff?text=RV",
    experience: "12+ Years",
    education: "MS Computer Science, Stanford",
    achievements: [
      "Ex-Google Engineer",
      "10+ Patents in Health Tech",
      "Forbes 30 Under 30",
    ],
    social: {
      linkedin: "https://linkedin.com/in/rohan-verma",
      twitter: "https://twitter.com/rohan_verma",
    },
  },
  {
    name: "Dr. Priya Singh",
    role: "Lead Nutritionist & Clinical Director",
    bio: "Priya leads our team of expert doctors, crafting personalized plans that deliver real results and sustainable habits. She's a certified nutritionist with expertise in functional medicine.",
    imageUrl:
      "https://images.unsplash.com/photo-1594824883303-aef7c5324f7c?q=80&w=400&auto=format&fit=crop",
    fallbackUrl: "https://via.placeholder.com/400x400/bed16b/ffffff?text=PS",
    experience: "10+ Years",
    education: "MSc Nutrition, RD, Certified Functional Medicine Practitioner",
    achievements: [
      "Helped 5000+ Patients",
      "Author of 'Nutrition Revolution'",
      "TV Health Expert",
    ],
    social: {
      linkedin: "https://linkedin.com/in/dr-priya-singh",
      twitter: "https://twitter.com/dr_priya_singh",
    },
  },
  {
    name: "Dr. Amit Patel",
    role: "Head of Research & Development",
    bio: "Dr. Patel leads our research initiatives, ensuring all our recommendations are backed by the latest scientific evidence. He's a published researcher in preventive medicine.",
    imageUrl:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop",
    fallbackUrl: "https://via.placeholder.com/400x400/bed16b/ffffff?text=AP",
    experience: "8+ Years",
    education: "PhD (Preventive Medicine), MD (Internal Medicine)",
    achievements: [
      "100+ Research Publications",
      "NIH Grant Recipient",
      "International Speaker",
    ],
    social: {
      linkedin: "https://linkedin.com/in/dr-amit-patel",
      twitter: "https://twitter.com/dr_amit_patel",
    },
  },
  {
    name: "Sarah Johnson",
    role: "Head of User Experience",
    bio: "Sarah ensures every interaction with our platform is intuitive and delightful. She's passionate about creating experiences that make health management effortless and engaging.",
    imageUrl:
      "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=400&auto=format&fit=crop",
    fallbackUrl: "https://via.placeholder.com/400x400/bed16b/ffffff?text=SJ",
    experience: "6+ Years",
    education: "MS Human-Computer Interaction, Carnegie Mellon",
    achievements: [
      "UX Design Award Winner",
      "Ex-Apple Designer",
      "50+ App Launches",
    ],
    social: {
      linkedin: "https://linkedin.com/in/sarah-johnson-ux",
      twitter: "https://twitter.com/sarah_johnson_ux",
    },
  },
  {
    name: "Dr. Rajesh Kumar",
    role: "Head of Ayurvedic Medicine",
    bio: "Dr. Kumar brings ancient wisdom to modern wellness, specializing in traditional Ayurvedic treatments and holistic healing approaches for chronic conditions.",
    imageUrl:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
    fallbackUrl: "https://via.placeholder.com/400x400/bed16b/ffffff?text=RK",
    experience: "20+ Years",
    education: "BAMS, MD (Ayurveda), Panchakarma Specialist",
    achievements: [
      "Traditional Medicine Expert",
      "5000+ Successful Treatments",
      "Ayurveda Research Pioneer",
    ],
    social: {
      linkedin: "https://linkedin.com/in/dr-rajesh-kumar",
      twitter: "https://twitter.com/dr_rajesh_kumar",
    },
  },
];

// Core values data
const coreValues: CoreValue[] = [
  {
    icon: <Target className="w-12 h-12" />,
    title: "Personalization First",
    description:
      "Every solution is tailored to your unique body, lifestyle, and goals because health is not one-size-fits-all. We believe in precision wellness.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <HeartPulse className="w-12 h-12" />,
    title: "Expert-Driven Care",
    description:
      "Our platform is backed by certified doctors, nutritionists, and wellness experts you can trust. Quality care is our foundation.",
    color: "from-red-500 to-pink-500",
  },
  {
    icon: <Users className="w-12 h-12" />,
    title: "Community & Support",
    description:
      "Join a vibrant community dedicated to supporting each other on the path to better health. Together we're stronger.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: <Lightbulb className="w-12 h-12" />,
    title: "Constant Innovation",
    description:
      "We are always exploring new ways to make your wellness journey more effective and enjoyable through cutting-edge technology.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: <ShieldCheck className="w-12 h-12" />,
    title: "Trust & Transparency",
    description:
      "Your health and data are sacred. We are committed to the highest standards of privacy, security, and ethical practice.",
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: <Globe className="w-12 h-12" />,
    title: "Accessible Wellness",
    description:
      "We believe everyone deserves access to quality healthcare. Our mission is to make wellness affordable and accessible to all.",
    color: "from-teal-500 to-blue-500",
  },
];

// Company milestones
const milestones: Milestone[] = [
  {
    year: "2020",
    title: "Company Founded",
    description:
      "Wellness Fuel was born with a vision to revolutionize personal healthcare through technology and expert guidance.",
    icon: <Zap className="w-8 h-8" />,
  },
  {
    year: "2021",
    title: "First 1000 Users",
    description:
      "Reached our first milestone of 1000 active users, proving the demand for personalized wellness solutions.",
    icon: <Users className="w-8 h-8" />,
  },
  {
    year: "2022",
    title: "AI Integration",
    description:
      "Launched our AI-powered recommendation engine, making personalized health plans more accurate and effective.",
    icon: <Brain className="w-8 h-8" />,
  },
  {
    year: "2023",
    title: "50+ Expert Doctors",
    description:
      "Expanded our network to include 50+ certified healthcare professionals across various specialties.",
    icon: <Award className="w-8 h-8" />,
  },
  {
    year: "2024",
    title: "Global Expansion",
    description:
      "Launched in 5 countries, bringing our wellness solutions to a global audience of health-conscious individuals.",
    icon: <Globe className="w-8 h-8" />,
  },
];

// Company statistics
const stats: Stat[] = [
  {
    number: "50,000+",
    label: "Happy Users",
    icon: <Users className="w-8 h-8" />,
  },
  {
    number: "50+",
    label: "Expert Doctors",
    icon: <Award className="w-8 h-8" />,
  },
  {
    number: "15+",
    label: "Countries",
    icon: <Globe className="w-8 h-8" />,
  },
  {
    number: "95%",
    label: "Success Rate",
    icon: <TrendingUp className="w-8 h-8" />,
  },
];

const AboutPage: React.FC = () => {
  const [storyImageError, setStoryImageError] = useState<boolean>(false);
  const [teamImageErrors, setTeamImageErrors] = useState<
    Record<string, boolean>
  >({});

  const handleStoryImageError = (): void => {
    setStoryImageError(true);
  };

  const handleTeamImageError = (memberName: string): void => {
    setTeamImageErrors((prev) => ({ ...prev, [memberName]: true }));
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950 min-h-screen">
      {/* Hero Section */}
      <CommonHero
        title="About Wellness Fuel"
        description="We are revolutionizing personal healthcare through technology, expert guidance, and a supportive community dedicated to your wellness journey."
        image="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=800&auto=format&fit=crop"
        breadcrumbs={[{ label: "About Us" }]}
      />

      <AboutScrollSection />

      {/* Mission & Vision Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl"
            animate={{ scale: [1.1, 1, 1.1] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Mission */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                  Our Mission
                </h2>
              </div>
              <p className="text-xl text-slate-600 leading-relaxed">
                To democratize access to personalized healthcare by connecting
                individuals with expert guidance, cutting-edge technology, and a
                supportive community that empowers everyone to achieve their
                optimal wellness.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <p className="text-slate-600 dark:text-slate-400">
                    Make quality healthcare accessible to everyone, everywhere
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <p className="text-slate-600 dark:text-slate-400">
                    Provide personalized, evidence-based wellness solutions
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <p className="text-slate-600 dark:text-slate-400">
                    Build a community that supports and inspires healthy living
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/40">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  Our Vision
                </h2>
              </div>
              <p className="text-xl text-slate-600 leading-relaxed">
                To create a world where everyone has the tools, knowledge, and
                support they need to live their healthiest, most vibrant life.
                We envision a future where preventive healthcare is the norm,
                not the exception.
              </p>
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/30">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  By 2030, we aim to:
                </h3>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                    Serve 1 million+ users worldwide
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                    Partner with 1000+ healthcare professionals
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                    Expand to 50+ countries globally
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Making a real difference in people&apos;s lives
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center p-8 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-slate-800/90 dark:via-blue-950/30 dark:to-indigo-950/30 rounded-2xl shadow-xl shadow-blue-500/10 border border-blue-200/50 dark:border-blue-700/30"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.3)",
                }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/40">
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-lg text-blue-900 dark:text-blue-100 font-bold">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent mb-6">
                Our Story
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Wellness Fuel was born from a simple yet powerful idea: everyone
                deserves access to personalized, credible, and holistic health
                guidance. In a world filled with conflicting information and
                one-size-fits-all solutions, we saw the need for a single,
                trustworthy platform that simplifies the path to well-being.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Founded in 2020 by Dr. Anya Sharma and Rohan Verma, we started
                by bringing together a diverse team of doctors, technologists,
                and wellness enthusiasts. Today, we are proud to have helped
                thousands of individuals build sustainable, healthy habits for
                life.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40">
                  <HeartPulse className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Founded with Purpose
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Making healthcare accessible and personalized
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {!storyImageError ? (
                  <Image
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=800&auto=format&fit=crop"
                    alt="Doctor working on a laptop, representing the tech and health fusion"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                    onError={handleStoryImageError}
                  />
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <div className="text-white text-center p-8">
                      <HeartPulse className="w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold">Our Story</h3>
                      <p className="text-lg opacity-90">Health & Technology</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-20"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-20"
                animate={{
                  scale: [1.1, 1, 1.1],
                  rotate: [360, 180, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <motion.div
                key={value.title}
                className="group relative bg-white dark:bg-slate-800/90 rounded-2xl shadow-xl shadow-blue-500/10 border border-blue-200/50 dark:border-blue-700/30 overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.02,
                  y: -5,
                  boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.3)",
                }}
              >
                <div className="p-8">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <div className="text-white">{value.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Key milestones in our growth and impact
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-600 via-indigo-500 to-cyan-500 rounded-full shadow-lg"></div>

            <div className="space-y-16">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  <div
                    className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}
                  >
                    <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xl shadow-blue-500/10 border border-blue-200/50 dark:border-blue-700/30 p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                          <div className="text-white">{milestone.icon}</div>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {milestone.title}
                          </h3>
                          <p className="text-lg font-semibold text-blue-600">
                            {milestone.year}
                          </p>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="relative z-10 w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full border-4 border-white dark:border-slate-900 shadow-lg shadow-blue-500/40"></div>

                  <div className="w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Meet The Team Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              The passionate minds behind Wellness Fuel
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                className="group bg-white dark:bg-slate-800/90 rounded-2xl shadow-xl shadow-blue-500/10 border border-blue-200/50 dark:border-blue-700/30 overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.02,
                  y: -5,
                  boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.3)",
                }}
              >
                <div className="relative h-64 w-full">
                  {!teamImageErrors[member.name] ? (
                    <Image
                      src={member.imageUrl}
                      alt={`Portrait of ${member.name}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={() => handleTeamImageError(member.name)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">
                        {member.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Social Links */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {member.social.linkedin && (
                      <a
                        href={member.social.linkedin}
                        className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-4 h-4 text-slate-700" />
                      </a>
                    )}
                    {member.social.twitter && (
                      <a
                        href={member.social.twitter}
                        className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="w-4 h-4 text-slate-700" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-lg font-semibold text-blue-600 mb-3">
                    {member.role}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Briefcase className="w-4 h-4" />
                      <span>{member.experience}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <GraduationCap className="w-4 h-4" />
                      <span className="line-clamp-1">{member.education}</span>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                    {member.bio}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Key Achievements:
                    </h4>
                    <ul className="space-y-1">
                      {member.achievements
                        .slice(0, 2)
                        .map((achievement, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                          >
                            <Star className="w-3 h-3 text-blue-600 flex-shrink-0" />
                            <span>{achievement}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent mb-4">
                  Get in Touch
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400">
                  Have questions about our services or want to join our team?
                  We&apos;d love to hear from you.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Email Us
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      hello@wellnessfuel.com
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/40">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Call Us
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      +1 (555) 123-4567
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Visit Us
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      123 Wellness Street, Health City, HC 12345
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-semibold rounded-full shadow-xl shadow-blue-500/50 hover:shadow-2xl hover:shadow-blue-600/60 transition-all duration-300 flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Us
                </Link>
                <Link
                  href="/careers"
                  className="px-8 py-4 border-2 border-blue-500/50 dark:border-indigo-500/50 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-600 dark:hover:border-indigo-400 font-semibold rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm"
                >
                  <User className="w-5 h-5" />
                  Join Our Team
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-2xl p-8 md:p-12 text-center shadow-2xl shadow-blue-500/50">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Ready to Start Your Journey?
                </h3>
                <p className="text-lg text-white/90 mb-8">
                  Join thousands of others who are transforming their lives with
                  Wellness Fuel. Get started today and discover a healthier,
                  happier you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/products"
                    className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-full shadow-xl hover:bg-slate-100 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
                  >
                    <Activity className="w-5 h-5" />
                    Explore Our Products
                  </Link>
                  <Link
                    href="/our-doctors"
                    className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-blue-700 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm transform hover:scale-105"
                  >
                    <Users className="w-5 h-5" />
                    Meet Our Doctors
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
