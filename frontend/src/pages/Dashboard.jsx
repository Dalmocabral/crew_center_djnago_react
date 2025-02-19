import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Importa useNavigate
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
  IconButton,
  Chip,
} from "@mui/material";
import PreviewIcon from "@mui/icons-material/Preview";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "@mui/material/styles";
import AxiosInstance from "../components/AxiosInstance";
import dayjs from "dayjs";

const Dashboard = () => {
  const [flights, setFlights] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate(); // ✅ Inicializa o useNavigate

  const theme = useTheme();

  useEffect(() => {
    AxiosInstance.get("/dashboard/")
      .then((response) => {
        const sortedFlights = response.data.sort(
          (a, b) => new Date(b.registration_date) - new Date(a.registration_date)
        );
        setFlights(sortedFlights);
      })
      .catch((error) => console.error("Erro ao carregar voos:", error));
  }, []);

  // ✅ Função para editar um voo
  const handleEdit = (flightId) => {
    navigate(`/app/edit-pirep/${flightId}`); // Redireciona para a página de edição
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ my: 3, textAlign: "center" }}>
        My Flights
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Flight</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Dep</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Arr</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Date</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Network</TableCell>
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
                <TableCell>{flight.aircraft}</TableCell>
                <TableCell>
                  <Chip
                    label={flight.status || "Scheduled"}
                    color={
                      flight.status === "Approved"
                        ? "success"
                        : flight.status === "Rejected"
                          ? "error"
                          : "warning"
                    }
                  />
                  {flight.status === "Rejected" && (
                    <Tooltip title={flight.observation || "No observation available"} placement="top" arrow>
                      <AssignmentLateIcon sx={{ ml: 1, color: "#0066cc", verticalAlign: "middle" }} />
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip title="Review flight log" placement="top" arrow>
                    <IconButton component="a" href="/detalhes">
                      <PreviewIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Edit" placement="top" arrow>
                    <span>
                      <IconButton
                        onClick={() => handleEdit(flight.id)}
                        disabled={flight.status === "Approved" || flight.status === "Rejected"} // Edit desabilitado para Approved e Rejected
                      >
                        <EditIcon />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title="Delete" placement="top" arrow>
                    <span>
                      <IconButton
                        color="error"
                        disabled={flight.status === "Approved"} // Delete desabilitado apenas para Approved
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
    </Container>
  );
};

export default Dashboard;
