import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Box, IconButton, InputAdornment, Snackbar, Alert } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import AxiosInstance from "../components/AxiosInstance";
import ReactFlagsSelect from "react-flags-select"; // Importa o componente de seleção de bandeiras

const Register = () => {
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [selectedCountry, setSelectedCountry] = useState(""); // Estado para o país selecionado

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue, // Adicionado para atualizar os campos
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      usernameIFC: "",
      email: "",
      country: "", // Adiciona o campo country
      password1: "",
      password2: "",
    },
  });

  const navigate = useNavigate();

  // Função para capitalizar a primeira letra de uma string
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Função para formatar o First Name e Last Name enquanto o usuário digita
  const handleNameChange = (fieldName, value) => {
    const capitalizedValue = capitalizeFirstLetter(value);
    setValue(fieldName, capitalizedValue); // Atualiza o valor do campo
  };

  // Função para atualizar o país selecionado
  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode); // Atualiza o estado local
    setValue("country", countryCode); // Atualiza o valor do campo no formulário
  };

  const submission = async (data) => {
    try {
      const response = await AxiosInstance.post(`register/`, {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        usernameIFC: data.usernameIFC,
        country: data.country, // Inclui o país no envio dos dados
        password: data.password1,
        confirm_password: data.password2,
      });

      // Exibe mensagem de sucesso
      setSnackbarMessage("Registration successful! Redirecting to login...");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      console.log("Registration successful:", response.data);

      // Limpa os campos do formulário
      reset();

      // Redireciona para a página de login após 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      // Exibe mensagem de erro
      setSnackbarMessage("Registration failed. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);

      console.error("Registration failed:", error.response ? error.response.data : error.message);
    }
  };

  const onSubmit = (data) => {
    console.log("Form submitted", data);
    submission(data);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box sx={{ p: 3, boxShadow: 3, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Register</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Campo First Name */}
          <Controller
            name="first_name"
            control={control}
            rules={{ required: "First name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="First Name"
                margin="normal"
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value.charAt(0).toUpperCase() + value.slice(1));
                }}
              />
            )}
          />

          <Controller
            name="last_name"
            control={control}
            rules={{ required: "Last name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Last Name"
                margin="normal"
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value.charAt(0).toUpperCase() + value.slice(1));
                }}
              />
            )}
          />


          {/* Campo Email */}
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />

          {/* Campo usernameIFC */}
          <Controller
            name="usernameIFC"
            control={control}
            rules={{ required: "Username IFC is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Username IFC"
                margin="normal"
                error={!!errors.usernameIFC}
                helperText={errors.usernameIFC?.message}
              />
            )}
          />
          {/* Campo Country */}
          <Controller
            name="country"
            control={control}
            rules={{ required: "Country is required" }}
            render={({ field }) => (
              <ReactFlagsSelect
                selected={selectedCountry}
                onSelect={handleCountryChange} // Atualiza o país selecionado
                searchable // Permite pesquisar países
                placeholder="Select Country"
                fullWidth
                className="country-select"
              />
            )}
          />

          {/* Campo Password */}
          <Controller
            name="password1"
            control={control}
            rules={{ required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Password"
                type={showPassword1 ? "text" : "password"}
                margin="normal"
                error={!!errors.password1}
                helperText={errors.password1?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword1(!showPassword1)}>
                        {showPassword1 ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* Campo Confirm Password */}
          <Controller
            name="password2"
            control={control}
            rules={{
              required: "Confirm password is required",
              validate: (value) => value === watch("password1") || "Passwords do not match",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Confirm Password"
                type={showPassword2 ? "text" : "password"}
                margin="normal"
                error={!!errors.password2}
                helperText={errors.password2?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword2(!showPassword2)}>
                        {showPassword2 ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* Botão de Submit */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Register
          </Button>
        </form>
      </Box>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;