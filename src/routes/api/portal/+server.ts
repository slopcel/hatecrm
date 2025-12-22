import { CustomerPortal } from '@dodopayments/sveltekit';
import { DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_ENVIRONMENT } from '$env/static/private';

// Customer portal handler - redirects customers to manage their subscriptions
const customerPortalHandler = CustomerPortal({
	bearerToken: DODO_PAYMENTS_API_KEY,
	environment: DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode'
});

// Usage: GET /api/portal?customer_id=cus_xxx
// Optional: &send_email=true to email the portal link to the customer
export const GET = customerPortalHandler.GET;
