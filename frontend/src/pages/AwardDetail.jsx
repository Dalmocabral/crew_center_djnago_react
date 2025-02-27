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
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import AxiosInstance from '../components/AxiosInstance';
import FlightMap from '../components/FlightMap'; // Importe o componente FlightMap
import DistanceCalculator from '../components/DistanceCalculator'; // Importe o componente DistanceCalculator

const AwardDetail = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [flightLegs, setFlightLegs] = useState([]);
  const [airportsData, setAirportsData] = useState({});
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
            <Typography variant="h4" gutterBottom align="center">
  Leg Overview
</Typography>
<Typography paragraph align="center">
  Here you will see an overview of the tour legs.
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
                      <TableCell>
                        <DistanceCalculator
                          fromAirport={leg.from_airport}
                          toAirport={leg.to_airport}
                          airportsData={airportsData}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            navigate('/app/pirepsflights', { state: { leg } });
                          }}
                          disabled={leg.pirep_status === 'Approved'}
                        >
                          {leg.pirep_status === 'Approved' ? 'Approved' : 'File PIREP'}
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
            <Typography variant="h4" gutterBottom align="center">
  Tour Status
</Typography>
<Typography paragraph align="center">
  Here you can see the current status of the tour.
</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Mapa */}
              <Box sx={{ flex: 2, height: '500px' }}>
                <FlightMap flightLegs={flightLegs} airportsData={airportsData} />
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