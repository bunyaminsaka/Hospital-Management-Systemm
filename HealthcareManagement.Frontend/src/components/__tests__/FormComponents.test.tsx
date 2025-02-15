import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { FormTextField, FormContainer } from '../FormComponents';

const theme = createTheme();

describe('FormComponents', () => {
    describe('FormTextField', () => {
        const renderWithTheme = (component: React.ReactElement) => {
            return render(
                <ThemeProvider theme={theme}>
                    {component}
                </ThemeProvider>
            );
        };

        it('renders with correct styling', () => {
            renderWithTheme(
                <FormTextField
                    label="Test Field"
                    value=""
                    onChange={() => {}}
                />
            );

            const textField = screen.getByLabelText('Test Field');
            const container = textField.closest('.MuiFormControl-root');
            expect(container).toHaveStyle({ marginBottom: '16px' }); // theme.spacing(2)
        });

        it('passes through props correctly', () => {
            renderWithTheme(
                <FormTextField
                    label="Test Field"
                    value="test value"
                    required
                    error
                    helperText="Error message"
                    onChange={() => {}}
                />
            );

            const textField = screen.getByLabelText('Test Field *');
            expect(textField).toHaveValue('test value');
            expect(screen.getByText('Error message')).toBeInTheDocument();
            expect(textField.closest('.Mui-error')).toBeInTheDocument();
        });

        it('handles different input types', () => {
            renderWithTheme(
                <FormTextField
                    label="Date Field"
                    type="date"
                    value="2023-12-01"
                    onChange={() => {}}
                />
            );

            const dateField = screen.getByLabelText('Date Field');
            expect(dateField).toHaveAttribute('type', 'date');
            expect(dateField).toHaveValue('2023-12-01');
        });
    });

    describe('FormContainer', () => {
        it('renders with correct styling', () => {
            render(
                <FormContainer>
                    <div>Test Content</div>
                </FormContainer>
            );

            const form = screen.getByText('Test Content').closest('form');
            expect(form).toHaveStyle({
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '400px',
                margin: '0 auto',
                padding: '20px'
            });
        });

        it('handles form submission', () => {
            const handleSubmit = jest.fn(e => e.preventDefault());
            render(
                <FormContainer onSubmit={handleSubmit}>
                    <button type="submit">Submit</button>
                </FormContainer>
            );

            screen.getByRole('button').click();
            expect(handleSubmit).toHaveBeenCalled();
        });

        it('renders children correctly', () => {
            render(
                <FormContainer>
                    <input type="text" placeholder="Test Input" />
                    <button>Test Button</button>
                </FormContainer>
            );

            expect(screen.getByPlaceholderText('Test Input')).toBeInTheDocument();
            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });
}); 