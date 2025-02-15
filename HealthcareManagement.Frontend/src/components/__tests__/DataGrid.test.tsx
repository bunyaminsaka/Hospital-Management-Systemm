import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataGrid } from '../DataGrid';

describe('DataGrid', () => {
    const mockColumns = [
        { id: 'name', label: 'Name' },
        { id: 'age', label: 'Age', format: (value: number) => `${value} years` }
    ];

    const mockData = [
        { id: 1, name: 'John Doe', age: 30 },
        { id: 2, name: 'Jane Smith', age: 25 }
    ];

    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnPageChange = jest.fn();
    const mockOnRowsPerPageChange = jest.fn();

    const renderDataGrid = (props = {}) => {
        return render(
            <DataGrid
                columns={mockColumns}
                rows={mockData}
                page={0}
                rowsPerPage={5}
                totalCount={2}
                onPageChange={mockOnPageChange}
                onRowsPerPageChange={mockOnRowsPerPageChange}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                {...props}
            />
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders column headers', () => {
        renderDataGrid();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Age')).toBeInTheDocument();
    });

    it('renders data rows with formatted values', () => {
        renderDataGrid();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('30 years')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('25 years')).toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
        renderDataGrid();
        const editButtons = screen.getAllByRole('button', { name: /edit/i });
        fireEvent.click(editButtons[0]);
        expect(mockOnEdit).toHaveBeenCalledWith(mockData[0]);
    });

    it('calls onDelete when delete button is clicked', () => {
        renderDataGrid();
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        fireEvent.click(deleteButtons[0]);
        expect(mockOnDelete).toHaveBeenCalledWith(mockData[0]);
    });

    it('does not render action buttons when onEdit and onDelete are not provided', () => {
        renderDataGrid({ onEdit: undefined, onDelete: undefined });
        expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });

    it('handles page change', () => {
        renderDataGrid();
        const nextPageButton = screen.getByRole('button', { name: /next page/i });
        fireEvent.click(nextPageButton);
        expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('handles rows per page change', () => {
        renderDataGrid();
        const select = screen.getByRole('combobox');
        fireEvent.mouseDown(select);
        const option = screen.getByRole('option', { name: '10' });
        fireEvent.click(option);
        expect(mockOnRowsPerPageChange).toHaveBeenCalledWith(10);
    });
}); 