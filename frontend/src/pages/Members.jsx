import React, { useEffect, useState } from 'react';
import AxiosInstance from '../components/AxiosInstance';
import { 
  Card, CardContent, CardMedia, Typography, Grid, CircularProgress, Box, 
  Divider
} from '@mui/material';

const defaultAvatar = 'https://newsky.app/api/pilot/avatar/default'; // Imagem padrão para usuários sem foto

const Members = () => {
  const [myData, setMyData] = useState([]);
  const [loading, setLoading] = useState(true);

  const GetData = () => {
    AxiosInstance.get('users/')
      .then((res) => {
        setMyData(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar os dados:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    GetData();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}> {/* Espaçamento entre os cards */}
          {myData.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card sx={{ 
                width: '100%', // Ocupa 100% da largura da coluna
                boxShadow: 3, 
                textAlign: 'center', 
                borderRadius: 2, 
                p: 2,
                height: '100%', // Garante que todos os cards tenham a mesma altura
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <CardMedia
                  component="img"
                  image={item.avatar || defaultAvatar} // Usa avatar ou imagem padrão
                  alt={item.name}
                  sx={{ 
                    borderRadius: '50%', 
                    width: 80, 
                    height: 80, 
                    mx: 'auto', 
                    mt: 2 
                  }}
                />
                <CardContent sx={{ p: 1 }}>
                  <Divider />
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                    {item.first_name} {item.last_name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {item.country}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Members;