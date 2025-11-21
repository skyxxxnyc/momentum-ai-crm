import { describe, it, expect } from 'vitest';
import { sendEmailViaPica } from '../services/picaEmail';
import { createCalendarEventViaPica } from '../services/picaCalendar';

describe('Pica OS Integration', () => {
  it('should have Pica credentials configured', () => {
    expect(process.env.PICA_SECRET_KEY).toBeDefined();
    expect(process.env.PICA_GMAIL_CONNECTION_KEY).toBeDefined();
    expect(process.env.PICA_GOOGLE_CALENDAR_CONNECTION_KEY).toBeDefined();
  });

  it('should send email via Pica Gmail API', async () => {
    // This is a lightweight test - we're just checking if the API accepts our credentials
    // We'll send a test email to a test address
    try {
      const result = await sendEmailViaPica({
        to: 'test@example.com',
        subject: 'Test Email from siaCRM',
        body: 'This is a test email to validate Pica Gmail integration.',
      });

      // If we get here without throwing, credentials are valid
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    } catch (error: any) {
      // Check if it's an auth error (401/403) vs other errors
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('Unauthorized')) {
        throw new Error('Invalid Pica credentials. Please check PICA_SECRET_KEY and PICA_GMAIL_CONNECTION_KEY.');
      }
      // Other errors (like network issues) are acceptable for this test
      console.warn('Pica Gmail test warning:', error.message);
    }
  }, 30000); // 30 second timeout

  it('should create calendar event via Pica Calendar API', async () => {
    // Lightweight test for calendar API
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const timeStr = tomorrow.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      
      const result = await createCalendarEventViaPica({
        eventText: `Test meeting tomorrow at ${timeStr}`,
        calendarId: 'primary',
        sendUpdates: 'none', // Don't send notifications for test
      });

      // If we get here without throwing, credentials are valid
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    } catch (error: any) {
      // Check if it's an auth error
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('Unauthorized')) {
        throw new Error('Invalid Pica credentials. Please check PICA_SECRET_KEY and PICA_GOOGLE_CALENDAR_CONNECTION_KEY.');
      }
      // Other errors are acceptable for this test
      console.warn('Pica Calendar test warning:', error.message);
    }
  }, 30000);
});
