# New Better Auth Features

This document outlines the newly added authentication features to the
`@repo/auth` package.

## 🎯 Added Features

### 1. **Anonymous Sessions**

Allows guest users to interact with the application before creating an account.

#### Server Configuration

- ✅ `anonymous()` plugin added to server auth config
- ✅ Automatic session creation for guest users

#### Client Methods

```typescript
// Create anonymous session for guest users
await createAnonymousSession();

// Link anonymous session to permanent account
await linkAnonymousAccount({ email: "user@example.com", password: "password" });
```

### 2. **Phone Number Authentication**

Full SMS-based authentication with OTP verification.

#### Server Configuration

- ✅ `phoneNumber()` plugin with SMS OTP sending
- ✅ Integrated SMS service with Twilio/AWS SNS support
- ✅ Phone number fields added to user schema

#### Client Methods

```typescript
// Sign in with phone number (sends OTP)
await signInWithPhoneNumber("+1234567890");

// Verify phone OTP
await verifyPhoneOTP({ phoneNumber: "+1234567890", otp: "123456" });

// Add phone number to existing account
await addPhoneNumber("+1234567890");

// Verify phone number for existing account
await verifyPhoneNumber({ phoneNumber: "+1234567890", otp: "123456" });
```

#### Environment Variables

```bash
# Twilio (recommended)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Alternative: AWS SNS
AWS_SNS_ACCESS_KEY_ID=your_access_key
AWS_SNS_SECRET_ACCESS_KEY=your_secret_key
AWS_SNS_REGION=us-east-1
```

### 3. **Email OTP**

Alternative to magic links using one-time passwords.

#### Server Configuration

- ✅ `emailOTP()` plugin with email OTP sending
- ✅ Integrated with existing email service

#### Client Methods

```typescript
// Send email OTP
await sendEmailOTP("user@example.com", "sign-in");

// Verify email OTP
await verifyEmailOTP({ email: "user@example.com", otp: "123456" });

// Sign in with email OTP (alternative to password)
await signInWithEmailOTP("user@example.com");
```

### 4. **Enhanced Passkey Integration**

Improved WebAuthn/passkey support with better client methods.

#### Existing Methods (Enhanced)

```typescript
// Add passkey to account
await addPasskey({ name: "My Passkey" });

// List user's passkeys
await listPasskeys();

// Delete specific passkey
await deletePasskey("passkey-id");

// Sign in with passkey
await signInWithPasskey({ autoFill: true });

// Sign up with passkey
await signUpWithPasskey({
  email: "user@example.com",
  passkeyName: "Main Device"
});
```

## 🔧 Technical Implementation

### Database Schema Updates

New fields added to user table:

```sql
phoneNumber         String?
phoneNumberVerified Boolean? @default(false)
```

### SMS Service Architecture

- **Development**: Logs SMS messages to console
- **Production**: Supports Twilio and AWS SNS providers
- **Fallback**: Graceful degradation if no provider configured
- **Validation**: E.164 phone number format validation

### Error Handling

- Comprehensive error logging with `@repo/observability`
- Graceful fallbacks for missing configurations
- Type-safe error responses

### Security Features

- Rate limiting on authentication attempts
- OTP expiration (10 minutes for SMS, configurable for email)
- Phone number format validation
- Secure session management

## 📋 Usage Examples

### Anonymous to Authenticated User Flow

```typescript
// 1. Create anonymous session for guest checkout
await createAnonymousSession();

// 2. User adds items to cart, provides email at checkout
// 3. Link anonymous session to new account
await linkAnonymousAccount({
  email: "customer@example.com",
  password: "securepassword"
});

// 4. Anonymous cart/data is now linked to permanent account
```

### Phone Number Authentication Flow

```typescript
// 1. User enters phone number
const phoneNumber = "+1234567890";
await signInWithPhoneNumber(phoneNumber);

// 2. User receives SMS with OTP
// 3. User enters OTP
await verifyPhoneOTP({ phoneNumber, otp: "123456" });

// 4. User is authenticated and signed in
```

### Email OTP vs Magic Link

```typescript
// Traditional magic link
await sendMagicLink("user@example.com");

// New: Email OTP (faster, no redirect needed)
await sendEmailOTP("user@example.com", "sign-in");
await verifyEmailOTP({ email: "user@example.com", otp: "123456" });
```

## 🚀 Next Steps

### Immediate

1. **Set up SMS provider** - Configure Twilio or AWS SNS credentials
2. **Test phone authentication** - Verify SMS delivery in development
3. **Update UI components** - Add phone number input fields

### Future Enhancements

1. **Advanced RBAC** - Custom roles and permissions system
2. **Stripe Integration** - Subscription-based authentication features
3. **SSO/SAML** - Enterprise single sign-on support
4. **Advanced Rate Limiting** - Per-user and per-IP limits

## 🔗 Related Documentation

- [Better Auth Official Docs](https://www.better-auth.com/docs)
- [Phone Number Plugin](https://www.better-auth.com/docs/plugins/phone-number)
- [Anonymous Sessions](https://www.better-auth.com/docs/plugins/anonymous)
- [Email OTP Plugin](https://www.better-auth.com/docs/plugins/email-otp)
