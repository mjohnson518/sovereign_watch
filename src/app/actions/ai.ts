'use server';

/**
 * AI Analyst Server Actions
 * 
 * Uses Vercel AI SDK with Google Gemini for streaming responses.
 * Context is automatically injected from the latest database/API data.
 */

import { streamText, generateText } from 'ai';
import { google } from '@ai-sdk/google';

// Types for context injection
type ViewContext = 'composition' | 'historical' | 'supply' | 'demand' | 'sources';

interface AnalysisContext {
  view: ViewContext;
  totalDebt?: number;
  maturityData?: unknown;
  auctionData?: unknown;
  additionalContext?: string;
}

/**
 * Build the system prompt with injected context
 */
function buildSystemPrompt(context: AnalysisContext): string {
  let dataContext = '';
  
  switch (context.view) {
    case 'composition':
      dataContext = `
Current View: Debt Ownership Sankey Diagram
Key Data Points:
- Total US Debt: ${context.totalDebt ? `$${(context.totalDebt / 1e12).toFixed(2)}T` : '$36T'}
- Federal Reserve Holdings: $4.19T (down from $8T peak during QE)
- Foreign Investors: $9.1T (Japan $1.15T, China $730B - multi-decade low)
- Domestic Private: $17.5T (Hedge Funds, Money Markets, Banks)
- Stablecoin Issuers: ~$155B in direct T-Bill holdings (Tether, Circle)
- Intragovernmental: $7.2T (Social Security, Medicare Trust Funds)

Key Trends:
- Fed QT ongoing, reducing balance sheet
- China reducing holdings, Japan stable
- Domestic private sector absorbing most new issuance
- Stablecoins emerging as significant T-Bill buyers
`;
      break;
      
    case 'historical':
      dataContext = `
Current View: 50-Year Debt Composition History
Key Data Points:
- 1980: Total debt ~$0.9T, mostly domestic
- 2000: ~$5.6T, surplus era reduced domestic supply
- 2008: ~$10T, pre-GFC, Fed sold treasuries to buy MBS
- 2015: ~$18T, peak foreign % share
- 2020: ~$27T, COVID QE explosion
- 2025: ~$36T, Fed QT, domestic private explosion

Key Trends:
- Shift from intragovernmental to public market dependency
- Foreign share peaked around 2015, now declining as % of total
- Fed balance sheet expanded dramatically 2008-2022, now contracting
- Domestic private sector now dominant marginal buyer
`;
      break;
      
    case 'supply':
      dataContext = `
Current View: Maturity Wall (Supply Side)
${context.maturityData ? `Data: ${JSON.stringify(context.maturityData)}` : 'Showing next 10 years of maturing securities'}

Key Concepts:
- "Maturity Wall" = amount of debt that needs to be refinanced each year
- Bills: <1 year maturity, lowest risk but constant rollover
- Notes: 2-10 year maturity, bulk of marketable debt
- Bonds: 10-30 year maturity, longer duration risk

Key Risks:
- Higher rates at refinancing = higher interest expense
- Concentration in near-term maturities increases rollover risk
- Treasury shifting issuance mix (more bills vs notes debate)
`;
      break;
      
    case 'demand':
      dataContext = `
Current View: Auction Demand (Bid-to-Cover Ratios)
${context.auctionData ? `Recent Data: ${JSON.stringify(context.auctionData)}` : 'Showing historical auction results'}

Bid-to-Cover Ratio Guide:
- 3.0+: Strong demand (3 dollars bid for every 1 offered)
- 2.5-3.0: Healthy demand
- 2.0-2.5: Adequate but watch closely
- <2.0: Weak demand, concerning

Key Metrics:
- Primary Dealers must bid (backstop)
- Direct bidders = domestic institutions
- Indirect bidders = often foreign central banks
- Tail = difference between high yield and when-issued
`;
      break;
      
    default:
      dataContext = 'General sovereign debt analysis context.';
  }
  
  return `You are an expert Macro Strategist specializing in US Sovereign Debt analysis for institutional investors.

CONTEXT:
${dataContext}
${context.additionalContext || ''}

GUIDELINES:
1. Provide concise, professional financial analysis
2. Focus on: liquidity risks, refinancing challenges, demand trends, yield implications
3. Mention stablecoins/crypto-native demand when relevant to the discussion
4. Use specific numbers from the context when available
5. Keep responses under 200 words unless asked for detailed analysis
6. Use markdown formatting for clarity (bold key terms, bullet points)
7. Be direct and actionable - what should investors watch for?

TONE: Professional, informed, slightly cautious about risks.`;
}

/**
 * Generate AI analysis (non-streaming for simplicity)
 */
export async function analyzeData(
  userMessage: string,
  context: AnalysisContext
): Promise<{ text: string; error?: string }> {
  try {
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      system: buildSystemPrompt(context),
      prompt: userMessage,
    });
    
    return { text };
  } catch (error) {
    console.error('[AI Action] Error:', error);
    return { 
      text: '', 
      error: 'Failed to generate analysis. Please check your API key configuration.' 
    };
  }
}

/**
 * Get quick analysis (for tooltips, summaries)
 */
export async function getQuickAnalysis(
  topic: string,
  context: AnalysisContext
): Promise<string> {
  try {
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      system: buildSystemPrompt(context),
      prompt: `Provide a 2-3 sentence analysis of: ${topic}`,
    });
    
    return text;
  } catch (error) {
    console.error('[AI Quick Analysis] Error:', error);
    return 'Unable to generate analysis at this time.';
  }
}

/**
 * Generate risk assessment for current market conditions
 */
export async function generateRiskAssessment(
  context: AnalysisContext
): Promise<{ text: string; error?: string }> {
  try {
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      system: buildSystemPrompt(context),
      prompt: `Based on the current data, provide a structured risk assessment:
1. Liquidity Risk (1-10 scale with explanation)
2. Refinancing Risk (1-10 scale with explanation)  
3. Demand Risk (1-10 scale with explanation)
4. Key Watch Items (3-5 bullet points)
5. Overall Assessment (1 paragraph)`,
    });
    
    return { text };
  } catch (error) {
    console.error('[AI Risk Assessment] Error:', error);
    return { text: '', error: 'Failed to generate risk assessment.' };
  }
}

