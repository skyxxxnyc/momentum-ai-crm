import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
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
  Loader2,
} from "lucide-react";

export default function Landing() {
  const { user, isAuthenticated } = useAuth();
  const createCheckoutSession = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error("Failed to start checkout", {
        description: error.message,
      });
    },
  });

  const handlePricingCTA = (planId: string) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = getLoginUrl();
      return;
    }

    if (planId === "enterprise") {
      // For enterprise, redirect to contact form or email
      toast.info("Contact us for enterprise pricing", {
        description: "We'll reach out to discuss your custom needs.",
      });
      return;
    }

    // Create checkout session for authenticated users
    createCheckoutSession.mutate({ planId });
  };

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
      id: "starter",
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
      color: "bg-yellow-400",
      popular: false,
    },
    {
      id: "professional",
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
      color: "bg-blue-400",
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Unlimited contacts",
        "Dedicated manager",
        "Custom integrations",
        "SLA guarantee",
        "Advanced security",
        "White-label options",
      ],
      color: "bg-pink-400",
      popular: false,
    },
  ];

  const testimonials = [
    {
      quote: "siaCRM transformed how we manage our pipeline. Revenue up 40% in 3 months.",
      author: "Sarah Chen",
      role: "VP Sales, TechCorp",
      color: "bg-green-400",
    },
    {
      quote: "The AI insights are game-changing. We're closing deals 2x faster now.",
      author: "Marcus Johnson",
      role: "CEO, GrowthLabs",
      color: "bg-purple-400",
    },
    {
      quote: "Best CRM we've used. Simple, powerful, and actually helps us sell more.",
      author: "Emily Rodriguez",
      role: "Sales Director, Innovate Inc",
      color: "bg-orange-400",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b-4 border-white bg-black sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-yellow-400 border-4 border-white rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-black" />
            </div>
            <h1 className="text-3xl font-black">
              <span className="font-light">sia</span>
              <span className="font-black">CRM</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="border-4 border-white bg-black text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-black"
              asChild
            >
              <a href={getLoginUrl()}>LOGIN</a>
            </Button>
            <Button
              className="border-4 border-white bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-black"
              asChild
            >
              <a href={getLoginUrl()}>GET STARTED</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="bg-yellow-400 text-black border-4 border-white text-lg px-6 py-2 mb-8 font-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <Sparkles className="h-5 w-5 mr-2" />
              AUTONOMOUS CRM
            </Badge>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight [text-shadow:4px_4px_0px_rgba(255,255,255,0.1)]">
              Close More Deals With
              <span className="block mt-2 bg-gradient-to-r from-yellow-400 via-blue-400 to-pink-400 bg-clip-text text-transparent">
                Autonomous Revenue Intelligence
              </span>
            </h1>
            <p className="text-2xl md:text-3xl font-bold mb-12 max-w-4xl mx-auto text-gray-300">
              The only CRM that combines account-based selling, AI automation, and email sequences
              to help you scale revenue faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="border-4 border-white bg-yellow-400 text-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all font-black text-xl px-12 py-8"
                asChild
              >
                <a href={getLoginUrl()}>
                  START NOW <ArrowRight className="ml-2 h-6 w-6" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all font-black text-xl px-12 py-8 bg-black text-white"
                asChild
              >
                <a href="#pricing">VIEW PRICING</a>
              </Button>
            </div>
            <p className="text-lg font-bold pt-4 text-gray-400">
              🚀 No credit card required • Get started in minutes
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 [text-shadow:3px_3px_0px_rgba(255,255,255,0.1)]">
              Everything you need to scale revenue
            </h2>
            <p className="text-2xl font-bold max-w-3xl mx-auto text-gray-300">
              Built for modern sales teams who need speed, intelligence, and automation
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`${feature.color} border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-8 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all`}
              >
                <div className="h-16 w-16 rounded-full bg-black border-4 border-white flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-4 text-black">{feature.title}</h3>
                <p className="text-lg font-bold text-black">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 [text-shadow:3px_3px_0px_rgba(255,255,255,0.1)]">
              Simple, transparent pricing
            </h2>
            <p className="text-2xl font-bold max-w-3xl mx-auto text-gray-300">
              Choose the plan that fits your team. Start selling smarter today.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricing.map((plan, index) => (
              <div
                key={index}
                className={`${plan.color} border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-8 relative ${
                  plan.popular ? "scale-105 shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]" : ""
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
                  <h3 className="text-3xl font-black mb-2 text-black">{plan.name}</h3>
                  <p className="text-lg font-bold text-black">{plan.description}</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-black text-black">{plan.price}</span>
                  {plan.period && (
                    <span className="text-2xl font-bold text-black">{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 shrink-0 mt-1 text-black" />
                      <span className="text-lg font-bold text-black">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-black text-white hover:bg-gray-800"
                  } border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-black text-lg py-6`}
                  onClick={() => handlePricingCTA(plan.id)}
                  disabled={createCheckoutSession.isPending}
                >
                  {createCheckoutSession.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      LOADING...
                    </>
                  ) : (
                    <>{plan.price === "Custom" ? "CONTACT SALES" : "GET STARTED"}</>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 [text-shadow:3px_3px_0px_rgba(255,255,255,0.1)]">
              Loved by revenue teams everywhere
            </h2>
            <p className="text-2xl font-bold max-w-3xl mx-auto text-gray-300">
              See what our customers have to say about siaCRM
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`${testimonial.color} border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-8`}
              >
                <MessageSquare className="h-12 w-12 mb-6 text-black" />
                <p className="text-xl font-bold mb-6 italic text-black">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="text-xl font-black text-black">{testimonial.author}</p>
                  <p className="text-lg font-bold text-black">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 via-blue-400 to-pink-400">
        <div className="container mx-auto px-4">
          <div className="bg-black text-white border-4 border-white shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] max-w-5xl mx-auto p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              Ready to transform your sales process?
            </h2>
            <p className="text-2xl font-bold mb-10 max-w-3xl mx-auto">
              Join hundreds of teams already using siaCRM to close more deals faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                className="border-4 border-white bg-yellow-400 text-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all font-black text-xl px-12 py-8"
                asChild
              >
                <a href={getLoginUrl()}>START NOW</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-4 border-white bg-black text-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all font-black text-xl px-12 py-8"
                asChild
              >
                <a href="#pricing">VIEW PRICING</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t-4 border-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-black mb-4">
                <span className="font-light">sia</span>
                <span className="font-black">CRM</span>
              </h3>
              <p className="font-bold text-gray-400">
                Autonomous Revenue Intelligence
              </p>
            </div>
            <div>
              <h4 className="text-xl font-black mb-4">Product</h4>
              <ul className="space-y-2 font-bold text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-black mb-4">Company</h4>
              <ul className="space-y-2 font-bold text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-black mb-4">Support</h4>
              <ul className="space-y-2 font-bold text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t-4 border-white pt-8 text-center">
            <p className="font-bold text-gray-400">
              © 2025 siaCRM. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
