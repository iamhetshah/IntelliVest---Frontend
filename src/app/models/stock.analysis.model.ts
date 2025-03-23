export interface InvestmentAmount {
  $numberDecimal: string;
}

export interface FixedDeposit {
  _id: string;
  platform: string;
  userId: string;
  investAmount: InvestmentAmount;
  tenure: number;
  payoutOption: string;
  investment_type: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GoldInvestment {
  _id: string;
  platform: string;
  userId: string;
  investType: string;
  investAmount: InvestmentAmount;
  quantity: InvestmentAmount;
  lockInPeriod: number;
  investment_type: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PPFInvestment {
  _id: string;
  platform: string;
  userId: string;
  investAmount: InvestmentAmount;
  frequency: string;
  interestRate: InvestmentAmount;
  maturityDate: string;
  investment_type: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Stock {
  _id: string;
  platform: string;
  stock_name: string;
  buying_price: InvestmentAmount;
  selling_price: InvestmentAmount;
  quantity: number;
  stock_tax: InvestmentAmount;
  pe_ratio: InvestmentAmount;
  volume: number;
  eps: InvestmentAmount;
  stock_type: string;
  market_cap: InvestmentAmount;
  userId: string;
  investment_type: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Portfolio {
  fixedDeposits: FixedDeposit[];
  goldInvestments: GoldInvestment[];
  mutualFunds: any[];
  ppfInvestments: PPFInvestment[];
  stocks: Stock[];
}

export interface InvestmentDistribution {
  label: string;
  amount: string;
}

export interface Metrics {
  totalInvestedAmount: string;
  totalCurrentValue: string;
  totalProfit: string;
  profitPercentage: string;
  riskScore: number;
  riskProfile: string;
  investmentDistribution: InvestmentDistribution[];
  investmentLabels: string[];
  investmentAmounts: number[];
}

export interface PortfolioSummary {
  total_investments: number;
  total_value: string;
  total_profit: string;
  profit_percentage: string;
  risk_profile: string;
  risk_score: number;
}

export interface AssetDistribution {
  fixed_deposits: {
    count: number;
    total_amount: string;
    percentage: number;
  };
  gold: {
    count: number;
    total_amount: string;
    percentage: number;
  };
  mutual_funds: {
    count: number;
    total_amount: string;
    percentage: number;
  };
  ppf: {
    count: number;
    total_amount: string;
    percentage: number;
  };
  stocks: {
    count: number;
    total_amount: string;
    percentage: number;
  };
}

export interface Insights {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface Analysis {
  portfolio_summary: PortfolioSummary;
  asset_distribution: AssetDistribution;
  insights: Insights;
}

export interface PortfolioResponse {
  success: boolean;
  data: {
    portfolio: Portfolio;
    metrics: Metrics;
    analysis: Analysis;
  };
}
