import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventResponse } from '@/layouts/SearchEvents/components/EventSearchModel';
import { useNavigate } from 'react-router-dom';
import { getChatResponse } from '@/service/GeminiService';

interface ChatMessage {
    text: string;
    isUser: boolean;
    events?: EventResponse[];
}

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
          text: "Hi! I'm your EventTix assistant. I can help you find events, concerts, and shows. Try asking me something like 'Find rock concerts' or 'Shows in New York'!",
          isUser: false
        }
      ]);
    const [inputText, setInputText] = useState('');
    const navigate = useNavigate();

    const extractSearchQuery = (response: string): string => {
        const match = response.match(/SEARCH_EVENTS:\s*(.*)/);
        return match ? match[1].trim() : '';
    };

    const searchEvents = async (query: string) => {
        const response = await fetch(`/api/EventSearch/v4/search?query=${encodeURIComponent(query)}&page=0&size=100`);
        const data = await response.json();
        return data.content;
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;
      
        setMessages(prev => [...prev, { text: inputText, isUser: true }]);
        
        try {
          const searchPrompt = `
            User query: "${inputText}"
            You are a search assistant. Break down this query into a maximum of 5 specific search terms.
            Format each term on a new line starting with SEARCH_TERM:
            Examples:
            User: "Any rock shows in NYC or LA next month?"
            Response:
            SEARCH_TERM: New York
            SEARCH_TERM: Los Angeles
            

            User: "Any upcoming Metallica concerts?"
            Response:
            SEARCH_TERM: Metallica
          `;
          console.log("searchPrompt: "+searchPrompt);
          const searchTerms = await getChatResponse(searchPrompt);
          const terms = searchTerms.split('\n')
            .filter(line => line.startsWith('SEARCH_TERM:'))
            .map(line => line.replace('SEARCH_TERM:', '').trim());
      
          let allEvents: EventResponse[] = [];
          
          for (const term of terms) {
            const events = await searchEvents(term);
            allEvents = [...allEvents, ...events];
          }
      
          // Remove duplicates based on event_id
          const uniqueEvents = Array.from(
            new Map(allEvents.map(event => [event.event.event_id, event])).values()
          );
      
          const analysisPrompt = `
            User query: "${inputText}"
            Search results: ${JSON.stringify(uniqueEvents)}
            Analyze these results and provide a natural response. Include location matches, dates, and relevance.
            End with DISPLAY_EVENTS if results should be shown.
          `;
          console.log("Analysis Promopt: "+analysisPrompt);
      
          const analysisResponse = await getChatResponse(analysisPrompt);
          const shouldDisplayEvents = analysisResponse.includes('DISPLAY_EVENTS');
          const responseText = analysisResponse.replace('DISPLAY_EVENTS', '').trim();

          console.log("Response Text: "+responseText);
      
          setMessages(prev => [...prev, { 
            text: responseText, 
            isUser: false,
            events: shouldDisplayEvents ? uniqueEvents : undefined
          }]);
      
        } catch (error) {
          setMessages(prev => [...prev, { 
            text: "I'm having trouble processing your request. Please try again.", 
            isUser: false 
          }]);
        }
      
        setInputText('');
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
                <div className="bg-background border rounded-lg shadow-lg w-96 h-[32rem]">
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
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1 rounded-md border p-2"
                                placeholder="Type your message..."
                            />
                            <Button onClick={handleSendMessage}>Send</Button>
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
