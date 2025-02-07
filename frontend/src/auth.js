// src/auth.js

// Verifica se o usuário está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem('token'); // Verifica se há um token no localStorage
  return !!token; // Retorna true se o token existir, caso contrário, false
};

// Faz logout do usuário
export const logout = () => {
  localStorage.removeItem('token'); // Remove o token do localStorage
  window.location.href = '/login'; // Redireciona para a página de login
};