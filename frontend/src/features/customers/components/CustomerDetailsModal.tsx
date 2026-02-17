import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { useState } from "react";
import type { Customer } from "@/shared/types/customer.types";
import { useCustomer } from "../hooks/useCustomers";

interface CustomerDetailsModalProps {
  open: boolean;
  customerId?: string;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
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
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

export const CustomerDetailsModal = ({
  open,
  customerId,
  onClose,
  onEdit,
}: CustomerDetailsModalProps) => {
  const [tabValue, setTabValue] = useState(0);
  const { data: customer, isLoading, error } = useCustomer(customerId || "");

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

  if (error || !customer) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Błąd</DialogTitle>
        <DialogContent>
          <Alert severity="error">
            Nie udało się pobrać szczegółów klienta
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Zamknij</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const displayName =
    customer.type === "INDIVIDUAL"
      ? `${customer.firstName} ${customer.lastName}`
      : customer.companyName;

  const identifier =
    customer.type === "INDIVIDUAL" ? customer.pesel : customer.nip;
  const identifierLabel = customer.type === "INDIVIDUAL" ? "PESEL" : "NIP";

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
              label={customer.type === "INDIVIDUAL" ? "Osoba" : "Firma"}
              size="small"
              sx={{ ml: 1 }}
            />
          </div>
          <Button
            startIcon={<EditIcon />}
            onClick={() => {
              onEdit(customer);
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
          aria-label="customer details tabs"
          sx={{ mb: 2 }}
        >
          <Tab label="Informacje" id="customer-tab-0" />
          <Tab label="Pojazdy" id="customer-tab-1" />
          <Tab label="Zlecenia" id="customer-tab-2" />
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
                  Dane podstawowe
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Typ:</strong>{" "}
                    {customer.type === "INDIVIDUAL"
                      ? "Osoba prywatna"
                      : "Firma"}
                  </Typography>
                  {customer.type === "INDIVIDUAL" && (
                    <>
                      <Typography variant="body2">
                        <strong>Imię:</strong> {customer.firstName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Nazwisko:</strong> {customer.lastName}
                      </Typography>
                    </>
                  )}
                  {customer.type === "BUSINESS" && (
                    <>
                      <Typography variant="body2">
                        <strong>Nazwa firmy:</strong> {customer.companyName}
                      </Typography>
                      {customer.firstName && (
                        <Typography variant="body2">
                          <strong>Kontakt:</strong> {customer.firstName}{" "}
                          {customer.lastName}
                        </Typography>
                      )}
                    </>
                  )}
                  <Typography variant="body2">
                    <strong>{identifierLabel}:</strong> {identifier}
                  </Typography>
                </Box>
              </Paper>
            </Box>

            <Box>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Kontakt
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Telefon:</strong> {customer.phone}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {customer.email || "-"}
                  </Typography>
                </Box>
              </Paper>
            </Box>

            <Box>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Adres
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    {customer.street || "-"}
                  </Typography>
                  <Typography variant="body2">
                    {customer.postalCode || "-"} {customer.city || "-"}
                  </Typography>
                </Box>
              </Paper>
            </Box>

            {customer.notes && (
              <Box>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Notatki
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, whiteSpace: "pre-wrap" }}
                  >
                    {customer.notes}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Pojazdy Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body2" color="textSecondary">
            Pojazdy klienta - integracja w kolejnym etapie
          </Typography>
          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>VIN</TableCell>
                <TableCell>Marka/Model</TableCell>
                <TableCell>Rok</TableCell>
                <TableCell>Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="textSecondary">
                    Brak pojazdu
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabPanel>

        {/* Zlecenia Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="body2" color="textSecondary">
            Zlecenia serwisowe - integracja w kolejnym etapie
          </Typography>
          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Nr zlecenia</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Koszt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="textSecondary">
                    Brak zleceń
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Zamknij</Button>
      </DialogActions>
    </Dialog>
  );
};
