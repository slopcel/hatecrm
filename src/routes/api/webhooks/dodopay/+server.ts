import { Webhooks } from '@dodopayments/sveltekit';
import { DODO_PAYMENTS_WEBHOOK_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database';

// Create a Supabase client for webhook handling
// In production, use SUPABASE_SERVICE_ROLE_KEY for admin access to bypass RLS
const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

// Create webhook handler with event handlers
export const POST = Webhooks({
	webhookKey: DODO_PAYMENTS_WEBHOOK_KEY,

	// Generic payload handler - catches all events
	onPayload: async (payload) => {
		console.log('DodoPay webhook received:', payload.type, payload);
	},

	// Handle subscription events
	onSubscriptionActive: async (payload) => {
		console.log('Subscription activated:', payload);
		// Example: Update your database when a subscription becomes active
		// const { customer, subscription_id, product_id } = payload.data;
		// await supabase.from('subscriptions').upsert({
		//   user_id: customer.external_id, // Your user ID passed during checkout
		//   dodo_customer_id: customer.customer_id,
		//   dodo_subscription_id: subscription_id,
		//   status: 'active',
		//   plan: product_id,
		//   current_period_end: payload.data.current_period_end
		// });
	},

	onSubscriptionCancelled: async (payload) => {
		console.log('Subscription cancelled:', payload);
		// await supabase.from('subscriptions')
		//   .update({ status: 'cancelled' })
		//   .eq('dodo_subscription_id', payload.data.subscription_id);
	},

	onSubscriptionPaused: async (payload) => {
		console.log('Subscription paused:', payload);
	},

	onSubscriptionRenewed: async (payload) => {
		console.log('Subscription renewed:', payload);
		// Update current_period_end in your database
	},

	onSubscriptionFailed: async (payload) => {
		console.log('Subscription failed:', payload);
	},

	onSubscriptionExpired: async (payload) => {
		console.log('Subscription expired:', payload);
	},

	// Handle payment events
	onPaymentSucceeded: async (payload) => {
		console.log('Payment succeeded:', payload);
		// Credit user account, send confirmation email, etc.
	},

	onPaymentFailed: async (payload) => {
		console.log('Payment failed:', payload);
		// Handle failed payment - notify user, retry logic, etc.
	},

	onPaymentProcessing: async (payload) => {
		console.log('Payment processing:', payload);
	},

	onPaymentCancelled: async (payload) => {
		console.log('Payment cancelled:', payload);
	},

	// Handle refund events
	onRefundSucceeded: async (payload) => {
		console.log('Refund succeeded:', payload);
		// Revoke access, update records, etc.
	},

	onRefundFailed: async (payload) => {
		console.log('Refund failed:', payload);
	},

	// Handle dispute events
	onDisputeOpened: async (payload) => {
		console.log('Dispute opened:', payload);
		// Alert team, gather evidence, etc.
	},

	onDisputeWon: async (payload) => {
		console.log('Dispute won:', payload);
	},

	onDisputeLost: async (payload) => {
		console.log('Dispute lost:', payload);
	},

	// Handle license key events (for software products)
	onLicenseKeyCreated: async (payload) => {
		console.log('License key created:', payload);
		// Store and send license key to customer
	}
});
