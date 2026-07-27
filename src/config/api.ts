import axios from 'axios';

const API_BASE_URL = 'https://nutrifit-backend-api-t21p.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;