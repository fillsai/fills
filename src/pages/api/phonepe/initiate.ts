import type { APIRoute } from 'astro';
import {
    getPhonePeConfig,
    getAccessToken,
    generateMerchantOrderId,
    createPaymentPayload,
    validateAmount,
    rupeesToPaise,
    getPhonePeHeaders,
} from '../../../lib/phonepe-utils';

export const prerender = false;

/**
 * API Endpoint: POST /api/phonepe/initiate
 * Purpose: Initiate PhonePe payment (OAuth-based authentication)
 */
export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { amount, redirectUrl } = body;

        // Validate amount
        if (!amount || !validateAmount(amount)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Invalid amount',
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!redirectUrl) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Redirect URL required',
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get config
        const config = getPhonePeConfig();

        // Get OAuth token
        const accessToken = await getAccessToken(config);

      
        const merchantOrderId = generateMerchantOrderId();

    
        const amountInPaise = rupeesToPaise(amount);

        const webhookUrl = process.env.PHONEPE_WEBHOOK_URL || import.meta.env.PHONEPE_WEBHOOK_URL || `${new URL(request.url).origin}/api/phonepe/webhook`;

        const paymentPayload = createPaymentPayload({
            merchantOrderId,
            merchantUserId: `USER_${Date.now()}`,
            amount: amountInPaise,
            redirectUrl,
            callbackUrl: webhookUrl, // Webhook URL for server-to-server notifications
            message: `Payment for FILLS AI - Order ${merchantOrderId}`,
        });

        // Call PhonePe API
        const apiUrl = `${config.apiBaseUrl}/checkout/v2/pay`;
        const headers = getPhonePeHeaders(accessToken);

        // Log request details for debugging (safe for production - no secrets)
        console.log('[PhonePe] Initiating payment:', {
            orderId: merchantOrderId,
            amount: amountInPaise,
            redirectUrl,
            callbackUrl: webhookUrl,
            apiUrl,
        });

        const phonePeResponse = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(paymentPayload),
        });

        const responseText = await phonePeResponse.text();

        // Log response status
        console.log('[PhonePe] Response:', {
            status: phonePeResponse.status,
            statusText: phonePeResponse.statusText,
        });

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Invalid response from PhonePe',
                    rawResponse: responseText,
                    statusCode: phonePeResponse.status,
                    requestUrl: apiUrl,
                    requestPayload: paymentPayload,
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check success
        if (!phonePeResponse.ok || responseData.errorCode) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: responseData.message || responseData.error || 'Payment initiation failed',
                    code: responseData.code || responseData.errorCode,
                    statusCode: phonePeResponse.status,
                    requestUrl: apiUrl,
                    requestPayload: paymentPayload,
                    phonePeResponse: responseData,
                }),
                { status: phonePeResponse.status || 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Extract checkout URL
        const checkoutUrl =
            responseData.redirectUrl ||
            responseData.data?.instrumentResponse?.redirectInfo?.url ||
            responseData.data?.redirectUrl;

        if (!checkoutUrl) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'No checkout URL received',
                    details: responseData,
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                checkoutUrl,
                merchantOrderId,
                phonePeOrderId: responseData.orderId,
                amount: amountInPaise,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
