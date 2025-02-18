import React, { useState, useEffect } from "react";
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
  TextField,
  TablePagination,
  useMediaQuery,
  Chip,
  Tooltip,
  IconButton,
  Fade,
} from "@mui/material";
import PreviewIcon from "@mui/icons-material/Preview";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import EditIcon from "@mui/icons-material/Edit"; // Ícone de editar
import DeleteIcon from "@mui/icons-material/Delete"; // Ícone de apagar
import { useTheme } from "@mui/material/styles";
import AxiosInstance from "../components/AxiosInstance";
import dayjs from "dayjs";

const Dashboard = () => {
  const [flights, setFlights] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detecta telas pequenas

  // Buscar os voos do usuário
  useEffect(() => {
    AxiosInstance.get("/dashboard/")
      .then((response) => {
        // Ordena os voos pela data de registro (do mais recente para o mais antigo)
        const sortedFlights = response.data.sort(
          (a, b) => new Date(b.registration_date) - new Date(a.registration_date)
        );
        setFlights(sortedFlights);
      })
      .catch((error) => console.error("Erro ao carregar voos:", error));
  }, []);

  // Filtragem pelo campo de pesquisa
  const filteredFlights = flights.filter((flight) =>
    flight.flight_number.toLowerCase().includes(search.toLowerCase())
  );

  // Paginação
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Função para editar um voo
  const handleEdit = (flightId) => {
    console.log("Editar voo:", flightId);
    // Adicione a lógica de edição aqui
  };

  // Função para apagar um voo
  const handleDelete = (flightId) => {
    console.log("Apagar voo:", flightId);
    // Adicione a lógica de exclusão aqui
  };

  return (
    <Container maxWidth="lg">
      {" "}
      {/* Ajusta para "lg" para melhor layout em telas grandes */}
      <Typography variant="h4" sx={{ my: 3, textAlign: "center" }}>
        My Flights
      </Typography>
      {/* Tabela Responsiva */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Flight</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Dep</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Arr</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Date</TableCell>
              {!isMobile && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Network</TableCell>}
              {!isMobile && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Duration</TableCell>}
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Aircraft</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFlights
              .slice(0, 5) // Mostra apenas os 5 primeiros resultados
              .map((flight) => (
                <TableRow key={flight.id}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {flight.flight_icao} {flight.flight_number}
                  </TableCell>
                  <TableCell>{flight.departure_airport}</TableCell>
                  <TableCell>{flight.arrival_airport}</TableCell>
                  <TableCell>{dayjs(flight.registration_date).format("MM/DD/YYYY")}</TableCell>
                  {!isMobile && (
                    <TableCell>
                      <Chip label={flight.network || "N/A"} color="primary" />
                    </TableCell>
                  )}
                  {!isMobile && <TableCell>{flight.flight_duration}</TableCell>}
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
                    {/* Se o status for 'Rejected', exibe o ícone com Tooltip */}
                    {flight.status === "Rejected" && (
                      <Tooltip title={flight.observation || "No observation available"} placement="top" arrow>
                        <AssignmentLateIcon
                          sx={{ ml: 1, color: "#0066cc", verticalAlign: "middle" }} // Espaçamento e cor vermelha
                        />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    {/* Ícone de visualização (sempre ativo) */}
                    <Tooltip title="Review flight log" placement="top" arrow>
                      <IconButton component="a" href="/detalhes">
                        <PreviewIcon />
                      </IconButton>
                    </Tooltip>

                    {/* Ícone de editar (ativo apenas em "In Review") */}
                    <Tooltip title="Edit" placement="top" arrow>
                      <span>
                        <IconButton
                          onClick={() => handleEdit(flight.id)}
                          disabled={flight.status !== "In Review"} // Desabilita se não for "In Review"
                        >
                          <EditIcon />
                        </IconButton>
                      </span>
                    </Tooltip>

                    {/* Ícone de apagar (ativo em "In Review" e "Rejected") */}
                    <Tooltip title="Delete" placement="top" arrow>
                      <span>
                        <IconButton
                          onClick={() => handleDelete(flight.id)}
                          disabled={flight.status === "Approved"} // Desabilita se for "Approved"
                          color="error"
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