import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * API Endpoint: POST /api/phonepe/webhook
 * Purpose: Receive real-time payment status updates from PhonePe
 * Events: checkout.order.completed, checkout.order.failed
 */
export const POST: APIRoute = async ({ request }) => {
    const timestamp = new Date().toISOString();

    try {
        // Parse webhook payload
        const payload = await request.json();

        // Verify basic authentication
        const authHeader = request.headers.get('authorization');
        const webhookUsername = import.meta.env.PHONEPE_WEBHOOK_USERNAME;
        const webhookPassword = import.meta.env.PHONEPE_WEBHOOK_PASSWORD;

        if (!webhookUsername || !webhookPassword) {
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    error: 'Webhook credentials not configured' 
                }),
                { 
                    status: 500, 
                    headers: { 'Content-Type': 'application/json' } 
                }
            );
        }

        const expectedAuth = `Basic ${btoa(`${webhookUsername}:${webhookPassword}`)}`;

        if (authHeader !== expectedAuth) {
            return new Response(
                JSON.stringify({ success: false, error: 'Unauthorized' }),
                { 
                    status: 401, 
                    headers: { 'Content-Type': 'application/json' } 
                }
            );
        }

        // Extract event details
        const { event, data } = payload;
        
        // Handle both possible formats
        const orderId = data?.merchantOrderId || data?.orderId || data?.order_id || 'UNKNOWN';
        const transactionId = data?.transactionId || data?.transaction_id || data?.id || 'N/A';
        const amount = data?.amount ? (data.amount / 100).toFixed(2) : 'N/A';
        const status = data?.status || event;
        const paymentMethod = data?.paymentMethod || data?.payment_method || 'PhonePe';

        // Handle different event types
        switch (event) {
            case 'checkout.order.completed':
            case 'PAYMENT_SUCCESS':
                // TODO: Add your business logic here
                // Example implementations:
                // await updateOrderStatus(orderId, 'COMPLETED', transactionId);
                // await sendConfirmationEmail(data.customerEmail, orderId, amount);
                // await triggerOrderFulfillment(orderId);
                // await notifyCustomer(data.customerPhone, orderId);
                
                break;

            case 'checkout.order.failed':
            case 'PAYMENT_FAILED':
            case 'PAYMENT_DECLINED':
                // TODO: Add your failure handling logic
                // await updateOrderStatus(orderId, 'FAILED', transactionId);
                // await notifyCustomerOfFailure(data.customerEmail, orderId, data?.failureReason);
                
                break;

            case 'PAYMENT_PENDING':
                // TODO: Add your pending handling logic
                // await updateOrderStatus(orderId, 'PENDING', transactionId);
                
                break;

            default:
                // Unknown event type - log to your error monitoring service if needed
                break;
        }

        // Always return 200 OK to acknowledge receipt
        return new Response(
            JSON.stringify({ 
                success: true, 
                received: true,
                orderId: orderId,
                transactionId: transactionId,
                event: event,
                processedAt: timestamp
            }),
            { 
                status: 200, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: timestamp
            }),
            { 
                status: 500, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    }
};

/**
 * GET endpoint to verify webhook is accessible
 * Useful for testing and health checks
 */
export const GET: APIRoute = async () => {
    const webhookConfigured = !!(
        import.meta.env.PHONEPE_WEBHOOK_USERNAME && 
        import.meta.env.PHONEPE_WEBHOOK_PASSWORD
    );

    return new Response(
        JSON.stringify({
            message: 'PhonePe Webhook Endpoint',
            status: 'active',
            configured: webhookConfigured,
            events: [
                'checkout.order.completed',
                'checkout.order.failed'
            ],
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        }),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        }
    );
};

