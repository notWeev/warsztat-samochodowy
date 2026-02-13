import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Skeleton,
  Box,
} from "@mui/material";
import type { RecentOrder } from "../../../shared/types/dashboard.types";

interface RecentOrdersTableProps {
  orders: RecentOrder[];
  isLoading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "IN_PROGRESS":
      return "warning";
    case "PENDING":
      return "info";
    case "WAITING_FOR_PARTS":
      return "warning";
    case "SCHEDULED":
      return "info";
    case "CLOSED":
      return "success";
    case "CANCELLED":
      return "error";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "Ukończone";
    case "IN_PROGRESS":
      return "W trakcie";
    case "PENDING":
      return "Oczekujące";
    case "WAITING_FOR_PARTS":
      return "Czeka na części";
    case "SCHEDULED":
      return "Zaplanowane";
    case "CLOSED":
      return "Zamknięte";
    case "CANCELLED":
      return "Anulowane";
    default:
      return status;
  }
};

export const RecentOrdersTable = ({
  orders,
  isLoading,
}: RecentOrdersTableProps) => {
  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1 }} />
        ))}
      </Paper>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">Brak ostatnich zleceń</Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Ostatnie zlecenia
        </Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nr zlecenia</TableCell>
              <TableCell>Klient</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                Pojazd
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Wartość</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                hover
                sx={{ cursor: "pointer", "&:last-child td": { border: 0 } }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {order.orderNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  {order.customer.firstName} {order.customer.lastName}
                </TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  {order.vehicle.brand} {order.vehicle.model}{" "}
                  {order.vehicle.year}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(order.status)}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={500}>
                    {Number(order.totalCost || 0).toFixed(2)} zł
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
