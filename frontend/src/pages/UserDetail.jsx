import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AxiosInstance from '../components/AxiosInstance';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, CardMedia } from '@mui/material';
import Gravatar from '../components/Gravatar';
import FlightIcon from '@mui/icons-material/Flight';
import PublicIcon from '@mui/icons-material/Public';

const UserDetail = () => {
  const { id } = useParams(); // Pega o ID do usuário da URL
  const [user, setUser] = useState(null);
  const [ifcData, setIfcData] = useState(null); // Dados do Infinite Flight
  const [userMetrics, setUserMetrics] = useState(null); // Dados das métricas do usuário
  const [loading, setLoading] = useState(true);
  const [userAwards, setUserAwards] = useState([]);
  const [awards, setAwards] = useState([]);

   // Buscar prêmios e prêmios do usuário
   useEffect(() => {
    const fetchData = async () => {
      try {
        const [awardsResponse, userAwardsResponse] = await Promise.all([
          AxiosInstance.get('/awards/'),
          AxiosInstance.get(`/user-awards/?user=${id}`)
        ]);
        
        setAwards(awardsResponse.data);
        setUserAwards(userAwardsResponse.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

    // Combinar os dados de prêmios com os dados do usuário
    const combinedAwards = userAwards.map((userAward) => {
      const awardData = awards.find((award) => award.id === userAward.award);
      return {
        id: userAward.id,
        name: awardData ? awardData.name : "Desconhecido",
        image: awardData ? awardData.link_image : "",
        progress: userAward.progress,
        end_date: userAward.end_date
      };
    });
  

  // Busca os dados do usuário
  useEffect(() => {
    AxiosInstance.get(`users/${id}/`)
      .then((res) => {
        setUser(res.data);
        fetchInfiniteFlightData(res.data.usernameIFC); // Busca dados do Infinite Flight
        fetchUserMetrics(res.data.id); // Busca as métricas do usuário
      })
      .catch((error) => {
        console.error('Erro ao buscar os dados do usuário:', error);
        setLoading(false);
      });
  }, [id]);

  // Busca os dados do Infinite Flight
  const fetchInfiniteFlightData = async (username) => {
    if (!username) {
      setLoading(false);
      return;
    }

    try {
      const params = { discourseNames: [username] };
      const headers = { 'Content-type': 'application/json', Accept: 'text/plain' };
      const url = 'https://api.infiniteflight.com/public/v2/user/stats?apikey=nvo8c790hfa9q3duho2jhgd2jf8tgwqw';

      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(params),
        headers,
      });

      const data = await response.json();
      if (data.errorCode === 0 && data.result.length > 0) {
        setIfcData(data.result[0]); // Armazena os dados do Infinite Flight
      }
    } catch (error) {
      console.error('Erro ao buscar dados do Infinite Flight:', error);
    } finally {
      setLoading(false);
    }
  };

  // Busca as métricas do usuário
  const fetchUserMetrics = async (userId) => {
    try {
      const response = await AxiosInstance.get(`user-metrics/${userId}/`);
      setUserMetrics(response.data); // Armazena as métricas do usuário
    } catch (error) {
      console.error('Erro ao buscar métricas do usuário:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Typography>Usuário não encontrado.</Typography>;
  }

  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      {/* Gravatar no centro */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Gravatar
          email={user.email}
          size={120}
          alt={`Imagem de perfil de ${user.first_name} ${user.last_name}`}
          style={{ borderRadius: '50%' }}
        />
      </Box>

      {/* Cards lado a lado */}
      <Grid container spacing={4} justifyContent="center">
        {/* Card do Sistema World Tour */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 2, position: 'relative', overflow: 'hidden', minHeight: '300px' }}>
            {/* Ícone de fundo */}
            <PublicIcon
              sx={{
                position: 'absolute',
                bottom: -20,
                right: -20,
                fontSize: 300,
                color: 'rgba(0, 0, 0, 0.1)',
              }}
            />
            <CardContent sx={{ textAlign: 'left', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Sistema World Tour
                </Typography>
                <Typography variant="body1">
                  Nome: {user.first_name} {user.last_name}
                </Typography>
                <Typography variant="body1">
                  País: <img
                    src={`https://flagcdn.com/w320/${user.country ? user.country.toLowerCase() : ''}.png`}
                    alt={user.country || 'País não informado'}
                    style={{ width: '24px', height: 'auto' }} // Ajusta o tamanho da bandeira
                  />
                </Typography>
                {userMetrics ? (
                  <>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      Total de Voos: {userMetrics.total_flights}
                    </Typography>
                    <Typography variant="body1">
                      Total de Horas: {userMetrics.total_flight_time}h
                    </Typography>
                    <Typography variant="body1">
                      Total de Voos (30 dias): {userMetrics.total_flights_last_30_days}
                    </Typography>
                    <Typography variant="body1">
                      Total de Horas (30 dias): {userMetrics.total_flight_time_last_30_days}h
                    </Typography>
                    <Typography variant="body1">
                      Média de Voos (30 dias): {userMetrics.average_flights_per_day.toFixed(2)} voos/dia
                    </Typography>
                    <Typography variant="body1">
                      Média de Horas (30 dias): {userMetrics.average_flight_time_per_day.toFixed(2)} horas/dia
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    Nenhuma métrica disponível.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card do Infinite Flight */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 2, position: 'relative', overflow: 'hidden', minHeight: '300px' }}>
            {/* Ícone de fundo */}
            <FlightIcon
              sx={{
                position: 'absolute',
                bottom: -20,
                right: -20,
                fontSize: 300,
                color: 'rgba(0, 0, 0, 0.1)',
              }}
            />
            <CardContent sx={{ textAlign: 'left', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Infinite Flight
                </Typography>
                {ifcData ? (
                  <>
                    <Typography variant="body1">
                      Voos Online: {ifcData.onlineFlights}
                    </Typography>
                    <Typography variant="body1">
                      XP: {ifcData.xp}
                    </Typography>
                    <Typography variant="body1">
                      Tempo de Voo: {ifcData.flightTime} minutos
                    </Typography>
                    <Typography variant="body1">
                      Nível: {ifcData.grade}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    Nenhum dado disponível.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Seção de Prêmios */}
      <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        Prêmios Conquistados
      </Typography>
      <Grid container spacing={2}>
        {combinedAwards.length > 0 ? (
          combinedAwards.map((award) => (
            <Grid item xs={12} sm={6} md={4} key={award.id}>
              <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={award.image}
                  alt={award.name}
                  sx={{ borderRadius: 2 }}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                    {award.name}
                  </Typography>
                  <Typography variant="body2">
                    Progresso: {award.progress}%
                  </Typography>
                  
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            Nenhum prêmio conquistado ainda.
          </Typography>
        )}
      </Grid>
    </Box>    </Box>
  );
};

export default UserDetail;