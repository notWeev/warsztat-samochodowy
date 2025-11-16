import { Routes, Route } from "react-router-dom";
import HomePage from "@/features/Home/pages/HomePage";
import OrdersPage from "@/features/orders/pages/OrdersPage";

const AppRouter = () => (
  <Routes>
    {/* Strona główna */}
    <Route path="/" element={<HomePage />} />

    {/* Główne sekcje */}
    <Route path="/orders" element={<OrdersPage />} />
  </Routes>
);

export default AppRouter;
