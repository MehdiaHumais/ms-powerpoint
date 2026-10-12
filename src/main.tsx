import React from "react";
import { createRoot } from "react-dom/client";
import HomePage from "./app/page";
import "./index.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container with id 'root' not found");
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>
);