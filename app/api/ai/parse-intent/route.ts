import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { text } = body;
  if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 });

  const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (OPENAI_KEY) {
    try {
      const prompt = `Parse the following payment intent into JSON with keys: amount, currency (format chain:token like 'starknet:usdc'), recipient (address or username), chain. Input: ${text}`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: 'You parse payment intents.' }, { role: 'user', content: prompt }],
          max_tokens: 300,
        }),
      });

      const data = await res.json();
      const textOut = data?.choices?.[0]?.message?.content || '';

      // Try parse JSON
      let parsed = {};
      try {
        const jsonStr = textOut.match(/\{[\s\S]*\}/)?.[0];
        if (jsonStr) parsed = JSON.parse(jsonStr);
      } catch (e) {
        // ignore
      }

      // If nothing parsed, fallback to heuristic regex
      if (!Object.keys(parsed).length) {
        const amountMatch = text.match(/\$?([0-9,\.]+)\s*(usdc|usdt|cngn|usd|eth)?/i);
        const addrMatch = text.match(/0x[a-fA-F0-9]{40}/);
        parsed = {
          amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : undefined,
          currency: text.toLowerCase().includes('starknet') ? 'starknet:usdc' : (amountMatch && amountMatch[2] ? `base:${amountMatch[2].toLowerCase()}` : 'base:usdc'),
          recipient: addrMatch ? addrMatch[0] : undefined,
          chain: text.toLowerCase().includes('starknet') ? 'starknet' : undefined,
        };
      }

      return NextResponse.json({ ok: true, parsed });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'AI parse error' }, { status: 500 });
    }
  }

  // Fallback heuristic parse
  const amountMatch = text.match(/\$?([0-9,\.]+)\s*(usdc|usdt|cngn|usd|eth)?/i);
  const addrMatch = text.match(/0x[a-fA-F0-9]{40}/);
  const parsed = {
    amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : undefined,
    currency: text.toLowerCase().includes('starknet') ? 'starknet:usdc' : (amountMatch && amountMatch[2] ? `base:${amountMatch[2].toLowerCase()}` : 'base:usdc'),
    recipient: addrMatch ? addrMatch[0] : undefined,
    chain: text.toLowerCase().includes('starknet') ? 'starknet' : undefined,
  };

  return NextResponse.json({ ok: true, parsed });
}
