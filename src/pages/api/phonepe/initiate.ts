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
    console.log('\n=== PhonePe Payment Initiation ===');

    try {
        const body = await request.json();
        const { amount, redirectUrl } = body;

        console.log('Amount:', amount, 'Redirect:', redirectUrl);

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

        // Generate order ID
        const merchantOrderId = generateMerchantOrderId();
        console.log('Order ID:', merchantOrderId);

        // Convert to paise
        const amountInPaise = rupeesToPaise(amount);

        // Create payload
        const paymentPayload = createPaymentPayload({
            merchantOrderId,
            amount: amountInPaise,
            redirectUrl,
            message: `Payment for FILLS AI - Order ${merchantOrderId}`,
        });

        // Call PhonePe API
        const apiUrl = `${config.apiBaseUrl}/checkout/v2/pay`;
        console.log('API URL:', apiUrl);

        const headers = getPhonePeHeaders(accessToken);

        const phonePeResponse = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(paymentPayload),
        });

        const responseText = await phonePeResponse.text();
        console.log('Response Status:', phonePeResponse.status);
        console.log('Response:', responseText);

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.error('Parse error:', e);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Invalid response from PhonePe',
                    rawResponse: responseText,
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check success
        if (!phonePeResponse.ok || responseData.errorCode) {
            console.error('PhonePe error:', responseData);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: responseData.message || responseData.error || 'Payment initiation failed',
                    code: responseData.code || responseData.errorCode,
                    details: responseData,
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
            console.error('No checkout URL');
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'No checkout URL received',
                    details: responseData,
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log('✓ Payment initiated successfully');
        console.log('Checkout URL:', checkoutUrl);

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
        console.error('Error:', error);
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
