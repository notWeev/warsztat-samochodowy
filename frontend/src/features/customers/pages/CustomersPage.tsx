import { useState } from "react";
import { Container, Box, Typography } from "@mui/material";
import type { Customer } from "@/shared/types/customer.types";
import { CustomerList } from "../components/CustomerList";
import { CustomerDrawer } from "../components/CustomerDrawer";
import { CustomerDetailsModal } from "../components/CustomerDetailsModal";

export const CustomersPage = () => {
  // null = szuflada zamknięta, undefined = tryb tworzenia, Customer = tryb edycji
  const [drawerCustomer, setDrawerCustomer] = useState<
    Customer | null | undefined
  >(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const handleAddClick = () => setDrawerCustomer(undefined);
  const handleEditClick = (customer: Customer) => setDrawerCustomer(customer);
  const handleViewClick = (customer: Customer) => setDetailsId(customer.id);
  const handleDrawerClose = () => setDrawerCustomer(null);
  const handleDetailsClose = () => setDetailsId(null);
  const handleDetailsEdit = (customer: Customer) => {
    setDetailsId(null);
    setDrawerCustomer(customer);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Zarządzanie Klientami
        </Typography>
        <Typography color="textSecondary">
          Dodaj, edytuj i zarządzaj informacjami o klientach
        </Typography>
      </Box>

      <CustomerList
        onAddClick={handleAddClick}
        onEdit={handleEditClick}
        onView={handleViewClick}
      />

      <CustomerDrawer
        open={drawerCustomer !== null}
        onClose={handleDrawerClose}
        customer={drawerCustomer ?? undefined}
        onSuccess={() => {}}
      />

      {/* Modal ze szczegółami */}
      <CustomerDetailsModal
        open={detailsId !== null}
        customerId={detailsId ?? undefined}
        onClose={handleDetailsClose}
        onEdit={handleDetailsEdit}
      />
    </Container>
  );
};
