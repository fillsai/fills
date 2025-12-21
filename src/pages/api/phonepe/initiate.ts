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

// Mark this endpoint as server-rendered
export const prerender = false;

/**
 * API Endpoint: POST /api/phonepe/initiate
 * Purpose: Initiate PhonePe payment and get checkout URL
 */
export const POST: APIRoute = async ({ request }) => {
    console.log('=== PhonePe Payment Initiation API Called ===');

    try {
        // Parse request body
        const body = await request.json();
        const { amount, redirectUrl } = body;

        console.log('Request received:', { amount, redirectUrl });

        // Validate amount
        if (!amount || !validateAmount(amount)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Invalid amount. Amount must be a positive number.',
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // Validate redirect URL
        if (!redirectUrl) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Redirect URL is required.',
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // Get PhonePe configuration from environment
        const config = getPhonePeConfig();

        // Step 1: Get OAuth Access Token
        const accessToken = await getAccessToken(config);

        // Generate unique merchant order ID
        const merchantOrderId = generateMerchantOrderId();

        // Convert amount to paise
        const amountInPaise = rupeesToPaise(amount);

        // Create payment payload
        const paymentPayload = createPaymentPayload({
            merchantOrderId,
            amount: amountInPaise,
            redirectUrl,
            message: `Payment for FILLS AI - Order ${merchantOrderId}`,
        });

        console.log('Payment payload:', JSON.stringify(paymentPayload, null, 2));

        // Step 2: Call PhonePe Create Payment API
        const headers = getPhonePeHeaders(accessToken);
        const apiUrl = `${config.apiBaseUrl}/checkout/v2/pay`;

        const phonePeResponse = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(paymentPayload),
        });

        const responseText = await phonePeResponse.text();
        console.log('PhonePe Create Payment response:', responseText);

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse PhonePe response:', e);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Invalid response from PhonePe',
                    rawResponse: responseText,
                }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // Check if payment initiation was successful
        if (!phonePeResponse.ok || responseData.errorCode) {
            console.error('PhonePe API Error:', responseData);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: responseData.message || responseData.error || 'Failed to initiate payment',
                    code: responseData.code || responseData.errorCode,
                    details: responseData,
                }),
                {
                    status: phonePeResponse.status || 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // Extract checkout URL from response
        const checkoutUrl =
            responseData.redirectUrl ||
            responseData.data?.instrumentResponse?.redirectInfo?.url ||
            responseData.data?.redirectUrl;

        if (!checkoutUrl) {
            console.error('No checkout URL in response:', responseData);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Checkout URL not found in PhonePe response',
                    details: responseData,
                }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // Return success response with checkout URL
        return new Response(
            JSON.stringify({
                success: true,
                checkoutUrl,
                merchantOrderId,
                phonePeOrderId: responseData.orderId,
                state: responseData.state,
                amount: amountInPaise,
                message: 'Payment initiated successfully',
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Payment initiation error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};