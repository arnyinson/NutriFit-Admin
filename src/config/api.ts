import axios from 'axios';

// Parehong IP address na ginamit natin sa mobile app
const API_BASE_URL = 'http://192.168.254.107:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;