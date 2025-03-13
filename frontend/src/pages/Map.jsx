import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-rotatedmarker"; // Certifique-se de instalar esta biblioteca
import ApiService from "../components/ApiService"; // Ajuste o caminho conforme necessário
import airplaneUserIcon from "../assets/image/airplane_user.png"; // Caminho da imagem do avião

const sessions = {
  training: { id: "9ed5512e-b6eb-401f-bab8-42bdbdcf2bab", name: "Training Server" },
  casual: { id: "7e4681bf-9fee-4c68-ba62-eda1f2f0e780", name: "Casual Server" },
  expert: { id: "9bdfef34-f03b-4413-b8fa-c29949bb18f8", name: "Expert Server" },
};

const MapWithFlights = ({ darkMode }) => {
  const [selectedSession, setSelectedSession] = useState(sessions.training.id);
  const [flights, setFlights] = useState([]);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersLayer = useRef(null);
  const tileLayer = useRef(null); // Referência para a camada de tiles

  // Inicializa o mapa
  useEffect(() => {
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([-12.1632, -53.5151], 3);

      // Adiciona a camada de tiles inicial (claro ou escuro)
      tileLayer.current = L.tileLayer(
        darkMode
          ? "https://api.maptiler.com/maps/dark-v2/{z}/{x}/{y}.png?key=oLMznTPIDCPrc3mGZdoh" // Tema escuro
          : "https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=oLMznTPIDCPrc3mGZdoh", // Tema claro
        {
          attribution: '© <a href="https://www.maptiler.com/">MapTiler</a> © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        }
      ).addTo(map.current);

      markersLayer.current = L.layerGroup().addTo(map.current);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [darkMode]);

  // Atualiza os dados dos voos a cada 10 segundos
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const data = await ApiService.getFlightData(selectedSession);
        setFlights(data);
      } catch (error) {
        console.error("Error fetching flight data:", error);
      }
    };

    fetchFlights(); // Busca os dados imediatamente ao carregar ou mudar a sessão

    const interval = setInterval(fetchFlights, 10000); // Atualiza os dados a cada 10 segundos

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, [selectedSession]);

  // Atualiza os marcadores no mapa quando os dados dos voos mudam
  useEffect(() => {
    if (!map.current || !markersLayer.current) return;

    markersLayer.current.clearLayers(); // Limpa os marcadores antigos

    flights.forEach((flight) => {
      if (!flight.latitude || !flight.longitude || flight.heading === undefined) return;

      const marker = createRotatedMarker(flight);
      marker.addTo(markersLayer.current);
    });
  }, [flights]);

  // Função para criar um marcador rotacionado
  const createRotatedMarker = (flight) => {
    const airplaneIcon = L.icon({
      iconUrl: airplaneUserIcon,
      iconSize: [32, 32],
      iconAnchor: [16, 16], // Centro do ícone para rotação correta
      popupAnchor: [0, -16],
    });

    const marker = L.marker([flight.latitude, flight.longitude], {
      icon: airplaneIcon,
      rotationAngle: flight.heading, // Define o ângulo de rotação baseado no heading
      rotationOrigin: "center",
    }).bindPopup(`
      <b>${flight.username}</b><br>
      Callsign: ${flight.callsign}<br>
      Altitude: ${flight.altitude.toFixed(2)} ft
    `);

    return marker;
  };

  // Atualiza o tema do mapa quando o dark mode muda
  useEffect(() => {
    if (!map.current || !tileLayer.current) return;

    // Remove a camada de tiles atual
    tileLayer.current.remove();

    // Adiciona a nova camada de tiles com base no tema
    tileLayer.current = L.tileLayer(
      darkMode
        ? "https://api.maptiler.com/maps/dark-v2/{z}/{x}/{y}.png?key=oLMznTPIDCPrc3mGZdoh" // Tema escuro
        : "https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=oLMznTPIDCPrc3mGZdoh", // Tema claro
      {
        attribution: '© <a href="https://www.maptiler.com/">MapTiler</a> © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }
    ).addTo(map.current);
  }, [darkMode]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "absolute", top: 0, left: 0 }}>
      {/* Dropdown para selecionar a sessão */}
      <select
        value={selectedSession}
        onChange={(e) => setSelectedSession(e.target.value)}
        style={{
          position: "absolute",
          top: "13%", // Centraliza verticalmente
          left: "18%", // Centraliza horizontalmente
          transform: "translate(-50%, -50%)", // Ajusta para ficar no centro exato
          zIndex: 1050, // Garante que fique acima do mapa
          backgroundColor: darkMode ? "#333" : "white", // Cor de fundo baseada no tema
          color: darkMode ? "white" : "black", // Cor do texto baseada no tema
          padding: "10px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Adiciona uma sombra para melhor visibilidade
        }}
      >
        {Object.entries(sessions).map(([key, session]) => (
          <option key={key} value={session.id}>
            {session.name}
          </option>
        ))}
      </select>

      {/* Contêiner do mapa */}
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default MapWithFlights;