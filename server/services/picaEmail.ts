/**
 * Pica OS Gmail Integration Service
 * Sends emails via Gmail using Pica's passthrough API
 */

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

interface PicaEmailResponse {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: any;
  sizeEstimate: number;
  raw: string;
}

/**
 * Build MIME email format
 */
function buildMimeEmail(params: SendEmailParams): string {
  const { to, subject, body, from } = params;
  
  const mimeLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset=UTF-8`,
    ``,
    body,
  ];

  if (from) {
    mimeLines.unshift(`From: ${from}`);
  }

  return mimeLines.join('\n');
}

/**
 * Send email via Pica Gmail API
 */
export async function sendEmailViaPica(params: SendEmailParams): Promise<PicaEmailResponse> {
  const picaSecretKey = process.env.PICA_SECRET_KEY;
  const picaGmailConnectionKey = process.env.PICA_GMAIL_CONNECTION_KEY;

  if (!picaSecretKey || !picaGmailConnectionKey) {
    throw new Error(
      'Missing Pica credentials. Please set PICA_SECRET_KEY and PICA_GMAIL_CONNECTION_KEY environment variables.'
    );
  }

  // Build MIME email
  const mimeEmail = buildMimeEmail(params);
  
  // Encode to base64url
  const base64urlRaw = Buffer.from(mimeEmail).toString('base64url');

  // Call Pica API
  const url = 'https://api.picaos.com/v1/passthrough/users/me/messages/send';
  const headers = {
    'x-pica-secret': picaSecretKey,
    'x-pica-connection-key': picaGmailConnectionKey,
    'x-pica-action-id': 'conn_mod_def::F_JeJ_A_TKg::cc2kvVQQTiiIiLEDauy6zQ',
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ raw: base64urlRaw }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pica Gmail API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Send email with HTML support
 */
export async function sendHtmlEmailViaPica(params: SendEmailParams & { html?: string }): Promise<PicaEmailResponse> {
  const { to, subject, body, html, from } = params;
  
  const picaSecretKey = process.env.PICA_SECRET_KEY;
  const picaGmailConnectionKey = process.env.PICA_GMAIL_CONNECTION_KEY;

  if (!picaSecretKey || !picaGmailConnectionKey) {
    throw new Error(
      'Missing Pica credentials. Please set PICA_SECRET_KEY and PICA_GMAIL_CONNECTION_KEY environment variables.'
    );
  }

  // Build multipart MIME email if HTML is provided
  let mimeEmail: string;
  
  if (html) {
    const boundary = '----=_Part_' + Date.now();
    mimeEmail = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      ``,
      body,
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      ``,
      html,
      ``,
      `--${boundary}--`,
    ].join('\n');
  } else {
    mimeEmail = buildMimeEmail({ to, subject, body, from });
  }

  if (from) {
    mimeEmail = `From: ${from}\n${mimeEmail}`;
  }

  // Encode to base64url
  const base64urlRaw = Buffer.from(mimeEmail).toString('base64url');

  // Call Pica API
  const url = 'https://api.picaos.com/v1/passthrough/users/me/messages/send';
  const headers = {
    'x-pica-secret': picaSecretKey,
    'x-pica-connection-key': picaGmailConnectionKey,
    'x-pica-action-id': 'conn_mod_def::F_JeJ_A_TKg::cc2kvVQQTiiIiLEDauy6zQ',
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ raw: base64urlRaw }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pica Gmail API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}
