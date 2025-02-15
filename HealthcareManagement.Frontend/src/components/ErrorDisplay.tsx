import { Alert } from '@mui/material';

interface ErrorDisplayProps {
    error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
    return (
        <Alert severity="error" sx={{ mb: 2 }}>
            {error}
        </Alert>
    );
} 