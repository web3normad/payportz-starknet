import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook signature
  const signature = req.headers['x-busha-signature'] as string;
  const webhookSecret = process.env.BUSHA_WEBHOOK_SECRET;
  
  if (webhookSecret) {
    const hash = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  const { event, data } = req.body;

  try {
    switch (event) {
      case 'transfer.funds_received':
        // User's deposit was received
        console.log('Funds received:', data);
        // TODO: Update user balance in your database
        // TODO: Send notification to user
        break;
        
      case 'transfer.funds_delivered':
        // Payout was delivered to user's bank
        console.log('Funds delivered:', data);
        // TODO: Update transaction status
        // TODO: Send confirmation to user
        break;
        
      case 'transfer.failed':
        // Transaction failed
        console.log('Transfer failed:', data);
        // TODO: Notify user of failure
        break;
        
      case 'transfer.cancelled':
        // Transfer was cancelled
        console.log('Transfer cancelled:', data);
        break;
        
      default:
        console.log('Unknown event:', event);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
}