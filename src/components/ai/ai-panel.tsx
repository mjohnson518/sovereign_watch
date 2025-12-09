'use client';

/**
 * AI Analyst Panel - Bloomberg Terminal 2.0
 *
 * Command-style AI chat interface with terminal aesthetics,
 * quick prompts, and context-aware analysis.
 */

import { useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AIPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentView: string;
  contextData?: unknown;
}

const QUICK_PROMPTS = [
  { label: 'ANALYZE', prompt: 'Analyze the current data and highlight key insights', icon: '📊' },
  { label: 'RISKS', prompt: 'What are the main risks based on this data?', icon: '⚠️' },
  { label: 'TRENDS', prompt: 'Summarize the key trends visible in this data', icon: '📈' },
  { label: 'COMPARE', prompt: 'How does current data compare to historical averages?', icon: '🔄' },
];

export function AIPanel({ open, onOpenChange, currentView, contextData }: AIPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, setInput, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
    body: {
      context: contextData ? JSON.stringify(contextData) : `Current View: ${currentView}`,
    },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: '**SOVEREIGN AI MACRO STRATEGIST INITIALIZED**\n\nI analyze Treasury debt data, auction metrics, and fiscal indicators. Navigate to any view and ask me to analyze it.\n\n**Capabilities:**\n- Real-time data analysis\n- Risk assessment\n- Trend identification\n- Historical comparisons',
      },
    ],
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCustomSubmit = async (prompt?: string) => {
    const messageText = prompt || input.trim();
    if (!messageText || isLoading) return;

    await append({ role: 'user', content: messageText });
    if (!prompt) setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomSubmit();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[420px] flex flex-col p-0 bg-card border-l border-border">
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <SparklesIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <SheetTitle className="text-sm font-semibold">SOVEREIGN AI</SheetTitle>
                <SheetDescription className="text-[10px] uppercase tracking-wider">
                  Macro Strategist Agent
                </SheetDescription>
              </div>
            </div>
            <Badge variant="success" className="text-[9px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 status-live" />
              ONLINE
            </Badge>
          </div>

          {/* Context indicator */}
          <div className="mt-3 flex items-center gap-2 text-[10px]">
            <span className="text-muted-foreground">CONTEXT:</span>
            <Badge variant="terminal" className="text-[9px]">
              {currentView.toUpperCase()} VIEW
            </Badge>
          </div>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'animate-fade-in',
                  message.role === 'user' ? 'flex justify-end' : ''
                )}
              >
                <div
                  className={cn(
                    'max-w-[90%] rounded text-xs',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground px-3 py-2'
                      : 'bg-muted/50 border border-border px-3 py-3'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                      <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center">
                        <SparklesIcon className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        AI Response
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "prose prose-xs max-w-none",
                      message.role === 'assistant'
                        ? "dark:prose-invert prose-p:text-muted-foreground prose-strong:text-foreground prose-headings:text-foreground"
                        : ""
                    )}
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdown(message.content)
                    }}
                  />
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded border border-border w-fit">
                <LoadingDots />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Processing query...
                </span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border bg-muted/20 p-4 space-y-3">
          {/* Quick Prompts */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.label}
                onClick={() => handleCustomSubmit(qp.prompt)}
                disabled={isLoading}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium rounded border transition-colors whitespace-nowrap",
                  "bg-card border-border text-muted-foreground",
                  "hover:border-primary/50 hover:text-foreground",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <span>{qp.icon}</span>
                <span>{qp.label}</span>
              </button>
            ))}
          </div>

          {/* Input Field */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about the data..."
                disabled={isLoading}
                className="bg-card border-border text-xs pr-8 font-mono placeholder:font-sans"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <span className="kbd text-[8px]">↵</span>
              </div>
            </div>
            <Button
              onClick={() => handleCustomSubmit()}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="shrink-0"
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[9px] text-muted-foreground/60">
            <span>Powered by Gemini Pro</span>
            <span className="flex items-center gap-1">
              <span className="kbd">ESC</span>
              <span>Close</span>
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Simple markdown formatter with better styling
function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">$1</code>')
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n- /g, '</p><p class="mt-1 pl-3 border-l-2 border-primary/30">')
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
      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  );
}
