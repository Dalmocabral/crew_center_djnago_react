import React, { useState, useEffect } from 'react';
import AxiosInstance from '../components/AxiosInstance';
import { useNavigate } from 'react-router-dom';
import ReactFlagsSelect from "react-flags-select";
import { Controller, useForm } from "react-hook-form";  // Import useForm and Controller from react-hook-form
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress as Spinner,
  Snackbar,
  Alert,
} from '@mui/material';
import Gravatar from '../components/Gravatar';
import { debounce } from "lodash";

const ProfileEdit = () => {
  const { control, handleSubmit, setValue } = useForm();
  const [user, setUser] = useState({
    email: '',
    usernameIFC: '',
    country: '',
    first_name: '',
    last_name: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [usernameValid, setUsernameValid] = useState(null);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await AxiosInstance.get('/profile/update/');
        setUser(response.data);
      } catch (error) {
        setError('Erro ao carregar perfil.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const response = await AxiosInstance.put('/profile/update/', user);
      setUser(response.data);
      setSuccess(true);
      setTimeout(() => navigate('/app/dashboard'), 2000);
    } catch (error) {
      setError('Erro ao atualizar perfil.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Only capitalize the first name and last name
    if (name === 'first_name' || name === 'last_name') {
      const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
      setUser((prevUser) => ({ ...prevUser, [name]: capitalizedValue }));
    } else {
      setUser((prevUser) => ({ ...prevUser, [name]: value }));
    }
  };

  const checkUsernameIFC = async (username) => {
    try {
      const response = await fetch('https://api.infiniteflight.com/public/v2/user/stats?apikey=nvo8c790hfa9q3duho2jhgd2jf8tgwqw', {
        method: 'POST',
        headers: { 'Content-type': 'application/json', 'Accept': 'text/plain' },
        body: JSON.stringify({ discourseNames: [username] }),
      });
      if (!response.ok) return response.status;
      const data = await response.json();
      return data.result && data.result.length > 0 && data.result[0].userId ? 200 : 404;
    } catch {
      return 500;
    }
  };

  const checkUsernameDebounced = debounce(async (username) => {
    if (username) {
      setUsernameLoading(true);
      const statusCode = await checkUsernameIFC(username);
      setUsernameValid(statusCode === 200);
      setUsernameLoading(false);
    }
  }, 500);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Editar Perfil
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, flexDirection: 'column', alignItems: 'center' }}>
        <Gravatar email={user.email} size={120} alt="Imagem de perfil" style={{ borderRadius: '50%' }} />
        <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={() => window.open('https://gravatar.com', '_blank')}>
          Atualizar Foto no Gravatar
        </Button>
      </Box>

      {/* Editable First Name and Last Name */}
      <TextField
        fullWidth
        label="Nome"
        name="first_name"
        value={user.first_name}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Sobrenome"
        name="last_name"
        value={user.last_name}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Email"
        name="email"
        value={user.email}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      {/* Username IFC */}
      <TextField
        fullWidth
        label="Username IFC"
        name="usernameIFC"
        value={user.usernameIFC}
        onChange={handleChange}
        onBlur={() => checkUsernameDebounced(user.usernameIFC)}
        sx={{ mb: 2 }}
      />
      {usernameLoading && <Spinner size={20} />}
      {usernameValid === false && <Alert severity="error">Username IFC inválido.</Alert>}
      {usernameValid === true && <Alert severity="success">Username IFC válido!</Alert>}

      {/* Country Select with Search */}
      <Controller
        name="country"
        control={control}
        render={({ field }) => (
          <ReactFlagsSelect
            selected={user.country}
            onSelect={(code) => {
              setUser((prevUser) => ({ ...prevUser, country: code }));
              setValue("country", code);
            }}
            searchable
            placeholder="Select Country"
            fullWidth
            className="country-select"
          />
        )}
        defaultValue={user.country}
      />

      <Button variant="contained" color="primary" onClick={handleUpdateProfile} sx={{ mt: 2 }}>
        Atualizar Perfil
      </Button>

      {error && <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}><Alert severity="error">{error}</Alert></Snackbar>}
      {success && <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}><Alert severity="success">Perfil atualizado com sucesso!</Alert></Snackbar>}
    </Box>
  );
};

export default ProfileEdit;
