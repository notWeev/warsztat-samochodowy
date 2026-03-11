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
  useTheme,
  useMediaQuery,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [filters, setFilters] = useState({ search: "", type: "" });

  const debouncedSearch = useDebounce(filters.search, 500);

  const { data, isLoading, error } = useCustomers(
    paginationModel.page + 1,
    paginationModel.pageSize,
    debouncedSearch,
    filters.type || undefined,
  );

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

  const resetPage = () => setPaginationModel((prev) => ({ ...prev, page: 0 }));

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
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Podgląd">
            <IconButton size="small" onClick={() => onView(params.row)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edytuj">
            <IconButton
              size="small"
              color="info"
              onClick={() => onEdit(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Usuń">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row)}
              disabled={deleteCustomer.isPending}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

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
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, search: e.target.value }));
                resetPage();
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={filters.type === "INDIVIDUAL"}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      type: e.target.checked ? "INDIVIDUAL" : "",
                    }));
                    resetPage();
                  }}
                />
              }
              label="Tylko osoby"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={filters.type === "BUSINESS"}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      type: e.target.checked ? "BUSINESS" : "",
                    }));
                    resetPage();
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

      <Paper>
        <DataGrid
          rows={data?.data || []}
          columns={columns}
          rowCount={data?.total || 0}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          paginationMode="server"
          sortingMode="server"
          loading={isLoading}
          autoHeight
          disableRowSelectionOnClick
          columnVisibilityModel={
            isMobile
              ? {
                  type: false,
                  lastName: false,
                  email: false,
                  identifier: false,
                }
              : {}
          }
        />
      </Paper>
    </Box>
  );
};

export const CustomerList = memo(CustomerListComponent);
