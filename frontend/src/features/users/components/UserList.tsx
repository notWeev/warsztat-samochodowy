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
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  PersonOff as PersonOffIcon,
} from "@mui/icons-material";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useUsers, useDeleteUser } from "../hooks/useUsers";
import type { StaffUser } from "@/shared/types/user.types";
import {
  USER_ROLE_LABELS,
  USER_ROLE_COLORS,
  USER_STATUS_LABELS,
  USER_STATUS_COLORS,
} from "@/shared/types/user.types";
import { UserRole } from "@/shared/types/auth.types";
import { useAuth } from "@/features/auth/context/AuthContext";

interface UserListProps {
  onEdit: (user: StaffUser) => void;
  onView: (user: StaffUser) => void;
  onAddClick: () => void;
}

const ROLES = Object.values(UserRole);

const UserListComponent = ({ onEdit, onView, onAddClick }: UserListProps) => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [filters, setFilters] = useState({ search: "", role: "", status: "" });

  const debouncedSearch = useDebounce(filters.search, 500);

  const { data, isLoading, error } = useUsers({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    role: filters.role || undefined,
    status: filters.status || undefined,
  });

  const deleteMutation = useDeleteUser();

  const resetPage = () => setPaginationModel((prev) => ({ ...prev, page: 0 }));

  // Client-side search filter (API doesn't support search param)
  const rows = debouncedSearch
    ? (data?.data ?? []).filter((u) => {
        const q = debouncedSearch.toLowerCase();
        return (
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone ?? "").includes(q)
        );
      })
    : (data?.data ?? []);

  const handleDelete = useCallback(
    async (user: StaffUser) => {
      if (
        window.confirm(
          `Czy na pewno chcesz dezaktywować pracownika ${user.firstName} ${user.lastName}?`,
        )
      ) {
        try {
          await deleteMutation.mutateAsync(user.id);
        } catch {
          // handled by mutation error state
        }
      }
    },
    [deleteMutation],
  );

  const formatLastLogin = (lastLoginAt?: string) => {
    if (!lastLoginAt) return "Nigdy";
    return new Date(lastLoginAt).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Pracownik",
      flex: 1,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<StaffUser>) => (
        <span>
          {params.row.firstName} {params.row.lastName}
        </span>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<StaffUser>) =>
        params.row.email || "—",
    },
    {
      field: "role",
      headerName: "Rola",
      width: 150,
      renderCell: (params: GridRenderCellParams<StaffUser>) => (
        <Chip
          label={USER_ROLE_LABELS[params.row.role]}
          color={USER_ROLE_COLORS[params.row.role]}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params: GridRenderCellParams<StaffUser>) => (
        <Chip
          label={USER_STATUS_LABELS[params.row.status]}
          color={USER_STATUS_COLORS[params.row.status]}
          size="small"
        />
      ),
    },
    {
      field: "phone",
      headerName: "Telefon",
      width: 130,
      renderCell: (params) => params.row.phone || "—",
    },
    {
      field: "lastLoginAt",
      headerName: "Ostatnie logowanie",
      width: 170,
      renderCell: (params: GridRenderCellParams<StaffUser>) =>
        formatLastLogin(params.row.lastLoginAt),
    },
    {
      field: "actions",
      headerName: "Akcje",
      width: isAdmin ? 130 : 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams<StaffUser>) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Szczegóły">
            <IconButton size="small" onClick={() => onView(params.row)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {isAdmin && (
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
              <Tooltip
                title={
                  params.row.id === currentUser?.id
                    ? "Nie możesz dezaktywować własnego konta"
                    : "Dezaktywuj"
                }
              >
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(params.row)}
                    disabled={
                      deleteMutation.isPending ||
                      params.row.id === currentUser?.id
                    }
                  >
                    <PersonOffIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2}>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddClick}
              sx={{ alignSelf: "flex-start" }}
            >
              Dodaj pracownika
            </Button>
          )}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            flexWrap="wrap"
          >
            <TextField
              label="Wyszukaj..."
              placeholder="Imię, nazwisko, email, telefon"
              size="small"
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, search: e.target.value }));
                resetPage();
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Rola</InputLabel>
              <Select
                value={filters.role}
                label="Rola"
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, role: e.target.value }));
                  resetPage();
                }}
              >
                <MenuItem value="">Wszystkie role</MenuItem>
                {ROLES.map((r) => (
                  <MenuItem key={r} value={r}>
                    {USER_ROLE_LABELS[r]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, status: e.target.value }));
                  resetPage();
                }}
              >
                <MenuItem value="">Wszystkie statusy</MenuItem>
                <MenuItem value="ACTIVE">Aktywni</MenuItem>
                <MenuItem value="INACTIVE">Nieaktywni</MenuItem>
                <MenuItem value="SUSPENDED">Zawieszeni</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Błąd podczas ładowania pracowników
        </Alert>
      )}

      <Paper>
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={data?.total ?? 0}
          loading={isLoading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight
          rowHeight={56}
          columnVisibilityModel={
            isMobile ? { phone: false, lastLoginAt: false, status: false } : {}
          }
          sx={{ minHeight: 400 }}
        />
      </Paper>
    </Box>
  );
};

export const UserList = memo(UserListComponent);
