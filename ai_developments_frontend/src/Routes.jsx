import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import App from "./App";
import Health from "./components/Health";

/**
 * PUBLIC_INTERFACE
 * Routes
 * App-level router configuration.
 * - "/" renders the main App experience
 * - "/health" renders a simple Health check page
 */
export default function Routes() {
  return (
    <BrowserRouter>
      <RouterRoutes>
        <Route path="/" element={<App />} />
        <Route path="/health" element={<Health />} />
      </RouterRoutes>
    </BrowserRouter>
  );
}
