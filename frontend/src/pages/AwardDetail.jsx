import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Paper,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import AxiosInstance from '../components/AxiosInstance';

const AwardDetail = () => {
  const [activeTab, setActiveTab] = useState(0); // Estado para controlar a aba ativa
  const [flightLegs, setFlightLegs] = useState([]); // Estado para armazenar as pernas do voo
  const theme = useTheme(); // Hook para acessar o tema atual (claro ou escuro)
  const location = useLocation(); // Hook para acessar o estado da navegação
  const { award } = location.state || {}; // Dados do prêmio passados no estado

  // Função para buscar as pernas do voo
  const fetchFlightLegs = async () => {
    if (!award) return; // Se não houver prêmio selecionado, não faz nada
    try {
      const response = await AxiosInstance.get(`/flight-legs/?award=${award.id}`); // Filtra pelo award_id
      setFlightLegs(response.data);
    } catch (error) {
      console.error('Erro ao buscar pernas do voo:', error);
    }
  };

  // Função para calcular a distância entre duas coordenadas
  const haversineDistance = (coords1, coords2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const [lat1, lon1] = coords1;
    const [lat2, lon2] = coords2;

    const R = 3440.065; // Raio da Terra em milhas náuticas
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Retorna a distância em milhas náuticas
  };

  // Função para buscar dados dos aeroportos e calcular distâncias
  const calculateDistances = async () => {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/mwgg/Airports/master/airports.json'
      );
      const airportsData = await response.json();

      const updatedFlightLegs = flightLegs.map((leg) => {
        const fromAirport = airportsData[leg.from_airport];
        const toAirport = airportsData[leg.to_airport];

        if (fromAirport && toAirport) {
          const fromCoords = [fromAirport.lat, fromAirport.lon];
          const toCoords = [toAirport.lat, toAirport.lon];
          const distance = Math.round(haversineDistance(fromCoords, toCoords));
          return { ...leg, distance: `${distance} NM` };
        } else {
          return { ...leg, distance: 'N/A' };
        }
      });

      setFlightLegs(updatedFlightLegs);
    } catch (error) {
      console.error('Erro ao buscar dados dos aeroportos:', error);
    }
  };

  // Efeito para buscar as pernas do voo quando o prêmio é carregado
  useEffect(() => {
    if (activeTab === 1) {
      // Busca as pernas apenas quando a aba "Leg Overview" está ativa
      fetchFlightLegs();
    }
  }, [activeTab, award]);

  // Efeito para calcular as distâncias quando as pernas do voo são carregadas
  useEffect(() => {
    if (flightLegs.length > 0) {
      calculateDistances();
    }
  }, [flightLegs]);

  // Função para mudar a aba ativa
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navbar com abas */}
      <Paper
        sx={{
          mb: 3,
          backgroundColor: theme.palette.background.paper, // Cor de fundo adaptável ao tema
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#2196F3', // Cor azul para a barra de indicador
            },
          }}
        >
          <Tab
            label="Description"
            sx={{
              color: theme.palette.text.primary, // Cor do texto adaptável ao tema
              '&.Mui-selected': {
                color: '#2196F3', // Cor azul para a aba selecionada
              },
            }}
          />
          <Tab
            label="Leg Overview"
            sx={{
              color: theme.palette.text.primary,
              '&.Mui-selected': {
                color: '#2196F3',
              },
            }}
          />
          <Tab
            label="Tour Status"
            sx={{
              color: theme.palette.text.primary,
              '&.Mui-selected': {
                color: '#2196F3',
              },
            }}
          />
          <Tab
            label="PIREP"
            sx={{
              color: theme.palette.text.primary,
              '&.Mui-selected': {
                color: '#2196F3',
              },
            }}
          />
        </Tabs>
      </Paper>

      {/* Conteúdo das seções */}
      <Box sx={{ p: 3 }}>
        {activeTab === 0 && (
          <Box id="description">
            <Typography variant="h4" gutterBottom>
              {award?.name || 'No Award Selected'}
            </Typography>
            {/* Exibe a imagem do prêmio */}
            {award?.link_image && (
              <Box
                component="img"
                src={award.link_image}
                alt={award.name}
                sx={{
                  width: '100%',
                  maxHeight: '300px',
                  objectFit: 'cover',
                  mb: 2,
                }}
              />
            )}
            {/* Exibe a descrição do prêmio */}
            <Typography paragraph>
              {award?.description || 'No description available.'}
            </Typography>
          </Box>
        )}

        {activeTab === 1 && (
          <Box id="leg-overview">
            <Typography variant="h4" gutterBottom>
              Leg Overview
            </Typography>
            <Typography paragraph>
              Aqui você verá uma visão geral das pernas do tour.
            </Typography>
            {/* Tabela de pernas do voo */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Departure</TableCell>
                    <TableCell>Destination</TableCell>
                    <TableCell>Distance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {flightLegs.map((leg, index) => (
                    <TableRow key={leg.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{leg.from_airport}</TableCell>
                      <TableCell>{leg.to_airport}</TableCell>
                      <TableCell>{leg.distance || 'Calculating...'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {activeTab === 2 && (
          <Box id="tour-status">
            <Typography variant="h4" gutterBottom>
              Tour Status
            </Typography>
            <Typography paragraph>
              Aqui você pode ver o status atual do tour.
            </Typography>
          </Box>
        )}

        {activeTab === 3 && (
          <Box id="pirep">
            <Typography variant="h4" gutterBottom>
              PIREP
            </Typography>
            <Typography paragraph>
              Aqui você pode enviar ou visualizar relatórios de voo (PIREPs).
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AwardDetail;