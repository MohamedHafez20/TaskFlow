const Groq = require('groq-sdk');
const asyncHandler = require('../middleware/asyncHandler');

// Configurable via env; sensible defaults derived from the Groq reference example.
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const TEMPERATURE = Number(process.env.GROQ_TEMPERATURE ?? 1);
// gpt-oss models spend tokens on internal reasoning, so `content` can come back
// empty if this is too low, but the free tier caps total tokens/minute at 8000,
// so keep prompt + this budget under that. Raise via env on a paid tier.
const MAX_TOKENS = Number(process.env.GROQ_MAX_TOKENS ?? 2048);
const TOP_P = Number(process.env.GROQ_TOP_P ?? 1);
const REASONING_EFFORT = process.env.GROQ_REASONING_EFFORT || 'low';

// Instantiate lazily so a missing key doesn't crash the server on boot.
let client;
const getClient = () => {
  if (!client) {
    client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
      timeout: 30 * 1000, // 30s request timeout
      maxRetries: 2,
    });
  }
  return client;
};

exports.handleChat = asyncHandler(async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: 'Messages are required.' });
  }

  if (!process.env.GROQ_API_KEY) {
    console.error('Chat error: GROQ_API_KEY is not configured.');
    return res.status(500).json({ message: 'Chat service is not configured.' });
  }

  try {
    const completion = await getClient().chat.completions.create({
      model: MODEL,
      messages: messages.map((message) => ({
        role: message.role || 'user',
        content: message.content,
      })),
      temperature: TEMPERATURE,
      max_completion_tokens: MAX_TOKENS,
      top_p: TOP_P,
      reasoning_effort: REASONING_EFFORT,
      stream: false,
      stop: null,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || '';
    if (!reply) {
      return res.status(502).json({ message: 'The assistant returned an empty response. Please try again.' });
    }

    // Keep the existing response shape so the frontend needs no changes.
    return res.json({ output: [{ content: reply }] });
  } catch (err) {
    // Log server-side only; never expose the key or raw provider internals.
    const status = Number(err?.status) || 500;
    console.error('Groq chat error:', status, err?.error?.error?.message || err?.message);

    const userMessage =
      status === 401 ? 'Chat service authentication failed.'
        : status === 429 ? 'The assistant is busy right now. Please try again in a moment.'
          : status === 400 ? 'The request to the assistant was invalid.'
            : 'The assistant is temporarily unavailable. Please try again.';

    const safeStatus = status >= 400 && status < 600 ? status : 502;
    return res.status(safeStatus).json({ message: userMessage });
  }
});
