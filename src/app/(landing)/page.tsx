import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Zap,
  Shield,
  Globe,
  Star,
} from "lucide-react";
import { HeroSection } from "@/components/landing/hero-section";
import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { CallToActionCard } from "@/components/landing/cta-card";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section - Zig Zag */}
      <section id="features" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Why Choose Career Edge?
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              We provide the tools you need to succeed, whether you're hiring or
              hunting.
            </p>
          </div>

          <div className="space-y-24">
            {/* Feature 1: AI Matching */}
            <FeatureShowcase
              title="Smart AI Matching"
              description="Our advanced AI analyzes skills, experience, and cultural fit to connect the right candidates with the right opportunities instantly."
              imageSrc="/images/ai-matching.png"
              imageAlt="AI Matching"
              imagePosition="left"
            >
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Intelligent candidate-job matching
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Automated resume screening
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Cultural fit analysis
                </li>
              </ul>
            </FeatureShowcase>

            {/* Feature 2: ATS */}
            <FeatureShowcase
              title="Complete ATS Solution"
              description="Manage your entire recruitment pipeline from a single, intuitive dashboard. Track candidates, schedule interviews, and collaborate with your team."
              imageSrc="/images/ats-dashboard.png"
              imageAlt="ATS Dashboard"
              imagePosition="right"
            >
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Pipeline management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Collaborative hiring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Interview scheduling
                </li>
              </ul>
            </FeatureShowcase>

            {/* Feature 3: Assessments */}
            <FeatureShowcase
              title="Custom Assessments"
              description="Create tailored technical and behavioral assessments to evaluate candidates objectively and efficiently."
              imageSrc="/images/assessments.png"
              imageAlt="Assessments"
              imagePosition="left"
            >
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Technical skill tests
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  AI-powered interviews
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Automated grading
                </li>
              </ul>
            </FeatureShowcase>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                10K+
              </div>
              <div className="text-muted-foreground">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                50K+
              </div>
              <div className="text-muted-foreground">Candidates</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                500+
              </div>
              <div className="text-muted-foreground">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                95%
              </div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Everything You Need to Succeed
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Streamlined processes that save time and accelerate hiring
                  decisions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Secure & Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Enterprise-grade security with full GDPR and data protection
                  compliance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Global Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with talent and opportunities worldwide from one
                  platform.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Top-Rated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Trusted by thousands with an average 4.8/5 rating from our
                  users.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Work seamlessly with your hiring team using shared workflows
                  and tools.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Career Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Resume builders, interview prep, and career guidance powered
                  by AI.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Get Started Today
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Join thousands of companies and candidates finding success on our
              platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <CallToActionCard
              title="For Candidates"
              subtitle="Find your dream job"
              iconName="Briefcase"
              features={[
                "AI-Powered Job Matching",
                "Resume Builder & Analysis",
                "Interview Preparation",
                "Career Guidance",
              ]}
              ctaText="Start Job Search"
              ctaHref="/candidates"
              gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
            />

            <CallToActionCard
              title="For Companies"
              subtitle="Hire top talent"
              iconName="Users"
              features={[
                "Full ATS Solution",
                "AI Candidate Screening",
                "Custom Assessments",
                "Quality Talent Pool",
              ]}
              ctaText="Hire Top Talent"
              ctaHref="/companies"
              gradient="bg-gradient-to-br from-purple-500 to-pink-500"
            />
          </div>
        </div>
      </section>
    </>
  );
}
