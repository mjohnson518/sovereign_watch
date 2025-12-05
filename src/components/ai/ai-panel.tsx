'use client';

/**
 * AI Analyst Panel Component
 * 
 * Slide-out panel for interacting with the Sovereign AI analyst.
 */

import { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { analyzeData } from '@/app/actions/ai';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentView: string;
  contextData?: unknown;
}

const QUICK_PROMPTS = [
  { label: 'Analyze View', prompt: 'Analyze the current data and highlight key insights' },
  { label: 'Identify Risks', prompt: 'What are the main risks based on this data?' },
  { label: 'Trends', prompt: 'Summarize the key trends visible in this data' },
];

export function AIPanel({ open, onOpenChange, currentView, contextData }: AIPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your AI Macro Strategist. Navigate to any chart (like Maturity or Demand) and ask me to analyze it!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (prompt?: string) => {
    const messageText = prompt || input.trim();
    if (!messageText || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add placeholder for AI response
    const aiMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: aiMessageId, role: 'assistant', content: 'Analyzing...' },
    ]);

    try {
      const result = await analyzeData(messageText, {
        view: currentView as 'composition' | 'historical' | 'supply' | 'demand' | 'sources',
        additionalContext: contextData ? JSON.stringify(contextData) : undefined,
      });

      // Update with response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId 
            ? { ...msg, content: result.error || result.text || 'No response generated.' } 
            : msg
        )
      );
    } catch (error) {
      console.error('AI Error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: 'Sorry, I encountered an error. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-96 flex flex-col p-0">
        <SheetHeader className="p-4 border-b bg-stone-50 dark:bg-zinc-900">
          <SheetTitle className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-purple-500" />
            Sovereign AI
          </SheetTitle>
          <SheetDescription>Macro Strategist Agent</SheetDescription>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'p-3 rounded-lg text-sm max-w-[90%] animate-in fade-in-0 slide-in-from-bottom-2',
                  message.role === 'user'
                    ? 'bg-stone-800 text-white ml-auto'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 mr-auto border border-stone-200 dark:border-zinc-700'
                )}
              >
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: formatMarkdown(message.content) 
                  }} 
                />
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.content === '' && (
              <div className="flex items-center gap-2 text-stone-500 dark:text-zinc-500 text-sm">
                <LoadingDots />
                Thinking...
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-stone-50 dark:bg-zinc-900">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this data..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={() => handleSubmit()} 
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Quick Prompts */}
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {QUICK_PROMPTS.map((qp) => (
              <Button
                key={qp.label}
                variant="outline"
                size="sm"
                onClick={() => handleSubmit(qp.prompt)}
                disabled={isLoading}
                className="text-xs whitespace-nowrap"
              >
                {qp.label}
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Simple markdown formatter
function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  );
}

