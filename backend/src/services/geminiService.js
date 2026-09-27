export async function generateFollowUpEmail({ contactName, company, notes, dealTitle, dealStage }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error('AI email generation is not configured. Add GEMINI_API_KEY to backend/.env.');
    error.status = 503;
    throw error;
  }

  const context = [
    `Contact: ${contactName}`,
    company && `Company: ${company}`,
    notes && `Contact notes: ${notes}`,
    `Deal: ${dealTitle}`,
    `Deal stage: ${dealStage}`
  ].filter(Boolean).join('\n');

  const prompt = `Write a concise, warm, professional follow-up email using only the context below. Include a subject line and greeting, keep it under 150 words, and do not invent facts or make promises.\n\n${context}`;
  let response;

  try {
    response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
  } catch {
    const error = new Error('Could not reach the AI service. Please try again.');
    error.status = 502;
    throw error;
  }

  if (!response.ok) {
    const error = new Error('The AI service could not generate an email. Check your Gemini API setup.');
    error.status = 502;
    throw error;
  }

  let result;
  try {
    result = await response.json();
  } catch {
    const error = new Error('The AI service returned an unreadable response. Please try again.');
    error.status = 502;
    throw error;
  }
  const text = result.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  if (!text) {
    const error = new Error('The AI service returned an empty email. Please try again.');
    error.status = 502;
    throw error;
  }

  return text;
}