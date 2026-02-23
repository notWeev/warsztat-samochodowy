import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { useState } from "react";
import type { Vehicle } from "@/shared/types/vehicle.types";
import { useVehicle } from "../hooks/useVehicles";

interface VehicleDetailsModalProps {
  open: boolean;
  vehicleId?: string;
  onClose: () => void;
  onEdit: (vehicle: Vehicle) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vehicle-tabpanel-${index}`}
      aria-labelledby={`vehicle-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Aktywny",
  SOLD: "Sprzedany",
  SCRAPPED: "Złomowany",
  INACTIVE: "Nieaktywny",
};

const fuelTypeLabels: Record<string, string> = {
  PETROL: "Benzyna",
  DIESEL: "Diesel",
  LPG: "LPG",
  ELECTRIC: "Elektryczny",
  HYBRID: "Hybrydowy",
  PLUGIN_HYBRID: "Plug-in Hybrid",
};

export const VehicleDetailsModal = ({
  open,
  vehicleId,
  onClose,
  onEdit,
}: VehicleDetailsModalProps) => {
  const [tabValue, setTabValue] = useState(0);
  const { data: vehicle, isLoading, error } = useVehicle(vehicleId || "");

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  if (error || !vehicle) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Błąd</DialogTitle>
        <DialogContent>
          <Alert severity="error">
            Nie udało się pobrać szczegółów pojazdu
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Zamknij</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const displayName = `${vehicle.brand} ${vehicle.model}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Typography variant="h6" component="span">
              {displayName}
            </Typography>
            <Chip
              label={statusLabels[vehicle.status] || vehicle.status}
              size="small"
              sx={{ ml: 1 }}
            />
          </div>
          <Button
            startIcon={<EditIcon />}
            onClick={() => {
              onEdit(vehicle);
              onClose();
            }}
          >
            Edytuj
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="vehicle details tabs"
          sx={{ mb: 2 }}
        >
          <Tab label="Informacje" id="vehicle-tab-0" />
          <Tab label="Historia serwisowa" id="vehicle-tab-1" />
          <Tab label="Statystyki" id="vehicle-tab-2" />
        </Tabs>

        {/* Informacje Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <Box>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Dane pojazdu
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>VIN:</strong> {vehicle.vin}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Marka:</strong> {vehicle.brand}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Model:</strong> {vehicle.model}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Rok:</strong> {vehicle.year}
                  </Typography>
                </Box>
              </Paper>
            </Box>

            <Box>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Eksploatacja
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Przebieg:</strong>{" "}
                    {vehicle.mileage.toLocaleString("pl-PL")} km
                  </Typography>
                  <Typography variant="body2">
                    <strong>Nr. rejestracyjny:</strong>{" "}
                    {vehicle.registrationNumber || "-"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Kolor:</strong> {vehicle.color || "-"}
                  </Typography>
                </Box>
              </Paper>
            </Box>

            <Box>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Silnik
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Typ paliwa:</strong>{" "}
                    {vehicle.fuelType ? fuelTypeLabels[vehicle.fuelType] : "-"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Pojemność:</strong>{" "}
                    {vehicle.engineCapacity
                      ? `${vehicle.engineCapacity} cm³`
                      : "-"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Moc:</strong>{" "}
                    {vehicle.enginePower ? `${vehicle.enginePower} KM` : "-"}
                  </Typography>
                </Box>
              </Paper>
            </Box>

            <Box>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Właściciel
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Klient:</strong>{" "}
                    {vehicle.customer
                      ? vehicle.customer.type === "INDIVIDUAL"
                        ? `${vehicle.customer.firstName} ${vehicle.customer.lastName}`
                        : vehicle.customer.companyName
                      : "-"}
                  </Typography>
                </Box>
              </Paper>
            </Box>

            {vehicle.notes && (
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Notatki
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, whiteSpace: "pre-wrap" }}
                  >
                    {vehicle.notes}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Historia serwisowa Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body2" color="textSecondary">
            Historia serwisowa - integracja w kolejnym etapie (moduł Service
            Orders)
          </Typography>
          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Data</TableCell>
                <TableCell>Typ naprawy</TableCell>
                <TableCell>Koszt</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="textSecondary">
                    Brak historii serwisowej
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabPanel>

        {/* Statystyki Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <Box>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  -
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Łączny koszt napraw
                </Typography>
              </Paper>
            </Box>
            <Box>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  -
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Liczba wizyt
                </Typography>
              </Paper>
            </Box>
            <Box>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  -
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Średni koszt naprawy
                </Typography>
              </Paper>
            </Box>
            <Box>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {vehicle.mileage.toLocaleString("pl-PL")} km
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Aktualny przebieg
                </Typography>
              </Paper>
            </Box>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Zamknij</Button>
      </DialogActions>
    </Dialog>
  );
};
