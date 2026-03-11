import { useState, useCallback, memo } from "react";
import type {
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useParts, useDeletePart } from "../hooks/useParts";
import type { Part, PartCategory, PartStatus } from "@/shared/types/part.types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { UserRole } from "@/shared/types/auth.types";

const CATEGORY_LABELS: Record<PartCategory, string> = {
  ENGINE: "Silnik",
  BRAKES: "Hamulce",
  SUSPENSION: "Zawieszenie",
  ELECTRICAL: "Elektryka",
  TRANSMISSION: "Skrzynia biegów",
  EXHAUST: "Układ wydechowy",
  FILTERS: "Filtry",
  FLUIDS: "Płyny",
  TIRES: "Opony",
  BODYWORK: "Nadwozie",
  INTERIOR: "Wnętrze",
  OTHER: "Inne",
};

const STATUS_CONFIG: Record<
  PartStatus,
  { label: string; color: "success" | "warning" | "error" | "default" }
> = {
  AVAILABLE: { label: "Dostępna", color: "success" },
  LOW_STOCK: { label: "Niski stan", color: "warning" },
  OUT_OF_STOCK: { label: "Brak w magazynie", color: "error" },
  DISCONTINUED: { label: "Wycofana", color: "default" },
};

interface PartListProps {
  onEdit: (part: Part) => void;
  onView: (part: Part) => void;
  onAddClick: () => void;
}

const PartListComponent = ({ onEdit, onView, onAddClick }: PartListProps) => {
  const { user } = useAuth();
  const canModify =
    user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    lowStock: false,
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  const { data, isLoading, error } = useParts({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: debouncedSearch || undefined,
    category: (filters.category as PartCategory) || undefined,
    status: (filters.status as PartStatus) || undefined,
    lowStock: filters.lowStock || undefined,
  });

  const deletePart = useDeletePart();

  const handleDelete = useCallback(
    async (part: Part) => {
      if (window.confirm(`Czy na pewno chcesz usunąć "${part.name}"?`)) {
        try {
          await deletePart.mutateAsync(part.id);
        } catch (err) {
          console.error("Error deleting part:", err);
        }
      }
    },
    [deletePart],
  );

  const resetPage = () => setPaginationModel((prev) => ({ ...prev, page: 0 }));

  const columns: GridColDef[] = [
    {
      field: "partNumber",
      headerName: "Nr katalogowy",
      width: 140,
    },
    {
      field: "name",
      headerName: "Nazwa",
      flex: 1,
      minWidth: 160,
    },
    {
      field: "category",
      headerName: "Kategoria",
      width: 140,
      renderCell: (params) =>
        CATEGORY_LABELS[params.row.category as PartCategory] ??
        params.row.category,
    },
    {
      field: "quantityInStock",
      headerName: "Stan mag.",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => `${params.row.quantityInStock} szt.`,
    },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      renderCell: (params) => {
        const cfg = STATUS_CONFIG[params.row.status as PartStatus];
        return cfg ? (
          <Chip label={cfg.label} color={cfg.color} size="small" />
        ) : (
          params.row.status
        );
      },
    },
    {
      field: "sellingPrice",
      headerName: "Cena sprzed.",
      width: 120,
      align: "right",
      headerAlign: "right",
      renderCell: (params) =>
        `${Number(params.row.sellingPrice).toFixed(2)} PLN`,
    },
    {
      field: "actions",
      headerName: "Akcje",
      width: canModify ? 140 : 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Part>) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Podgląd">
            <IconButton size="small" onClick={() => onView(params.row)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {canModify && (
            <>
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
                  disabled={deletePart.isPending}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2}>
          {canModify && (
            <Button
              variant="contained"
              onClick={onAddClick}
              sx={{ alignSelf: "flex-start" }}
            >
              + Dodaj część
            </Button>
          )}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
            flexWrap="wrap"
          >
            <TextField
              label="Wyszukaj..."
              placeholder="Nazwa, numer katalogowy"
              size="small"
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, search: e.target.value }));
                resetPage();
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Kategoria</InputLabel>
              <Select
                value={filters.category}
                label="Kategoria"
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, category: e.target.value }));
                  resetPage();
                }}
              >
                <MenuItem value="">Wszystkie</MenuItem>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, status: e.target.value }));
                  resetPage();
                }}
              >
                <MenuItem value="">Wszystkie</MenuItem>
                {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant={filters.lowStock ? "contained" : "outlined"}
              color="warning"
              size="small"
              onClick={() => {
                setFilters((prev) => ({ ...prev, lowStock: !prev.lowStock }));
                resetPage();
              }}
            >
              Tylko niski stan
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Błąd podczas ładowania części
        </Alert>
      )}

      <Paper>
        <DataGrid
          rows={data?.data ?? []}
          columns={columns}
          rowCount={data?.total ?? 0}
          loading={isLoading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight
          columnVisibilityModel={
            isMobile ? { partNumber: false, category: false } : {}
          }
          sx={{ minHeight: 400 }}
        />
      </Paper>
    </Box>
  );
};

export const PartList = memo(PartListComponent);
