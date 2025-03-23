const express = require("express");
const axios = require("axios");
const router = express.Router();
const userMiddleware = require("../middleware/user");
const FixedDeposit = require("../models/fixedDeposit");
const GoldInvestment = require("../models/gold");
const MutualFund = require("../models/mutualFunds");
const PPF = require("../models/ppf");
const Stock = require("../models/stocks");
// Define the OpenRouter API endpoint and headers
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.API_KEY; // Replace with environment variable in production
const MODEL = "meta-llama/llama-3.3-70b-instruct:free";

// Middleware to validate request body
const validateRequestBody = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ error: "Request body is required" });
  }
  next();
};

// Route for general investment advice (Case 1)
router.post(
  "/general-advice",
  validateRequestBody,
  userMiddleware,
  async (req, res, next) => {
    try {
      const {
        riskProfile = "moderate",
        investmentGoals = [],
        timeHorizon = "medium",
        age,
        monthlyIncome,
        existingInvestments = [],
      } = req.body;

      // Constructing the prompt for general investment advice
      const prompt = `
    I need comprehensive investment advice for a client with the following profile:
    - Risk profile: ${riskProfile} (conservative/moderate/aggressive)
    - Investment goals: ${investmentGoals.join(", ")}
    - Time horizon: ${timeHorizon} (short-term/medium/long-term)
    - Age: ${age || "Not specified"}
    - Monthly income: ${monthlyIncome || "Not specified"}
    - Existing investments: ${
      existingInvestments.length > 0 ? existingInvestments.join(", ") : "None"
    }

    Based on current market conditions as of March 2025 and historical performance, provide detailed investment recommendations across these categories:
    1. Stocks: Recommend allocation percentage, sectors to focus on, and investment strategy
    2. Mutual Funds: Types of funds (equity, debt, hybrid), recommended allocation
    3. SIPs: Whether advisable, recommended monthly amount, and fund types
    4. Fixed Deposits: Recommended allocation, current interest rates, and tenure
    5. Gold investments: Physical gold vs Gold ETFs vs Sovereign Gold Bonds, allocation advice
    6. PPF and tax-saving instruments: Allocation and tax benefits
    
    For each recommendation:
    - Include current performance metrics and expected returns
    - Explain rationale based on market trends
    - Highlight associated risks
    - Provide tax implications and strategies to optimize tax
    
    Structure your response in a detailed JSON format that separates recommendations by asset class, includes percentage allocations, expected returns, risk levels, and tax considerations.`;

      const response = await axios.post(
        OPENROUTER_URL,
        {
          model: MODEL,
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Extract and parse the response
      const llmResponse = response.data.choices[0].message.content;

      // Find JSON content within the response
      let jsonData;
      try {
        // This regex attempts to extract JSON content from the response
        const jsonMatch =
          llmResponse.match(/```json([\s\S]*?)```/) ||
          llmResponse.match(/{[\s\S]*}/) ||
          llmResponse.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
          const jsonString = jsonMatch[0].startsWith("```json")
            ? jsonMatch[1]
            : jsonMatch[0];
          jsonData = JSON.parse(jsonString.trim());
        } else {
          // If no JSON format is detected, attempt to parse the entire response
          jsonData = JSON.parse(llmResponse);
        }
      } catch (e) {
        // If parsing fails, return the raw response for debugging
        return res.status(200).json({
          success: true,
          data: llmResponse,
          note: "The response couldn't be parsed as JSON. Returning raw response.",
        });
      }

      return res.status(200).json({
        success: true,
        data: jsonData,
      });
    } catch (error) {
      next(error);
    }
  }
);

// // Route for specific investment analysis
// router.post('/analyze-investment', validateRequestBody, async (req, res , next) => {
//     try {
//       const {
//         investmentType, // "stock", "mutual_fund", "fd", "gold", "ppf", "sip"
//         investmentName,
//         investmentAmount,
//         timeHorizon,
//         userTaxBracket = "30%",
//         userExistingInvestments = [],
//         // Additional type-specific parameters
//         // Stock parameters
//         stockQuantity,
//         stockAction, // "buy", "sell"
//         currentPrice,
//         // PPF parameters
//         ppfFrequency, // "monthly", "quarterly", "annually"
//         ppfTenure, // Minimum 15 years
//         // FD parameters
//         fdTenure,
//         fdInterestPayout, // "monthly", "quarterly", "annually", "cumulative"
//         // Mutual Fund parameters
//         mfCategory, // "equity", "debt", "hybrid", "index"
//         mfInvestType, // "lump_sum", "sip"
//         riskProfile, // "conservative", "moderate", "aggressive"
//         // Gold parameters
//         goldType, // "digital", "etf", "sovereign_bond", "physical"
//         goldQuantity,
//         lockInPeriod
//       } = req.body;

//       if (!investmentType || !investmentName) {
//         return res.status(400).json({ error: "Investment type and name are required" });
//       }
//       console.log(req.body);

//       // Format existing investments properly for the prompt
//       const formattedInvestments = userExistingInvestments.map(inv =>
//         typeof inv === 'object' ? JSON.stringify(inv) : inv
//       );

//       // Build investment-specific parameters
//       let typeSpecificParams = '';
//       let analysisPrompt = '';

//       switch(investmentType.toLowerCase()) {
//         case 'stock':
//           typeSpecificParams = `
//           - Stock quantity: ${stockQuantity || 'Not specified'}
//           - Action: ${stockAction || 'Not specified'} (buy/sell)
//           - Current price: ${currentPrice || 'Not specified'}`;

//           analysisPrompt = `
//           1. Stock Performance Analysis:
//              - Current price and valuation metrics (P/E, P/B, EV/EBITDA)
//              - Historical performance (1-year, 3-year, 5-year returns)
//              - 52-week high/low analysis
//              - EPS growth trajectory
//              - Dividend yield and payout ratio
//              - Sector performance comparison

//           2. Technical Analysis:
//              - RSI, MACD, and moving averages (50-day, 200-day)
//              - Support and resistance levels
//              - Volume analysis and unusual patterns
//              - Technical chart patterns (head and shoulders, double bottoms, etc.)
//              - Bollinger bands and volatility indicators

//           3. Fundamental Analysis:
//              - Revenue and profit growth rates
//              - Debt-to-equity ratio
//              - Free cash flow trends
//              - Return on equity
//              - Management effectiveness
//              - Competitive positioning in the industry`;
//           break;

//         case 'ppf':
//           typeSpecificParams = `
//           - Contribution frequency: ${ppfFrequency || 'Not specified'} (monthly/quarterly/annually)
//           - Tenure: ${ppfTenure || '15 years'} (minimum 15 years, extendable by 5 years)`;

//           analysisPrompt = `
//           1. PPF Performance Analysis:
//              - Current interest rate compared to historical averages
//              - Projected maturity amount based on contribution pattern
//              - Comparison with inflation rates
//              - Tax benefits under Section 80C

//           2. Cash Flow Assessment:
//              - Annual contribution requirements
//              - Impact on liquidity
//              - Partial withdrawal possibilities after specific periods
//              - Extension benefits after 15 years

//           3. PPF-specific Considerations:
//              - Loan facility availability (after 3 years)
//              - Comparison with other tax-saving instruments
//              - Lock-in implications
//              - Nomination and account management`;
//           break;

//         case 'fd':
//           typeSpecificParams = `
//           - Tenure: ${fdTenure || 'Not specified'}
//           - Interest payout option: ${fdInterestPayout || 'Not specified'} (monthly/quarterly/annually/cumulative)`;

//           analysisPrompt = `
//           1. FD Performance Analysis:
//              - Current interest rates across different banks/institutions
//              - Post-tax returns based on tenure and payout options
//              - Interest rate trends and future outlook
//              - Comparison with inflation rate

//           2. Payout Option Analysis:
//              - Impact of different payout frequencies on effective returns
//              - Reinvestment opportunities for regular payouts
//              - Tax implications for different payout structures
//              - TDS considerations based on investment amount

//           3. FD-specific Considerations:
//              - Premature withdrawal penalties
//              - Special rates for senior citizens if applicable
//              - Auto-renewal options and benefits
//              - Nomination and liquidity assessment`;
//           break;

//         case 'mutual_fund':
//           typeSpecificParams = `
//           - Category: ${mfCategory || 'Not specified'} (equity/debt/hybrid/index)
//           - Investment type: ${mfInvestType || 'Not specified'} (lump sum/SIP)
//           - Risk profile: ${riskProfile || 'Not specified'} (conservative/moderate/aggressive)`;

//           analysisPrompt = `
//           1. Mutual Fund Performance Analysis:
//              - Historical returns (1-year, 3-year, 5-year, since inception)
//              - Benchmark comparison and alpha generation
//              - CAGR and rolling returns analysis
//              - AUM size and growth trend
//              - Fund manager track record and tenure
//              - Expense ratio impact on returns

//           2. Portfolio Composition Analysis:
//              - Sector allocation and concentration
//              - Top holdings analysis
//              - Portfolio turnover ratio
//              - Credit quality (for debt funds)
//              - Duration strategy (for debt funds)
//              - Diversification assessment

//           3. Risk-Return Assessment:
//              - Standard deviation and beta
//              - Sharpe and Sortino ratios
//              - Downside protection history
//              - Maximum drawdown periods
//              - Risk-adjusted return metrics
//              - Performance in different market cycles`;
//           break;

//         case 'gold':
//           typeSpecificParams = `
//           - Gold investment type: ${goldType || 'Not specified'} (digital/ETF/sovereign bond/physical)
//           - Quantity: ${goldQuantity || 'Not specified'}
//           - Lock-in period: ${lockInPeriod || 'Not applicable'}`;

//           analysisPrompt = `
//           1. Gold Performance Analysis:
//              - Current price trends (domestic and international)
//              - Historical performance against inflation
//              - Correlation with equity markets
//              - Impact of currency fluctuations
//              - Seasonal patterns in gold prices

//           2. Gold Investment Type Comparison:
//              - Making charges/premium over spot price
//              - Storage and insurance costs
//              - Liquidity comparison between different gold investment forms
//              - Purity and certification aspects
//              - Tracking error (for gold ETFs)

//           3. Gold-specific Considerations:
//              - Global economic indicators affecting gold prices
//              - Impact of interest rates on gold performance
//              - Tax implications based on holding period
//              - Entry and exit costs
//              - Portfolio diversification benefits`;
//           break;

//         case 'sip':
//           // SIP is technically a method of investing in mutual funds, so we'll treat it specifically
//           typeSpecificParams = `
//           - Fund category: ${mfCategory || 'Not specified'} (equity/debt/hybrid/index)
//           - SIP amount: ${investmentAmount || 'Not specified'}
//           - SIP frequency: ${ppfFrequency || 'monthly'} (monthly/quarterly)
//           - Risk profile: ${riskProfile || 'Not specified'} (conservative/moderate/aggressive)`;

//           analysisPrompt = `
//           1. SIP Performance Analysis:
//              - Historical SIP returns with different time periods
//              - Rupee cost averaging benefits in different market phases
//              - SIP step-up impact on final corpus
//              - SIP vs lump sum performance comparison

//           2. SIP Strategy Assessment:
//              - Optimal SIP dates based on market patterns
//              - SIP amount adequacy for financial goals
//              - Timing the market vs time in the market analysis
//              - SIP pause and resume strategy implications

//           3. SIP-specific Considerations:
//              - Auto-debit facility and management
//              - Missed SIP installment impacts
//              - Exit load implications for SIP investments
//              - Tax implications of SIP redemptions
//              - SIP behavior during market volatility`;
//           break;

//         default:
//           // Generic analysis if the investment type is not recognized
//           analysisPrompt = `
//           1. Performance Analysis:
//              - Historical performance (1-year, 3-year, 5-year returns if applicable)
//              - Current rates/prices compared to historical averages
//              - Risk-adjusted returns metrics

//           2. Risk Assessment:
//              - Volatility metrics
//              - Specific risks to this investment
//              - Liquidity assessment

//           3. Investment Considerations:
//              - Tax implications
//              - Entry and exit costs
//              - Lock-in periods if applicable`;
//       }

//       // Common sections for all investment types
//       const commonSections = `
//       4. Timing Recommendation:
//          - Current market conditions assessment
//          - Is now a good time to invest based on technical and fundamental factors?
//          - If not, when would be the optimal time to invest in 2025?
//          - Dollar-cost averaging vs. lump sum recommendation
//          - Entry point strategy

//       5. Tax Implications:
//          - Tax efficiency of this investment
//          - Strategies to minimize tax burden based on ${userTaxBracket} tax bracket
//          - Tax-saving alternatives if applicable
//          - Long-term vs short-term capital gains considerations
//          - Tax harvesting opportunities

//       6. Portfolio Fit Analysis:
//          - How this investment complements existing portfolio
//          - Asset allocation impact
//          - Diversification benefits
//          - Risk-return profile adjustment
//          - Alignment with financial goals based on ${timeHorizon || 'specified'} time horizon`;

//       // Constructing the full prompt for specific investment analysis
//       const prompt = `
//       I need a detailed analysis of this specific investment opportunity:
//       - Investment type: ${investmentType}
//       - Investment name: ${investmentName}
//       - Amount to invest: ${investmentAmount || 'Not specified'}
//       - Time horizon: ${timeHorizon || 'Not specified'}
//       - Investor's tax bracket: ${userTaxBracket}${typeSpecificParams}
//       - Investor's existing investments: ${formattedInvestments.length > 0 ? JSON.stringify(formattedInvestments) : 'None'}

//       Based on current market data as of March 2025 and historical performance, provide a comprehensive analysis that covers:

//       ${analysisPrompt}
//       ${commonSections}

//       Format your response as a detailed JSON with clear sections for each analysis component, specific metrics with numerical values, confidence scores for predictions, and actionable recommendations. Ensure each numeric value has appropriate units. Include an 'executive_summary' field with a concise assessment and top recommendations. Don't wrap the JSON in Markdown code blocks.`;

//       const response = await axios.post(OPENROUTER_URL, {
//         model: MODEL,
//         messages: [{ role: "user", content: prompt }]
//       }, {
//         headers: {
//           "Authorization": `Bearer ${API_KEY}`,
//           "Content-Type": "application/json"
//         }
//       });

//       const llmResponse = response.data.choices[0].message.content;

//       // Find JSON content within the response
//       let jsonData;
//       try {
//         // This regex attempts to extract JSON content from the response
//         const jsonMatch = llmResponse.match(/```json([\s\S]*?)```/) ||
//                           llmResponse.match(/```([\s\S]*?)```/) ||
//                           llmResponse.match(/{[\s\S]*}/) ||
//                           llmResponse.match(/\[[\s\S]*\]/);

//         if (jsonMatch) {
//           const jsonString = jsonMatch[0].startsWith('```') ?
//             jsonMatch[1] || jsonMatch[0].replace(/```json|```/g, '') :
//             jsonMatch[0];
//           jsonData = JSON.parse(jsonString.trim());
//         } else {
//           // If no JSON format is detected, attempt to parse the entire response
//           jsonData = JSON.parse(llmResponse);
//         }

//         // Process the response to ensure proper object serialization
//         const processData = (data) => {
//           if (Array.isArray(data)) {
//             return data.map(item => processData(item));
//           } else if (data !== null && typeof data === 'object') {
//             const result = {};
//             for (const [key, value] of Object.entries(data)) {
//               result[key] = processData(value);
//             }
//             return result;
//           }
//           return data;
//         };

//         // Process the data to ensure proper object serialization
//         jsonData = processData(jsonData);

//         // Return the properly formatted response
//         return res.status(200).json({
//           success: true,
//           data: jsonData
//         });

//       } catch (e) {
//         console.error("Error parsing JSON response:", e);
//         // If parsing fails, return the raw response for debugging
//         return res.status(200).json({
//           success: true,
//           data: llmResponse,
//           note: "The response couldn't be parsed as JSON. Returning raw response."
//         });
//       }

//     } catch (error) {
//       next(error)
//     }
// });

router.post(
  "/analyze-investment",
  validateRequestBody,
  userMiddleware,
  async (req, res, next) => {
    try {
      const userId = req.userData._id;
      const {
        investmentType,
        investmentName,
        investmentAmount,
        timeHorizon, // in months
        userTaxBracket = "30%",
        // Additional parameters based on investment type
        stockQuantity,
        stockAction,
        currentPrice,
        ppfFrequency,
        ppfTenure,
        fdTenure,
        fdInterestPayout,
        mfCategory,
        mfInvestType,
        riskProfile,
        goldType,
        goldQuantity,
        lockInPeriod,
      } = req.body;

      // Template for the investment analysis
      const templatePrompt = `
    Create an investment analysis dashboard by filling in the following HTML template with real data. 
    Replace all placeholder variables ({{variable}}) with actual values based on the investment details provided.

    INVESTMENT DETAILS:
    - Type: ${investmentType}
    - Name: ${investmentName}
    - Amount: ₹${investmentAmount}
    - Time Horizon: ${timeHorizon} months
    - Tax Bracket: ${userTaxBracket}
    ${
      investmentType === "stock"
        ? `- Quantity: ${stockQuantity}
    - Action: ${stockAction}
    - Current Price: ₹${currentPrice}`
        : ""
    }
    ${
      investmentType === "ppf"
        ? `- Frequency: ${ppfFrequency}
    - Tenure: ${ppfTenure} years`
        : ""
    }
    ${
      investmentType === "fd"
        ? `- Tenure: ${fdTenure} months
    - Interest Payout: ${fdInterestPayout}`
        : ""
    }
    ${
      investmentType === "mutual_fund"
        ? `- Category: ${mfCategory}
    - Investment Type: ${mfInvestType}
    - Risk Profile: ${riskProfile}`
        : ""
    }
    ${
      investmentType === "gold"
        ? `- Type: ${goldType}
    - Quantity: ${goldQuantity}
    - Lock-in Period: ${lockInPeriod} months`
        : ""
    }

    HTML TEMPLATE:
    <div class="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{investmentName}}</h1>
        <div class="flex items-center space-x-4 text-gray-600">
          <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{{investmentType}}</span>
          <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">{{timeHorizon}} months</span>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-gray-50 p-6 rounded-lg">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Investment Amount</h3>
          <p class="text-2xl font-bold text-gray-900">₹{{investmentAmount}}</p>
        </div>
        <div class="bg-gray-50 p-6 rounded-lg">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Expected Returns</h3>
          <p class="text-2xl font-bold text-green-600">{{expectedReturns}}%</p>
        </div>
        <div class="bg-gray-50 p-6 rounded-lg">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Risk Level</h3>
          <p class="text-2xl font-bold text-red-600">{{riskLevel}}/10</p>
        </div>
      </div>

      <!-- Performance Analysis -->
      <div class="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Performance Analysis</h2>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Historical Returns (1Y)</span>
            <span class="font-medium text-green-600">{{historicalReturns}}%</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Volatility</span>
            <span class="font-medium text-yellow-600">{{volatility}}%</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Sharpe Ratio</span>
            <span class="font-medium text-blue-600">{{sharpeRatio}}</span>
          </div>
        </div>
      </div>

      <!-- Risk Assessment -->
      <div class="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Risk Assessment</h2>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Market Risk</span>
            <span class="font-medium text-red-600">{{marketRisk}}/10</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Liquidity Risk</span>
            <span class="font-medium text-red-600">{{liquidityRisk}}/10</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Tax Efficiency</span>
            <span class="font-medium text-green-600">{{taxEfficiency}}/10</span>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div class="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Recommendations</h2>
        <div class="space-y-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <span class="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                <svg class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-900">{{recommendationTitle}}</h3>
              <p class="mt-1 text-sm text-gray-500">{{recommendationDescription}}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Future Outlook -->
      <div class="bg-gray-50 p-6 rounded-lg">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Future Outlook</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 bg-white rounded-lg shadow-sm">
            <h3 class="text-sm font-medium text-gray-900">Conservative</h3>
            <p class="mt-2 text-2xl font-bold text-gray-900">{{conservativeReturn}}%</p>
            <p class="text-sm text-gray-500">Expected Return</p>
          </div>
          <div class="p-4 bg-white rounded-lg shadow-sm">
            <h3 class="text-sm font-medium text-gray-900">Moderate</h3>
            <p class="mt-2 text-2xl font-bold text-gray-900">{{moderateReturn}}%</p>
            <p class="text-sm text-gray-500">Expected Return</p>
          </div>
          <div class="p-4 bg-white rounded-lg shadow-sm">
            <h3 class="text-sm font-medium text-gray-900">Aggressive</h3>
            <p class="mt-2 text-2xl font-bold text-gray-900">{{aggressiveReturn}}%</p>
            <p class="text-sm text-gray-500">Expected Return</p>
          </div>
        </div>
      </div>
    </div>

    INSTRUCTIONS:
    1. Replace all placeholder variables ({{variable}}) with realistic values based on the investment type and details provided
    2. Keep all HTML structure and Tailwind classes exactly as shown
    3. Ensure all monetary values are in Indian Rupees (₹)
    4. Time periods should be in months
    5. Risk scores should be out of 10
    6. Returns should be in percentage
    7. Make the analysis specific to the investment type provided
    8. Keep all styling and layout exactly as shown in the template

    Return ONLY the filled HTML template with all placeholders replaced with actual values. Do not include any additional text or explanations.`;

      // Make the API call
      const response = await axios.post(
        OPENROUTER_URL,
        {
          model: MODEL,
          messages: [
            {
              role: "user",
              content: templatePrompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Extract the filled template from the response
      const filledTemplate = response.data.choices[0].message.content;

      // Send the response
      res.status(200).json({
        success: true,
        component: filledTemplate,
      });
    } catch (error) {
      console.error("API error:", error);
      next(error);
    }
  }
);

router.get("/llm-dashboard", userMiddleware, async (req, res, next) => {
  try {
    const userId = req.userData._id;

    // Fetch all investment data
    const [
      fixedDeposits,
      goldInvestments,
      mutualFunds,
      ppfInvestments,
      stocks,
    ] = await Promise.all([
      FixedDeposit.find({ userId }),
      GoldInvestment.find({ userId }),
      MutualFund.find({ userId }),
      PPF.find({ userId }),
      Stock.find({ userId }),
    ]);
    console.log(userId);

    // Organize data in the expected format
    const portfolioData = {
      fixedDeposits,
      goldInvestments,
      mutualFunds,
      ppfInvestments,
      stocks,
    };

    // Calculate investment metrics
    const metrics = calculateInvestmentMetrics(portfolioData);

    // Create a structured prompt for the LLM
    const dashboardPrompt = `
    Analyze this investment portfolio and provide insights in the following JSON format:
    {
      "portfolio_summary": {
        "total_investments": number,
        "total_value": string (with ₹),
        "total_profit": string (with ₹),
        "profit_percentage": string (with %),
        "risk_profile": string,
        "risk_score": number (1-10)
      },
      "asset_distribution": {
        "fixed_deposits": {
          "count": number,
          "total_amount": string (with ₹),
          "percentage": number
        },
        "gold": {
          "count": number,
          "total_amount": string (with ₹),
          "percentage": number
        },
        "mutual_funds": {
          "count": number,
          "total_amount": string (with ₹),
          "percentage": number
        },
        "ppf": {
          "count": number,
          "total_amount": string (with ₹),
          "percentage": number
        },
        "stocks": {
          "count": number,
          "total_amount": string (with ₹),
          "percentage": number
        }
      },
      "insights": {
        "strengths": string[],
        "weaknesses": string[],
        "recommendations": string[]
      }
    }

    Portfolio Data:
    ${JSON.stringify(portfolioData)}

    Metrics:
    ${JSON.stringify(metrics)}

    IMPORTANT:
    1. Return ONLY valid JSON
    2. Include all fields in the structure
    3. Use null for missing data
    4. Format currency with ₹ symbol
    5. Format percentages with % symbol
    6. Keep insights concise and actionable
    `;

    // Call LLM API with structured prompt
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: MODEL,
        messages: [
          {
            role: "user",
            content: dashboardPrompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let llmResponse;
    try {
      // Extract and parse the JSON response
      const responseContent = response.data.choices[0].message.content;
      const jsonMatch = responseContent.match(/{[\s\S]*}/);
      if (jsonMatch) {
        llmResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (e) {
      console.error("Error parsing LLM response:", e);
      llmResponse = {
        portfolio_summary: {
          total_investments: 0,
          total_value: "₹0",
          total_profit: "₹0",
          profit_percentage: "0%",
          risk_profile: "Unknown",
          risk_score: 5,
        },
        asset_distribution: {
          fixed_deposits: { count: 0, total_amount: "₹0", percentage: 0 },
          gold: { count: 0, total_amount: "₹0", percentage: 0 },
          mutual_funds: { count: 0, total_amount: "₹0", percentage: 0 },
          ppf: { count: 0, total_amount: "₹0", percentage: 0 },
          stocks: { count: 0, total_amount: "₹0", percentage: 0 },
        },
        insights: {
          strengths: ["No data available"],
          weaknesses: ["No data available"],
          recommendations: ["No data available"],
        },
      };
    }

    // Send combined response
    res.status(200).json({
      success: true,
      data: {
        portfolio: {
          fixedDeposits,
          goldInvestments,
          mutualFunds,
          ppfInvestments,
          stocks,
        },
        metrics,
        analysis: llmResponse,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate dashboard data",
      details: error.message,
    });
  }
});

router.post(
  "/llm-user-profolio-analysis",
  userMiddleware,
  async (req, res, next) => {
    try {
      const userId = req.userData._id;
      const [
        fixedDeposits,
        goldInvestments,
        mutualFunds,
        ppfInvestments,
        stocks,
      ] = await Promise.all([
        FixedDeposit.find({ userId }),
        GoldInvestment.find({ userId }),
        MutualFund.find({ userId }),
        PPF.find({ userId }),
        Stock.find({ userId }),
      ]);

      const portfolioData = {
        fixedDeposits,
        goldInvestments,
        mutualFunds,
        ppfInvestments,
        stocks,
      };

      const metrics = calculateInvestmentMetrics(portfolioData);

      const detailedPortfolio = {
        fixedDeposits: fixedDeposits.map((fd) => ({
          amount: parseFloat(fd.investAmount.toString()),
          tenure: fd.tenure,
          payoutOption: fd.payoutOption,
          platform: fd.platform,
          createdAt: fd.createdAt,
        })),
        goldInvestments: goldInvestments.map((gold) => ({
          amount: parseFloat(gold.investAmount.toString()),
          type: gold.investType,
          quantity: parseFloat(gold.quantity.toString()),
          lockInPeriod: gold.lockInPeriod,
          platform: gold.platform,
          createdAt: gold.createdAt,
        })),
        mutualFunds: mutualFunds.map((mf) => ({
          amount: parseFloat(mf.investAmount.toString()),
          fundType: mf.fundType,
          investType: mf.investType,
          riskProfile: mf.riskProfile,
          platform: mf.platform,
          createdAt: mf.createdAt,
        })),
        ppfInvestments: ppfInvestments.map((ppf) => ({
          amount: parseFloat(ppf.investAmount.toString()),
          interestRate: parseFloat(ppf.interestRate.toString()),
          frequency: ppf.frequency,
          maturityDate: ppf.maturityDate,
          platform: ppf.platform,
          createdAt: ppf.createdAt,
        })),
        stocks: stocks.map((stock) => ({
          name: stock.stock_name,
          buyingPrice: parseFloat(stock.buying_price.toString()),
          sellingPrice: parseFloat(stock.selling_price.toString()),
          quantity: stock.quantity,
          type: stock.stock_type,
          peRatio: parseFloat(stock.pe_ratio.toString()),
          volume: stock.volume,
          eps: parseFloat(stock.eps.toString()),
          marketCap: parseFloat(stock.market_cap.toString()),
          platform: stock.platform,
          createdAt: stock.createdAt,
        })),
      };

      // Improved prompt for consistent JSON structure
      const analysisPrompt = `
    As a financial advisor, analyze this investment portfolio with the following data:

    Portfolio Metrics:
    ${JSON.stringify(metrics)}

    Portfolio Details:
    ${JSON.stringify(detailedPortfolio)}

    Provide a comprehensive analysis following EXACTLY this JSON structure. All fields must be present, use null for missing/unavailable data:

    {
      "portfolio_summary": {
        "overview": {
          "health_score": number (1-10),
          "summary": string,
          "key_metrics": {
            "total_value": string (with ₹),
            "total_invested": string (with ₹),
            "total_returns": string (with %),
            "annual_estimated_return": string (with %)
          }
        },
        "asset_allocation": {
          "fixed_deposits": {
            "percentage": number,
            "amount": string (with ₹),
            "status": string (Underweight/Neutral/Overweight)
          },
          "gold": {
            "percentage": number,
            "amount": string (with ₹),
            "status": string
          },
          "ppf": {
            "percentage": number,
            "amount": string (with ₹),
            "status": string
          },
          "stocks": {
            "percentage": number,
            "amount": string (with ₹),
            "status": string
          },
          "mutual_funds": {
            "percentage": number,
            "amount": string (with ₹),
            "status": string
          }
        },
        "diversification_score": number (1-10),
        "risk_adjusted_return": number
      },
      "investment_analysis": {
        "fixed_deposits": {
          "performance": {
            "current_return": string (with %),
            "risk_level": string,
            "liquidity": string,
            "tax_efficiency": string
          },
          "insights": string,
          "concerns": string,
          "opportunities": string
        },
        "gold": {
          "performance": {...},
          "insights": string,
          "concerns": string,
          "opportunities": string
        },
        "ppf": {
          "performance": {...},
          "insights": string,
          "concerns": string,
          "opportunities": string
        },
        "stocks": {
          "performance": {...},
          "insights": string,
          "concerns": string,
          "opportunities": string
        },
        "mutual_funds": {
          "performance": {...},
          "insights": string,
          "concerns": string,
          "opportunities": string
        }
      },
      "risk_assessment": {
        "overall_risk_score": number (1-10),
        "risk_factors": {
          "concentration_risk": {
            "score": number (1-10),
            "concern": string,
            "impact": string
          },
          "market_risk": {...},
          "inflation_risk": {...},
          "liquidity_risk": {...}
        },
        "volatility_analysis": {
          "portfolio_beta": number,
          "standard_deviation": string (with %),
          "sharpe_ratio": number
        }
      },
      "recommendations": {
        "immediate_actions": [
          {
            "action": string,
            "target": string,
            "rationale": string,
            "priority": string (High/Medium/Low)
          }
        ],
        "rebalancing_suggestions": {
          "target_allocation": {
            "equity": string (with %),
            "fixed_income": string (with %),
            "gold": string (with %),
            "ppf": string (with %)
          },
          "timeline": string,
          "approach": string
        },
        "tax_optimization": {
          "strategies": string[]
        }
      },
      "future_outlook": {
        "growth_projections": {
          "conservative_scenario": {
            "expected_return": string (with %),
            "5_year_projection": string (with ₹),
            "confidence_score": number (0-1)
          },
          "moderate_scenario": {...},
          "aggressive_scenario": {...}
        },
        "market_trends": {
          "equity_outlook": string,
          "fixed_income_outlook": string,
          "gold_outlook": string
        },
        "suggested_adjustments": [
          {
            "timeframe": string,
            "action": string,
            "amount": string (with ₹)
          }
        ]
      }
    }

    IMPORTANT:
    1. Maintain exact structure - include all fields
    2. Use null for missing data, don't omit fields
    3. Include currency (₹) and percentage (%) symbols where applicable
    4. Provide realistic values based on the portfolio data
    5. Keep number values as numbers, not strings (except for currency/percentage representations)
    6. Ensure all arrays have at least one item (empty array if no data)
    `;

      const response = await axios.post(
        OPENROUTER_URL,
        {
          model: MODEL,
          messages: [{ role: "user", content: analysisPrompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      let analysisResult;
      try {
        const llmResponse = response.data.choices[0].message.content;
        analysisResult = JSON.parse(llmResponse);
      } catch (e) {
        analysisResult = {
          raw_analysis: response.data.choices[0].message.content,
          parsing_error: "Could not parse as JSON",
        };
      }

      // Standard response structure
      const standardResponse = {
        success: true,
        portfolio_metrics: metrics,
        detailed_analysis: analysisResult,
        investment_summary: {
          total_investments: {
            fixed_deposits: fixedDeposits.length,
            gold: goldInvestments.length,
            mutual_funds: mutualFunds.length,
            ppf: ppfInvestments.length,
            stocks: stocks.length,
          },
          total_invested_amount: parseFloat(metrics.totalInvestedAmount),
          current_portfolio_value: parseFloat(metrics.totalCurrentValue),
          total_profit: parseFloat(metrics.totalProfit),
          profit_percentage: parseFloat(metrics.profitPercentage),
          risk_profile: metrics.riskProfile,
          risk_score: metrics.riskScore,
        },
      };

      res.status(200).json(standardResponse);
    } catch (error) {
      console.error("Portfolio Analysis Error:", error);
      next(error);
    }
  }
);

// Function to calculate investment metrics
const calculateInvestmentMetrics = (data) => {
  // Initialize metrics
  let totalInvestedAmount = 0;
  let totalCurrentValue = 0;
  let investmentDistribution = [];

  // Calculate metrics for Fixed Deposits
  if (data.fixedDeposits && data.fixedDeposits.length > 0) {
    const fdInvestment = data.fixedDeposits.reduce((sum, fd) => {
      const amount = fd.investAmount
        ? parseFloat(fd.investAmount.toString())
        : 0;
      return sum + amount;
    }, 0);

    totalInvestedAmount += fdInvestment;
    // Approximate current value (simple interest estimation)
    const fdCurrentValue = data.fixedDeposits.reduce((sum, fd) => {
      const amount = fd.investAmount
        ? parseFloat(fd.investAmount.toString())
        : 0;
      // Assuming average interest rate of 6.5% for FDs
      const interestRate = 0.065;
      const tenureInYears = fd.tenure ? fd.tenure / 12 : 0;
      // Simple interest calculation
      const interest = amount * interestRate * tenureInYears;
      return sum + amount + interest;
    }, 0);

    totalCurrentValue += fdCurrentValue;

    if (fdInvestment > 0) {
      investmentDistribution.push({
        label: "Fixed Deposit",
        amount: fdInvestment.toFixed(2),
      });
    }
  }

  // Calculate metrics for Gold Investments
  if (data.goldInvestments && data.goldInvestments.length > 0) {
    const goldInvestment = data.goldInvestments.reduce((sum, gold) => {
      const amount = gold.investAmount
        ? parseFloat(gold.investAmount.toString())
        : 0;
      return sum + amount;
    }, 0);

    totalInvestedAmount += goldInvestment;
    // Approximate current value (assuming 8% annual growth)
    const goldCurrentValue = data.goldInvestments.reduce((sum, gold) => {
      const amount = gold.investAmount
        ? parseFloat(gold.investAmount.toString())
        : 0;
      // Assuming 8% annual growth for gold
      const growthRate = 0.08;
      // Calculate time elapsed since investment (in years)
      const timeInYears =
        (new Date() - new Date(gold.createdAt)) / (1000 * 60 * 60 * 24 * 365);
      return sum + amount * (1 + growthRate * timeInYears);
    }, 0);

    totalCurrentValue += goldCurrentValue;

    if (goldInvestment > 0) {
      investmentDistribution.push({
        label: "Gold",
        amount: goldInvestment.toFixed(2),
      });
    }
  }

  // Calculate metrics for PPF Investments
  if (data.ppfInvestments && data.ppfInvestments.length > 0) {
    const ppfInvestment = data.ppfInvestments.reduce((sum, ppf) => {
      const amount = ppf.investAmount
        ? parseFloat(ppf.investAmount.toString())
        : 0;
      return sum + amount;
    }, 0);

    totalInvestedAmount += ppfInvestment;
    // Calculate current value using the actual interest rates from the data
    const ppfCurrentValue = data.ppfInvestments.reduce((sum, ppf) => {
      const amount = ppf.investAmount
        ? parseFloat(ppf.investAmount.toString())
        : 0;
      const interestRate = ppf.interestRate
        ? parseFloat(ppf.interestRate.toString()) / 100
        : 0.075; // Default to 7.5% if not specified

      // Calculate time period (in years) from investment to today
      const maturityDate = new Date(ppf.maturityDate);
      const createdDate = new Date(ppf.createdAt);
      const today = new Date();

      // Get time elapsed in years (capped by maturity date)
      const timeElapsedMs = Math.min(
        today - createdDate,
        maturityDate - createdDate
      );
      const timeElapsedYears = timeElapsedMs / (1000 * 60 * 60 * 24 * 365);

      // Compound interest calculation (compounded annually)
      const currentValue =
        amount * Math.pow(1 + interestRate, timeElapsedYears);
      return sum + currentValue;
    }, 0);

    totalCurrentValue += ppfCurrentValue;

    if (ppfInvestment > 0) {
      investmentDistribution.push({
        label: "PPF",
        amount: ppfInvestment.toFixed(2),
      });
    }
  }

  // Calculate metrics for Stocks
  if (data.stocks && data.stocks.length > 0) {
    const stockInvestment = data.stocks.reduce((sum, stock) => {
      if (stock.stock_type === "BUY") {
        const price = stock.buying_price
          ? parseFloat(stock.buying_price.toString())
          : 0;
        const quantity = stock.quantity || 0;
        return sum + price * quantity;
      }
      return sum;
    }, 0);

    totalInvestedAmount += stockInvestment;
    // Calculate current value based on current selling price
    const stockCurrentValue = data.stocks.reduce((sum, stock) => {
      if (stock.stock_type === "BUY") {
        const price = stock.selling_price
          ? parseFloat(stock.selling_price.toString())
          : 0;
        const quantity = stock.quantity || 0;
        return sum + price * quantity;
      }
      return sum;
    }, 0);

    totalCurrentValue += stockCurrentValue;

    if (stockInvestment > 0) {
      investmentDistribution.push({
        label: "Stocks",
        amount: stockInvestment.toFixed(2),
      });
    }
  }

  // Add Mutual Funds if present
  if (data.mutualFunds && data.mutualFunds.length > 0) {
    const mfInvestment = data.mutualFunds.reduce((sum, mf) => {
      const amount = mf.investAmount
        ? parseFloat(mf.investAmount.toString())
        : 0;
      return sum + amount;
    }, 0);

    totalInvestedAmount += mfInvestment;
    // Approximate current value (assuming different growth rates based on fund type)
    const mfCurrentValue = data.mutualFunds.reduce((sum, mf) => {
      const amount = mf.investAmount
        ? parseFloat(mf.investAmount.toString())
        : 0;
      // Different growth rates based on fund type
      let growthRate = 0.1; // Default for equity
      if (mf.fundType === "Debt") growthRate = 0.07;
      if (mf.fundType === "Hybrid") growthRate = 0.09;
      // Calculate time elapsed since investment (in years)
      const timeInYears =
        (new Date() - new Date(mf.createdAt)) / (1000 * 60 * 60 * 24 * 365);
      return sum + amount * (1 + growthRate * timeInYears);
    }, 0);

    totalCurrentValue += mfCurrentValue;

    if (mfInvestment > 0) {
      investmentDistribution.push({
        label: "Mutual Funds",
        amount: mfInvestment.toFixed(2),
      });
    }
  }

  // Calculate total profit and percentage
  const totalProfit = totalCurrentValue - totalInvestedAmount;
  const profitPercentage =
    totalInvestedAmount > 0 ? (totalProfit / totalInvestedAmount) * 100 : 0;

  // Calculate risk score
  let riskScore = 5; // Default to moderate

  // Adjust risk score based on asset allocation
  if (totalInvestedAmount > 0) {
    // Calculate percentages for risk assessment
    const stockPercentage =
      (parseFloat(
        investmentDistribution.find((i) => i.label === "Stocks")?.amount || 0
      ) /
        totalInvestedAmount) *
      100;
    const goldPercentage =
      (parseFloat(
        investmentDistribution.find((i) => i.label === "Gold")?.amount || 0
      ) /
        totalInvestedAmount) *
      100;
    const safeAssetsPercentage =
      ((parseFloat(
        investmentDistribution.find((i) => i.label === "Fixed Deposit")
          ?.amount || 0
      ) +
        parseFloat(
          investmentDistribution.find((i) => i.label === "PPF")?.amount || 0
        )) /
        totalInvestedAmount) *
      100;

    // Adjust risk score based on allocation
    if (stockPercentage > 50) riskScore += 2;
    else if (stockPercentage > 30) riskScore += 1;

    if (goldPercentage > 30) riskScore += 1;

    if (safeAssetsPercentage > 50) riskScore -= 2;
    else if (safeAssetsPercentage > 30) riskScore -= 1;
  }

  // Clamp risk score between 1-10
  riskScore = Math.max(1, Math.min(10, riskScore));

  // Determine risk profile
  let riskProfile;
  if (riskScore <= 3) riskProfile = "Conservative";
  else if (riskScore <= 7) riskProfile = "Moderate";
  else riskProfile = "Aggressive";

  return {
    totalInvestedAmount: totalInvestedAmount.toFixed(2),
    totalCurrentValue: totalCurrentValue.toFixed(2),
    totalProfit: totalProfit.toFixed(2),
    profitPercentage: profitPercentage.toFixed(2),
    riskScore,
    riskProfile,
    investmentDistribution,
    investmentLabels: investmentDistribution.map((item) => item.label),
    investmentAmounts: investmentDistribution.map((item) =>
      parseFloat(item.amount)
    ),
  };
};

// Function to call the LLM API
const fetchLlmInsights = async (portfolioData) => {
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `You are a financial advisor analyzing investment data. 
                     Provide brief insights on this portfolio including strengths, 
                     weaknesses, and recommendations. Keep it under 250 words.`,
          },
          {
            role: "user",
            content: `Analyze this investment portfolio and provide insights: 
                     ${JSON.stringify({
                       fixedDeposits: portfolioData.fixedDeposits.length,
                       goldInvestments: portfolioData.goldInvestments.length,
                       mutualFunds: portfolioData.mutualFunds.length,
                       ppfInvestments: portfolioData.ppfInvestments.length,
                       stocks: portfolioData.stocks.length,
                       // Include summary of distribution rather than full data
                       // to keep the prompt size manageable
                     })}`,
          },
        ],
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling LLM API:", error);
    return "Unable to generate portfolio insights at this time.";
  }
};

module.exports = router;
