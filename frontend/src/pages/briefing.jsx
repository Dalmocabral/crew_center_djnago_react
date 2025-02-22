import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import AxiosInstance from '../components/AxiosInstance';
import { Container, Grid, Card, CardContent, Typography, Divider, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Briefing = () => {
  const { id } = useParams(); // Captura o ID do voo da URL
  const [flightData, setFlightData] = useState(null); // Estado para armazenar os dados do voo
  const mapContainer = useRef(null); // Referência para o contêiner do mapa
  const map = useRef(null); // Referência para a instância do mapa

  // Busca os detalhes do voo ao carregar o componente
  useEffect(() => {
    const fetchFlightDetails = async () => {
      try {
        const response = await AxiosInstance.get(`/pirepsflight/${id}/`);
        setFlightData(response.data);
      } catch (error) {
        console.error('Erro ao buscar detalhes do voo:', error);
      }
    };

    fetchFlightDetails();
  }, [id]);

  useEffect(() => {
    if (flightData && !map.current) {
      // Inicializa o mapa
      map.current = L.map(mapContainer.current).setView([-12.163200486951586, -53.51511964322111], 8);

      // Adiciona a camada de tiles (MapTiler)
      L.tileLayer('https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=oLMznTPIDCPrc3mGZdoh', {
        attribution: '© <a href="https://www.maptiler.com/">MapTiler</a> © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }).addTo(map.current);

      // Busca os dados dos aeroportos
      const fetchAirports = async () => {
        const response = await fetch('https://raw.githubusercontent.com/mwgg/Airports/master/airports.json');
        return await response.json();
      };

      // Adiciona marcadores e polilinhas após o mapa carregar
      fetchAirports().then((airportsData) => {
        // Obtém os dados dos aeroportos de partida, chegada e alternativo
        const depAirport = airportsData[flightData.departure_airport];
        const arrAirport = airportsData[flightData.arrival_airport];
        const altAirport = airportsData[flightData.alternate_airport];

        // Adiciona marcadores e popups
        if (depAirport) {
          L.marker([depAirport.lat, depAirport.lon])
            .addTo(map.current)
            .bindPopup(`<strong>${depAirport.icao}</strong>`);
        }

        if (arrAirport) {
          L.marker([arrAirport.lat, arrAirport.lon])
            .addTo(map.current)
            .bindPopup(`<strong>${arrAirport.icao}</strong>`);
        }

        if (altAirport) {
          L.marker([altAirport.lat, altAirport.lon])
            .addTo(map.current)
            .bindPopup(`<strong>${altAirport.icao}</strong>`);
        }

        // Desenha a linha entre os aeroportos de partida e chegada
        if (depAirport && arrAirport) {
          const latLngs = [
            [depAirport.lat, depAirport.lon],
            [arrAirport.lat, arrAirport.lon],
          ];
          L.polyline(latLngs, { color: '#000' }).addTo(map.current);

          // Calcula a distância entre os aeroportos
          const distance = calculateDistance(depAirport.lat, depAirport.lon, arrAirport.lat, arrAirport.lon);
          console.log(distance);
          document.getElementById('distance').innerText = `${distance.toFixed(0)} nm`;
        }

        // Ajusta o zoom e o centro do mapa para incluir todos os aeroportos
        if (depAirport && arrAirport) {
          const bounds = L.latLngBounds(
            [depAirport.lat, depAirport.lon],
            [arrAirport.lat, arrAirport.lon]
          );
          if (altAirport) bounds.extend([altAirport.lat, altAirport.lon]);
          map.current.fitBounds(bounds, { padding: [50, 50] });
        }
      });
    }

    // Limpeza ao desmontar o componente
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [flightData]);

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

  if (!flightData) {
    return <Typography>Carregando...</Typography>; // Exibe uma mensagem de carregamento enquanto os dados são buscados
  }

  return (
    <Container maxWidth="xl" style={{ padding: '20px', height: '100vh' }}>
      <Grid container spacing={3} style={{ height: '100%' }}>
        {/* Coluna de Informações com Barra de Rolagem */}
        <Grid item xs={12} md={6} style={{ height: '100%', overflow: 'auto' }}>
          <Card style={{ backgroundColor: '#292b30', color: '#fff', marginBottom: '20px' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body1">
                  <i className="fa-solid fa-circle-info"></i> Este briefing foi gerado em: {flightData.registration_date}
                </Typography>
                <IconButton size="small" style={{ color: '#fff' }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>

          <Card style={{ marginBottom: '20px' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Informações de voo
              </Typography>
              <Divider style={{ marginBottom: '20px' }} />

              {/* Primeira linha de informações */}
              <Box display="flex" justifyContent="space-between" marginBottom="20px">
                <Box textAlign="center">
                  <Typography variant="subtitle1">Número de voo</Typography>
                  <Typography variant="body1">{flightData.flight_number || '--- / ---'}</Typography>
                  <Divider />
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Indicativo</Typography>
                  <Typography variant="body1">{flightData.flight_icao || '--- / ---'}</Typography>
                  <Divider />
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Partida</Typography>
                  <Typography variant="body1">{flightData.departure_airport || '--- / ---'}</Typography>
                  <Divider />
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Chegada</Typography>
                  <Typography variant="body1">{flightData.arrival_airport || '--- / ---'}</Typography>
                  <Divider />
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Alternar</Typography>
                  <Typography variant="body1">{flightData.alternate_airport || '--- / ---'}</Typography>
                  <Divider />
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Aeronave</Typography>
                  <Typography variant="body1">{flightData.aircraft || '--- / ---'}</Typography>
                  <Divider />
                </Box>
              </Box>

              {/* Segunda linha de informações */}
              <Box display="flex" justifyContent="space-between">
                <Box textAlign="center">
                  <Typography variant="subtitle1">Data de partida</Typography>
                  <Typography variant="body1">
                    {new Date(flightData.registration_date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Horário Dep</Typography>
                  <Typography variant="body1">--- / ---</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Tempo Arr</Typography>
                  <Typography variant="body1">--- / ---</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Distância da rota</Typography>
                  <Typography variant="body1" id="distance">
                    {/* Distância calculada aqui */}
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Cruzeiro</Typography>
                  <Typography variant="body1">--- / ---</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="subtitle1">Status</Typography>
                  <Typography variant="body1">{flightData.status}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card style={{ marginBottom: '20px' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Rota
              </Typography>
              <Divider style={{ marginBottom: '20px' }} />
              <Box style={{ backgroundColor: '#ccc', height: '100px', padding: '20px' }}>
                {/* Conteúdo da rota aqui */}
              </Box>
            </CardContent>
          </Card>

          <Card style={{ marginBottom: '20px' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Observações de Despacho
              </Typography>
              <Divider style={{ marginBottom: '20px' }} />
              <Box style={{ backgroundColor: '#ccc', height: '100px', padding: '20px' }}>
                {/* Conteúdo das observações aqui */}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Coluna do Mapa Fixo */}
        <Grid item xs={12} md={6} style={{ height: '100%' }}>
          <Card style={{ height: '90%', display: 'flex', flexDirection: 'column' }}>
            <CardContent style={{ flex: 1, padding: 0 }}>
              <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Briefing;