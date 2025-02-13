import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoutes = () => {
  const token = localStorage.getItem('token'); // Certifique-se de que a chave está correta
  return token ? <Outlet /> : <Navigate to="/login" />; // Redireciona para /login se não houver token
};

export default ProtectedRoutes;