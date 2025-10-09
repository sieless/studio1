# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in Key-2-Rent, please report it responsibly:

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please email: [Your security contact email]

We take all security reports seriously and will respond promptly.

## Security Best Practices

### Credential Management

- **NEVER** commit API keys, secrets, or credentials to version control
- All sensitive credentials are stored in environment variables
- Use `.env.local` for local development (never commit this file)
- See `.env.example` for required environment variables structure
- Regular credential rotation is mandatory

### Environment Variables

All sensitive configuration is managed through environment variables:

#### Required Variables:
- Firebase configuration (7 variables)
- Cloudinary credentials (3 variables)
- Google AI API key
- Optional: M-Pesa credentials for payment integration

See `.env.example` for the complete list.

### API Key Security

#### Firebase
- API key restrictions enabled in Firebase Console
- Restricted to specific domains/apps
- Regular monitoring of Firebase usage

#### Cloudinary
- API secret never exposed to client
- Server-side operations only
- Regular credential rotation

#### M-Pesa (if applicable)
- Sandbox credentials for testing
- Production credentials stored securely
- Callback URL verification enabled

## Development Security

### Pre-commit Checks

This repository uses pre-commit hooks to prevent accidental credential exposure:

```bash
npm run check-secrets     # Scan for potential secrets in code
npm run verify-gitignore  # Ensure .env files aren't tracked
```

### Git Security

- `.gitignore` configured to exclude all `.env*` files (except `.env.example`)
- Sensitive documentation files blocked from commits
- Git history cleaned of any previously committed credentials

## Deployment Security

### Vercel Deployment

All environment variables must be configured in Vercel:

1. Go to: https://vercel.com/dashboard
2. Select project → Settings → Environment Variables
3. Add all required variables for Production, Preview, and Development
4. Never include actual credentials in deployment documentation

### Firebase Security Rules

Firestore security rules enforce:
- User can only read/write their own profile
- Listings require owner authentication
- Public read access for approved listings only

## Credential Rotation

In case of credential exposure:

1. **Immediately** rotate all exposed credentials:
   - Firebase: Regenerate API keys in Firebase Console
   - Cloudinary: Regenerate API secret
   - M-Pesa: Create new app and get new credentials

2. Update credentials in:
   - `.env.local` (local development)
   - Vercel environment variables (production)

3. Verify old credentials are revoked

4. Monitor for unauthorized usage

## Security Monitoring

- Regular security audits of dependencies: `npm audit`
- Firebase usage monitoring for unusual activity
- Cloudinary usage monitoring
- GitHub secret scanning enabled

## Known Security Measures

- ✅ Hardcoded credential removal from source code
- ✅ Environment variable validation on app startup
- ✅ `.gitignore` configured to prevent credential commits
- ✅ Pre-commit hooks for secret detection
- ✅ Firebase security rules enforced
- ✅ API key restrictions in place

## Security Updates

This security policy was last updated: **2025-10-09**

We regularly review and update our security practices. Check back for updates.

## Compliance

- GDPR considerations for user data
- Kenyan data protection regulations
- PCI DSS considerations for payment processing (M-Pesa)

## Third-Party Security

### Dependencies
- Regular updates via `npm update`
- Security audits via `npm audit`
- Automated dependency scanning

### External Services
- Firebase: Google's enterprise-grade security
- Cloudinary: SOC 2 Type II certified
- Vercel: ISO 27001 certified
- M-Pesa: Safaricom's secure payment gateway

## Contact

For security concerns or questions about this policy:
- Email: [Your security contact]
- GitHub Security Advisories: [Enable in repository settings]

---

**Remember**: Security is everyone's responsibility. When in doubt, ask before committing.
