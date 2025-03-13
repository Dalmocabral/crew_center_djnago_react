import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import videoFile from "../assets/videos/video.mp4";
import './Home.css'; // Importando o CSS

const Home = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("token"); // Verifica se o usuário está logado

  const handleLoginClick = (e) => {
    e.preventDefault(); // Previne o comportamento padrão do link
    if (isAuthenticated) {
      navigate("/app/dashboard"); // Redireciona para o Dashboard se estiver logado
    } else {
      navigate("/login"); // Caso contrário, vai para a página de Login
    }
  };

  return (
    <div className="home">
      <nav className="navbar">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/register">Sign Up</Link></li>
          <li>
            <a href="/login" onClick={handleLoginClick} style={{ color: 'white', textDecoration: 'none' }}>
              Login
            </a>
          </li>
        </ul>
      </nav>
      <div className="video-background">
        <video autoPlay loop muted className="video">
          <source src={videoFile} type="video/mp4" />
          Seu navegador não suporta vídeo.
        </video>
      </div>
      <div className="content">
        <h1>Infinite World Tour</h1>
        <p>
          Bem-vindo ao <strong>Infinite World Tour System</strong>, o seu portal para explorar o mundo virtual da aviação no simulador <strong>Infinite Flight</strong>!
       
          Aqui, você encontrará uma experiência única, repleta de desafios emocionantes, prêmios incríveis e a oportunidade de se conectar com uma comunidade global de pilotos virtuais. Prepare-se para decolar em uma jornada épica, onde cada voo conta e cada conquista é celebrada!
        </p>
      </div>
    </div>
  );
}

export default Home;