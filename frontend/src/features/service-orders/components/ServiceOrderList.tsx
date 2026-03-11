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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import {
  useServiceOrders,
  useDeleteServiceOrder,
} from "../hooks/useServiceOrders";
import type {
  ServiceOrder,
  ServiceOrderStatus,
} from "@/shared/types/service-order.types";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  formatDate,
  formatCurrency,
} from "../utils/serviceOrderUtils";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useAuth } from "@/features/auth/context/AuthContext";

interface ServiceOrderListProps {
  onView: (order: ServiceOrder) => void;
  onEdit: (order: ServiceOrder) => void;
  onAddClick: () => void;
}

const ServiceOrderListComponent = ({
  onView,
  onEdit,
  onAddClick,
}: ServiceOrderListProps) => {
  const { user } = useAuth();
  const isMechanic = user?.role === "MECHANIC";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    dateFrom: "",
    dateTo: "",
  });

  const debouncedDateFrom = useDebounce(filters.dateFrom, 400);
  const debouncedDateTo = useDebounce(filters.dateTo, 400);

  const { data, isLoading, error } = useServiceOrders(
    paginationModel.page + 1,
    paginationModel.pageSize,
    filters.status || undefined,
    filters.priority || undefined,
    undefined,
    undefined,
    debouncedDateFrom || undefined,
    debouncedDateTo || undefined,
  );

  const deleteMutation = useDeleteServiceOrder();

  const handleDelete = useCallback(
    async (order: ServiceOrder) => {
      if (
        window.confirm(
          `Czy na pewno chcesz usunąć zlecenie ${order.orderNumber}?`,
        )
      ) {
        try {
          await deleteMutation.mutateAsync(order.id);
        } catch (err) {
          console.error("Error deleting order:", err);
        }
      }
    },
    [deleteMutation],
  );

  const resetPage = () => setPaginationModel((prev) => ({ ...prev, page: 0 }));

  const columns: GridColDef[] = [
    {
      field: "orderNumber",
      headerName: "Nr zlecenia",
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "primary.main", cursor: "pointer" }}
          onClick={() => onView(params.row as ServiceOrder)}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={STATUS_LABELS[params.value as ServiceOrderStatus]}
          color={STATUS_COLORS[params.value as ServiceOrderStatus]}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "priority",
      headerName: "Priorytet",
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={PRIORITY_LABELS[params.value as keyof typeof PRIORITY_LABELS]}
          color={PRIORITY_COLORS[params.value as keyof typeof PRIORITY_COLORS]}
          size="small"
        />
      ),
    },
    {
      field: "customer",
      headerName: "Klient",
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => {
        const order = params.row as ServiceOrder;
        const c = order.customer;
        if (!c) return "—";
        return c.type === "INDIVIDUAL"
          ? `${c.firstName} ${c.lastName}`
          : c.companyName;
      },
    },
    {
      field: "vehicle",
      headerName: "Pojazd",
      flex: 1,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams) => {
        const order = params.row as ServiceOrder;
        const v = order.vehicle;
        if (!v) return "—";
        return `${v.brand} ${v.model} (${v.registrationNumber || v.vin.slice(-6)})`;
      },
    },
    {
      field: "assignedMechanic",
      headerName: "Mechanik",
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const order = params.row as ServiceOrder;
        const m = order.assignedMechanic;
        return m ? `${m.firstName} ${m.lastName}` : "—";
      },
    },
    {
      field: "totalCost",
      headerName: "Koszt",
      width: 110,
      renderCell: (params: GridRenderCellParams) =>
        formatCurrency(params.value as number),
    },
    {
      field: "scheduledAt",
      headerName: "Data",
      width: 110,
      renderCell: (params: GridRenderCellParams) =>
        formatDate(params.value as string | undefined),
    },
    {
      field: "actions",
      headerName: "Akcje",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Szczegóły">
            <IconButton
              size="small"
              onClick={() => onView(params.row as ServiceOrder)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {!isMechanic && (
            <Tooltip title="Edytuj">
              <IconButton
                size="small"
                onClick={() => onEdit(params.row as ServiceOrder)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {user?.role === "ADMIN" && (
            <Tooltip title="Usuń">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(params.row as ServiceOrder)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  const clearFilters = () =>
    setFilters({ status: "", priority: "", dateFrom: "", dateTo: "" });

  const hasActiveFilters =
    !!filters.status ||
    !!filters.priority ||
    !!filters.dateFrom ||
    !!filters.dateTo;

  return (
    <Box>
      {/* Toolbar */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ mb: 2 }}
        flexWrap="wrap"
      >
        {/* Status filter */}
        <FormControl size="small" sx={{ minWidth: 170 }}>
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
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <MenuItem key={val} value={val}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Priority filter */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Priorytet</InputLabel>
          <Select
            value={filters.priority}
            label="Priorytet"
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, priority: e.target.value }));
              resetPage();
            }}
          >
            <MenuItem value="">Wszystkie</MenuItem>
            {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
              <MenuItem key={val} value={val}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Date from */}
        <TextField
          label="Data od"
          type="date"
          size="small"
          value={filters.dateFrom}
          onChange={(e) => {
            setFilters((prev) => ({ ...prev, dateFrom: e.target.value }));
            resetPage();
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 160 }}
        />

        {/* Date to */}
        <TextField
          label="Data do"
          type="date"
          size="small"
          value={filters.dateTo}
          onChange={(e) => {
            setFilters((prev) => ({ ...prev, dateTo: e.target.value }));
            resetPage();
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 160 }}
        />

        {hasActiveFilters && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={clearFilters}
          >
            Wyczyść
          </Button>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {!isMechanic && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddClick}
            size="small"
          >
            Nowe zlecenie
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Błąd wczytywania zleceń
        </Alert>
      )}

      <DataGrid
        rows={data?.data || []}
        columns={columns}
        loading={isLoading}
        rowCount={data?.total || 0}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        autoHeight
        columnVisibilityModel={
          isMobile
            ? { priority: false, assignedMechanic: false, totalCost: false }
            : {}
        }
        sx={{
          "& .MuiDataGrid-row": { cursor: "pointer" },
        }}
      />
    </Box>
  );
};

export const ServiceOrderList = memo(ServiceOrderListComponent);
