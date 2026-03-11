import { useState } from "react";
import { Box, Typography } from "@mui/material";
import type { ServiceOrder } from "@/shared/types/service-order.types";
import { ServiceOrderList } from "../components/ServiceOrderList";
import { ServiceOrderDrawer } from "../components/ServiceOrderDrawer";
import { ServiceOrderDetailsModal } from "../components/ServiceOrderDetailsModal";

export const ServiceOrdersPage = () => {
  const [newOrderDrawer, setNewOrderDrawer] = useState(false);
  // null = modal zamknięty, ServiceOrder = podgląd/edycja
  const [detailsOrder, setDetailsOrder] = useState<ServiceOrder | null>(null);

  const handleView = (order: ServiceOrder) => setDetailsOrder(order);
  const handleEdit = (order: ServiceOrder) => setDetailsOrder(order);

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Zlecenia serwisowe
      </Typography>

      <ServiceOrderList
        onView={handleView}
        onEdit={handleEdit}
        onAddClick={() => setNewOrderDrawer(true)}
      />

      {/* Create new order */}
      <ServiceOrderDrawer
        open={newOrderDrawer}
        onClose={() => setNewOrderDrawer(false)}
        onSuccess={() => setNewOrderDrawer(false)}
      />

      {/* View / Edit order */}
      <ServiceOrderDetailsModal
        open={detailsOrder !== null}
        order={detailsOrder}
        onClose={() => setDetailsOrder(null)}
      />
    </Box>
  );
};
