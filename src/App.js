 import { useEffect } from 'react';
import './App.css';
import Admin from './layout/Admin.js';
 import { publicRoutes } from "./routes/Routes";
import {  Route, Routes } from "react-router-dom";
import { PostProvider,PostContext } from './PostProvider.js';
function App() {

  return (     
      <PostProvider>
        <Routes>
          
          {publicRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={route.component}
            key={idx}
            exact={true}
          />
          
        ))}
        <Route path="/admin/*" element={<Admin />} />
        
        </Routes>
      </PostProvider>
    
    
  );
}

export default App;
