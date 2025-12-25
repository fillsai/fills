import type { APIRoute } from 'astro';
import { getPhonePeConfig, getAccessToken, getPhonePeHeaders } from '../../../lib/phonepe-utils';

export const prerender = false;

/**
 * API Endpoint: GET /api/phonepe/status?orderId=xxx
 * Purpose: Check PhonePe payment status (OAuth-based authentication)
 */
export const GET: APIRoute = async ({ url }) => {
    try {
        const orderId = url.searchParams.get('orderId');

        if (!orderId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Order ID required',
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get config
        const config = getPhonePeConfig();

        // Get OAuth token
        const accessToken = await getAccessToken(config);

        // Call status API
        const apiUrl = `${config.apiBaseUrl}/checkout/v2/order/${orderId}/status`;
        const headers = getPhonePeHeaders(accessToken);

        const phonePeResponse = await fetch(apiUrl, {
            method: 'GET',
            headers,
        });

        const responseText = await phonePeResponse.text();

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Invalid response from PhonePe',
                    rawResponse: responseText,
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                data: responseData,
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
