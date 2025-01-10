import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const SYSTEM_PROMPT = `
You are EventTix's AI assistant powered by advanced event search capabilities. Your role is to:
1. Extract search parameters that match our API structure:
   - query: General search terms (event name, description, headliners, venue names, cities, states, countries)
   - eventType: Type of event (concert, sports, theater)
   - city: Venue city
   - country: Venue country
   - eventDate: Event start date
2. Format responses as structured search commands:
   SEARCH_PARAMS: {
     "query": "main search terms",
     "city": "city name",
     "country": "country name",
     "eventType": "event category",
     "eventDate": "date"
   }

Examples:
User: "Rock concerts in Chicago this weekend"
Assistant: SEARCH_PARAMS: {"query": "Rock", "city": "Chicago", "eventDate": "2024-03-16"}

User: "Taylor Swift shows in Vegas"
Assistant: SEARCH_PARAMS: {"query": "Taylor Swift", "city": "Las Vegas"}
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