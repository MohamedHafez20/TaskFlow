const asyncHandler = require('../middleware/asyncHandler');

exports.handleChat = asyncHandler(async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: 'Messages are required.' });
  }

  const payload = {
    model: 'grok-4.3',
    input: messages.map((message) => ({
      role: message.role || 'user',
      content: message.content,
    })),
  };

  const apiRes = await fetch('https://api.x.ai/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.XAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!apiRes.ok) {
    const errorBody = await apiRes.text();
    return res.status(apiRes.status).json({ message: errorBody || 'XAI request failed.' });
  }

  const data = await apiRes.json();
  return res.json(data);
});
