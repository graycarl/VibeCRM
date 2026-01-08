import React from 'react';
import { Container, Grid, Typography, Button, TextField, Box, Paper, Stack } from '@mui/material';

const MuiShowcase: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        MUI Component Showcase
      </Typography>
      
      <Stack spacing={4}>
        {/* Buttons Section */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Buttons</Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button variant="contained" color="primary">Primary</Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="secondary">Secondary</Button>
            </Grid>
            <Grid item>
              <Button variant="outlined">Outlined</Button>
            </Grid>
            <Grid item>
              <Button variant="text">Text</Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Typography Section */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Typography</Typography>
          <Box>
            <Typography variant="h1">h1. Heading</Typography>
            <Typography variant="h2">h2. Heading</Typography>
            <Typography variant="h3">h3. Heading</Typography>
            <Typography variant="h4">h4. Heading</Typography>
            <Typography variant="h5">h5. Heading</Typography>
            <Typography variant="h6">h6. Heading</Typography>
            <Typography variant="body1">body1. Lorem ipsum dolor sit amet.</Typography>
            <Typography variant="body2">body2. Lorem ipsum dolor sit amet.</Typography>
          </Box>
        </Paper>

        {/* Inputs Section */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Inputs</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Standard" variant="standard" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Outlined" variant="outlined" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Filled" variant="filled" fullWidth />
            </Grid>
          </Grid>
        </Paper>
      </Stack>
    </Container>
  );
};

export default MuiShowcase;
