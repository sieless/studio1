# 🛡️ Sentry Error Tracking Setup Guide

## Overview

Sentry is now **pre-configured** for Key-2-Rent but **disabled by default**. This guide explains how to activate error tracking when you're ready.

---

## ✨ Features Included

✅ **Error Tracking** - Catch and log all runtime errors
✅ **Performance Monitoring** - Track page load times and API calls
✅ **Session Replay** - Watch recordings of error sessions
✅ **User Context** - Know which users encountered errors
✅ **Breadcrumbs** - See what led up to each error
✅ **Source Maps** - View original code (not minified)

---

## 🚀 How to Activate Sentry (When Ready)

### Step 1: Create Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Sign up (free plan available)
3. Create a new project:
   - Platform: **Next.js**
   - Project name: **key-2-rent**

### Step 2: Get Your DSN

After creating the project, Sentry will show you a **DSN** (Data Source Name). It looks like:

```
https://abc123def456@o123456.ingest.sentry.io/7891011
```

### Step 3: Add to Environment Variables

**For local development** (`.env.local`):
```env
# Sentry Error Tracking (optional)
SENTRY_DSN=https://abc123def456@o123456.ingest.sentry.io/7891011
NEXT_PUBLIC_SENTRY_DSN=https://abc123def456@o123456.ingest.sentry.io/7891011
```

**For production** (Vercel/Firebase Hosting):
1. Go to your hosting dashboard
2. Add environment variables:
   - `SENTRY_DSN` → your DSN
   - `NEXT_PUBLIC_SENTRY_DSN` → same DSN

### Step 4: Deploy

Run `npm run build` and deploy. Sentry will automatically start tracking errors.

---

## 🎛️ Configuration Files

### 1. `sentry.client.config.ts`
Tracks errors in the **browser** (user-facing errors).

**Features enabled:**
- Error tracking
- Performance monitoring (10% sample rate in production)
- Session replay (10% of sessions, 100% when error occurs)
- Automatic breadcrumbs

### 2. `sentry.server.config.ts`
Tracks errors on the **server** (API routes, server components).

**Features enabled:**
- Server-side error tracking
- API performance monitoring
- Server action tracking

### 3. `sentry.edge.config.ts`
Tracks errors in **Edge Runtime** (middleware, edge functions).

---

## 📊 What Gets Tracked

### ✅ Tracked:
- JavaScript runtime errors
- Unhandled promise rejections
- React component errors (via ErrorBoundary)
- API request failures
- Firebase errors (unexpected ones)
- Performance metrics (page load, API calls)

### ❌ Filtered Out (Noise Reduction):
- Browser extension errors
- Firebase expected errors:
  - `auth/popup-closed-by-user`
  - `auth/cancelled-popup-request`
  - `auth/id-token-expired`
- Network errors (expected in poor connectivity)
- Development mode events (console only)

---

## 🔍 Monitoring Errors

### Viewing Errors:
1. Log into [sentry.io](https://sentry.io)
2. Select your "key-2-rent" project
3. View:
   - **Issues** - All errors grouped by type
   - **Performance** - Page load times, slow queries
   - **Replays** - Video recordings of error sessions

### Understanding an Error:
Each error shows:
- **Stack trace** - Where the error occurred
- **Breadcrumbs** - User actions before error
- **User context** - Which user (if logged in)
- **Device info** - Browser, OS, screen size
- **Replay** - Watch what the user did

---

## 💰 Pricing (Sentry Free Tier)

**Free Plan Includes:**
- 5,000 errors/month
- 10,000 performance transactions/month
- 50 replays/month
- 1 team member
- 30-day data retention

**This is MORE than enough for launch and first few months.**

When you exceed free tier limits, Sentry will:
- Stop tracking new errors (won't break your app)
- Send you an email notification
- Offer paid upgrade (starts at $26/month)

---

## 🛠️ Testing Sentry (Before Going Live)

### Test in Development:
1. Add `NEXT_PUBLIC_SENTRY_DSN` to `.env.local`
2. Temporarily comment out the development filter in `sentry.client.config.ts`:
   ```ts
   // beforeSend(event) {
   //   if (process.env.NODE_ENV === 'development') {
   //     return null; // Comment this out to test
   //   }
   // }
   ```
3. Trigger a test error:
   ```tsx
   // Add to any page
   <button onClick={() => { throw new Error('Test Sentry!') }}>
     Test Error Tracking
   </button>
   ```
4. Click the button
5. Check Sentry dashboard - error should appear within 1 minute

### Test in Production:
1. Deploy with Sentry DSN
2. Visit your site
3. Trigger an error (same button as above)
4. Check Sentry dashboard

---

## 🚨 When to Activate Sentry

### ✅ Good time to activate:
- **After launch** - Wait 1-2 weeks to ensure platform is stable
- **When scaling** - More users = more potential errors
- **Before major updates** - Catch bugs in new features

### ⏸️ Not urgent now:
- **During FREE launch** - Focus on user acquisition first
- **With few users** - Manual testing is enough for now
- **Pre-launch** - Save the free tier for production

---

## 📈 Recommended Workflow

### Week 1-2 (Launch Phase):
- ❌ Sentry OFF
- ✅ Manual testing via browser console
- ✅ Monitor Firebase Console for errors

### Week 3-4 (Post-Launch):
- ✅ Activate Sentry
- ✅ Check daily for critical errors
- ✅ Fix high-impact bugs

### Month 2+:
- ✅ Check weekly
- ✅ Set up Slack/email alerts for critical errors
- ✅ Monitor performance trends

---

## 🔔 Setting Up Alerts (Optional)

1. Go to Sentry project settings
2. Navigate to **Alerts**
3. Create alert rule:
   - **Trigger**: Issue is first seen
   - **Action**: Send notification to email/Slack
   - **Conditions**: Error count > 10 in 1 hour

This notifies you immediately when critical errors occur.

---

## 🤝 Team Access (Future)

Free plan: 1 team member
Paid plan: Add developers to collaborate

To invite team members:
1. Sentry → Settings → Members
2. Enter email
3. Set permissions (admin/member/viewer)

---

## ❓ Troubleshooting

### "Sentry not tracking errors"
1. Check DSN is set in environment variables
2. Rebuild and redeploy (`npm run build`)
3. Check Sentry project settings (DSN matches)
4. Look for console errors mentioning Sentry

### "Too many events, hitting limits"
1. Increase sample rate filters in config files
2. Add more ignored errors to filter list
3. Upgrade Sentry plan

### "Can't see source code in stack traces"
1. Ensure build includes source maps (`npm run build`)
2. Check Sentry upload configuration (handled automatically)

---

## 📚 Further Reading

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)

---

## 🎯 Summary

**Status**: ✅ Configured, ❌ Not Active
**Activation**: Add DSN to environment variables
**Cost**: Free for first 5K errors/month
**Recommended**: Activate 1-2 weeks after launch

Sentry is **ready to use** whenever you need it - just add the DSN! 🚀
