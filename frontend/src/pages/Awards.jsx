import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Button, Grid, Typography, Container } from '@mui/material';
import AxiosInstance from '../components/AxiosInstance';

const Awards = () => {
  const [awards, setAwards] = React.useState([]); // Estado para armazenar os prêmios
  const navigate = useNavigate(); // Hook para navegação

  // Função para buscar os prêmios da API
  const fetchAwards = async () => {
    try {
      const response = await AxiosInstance.get('/awards/'); // Faz a requisição GET
      setAwards(response.data); // Atualiza o estado com os dados recebidos
    } catch (error) {
      console.error('Erro ao buscar prêmios:', error);
    }
  };

  // Efeito para buscar os prêmios quando o componente é montado
  React.useEffect(() => {
    fetchAwards();
  }, []);

  // Função para navegar para a página de detalhes de um prêmio
  const handleDetailsClick = (award) => {
    navigate(`/app/awards/awardDetail/${award.id}`, { state: { award } }); // Passa os dados do prêmio
  };

  return (
    <Container>
      <Typography variant="h3" gutterBottom 
      sx={{ textAlign: "center" }}
      >
       List World Tour
      </Typography>
      <Typography paragraph sx={{ textAlign: "center" }}>
      Here you can see all the available World Tours.
      </Typography>
      <Grid container spacing={3}>
        {awards.map((award) => (
          <Grid item key={award.id} xs={9} sm={6} md={4}>
            <Card>
              {/* Exibe a imagem do prêmio */}
              <CardMedia
                component="img"
                height="140"
                image={award.link_image}
                alt={award.name}
              />
              <CardContent>
                {/* Exibe a descrição do prêmio */}
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ textAlign: "center" }} // Centraliza o texto
                >
                  {award.name}
                </Typography>

                {/* Botão para mais detalhes */}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => handleDetailsClick(award)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Awards;