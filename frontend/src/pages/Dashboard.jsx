import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Fade,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import FlightIcon from "@mui/icons-material/Flight";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import PreviewIcon from "@mui/icons-material/Preview";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "@mui/material/styles";
import AxiosInstance from "../components/AxiosInstance";
import dayjs from "dayjs";

const Dashboard = () => {
  const [flights, setFlights] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFlightId, setSelectedFlightId] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = () => {
    AxiosInstance.get("/dashboard/")
      .then((response) => {
        const sortedFlights = response.data.sort(
          (a, b) => new Date(b.registration_date) - new Date(a.registration_date)
        );
        setFlights(sortedFlights);
      })
      .catch((error) => console.error("Erro ao carregar voos:", error));
  };

  const handleEdit = (flightId) => {
    navigate(`/app/edit-pirep/${flightId}`);
  };

  const handleDeleteClick = (flightId) => {
    setSelectedFlightId(flightId);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedFlightId) {
      AxiosInstance.delete(`/pirepsflight/${selectedFlightId}/`)
        .then(() => {
          setFlights(flights.filter((flight) => flight.id !== selectedFlightId));
        })
        .catch((error) => console.error("Erro ao excluir voo:", error))
        .finally(() => {
          setOpenDialog(false);
          setSelectedFlightId(null);
        });
    }
  };

  // Função para converter duração para horas decimais
  const convertToHours = (duration) => {
    if (!duration) return 0;
    const parts = duration.split(":");
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    return hours + minutes / 60;
  };

  // Último voo registrado
  const lastFlight = flights.length > 0 ? flights[0] : null;
  
  // Total de horas (somente Approved)
  const totalHours = flights
    .filter((flight) => flight.status === "Approved") // Filtra apenas os aprovados
    .reduce((acc, flight) => acc + convertToHours(flight.flight_duration), 0)
    .toFixed(2);

  // Total de voos (somente Approved)
  const totalFlights = flights.filter((flight) => flight.status === "Approved").length;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ my: 3, textAlign: "center" }}>
        My Flights
      </Typography>

      {/* Cards com informações */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        
        {/* Card 1: Último voo registrado */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <AirplanemodeActiveIcon sx={{ fontSize: 40, color: "#1976d2" }} />
            <CardContent>
              <Typography variant="h6">Latest Flight Plan</Typography>
              <Typography variant="h5">
                {lastFlight
                  ? `${lastFlight.departure_airport} ✈ ${lastFlight.arrival_airport}`
                  : "Nenhum voo"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2: Total de horas (somente Approved) */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <AccessTimeIcon sx={{ fontSize: 40, color: "#ff9800" }} />
            <CardContent>
              <Typography variant="h6">Total de Horas</Typography>
              <Typography variant="h5">{totalHours}h</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 3: Total de voos (somente Approved) */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <FlightIcon sx={{ fontSize: 40, color: "#1976d2" }} />
            <CardContent>
              <Typography variant="h6">Total de Voos</Typography>
              <Typography variant="h5">{totalFlights}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de voos */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Flight</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Dep</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Arr</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Date</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Network</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Duration</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Aircraft</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flights.map((flight) => (
              <TableRow key={flight.id}>
                <TableCell>{flight.flight_icao} {flight.flight_number}</TableCell>
                <TableCell>{flight.departure_airport}</TableCell>
                <TableCell>{flight.arrival_airport}</TableCell>
                <TableCell>{dayjs(flight.registration_date).format("MM/DD/YYYY")}</TableCell>
                <TableCell><Chip label={flight.network || "N/A"} color="primary" /></TableCell>
                <TableCell>{flight.flight_duration}</TableCell>
                <TableCell>{flight.aircraft}</TableCell>
                <TableCell>
                  <Chip
                    label={flight.status || "Scheduled"}
                    color={flight.status === "Approved" ? "success" : flight.status === "Rejected" ? "error" : "warning"}
                  />
                </TableCell>
                <TableCell>
                <Tooltip
                      title="Review flight log" 
                      placement="top"
                      arrow
                      TransitionComponent={Fade} // Aplica o efeito de fade-in
                      TransitionProps={{ timeout: 500 }} // Tempo da animação
                      PopperProps={{
                        modifiers: [
                          {
                            name: "preventOverflow",
                            options: { boundary: "window" },
                          },
                          {
                            name: "offset",
                            options: { offset: [0, 10] }, // Move o tooltip para baixo
                          },
                        ],
                      }}
                    >
                      <IconButton component="a" href="/detalhes">
                        <PreviewIcon />
                      </IconButton>
                    </Tooltip>
                  <Tooltip title="Edit" placement="top" arrow>
                    <span>
                      <IconButton
                        onClick={() => handleEdit(flight.id)}
                        disabled={flight.status === "Approved" || flight.status === "Rejected"}
                      >
                        <EditIcon />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title="Delete" placement="top" arrow>
                    <span>
                      <IconButton
                        color="error"
                        disabled={flight.status === "Approved"}
                        onClick={() => handleDeleteClick(flight.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Dialog de Confirmação */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>Tem certeza de que deseja excluir este voo?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
