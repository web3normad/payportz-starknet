import { NextResponse } from 'next/server';

type Body = {
  recipientAddress?: string;
  amount?: string | number;
  availableWallets?: any[];
};

export async function POST(req: Request) {
  const body: Body = await req.json().catch(() => ({}));

  const { recipientAddress, amount, availableWallets } = body;

  // Basic validation
  if (!recipientAddress) {
    return NextResponse.json({ error: 'recipientAddress required' }, { status: 400 });
  }

  // If OpenAI key is present, call OpenAI for analysis
  const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (OPENAI_KEY) {
    try {
      const prompt = `Analyze recipient ${recipientAddress} for best chain to send ${amount}. Available wallets: ${JSON.stringify(availableWallets || [])}. Prefer Starknet. Provide top 3 recommendations with feeUSD, estTimeSec, riskScore (0-100), reason.`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: 'You are a payments assistant.' }, { role: 'user', content: prompt }],
          max_tokens: 600,
        }),
      });

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || '';

      // Try to parse JSON from AI or fallback to text
      let recommendations = [];
      try {
        const maybeJson = text.match(/\{[\s\S]*\}/);
        if (maybeJson) {
          const parsed = JSON.parse(maybeJson[0]);
          recommendations = parsed.recommendations || [];
        }
      } catch (e) {
        // ignore
      }

      // If recommendations empty, return simple mock
      if (!recommendations.length) {
        recommendations = [
          { chain: 'starknet', currency: 'starknet:usdc', feeUSD: 0.12, estTimeSec: 30, riskScore: 95, reason: 'Low fee, instant settlement, preferred.' },
          { chain: 'base', currency: 'base:usdc', feeUSD: 0.45, estTimeSec: 60, riskScore: 90, reason: 'Low fee and widely supported.' },
        ];
      }

      return NextResponse.json({ ok: true, recommendations });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'AI error' }, { status: 500 });
    }
  }

  // Fallback heuristics/mock when AI key not present
  const recommendations = [
    { chain: 'starknet', currency: 'starknet:usdc', feeUSD: 0.12, estTimeSec: 30, riskScore: 95, reason: 'Prefer Starknet: low fees & instant.' },
    { chain: 'base', currency: 'base:usdc', feeUSD: 0.5, estTimeSec: 60, riskScore: 90, reason: 'Base is widely supported.' },
    { chain: 'solana', currency: 'solana:usdc', feeUSD: 0.8, estTimeSec: 45, riskScore: 85, reason: 'Fast on Solana, but recipient must support Solana.' },
  ];

  return NextResponse.json({ ok: true, recommendations });
}
