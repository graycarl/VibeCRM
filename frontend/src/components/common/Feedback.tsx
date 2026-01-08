import React from 'react';
import { Skeleton, Stack, Alert, AlertTitle, CircularProgress, Box } from '@mui/material';

export const ListSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <Stack spacing={1}>
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} variant="rectangular" height={40} />
    ))}
  </Stack>
);

export const FormSkeleton: React.FC = () => (
  <Stack spacing={2} sx={{ mt: 2 }}>
    <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
    <Skeleton variant="rectangular" height={56} />
    <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
    <Skeleton variant="rectangular" height={56} />
    <Skeleton variant="rectangular" height={100} />
  </Stack>
);

export const ErrorAlert: React.FC<{ message: string; title?: string }> = ({ message, title = "错误" }) => (
  <Alert severity="error" sx={{ mb: 2 }}>
    <AlertTitle>{title}</AlertTitle>
    {message}
  </Alert>
);

export const LoadingOverlay: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
    <CircularProgress />
  </Box>
);
