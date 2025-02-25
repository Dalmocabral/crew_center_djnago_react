import React from 'react';

// Função para calcular a distância entre dois pontos (Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const R = 6371; // Raio da Terra em km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 0.539957; // Converte km para milhas náuticas (nm)
};

const DistanceCalculator = ({ fromAirport, toAirport, airportsData }) => {
  if (!fromAirport || !toAirport || !airportsData[fromAirport] || !airportsData[toAirport]) {
    return 'N/A'; // Retorna 'N/A' se os aeroportos não forem encontrados
  }

  const from = airportsData[fromAirport];
  const to = airportsData[toAirport];

  const distance = calculateDistance(from.lat, from.lon, to.lat, to.lon);
  return `${distance.toFixed(0)} NM`; // Retorna a distância formatada
};

export default DistanceCalculator;