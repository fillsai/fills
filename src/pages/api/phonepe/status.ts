import type { APIRoute } from 'astro';
import { getPhonePeConfig, getAccessToken, getPhonePeHeaders } from '../../../lib/phonepe-utils';
import { getPhonePeConfig, generateJWT } from '../../../lib/phonepe-utils';

// Mark this endpoint as server-rendered
export const prerender = false;

/**
 * API Endpoint: GET /api/phonepe/status?orderId=ORDER_123
 * Purpose: Check payment status from PhonePe
 */
export const GET: APIRoute = async ({ url }) => {
    console.log('=== PhonePe Payment Status Check API Called ===');

    
    try {
        const orderId = url.searchParams.get('orderId');

        if (!orderId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Order ID is required',
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        console.log('Checking status for Order ID:', orderId);

        // Get PhonePe configuration
        const config = getPhonePeConfig();

        // Get OAuth Access Token
        const accessToken = await getAccessToken(config);

        // Get headers with OAuth Bearer token
        const headers = getPhonePeHeaders(accessToken);

        // PhonePe order status API endpoint
        const apiUrl = `${config.apiBaseUrl}/checkout/v2/order/${orderId}/status`;
        console.log('Calling PhonePe Status API:', apiUrl);

        // Call PhonePe status check API
        const phonePeResponse = await fetch(apiUrl, {
            method: 'GET',
            headers,
        });

        const responseText = await phonePeResponse.text();
        console.log('PhonePe status raw response:', responseText);

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse PhonePe status response:', e);
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

        console.log('PhonePe status parsed response:', JSON.stringify(responseData, null, 2));
        // Get PhonePe configuration
        const config = getPhonePeConfig();

        // Get OAuth Access Token
        const accessToken = await getAccessToken(config);

        // Get headers with OAuth Bearer token
        const headers = getPhonePeHeaders(accessToken);

        // PhonePe order status API endpoint
        const apiUrl = `${config.apiBaseUrl}/checkout/v2/order/${orderId}/status`;
        console.log('Calling PhonePe Status API:', apiUrl);

        // Call PhonePe status check API
        const phonePeResponse = await fetch(apiUrl, {
            method: 'GET',
            headers,
        });

        const responseText = await phonePeResponse.text();
        console.log('PhonePe status raw response:', responseText);

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse PhonePe status response:', e);
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

        console.log('PhonePe status parsed response:', JSON.stringify(responseData, null, 2));
        // Return success response with status data
        return new Response(
            JSON.stringify({
                success: true,
                data: responseData,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Payment status check error:', error);
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
