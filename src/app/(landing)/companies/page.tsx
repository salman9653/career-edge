import Link from 'next/link';
import { CheckCircle2, BarChart3, Target } from 'lucide-react';
import { HeroSection } from '@/components/landing/hero-section';
import { FeatureShowcase } from '@/components/landing/feature-showcase';
import { FinalCTA } from '@/components/landing/final-cta';
import { StepCard } from '@/components/landing/step-card';

export default function CompaniesPage() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection
        badge={{
          text: "For Employers",
          bgColor: "bg-orange-100 dark:bg-orange-900/30",
          textColor: "text-orange-700 dark:text-orange-300",
        }}
        title={{
          before: "Build Your Dream Team",
          highlight: "With AI Precision",
          gradientFrom: "from-orange-600",
          gradientTo: "to-red-600",
        }}
        description="Transform your hiring process. Our AI-powered platform helps you identify, screen, and hire the best talent 10x faster than traditional methods."
        primaryCta={{
          text: "Start Hiring Now",
          href: "/signup/company",
          bgColor: "bg-orange-600",
          hoverColor: "hover:bg-orange-700",
        }}
        secondaryCta={{
          text: "Explore Solutions",
          href: "#solutions",
        }}
        image={{
          src: "/images/hero-companies-black.png",
          alt: "Team Building",
          gradientFrom: "from-orange-500/20",
          gradientTo: "to-red-500/20",
        }}
      />

      {/* Steps Section */}
      <section id="solutions" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Streamlined Hiring Workflow
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              From posting to offer letter in record time.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-orange-200 via-red-200 to-orange-200 dark:from-orange-800 dark:via-red-800 dark:to-orange-800 -z-10" />
            <StepCard
              iconName="Briefcase"
              title="1. Post a Job"
              description="Create detailed job listings with AI-assisted descriptions to attract the right candidates."
              index={0}
              colorScheme="orange"
            />
            <StepCard
              iconName="Zap"
              title="2. AI Screening"
              description="Our AI automatically screens resumes and ranks candidates based on your specific criteria."
              index={1}
              colorScheme="orange"
            />
            <StepCard
              iconName="Users"
              title="3. Hire Confidence"
              description="Interview top candidates and make data-driven hiring decisions with ease."
              index={2}
              colorScheme="orange"
            />
          </div>
        </div>
      </section>

      {/* Features Grid - Zig Zag */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 space-y-24">
          {/* Feature 1: Intelligent Matching */}
          <FeatureShowcase
            title="Intelligent Candidate Matching"
            description="Don't just wait for applications. Our system proactively identifies candidates who match your requirements, even if they haven't applied yet."
            imageSrc="/images/ai-matching.png"
            imageAlt="Intelligent Matching"
            imagePosition="left"
          >
            <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
              <Target className="h-6 w-6" />
            </div>
            <ul className="space-y-3 mt-6">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Skill-based Matching</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Culture Fit Assessment</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Predictive Performance Analytics</span>
              </li>
            </ul>
          </FeatureShowcase>

          {/* Feature 2: Automated Screening */}
          <FeatureShowcase
            title="Automated Resume Screening"
            description="Save hours of manual review. Our AI parses resumes, extracts key data, and scores candidates against your job description instantly."
            imageSrc="/images/resume-analysis.png"
            imageAlt="Resume Screening"
            imagePosition="right"
          >
            <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
              <BarChart3 className="h-6 w-6" />
            </div>
            <ul className="space-y-3 mt-6">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Instant Candidate Ranking</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Keyword & Skill Extraction</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Unbiased Evaluation</span>
              </li>
            </ul>
          </FeatureShowcase>
        </div>
      </section>

      {/* CTA Section */}
      <FinalCTA
        title="Start Hiring Smarter Today"
        description="Join forward-thinking companies that are building world-class teams with Career Edge."
        ctaText="Get Started for Free"
        ctaHref="/signup/company"
        bgColor="bg-orange-600"
      />
    </>
  );
}
