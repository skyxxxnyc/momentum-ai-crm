import { Resend } from "resend";

// Initialize Resend client
let resendClient: Resend | null = null;

function getResendClient() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export interface EmailTemplate {
  name: string;
  subject: string;
  body: string;
}

/**
 * Send email using Resend
 */
export async function sendEmail(params: SendEmailParams) {
  const client = getResendClient();
  
  if (!client) {
    throw new Error("Email service not configured. Please add RESEND_API_KEY to environment variables.");
  }

  try {
    const result = await client.emails.send({
      from: params.from || process.env.EMAIL_FROM || "noreply@momentum-ai.com",
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo,
      cc: params.cc,
      bcc: params.bcc,
    });

    return {
      success: true,
      messageId: result.data?.id,
      error: result.error,
    };
  } catch (error: any) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send email sequence step
 */
export async function sendSequenceEmail(params: {
  to: string;
  subject: string;
  body: string;
  dealId?: number;
  contactId?: number;
  sequenceId?: number;
  stepNumber?: number;
}) {
  const result = await sendEmail({
    to: params.to,
    subject: params.subject,
    html: params.body,
  });

  // Log the email activity
  if (result.success) {
    console.log(`Email sent successfully to ${params.to}`);
    // You can log this to the activities table
  }

  return result;
}

/**
 * Email templates for common scenarios
 */
export const emailTemplates: Record<string, EmailTemplate> = {
  welcome: {
    name: "Welcome Email",
    subject: "Welcome to {{company_name}}",
    body: `
      <h1>Welcome!</h1>
      <p>Hi {{contact_name}},</p>
      <p>Thank you for your interest in {{company_name}}. We're excited to help you achieve your goals.</p>
      <p>Best regards,<br>{{sender_name}}</p>
    `,
  },
  followUp: {
    name: "Follow Up",
    subject: "Following up on our conversation",
    body: `
      <h1>Following Up</h1>
      <p>Hi {{contact_name}},</p>
      <p>I wanted to follow up on our recent conversation about {{deal_title}}.</p>
      <p>Do you have any questions I can help answer?</p>
      <p>Best regards,<br>{{sender_name}}</p>
    `,
  },
  proposal: {
    name: "Proposal Sent",
    subject: "Proposal for {{deal_title}}",
    body: `
      <h1>Proposal</h1>
      <p>Hi {{contact_name}},</p>
      <p>Please find attached our proposal for {{deal_title}}.</p>
      <p>I'm available to discuss any questions you may have.</p>
      <p>Best regards,<br>{{sender_name}}</p>
    `,
  },
  checkIn: {
    name: "Check In",
    subject: "Checking in",
    body: `
      <h1>Checking In</h1>
      <p>Hi {{contact_name}},</p>
      <p>I wanted to check in and see how things are progressing with {{deal_title}}.</p>
      <p>Is there anything I can help with?</p>
      <p>Best regards,<br>{{sender_name}}</p>
    `,
  },
};

/**
 * Replace template variables with actual values
 */
export function renderTemplate(template: string, variables: Record<string, string>): string {
  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return rendered;
}

/**
 * Track email engagement (opens, clicks)
 * This would typically be done via webhooks from Resend
 */
export async function trackEmailEngagement(params: {
  messageId: string;
  event: "delivered" | "opened" | "clicked" | "bounced" | "complained";
  timestamp: Date;
}) {
  console.log("Email engagement tracked:", params);
  // Store in database for analytics
  return { success: true };
}
