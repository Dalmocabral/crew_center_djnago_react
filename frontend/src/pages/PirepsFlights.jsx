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
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimeField } from '@mui/x-date-pickers/TimeField';
import dayjs from 'dayjs';
import AxiosInstance from '../components/AxiosInstance'; // Importe o AxiosInstance

const PirepsFlights = () => {
  // Estados para os campos do formulário
  const [flightIcao, setFlightIcao] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [aircraft, setAircraft] = useState('');
  const [flightDuration, setFlightDuration] = useState(dayjs('2022-04-17T00:00')); // Valor inicial

  // Opções para o campo de seleção "Aircraft"
  const aircraftChoices = [
    { value: 'B737', label: 'Boeing 737' },
    { value: 'A320', label: 'Airbus A320' },
    { value: 'B777', label: 'Boeing 777' },
  ];

  // Função para enviar o formulário
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
    };

    try {
      // Envia os dados para o backend
      const response = await AxiosInstance.post('pirepsflight/', formData);
      console.log('Resposta do servidor:', response.data);
      alert('Pireps salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar Pireps:', error.response ? error.response.data : error.message);
      alert('Erro ao salvar Pireps. Verifique os dados e tente novamente.');
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
                  onChange={(e) => setFlightIcao(e.target.value)}
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
                  onChange={(e) => setDepartureAirport(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>

              {/* Arrival Airport */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Arrival Airport"
                  value={arrivalAirport}
                  onChange={(e) => setArrivalAirport(e.target.value)}
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
    </LocalizationProvider>
  );
};

export default PirepsFlights; 