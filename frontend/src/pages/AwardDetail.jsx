import React, { useState, useEffect, useRef } from 'react';
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
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import AxiosInstance from '../components/AxiosInstance';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ícones personalizados para o Leaflet
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const AwardDetail = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [flightLegs, setFlightLegs] = useState([]);
  const [airportsData, setAirportsData] = useState({});
  const theme = useTheme();
  const location = useLocation();
  const { award } = location.state || {};
  const navigate = useNavigate();
  const mapContainer = useRef(null); // Referência para o contêiner do mapa
  const map = useRef(null); // Referência para a instância do mapa

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

  // Função para buscar os dados dos aeroportos
  const fetchAirports = async () => {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/mwgg/Airports/master/airports.json'
      );
      const data = await response.json();
      setAirportsData(data);
    } catch (error) {
      console.error('Erro ao buscar dados dos aeroportos:', error);
    }
  };

  // Efeito para buscar as pernas do voo quando o prêmio é carregado
  useEffect(() => {
    if (activeTab === 1 || activeTab === 2) {
      fetchFlightLegs();
    }
  }, [activeTab, award]);

  // Efeito para buscar os dados dos aeroportos
  useEffect(() => {
    fetchAirports();
  }, []);

  // Efeito para inicializar o mapa
  useEffect(() => {
    if (activeTab === 2 && flightLegs.length > 0 && !map.current) {
      // Inicializa o mapa
      map.current = L.map(mapContainer.current).setView([0, 0], 2);

      // Adiciona a camada de tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map.current);

      // Adiciona marcadores e polylines
      flightLegs.forEach((leg) => {
        const fromAirport = airportsData[leg.from_airport];
        const toAirport = airportsData[leg.to_airport];

        if (fromAirport && toAirport) {
          // Adiciona marcadores
          L.marker([fromAirport.lat, fromAirport.lon], { icon })
            .addTo(map.current)
            .bindPopup(`<strong>${fromAirport.icao}</strong>`);

          L.marker([toAirport.lat, toAirport.lon], { icon })
            .addTo(map.current)
            .bindPopup(`<strong>${toAirport.icao}</strong>`);

          // Adiciona polyline
          L.polyline(
            [
              [fromAirport.lat, fromAirport.lon],
              [toAirport.lat, toAirport.lon],
            ],
            { color: leg.pirep_status === 'Approved' ? 'green' : 'black' }
          ).addTo(map.current);
        }
      });

      // Ajusta o zoom e o centro do mapa para incluir todos os marcadores
      const bounds = L.latLngBounds(
        flightLegs
          .map((leg) => {
            const fromAirport = airportsData[leg.from_airport];
            const toAirport = airportsData[leg.to_airport];
            return [
              [fromAirport?.lat, fromAirport?.lon],
              [toAirport?.lat, toAirport?.lon],
            ];
          })
          .flat()
      );
      map.current.fitBounds(bounds, { padding: [50, 50] });
    }

    // Limpeza ao desmontar o componente ou mudar de aba
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [activeTab, flightLegs, airportsData]);

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
          <Tab label="Description" />
          <Tab label="Leg Overview" />
          <Tab label="Tour Status" />
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
                          disabled={leg.pirep_status === 'Approved'}
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Mapa */}
              <Box sx={{ flex: 2, height: '500px' }}>
                <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
              </Box>

              {/* Lista de pernas */}
              <Box sx={{ flex: 1 }}>
                <List>
                  {flightLegs.map((leg, index) => (
                    <ListItem
                      key={leg.id}
                      sx={{
                        backgroundColor:
                          leg.pirep_status === 'Approved' ? theme.palette.success.light : 'inherit',
                        mb: 1,
                        borderRadius: 1,
                      }}
                    >
                      <ListItemText
                        primary={`Leg ${index + 1}: ${leg.from_airport} → ${leg.to_airport}`}
                        secondary={`Status: ${leg.pirep_status || 'Pendente'}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AwardDetail;