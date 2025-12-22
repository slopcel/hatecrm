# Indie Hacker Stack

Ship fast with **SvelteKit + Supabase + DodoPay + Cloudflare Pages**.

## Stack Overview

| Layer | Technology |
|-------|------------|
| **Framework** | SvelteKit (Svelte 5) |
| **Hosting** | Cloudflare Pages |
| **Database** | Supabase (Postgres) |
| **Auth** | Supabase Auth (free!) |
| **Payments** | DodoPay |
| **Analytics** | Umami (self-hosted) |

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your keys

# Start dev server
npm run dev
```

## Environment Variables

### Required

```env
# Supabase (from project settings > API)
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=xxx

# DodoPay (from dashboard)
DODO_PAYMENTS_API_KEY=xxx
DODO_PAYMENTS_WEBHOOK_KEY=xxx
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_RETURN_URL=http://localhost:5173/dashboard
```

### Optional (Umami Analytics)

```env
PUBLIC_UMAMI_HOST=https://your-umami.vercel.app
PUBLIC_UMAMI_WEBSITE_ID=xxx
```

## Project Structure

```
src/
├── app.d.ts              # TypeScript types for App.Locals
├── app.html              # HTML template (includes Umami script)
├── app.css               # Global styles
├── hooks.server.ts       # Supabase server client + session handling
├── lib/
│   ├── supabase.ts       # Supabase browser client
│   └── types/
│       └── database.ts   # Supabase database types
└── routes/
    ├── +layout.server.ts # Pass session to client
    ├── +layout.ts        # Create browser Supabase client
    ├── +layout.svelte    # Auth state listener
    ├── +page.svelte      # Landing page
    ├── auth/
    │   ├── login/        # Email/password + OAuth login
    │   ├── signup/       # Registration
    │   ├── callback/     # OAuth callback handler
    │   └── logout/       # Sign out endpoint
    ├── dashboard/        # Protected route example
    ├── pricing/          # Pricing page with checkout
    └── api/
        ├── checkout/     # DodoPay checkout sessions
        ├── portal/       # DodoPay customer portal
        └── webhooks/
            └── dodopay/  # DodoPay webhook handler
```

## Auth Implementation

### Safe Session Pattern

Always use `safeGetSession()` which validates the JWT server-side:

```typescript
// In +page.server.ts
const { session, user } = await locals.safeGetSession();

if (!session) {
  redirect(303, '/auth/login');
}
```

### OAuth Setup

1. Enable providers in Supabase Dashboard > Authentication > Providers
2. Add redirect URL: `https://your-domain.com/auth/callback`
3. OAuth buttons are already wired up in login/signup pages

## Payments

### Creating a Checkout

```svelte
<form action="/api/checkout" method="POST">
  <input type="hidden" name="product_id" value="pdt_xxx" />
  <input type="hidden" name="external_id" value={userId} />
  <input type="hidden" name="email" value={userEmail} />
  <button type="submit">Subscribe</button>
</form>
```

### Customer Portal

```svelte
<form action="/api/portal" method="POST">
  <input type="hidden" name="customer_id" value={dodoCustomerId} />
  <button type="submit">Manage Subscription</button>
</form>
```

### Webhooks

Configure in DodoPay dashboard: `https://your-domain.com/api/webhooks/dodopay`

Edit `src/routes/api/webhooks/dodopay/+server.ts` to handle events.

## Deployment

### Cloudflare Pages

1. Push to GitHub
2. Connect repo in Cloudflare Pages dashboard
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `.svelte-kit/cloudflare`
4. Add environment variables
5. Deploy!

### Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Add redirect URLs in Authentication > URL Configuration:
   - `http://localhost:5173/auth/callback` (dev)
   - `https://your-domain.com/auth/callback` (prod)
3. Run the SQL below to create tables:

```sql
-- Create profiles table
create table profiles (
  id uuid references auth.users primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create subscriptions table
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  dodo_customer_id text,
  dodo_subscription_id text,
  status text default 'inactive',
  plan text,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table subscriptions enable row level security;

-- RLS policies
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can view own subscription"
  on subscriptions for select using (auth.uid() = user_id);
```

### Umami Analytics

1. Fork [umami-software/umami](https://github.com/umami-software/umami)
2. Deploy to Vercel or Railway
3. Create a separate Supabase project for Umami
4. Set `DATABASE_URL` and `DIRECT_DATABASE_URL` in Umami deployment
5. Add website and copy the website ID
6. Set `PUBLIC_UMAMI_HOST` and `PUBLIC_UMAMI_WEBSITE_ID` in your app

## Philosophy

This stack follows the **Ship Fast** philosophy:

- Working code over perfect architecture
- Conventions over configuration
- Use what's free (Supabase Auth > Clerk)
- Colocate related code
- Form actions over API routes
- Progressive enhancement with `use:enhance`

## License

MIT

