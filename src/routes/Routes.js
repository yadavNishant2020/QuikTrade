import React from "react";
import WebSocketComponent from "../components/WebSocketComponent.js";
import TradingDashboard from "../pages/TradingDashboard.js";
import Login from "../pages/Login.js";
import AuthLogin from "../pages/AuthLogin.js";
import UserProfile from "../pages/UserProfile.js";


const adminRoutes = [     
    { path: "/dashboard", component: <TradingDashboard /> ,layout: "/Admin"},  
    { path: "/userprofile", component: <UserProfile /> ,layout: "/Admin"},  
  ];


const publicRoutes = [  
  { path: "/", component: <Login />,layout: "/auth", },  
    { path: "/login", component: <Login /> ,layout: "/auth"},      
    { path: "/authlogin", component: <AuthLogin /> ,layout: "/auth"}  
  ];
  export { adminRoutes,publicRoutes };