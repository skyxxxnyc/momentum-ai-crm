import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

const templates = [
  {
    name: 'Cold Outreach - B2B SaaS',
    description: 'A proven 5-step sequence for reaching out to potential B2B SaaS customers. Focuses on value proposition, social proof, and gentle follow-ups.',
    category: 'Cold Outreach',
    isPublic: true,
    steps: [
      {
        stepNumber: 1,
        subject: 'Quick question about {{company_name}}',
        body: `Hi {{contact_name}},

I noticed {{company_name}} is growing fast in the {{industry}} space. Congrats on the recent momentum!

I'm reaching out because we help companies like yours {{value_proposition}}.

Would you be open to a quick 15-minute call next week to explore if this could help {{company_name}}?

Best,
{{sender_name}}`,
        delayDays: 0,
      },
      {
        stepNumber: 2,
        subject: 'Re: Quick question about {{company_name}}',
        body: `Hi {{contact_name}},

I wanted to follow up on my previous email. I know you're busy, so I'll keep this brief.

We recently helped {{similar_company}} achieve {{specific_result}}. I think we could do something similar for {{company_name}}.

Are you available for a brief call this week?

Best,
{{sender_name}}`,
        delayDays: 3,
      },
      {
        stepNumber: 3,
        subject: 'Thought you might find this useful',
        body: `Hi {{contact_name}},

I came across this case study and immediately thought of {{company_name}}: [link to relevant case study]

It shows how {{similar_company}} tackled {{specific_challenge}} - something I imagine you might be dealing with too.

Would love to hear your thoughts if you have 2 minutes.

Best,
{{sender_name}}`,
        delayDays: 4,
      },
      {
        stepNumber: 4,
        subject: 'Last follow-up',
        body: `Hi {{contact_name}},

I don't want to be a pest, so this will be my last email.

If you're interested in learning how we can help {{company_name}} {{value_proposition}}, just reply to this email.

Otherwise, I'll assume the timing isn't right and won't reach out again.

Best of luck with everything!

{{sender_name}}`,
        delayDays: 5,
      },
      {
        stepNumber: 5,
        subject: 'Breakup email',
        body: `Hi {{contact_name}},

I haven't heard back, so I'm guessing this isn't a priority for {{company_name}} right now.

No worries at all! If things change in the future, feel free to reach out.

In the meantime, I'll stop bothering you. 😊

Best,
{{sender_name}}

P.S. If you know anyone else who might benefit from this, I'd appreciate an introduction!`,
        delayDays: 7,
      },
    ],
  },
  {
    name: 'Customer Onboarding - SaaS',
    description: 'Welcome new customers and guide them through your product setup. Includes welcome email, setup guide, feature highlights, and check-in.',
    category: 'Onboarding',
    isPublic: true,
    steps: [
      {
        stepNumber: 1,
        subject: 'Welcome to {{product_name}}! 🎉',
        body: `Hi {{contact_name}},

Welcome to {{product_name}}! We're thrilled to have you on board.

Here's what to expect over the next few days:
- **Today**: Get started with our quick setup guide
- **Day 2**: Learn about our most popular features
- **Day 5**: Check in to see how things are going

To get started, click here: [setup_link]

If you have any questions, just reply to this email. We're here to help!

Best,
{{sender_name}}
Customer Success Team`,
        delayDays: 0,
      },
      {
        stepNumber: 2,
        subject: 'Your quick start guide is ready',
        body: `Hi {{contact_name}},

Hope you're settling in well! I wanted to share a quick start guide to help you get the most out of {{product_name}}.

**3 things to do today:**
1. Complete your profile setup
2. Invite your team members
3. Try our [key_feature]

Need help? Book a free onboarding call with our team: [booking_link]

Best,
{{sender_name}}`,
        delayDays: 1,
      },
      {
        stepNumber: 3,
        subject: 'Unlock the power of {{key_feature}}',
        body: `Hi {{contact_name}},

Did you know that {{product_name}} customers who use {{key_feature}} see {{specific_benefit}}?

Here's a quick 2-minute video showing you how: [video_link]

Give it a try and let me know what you think!

Best,
{{sender_name}}`,
        delayDays: 3,
      },
      {
        stepNumber: 4,
        subject: 'How are things going?',
        body: `Hi {{contact_name}},

It's been a few days since you joined {{product_name}}. How's everything going so far?

I wanted to check in and see if you have any questions or need help with anything.

**Quick question:** What's the #1 thing you're trying to achieve with {{product_name}}?

Reply to this email and let me know. I'd love to make sure you're on the right track!

Best,
{{sender_name}}`,
        delayDays: 5,
      },
    ],
  },
  {
    name: 'Re-engagement - Inactive Users',
    description: 'Win back inactive users with a compelling re-engagement sequence. Reminds them of value, offers help, and includes a special incentive.',
    category: 'Re-engagement',
    isPublic: true,
    steps: [
      {
        stepNumber: 1,
        subject: 'We miss you, {{contact_name}}!',
        body: `Hi {{contact_name}},

I noticed you haven't logged into {{product_name}} in a while. Everything okay?

We've made some exciting updates since you last visited:
- {{new_feature_1}}
- {{new_feature_2}}
- {{improvement}}

Would love to see you back! Log in here: [login_link]

Best,
{{sender_name}}`,
        delayDays: 0,
      },
      {
        stepNumber: 2,
        subject: 'Can we help?',
        body: `Hi {{contact_name}},

I wanted to reach out personally to see if there's anything preventing you from using {{product_name}}.

Common reasons people stop using our product:
- ❌ Too complicated to set up
- ❌ Missing a specific feature
- ❌ Not sure how to get value from it

If any of these resonate, I'd love to help. Just reply to this email and let me know.

Best,
{{sender_name}}`,
        delayDays: 4,
      },
      {
        stepNumber: 3,
        subject: 'Special offer just for you',
        body: `Hi {{contact_name}},

I really want to make this work for you, so I'm offering something special:

**{{special_offer}}**

This offer is only available for the next 48 hours.

Ready to give {{product_name}} another try? [claim_offer_link]

Best,
{{sender_name}}

P.S. If you're not interested, no worries! Just let me know and I'll stop reaching out.`,
        delayDays: 5,
      },
    ],
  },
  {
    name: 'Follow-up After Demo',
    description: 'Nurture leads after a product demo. Includes thank you, resources, addressing objections, and closing.',
    category: 'Follow-up',
    isPublic: true,
    steps: [
      {
        stepNumber: 1,
        subject: 'Thanks for your time today!',
        body: `Hi {{contact_name}},

Thanks for taking the time to chat today! I really enjoyed learning about {{company_name}} and your goals for {{specific_goal}}.

As promised, here are the resources I mentioned:
- [Demo recording]
- [Case study: {{similar_company}}]
- [Pricing guide]

What are your thoughts so far? Any questions I can answer?

Best,
{{sender_name}}`,
        delayDays: 0,
      },
      {
        stepNumber: 2,
        subject: 'Quick follow-up',
        body: `Hi {{contact_name}},

Just wanted to check in and see if you had a chance to review the materials I sent over.

I'm happy to jump on another call if you'd like to dive deeper into {{specific_feature}} or discuss how we can help with {{specific_challenge}}.

What does your calendar look like this week?

Best,
{{sender_name}}`,
        delayDays: 3,
      },
      {
        stepNumber: 3,
        subject: 'Addressing your concerns',
        body: `Hi {{contact_name}},

I've been thinking about our conversation, and I wanted to address the concern you raised about {{specific_objection}}.

Here's how we typically handle this:
{{solution_to_objection}}

We've helped companies like {{similar_company}} overcome this exact challenge. Would you like to see how?

Best,
{{sender_name}}`,
        delayDays: 5,
      },
      {
        stepNumber: 4,
        subject: 'Ready to move forward?',
        body: `Hi {{contact_name}},

I wanted to circle back and see where you're at in your decision-making process.

Based on our conversation, I believe {{product_name}} can help {{company_name}} achieve {{specific_outcome}}.

Are you ready to move forward? If so, I can get you set up this week.

If not, what's holding you back? Let's talk through it.

Best,
{{sender_name}}`,
        delayDays: 7,
      },
    ],
  },
  {
    name: 'Event Follow-up',
    description: 'Follow up with contacts after meeting them at a conference or networking event. Builds relationship and moves to next step.',
    category: 'Follow-up',
    isPublic: true,
    steps: [
      {
        stepNumber: 1,
        subject: 'Great meeting you at {{event_name}}!',
        body: `Hi {{contact_name}},

It was great meeting you at {{event_name}} yesterday! I really enjoyed our conversation about {{topic_discussed}}.

As promised, here's the resource I mentioned: [link]

I'd love to continue our conversation. Are you free for a quick call next week?

Best,
{{sender_name}}`,
        delayDays: 1,
      },
      {
        stepNumber: 2,
        subject: 'Following up from {{event_name}}',
        body: `Hi {{contact_name}},

Hope you made it home safely from {{event_name}}!

I wanted to follow up on our conversation about {{specific_topic}}. I think there might be a great opportunity for us to work together.

Would you be open to a 20-minute call to explore this further?

Best,
{{sender_name}}`,
        delayDays: 4,
      },
      {
        stepNumber: 3,
        subject: 'Thought you might find this interesting',
        body: `Hi {{contact_name}},

I came across this article and immediately thought of our conversation at {{event_name}}: [article_link]

It talks about {{relevant_topic}} - exactly what we discussed!

Let me know what you think.

Best,
{{sender_name}}`,
        delayDays: 7,
      },
    ],
  },
  {
    name: 'Product Launch Announcement',
    description: 'Announce a new product or feature to your customer base. Builds excitement and drives adoption.',
    category: 'Product Updates',
    isPublic: true,
    steps: [
      {
        stepNumber: 1,
        subject: '🚀 Introducing {{new_feature}}',
        body: `Hi {{contact_name}},

Big news! We just launched {{new_feature}}, and I think you're going to love it.

**What it does:**
{{feature_description}}

**Why it matters to you:**
{{specific_benefit}}

Try it now: [feature_link]

Best,
{{sender_name}}`,
        delayDays: 0,
      },
      {
        stepNumber: 2,
        subject: 'See {{new_feature}} in action',
        body: `Hi {{contact_name}},

In case you missed it, we launched {{new_feature}} last week!

I recorded a quick 3-minute demo showing exactly how it works: [video_link]

**Pro tip:** {{power_user_tip}}

Give it a try and let me know what you think!

Best,
{{sender_name}}`,
        delayDays: 5,
      },
      {
        stepNumber: 3,
        subject: 'Early adopters are loving {{new_feature}}',
        body: `Hi {{contact_name}},

The response to {{new_feature}} has been incredible! Here's what early adopters are saying:

"{{customer_testimonial}}" - {{customer_name}}, {{customer_company}}

Haven't tried it yet? Now's the perfect time: [feature_link]

Best,
{{sender_name}}`,
        delayDays: 7,
      },
    ],
  },
];

async function seedTemplates() {
  console.log('Starting template seed...');

  for (const template of templates) {
    try {
      // Insert template with steps as JSON
      const [templateResult] = await connection.execute(
        `INSERT INTO sequence_templates (name, description, category, steps, isPublic, createdBy, usageCount, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, 1, 0, NOW(), NOW())`,
        [
          template.name,
          template.description,
          template.category,
          JSON.stringify(template.steps),
          template.isPublic
        ]
      );

      const templateId = templateResult.insertId;
      console.log(`✓ Created template: ${template.name} (ID: ${templateId}) with ${template.steps.length} steps`);
    } catch (error) {
      console.error(`✗ Failed to create template: ${template.name}`, error.message);
    }
  }

  console.log('\n✅ Template seed completed!');
  await connection.end();
}

seedTemplates().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
