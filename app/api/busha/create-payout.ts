import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { source_currency, target_currency, target_amount, pay_out } = req.body;

  try {
    // Step 1: Create Quote for payout
    const quoteResponse = await fetch('https://api.busha.co/v1/quotes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BUSHA_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_currency,
        target_currency,
        target_amount,
        pay_out
      })
    });

    if (!quoteResponse.ok) {
      const errorData = await quoteResponse.json();
      console.error('Busha Quote Error:', errorData);
      return res.status(quoteResponse.status).json(errorData);
    }

    const quoteData = await quoteResponse.json();
    const quoteId = quoteData.data.id;

    // Step 2: Create Transfer
    const transferResponse = await fetch('https://api.busha.co/v1/transfers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BUSHA_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quote_id: quoteId
      })
    });

    if (!transferResponse.ok) {
      const errorData = await transferResponse.json();
      console.error('Busha Transfer Error:', errorData);
      return res.status(transferResponse.status).json(errorData);
    }

    const transferData = await transferResponse.json();
    res.status(200).json(transferData);
  } catch (error) {
    console.error('Create payout error:', error);
    res.status(500).json({ error: 'Failed to create payout' });
  }
}
