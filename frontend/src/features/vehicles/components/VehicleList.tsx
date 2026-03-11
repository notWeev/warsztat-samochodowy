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
  Chip,
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
import { useVehicles, useDeleteVehicle } from "../hooks/useVehicles";
import type { Vehicle } from "@/shared/types/vehicle.types";

interface VehicleListProps {
  onEdit: (vehicle: Vehicle) => void;
  onView: (vehicle: Vehicle) => void;
  onAddClick: () => void;
  customerId?: string;
}

const VehicleListComponent = ({
  onEdit,
  onView,
  onAddClick,
  customerId,
}: VehicleListProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [filters, setFilters] = useState({ search: "", status: "" });

  const debouncedSearch = useDebounce(filters.search, 500);

  // Fetch vehicles
  const { data, isLoading, error } = useVehicles(
    paginationModel.page + 1,
    paginationModel.pageSize,
    debouncedSearch,
    customerId,
    filters.status || undefined,
  );

  // Delete mutation
  const deleteVehicle = useDeleteVehicle();

  const handleDelete = useCallback(
    async (vehicle: Vehicle) => {
      const displayName = `${vehicle.brand} ${vehicle.model} (${vehicle.vin})`;

      if (window.confirm(`Czy na pewno chcesz usunąć ${displayName}?`)) {
        try {
          await deleteVehicle.mutateAsync(vehicle.id);
        } catch (err) {
          console.error("Error deleting vehicle:", err);
        }
      }
    },
    [deleteVehicle],
  );

  const resetPage = () => setPaginationModel((prev) => ({ ...prev, page: 0 }));

  const STATUS_CONFIG: Record<
    string,
    { label: string; color: "success" | "default" | "error" | "warning" }
  > = {
    ACTIVE: { label: "Aktywny", color: "success" },
    SOLD: { label: "Sprzedany", color: "default" },
    SCRAPPED: { label: "Złomowany", color: "error" },
    INACTIVE: { label: "Nieaktywny", color: "warning" },
  };

  const columns: GridColDef[] = [
    {
      field: "vin",
      headerName: "VIN",
      width: 150,
    },
    {
      field: "registrationNumber",
      headerName: "Nr. Rejestracyjny",
      width: 120,
      renderCell: (params) => params.row.registrationNumber || "-",
    },
    {
      field: "brand",
      headerName: "Marka",
      width: 100,
    },
    {
      field: "model",
      headerName: "Model",
      width: 100,
    },
    {
      field: "year",
      headerName: "Rok",
      width: 70,
    },
    {
      field: "mileage",
      headerName: "Przebieg (km)",
      width: 120,
      renderCell: (params) => params.row.mileage.toLocaleString("pl-PL"),
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: (params) => {
        const cfg = STATUS_CONFIG[params.row.status as string];
        return cfg ? (
          <Chip label={cfg.label} color={cfg.color} size="small" />
        ) : (
          params.row.status
        );
      },
    },
    {
      field: "actions",
      headerName: "Akcje",
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Vehicle>) => (
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
              disabled={deleteVehicle.isPending}
            >
              <DeleteIcon fontSize="small" />
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
        <Stack spacing={2}>
          <Button
            variant="contained"
            onClick={onAddClick}
            sx={{ alignSelf: "flex-start" }}
          >
            + Dodaj pojazd
          </Button>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
          >
            <TextField
              label="Wyszukaj..."
              placeholder="VIN, Rejestracja, Marka, Model"
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
                  checked={filters.status === "ACTIVE"}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      status: e.target.checked ? "ACTIVE" : "",
                    }));
                    resetPage();
                  }}
                />
              }
              label="Tylko aktywne"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={filters.status === "SOLD"}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      status: e.target.checked ? "SOLD" : "",
                    }));
                    resetPage();
                  }}
                />
              }
              label="Sprzedane"
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Błąd przy pobieraniu pojazdów: {error.message}
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
          loading={isLoading}
          autoHeight
          disableRowSelectionOnClick
          columnVisibilityModel={
            isMobile ? { vin: false, year: false, mileage: false } : {}
          }
        />
      </Paper>
    </Box>
  );
};

export const VehicleList = memo(VehicleListComponent);
