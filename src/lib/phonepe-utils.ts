/**
 * PhonePe Payment Gateway Utility Functions
 * Based on official PhonePe PG Checkout API documentation
 */

export interface PhonePeConfig {
    clientId: string;
    clientSecret: string;
    clientVersion: string;
    apiBaseUrl: string;
}

export interface OAuthTokenResponse {
    access_token: string;
    expires_at: number;
    token_type: string;
}

export interface PaymentPayload {
    merchantOrderId: string;
    amount: number;
    redirectUrl: string;
    redirectMode?: string;
    callbackUrl?: string;
    message?: string;
}

// Cache for OAuth token to avoid requesting new token for every API call
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get PhonePe configuration from environment variables
 */
export function getPhonePeConfig(): PhonePeConfig {
    // In server-side environments, we use process.env or import.meta.env
    const clientId = process.env.PHONEPE_CLIENT_ID || import.meta.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET || import.meta.env.PHONEPE_CLIENT_SECRET;
    const clientVersion = process.env.PHONEPE_CLIENT_VERSION || import.meta.env.PHONEPE_CLIENT_VERSION || '1';
    const apiBaseUrl = process.env.PHONEPE_API_BASE_URL || import.meta.env.PHONEPE_API_BASE_URL;

    if (!clientId || !clientSecret || !apiBaseUrl) {
        throw new Error('PhonePe configuration is missing. Required: PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET, PHONEPE_API_BASE_URL');
    }

    return {
        clientId,
        clientSecret,
        clientVersion,
        apiBaseUrl,
    };
}

/**
 * Get OAuth Access Token from PhonePe
 */
export async function getAccessToken(config: PhonePeConfig): Promise<string> {
    // Check if we have a valid cached token
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) { // 1 minute buffer
        console.log('Using cached OAuth token');
        return cachedToken.token;
    }

    console.log('Requesting new OAuth token from PhonePe...');

    const tokenUrl = `${config.apiBaseUrl}/v1/oauth/token`;

    const formData = new URLSearchParams();
    formData.append('client_id', config.clientId);
    formData.append('client_secret', config.clientSecret);
    formData.append('client_version', config.clientVersion);
    formData.append('grant_type', 'client_credentials');

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
    });

    const responseText = await response.text();
    if (!response.ok) {
        throw new Error(`Failed to get OAuth token: ${response.status} - ${responseText}`);
    }

    const tokenData: OAuthTokenResponse = JSON.parse(responseText);
    if (!tokenData.access_token) {
        throw new Error('No access_token in OAuth response');
    }

    // Cache the token
    cachedToken = {
        token: tokenData.access_token,
        expiresAt: tokenData.expires_at * 1000, // Convert seconds to milliseconds
    };

    return tokenData.access_token;
}

/**
 * Generate unique merchant order ID
 */
export function generateMerchantOrderId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORDER_${timestamp}_${random}`;
}

/**
 * Create payment payload for PhonePe PG Checkout API
 */
export function createPaymentPayload(params: PaymentPayload) {
    return {
        merchantOrderId: params.merchantOrderId,
        amount: params.amount,
        expireAfter: 1200, // 20 minutes
        metaInfo: {
            udf1: 'FILLS_AI_PAYMENT',
            udf2: params.merchantOrderId,
        },
        paymentFlow: {
            type: 'PG_CHECKOUT',
            message: params.message || 'Payment for FILLS AI Services',
            merchantUrls: {
                redirectUrl: params.redirectUrl,
                callbackUrl: params.callbackUrl || params.redirectUrl,
            },
        },
    };
}

/**
 * Validate amount (must be positive number)
 */
export function validateAmount(amount: number): boolean {
    return typeof amount === 'number' && amount > 0;
}

/**
 * Convert rupees to paise
 */
export function rupeesToPaise(rupees: number): number {
    return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees
 */
export function paiseToRupees(paise: number): number {
    return paise / 100;
}

/**
 * Get headers with OAuth Bearer token
 */
export function getPhonePeHeaders(accessToken: string): HeadersInit {
    return {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${accessToken}`,
    };
}

/**
 * Clear cached token
 */
export function clearTokenCache(): void {
    cachedToken = null;
}
