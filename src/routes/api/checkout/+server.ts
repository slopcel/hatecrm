import { Checkout } from '@dodopayments/sveltekit';
import {
	DODO_PAYMENTS_API_KEY,
	DODO_PAYMENTS_ENVIRONMENT,
	DODO_PAYMENTS_RETURN_URL
} from '$env/static/private';

// Checkout session handler (POST) - recommended for dynamic checkout
const checkoutPostHandler = Checkout({
	bearerToken: DODO_PAYMENTS_API_KEY,
	returnUrl: DODO_PAYMENTS_RETURN_URL,
	environment: DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode',
	type: 'session'
});

// Static checkout handler (GET) - for simple product links
const checkoutGetHandler = Checkout({
	bearerToken: DODO_PAYMENTS_API_KEY,
	returnUrl: DODO_PAYMENTS_RETURN_URL,
	environment: DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode',
	type: 'static'
});

export const GET = checkoutGetHandler.GET;
export const POST = checkoutPostHandler.POST;
