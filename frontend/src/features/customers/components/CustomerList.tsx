import { useState, useCallback, memo } from "react";
import type {
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Stack,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useCustomers, useDeleteCustomer } from "../hooks/useCustomers";
import type { Customer } from "@/shared/types/customer.types";

interface CustomerListProps {
  onEdit: (customer: Customer) => void;
  onView: (customer: Customer) => void;
  onAddClick: () => void;
}

const CustomerListComponent = ({
  onEdit,
  onView,
  onAddClick,
}: CustomerListProps) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("");

  const debouncedSearch = useDebounce(search, 500);

  // Fetch customers
  const { data, isLoading, error } = useCustomers(
    page + 1,
    pageSize,
    debouncedSearch,
    filterType || undefined,
  );

  // Delete mutation
  const deleteCustomer = useDeleteCustomer();

  const handleDelete = useCallback(
    async (customer: Customer) => {
      const displayName =
        customer.type === "INDIVIDUAL"
          ? `${customer.firstName} ${customer.lastName}`
          : customer.companyName;

      if (window.confirm(`Czy na pewno chcesz usunąć ${displayName}?`)) {
        try {
          await deleteCustomer.mutateAsync(customer.id);
        } catch (err) {
          console.error("Error deleting customer:", err);
        }
      }
    },
    [deleteCustomer],
  );

  const columns: GridColDef[] = [
    {
      field: "type",
      headerName: "Typ",
      width: 100,
      renderCell: (params) =>
        params.row.type === "INDIVIDUAL" ? "Osoba" : "Firma",
    },
    {
      field: "firstName",
      headerName: "Imię/Firma",
      width: 160,
      renderCell: (params) => {
        if (params.row.type === "BUSINESS") {
          return params.row.companyName;
        }
        return params.row.firstName;
      },
    },
    {
      field: "lastName",
      headerName: "Nazwisko",
      width: 150,
      renderCell: (params) =>
        params.row.type === "INDIVIDUAL" ? params.row.lastName : "-",
    },
    {
      field: "phone",
      headerName: "Telefon",
      width: 130,
    },
    {
      field: "email",
      headerName: "Email",
      width: 180,
      renderCell: (params) => params.row.email || "-",
    },
    {
      field: "identifier",
      headerName: "PESEL/NIP",
      width: 120,
      renderCell: (params) =>
        params.row.type === "INDIVIDUAL" ? params.row.pesel : params.row.nip,
    },
    {
      field: "actions",
      headerName: "Akcje",
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Customer>) => (
        <Stack direction="row" spacing={4}>
          <Tooltip title="Podgląd">
            <IconButton
              size="small"
              onClick={() => onView(params.row)}
              sx={{ minWidth: 0, px: 1 }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edytuj">
            <IconButton
              size="small"
              color="info"
              onClick={() => onEdit(params.row)}
              sx={{ minWidth: 0, px: 1 }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Usuń">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row)}
              disabled={deleteCustomer.isPending}
              sx={{ minWidth: 0, px: 1 }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  };

  return (
    <Box>
      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={3}>
          <Button
            variant="contained"
            onClick={onAddClick}
            sx={{ alignSelf: "flex-start" }}
          >
            + Dodaj klienta
          </Button>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
          >
            <TextField
              label="Wyszukaj..."
              placeholder="Nazwa, telefon, email"
              size="small"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={filterType === "INDIVIDUAL"}
                  onChange={(e) => {
                    setFilterType(e.target.checked ? "INDIVIDUAL" : "");
                    setPage(0);
                  }}
                />
              }
              label="Tylko osoby"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={filterType === "BUSINESS"}
                  onChange={(e) => {
                    setFilterType(e.target.checked ? "BUSINESS" : "");
                    setPage(0);
                  }}
                />
              }
              label="Tylko firmy"
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Błąd przy pobieraniu klientów: {error.message}
        </Alert>
      )}

      {/* DataGrid */}
      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={data?.data || []}
          columns={columns}
          rowCount={data?.total || 0}
          paginationModel={{
            pageSize,
            page,
          }}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[5, 10, 25, 50]}
          paginationMode="server"
          sortingMode="server"
          loading={isLoading}
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export const CustomerList = memo(CustomerListComponent);
