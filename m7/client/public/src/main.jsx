import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PublicRoutes from './publicRoutes'
import React from "react"
import "bootstrap/dist/css/bootstrap.min.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PublicRoutes />
  </StrictMode>,
)
