import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import {
  Zap,
  Target,
  TrendingUp,
  Mail,
  Users,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bot,
  Calendar,
  MessageSquare,
  Star,
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Target,
      title: "Account-Based CRM",
      description: "Focus on companies, not just contacts. Build relationships that drive revenue.",
      color: "bg-yellow-400",
    },
    {
      icon: Bot,
      title: "AI-Powered Insights",
      description: "Get intelligent recommendations and automate repetitive tasks with AI.",
      color: "bg-blue-400",
    },
    {
      icon: Mail,
      title: "Email Sequences",
      description: "Create automated email campaigns with templates and analytics.",
      color: "bg-pink-400",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Notes, tasks, and activity tracking keep everyone aligned.",
      color: "bg-green-400",
    },
    {
      icon: BarChart3,
      title: "Pipeline Management",
      description: "Visual pipeline with drag-and-drop stages and forecasting.",
      color: "bg-purple-400",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Automated prospecting and follow-up reminders.",
      color: "bg-orange-400",
    },
  ];

  const pricing = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for solopreneurs",
      features: [
        "1,000 contacts",
        "Email sequences",
        "Basic CRM",
        "Activity tracking",
        "Email support",
      ],
      color: "bg-yellow-300",
      popular: false,
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "For growing teams",
      features: [
        "10,000 contacts",
        "Advanced automation",
        "AI insights",
        "Custom workflows",
        "Priority support",
        "Team tools",
      ],
      color: "bg-blue-300",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Unlimited contacts",
        "Dedicated manager",
        "Custom integrations",
        "Advanced security",
        "SLA guarantee",
        "White-label",
      ],
      color: "bg-pink-300",
      popular: false,
    },
  ];

  const testimonials = [
    {
      quote: "siaCRM transformed how we manage our enterprise accounts. The AI insights alone saved us 10 hours a week.",
      author: "Sarah Chen",
      role: "VP of Sales, TechCorp",
      color: "bg-green-200",
    },
    {
      quote: "Finally, a CRM that understands account-based selling. Our close rate increased by 40% in the first quarter.",
      author: "Michael Rodriguez",
      role: "Head of Revenue, GrowthLabs",
      color: "bg-purple-200",
    },
    {
      quote: "The email automation and sequence templates are game-changers. We've scaled our outreach 3x without adding headcount.",
      author: "Emily Watson",
      role: "Founder, StartupX",
      color: "bg-orange-200",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-10" />}
            <span className="text-2xl font-black">
              <span className="font-light">sia</span>
              <span className="font-black">CRM</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-lg font-bold hover:underline">
              Features
            </a>
            <a href="#pricing" className="text-lg font-bold hover:underline">
              Pricing
            </a>
            <a href="#testimonials" className="text-lg font-bold hover:underline">
              Testimonials
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold"
              asChild
            >
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
            <Button
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-500 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-black"
              asChild
            >
              <a href={getLoginUrl()}>Get Started</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <Badge className="mb-4 bg-yellow-400 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg px-6 py-2 font-black">
              <Sparkles className="h-5 w-5 mr-2" />
              AI-POWERED CRM
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
              Close More Deals with
              <span className="block mt-4 text-blue-600 [text-shadow:4px_4px_0px_rgba(0,0,0,1)]">
                Autonomous Revenue Intelligence
              </span>
            </h1>
            <p className="text-2xl md:text-3xl font-bold max-w-3xl mx-auto">
              The account-based CRM that combines AI insights and automated workflows to help your team focus on closing deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Button
                size="lg"
                className="bg-pink-400 hover:bg-pink-500 text-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all font-black text-xl px-12 py-8"
                asChild
              >
                <a href={getLoginUrl()}>
                  START FREE TRIAL
                  <ArrowRight className="ml-3 h-6 w-6" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all font-black text-xl px-12 py-8 bg-white"
                asChild
              >
                <a href="#pricing">VIEW PRICING</a>
              </Button>
            </div>
            <p className="text-lg font-bold pt-4">
              🎉 No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 [text-shadow:3px_3px_0px_rgba(0,0,0,0.1)]">
              Everything you need to scale revenue
            </h2>
            <p className="text-2xl font-bold max-w-3xl mx-auto">
              Built for modern sales teams who need speed, intelligence, and automation
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`${feature.color} border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all`}
              >
                <div className="h-16 w-16 rounded-full bg-white border-4 border-black flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-2xl font-black mb-4">{feature.title}</h3>
                <p className="text-lg font-bold">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-purple-100 via-blue-100 to-green-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 [text-shadow:3px_3px_0px_rgba(0,0,0,0.1)]">
              Simple, transparent pricing
            </h2>
            <p className="text-2xl font-bold max-w-3xl mx-auto">
              Choose the plan that fits your team. All plans include a 14-day free trial.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricing.map((plan, index) => (
              <div
                key={index}
                className={`${plan.color} border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 relative ${
                  plan.popular ? "scale-105 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-black text-white border-4 border-white text-lg px-6 py-2 font-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                      <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
                      MOST POPULAR
                    </Badge>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-3xl font-black mb-2">{plan.name}</h3>
                  <p className="text-lg font-bold">{plan.description}</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-black">{plan.price}</span>
                  {plan.period && (
                    <span className="text-2xl font-bold">{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 shrink-0 mt-1" />
                      <span className="text-lg font-bold">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-white text-black hover:bg-gray-100"
                  } border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-black text-lg py-6`}
                  asChild
                >
                  <a href={getLoginUrl()}>
                    {plan.price === "Custom" ? "CONTACT SALES" : "START FREE TRIAL"}
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 [text-shadow:3px_3px_0px_rgba(0,0,0,0.1)]">
              Loved by revenue teams everywhere
            </h2>
            <p className="text-2xl font-bold max-w-3xl mx-auto">
              See what our customers have to say about siaCRM
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`${testimonial.color} border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8`}
              >
                <MessageSquare className="h-12 w-12 mb-6" />
                <p className="text-xl font-bold mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="text-xl font-black">{testimonial.author}</p>
                  <p className="text-lg font-bold">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-200 via-pink-200 to-blue-200">
        <div className="container mx-auto px-4">
          <div className="bg-black text-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-5xl mx-auto p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              Ready to transform your sales process?
            </h2>
            <p className="text-2xl font-bold mb-10 max-w-3xl mx-auto">
              Join hundreds of teams already using siaCRM to close more deals faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                className="bg-yellow-400 hover:bg-yellow-500 text-black border-4 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all font-black text-xl px-12 py-8"
                asChild
              >
                <a href={getLoginUrl()}>
                  START FREE TRIAL
                  <ArrowRight className="ml-3 h-6 w-6" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-4 border-white text-white hover:bg-white hover:text-black shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all font-black text-xl px-12 py-8"
                asChild
              >
                <a href="#pricing">VIEW PRICING</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-black py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
                <span className="text-xl font-black">
                  <span className="font-light">sia</span>
                  <span className="font-black">CRM</span>
                </span>
              </div>
              <p className="text-lg font-bold">
                Autonomous revenue intelligence for modern sales teams.
              </p>
            </div>
            <div>
              <h3 className="font-black text-xl mb-4">Product</h3>
              <ul className="space-y-2 text-lg font-bold">
                <li><a href="#features" className="hover:underline">Features</a></li>
                <li><a href="#pricing" className="hover:underline">Pricing</a></li>
                <li><a href={getLoginUrl()} className="hover:underline">Sign In</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-black text-xl mb-4">Company</h3>
              <ul className="space-y-2 text-lg font-bold">
                <li><a href="#" className="hover:underline">About</a></li>
                <li><a href="#" className="hover:underline">Blog</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-black text-xl mb-4">Support</h3>
              <ul className="space-y-2 text-lg font-bold">
                <li><a href="#" className="hover:underline">Help Center</a></li>
                <li><a href="#" className="hover:underline">Contact</a></li>
                <li><a href="#" className="hover:underline">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t-4 border-black pt-8 text-center text-lg font-bold">
            <p>&copy; 2024 siaCRM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
