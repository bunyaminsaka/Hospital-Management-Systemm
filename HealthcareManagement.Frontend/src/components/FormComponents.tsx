import React from 'react';
import { Box, TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface FormContainerProps {
    children: React.ReactNode;
    onSubmit?: (e: React.FormEvent) => void;
    component?: React.ElementType;
}

export const FormContainer = styled(Box)<FormContainerProps>(({ theme }) => ({
    padding: theme.spacing(3),
    '& > *': {
        marginBottom: theme.spacing(2),
    },
    '& > :last-child': {
        marginBottom: 0,
    },
}));

export const FormTextField = (props: TextFieldProps) => (
    <TextField
        variant="outlined"
        margin="normal"
        {...props}
    />
); 