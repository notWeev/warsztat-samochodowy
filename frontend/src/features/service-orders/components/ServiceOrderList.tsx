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

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  // mechanicId filter is not shown in the list (admins/managers use it via details)

  const debouncedDateFrom = useDebounce(dateFrom, 400);
  const debouncedDateTo = useDebounce(dateTo, 400);

  const { data, isLoading, error } = useServiceOrders(
    page + 1,
    pageSize,
    statusFilter || undefined,
    priorityFilter || undefined,
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

  const clearFilters = () => {
    setStatusFilter("");
    setPriorityFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters =
    !!statusFilter || !!priorityFilter || !!dateFrom || !!dateTo;

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
            value={statusFilter}
            label="Status"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
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
            value={priorityFilter}
            label="Priorytet"
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(0);
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
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(0);
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 160 }}
        />

        {/* Date to */}
        <TextField
          label="Data do"
          type="date"
          size="small"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(0);
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
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={(model: GridPaginationModel) => {
          setPage(model.page);
          setPageSize(model.pageSize);
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        autoHeight
        sx={{
          "& .MuiDataGrid-row": { cursor: "pointer" },
        }}
      />
    </Box>
  );
};

export const ServiceOrderList = memo(ServiceOrderListComponent);
