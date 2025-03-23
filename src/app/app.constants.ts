const baseUrl = 'http://192.168.58.88:9090/api';
const backendApis = {
  auth: {
    login: `${baseUrl}/login`,
    verify_token: `${baseUrl}/verify_token`,
    register: `${baseUrl}/register`,
  },
  portfolio: `${baseUrl}/v1/llm-dashboard`,
  analysis: {
    stock: `${baseUrl}/v1/analyze-investment`,
  },
  charts: {
    pie: `${baseUrl}/pie-chart`,
    bar: `${baseUrl}/bar-chart`,
  },
  dashboard: {
    table: `${baseUrl}/user-investment`,
    cards: `${baseUrl}/dashboard`,
  },
  stocks: {
    allStocks: `${baseUrl}/stock/dropdown`,
  },
};

export default backendApis;
