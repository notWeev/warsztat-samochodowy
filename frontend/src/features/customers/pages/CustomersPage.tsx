import { useState } from "react";
import { Container, Box, Typography } from "@mui/material";
import type { Customer } from "@/shared/types/customer.types";
import { CustomerList } from "../components/CustomerList";
import { CustomerDrawer } from "../components/CustomerDrawer";
import { CustomerDetailsModal } from "../components/CustomerDetailsModal";

export const CustomersPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | undefined
  >();
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsCustomerId, setDetailsCustomerId] = useState<
    string | undefined
  >();

  const handleAddClick = () => {
    setSelectedCustomer(undefined);
    setDrawerOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
  };

  const handleViewClick = (customer: Customer) => {
    setDetailsCustomerId(customer.id);
    setDetailsModalOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedCustomer(undefined);
  };

  const handleDetailsModalClose = () => {
    setDetailsModalOpen(false);
    setDetailsCustomerId(undefined);
  };

  const handleDetailsEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailsModalOpen(false);
    setDrawerOpen(true);
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

      {/* Drawer do dodawania/edycji */}
      <CustomerDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        customer={selectedCustomer}
        onSuccess={() => {
          // Lista się automatycznie odświeży dzięki React Query invalidation
        }}
      />

      {/* Modal ze szczegółami */}
      <CustomerDetailsModal
        open={detailsModalOpen}
        customerId={detailsCustomerId}
        onClose={handleDetailsModalClose}
        onEdit={handleDetailsEdit}
      />
    </Container>
  );
};
