import React from "react";
import WebSocketComponent from "../components/WebSocketComponent.js";
import TreadingDashboard from "../pages/TreadingDashboard.js";
import Login from "../pages/Login.js";
import AuthLogin from "../pages/AuthLogin.js";

const adminRoutes = [     
    { path: "/dashboard", component: <TreadingDashboard /> ,layout: "/Admin"},        
  ];


const publicRoutes = [  
  { path: "/", component: <Login />,layout: "/auth", },  
    { path: "/login", component: <Login /> ,layout: "/auth"},      
    { path: "/authlogin", component: <AuthLogin /> ,layout: "/auth"}  
  ];
  export { adminRoutes,publicRoutes };