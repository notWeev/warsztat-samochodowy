import { useState } from "react";
import { Box, Typography } from "@mui/material";
import type { ServiceOrder } from "@/shared/types/service-order.types";
import { ServiceOrderList } from "../components/ServiceOrderList";
import { ServiceOrderDrawer } from "../components/ServiceOrderDrawer";
import { ServiceOrderDetailsModal } from "../components/ServiceOrderDetailsModal";

export const ServiceOrdersPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleView = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleEdit = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Zlecenia serwisowe
      </Typography>

      <ServiceOrderList
        onView={handleView}
        onEdit={handleEdit}
        onAddClick={() => setDrawerOpen(true)}
      />

      {/* Create new order */}
      <ServiceOrderDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => setDrawerOpen(false)}
      />

      {/* View / Edit order */}
      <ServiceOrderDetailsModal
        open={detailsOpen}
        order={selectedOrder}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedOrder(null);
        }}
      />
    </Box>
  );
};
