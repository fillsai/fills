import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * API Endpoint: POST /api/phonepe/webhook
 * Purpose: Receive real-time payment status updates from PhonePe
 * Events: checkout.order.completed, checkout.order.failed
 */
export const POST: APIRoute = async ({ request }) => {
    const timestamp = new Date().toISOString();
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔔 PhonePe Webhook Received at ${timestamp}`);
    console.log('='.repeat(70));

    try {
        // Log request headers for debugging
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
            headers[key] = value;
        });
        console.log('📋 Request Headers:', JSON.stringify(headers, null, 2));

        // Parse webhook payload
        const payload = await request.json();
        console.log('📦 Webhook Payload:', JSON.stringify(payload, null, 2));

        // Verify basic authentication
        const authHeader = request.headers.get('authorization');
        const webhookUsername = import.meta.env.PHONEPE_WEBHOOK_USERNAME;
        const webhookPassword = import.meta.env.PHONEPE_WEBHOOK_PASSWORD;

        if (!webhookUsername || !webhookPassword) {
            console.error('❌ Webhook credentials not configured in environment variables!');
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

        console.log('🔐 Auth Check:');
        console.log('  Received:', authHeader ? 'Present' : 'Missing');
        console.log('  Username:', webhookUsername);

        if (authHeader !== expectedAuth) {
            console.error('❌ Webhook authentication failed!');
            console.error('  Expected auth header (first 20 chars):', expectedAuth.substring(0, 20) + '...');
            console.error('  Received auth header (first 20 chars):', authHeader ? authHeader.substring(0, 20) + '...' : 'null');
            return new Response(
                JSON.stringify({ success: false, error: 'Unauthorized' }),
                { 
                    status: 401, 
                    headers: { 'Content-Type': 'application/json' } 
                }
            );
        }

        console.log('✅ Authentication successful!');

        // Extract event details
        const { event, data } = payload;
        
        // Handle both possible formats
        const orderId = data?.merchantOrderId || data?.orderId || data?.order_id || 'UNKNOWN';
        const transactionId = data?.transactionId || data?.transaction_id || data?.id || 'N/A';
        const amount = data?.amount ? (data.amount / 100).toFixed(2) : 'N/A';
        const status = data?.status || event;
        const paymentMethod = data?.paymentMethod || data?.payment_method || 'PhonePe';

        console.log('\n📊 Payment Details:');
        console.log(`  Event Type: ${event}`);
        console.log(`  Order ID: ${orderId}`);
        console.log(`  Transaction ID: ${transactionId}`);
        console.log(`  Amount: ₹${amount}`);
        console.log(`  Status: ${status}`);
        console.log(`  Payment Method: ${paymentMethod}`);

        // Handle different event types
        switch (event) {
            case 'checkout.order.completed':
            case 'PAYMENT_SUCCESS':
                console.log(`\n✅ PAYMENT SUCCESSFUL for order: ${orderId}`);
                console.log('   💾 TODO: Update database with success status');
                console.log('   📧 TODO: Send confirmation email to customer');
                console.log('   🎉 TODO: Trigger order fulfillment');
                console.log('   📱 TODO: Send SMS confirmation');
                
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
                console.log(`\n❌ PAYMENT FAILED for order: ${orderId}`);
                console.log('   💾 TODO: Update database with failed status');
                console.log('   📧 TODO: Send payment failure notification');
                console.log(`   Reason: ${data?.failureReason || data?.error || 'Unknown'}`);
                console.log(`   Error Code: ${data?.errorCode || data?.error_code || 'N/A'}`);
                
                // TODO: Add your failure handling logic
                // await updateOrderStatus(orderId, 'FAILED', transactionId);
                // await notifyCustomerOfFailure(data.customerEmail, orderId, data?.failureReason);
                
                break;

            case 'PAYMENT_PENDING':
                console.log(`\n⏳ PAYMENT PENDING for order: ${orderId}`);
                console.log('   💾 TODO: Update database with pending status');
                console.log('   ⏰ TODO: Set up status polling or timeout');
                
                // TODO: Add your pending handling logic
                // await updateOrderStatus(orderId, 'PENDING', transactionId);
                
                break;

            default:
                console.log(`\n⚠️  Unknown event type: ${event}`);
                console.log('   This might be a new event type from PhonePe');
                console.log('   Full payload:', JSON.stringify(payload, null, 2));
        }

        console.log('\n' + '='.repeat(70));
        console.log('✅ Webhook processed successfully');
        console.log('='.repeat(70) + '\n');

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
        console.error('\n❌ Webhook processing error:');
        console.error(error);
        console.log('='.repeat(70) + '\n');
        
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

