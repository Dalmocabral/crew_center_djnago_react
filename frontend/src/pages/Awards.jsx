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
      <Typography variant="h4" gutterBottom>
        Awards
      </Typography>
      <Typography paragraph>
        Aqui você pode ver todos os prêmios disponíveis.
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
                <Typography variant="body2" color="text.secondary">
                  {award.description}
                </Typography>
                {/* Botão para mais detalhes */}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => handleDetailsClick(award)}
                >
                  Ver Detalhes
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