import React from "react";
import WebSocketComponent from "../components/WebSocketComponent.js";
import TreadingDashboard from "../pages/TreadingDashboard.js";
import Login from "../pages/Login.js";
import AuthLogin from "../pages/AuthLogin.js";
import UserProfile from "../pages/UserProfile.js";


const adminRoutes = [     
    { path: "/dashboard", component: <TreadingDashboard /> ,layout: "/Admin"},  
    { path: "/userprofile", component: <UserProfile /> ,layout: "/Admin"},  
          
  ];


const publicRoutes = [  
  { path: "/", component: <Login />,layout: "/auth", },  
    { path: "/login", component: <Login /> ,layout: "/auth"},      
    { path: "/authlogin", component: <AuthLogin /> ,layout: "/auth"}  
  ];
  export { adminRoutes,publicRoutes };