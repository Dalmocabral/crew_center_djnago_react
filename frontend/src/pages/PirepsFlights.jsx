import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Grid,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimeField } from '@mui/x-date-pickers/TimeField';
import dayjs from 'dayjs';
import AxiosInstance from '../components/AxiosInstance'; // Importe o AxiosInstance
import aircraftChoices from '../data/aircraftChoices';

const PirepsFlights = () => {
  // Estados para os campos do formulário
  const [flightIcao, setFlightIcao] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [aircraft, setAircraft] = useState('');
  const [network, setNetwork] = useState('')
  const [flightDuration, setFlightDuration] = useState(dayjs('2022-04-17T00:00')); // Valor inicial

  // Estado do Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('success'); // 'success' ou 'error'


  // Função para fechar o Dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Formata a duração do voo como "HH:mm:ss"
    const formattedDuration = flightDuration.format('HH:mm:ss');

    // Dados a serem enviados
    const formData = {
      flight_icao: flightIcao,
      flight_number: flightNumber,
      departure_airport: departureAirport,
      arrival_airport: arrivalAirport,
      aircraft: aircraft,
      flight_duration: formattedDuration,
      network: network,
    };

    try {
      // Envia os dados para o backend
      await AxiosInstance.post('pirepsflight/', formData);

      // Exibe mensagem de sucesso
      setDialogMessage('Pireps salvo com sucesso!');
      setDialogType('success');
      setOpenDialog(true);

      // Limpa os campos do formulário após o envio bem-sucedido
      setFlightIcao('');
      setFlightNumber('');
      setDepartureAirport('');
      setArrivalAirport('');
      setAircraft('');
      setFlightDuration(dayjs('2022-04-17T00:00')); // Reset para a duração inicial
    } catch (error) {
      console.error('Erro ao salvar Pireps:', error.response ? error.response.data : error.message);

      // Exibe mensagem de erro
      setDialogMessage('Erro ao salvar Pireps. Verifique os dados e tente novamente.');
      setDialogType('error');
      setOpenDialog(true);
    }
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md">
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Pireps Flights
          </Typography>
          <Typography variant="body1" gutterBottom>
            Preencha os dados do voo abaixo:
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Flight ICAO */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Flight ICAO"
                  value={flightIcao}
                  onChange={(e) => setFlightIcao(e.target.value ? e.target.value.toUpperCase() : '')}
                  fullWidth
                  required
                />
              </Grid>

              {/* Flight Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Flight Number"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>

              {/* Departure Airport */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Departure Airport"
                  value={departureAirport}
                  onChange={(e) => setDepartureAirport(e.target.value ? e.target.value.toUpperCase() : '')}
                  fullWidth
                  required
                />
              </Grid>

              {/* Arrival Airport */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Arrival Airport"
                  value={arrivalAirport}
                  onChange={(e) => setArrivalAirport(e.target.value ? e.target.value.toUpperCase() : '')}
                  fullWidth
                  required
                />
              </Grid>

              {/* Aircraft */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Aircraft</InputLabel>
                  <Select
                    value={aircraft}
                    onChange={(e) => setAircraft(e.target.value)}
                    label="Aircraft"
                  >
                    {aircraftChoices.map((choice) => (
                      <MenuItem key={choice.value} value={choice.value}>
                        {choice.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Flight Duration */}
              <Grid item xs={12} sm={6}>
                <TimeField
                  label="Flight Duration (HH:mm)"
                  value={flightDuration}
                  onChange={(newValue) => setFlightDuration(newValue)}
                  format="HH:mm"
                  fullWidth
                />
              </Grid>
              {/* Network */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Network</InputLabel>
                  <Select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    label="Network"
                  >
                    <MenuItem value="Casual">Casual</MenuItem>
                    <MenuItem value="Training">Training</MenuItem>
                    <MenuItem value="Expert">Expert</MenuItem>
                  </Select>
                </FormControl>
              </Grid>


              {/* Botão de Enviar */}
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  Enviar
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Container>

      {/* Dialog de Sucesso ou Erro */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{dialogType === 'success' ? 'Sucesso' : 'Erro'}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">OK</Button>
        </DialogActions>
      </Dialog>

    </LocalizationProvider>
  );
};

export default PirepsFlights;
