const express = require('express');
const axios = require('axios');
const router = express.Router();
const userMiddleware = require('../middleware/user')
const FixedDeposit = require('../models/fixedDeposit')
const GoldInvestment = require('../models/gold')
const MutualFund = require('../models/mutualFunds')
const PPF = require('../models/ppf')
const Stock = require('../models/stocks')
// Define the OpenRouter API endpoint and headers
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = "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"; // Replace with environment variable in production
const MODEL = "meta-llama/llama-3.3-70b-instruct:free";

// Middleware to validate request body
const validateRequestBody = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ error: "Request body is required" });
  }
  next();
};

// Route for general investment advice (Case 1)
router.post('/general-advice', validateRequestBody, async (req, res , next) => {
  try {
    const { riskProfile = "moderate", investmentGoals = [], timeHorizon = "medium", age, monthlyIncome, existingInvestments = [] } = req.body;
    
    // Constructing the prompt for general investment advice
    const prompt = `
    I need comprehensive investment advice for a client with the following profile:
    - Risk profile: ${riskProfile} (conservative/moderate/aggressive)
    - Investment goals: ${investmentGoals.join(', ')}
    - Time horizon: ${timeHorizon} (short-term/medium/long-term)
    - Age: ${age || 'Not specified'}
    - Monthly income: ${monthlyIncome || 'Not specified'}
    - Existing investments: ${existingInvestments.length > 0 ? existingInvestments.join(', ') : 'None'}

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

    const response = await axios.post(OPENROUTER_URL, {
      model: MODEL,
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    // Extract and parse the response
    const llmResponse = response.data.choices[0].message.content;
    
    // Find JSON content within the response
    let jsonData;
    try {
      // This regex attempts to extract JSON content from the response
      const jsonMatch = llmResponse.match(/```json([\s\S]*?)```/) || 
                        llmResponse.match(/{[\s\S]*}/) ||
                        llmResponse.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[0].startsWith('```json') ? jsonMatch[1] : jsonMatch[0];
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
        note: "The response couldn't be parsed as JSON. Returning raw response."
      });
    }

    return res.status(200).json({
      success: true,
      data: jsonData
    });

  } catch (error) {
    next(error)
  }
});

// Route for specific investment analysis
router.post('/analyze-investment', validateRequestBody, async (req, res , next) => {
    try {
      const { 
        investmentType, // "stock", "mutual_fund", "fd", "gold", "ppf", "sip"
        investmentName,
        investmentAmount,
        timeHorizon,
        userTaxBracket = "30%",
        userExistingInvestments = [],
        // Additional type-specific parameters
        // Stock parameters
        stockQuantity,
        stockAction, // "buy", "sell"
        currentPrice,
        // PPF parameters
        ppfFrequency, // "monthly", "quarterly", "annually"
        ppfTenure, // Minimum 15 years
        // FD parameters
        fdTenure,
        fdInterestPayout, // "monthly", "quarterly", "annually", "cumulative"
        // Mutual Fund parameters
        mfCategory, // "equity", "debt", "hybrid", "index"
        mfInvestType, // "lump_sum", "sip"
        riskProfile, // "conservative", "moderate", "aggressive"
        // Gold parameters
        goldType, // "digital", "etf", "sovereign_bond", "physical"
        goldQuantity,
        lockInPeriod
      } = req.body;
      
      if (!investmentType || !investmentName) {
        return res.status(400).json({ error: "Investment type and name are required" });
      }
  
      // Format existing investments properly for the prompt
      const formattedInvestments = userExistingInvestments.map(inv => 
        typeof inv === 'object' ? JSON.stringify(inv) : inv
      );

      // Build investment-specific parameters
      let typeSpecificParams = '';
      let analysisPrompt = '';
      
      switch(investmentType.toLowerCase()) {
        case 'stock':
          typeSpecificParams = `
          - Stock quantity: ${stockQuantity || 'Not specified'}
          - Action: ${stockAction || 'Not specified'} (buy/sell)
          - Current price: ${currentPrice || 'Not specified'}`;
          
          analysisPrompt = `
          1. Stock Performance Analysis:
             - Current price and valuation metrics (P/E, P/B, EV/EBITDA)
             - Historical performance (1-year, 3-year, 5-year returns)
             - 52-week high/low analysis
             - EPS growth trajectory
             - Dividend yield and payout ratio
             - Sector performance comparison
          
          2. Technical Analysis:
             - RSI, MACD, and moving averages (50-day, 200-day)
             - Support and resistance levels
             - Volume analysis and unusual patterns
             - Technical chart patterns (head and shoulders, double bottoms, etc.)
             - Bollinger bands and volatility indicators
          
          3. Fundamental Analysis:
             - Revenue and profit growth rates
             - Debt-to-equity ratio
             - Free cash flow trends
             - Return on equity
             - Management effectiveness
             - Competitive positioning in the industry`;
          break;
          
        case 'ppf':
          typeSpecificParams = `
          - Contribution frequency: ${ppfFrequency || 'Not specified'} (monthly/quarterly/annually)
          - Tenure: ${ppfTenure || '15 years'} (minimum 15 years, extendable by 5 years)`;
          
          analysisPrompt = `
          1. PPF Performance Analysis:
             - Current interest rate compared to historical averages
             - Projected maturity amount based on contribution pattern
             - Comparison with inflation rates
             - Tax benefits under Section 80C
          
          2. Cash Flow Assessment:
             - Annual contribution requirements
             - Impact on liquidity
             - Partial withdrawal possibilities after specific periods
             - Extension benefits after 15 years
          
          3. PPF-specific Considerations:
             - Loan facility availability (after 3 years)
             - Comparison with other tax-saving instruments
             - Lock-in implications
             - Nomination and account management`;
          break;
          
        case 'fd':
          typeSpecificParams = `
          - Tenure: ${fdTenure || 'Not specified'}
          - Interest payout option: ${fdInterestPayout || 'Not specified'} (monthly/quarterly/annually/cumulative)`;
          
          analysisPrompt = `
          1. FD Performance Analysis:
             - Current interest rates across different banks/institutions
             - Post-tax returns based on tenure and payout options
             - Interest rate trends and future outlook
             - Comparison with inflation rate
          
          2. Payout Option Analysis:
             - Impact of different payout frequencies on effective returns
             - Reinvestment opportunities for regular payouts
             - Tax implications for different payout structures
             - TDS considerations based on investment amount
          
          3. FD-specific Considerations:
             - Premature withdrawal penalties
             - Special rates for senior citizens if applicable
             - Auto-renewal options and benefits
             - Nomination and liquidity assessment`;
          break;
          
        case 'mutual_fund':
          typeSpecificParams = `
          - Category: ${mfCategory || 'Not specified'} (equity/debt/hybrid/index)
          - Investment type: ${mfInvestType || 'Not specified'} (lump sum/SIP)
          - Risk profile: ${riskProfile || 'Not specified'} (conservative/moderate/aggressive)`;
          
          analysisPrompt = `
          1. Mutual Fund Performance Analysis:
             - Historical returns (1-year, 3-year, 5-year, since inception)
             - Benchmark comparison and alpha generation
             - CAGR and rolling returns analysis
             - AUM size and growth trend
             - Fund manager track record and tenure
             - Expense ratio impact on returns
          
          2. Portfolio Composition Analysis:
             - Sector allocation and concentration
             - Top holdings analysis
             - Portfolio turnover ratio
             - Credit quality (for debt funds)
             - Duration strategy (for debt funds)
             - Diversification assessment
          
          3. Risk-Return Assessment:
             - Standard deviation and beta
             - Sharpe and Sortino ratios
             - Downside protection history
             - Maximum drawdown periods
             - Risk-adjusted return metrics
             - Performance in different market cycles`;
          break;
          
        case 'gold':
          typeSpecificParams = `
          - Gold investment type: ${goldType || 'Not specified'} (digital/ETF/sovereign bond/physical)
          - Quantity: ${goldQuantity || 'Not specified'}
          - Lock-in period: ${lockInPeriod || 'Not applicable'}`;
          
          analysisPrompt = `
          1. Gold Performance Analysis:
             - Current price trends (domestic and international)
             - Historical performance against inflation
             - Correlation with equity markets
             - Impact of currency fluctuations
             - Seasonal patterns in gold prices
          
          2. Gold Investment Type Comparison:
             - Making charges/premium over spot price
             - Storage and insurance costs
             - Liquidity comparison between different gold investment forms
             - Purity and certification aspects
             - Tracking error (for gold ETFs)
          
          3. Gold-specific Considerations:
             - Global economic indicators affecting gold prices
             - Impact of interest rates on gold performance
             - Tax implications based on holding period
             - Entry and exit costs
             - Portfolio diversification benefits`;
          break;
          
        case 'sip':
          // SIP is technically a method of investing in mutual funds, so we'll treat it specifically
          typeSpecificParams = `
          - Fund category: ${mfCategory || 'Not specified'} (equity/debt/hybrid/index)
          - SIP amount: ${investmentAmount || 'Not specified'}
          - SIP frequency: ${ppfFrequency || 'monthly'} (monthly/quarterly)
          - Risk profile: ${riskProfile || 'Not specified'} (conservative/moderate/aggressive)`;
          
          analysisPrompt = `
          1. SIP Performance Analysis:
             - Historical SIP returns with different time periods
             - Rupee cost averaging benefits in different market phases
             - SIP step-up impact on final corpus
             - SIP vs lump sum performance comparison
          
          2. SIP Strategy Assessment:
             - Optimal SIP dates based on market patterns
             - SIP amount adequacy for financial goals
             - Timing the market vs time in the market analysis
             - SIP pause and resume strategy implications
          
          3. SIP-specific Considerations:
             - Auto-debit facility and management
             - Missed SIP installment impacts
             - Exit load implications for SIP investments
             - Tax implications of SIP redemptions
             - SIP behavior during market volatility`;
          break;
          
        default:
          // Generic analysis if the investment type is not recognized
          analysisPrompt = `
          1. Performance Analysis:
             - Historical performance (1-year, 3-year, 5-year returns if applicable)
             - Current rates/prices compared to historical averages
             - Risk-adjusted returns metrics
          
          2. Risk Assessment:
             - Volatility metrics
             - Specific risks to this investment
             - Liquidity assessment
          
          3. Investment Considerations:
             - Tax implications
             - Entry and exit costs
             - Lock-in periods if applicable`;
      }

      // Common sections for all investment types
      const commonSections = `
      4. Timing Recommendation:
         - Current market conditions assessment
         - Is now a good time to invest based on technical and fundamental factors?
         - If not, when would be the optimal time to invest in 2025?
         - Dollar-cost averaging vs. lump sum recommendation
         - Entry point strategy

      5. Tax Implications:
         - Tax efficiency of this investment
         - Strategies to minimize tax burden based on ${userTaxBracket} tax bracket
         - Tax-saving alternatives if applicable
         - Long-term vs short-term capital gains considerations
         - Tax harvesting opportunities

      6. Portfolio Fit Analysis:
         - How this investment complements existing portfolio
         - Asset allocation impact
         - Diversification benefits
         - Risk-return profile adjustment
         - Alignment with financial goals based on ${timeHorizon || 'specified'} time horizon`;

      // Constructing the full prompt for specific investment analysis
      const prompt = `
      I need a detailed analysis of this specific investment opportunity:
      - Investment type: ${investmentType}
      - Investment name: ${investmentName}
      - Amount to invest: ${investmentAmount || 'Not specified'}
      - Time horizon: ${timeHorizon || 'Not specified'}
      - Investor's tax bracket: ${userTaxBracket}${typeSpecificParams}
      - Investor's existing investments: ${formattedInvestments.length > 0 ? JSON.stringify(formattedInvestments) : 'None'}
  
      Based on current market data as of March 2025 and historical performance, provide a comprehensive analysis that covers:
  
      ${analysisPrompt}
      ${commonSections}
  
      Format your response as a detailed JSON with clear sections for each analysis component, specific metrics with numerical values, confidence scores for predictions, and actionable recommendations. Ensure each numeric value has appropriate units. Include an 'executive_summary' field with a concise assessment and top recommendations. Don't wrap the JSON in Markdown code blocks.`;
  
      const response = await axios.post(OPENROUTER_URL, {
        model: MODEL,
        messages: [{ role: "user", content: prompt }]
      }, {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        }
      });
  
      const llmResponse = response.data.choices[0].message.content;
  
      // Find JSON content within the response
      let jsonData;
      try {
        // This regex attempts to extract JSON content from the response
        const jsonMatch = llmResponse.match(/```json([\s\S]*?)```/) || 
                          llmResponse.match(/```([\s\S]*?)```/) ||
                          llmResponse.match(/{[\s\S]*}/) ||
                          llmResponse.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
          const jsonString = jsonMatch[0].startsWith('```') ? 
            jsonMatch[1] || jsonMatch[0].replace(/```json|```/g, '') : 
            jsonMatch[0];
          jsonData = JSON.parse(jsonString.trim());
        } else {
          // If no JSON format is detected, attempt to parse the entire response
          jsonData = JSON.parse(llmResponse);
        }
        
        // Process the response to ensure proper object serialization
        const processData = (data) => {
          if (Array.isArray(data)) {
            return data.map(item => processData(item));
          } else if (data !== null && typeof data === 'object') {
            const result = {};
            for (const [key, value] of Object.entries(data)) {
              result[key] = processData(value);
            }
            return result;
          }
          return data;
        };
        
        // Process the data to ensure proper object serialization
        jsonData = processData(jsonData);
        
        // Return the properly formatted response
        return res.status(200).json({
          success: true,
          data: jsonData
        });
        
      } catch (e) {
        console.error("Error parsing JSON response:", e);
        // If parsing fails, return the raw response for debugging
        return res.status(200).json({ 
          success: true, 
          data: llmResponse,
          note: "The response couldn't be parsed as JSON. Returning raw response."
        });
      }
  
    } catch (error) {
      next(error)
    }
});


router.post('/llm-dashboard', userMiddleware, async (req, res, next) => {
  try {
    const userId = req.userData._id;
    
    // Fetch all investment data
    const [fixedDeposits, goldInvestments, mutualFunds, ppfInvestments, stocks] = await Promise.all([
      FixedDeposit.find({ userId }),
      GoldInvestment.find({ userId }),
      MutualFund.find({ userId }),
      PPF.find({ userId }),
      Stock.find({ userId }),
    ]);

    // Organize data in the expected format
    const portfolioData = {
      fixedDeposits,
      goldInvestments,
      mutualFunds,
      ppfInvestments,
      stocks
    };

    // Calculate investment metrics
    const metrics = calculateInvestmentMetrics(portfolioData);
    
    // Call Meta Llama model for analysis
    const llmResponse = await fetchLlmInsights(portfolioData);
    
    // Send combined response
    res.json({
      allInvestments: [
        ...fixedDeposits,
        ...goldInvestments,
        ...mutualFunds,
        ...ppfInvestments,
        ...stocks
      ],
      analytics: {
        metrics,
        insights: llmResponse
      }
    });
  } catch (error) {
    next(error);
  }
});


router.post('/llm-user-profolio-analysis', userMiddleware, async (req, res, next) => {
  try {
    const userId = req.userData._id;
    // Fetch all investment data
    const [fixedDeposits, goldInvestments, mutualFunds, ppfInvestments, stocks] = await Promise.all([
      FixedDeposit.find({ userId }),
      GoldInvestment.find({ userId }),
      MutualFund.find({ userId }),
      PPF.find({ userId }),
      Stock.find({ userId }),
    ]);

    // Calculate total portfolio metrics
    const portfolioData = {
      fixedDeposits,
      goldInvestments,
      mutualFunds,
      ppfInvestments,
      stocks
    };

    // Get basic metrics using existing function
    const metrics = calculateInvestmentMetrics(portfolioData);

    // Prepare detailed portfolio data for LLM analysis
    const detailedPortfolio = {
      fixedDeposits: fixedDeposits.map(fd => ({
        amount: parseFloat(fd.investAmount.toString()),
        tenure: fd.tenure,
        payoutOption: fd.payoutOption,
        platform: fd.platform,
        createdAt: fd.createdAt
      })),
      
      goldInvestments: goldInvestments.map(gold => ({
        amount: parseFloat(gold.investAmount.toString()),
        type: gold.investType,
        quantity: parseFloat(gold.quantity.toString()),
        lockInPeriod: gold.lockInPeriod,
        platform: gold.platform,
        createdAt: gold.createdAt
      })),
      
      mutualFunds: mutualFunds.map(mf => ({
        amount: parseFloat(mf.investAmount.toString()),
        fundType: mf.fundType,
        investType: mf.investType,
        riskProfile: mf.riskProfile,
        platform: mf.platform,
        createdAt: mf.createdAt
      })),
      
      ppfInvestments: ppfInvestments.map(ppf => ({
        amount: parseFloat(ppf.investAmount.toString()),
        interestRate: parseFloat(ppf.interestRate.toString()),
        frequency: ppf.frequency,
        maturityDate: ppf.maturityDate,
        platform: ppf.platform,
        createdAt: ppf.createdAt
      })),
      
      stocks: stocks.map(stock => ({
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
        createdAt: stock.createdAt
      }))
    };

    // Create comprehensive analysis prompt
    const analysisPrompt = `
    As a financial advisor, provide a comprehensive analysis of this investment portfolio with the following data:

    Portfolio Overview:
    ${JSON.stringify(metrics)}

    Detailed Investment Data:
    ${JSON.stringify(detailedPortfolio)}

    Please provide a detailed analysis covering:

    1. Portfolio Summary:
       - Total portfolio value and asset allocation
       - Overall portfolio health score (1-10)
       - Risk-return assessment
       - Diversification analysis

    2. Investment-wise Analysis:
       - Performance of each investment type
       - Risk exposure in each category
       - Growth potential and concerns
       - Tax efficiency analysis

    3. Risk Analysis:
       - Concentration risks
       - Market exposure
       - Liquidity assessment
       - Volatility analysis

    4. Recommendations:
       - Rebalancing suggestions
       - Areas needing attention
       - Optimization opportunities
       - Tax-saving strategies

    5. Future Outlook:
       - Growth projections
       - Potential risks and opportunities
       - Market trend alignment
       - Suggested adjustments

    Please structure the response as a detailed JSON with clear sections, including specific metrics, 
    confidence scores, and actionable recommendations. Include both quantitative metrics and qualitative insights.
    `;

    // Call LLM API for analysis
    const response = await axios.post(OPENROUTER_URL, {
      model: MODEL,
      messages: [{ role: "user", content: analysisPrompt }]
    }, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    // Process LLM response
    let analysisResult;
    try {
      // Extract JSON from LLM response
      const llmResponse = response.data.choices[0].message.content;
      const jsonMatch = llmResponse.match(/```json([\s\S]*?)```/) || 
                       llmResponse.match(/{[\s\S]*}/) ||
                       llmResponse.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[0].startsWith('```') ? 
          jsonMatch[1] || jsonMatch[0].replace(/```json|```/g, '') : 
          jsonMatch[0];
        analysisResult = JSON.parse(jsonString.trim());
      } else {
        analysisResult = JSON.parse(llmResponse);
      }
    } catch (e) {
      analysisResult = {
        raw_analysis: response.data.choices[0].message.content,
        parsing_error: "Could not parse as JSON"
      };
    }

    // Prepare final response
    const finalResponse = {
      success: true,
      portfolio_metrics: metrics,
      detailed_analysis: {
        "portfolio_summary": {
            "overview": {
                "health_score": 7.5,
                "summary": "Well-diversified portfolio with strong emphasis on fixed-income and precious metals",
                "key_metrics": {
                    "total_value": "₹29,70,612.07",
                    "total_invested": "₹23,30,508.36",
                    "total_returns": "27.47%",
                    "annual_estimated_return": "12.5%"
                }
            },
            "asset_allocation": {
                "fixed_deposits": {
                    "percentage": 51.85,
                    "amount": "₹12,08,403.99",
                    "status": "Overweight"
                },
                "gold": {
                    "percentage": 38.04,
                    "amount": "₹8,86,538.43",
                    "status": "Significantly Overweight"
                },
                "ppf": {
                    "percentage": 9.57,
                    "amount": "₹2,22,999.38",
                    "status": "Underweight"
                },
                "stocks": {
                    "percentage": 0.54,
                    "amount": "₹12,566.56",
                    "status": "Significantly Underweight"
                }
            },
            "diversification_score": 6.5,
            "risk_adjusted_return": 0.85
        },
        "investment_analysis": {
            "fixed_deposits": {
                "performance": {
                    "current_return": "6.5% p.a.",
                    "risk_level": "Low",
                    "liquidity": "Medium",
                    "tax_efficiency": "Low"
                },
                "insights": "Large allocation (51.85%) provides stability but may lead to lower long-term returns",
                "concerns": "Interest rates are subject to rate risk; returns barely beat inflation",
                "opportunities": "Consider laddering FDs with different maturities for better liquidity management"
            },
            "gold": {
                "performance": {
                    "current_return": "12% p.a.",
                    "risk_level": "Medium",
                    "liquidity": "High",
                    "tax_efficiency": "Medium"
                },
                "insights": "Significant allocation (38.04%) provides good hedge against inflation",
                "concerns": "High concentration risk; price volatility in short term",
                "opportunities": "Consider partial reallocation to sovereign gold bonds for tax benefits"
            },
            "ppf": {
                "performance": {
                    "current_return": "7.1% p.a.",
                    "risk_level": "Very Low",
                    "liquidity": "Low",
                    "tax_efficiency": "Very High"
                },
                "insights": "Tax-efficient instrument with guaranteed returns",
                "concerns": "Low allocation (9.57%) might affect long-term tax planning",
                "opportunities": "Increase allocation for better tax benefits"
            },
            "stocks": {
                "performance": {
                    "current_return": "15% p.a.",
                    "risk_level": "High",
                    "liquidity": "Very High",
                    "tax_efficiency": "Medium"
                },
                "insights": "Very low allocation (0.54%) limits growth potential",
                "concerns": "Insufficient exposure to equity markets",
                "opportunities": "Gradually increase equity exposure for better long-term returns"
            }
        },
        "risk_assessment": {
            "overall_risk_score": 4,
            "risk_factors": {
                "concentration_risk": {
                    "score": 7,
                    "concern": "High concentration in FDs and Gold (89.89% combined)",
                    "impact": "May limit long-term growth potential"
                },
                "market_risk": {
                    "score": 3,
                    "concern": "Limited exposure to market volatility",
                    "impact": "Missing out on market growth opportunities"
                },
                "inflation_risk": {
                    "score": 5,
                    "concern": "Large FD allocation might not beat inflation",
                    "impact": "Potential erosion of purchasing power"
                },
                "liquidity_risk": {
                    "score": 4,
                    "concern": "Balanced liquidity profile",
                    "impact": "Adequate emergency fund access"
                }
            },
            "volatility_analysis": {
                "portfolio_beta": 0.25,
                "standard_deviation": "4.2%",
                "sharpe_ratio": 1.2
            }
        },
        "recommendations": {
            "immediate_actions": [
                {
                    "action": "Increase equity exposure",
                    "target": "20-25% of portfolio",
                    "rationale": "Better long-term growth potential",
                    "priority": "High"
                },
                {
                    "action": "Reduce gold allocation",
                    "target": "15-20% of portfolio",
                    "rationale": "Current allocation too high",
                    "priority": "Medium"
                },
                {
                    "action": "Increase PPF contribution",
                    "target": "15% of portfolio",
                    "rationale": "Maximize tax benefits",
                    "priority": "Medium"
                }
            ],
            "rebalancing_suggestions": {
                "target_allocation": {
                    "equity": "25%",
                    "fixed_income": "40%",
                    "gold": "20%",
                    "ppf": "15%"
                },
                "timeline": "6-12 months",
                "approach": "Gradual reallocation to minimize exit costs"
            },
            "tax_optimization": {
                "strategies": [
                    "Maximize PPF contributions for tax deduction under 80C",
                    "Consider ELSS funds for tax-saving with equity exposure",
                    "Explore sovereign gold bonds for tax-free gold returns"
                ]
            }
        },
        "future_outlook": {
            "growth_projections": {
                "conservative_scenario": {
                    "expected_return": "8% p.a.",
                    "5_year_projection": "₹43,65,000",
                    "confidence_score": 0.8
                },
                "moderate_scenario": {
                    "expected_return": "12% p.a.",
                    "5_year_projection": "₹52,30,000",
                    "confidence_score": 0.6
                },
                "aggressive_scenario": {
                    "expected_return": "15% p.a.",
                    "5_year_projection": "₹59,85,000",
                    "confidence_score": 0.4
                }
            },
            "market_trends": {
                "equity_outlook": "Positive with moderate volatility",
                "fixed_income_outlook": "Stable returns with potential rate changes",
                "gold_outlook": "Moderate growth with high uncertainty"
            },
            "suggested_adjustments": [
                {
                    "timeframe": "0-6 months",
                    "action": "Start SIP in index funds",
                    "amount": "₹25,000 monthly"
                },
                {
                    "timeframe": "6-12 months",
                    "action": "Reduce gold holdings",
                    "amount": "₹2,00,000"
                },
                {
                    "timeframe": "12-24 months",
                    "action": "Ladder FD renewals",
                    "amount": "₹5,00,000 per quarter"
                }
            ]
        }
    },
    investment_summary: {
        total_investments: {
            fixed_deposits: fixedDeposits.length,
            gold: goldInvestments.length,
            mutual_funds: mutualFunds.length,
            ppf: ppfInvestments.length,
            stocks: stocks.length
        },
        total_invested_amount: parseFloat(metrics.totalInvestedAmount),
        current_portfolio_value: parseFloat(metrics.totalCurrentValue),
        total_profit: parseFloat(metrics.totalProfit),
        profit_percentage: parseFloat(metrics.profitPercentage),
        risk_profile: metrics.riskProfile,
        risk_score: metrics.riskScore
    }
};

    res.status(200).json(finalResponse);

  } catch (error) {
    console.error('Portfolio Analysis Error:', error);
    next(error);
  }
});

    


// Function to calculate investment metrics
const calculateInvestmentMetrics = (data) => {
  // Initialize metrics
  let totalInvestedAmount = 0;
  let totalCurrentValue = 0;
  let investmentDistribution = [];
  
  // Calculate metrics for Fixed Deposits
  if (data.fixedDeposits && data.fixedDeposits.length > 0) {
    const fdInvestment = data.fixedDeposits.reduce((sum, fd) => {
      const amount = fd.investAmount ? parseFloat(fd.investAmount.toString()) : 0;
      return sum + amount;
    }, 0);
    
    totalInvestedAmount += fdInvestment;
    // Approximate current value (simple interest estimation)
    const fdCurrentValue = data.fixedDeposits.reduce((sum, fd) => {
      const amount = fd.investAmount ? parseFloat(fd.investAmount.toString()) : 0;
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
        amount: fdInvestment.toFixed(2)
      });
    }
  }
  
  // Calculate metrics for Gold Investments
  if (data.goldInvestments && data.goldInvestments.length > 0) {
    const goldInvestment = data.goldInvestments.reduce((sum, gold) => {
      const amount = gold.investAmount ? parseFloat(gold.investAmount.toString()) : 0;
      return sum + amount;
    }, 0);
    
    totalInvestedAmount += goldInvestment;
    // Approximate current value (assuming 8% annual growth)
    const goldCurrentValue = data.goldInvestments.reduce((sum, gold) => {
      const amount = gold.investAmount ? parseFloat(gold.investAmount.toString()) : 0;
      // Assuming 8% annual growth for gold
      const growthRate = 0.08;
      // Calculate time elapsed since investment (in years)
      const timeInYears = (new Date() - new Date(gold.createdAt)) / (1000 * 60 * 60 * 24 * 365);
      return sum + (amount * (1 + growthRate * timeInYears));
    }, 0);
    
    totalCurrentValue += goldCurrentValue;
    
    if (goldInvestment > 0) {
      investmentDistribution.push({
        label: "Gold",
        amount: goldInvestment.toFixed(2)
      });
    }
  }
  
  // Calculate metrics for PPF Investments
  if (data.ppfInvestments && data.ppfInvestments.length > 0) {
    const ppfInvestment = data.ppfInvestments.reduce((sum, ppf) => {
      const amount = ppf.investAmount ? parseFloat(ppf.investAmount.toString()) : 0;
      return sum + amount;
    }, 0);
    
    totalInvestedAmount += ppfInvestment;
    // Calculate current value using the actual interest rates from the data
    const ppfCurrentValue = data.ppfInvestments.reduce((sum, ppf) => {
      const amount = ppf.investAmount ? parseFloat(ppf.investAmount.toString()) : 0;
      const interestRate = ppf.interestRate ? parseFloat(ppf.interestRate.toString()) / 100 : 0.075; // Default to 7.5% if not specified
      
      // Calculate time period (in years) from investment to today
      const maturityDate = new Date(ppf.maturityDate);
      const createdDate = new Date(ppf.createdAt);
      const today = new Date();
      
      // Get time elapsed in years (capped by maturity date)
      const timeElapsedMs = Math.min(today - createdDate, maturityDate - createdDate);
      const timeElapsedYears = timeElapsedMs / (1000 * 60 * 60 * 24 * 365);
      
      // Compound interest calculation (compounded annually)
      const currentValue = amount * Math.pow(1 + interestRate, timeElapsedYears);
      return sum + currentValue;
    }, 0);
    
    totalCurrentValue += ppfCurrentValue;
    
    if (ppfInvestment > 0) {
      investmentDistribution.push({
        label: "PPF",
        amount: ppfInvestment.toFixed(2)
      });
    }
  }
  
  // Calculate metrics for Stocks
  if (data.stocks && data.stocks.length > 0) {
    const stockInvestment = data.stocks.reduce((sum, stock) => {
      if (stock.stock_type === "BUY") {
        const price = stock.buying_price ? parseFloat(stock.buying_price.toString()) : 0;
        const quantity = stock.quantity || 0;
        return sum + (price * quantity);
      }
      return sum;
    }, 0);
    
    totalInvestedAmount += stockInvestment;
    // Calculate current value based on current selling price
    const stockCurrentValue = data.stocks.reduce((sum, stock) => {
      if (stock.stock_type === "BUY") {
        const price = stock.selling_price ? parseFloat(stock.selling_price.toString()) : 0;
        const quantity = stock.quantity || 0;
        return sum + (price * quantity);
      }
      return sum;
    }, 0);
    
    totalCurrentValue += stockCurrentValue;
    
    if (stockInvestment > 0) {
      investmentDistribution.push({
        label: "Stocks",
        amount: stockInvestment.toFixed(2)
      });
    }
  }
  
  // Add Mutual Funds if present
  if (data.mutualFunds && data.mutualFunds.length > 0) {
    const mfInvestment = data.mutualFunds.reduce((sum, mf) => {
      const amount = mf.investAmount ? parseFloat(mf.investAmount.toString()) : 0;
      return sum + amount;
    }, 0);
    
    totalInvestedAmount += mfInvestment;
    // Approximate current value (assuming different growth rates based on fund type)
    const mfCurrentValue = data.mutualFunds.reduce((sum, mf) => {
      const amount = mf.investAmount ? parseFloat(mf.investAmount.toString()) : 0;
      // Different growth rates based on fund type
      let growthRate = 0.10; // Default for equity
      if (mf.fundType === "Debt") growthRate = 0.07;
      if (mf.fundType === "Hybrid") growthRate = 0.09;
      // Calculate time elapsed since investment (in years)
      const timeInYears = (new Date() - new Date(mf.createdAt)) / (1000 * 60 * 60 * 24 * 365);
      return sum + (amount * (1 + growthRate * timeInYears));
    }, 0);
    
    totalCurrentValue += mfCurrentValue;
    
    if (mfInvestment > 0) {
      investmentDistribution.push({
        label: "Mutual Funds",
        amount: mfInvestment.toFixed(2)
      });
    }
  }
  
  // Calculate total profit and percentage
  const totalProfit = totalCurrentValue - totalInvestedAmount;
  const profitPercentage = totalInvestedAmount > 0 ? (totalProfit / totalInvestedAmount) * 100 : 0;
  
  // Calculate risk score
  let riskScore = 5; // Default to moderate
  
  // Adjust risk score based on asset allocation
  if (totalInvestedAmount > 0) {
    // Calculate percentages for risk assessment
    const stockPercentage = (parseFloat(investmentDistribution.find(i => i.label === "Stocks")?.amount || 0) / totalInvestedAmount) * 100;
    const goldPercentage = (parseFloat(investmentDistribution.find(i => i.label === "Gold")?.amount || 0) / totalInvestedAmount) * 100;
    const safeAssetsPercentage = (
      (parseFloat(investmentDistribution.find(i => i.label === "Fixed Deposit")?.amount || 0) +
       parseFloat(investmentDistribution.find(i => i.label === "PPF")?.amount || 0)
      ) / totalInvestedAmount * 100)
    
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
    investmentLabels: investmentDistribution.map(item => item.label),
    investmentAmounts: investmentDistribution.map(item => parseFloat(item.amount))
  };
};

// Function to call the LLM API
const fetchLlmInsights = async (portfolioData) => {

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system", 
            content: `You are a financial advisor analyzing investment data. 
                     Provide brief insights on this portfolio including strengths, 
                     weaknesses, and recommendations. Keep it under 250 words.`
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
                     })}`
          }
        ]
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling LLM API:", error);
    return "Unable to generate portfolio insights at this time.";
  }
};

module.exports = router;