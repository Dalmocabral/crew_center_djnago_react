import axios from 'axios';

const AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // URL do seu backend Django
});

// Adiciona o token ao cabeçalho de todas as requisições
AxiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default AxiosInstance;