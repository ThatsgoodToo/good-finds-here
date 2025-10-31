# Secure Profile Queries Guide

## ⚠️ CRITICAL: Protecting User Email Addresses

The `profiles` table contains sensitive PII including **email addresses**. RLS policies are configured to allow viewing, but **application code MUST** explicitly select only safe columns for public queries.

## Security Rules

### ✅ SAFE Public Fields
These fields are safe to query for public profile views:
- `id` - User UUID
- `display_name` - Public display name
- `avatar_url` - Profile picture URL
- `profile_picture_url` - Alternative profile picture
- `bio` - User bio/description
- `created_at` - Account creation date
- `high_fives_public` - Privacy setting for high-fives
- `location_public` - Privacy setting for location

### ❌ SENSITIVE Fields (Owner-Only)
These fields MUST NEVER be included in public queries:
- `email` - ⚠️ CRITICAL PII
- `full_name` - Personal information
- `subscription_status` - Business data
- `age_verified` - Private verification status
- `terms_accepted` - Internal flag
- `analytics_consent` - Internal flag
- `onboarding_completed` - Internal flag
- `interests` - Potentially sensitive preferences
- `role` - Use `user_roles` table instead

## Query Examples

### ✅ RECOMMENDED: Use Public Profiles View
```typescript
// Viewing another user's profile (public data only)
// Using the dedicated public_profiles view that excludes all sensitive data
const { data } = await supabase
  .from('public_profiles')
  .select('*')  // Safe - view only contains non-sensitive columns
  .eq('id', userId)
  .single();
```

### ✅ CORRECT: Public Profile View (Direct Query)
```typescript
// Alternative: Direct query with explicit safe columns
const { data } = await supabase
  .from('profiles')
  .select('id, display_name, avatar_url, profile_picture_url, bio, created_at')
  .eq('id', userId)
  .single();
```

### ✅ CORRECT: Own Profile View
```typescript
// User viewing their own profile (can include sensitive data)
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)  // auth.uid() = id allows full access
  .single();
```

### ✅ CORRECT: Using Helper Function
```typescript
// Using the security definer function for public profiles
const { data } = await supabase
  .rpc('get_public_profile', { _user_id: userId });
```

### ❌ WRONG: Exposes Email to Public
```typescript
// NEVER DO THIS - Exposes email addresses!
const { data } = await supabase
  .from('profiles')
  .select('*')  // ❌ Includes email!
  .eq('id', someOtherUserId);
```

### ❌ WRONG: Selecting Email for Public List
```typescript
// NEVER DO THIS - Leaks all user emails!
const { data } = await supabase
  .from('profiles')
  .select('email, display_name');  // ❌ Email exposed!
```

## Code Review Checklist

Before merging any code that queries `profiles`:

- [ ] Check if query selects `email` field
- [ ] Verify query is for user's own profile (`auth.uid() = id`)
- [ ] If public query, confirm only safe fields are selected
- [ ] Use explicit column list instead of `SELECT *`
- [ ] Consider using `get_public_profile()` helper function

## Database Views

### `public_profiles` View
A dedicated view that exposes only safe profile fields. **Recommended for all public profile queries.**

**Included Fields:**
- `id`, `display_name`, `avatar_url`, `profile_picture_url`, `bio`, `created_at`
- `high_fives_public`, `location_public` (privacy settings)

**Excluded Fields:**
- `email` ⚠️, `full_name`, `subscription_status`, internal flags

```typescript
// Best practice: Use the view for public profiles
const { data } = await supabase
  .from('public_profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

## Helper Functions

### `get_public_profile(_user_id)`
Returns only safe public fields for a user profile.

```typescript
const { data } = await supabase.rpc('get_public_profile', {
  _user_id: userId
});
// Returns: id, display_name, avatar_url, profile_picture_url, bio, created_at
```

### `can_view_profile_email(_profile_id)`
Check if current user can view email of a profile (only their own).

```typescript
const { data: canView } = await supabase.rpc('can_view_profile_email', {
  _profile_id: userId
});
```

## RLS Policies in Effect

1. **"Users can view own complete profile"** - Users can see all their own data
2. **"Public can view safe profile info"** - Allows SELECT but relies on app code filtering
3. **"Users can update own profile"** - Users can only update their own profile

## Security Testing

Test these scenarios:
1. **Unauthenticated user** should NOT be able to see any email addresses
2. **Authenticated user A** should NOT be able to see user B's email
3. **Authenticated user** SHOULD be able to see their own email
4. **Public queries** should explicitly exclude sensitive fields

## Emergency Response

If email exposure is detected:
1. Immediately audit all queries to `profiles` table
2. Check logs for unauthorized email access
3. Update all queries to use explicit safe field lists
4. Consider notifying affected users if data was scraped
