export const portfolioData = {
  totalInvestment: 41060587,
  totalProfit: 3702846,
  totalReturn: 9.9,
  exchangeRate: 1404.90,
  lastUpdated: '2025-10-03',
  
  holdings: [
    {
      symbol: 'VTI',
      name: 'Vanguard Total Stock Market ETF',
      shares: 21,
      currentValue: 9716627,
      returnRate: 18.3,
      profitLoss: 1509229,
      sector: '전체시장 ETF',
      region: 'US',
      type: 'ETF'
    },
    {
      symbol: 'SCHD',
      name: 'Schwab US Dividend Equity ETF',
      shares: 480,
      currentValue: 18516232,
      returnRate: 2.6,
      profitLoss: 486107,
      sector: '배당 ETF',
      region: 'US',
      type: 'ETF'
    },
    {
      symbol: 'QQMQ',
      name: 'Invesco NASDAQ 100 ETF',
      shares: 20,
      currentValue: 6997947,
      returnRate: 16.4,
      profitLoss: 989556,
      sector: '기술주 ETF',
      region: 'US',
      type: 'ETF'
    },
    {
      symbol: 'NEE',
      name: '넥스트에라 에너지',
      shares: 26,
      currentValue: 2863717,
      returnRate: 4.4,
      profitLoss: 122992,
      sector: '유틸리티',
      region: 'US',
      type: 'Stock'
    },
    {
      symbol: 'TSLA',
      name: '테슬라',
      shares: 3,
      currentValue: 1962661,
      returnRate: 49.3,
      profitLoss: 648922,
      sector: '기술주',
      region: 'US',
      type: 'Stock'
    },
    {
      symbol: 'TLT',
      name: 'iShares 20+ Year Treasury Bond ETF',
      shares: 8,
      currentValue: 1003400,
      returnRate: -5.1,
      profitLoss: -53962,
      sector: '채권',
      region: 'US',
      type: 'ETF'
    }
  ]
};

// 위험도 계산을 위한 가상 데이터 (실제로는 API에서 가져와야 함)
export const riskMetrics = {
  beta: 1.15,
  sharpeRatio: 1.23,
  var95: -2.8,
  maxDrawdown: -12.5,
  volatility: 18.2,
  correlation: {
    'VTI-SCHD': 0.85,
    'VTI-QQMQ': 0.92,
    'SCHD-QQMQ': 0.78,
    'TSLA-VTI': 0.65
  }
};

export const benchmarkData = {
  SP500: { return: 8.2, volatility: 16.5 },
  KOSPI: { return: 5.8, volatility: 22.1 }
};
