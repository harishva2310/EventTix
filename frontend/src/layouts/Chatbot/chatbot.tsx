import { useEffect, useState } from 'react';
import { MessageSquare, X, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventResponse } from '@/layouts/SearchEvents/components/EventSearchModel';
import { useNavigate } from 'react-router-dom';
import { getChatResponse } from '@/service/GeminiService';
declare global {
    interface Window {
        webkitSpeechRecognition: any;
    }
}

interface ChatMessage {
    text: string;
    isUser: boolean;
    events?: EventResponse[];
}

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            text: "Hi! I'm your EventTix assistant. I can help you find events, concerts, and shows. Try asking me something like 'Find rock concerts' or 'shows in New York'!",
            isUser: false
        }
    ]);
    const [inputText, setInputText] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel(); // Stop any ongoing speech
            }
        };
    }, []);

    const startListening = () => {
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
    
        recognition.onstart = () => {
            console.log('Voice recognition started');
            setIsListening(true);
        };
    
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            console.log('Voice recognition result received', event.results);
            const transcript = event.results[0][0].transcript;
            console.log('Transcript:', transcript);
            setInputText(transcript);
            processVoiceInput(transcript);
            recognition.stop(); // Stop listening after getting result
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.log('Voice recognition error:', event.error);
            setIsListening(false);
            recognition.stop();
        };
    
        recognition.onend = () => {
            console.log('Voice recognition ended');
            setIsListening(false);
        };
    
        try {
            recognition.start();
            console.log('Recognition started successfully');
        } catch (error) {
            console.log('Error starting recognition:', error);
            setIsListening(false);
            recognition.stop();
        }
    };

    const speakResponse = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        // Optional customization
        utterance.rate = 1.4;  // Speed of speech
        utterance.pitch = 1.0; // Pitch of voice
        utterance.volume = 1.0; // Volume
        utterance.lang = 'en-US'; // Language
        window.speechSynthesis.speak(utterance);
    };


    const processVoiceInput = async (transcript: string) => {
        if (!transcript.trim()) return;

        setMessages(prev => [...prev, { text: transcript, isUser: true }]);

        try {
            const searchPrompt = `
            OBJECTIVE: Convert user query "${transcript}" into search parameters matching our API structure.

            AVAILABLE SEARCH FIELDS:
            - query: Main search across event names, descriptions, artists, venue names, cities, states, countries, and event types.
            - eventType: For now, default to Concert
            - city: Venue city
            - country: Venue country
            - eventDate: Event timing

            RESPONSE FORMAT:
            SEARCH_PARAMS: {
                "query": "primary search terms as specified in the query above",
                "city": "city if mentioned",
                "country": "country if mentioned (example: United States, United Kingdom)",
                "eventType": "event type if specified",
                "eventDate": "date if mentioned"
            }

            Example: Find me concerts in New York
            RESPONSE: SEARCH_PARAMS: {"query": "New York", "eventType": "Concert"}

            Example: Find me Metallica concerts
            RESPONSE: SEARCH_PARAMS: {"query": "Metallica", "eventType": "Concert"}

            Example: Find me Metallica concerts in New Jersey
            RESPONSE: SEARCH_PARAMS: {"query": "Metallica New Jersey", "eventType": "Concert"}

            PRIORITIZE:
            1. Artist/performer names in query field
            2. Specific locations in city/country fields
            3. Clear event types
            4. Date specifications
        `;

            const searchResponse = await getChatResponse(searchPrompt);
            console.log("Gemini Response:", searchResponse);

            const paramsMatch = searchResponse.match(/SEARCH_PARAMS:\s*({[\s\S]*?})/);
            if (!paramsMatch) {
                throw new Error('Invalid search parameters format');
            }

            const searchParams = JSON.parse(paramsMatch[1]);
            console.log("Extracted Search Params:", searchParams);

            const queryParams = new URLSearchParams();
            if (searchParams.query) queryParams.append('query', searchParams.query);
            //if (searchParams.eventType) queryParams.append('eventType', searchParams.eventType);
            if (searchParams.city) queryParams.append('city', searchParams.city);
            if (searchParams.country) queryParams.append('country', searchParams.country);
            if (searchParams.eventDate) queryParams.append('eventDate', searchParams.eventDate);
            queryParams.append('page', '0');
            queryParams.append('size', '100');

            const events = await searchEvents(queryParams.toString());

            const analysisPrompt = `
            CONTEXT:
            User Query: "${transcript}"
            Search Results: ${JSON.stringify(events)}

            ANALYSIS GUIDELINES:
            1. Match relevance based on:
               - Event name matches
               - Venue location accuracy
               - Date/time relevance
               - Artist/performer matches
            2. Highlight key details:
               - Event names
               - Venues
               - Dates
               - Featured performers

            FORMAT:
            - Start with result quantity and relevance
            - Highlight best matches first
            - Include DISPLAY_EVENTS if results found
            - Suggest refined search parameters if results are not ideal
            - Do not include SEARCH_PARAMS in the response
            - Have a human-like response
            - Summarise results in a natural human-like way
        `;

            const analysisResponse = await getChatResponse(analysisPrompt);
            const shouldDisplayEvents = analysisResponse.includes('DISPLAY_EVENTS');
            const responseText = analysisResponse.replace('DISPLAY_EVENTS', '').replace(/\*/g, '').trim();
            console.log("responseText:", analysisResponse);

            setMessages(prev => [...prev, {
                text: responseText,
                isUser: false,
                events: shouldDisplayEvents ? events : undefined
            }]);

            speakResponse(responseText);

        } catch (error) {
            console.error("Search error:", error);
            setMessages(prev => [...prev, {
                text: "Let's try a different way to search for those events.",
                isUser: false
            }]);
        }

        setInputText('');

        
    };


    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        setMessages(prev => [...prev, { text: inputText, isUser: true }]);

        try {
            const searchPrompt = `
                OBJECTIVE: Convert user query "${inputText}" into search parameters matching our API structure.

                AVAILABLE SEARCH FIELDS:
                - query: Main search across event names, descriptions, artists, venue names, cities, states, countries, and event types.
                - eventType: For now, default to Concert
                - city: Venue city
                - country: Venue country
                - eventDate: Event timing

                RESPONSE FORMAT:
                SEARCH_PARAMS: {
                    "query": "primary search terms as specified in the query above",
                    "city": "city if mentioned",
                    "country": "country if mentioned (example: United States, United Kingdom)",
                    "eventType": "event type if specified",
                    "eventDate": "date if mentioned"
                }

                Example: Find me concerts in New York
                RESPONSE: SEARCH_PARAMS: {"query": "New York", "eventType": "Concert"}

                Example: Find me Metallica concerts
                RESPONSE: SEARCH_PARAMS: {"query": "Metallica", "eventType": "Concert"}

                Example: Find me Metallica concerts in New Jersey
                RESPONSE: SEARCH_PARAMS: {"query": "Metallica New Jersey", "eventType": "Concert"}

                PRIORITIZE:
                1. Artist/performer names in query field
                2. Specific locations in city/country fields
                3. Clear event types
                4. Date specifications
            `;

            const searchResponse = await getChatResponse(searchPrompt);
            console.log("Gemini Response:", searchResponse);

            const paramsMatch = searchResponse.match(/SEARCH_PARAMS:\s*({[\s\S]*?})/);
            if (!paramsMatch) {
                throw new Error('Invalid search parameters format');
            }

            const searchParams = JSON.parse(paramsMatch[1]);
            console.log("Extracted Search Params:", searchParams);

            const queryParams = new URLSearchParams();
            if (searchParams.query) queryParams.append('query', searchParams.query);
            //if (searchParams.eventType) queryParams.append('eventType', searchParams.eventType);
            if (searchParams.city) queryParams.append('city', searchParams.city);
            if (searchParams.country) queryParams.append('country', searchParams.country);
            if (searchParams.eventDate) queryParams.append('eventDate', searchParams.eventDate);
            queryParams.append('page', '0');
            queryParams.append('size', '100');

            const events = await searchEvents(queryParams.toString());

            const analysisPrompt = `
                CONTEXT:
                User Query: "${inputText}"
                Search Results: ${JSON.stringify(events)}

                ANALYSIS GUIDELINES:
                1. Match relevance based on:
                   - Event name matches
                   - Venue location accuracy
                   - Date/time relevance
                   - Artist/performer matches
                2. Highlight key details:
                   - Event names
                   - Venues
                   - Dates
                   - Featured performers

                FORMAT:
                - Start with result quantity and relevance
                - Highlight best matches first
                - Include DISPLAY_EVENTS if results found
                - Suggest refined search parameters if results are not ideal
                - Do not include SEARCH_PARAMS in the response
                - Have a human-like response
                - Summarise results in a natural human-like way and do not include supporting text like "These results provide a good overview of Helmet's upcoming concert appearances, including both headline and supporting act roles, across various locations and dates. No further search refinements are needed based on your initial query." in the response
            `;

            const analysisResponse = await getChatResponse(analysisPrompt);
            const shouldDisplayEvents = analysisResponse.includes('DISPLAY_EVENTS');
            const responseText = analysisResponse.replace('DISPLAY_EVENTS', '').replace(/\*/g, '').trim();
            console.log("responseText:", analysisResponse);

            setMessages(prev => [...prev, {
                text: responseText,
                isUser: false,
                events: shouldDisplayEvents ? events : undefined
            }]);

            speakResponse(responseText);

        } catch (error) {
            console.error("Search error:", error);
            setMessages(prev => [...prev, {
                text: "Let's try a different way to search for those events.",
                isUser: false
            }]);
        }

        setInputText('');
    };

    const searchEvents = async (queryString: string) => {
        const response = await fetch(`/api/EventSearch/v4/search?${queryString}`);
        const data = await response.json();
        return data.content;
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const renderEventCard = (event: EventResponse) => (
        <div
            key={event.event.event_id}
            className="p-2 border rounded mb-2 cursor-pointer hover:bg-accent"
            onClick={() => navigate(`/event-details/${event.event.event_id}`)}
        >
            <h4 className="font-semibold">{event.event.event_name}</h4>
            <p className="text-sm">{event.venue.venue_name}</p>
            <p className="text-sm">{new Date(event.event.event_start_time).toLocaleDateString()}</p>
        </div>
    );

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isOpen ? (
                <div className="bg-background border rounded-lg shadow-lg w-[calc(90vw-2rem)] md:w-96 h-[80vh] md:h-[32rem] mx-4 md:mx-0">
                    <div className="flex justify-between items-center p-3 border-b">
                        <h3 className="font-semibold">Chat Assistant</h3>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="p-4 h-[calc(100%-4rem)] flex flex-col">
                        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                            {messages.map((message, index) => (
                                <div key={index} className={`${message.isUser ? 'text-right' : 'text-left'}`}>
                                    <div className={`inline-block p-2 rounded-lg ${message.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        {message.text}
                                    </div>
                                    {message.events && (
                                        <div className="mt-2">
                                            {message.events.map(event => renderEventCard(event))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1 rounded-md border p-2 min-w-0"
                                placeholder="Type your message..."
                            />
                            <div className="flex gap-2 justify-end">
                                <Button
                                    onClick={() => startListening()}
                                    variant="ghost"
                                    size="icon"
                                    className={`${isListening ? 'text-red-500' : ''} shrink-0`}
                                >
                                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                </Button>
                                <Button onClick={handleSendMessage} className="shrink-0">Send</Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="rounded-full h-12 w-12 flex items-center justify-center"
                >
                    <MessageSquare className="h-6 w-6" />
                </Button>
            )}
        </div>
    );
};

export default ChatBot;
