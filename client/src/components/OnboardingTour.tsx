import { useState, useEffect } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";

const ONBOARDING_KEY = "siaCRM_onboarding_completed";

export function OnboardingTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      // Delay start to ensure page is fully loaded
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div>
          <h2 className="text-xl font-bold mb-2">Welcome to siaCRM! 🚀</h2>
          <p>
            Let's take a quick tour of your new autonomous revenue platform. This will only take a
            minute.
          </p>
        </div>
      ),
      placement: "center",
    },
    {
      target: '[href="/icps"]',
      content: (
        <div>
          <h3 className="font-bold mb-2">1. Define Your ICPs</h3>
          <p>
            Start by creating Ideal Customer Profiles (ICPs). These define the types of businesses
            you want to target.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[href="/prospecting"]',
      content: (
        <div>
          <h3 className="font-bold mb-2">2. Run AI Prospecting</h3>
          <p>
            Our AI agent searches Google Maps and scrapes websites to find businesses matching your
            ICPs. It automatically identifies pain points and sales opportunities.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[href="/companies"]',
      content: (
        <div>
          <h3 className="font-bold mb-2">3. Manage Your Pipeline</h3>
          <p>
            View discovered companies, contacts, and deals. Our AI continuously analyzes
            relationships and provides momentum scores.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[href="/ai-chat"]',
      content: (
        <div>
          <h3 className="font-bold mb-2">4. Chat with Your AI Assistant</h3>
          <p>
            Ask questions about your pipeline, get strategic advice, or generate sales collateral.
            The AI has full context of your CRM data.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[href="/ai-insights"]',
      content: (
        <div>
          <h3 className="font-bold mb-2">5. View AI Insights</h3>
          <p>
            Get revenue forecasts, hot leads detection, stale deal alerts, and relationship strength
            analysis powered by AI.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: "body",
      content: (
        <div>
          <h2 className="text-xl font-bold mb-2">You're All Set! 🎉</h2>
          <p className="mb-3">
            Start by creating your first ICP, then run a prospecting campaign to discover potential
            customers.
          </p>
          <p className="text-sm text-muted-foreground">
            Tip: Use the search bar in the sidebar to quickly navigate anywhere in the platform.
          </p>
        </div>
      ),
      placement: "center",
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem(ONBOARDING_KEY, "true");
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#84cc16", // Lime green accent
          textColor: "#ffffff",
          backgroundColor: "#1a1a1a",
          arrowColor: "#1a1a1a",
          overlayColor: "rgba(0, 0, 0, 0.7)",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 0, // Sharp 90-degree angles
        },
        buttonNext: {
          backgroundColor: "#84cc16",
          color: "#000000",
          borderRadius: 0,
        },
        buttonBack: {
          color: "#84cc16",
        },
        buttonSkip: {
          color: "#999999",
        },
      }}
    />
  );
}

// Helper function to reset onboarding (useful for testing or user preference)
export function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
  window.location.reload();
}
