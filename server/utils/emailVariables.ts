import { getDb } from "../db";
import { contacts, companies, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Standard email variables that can be used in templates
 */
export const EMAIL_VARIABLES = {
  // Contact variables
  contact_name: "Contact's full name",
  contact_first_name: "Contact's first name",
  contact_last_name: "Contact's last name",
  contact_email: "Contact's email address",
  contact_phone: "Contact's phone number",
  contact_title: "Contact's job title",
  
  // Company variables
  company_name: "Company name",
  company_industry: "Company industry",
  company_website: "Company website",
  company_size: "Company size",
  
  // Sender variables
  sender_name: "Your name",
  sender_first_name: "Your first name",
  sender_email: "Your email",
  sender_title: "Your job title",
  
  // Dynamic variables
  current_date: "Current date",
  current_day: "Current day of week",
  current_month: "Current month",
} as const;

export type EmailVariable = keyof typeof EMAIL_VARIABLES;

/**
 * Extract variables from email content
 */
export function extractVariables(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = content.matchAll(regex);
  const variables = new Set<string>();
  
  for (const match of matches) {
    variables.add(match[1].trim());
  }
  
  return Array.from(variables);
}

/**
 * Get variable values for a contact
 */
export async function getVariableValues(params: {
  contactId?: number;
  companyId?: number;
  userId: number;
}): Promise<Record<string, string>> {
  const db = await getDb();
  if (!db) return {};

  const values: Record<string, string> = {};

  // Get contact data
  if (params.contactId) {
    const contactData = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, params.contactId))
      .limit(1);

    if (contactData[0]) {
      const contact = contactData[0];
      values.contact_name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
      values.contact_first_name = contact.firstName || '';
      values.contact_last_name = contact.lastName || '';
      values.contact_email = contact.email || '';
      values.contact_phone = contact.phone || '';
      values.contact_title = contact.title || '';

      // Get company data from contact's company
      if (contact.companyId) {
        params.companyId = contact.companyId;
      }
    }
  }

  // Get company data
  if (params.companyId) {
    const companyData = await db
      .select()
      .from(companies)
      .where(eq(companies.id, params.companyId))
      .limit(1);

    if (companyData[0]) {
      const company = companyData[0];
      values.company_name = company.name || '';
      values.company_industry = company.industry || '';
      values.company_website = company.website || '';
      values.company_size = company.size || '';
    }
  }

  // Get sender (user) data
  const userData = await db
    .select()
    .from(users)
    .where(eq(users.id, params.userId))
    .limit(1);

  if (userData[0]) {
    const user = userData[0];
    values.sender_name = user.name || '';
    values.sender_first_name = user.name?.split(' ')[0] || '';
    values.sender_email = user.email || '';
    values.sender_title = ''; // Could be added to user schema
  }

  // Add dynamic date variables
  const now = new Date();
  values.current_date = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  values.current_day = now.toLocaleDateString('en-US', { weekday: 'long' });
  values.current_month = now.toLocaleDateString('en-US', { month: 'long' });

  return values;
}

/**
 * Replace variables in content with actual values
 */
export function replaceVariables(
  content: string,
  values: Record<string, string>,
  options: {
    fallback?: string;
    highlight?: boolean;
  } = {}
): string {
  const { fallback = '[Not Available]', highlight = false } = options;

  return content.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    const key = variable.trim();
    const value = values[key];

    if (value) {
      return highlight ? `<mark>${value}</mark>` : value;
    }

    return highlight ? `<mark class="missing">${fallback}</mark>` : fallback;
  });
}

/**
 * Validate that all variables in content can be resolved
 */
export function validateVariables(
  content: string,
  availableValues: Record<string, string>
): {
  valid: boolean;
  missing: string[];
  unknown: string[];
} {
  const variables = extractVariables(content);
  const missing: string[] = [];
  const unknown: string[] = [];

  for (const variable of variables) {
    // Check if variable is a known type
    if (!(variable in EMAIL_VARIABLES)) {
      unknown.push(variable);
      continue;
    }

    // Check if value is available
    if (!availableValues[variable] || availableValues[variable].trim() === '') {
      missing.push(variable);
    }
  }

  return {
    valid: missing.length === 0 && unknown.length === 0,
    missing,
    unknown,
  };
}

/**
 * Get preview of email with variables replaced
 */
export async function getEmailPreview(params: {
  subject: string;
  body: string;
  contactId?: number;
  companyId?: number;
  userId: number;
}): Promise<{
  subject: string;
  body: string;
  variables: Record<string, string>;
  validation: ReturnType<typeof validateVariables>;
}> {
  const values = await getVariableValues({
    contactId: params.contactId,
    companyId: params.companyId,
    userId: params.userId,
  });

  const previewSubject = replaceVariables(params.subject, values);
  const previewBody = replaceVariables(params.body, values);

  const subjectValidation = validateVariables(params.subject, values);
  const bodyValidation = validateVariables(params.body, values);

  return {
    subject: previewSubject,
    body: previewBody,
    variables: values,
    validation: {
      valid: subjectValidation.valid && bodyValidation.valid,
      missing: [...new Set([...subjectValidation.missing, ...bodyValidation.missing])],
      unknown: [...new Set([...subjectValidation.unknown, ...bodyValidation.unknown])],
    },
  };
}
