import axios from 'axios';

const baseURL = 'http://127.0.0.1:8000/'; // Certifique-se de que esta URL está correta

const AxiosInstance = axios.create({
  baseURL: baseURL, // Corrigido para baseURL
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default AxiosInstance;