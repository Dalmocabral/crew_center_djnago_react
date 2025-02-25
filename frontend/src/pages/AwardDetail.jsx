import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Button,
} from '@mui/material';
import AxiosInstance from '../components/AxiosInstance';

const AwardDetail = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [flightLegs, setFlightLegs] = useState([]);
  const theme = useTheme();
  const location = useLocation();
  const { award } = location.state || {};
  const navigate = useNavigate();

  // Função para buscar as pernas do voo
  const fetchFlightLegs = async () => {
    if (!award) return;
    try {
      const response = await AxiosInstance.get(`/flight-legs/?award=${award.id}`);
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
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#2196F3',
            },
          }}
        >
          <Tab
            label="Description"
            sx={{
              color: theme.palette.text.primary,
              '&.Mui-selected': {
                color: '#2196F3',
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
        </Tabs>
      </Paper>

      {/* Conteúdo das seções */}
      <Box sx={{ p: 3 }}>
        {activeTab === 0 && (
          <Box id="description">
            <Typography variant="h4" gutterBottom>
              {award?.name || 'No Award Selected'}
            </Typography>
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
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Departure</TableCell>
                    <TableCell>Destination</TableCell>
                    <TableCell>Distance</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {flightLegs.map((leg, index) => (
                    <TableRow key={leg.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{leg.from_airport}</TableCell>
                      <TableCell>{leg.to_airport}</TableCell>
                      <TableCell>{leg.distance || 'Calculating...'}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            navigate('/app/pirepsflights', { state: { leg } });
                          }}
                          disabled={leg.pirep_status === 'Approved'} // Desabilita o botão se o status for "Approved"
                        >
                          {leg.pirep_status === 'Approved' ? 'Aprovado' : 'Registrar Voo'}
                        </Button>
                      </TableCell>
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
      </Box>
    </Box>
  );
};

export default AwardDetail;