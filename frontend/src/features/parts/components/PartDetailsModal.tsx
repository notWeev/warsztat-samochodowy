import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import type { Part, PartCategory, PartStatus } from "@/shared/types/part.types";
import { usePart } from "../hooks/useParts";

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

interface InfoRowProps {
  label: string;
  value?: string | number | null;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <Stack direction="row" spacing={1} sx={{ py: 0.5 }}>
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>
      {label}:
    </Typography>
    <Typography variant="body2">{value ?? "—"}</Typography>
  </Stack>
);

interface PartDetailsModalProps {
  open: boolean;
  partId?: string;
  onClose: () => void;
  onEdit: (part: Part) => void;
}

export const PartDetailsModal = ({
  open,
  partId,
  onClose,
  onEdit,
}: PartDetailsModalProps) => {
  const { data: part, isLoading, error } = usePart(partId ?? "");

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent
          sx={{ display: "flex", justifyContent: "center", py: 4 }}
        >
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !part) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Alert severity="error">Nie udało się załadować danych części</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Zamknij</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const statusCfg = STATUS_CONFIG[part.status];
  const stockProgress = Math.min(
    100,
    part.minStockLevel > 0
      ? (part.quantityInStock / (part.minStockLevel * 2)) * 100
      : 100,
  );
  const stockColor =
    part.status === "OUT_OF_STOCK"
      ? "error"
      : part.status === "LOW_STOCK"
        ? "warning"
        : "success";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h6">{part.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {part.partNumber}
            </Typography>
          </Box>
          {statusCfg && (
            <Chip
              label={statusCfg.label}
              color={statusCfg.color}
              size="small"
            />
          )}
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {/* Podstawowe */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Podstawowe informacje
        </Typography>
        <InfoRow
          label="Kategoria"
          value={CATEGORY_LABELS[part.category] ?? part.category}
        />
        <InfoRow label="Producent" value={part.manufacturer} />
        <InfoRow label="Marka" value={part.brand} />
        {part.description && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Opis:
            </Typography>
            <Typography variant="body2">{part.description}</Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Stan magazynowy */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Stan magazynowy
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2">
            {part.quantityInStock} / min. {part.minStockLevel} szt.
          </Typography>
        </Stack>
        <Tooltip
          title={`${part.quantityInStock} szt. (min. ${part.minStockLevel})`}
        >
          <LinearProgress
            variant="determinate"
            value={stockProgress}
            color={stockColor}
            sx={{ height: 8, borderRadius: 4, mb: 1 }}
          />
        </Tooltip>
        <InfoRow label="Lokalizacja" value={part.location} />

        <Divider sx={{ my: 2 }} />

        {/* Ceny */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Ceny
        </Typography>
        <InfoRow
          label="Cena zakupu"
          value={`${Number(part.purchasePrice).toFixed(2)} PLN`}
        />
        <InfoRow
          label="Cena sprzedaży"
          value={`${Number(part.sellingPrice).toFixed(2)} PLN`}
        />

        {/* Dostawca */}
        {(part.supplier || part.supplierEmail || part.supplierPhone) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Dostawca
            </Typography>
            <InfoRow label="Nazwa" value={part.supplier} />
            <InfoRow label="Email" value={part.supplierEmail} />
            <InfoRow label="Telefon" value={part.supplierPhone} />
          </>
        )}

        {/* Kompatybilne pojazdy */}
        {part.compatibleVehicles && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Kompatybilne pojazdy
            </Typography>
            <Typography variant="body2">{part.compatibleVehicles}</Typography>
          </>
        )}

        {/* Uwagi */}
        {part.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Uwagi
            </Typography>
            <Typography variant="body2">{part.notes}</Typography>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Zamknij</Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => {
            onEdit(part);
            onClose();
          }}
        >
          Edytuj
        </Button>
      </DialogActions>
    </Dialog>
  );
};
