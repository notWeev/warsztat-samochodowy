import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
  VerifiedUser as VerifiedIcon,
  Block as BlockIcon,
} from "@mui/icons-material";
import { useUser } from "../hooks/useUsers";
import type { StaffUser } from "@/shared/types/user.types";
import {
  USER_ROLE_LABELS,
  USER_ROLE_COLORS,
  USER_STATUS_LABELS,
  USER_STATUS_COLORS,
} from "@/shared/types/user.types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { UserRole } from "@/shared/types/auth.types";

interface UserDetailsModalProps {
  open: boolean;
  userId?: string;
  onClose: () => void;
  onEdit: (user: StaffUser) => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (firstName: string, lastName: string) =>
  `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

const AVATAR_COLORS: Record<string, string> = {
  ADMIN: "#d32f2f",
  MANAGER: "#ed6c02",
  MECHANIC: "#1976d2",
  RECEPTION: "#0288d1",
};

export const UserDetailsModal = ({
  open,
  userId,
  onClose,
  onEdit,
}: UserDetailsModalProps) => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const { data: user, isLoading, error } = useUser(userId ?? "");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={false}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Typography variant="h6">Szczegóły pracownika</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Alert severity="error">
            Nie udało się załadować danych pracownika
          </Alert>
        )}
        {user && (
          <Stack spacing={3}>
            {/* Header — avatar + name + chips */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: AVATAR_COLORS[user.role] ?? "grey.500",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                }}
              >
                {getInitials(user.firstName, user.lastName)}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h5" fontWeight={700}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
                  <Chip
                    label={USER_ROLE_LABELS[user.role]}
                    color={USER_ROLE_COLORS[user.role]}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={USER_STATUS_LABELS[user.status]}
                    color={USER_STATUS_COLORS[user.status]}
                    size="small"
                  />
                  {user.emailVerified && (
                    <Chip
                      label="Email zweryfikowany"
                      icon={<VerifiedIcon />}
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>
            </Stack>

            <Divider />

            {/* Contact info */}
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Informacje kontaktowe
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <EmailIcon
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    <Typography variant="body2">{user.email}</Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <PhoneIcon
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    <Typography variant="body2">
                      {user.phone || "Brak numeru telefonu"}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Activity */}
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Aktywność konta
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <AccessTimeIcon
                      fontSize="small"
                      sx={{ color: "text.secondary", mt: 0.2 }}
                    />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Ostatnie logowanie
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(user.lastLoginAt)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <CalendarIcon
                      fontSize="small"
                      sx={{ color: "text.secondary", mt: 0.2 }}
                    />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Konto utworzone
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(user.createdAt)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <CalendarIcon
                      fontSize="small"
                      sx={{ color: "text.secondary", mt: 0.2 }}
                    />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Ostatnia zmiana
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(user.updatedAt)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                {user.status === "INACTIVE" && (
                  <Grid size={{ xs: 12 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <BlockIcon
                        fontSize="small"
                        sx={{ color: "error.main" }}
                      />
                      <Typography variant="body2" color="error.main">
                        Konto dezaktywowane
                      </Typography>
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Actions */}
            {isAdmin && (
              <>
                <Divider />
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Tooltip
                    title={
                      user.id === currentUser?.id
                        ? "Nie możesz edytować własnego konta tutaj"
                        : ""
                    }
                  >
                    <span>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => onEdit(user)}
                        disabled={user.id === currentUser?.id}
                      >
                        Edytuj
                      </Button>
                    </span>
                  </Tooltip>
                </Stack>
              </>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};
