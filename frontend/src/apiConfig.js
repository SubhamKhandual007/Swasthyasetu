const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:2001';

console.log("Health Check: API_BASE_URL holds ->", API_BASE_URL);

export default API_BASE_URL;
