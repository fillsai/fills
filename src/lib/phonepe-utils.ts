/**
 * PhonePe Payment Gateway Utility Functions
 * OAuth-based Authentication for Production
 * Official Documentation: https://developer.phonepe.com/
 */

export interface PhonePeConfig {
    clientId: string;
    clientSecret: string;
    clientVersion: string;
    oauthUrl: string;
    apiBaseUrl: string;
}

export interface OAuthTokenResponse {
    access_token: string;
    expires_at: number;
    token_type: string;
}

export interface PaymentPayload {
    merchantOrderId: string;
    merchantUserId: string;
    amount: number;
    redirectUrl: string;
    callbackUrl: string;
    message?: string;
}

// Cache for OAuth token
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get PhonePe configuration from environment variables
 */
export function getPhonePeConfig(): PhonePeConfig {
    const clientId = process.env.PHONEPE_CLIENT_ID || import.meta.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET || import.meta.env.PHONEPE_CLIENT_SECRET;
    const clientVersion = process.env.PHONEPE_CLIENT_VERSION || import.meta.env.PHONEPE_CLIENT_VERSION || '1';
    const oauthUrl = process.env.PHONEPE_OAUTH_URL || import.meta.env.PHONEPE_OAUTH_URL || 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';
    const apiBaseUrl = process.env.PHONEPE_API_BASE_URL || import.meta.env.PHONEPE_API_BASE_URL || 'https://api.phonepe.com/apis/pg';

    if (!clientId || !clientSecret) {
        throw new Error('PhonePe configuration missing: PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET required');
    }

    return {
        clientId,
        clientSecret,
        clientVersion,
        oauthUrl,
        apiBaseUrl,
    };
}

/**
 * Get OAuth Access Token from PhonePe
 */
export async function getAccessToken(config: PhonePeConfig): Promise<string> {
    // Check cached token
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
        return cachedToken.token;
    }

    const formData = new URLSearchParams();
    formData.append('client_id', config.clientId);
    formData.append('client_secret', config.clientSecret);
    formData.append('client_version', config.clientVersion);
    formData.append('grant_type', 'client_credentials');

    const response = await fetch(config.oauthUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OAuth failed: ${response.status} - ${errorText}`);
    }

    const data: OAuthTokenResponse = await response.json();
    
    if (!data.access_token) {
        throw new Error('No access_token in OAuth response');
    }

    // Cache token
    cachedToken = {
        token: data.access_token,
        expiresAt: data.expires_at * 1000,
    };

    return data.access_token;
}

/**
 * Generate unique merchant order ID
 */
export function generateMerchantOrderId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD${timestamp}${random}`;
}

/**
 * Create payment payload for PhonePe PG OAuth API
 * Official Docs: https://developer.phonepe.com/v1/reference/pay-api-1
 */
export function createPaymentPayload(params: PaymentPayload) {
    return {
        merchantOrderId: params.merchantOrderId,
        merchantUserId: params.merchantUserId,
        amount: params.amount,
        message: params.message || 'Payment for FILLS AI Services',
        redirectUrl: params.redirectUrl,
        callbackUrl: params.callbackUrl,
        expireAfter: 1200,
        paymentFlow: {
            type: 'PG_CHECKOUT',
        },
    };
}

/**
 * Validate amount
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
        'accept': 'application/json',
    };
}

/**
 * Clear cached token (useful for testing)
 */
export function clearTokenCache(): void {
    cachedToken = null;
}
