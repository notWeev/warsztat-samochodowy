import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  Typography,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Divider,
  IconButton,
  Autocomplete,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  CircularProgress,
  Tab,
  Tabs,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import type { ServiceOrder } from "@/shared/types/service-order.types";
import {
  useUpdateServiceOrder,
  useOrderParts,
  useAddPartToOrder,
  useRemoveOrderPart,
  useMechanics,
  useParts,
} from "../hooks/useServiceOrders";
import {
  updateServiceOrderSchema,
  addPartSchema,
} from "../schemas/serviceOrderSchemas";
import type {
  UpdateServiceOrderFormData,
  AddPartFormData,
} from "../schemas/serviceOrderSchemas";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  ALLOWED_TRANSITIONS,
  formatCurrency,
  formatDateTime,
  formatDate,
} from "../utils/serviceOrderUtils";
import { useSnackbar } from "@/shared/hooks/useSnackbar";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useAuth } from "@/features/auth/context/AuthContext";

// ─── Tab Panel ────────────────────────────────────────────────────────────────

const TabPanel = ({
  value,
  index,
  children,
}: {
  value: number;
  index: number;
  children: React.ReactNode;
}) => (value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null);

// ─── Parts Section ────────────────────────────────────────────────────────────

const PartsSection = ({ orderId }: { orderId: string }) => {
  const { showSnackbar } = useSnackbar();
  const { user } = useAuth();
  const canEdit = user?.role !== "RECEPTION";
  const [partSearch, setPartSearch] = useState("");
  const debouncedSearch = useDebounce(partSearch, 400);

  const { data: orderParts = [], isLoading: partsLoading } =
    useOrderParts(orderId);
  const { data: catalogData } = useParts(debouncedSearch, 1, 50);
  const catalogParts = catalogData?.data || [];
  const addPart = useAddPartToOrder(orderId);
  const removePart = useRemoveOrderPart(orderId);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddPartFormData>({
    resolver: zodResolver(addPartSchema) as any,
    defaultValues: { partId: "", quantity: 1, unitPrice: "" as any, notes: "" },
  });

  const getError = (e: any) =>
    typeof e?.message === "string" ? e.message : "";

  const onAddPart = async (data: AddPartFormData) => {
    try {
      await addPart.mutateAsync({
        partId: data.partId,
        quantity: Number(data.quantity),
        unitPrice: data.unitPrice ? Number(data.unitPrice) : undefined,
        notes: data.notes || undefined,
      });
      showSnackbar("Część została dodana", "success", 2000);
      reset();
      setPartSearch("");
    } catch (err) {
      showSnackbar("Błąd przy dodawaniu części", "error", 4000);
    }
  };

  const onRemovePart = async (partEntryId: string, name: string) => {
    if (window.confirm(`Usunąć "${name}" ze zlecenia?`)) {
      try {
        await removePart.mutateAsync(partEntryId);
        showSnackbar("Część została usunięta", "success", 2000);
      } catch {
        showSnackbar("Błąd przy usuwaniu części", "error", 4000);
      }
    }
  };

  return (
    <Box>
      {/* Used parts table */}
      {partsLoading ? (
        <CircularProgress size={24} />
      ) : orderParts.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Brak dodanych części
        </Typography>
      ) : (
        <Table size="small" sx={{ mb: 3 }}>
          <TableHead>
            <TableRow>
              <TableCell>Część</TableCell>
              <TableCell align="right">Ilość</TableCell>
              <TableCell align="right">Cena jedn.</TableCell>
              <TableCell align="right">Razem</TableCell>
              {canEdit && <TableCell />}
            </TableRow>
          </TableHead>
          <TableBody>
            {orderParts.map((op) => (
              <TableRow key={op.id}>
                <TableCell>
                  <Typography variant="body2">
                    {op.part?.name || op.partId}
                  </Typography>
                  {op.part?.partNumber && (
                    <Typography variant="caption" color="text.secondary">
                      {op.part.partNumber}
                    </Typography>
                  )}
                  {op.notes && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {op.notes}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">{op.quantity}</TableCell>
                <TableCell align="right">
                  {formatCurrency(op.unitPrice)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(op.totalPrice)}
                </TableCell>
                {canEdit && (
                  <TableCell>
                    <Tooltip title="Usuń część">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          onRemovePart(op.id, op.part?.name || op.partId)
                        }
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={canEdit ? 3 : 3} sx={{ fontWeight: 600 }}>
                Suma części
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {formatCurrency(
                  orderParts.reduce((s, p) => s + Number(p.totalPrice), 0),
                )}
              </TableCell>
              {canEdit && <TableCell />}
            </TableRow>
          </TableBody>
        </Table>
      )}

      {/* Add part form */}
      {canEdit && (
        <Box component="form" onSubmit={handleSubmit(onAddPart)}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Dodaj część
          </Typography>
          <Stack spacing={1.5}>
            <Controller
              name="partId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={catalogParts}
                  getOptionLabel={(p) => `${p.name} (${p.partNumber})`}
                  filterOptions={(x) => x}
                  isOptionEqualToValue={(o, v) =>
                    typeof v === "string" ? o.id === v : o.id === v?.id
                  }
                  onChange={(_, value) => {
                    field.onChange(value?.id || "");
                    setPartSearch("");
                  }}
                  value={catalogParts.find((p) => p.id === field.value) || null}
                  onInputChange={(_, val) => setPartSearch(val)}
                  noOptionsText="Wpisz nazwę lub numer części"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Część z magazynu"
                      size="small"
                      error={!!errors.partId}
                      helperText={getError(errors.partId)}
                      required
                    />
                  )}
                />
              )}
            />

            <Stack direction="row" spacing={1.5}>
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ilość"
                    type="number"
                    size="small"
                    sx={{ width: 100 }}
                    inputProps={{ min: 1 }}
                    error={!!errors.quantity}
                    helperText={getError(errors.quantity)}
                  />
                )}
              />
              <Controller
                name="unitPrice"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Cena jedn. (PLN, opcjonalnie)"
                    type="number"
                    size="small"
                    sx={{ flex: 1 }}
                    inputProps={{ min: 0, step: "0.01" }}
                    error={!!errors.unitPrice}
                    helperText={
                      getError(errors.unitPrice) || "Puste = cena z magazynu"
                    }
                  />
                )}
              />
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notatka"
                    size="small"
                    sx={{ flex: 1 }}
                    error={!!errors.notes}
                  />
                )}
              />
            </Stack>

            <Button
              type="submit"
              variant="outlined"
              size="small"
              startIcon={
                addPart.isPending ? <CircularProgress size={14} /> : <AddIcon />
              }
              disabled={addPart.isPending}
              sx={{ alignSelf: "flex-start" }}
            >
              Dodaj część
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

// ─── Main Modal ────────────────────────────────────────────────────────────────

interface ServiceOrderDetailsModalProps {
  open: boolean;
  order: ServiceOrder | null;
  onClose: () => void;
}

export const ServiceOrderDetailsModal = ({
  open,
  order,
  onClose,
}: ServiceOrderDetailsModalProps) => {
  const [tab, setTab] = useState(0);
  const { showSnackbar } = useSnackbar();
  const { user } = useAuth();
  const isMechanic = user?.role === "MECHANIC";
  const isReception = user?.role === "RECEPTION";

  const updateMutation = useUpdateServiceOrder(order?.id || "");
  const { data: mechanics = [] } = useMechanics();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateServiceOrderFormData>({
    resolver: zodResolver(updateServiceOrderSchema) as any,
    mode: "onBlur",
    values: order
      ? {
          description: order.description,
          priority: order.priority as any,
          status: order.status as any,
          scheduledAt: order.scheduledAt
            ? new Date(order.scheduledAt).toISOString().slice(0, 16)
            : "",
          assignedMechanicId: order.assignedMechanicId || "",
          laborCost: order.laborCost ?? ("" as any),
          mechanicNotes: order.mechanicNotes || "",
          internalNotes: order.internalNotes || "",
        }
      : undefined,
  });

  const getError = (e: any) =>
    typeof e?.message === "string" ? e.message : "";

  const handleSave = useCallback(
    async (data: UpdateServiceOrderFormData) => {
      if (!order) return;
      try {
        await updateMutation.mutateAsync({
          description: data.description,
          priority: data.priority as any,
          status: data.status as any,
          scheduledAt: data.scheduledAt || undefined,
          assignedMechanicId: data.assignedMechanicId || undefined,
          laborCost:
            data.laborCost !== undefined && data.laborCost !== ""
              ? Number(data.laborCost)
              : undefined,
          mechanicNotes: data.mechanicNotes || undefined,
          internalNotes: data.internalNotes || undefined,
        });
        showSnackbar("Zlecenie zostało zaktualizowane", "success", 3000);
        reset(data);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Błąd aktualizacji zlecenia";
        showSnackbar(msg, "error", 5000);
      }
    },
    [order, updateMutation, showSnackbar, reset],
  );

  if (!order) return null;

  const allowedNextStatuses = ALLOWED_TRANSITIONS[order.status] || [];
  const customer = order.customer;
  const vehicle = order.vehicle;
  const mechanic = order.assignedMechanic;

  const customerName = customer
    ? customer.type === "INDIVIDUAL"
      ? `${customer.firstName} ${customer.lastName}`
      : customer.companyName || "—"
    : "—";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: "70vh" } }}
    >
      {/* ── Header ── */}
      <DialogTitle component="div" sx={{ pb: 1 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Stack spacing={0.5}>
            <Typography variant="h6">{order.orderNumber}</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={STATUS_LABELS[order.status]}
                color={STATUS_COLORS[order.status]}
                size="small"
              />
              <Chip
                label={PRIORITY_LABELS[order.priority]}
                color={PRIORITY_COLORS[order.priority]}
                size="small"
                variant="outlined"
              />
            </Stack>
          </Stack>
          <IconButton size="small" onClick={onClose} sx={{ mt: -0.5 }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      {/* ── Summary row ── */}
      <Box sx={{ px: 3, py: 1.5, bgcolor: "grey.50" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          flexWrap="wrap"
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Klient
            </Typography>
            <Typography variant="body2">{customerName}</Typography>
          </Box>
          {vehicle && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Pojazd
              </Typography>
              <Typography variant="body2">
                {vehicle.brand} {vehicle.model} {vehicle.year}
                {vehicle.registrationNumber &&
                  ` — ${vehicle.registrationNumber}`}
              </Typography>
            </Box>
          )}
          {mechanic && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Mechanik
              </Typography>
              <Typography variant="body2">
                {mechanic.firstName} {mechanic.lastName}
              </Typography>
            </Box>
          )}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Koszt łączny
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatCurrency(order.totalCost)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Przyięto
            </Typography>
            <Typography variant="body2">
              {formatDate(order.createdAt)}
            </Typography>
          </Box>
          {order.scheduledAt && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Planowane
              </Typography>
              <Typography variant="body2">
                {formatDateTime(order.scheduledAt)}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      <Divider />

      {/* ── Tabs ── */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ px: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Szczegóły" />
        <Tab label="Części zamienne" />
        <Tab label="Koszty" />
      </Tabs>

      <DialogContent sx={{ pt: 0 }}>
        <Box component="form" onSubmit={handleSubmit(handleSave)}>
          {/* ── TAB 0: Details / Edit ── */}
          <TabPanel value={tab} index={0}>
            <Stack spacing={2.5}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Opis usterki / zakres prac"
                    multiline
                    rows={4}
                    fullWidth
                    disabled={isReception}
                    error={!!errors.description}
                    helperText={getError(errors.description)}
                  />
                )}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                {/* Status change */}
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={!!errors.status}
                      disabled={isReception && allowedNextStatuses.length === 0}
                    >
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        {/* Current status always available */}
                        <MenuItem value={order.status}>
                          {STATUS_LABELS[order.status]} (obecny)
                        </MenuItem>
                        {allowedNextStatuses.map((s) => (
                          <MenuItem key={s} value={s}>
                            → {STATUS_LABELS[s]}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.status && (
                        <FormHelperText>
                          {getError(errors.status)}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />

                {/* Priority */}
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth disabled={isMechanic}>
                      <InputLabel>Priorytet</InputLabel>
                      <Select {...field} label="Priorytet">
                        <MenuItem value="LOW">Niski</MenuItem>
                        <MenuItem value="NORMAL">Normalny</MenuItem>
                        <MenuItem value="HIGH">Wysoki</MenuItem>
                        <MenuItem value="URGENT">Pilny</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                {/* Mechanic assignment */}
                <Controller
                  name="assignedMechanicId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      sx={{ flex: 1 }}
                      options={mechanics}
                      disabled={isMechanic}
                      getOptionLabel={(m) => `${m.firstName} ${m.lastName}`}
                      isOptionEqualToValue={(o, v) =>
                        typeof v === "string" ? o.id === v : o.id === v?.id
                      }
                      onChange={(_, value) => field.onChange(value?.id || "")}
                      value={
                        mechanics.find((m) => m.id === field.value) || null
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Przypisany mechanik"
                          error={!!errors.assignedMechanicId}
                          helperText={getError(errors.assignedMechanicId)}
                        />
                      )}
                    />
                  )}
                />

                {/* Scheduled at */}
                <Controller
                  name="scheduledAt"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Planowana data"
                      type="datetime-local"
                      sx={{ flex: 1 }}
                      slotProps={{ inputLabel: { shrink: true } }}
                      disabled={isMechanic}
                    />
                  )}
                />
              </Stack>

              {/* Labor cost */}
              <Controller
                name="laborCost"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Koszt robocizny (PLN)"
                    type="number"
                    fullWidth
                    inputProps={{ min: 0, step: "0.01" }}
                    error={!!errors.laborCost}
                    helperText={getError(errors.laborCost)}
                    disabled={isReception}
                  />
                )}
              />

              {/* Mechanic notes */}
              <Controller
                name="mechanicNotes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notatki mechanika"
                    multiline
                    rows={3}
                    fullWidth
                    disabled={isReception}
                    error={!!errors.mechanicNotes}
                    helperText={getError(errors.mechanicNotes)}
                  />
                )}
              />

              {/* Internal notes (hidden from mechanic) */}
              {!isMechanic && (
                <Controller
                  name="internalNotes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notatki wewnętrzne"
                      multiline
                      rows={2}
                      fullWidth
                      error={!!errors.internalNotes}
                      helperText={getError(errors.internalNotes)}
                    />
                  )}
                />
              )}
            </Stack>
          </TabPanel>

          {/* ── TAB 1: Parts ── */}
          <TabPanel value={tab} index={1}>
            <PartsSection orderId={order.id} />
          </TabPanel>

          {/* ── TAB 2: Costs ── */}
          <TabPanel value={tab} index={2}>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Podsumowanie kosztów
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Koszt robocizny
                  </Typography>
                  <Typography variant="body2">
                    {formatCurrency(order.laborCost)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Koszt części
                  </Typography>
                  <Typography variant="body2">
                    {formatCurrency(order.partsCost)}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1" fontWeight={700}>
                    Łączny koszt
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="primary">
                    {formatCurrency(order.totalCost)}
                  </Typography>
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Historia czasowa
              </Typography>
              <Stack spacing={0.5}>
                {[
                  ["Przyjęto", order.createdAt],
                  ["Zaplanowano", order.scheduledAt],
                  ["Rozpoczęto", order.startedAt],
                  ["Ukończono", order.completedAt],
                  ["Zamknięto", order.closedAt],
                ].map(([label, date]) =>
                  date ? (
                    <Stack
                      key={label as string}
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Typography variant="body2" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="body2">
                        {formatDateTime(date as string)}
                      </Typography>
                    </Stack>
                  ) : null,
                )}
              </Stack>
            </Paper>
          </TabPanel>

          {/* Save button shown only on detail/edit tab */}
          {tab === 0 && !isReception && (
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  updateMutation.isPending ? (
                    <CircularProgress size={18} />
                  ) : (
                    <SaveIcon />
                  )
                }
                disabled={updateMutation.isPending || !isDirty}
              >
                Zapisz zmiany
              </Button>
            </Stack>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Zamknij
        </Button>
      </DialogActions>
    </Dialog>
  );
};
