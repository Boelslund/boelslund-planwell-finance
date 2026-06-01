# Manual Testing Guide for Phase 1

This guide provides detailed step-by-step instructions for testing the PlanWell Finance application. No prior testing experience is required - just follow each step carefully and document what you see.

## Prerequisites

Before you begin testing:

1. **Browser Setup**: Have the following browsers installed:
   - Google Chrome (latest version) - **Required**
   - Mozilla Firefox (latest version) - **Required**
   - Microsoft Edge (latest version) - **Required**
   - Safari (optional - only if using macOS)

2. **Test Application URL**: https://boelslund-planwell-finance-dev.web.app/

3. **Email Access**: You'll need access to a real email account to receive:
   - Password reset links
   - Verification emails (when implemented)

4. **Android Devices** (optional but strongly recommended):
   - Android phone with Chrome browser
   - Android tablet with Chrome browser
   - Note: Browser dev tools testing is required, but actual device testing provides much better coverage

5. **Testing Checklist**: Keep this document open and check off items as you complete them

6. **Note-Taking Tool**: Use a notepad or document to record:
   - Any unexpected behavior
   - Error messages you see
   - Screenshots of issues
   - Device information (for mobile tests)

## How to Report Issues

When you find a problem, document:
- **What you were doing** (which step)
- **What you expected to happen**
- **What actually happened**
- **Screenshot** (if applicable)
- **Browser and device** you were using

---

## Test Suite 1: Happy Path - New User Registration

**Goal**: Verify a new user can successfully register and access the application.

### Test 1.1: Register a New Account

**Steps:**

1. Open your browser and navigate to: https://boelslund-planwell-finance-dev.web.app/
2. Click the "Sign Up" button or "Register" link
3. Fill in the registration form:
   - **Email**: Use a real email address you can access (e.g., `yourname+test1@gmail.com`)
   - **Password**: Enter a password (minimum 6 characters)
   - **Confirm Password**: Enter the same password again
4. Click the "Sign Up" or "Register" button
5. Wait for the registration to complete

**Expected Results:**
- ✅ Form submits without errors
- ✅ You are automatically logged in
- ✅ You are redirected to the home/dashboard page
- ✅ You see a welcome message or your email displayed in the header

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 1.2: Access User Settings

**Steps:**

1. While logged in, look for a user menu in the top-right corner of the page
2. Click on your email or the user icon
3. Select "Settings" from the dropdown menu
4. The settings page should load

**Expected Results:**
- ✅ Settings page displays without errors
- ✅ You see form fields for:
  - Theme selection (Light/Dark)
  - Date format preference
  - Language selection
  - Notification preferences (checkboxes)

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 1.3: Update Settings and Save (Including Theme)

**Steps:**

1. On the Settings page, make the following changes:
   - Change "Theme" to "Dark"
   - Change "Date Format" to "DD/MM/YYYY" (or any option different from default)
   - Check the "Email Notifications" checkbox
   - Check the "Budget Alerts" checkbox
2. Click the "Save Settings" button
3. Watch for a success message and observe the page

**Expected Results:**
- ✅ Button shows "Saving..." briefly
- ✅ A success message appears (e.g., "Settings saved successfully")
- ✅ Success message disappears automatically after ~3 seconds
- ✅ After clicking Save, the page background changes to a dark color
- ✅ Text changes to light colors (readable on dark background)
- ✅ No error messages appear

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 1.4: Verify Settings Persist After Page Refresh

**Steps:**

1. After saving settings in Test 1.4, press F5 or click the browser refresh button
2. Wait for the page to reload
3. Navigate back to Settings (user menu → Settings)
4. Check the values of all fields

**Expected Results:**
- ✅ Theme is still "Dark" (page loads with dark background)
- ✅ Date Format shows "DD/MM/YYYY" (the value you selected)
- ✅ Email Notifications checkbox is still checked
- ✅ Budget Alerts checkbox is still checked

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 1.5: Test Unsaved Changes Warning

**Steps:**

1. On the Settings page, change the Language dropdown to a different value
2. **Do NOT click Save**
3. Try to navigate away by clicking on "Home" in the navigation menu

**Expected Results:**
- ✅ Browser shows a warning dialog: "You have unsaved changes. Are you sure you want to leave?"
- ✅ Dialog has two options: "Leave" and "Stay" (or similar)
- ✅ If you click "Stay", you remain on the Settings page
- ✅ If you click "Leave", you navigate away and changes are lost

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 1.6: Reset Settings to Defaults

**Steps:**

1. On the Settings page, scroll to find the "Reset to Defaults" button
2. Click the "Reset to Defaults" button
3. Observe any confirmation prompts

**Expected Results:**
- ✅ A confirmation step appears (either a button changes to "Confirm Reset" or a dialog appears)
- ✅ After confirming, all settings return to default values:
  - Theme: Light
  - Language: English
  - Date Format: MM/DD/YYYY
  - All notification checkboxes: Unchecked
- ✅ Page shows confirmation that reset was successful

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 1.7: Logout and Verify Session Ends

**Steps:**

1. Click on the user menu in the top-right corner
2. Click "Logout" or "Sign Out"
3. Wait for the page to change

**Expected Results:**
- ✅ You are redirected to the login or home page
- ✅ User menu is no longer visible
- ✅ You see "Sign In" and "Sign Up" options instead
- ✅ If you try to access Settings directly by typing the URL, you're redirected to login

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 1.8: Login with Existing Credentials

**Steps:**

1. From the logged-out state, click "Sign In"
2. Enter the email you registered with in Test 1.1
3. Enter the password you created
4. Click "Sign In" or "Login"

**Expected Results:**
- ✅ Login is successful
- ✅ You are redirected to the home/dashboard
- ✅ Your email appears in the user menu
- ✅ You can access Settings again

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 1.9: Verify Settings Persist Across Sessions

**Steps:**

1. After logging in, navigate to Settings
2. Change the Theme back to "Dark"
3. Change Date Format to "YYYY-MM-DD"
4. Click "Save Settings"
5. Wait for success message
6. Logout (user menu → Logout)
7. Close the browser completely
8. Reopen the browser and navigate to the app
9. Login with the same credentials
10. Navigate to Settings

**Expected Results:**
- ✅ After logging back in, the theme is already dark (page loads with dark background)
- ✅ Settings page shows:
  - Theme: Dark
  - Date Format: YYYY-MM-DD
  - All previously saved preferences intact

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

## Test Suite 2: Error Handling

**Goal**: Verify the application handles errors gracefully and shows helpful messages.

### Test 2.1: Invalid Email Format During Registration

**Steps:**

1. Navigate to the Registration page
2. In the Email field, enter: `notanemail` (no @ symbol)
3. Enter a valid password
4. Click "Sign Up"

**Expected Results:**
- ✅ Form shows an error message: "Please enter a valid email address" or similar
- ✅ Form does NOT submit
- ✅ Email field is highlighted or marked as invalid

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 2.2: Weak Password During Registration

**Steps:**

1. On the Registration page, enter a valid email
2. In the Password field, enter: `123` (less than 6 characters)
3. Click "Sign Up"

**Expected Results:**
- ✅ Error message appears: "Password must be at least 6 characters" or similar
- ✅ Form does NOT submit
- ✅ Password field is highlighted

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 2.3: Register with Existing Email

**Steps:**

1. Navigate to the Registration page
2. Use the SAME email you registered with in Test 1.1
3. Enter any password
4. Click "Sign Up"

**Expected Results:**
- ✅ Error message appears: "Email already in use" or "Account already exists" or similar
- ✅ Error message is clear and user-friendly (not technical jargon)
- ✅ User remains on registration page

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 2.4: Login with Wrong Password

**Steps:**

1. Navigate to the Login page
2. Enter your correct email address
3. Enter an INCORRECT password (e.g., `wrongpassword123`)
4. Click "Sign In"

**Expected Results:**
- ✅ Error message appears: "Invalid email or password" or "Incorrect credentials" or similar
- ✅ Error is clear but doesn't specify whether email or password is wrong (security best practice)
- ✅ User remains on login page
- ✅ Email field is still populated with the entered email

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 2.5: Login with Non-Existent Email

**Steps:**

1. Navigate to the Login page
2. Enter an email that was never registered: `doesnotexist@example.com`
3. Enter any password
4. Click "Sign In"

**Expected Results:**
- ✅ Error message appears: "Invalid email or password" or similar
- ✅ Message doesn't reveal that the account doesn't exist (security best practice)
- ✅ User remains on login page

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 2.6: Password Reset with Valid Email

**Steps:**

1. On the Login page, click "Forgot Password?" or "Reset Password" link
2. Enter your registered email address
3. Click "Send Reset Link" or similar button
4. Check your email inbox

**Expected Results:**
- ✅ Success message appears: "Password reset email sent" or similar
- ✅ Email arrives in your inbox (check spam folder if needed)
- ✅ Email contains a link to reset your password
- ✅ Link expires after a reasonable time (typically 1 hour)

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 2.7: Password Reset with Invalid Email

**Steps:**

1. On the Password Reset page, enter an email that doesn't exist: `fake@example.com`
2. Click "Send Reset Link"

**Expected Results:**
- ✅ Either shows success message (to prevent email enumeration) OR
- ✅ Shows error: "No account found with this email"
- ✅ No actual email is sent

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 2.8: Settings Update with Network Failure

**⚠️ Advanced Test**: This requires simulating network failure.

**Steps:**

1. Login and navigate to Settings
2. Open browser Developer Tools (F12)
3. Go to Network tab in Developer Tools
4. Check the "Offline" checkbox to simulate network failure
5. In the Settings page, change any setting
6. Click "Save Settings"
7. Observe the error handling
8. Uncheck "Offline" in Developer Tools
9. Click the "Retry" button if available

**Expected Results:**
- ✅ Error message appears: "Failed to save settings" or "Network error" or similar
- ✅ A "Retry" button is visible
- ✅ After re-enabling network and clicking Retry, settings save successfully
- ✅ Error message is user-friendly, not technical

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):
- [ ] Test Skipped (unable to simulate network failure)

---

## Test Suite 3: Security & Session Management

**Goal**: Verify the application properly protects user data and manages sessions.

### Test 3.1: Protected Routes Redirect to Login

**Steps:**

1. Make sure you are logged OUT
2. Manually type this URL in your browser: `https://boelslund-planwell-finance-dev.web.app/settings`
3. Press Enter

**Expected Results:**
- ✅ You are automatically redirected to the Login page
- ✅ You cannot access Settings without being logged in
- ✅ (Optional) After logging in, you are redirected back to Settings

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 3.2: Cannot Access Login When Already Logged In

**Steps:**

1. Login to your account
2. While logged in, manually type the Login page URL: `https://boelslund-planwell-finance-dev.web.app/signin`
3. Press Enter

**Expected Results:**
- ✅ You are automatically redirected to the home/dashboard
- ✅ You do NOT see the Login form

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 3.3: Session Persists Across Page Refreshes

**Steps:**

1. Login to your account
2. Navigate to any page (e.g., Settings)
3. Press F5 or click browser refresh
4. Repeat 2-3 times on different pages

**Expected Results:**
- ✅ You remain logged in after each refresh
- ✅ Your user info is still displayed in the header
- ✅ No need to login again

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 3.4: Session Cleared Completely on Logout

**Steps:**

1. Login to your account
2. Navigate to Settings and verify you can access it
3. Click Logout
4. Press the browser's Back button

**Expected Results:**
- ✅ Pressing Back does NOT log you back in
- ✅ You are redirected to the Login page
- ✅ Session is completely cleared

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

## Test Suite 4: Cross-Browser Testing

**Goal**: Verify the application works consistently across different browsers.

**Required Browsers**: Chrome, Firefox, and Edge (all available on Windows)
**Optional**: Safari (only if macOS is available - not required)
**Priority**: Focus on Android device testing (Tests 5.4 and 5.5) over Safari

**Instructions**: Repeat Tests 1.1 through 1.9 (Happy Path) in each browser below. Record any differences or issues.

### Test 4.1: Google Chrome

**Steps:**

1. Open Google Chrome
2. Run Tests 1.1 through 1.9
3. Note any visual differences or functionality issues

**Expected Results:**
- ✅ All tests pass in Chrome
- ✅ UI looks correct and professional
- ✅ No console errors (F12 → Console tab)

**Record:**
- [ ] All Tests Passed in Chrome
- [ ] Issues Found (describe):

---

### Test 4.2: Mozilla Firefox

**Steps:**

1. Open Mozilla Firefox
2. Run Tests 1.1 through 1.9
3. Note any visual differences or functionality issues

**Expected Results:**
- ✅ All tests pass in Firefox
- ✅ UI looks consistent with Chrome
- ✅ No console errors

**Record:**
- [ ] All Tests Passed in Firefox
- [ ] Issues Found (describe):

---

### Test 4.3: Microsoft Edge

**Steps:**

1. Open Microsoft Edge
2. Run Tests 1.1 through 1.9
3. Note any visual differences or functionality issues

**Expected Results:**
- ✅ All tests pass in Edge
- ✅ UI looks consistent with Chrome
- ✅ No console errors

**Record:**
- [ ] All Tests Passed in Edge
- [ ] Issues Found (describe):

---

**Note**: Safari testing is optional if you don't have access to macOS devices. Chrome, Firefox, and Edge are the minimum required browsers. Android device testing (Tests 5.4 and 5.5) is more critical than Safari testing.

---

## Test Suite 5: Responsive Design & Accessibility

**Goal**: Verify the application works on different screen sizes and is accessible.

**Note**: 
- Tests 5.1-5.3 use browser developer tools to simulate mobile/tablet devices (quick initial check)
- Tests 5.4-5.5 use actual Android devices (more thorough, tests touch interactions)
- Browser dev tools are useful but NOT a substitute for real device testing
- Actual device testing catches issues that emulation misses (touch precision, keyboard behavior, OS quirks)

### Test 5.1: Mobile View - Browser Dev Tools (320px - 767px)

**Steps:**

1. In Chrome, press F12 to open Developer Tools
2. Click the "Toggle device toolbar" icon (or press Ctrl+Shift+M)
3. Select "Galaxy S20" or "Pixel 5" from the device dropdown (or manually set width to 360px)
4. Test the following:
   - Navigate through the app
   - Click the hamburger menu icon (three lines)
   - Test registration form
   - Test login form
   - Test settings form

**Expected Results:**
- ✅ Hamburger menu icon appears in header
- ✅ Clicking hamburger menu opens navigation menu
- ✅ Menu items are readable and clickable
- ✅ Forms are usable (all fields fit on screen)
- ✅ Text is readable (not too small)
- ✅ Buttons are large enough to tap with a finger
- ✅ No horizontal scrolling required
- ✅ Settings form fields stack vertically

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 5.2: Tablet View (768px - 1023px)

**Steps:**

1. In Developer Tools device toolbar, select "Galaxy Tab S4" or "Nest Hub" (or manually set width to 768px)
2. Navigate through the app
3. Test forms and navigation

**Expected Results:**
- ✅ Layout adjusts appropriately for tablet
- ✅ Navigation may show full menu or hamburger (depends on design)
- ✅ Forms are comfortable to use
- ✅ Content is well-spaced
- ✅ No horizontal scrolling

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 5.3: Desktop View (1024px+)

**Steps:**

1. Resize browser to full screen (1920px wide or larger)
2. Navigate through the app
3. Check that content is centered and not stretched across entire screen

**Expected Results:**
- ✅ Full navigation menu is visible (no hamburger menu)
- ✅ Content is readable and well-spaced
- ✅ User menu in header works correctly
- ✅ Forms are appropriately sized (not too wide)
- ✅ Everything looks professional and polished

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 5.4: Android Phone Testing (Actual Device)

**Goal**: Verify the application works on a real Android phone.

**Prerequisites**: 
- Android phone with Chrome browser
- Internet connection

**Steps:**

1. Open Chrome on your Android phone
2. Navigate to: https://boelslund-planwell-finance-dev.web.app/
3. Test the following user flows:
   - Register a new account
   - Navigate using the hamburger menu
   - Access Settings
   - Change theme and save
   - Change other settings and save
   - Logout and login again
4. Pay attention to:
   - Touch targets (buttons, links) - are they easy to tap?
   - Text readability
   - Form input fields - can you type easily?
   - Keyboard behavior (does it show up correctly?)
   - Screen rotation (portrait vs landscape)

**Expected Results:**
- ✅ All text is readable without zooming
- ✅ Buttons and links are easy to tap (not too small)
- ✅ Touch interactions feel natural (no accidental taps)
- ✅ Hamburger menu opens and closes smoothly
- ✅ Forms are easy to fill out on mobile keyboard
- ✅ No elements overflow the screen width
- ✅ Dropdowns work correctly (native Android dropdowns appear)
- ✅ App works in both portrait and landscape orientations
- ✅ Theme changes apply correctly
- ✅ Navigation is intuitive

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):
- [ ] Test Skipped (no Android phone available)

**Device Info** (if tested):
- Phone model: _____________
- Android version: _____________
- Chrome version: _____________

---

### Test 5.5: Android Tablet Testing (Actual Device)

**Goal**: Verify the application works on a real Android tablet.

**Prerequisites**: 
- Android tablet with Chrome browser
- Internet connection

**Steps:**

1. Open Chrome on your Android tablet
2. Navigate to: https://boelslund-planwell-finance-dev.web.app/
3. Test the same user flows as Test 5.4
4. Check if layout adapts appropriately for tablet screen size:
   - Does navigation stay as hamburger or expand to full menu?
   - Are forms comfortable to use?
   - Is content well-spaced or too sparse?

**Expected Results:**
- ✅ Layout is optimized for tablet screen size (between phone and desktop)
- ✅ Touch targets are appropriately sized
- ✅ Navigation is appropriate for tablet (may show full menu)
- ✅ Forms are comfortable to use with touch keyboard
- ✅ Content is well-spaced (not too cramped or too sparse)
- ✅ Works in both portrait and landscape orientations
- ✅ All functionality from desktop works on tablet

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):
- [ ] Test Skipped (no Android tablet available)

**Device Info** (if tested):
- Tablet model: _____________
- Android version: _____________
- Chrome version: _____________

---

### Test 5.6: Keyboard Navigation

**Goal**: Verify users can navigate the app without a mouse.

**Steps:**

1. Navigate to the Login page
2. Do NOT use your mouse - only use your keyboard:
   - Press Tab to move between fields
   - Use arrow keys to select dropdown options
   - Press Enter to submit forms
   - Press Escape to close menus/dialogs
3. Test this on:
   - Login form
   - Registration form
   - Settings form
   - Navigation menu

**Expected Results:**
- ✅ Tab key moves focus through all interactive elements in logical order
- ✅ Focused element has visible outline or highlight
- ✅ Can select dropdown options with arrow keys
- ✅ Enter key submits forms
- ✅ Escape key closes menus and dialogs
- ✅ All functionality works without mouse

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

### Test 5.7: Loading States

**Goal**: Verify loading indicators appear during async operations.

**Steps:**

1. Login to your account
2. Navigate to Settings
3. Change a setting and click Save
4. Watch carefully for loading indicators
5. Refresh the page and watch for loading states while data loads

**Expected Results:**
- ✅ During save: Button shows "Saving..." or a spinner appears
- ✅ During page load: Loading spinner or "Loading..." message appears
- ✅ Loading states are visible but don't block the entire UI unnecessarily
- ✅ Loading states clear when operation completes

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

## Test Suite 6: Visual & UX Testing

**Goal**: Verify the application looks good and provides a good user experience.

### Test 6.1: Visual Consistency

**Steps:**

1. Navigate through all pages of the application
2. Check for visual consistency:
   - Colors and theme
   - Font sizes and styles
   - Button styles
   - Form input styles
   - Spacing and alignment

**Expected Results:**
- ✅ Colors are consistent across pages
- ✅ Buttons look similar throughout the app
- ✅ Forms have consistent styling
- ✅ Text is readable and properly sized
- ✅ No visual glitches or overlapping elements

**Record:**
- [ ] Test Passed
- [ ] Issues Found (describe):

---

### Test 6.2: Error Message Clarity

**Steps:**

1. Review all error messages you encountered during testing
2. Evaluate each message:
   - Is it clear what went wrong?
   - Does it tell you how to fix it?
   - Is the language friendly and non-technical?

**Expected Results:**
- ✅ Error messages are easy to understand
- ✅ Messages explain what went wrong
- ✅ Messages guide users on how to fix the issue
- ✅ No technical jargon (e.g., "500 Internal Server Error")
- ✅ Tone is helpful, not accusatory

**Record:**
- [ ] All error messages are clear
- [ ] Some messages need improvement (list them):

---

### Test 6.3: Success Feedback

**Steps:**

1. Perform actions that should show success messages:
   - Save settings
   - Login successfully
   - Register successfully
2. Verify success feedback is clear and visible

**Expected Results:**
- ✅ Success messages appear when actions complete
- ✅ Messages are clearly visible (color, position)
- ✅ Messages auto-dismiss after a few seconds (don't require manual closing)
- ✅ User receives positive confirmation of their action

**Record:**
- [ ] Test Passed
- [ ] Test Failed (describe what went wrong):

---

## Summary Checklist

Before reporting that Phase 1 testing is complete, verify:

- [ ] All tests in Test Suite 1 (Happy Path) passed
- [ ] All tests in Test Suite 2 (Error Handling) passed
- [ ] All tests in Test Suite 3 (Security) passed
- [ ] Application tested in Chrome, Firefox, and Edge (minimum requirement)
- [ ] Responsive design tested on mobile, tablet, and desktop sizes (browser dev tools)
- [ ] **Priority**: Tested on actual Android phone (or documented as skipped if device unavailable)
- [ ] **Priority**: Tested on actual Android tablet (or documented as skipped if device unavailable)
- [ ] Keyboard navigation works correctly
- [ ] All issues documented with screenshots and details
- [ ] No critical bugs remaining (app-breaking issues)

**Note**: Safari testing is optional. Android device testing is more important for this application's target users.

---

## Tips for Effective Testing

1. **Take Your Time**: Don't rush through tests. Give forms and buttons time to respond.

2. **Clear Browser Cache**: If something seems broken, try clearing your browser cache (Ctrl+Shift+Del) and reloading.

3. **Document Everything**: When you find an issue, write down:
   - Exact steps to reproduce
   - What you expected
   - What actually happened
   - Screenshot if possible
   - Device/browser information

4. **Test Like a Real User**: Try to use the app naturally, not just following the script.

5. **Look for Edge Cases**: Try unusual inputs, rapid clicking, etc.

6. **Check Console for Errors**: Open Developer Tools (F12) and check the Console tab for red error messages.

7. **Android Device Testing**: If you don't have access to an Android phone or tablet:
   - Document that the test was skipped (not a test failure)
   - Browser dev tools responsive testing is required but not a complete substitute for real devices
   - Consider borrowing a device from a friend/colleague for critical pre-release testing

---

## Troubleshooting Common Issues

### "I can't access the test URL"
- Check your internet connection
- Verify the URL is correct
- Try a different browser
- Clear browser cache

### "I'm not receiving the password reset email"
- Check spam/junk folder
- Wait a few minutes (email may be delayed)
- Verify you entered the correct email address
- Try using a different email provider

### "The app looks broken or has no styling"
- Clear browser cache (Ctrl+Shift+Del)
- Hard refresh the page (Ctrl+F5)
- Check if Developer Tools is open in offline mode
- Try a different browser

### "Settings aren't saving"
- Check your internet connection
- Look for error messages on the page
- Check browser console for errors (F12 → Console)
- Try logging out and back in

---

## Contact

If you encounter issues not covered in this guide or have questions:
- **Document the issue** with as much detail as possible
- **Take screenshots** if relevant
- **Note your browser and operating system**
- Report to the development team

Thank you for your thorough testing! Your feedback helps make PlanWell Finance better for all users.
