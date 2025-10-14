import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { source_currency, target_currency, source_amount, pay_in } = req.body;

  try {
    const response = await fetch('https://api.busha.co/v1/quotes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BUSHA_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_currency,
        target_currency,
        source_amount,
        pay_in
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Busha API Error:', errorData);
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Create quote error:', error);
    res.status(500).json({ error: 'Failed to create quote' });
  }
}
