import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TablePagination
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

interface Column {
    id: string;
    label: string;
    format?: (value: any) => string;
}

interface DataGridProps {
    columns: Column[];
    rows: any[];
    page: number;
    rowsPerPage: number;
    totalCount: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
}

export function DataGrid({
    columns,
    rows,
    page,
    rowsPerPage,
    totalCount,
    onPageChange,
    onRowsPerPageChange,
    onEdit,
    onDelete
}: DataGridProps) {
    const handleChangePage = (event: unknown, newPage: number) => {
        onPageChange(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        onRowsPerPageChange(parseInt(event.target.value, 10));
        onPageChange(0);
    };

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell key={column.id}>
                                    {column.label}
                                </TableCell>
                            ))}
                            {(onEdit || onDelete) && (
                                <TableCell align="right">Actions</TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow hover key={row.id}>
                                {columns.map((column) => (
                                    <TableCell key={column.id}>
                                        {column.format
                                            ? column.format(row[column.id])
                                            : row[column.id]}
                                    </TableCell>
                                ))}
                                {(onEdit || onDelete) && (
                                    <TableCell align="right">
                                        {onEdit && (
                                            <IconButton
                                                onClick={() => onEdit(row)}
                                                size="small"
                                                color="primary"
                                            >
                                                <Edit />
                                            </IconButton>
                                        )}
                                        {onDelete && (
                                            <IconButton
                                                onClick={() => onDelete(row)}
                                                size="small"
                                                color="error"
                                            >
                                                <Delete />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
} 