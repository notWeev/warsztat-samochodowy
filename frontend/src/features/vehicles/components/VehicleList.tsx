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
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const debouncedSearch = useDebounce(search, 500);

  // Fetch vehicles
  const { data, isLoading, error } = useVehicles(
    page + 1,
    pageSize,
    debouncedSearch,
    customerId,
    statusFilter || undefined,
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
        const statusLabels: Record<string, string> = {
          ACTIVE: "Aktywny",
          SOLD: "Sprzedany",
          SCRAPPED: "Złomowany",
          INACTIVE: "Nieaktywny",
        };
        return statusLabels[params.row.status] || params.row.status;
      },
    },
    {
      field: "actions",
      headerName: "Akcje",
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Vehicle>) => (
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
              disabled={deleteVehicle.isPending}
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
                  checked={statusFilter === "ACTIVE"}
                  onChange={(e) => {
                    setStatusFilter(e.target.checked ? "ACTIVE" : "");
                    setPage(0);
                  }}
                />
              }
              label="Tylko aktywne"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={statusFilter === "SOLD"}
                  onChange={(e) => {
                    setStatusFilter(e.target.checked ? "SOLD" : "");
                    setPage(0);
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

export const VehicleList = memo(VehicleListComponent);
