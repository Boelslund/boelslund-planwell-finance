# Firebase Authentication Email Customization Guide

## Overview

Firebase Authentication sends emails from `noreply@<your-project>.firebaseapp.com` by default. This guide covers how to customize these emails and avoid spam folder issues.

## Problem: Emails Going to Spam

### Common Causes

- Domain reputation (`*.firebaseapp.com` marked as spam)
- Generic sender name
- Default template content
- No SPF/DKIM records for custom domain

---

## Solution 1: Customize Email Templates (Firebase Console)

You can customize the email content, subject, and sender name in Firebase Console:

### Steps to Customize

1. **Go to Firebase Console**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `boelslund-planwell-finance-dev`

2. **Navigate to Email Templates**
   - Click **Authentication** in left sidebar
   - Click **Templates** tab at the top
   - Select **Password reset** from the template list

3. **Customize the Template**

   **Sender Name:**

   ```
   PlanWell Finance Support
   ```

   or

   ```
   Boelslund PlanWell
   ```

   **Subject Line:**

   ```
   Reset your PlanWell Finance password
   ```

   **Email Body:** (Use HTML/text)

   ```html
   <h2>Reset Your Password</h2>

   <p>Hello,</p>

   <p>
     You requested to reset your password for your PlanWell Finance account.
   </p>

   <p>Click the button below to reset your password:</p>

   <a
     href="%LINK%"
     style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;"
     >Reset Password</a
   >

   <p>
     If the button doesn't work, copy and paste this link into your browser:
   </p>
   <p>%LINK%</p>

   <p>
     If you didn't request this, you can safely ignore this email. Your password
     will remain unchanged.
   </p>

   <p>This link will expire in 1 hour.</p>

   <hr />
   <p style="color: #666; font-size: 12px;">
     PlanWell Finance - Budget Management<br />
     This is an automated message, please do not reply.
   </p>
   ```

4. **Important Variables**
   - `%LINK%` - The password reset link (required)
   - `%EMAIL%` - User's email address (optional)
   - `%APP_NAME%` - Your app name (optional)

5. **Save Changes**
   - Click **Save** button
   - Send a test email to verify

---

## Solution 2: Use Custom Domain (Recommended for Production)

### Benefits

- Professional appearance (`noreply@planwell-finance.com`)
- Better deliverability
- Build your own domain reputation
- Avoid shared domain reputation issues

### Setup Process

#### Step 1: Get a Custom Domain

- Purchase from Namecheap, Google Domains, etc.
- Example: `planwell-finance.com`

#### Step 2: Configure Domain in Firebase Hosting

1. **Firebase Console → Hosting**

   ```bash
   firebase hosting:channel:deploy production --project boelslund-planwell-finance-dev
   ```

2. **Add Custom Domain**
   - Go to **Hosting** → **Add custom domain**
   - Enter your domain (e.g., `app.planwell-finance.com`)
   - Follow DNS configuration steps

#### Step 3: Configure Action URL for Auth Emails

In Firebase Console:

1. **Authentication → Settings → Authorized Domains**
   - Add your custom domain: `app.planwell-finance.com`

2. **Authentication → Templates**
   - The action links will now use your custom domain
   - Format: `https://app.planwell-finance.com/__/auth/action?mode=resetPassword&...`

#### Step 4: Update Email Template Action Handler

**File: `src/App.tsx`**

Add route to handle email action links:

```typescript
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function EmailActionHandler() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (mode === 'resetPassword' && oobCode) {
      // Handle password reset
      // Redirect to password reset confirmation page
    }
  }, [mode, oobCode]);

  return <div>Processing...</div>;
}

// Add route
<Route path="/__/auth/action" element={<EmailActionHandler />} />
```

---

## Solution 3: Configure DNS Records (Best for Deliverability)

### SPF Record

Add to your domain's DNS:

```
Type: TXT
Name: @
Value: v=spf1 include:_spf.firebasemail.com ~all
```

### DKIM (If using custom SMTP)

Firebase doesn't support custom SMTP directly, but you can use:

- SendGrid
- Mailgun
- AWS SES
- Postmark

---

## Solution 4: Email Sender Best Practices

### 1. Warm Up Sender Reputation

- Start with low volume
- Gradually increase sending over 2-4 weeks
- Monitor bounce rates and spam reports

### 2. Ask Users to Whitelist

Add text in welcome email:

```
To ensure you receive important emails from us, please add
noreply@boelslund-planwell-finance-dev.firebaseapp.com to your contacts.
```

### 3. Improve Email Content

- ✅ Clear subject line
- ✅ Professional branding
- ✅ Plain text + HTML versions
- ✅ Unsubscribe link (for non-auth emails)
- ✅ Physical address (for marketing emails)

---

## Quick Fixes for Your Current Issue

### Immediate Actions

1. **Customize Template in Firebase Console** (5 minutes)
   - Change sender name to "PlanWell Finance"
   - Update subject to be more specific
   - Add branded content to body

2. **Mark as Not Spam** (Manual)
   - Mark test emails as "Not Spam" in Gmail
   - Add sender to contacts
   - This helps Gmail learn over time

3. **Test with Different Email Providers**
   - Test with Gmail, Outlook, Yahoo
   - Some providers have better Firebase compatibility

4. **Check Firebase Project Settings**
   - Ensure project name is professional
   - This appears in some email metadata

---

## Testing Email Customization

### Send Test Email

```typescript
// In browser console or test file
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const auth = getAuth();
sendPasswordResetEmail(auth, "your-test-email@gmail.com")
  .then(() => console.log("Test email sent"))
  .catch((err) => console.error("Error:", err));
```

### Check Different Providers

- Gmail
- Outlook/Hotmail
- Yahoo Mail
- ProtonMail
- Corporate email

### Verify Email Headers

Use a tool like [Mail-Tester](https://www.mail-tester.com/) to check:

- SPF records
- DKIM signatures
- Spam score
- Content analysis

---

## For Development vs Production

### Development (Current Setup)

- Use Firebase default domain
- Customize templates
- Accept some spam folder issues
- Focus on functionality

### Production (Future)

- Custom domain required
- Proper DNS configuration
- Professional sender identity
- Monitored deliverability metrics

---

## Additional Resources

- [Firebase Email Template Docs](https://firebase.google.com/docs/auth/custom-email-handler)
- [Firebase Hosting Custom Domain](https://firebase.google.com/docs/hosting/custom-domain)
- [Email Deliverability Best Practices](https://postmarkapp.com/guides/email-deliverability)

---

## Summary

| Solution            | Difficulty | Cost      | Effectiveness |
| ------------------- | ---------- | --------- | ------------- |
| Customize templates | Easy       | Free      | Medium        |
| Custom domain       | Medium     | $10-20/yr | High          |
| Custom SMTP         | Hard       | $10-50/mo | Highest       |
| Manual whitelisting | Easy       | Free      | Low           |

**Recommendation for now:**

1. Customize the Firebase email template (do this today)
2. Plan for custom domain when moving to production
3. Monitor email deliverability metrics
