import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const SYSTEM_PROMPT = `
You are a helpful assistant for an event booking platform. When users ask about events, concerts, or shows:
1. If they're searching for specific events, respond with "SEARCH_EVENTS: {search_terms}"
2. You can search by event name, artist name, venue name, venue city, venue state, or venue country.
3. Keep responses concise and focused on helping users find events
4. Do not include "concert", "show", or "events" in your search terms

Example:
User: "Find Metallica concerts"
Assistant: "SEARCH_EVENTS: Metallica"

User: "Shows in New York"
Assistant: "SEARCH_EVENTS: New York"
`;

export const getChatResponse = async (message: string) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }, {apiVersion: 'v1beta',});
    const chat = model.startChat({
      history: [{ role: 'user', parts: [{ text: SYSTEM_PROMPT }] }]
    });
    
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  };