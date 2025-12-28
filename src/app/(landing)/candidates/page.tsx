import Link from 'next/link';
import { CheckCircle2, FileText, TrendingUp } from 'lucide-react';
import { HeroSection } from '@/components/landing/hero-section';
import { FeatureShowcase } from '@/components/landing/feature-showcase';
import { FinalCTA } from '@/components/landing/final-cta';
import { StepCard } from '@/components/landing/step-card';

export default function CandidatesPage() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection
        badge={{
          text: "For Job Seekers",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
          textColor: "text-blue-700 dark:text-blue-300",
        }}
        title={{
          before: "Your Next Career Move",
          highlight: "Starts Here",
          gradientFrom: "from-blue-600",
          gradientTo: "to-purple-600",
        }}
        description="Unlock your potential with AI-driven insights. We help you build a standout profile, match with top companies, and land the job you deserve."
        primaryCta={{
          text: "Build Your Profile",
          href: "/signup/candidate",
          bgColor: "bg-blue-600",
          hoverColor: "hover:bg-blue-700",
        }}
        secondaryCta={{
          text: "How It Works",
          href: "#how-it-works",
        }}
        image={{
          src: "/images/hero-candidates-black.png",
          alt: "Career Growth",
          gradientFrom: "from-blue-500/20",
          gradientTo: "to-purple-500/20",
        }}
      />

      {/* Steps Section */}
      <section id="how-it-works" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Your Journey to Success
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Three simple steps to land your dream job.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 dark:from-blue-800 dark:via-purple-800 dark:to-blue-800 -z-10" />
            <StepCard
              iconName="UserCheck"
              title="1. Create Profile"
              description="Build a comprehensive profile that highlights your unique skills and experiences."
              index={0}
              colorScheme="blue"
            />
            <StepCard
              iconName="Search"
              title="2. Get Matched"
              description="Our AI analyzes your profile to find roles that perfectly align with your goals."
              index={1}
              colorScheme="blue"
            />
            <StepCard
              iconName="Briefcase"
              title="3. Apply & Track"
              description="Apply with a single click and track your application status in real-time."
              index={2}
              colorScheme="blue"
            />
          </div>
        </div>
      </section>

      {/* Features Grid - Zig Zag */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 space-y-24">
          {/* Feature 1: Resume Analysis */}
          <FeatureShowcase
            title="Smart Resume Analysis"
            description="Get instant feedback on your resume. Our AI scans your CV against industry standards and job descriptions to suggest improvements that increase your chances of getting hired."
            imageSrc="/images/resume-analysis.png"
            imageAlt="AI Resume Analysis"
            imagePosition="left"
          >
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <ul className="space-y-3 mt-6">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Keyword Optimization</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Formatting Suggestions</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>ATS Compatibility Check</span>
              </li>
            </ul>
          </FeatureShowcase>

          {/* Feature 2: Application Tracking */}
          <FeatureShowcase
            title="Track Every Opportunity"
            description="Never lose track of an application again. Our intuitive dashboard lets you monitor the status of every job you've applied to, from submission to offer letter."
            imageSrc="/images/job-dashboard.png"
            imageAlt="Job Dashboard"
            imagePosition="right"
          >
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <ul className="space-y-3 mt-6">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Real-time Status Updates</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Interview Scheduling</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Application History</span>
              </li>
            </ul>
          </FeatureShowcase>
        </div>
      </section>

      {/* CTA Section */}
      <FinalCTA
        title="Ready to Accelerate Your Career?"
        description="Join thousands of professionals who have found their dream jobs through Career Edge."
        ctaText="Join Now - It's Free"
        ctaHref="/signup/candidate"
        bgColor="bg-blue-600"
      />
    </>
  );
}
