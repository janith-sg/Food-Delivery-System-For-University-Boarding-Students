import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import FoodMenu from "./features/food-menu-management/FoodMenu";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/menu" replace />} />
        <Route path="/menu" element={<FoodMenu />} />
        <Route path="/menu/category/:categorySlug" element={<FoodMenu />} />
        <Route path="/admin/menu" element={<FoodMenu isAdmin />} />
        <Route path="/admin/menu/category/:categorySlug" element={<FoodMenu isAdmin />} />
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;