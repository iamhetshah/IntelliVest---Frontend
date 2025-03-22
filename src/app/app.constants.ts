const baseUrl = 'http://192.168.58.245:9090/api';
const backendApis = {
  auth: {
    login: `${baseUrl}/login`,
    verify_token: `${baseUrl}/verify_token`,
    register: `${baseUrl}/register`,
  },
};

export default backendApis;
