import React, { useEffect, useState } from "react";
import {  Route, Routes, Navigate } from "react-router-dom";
import { Container, Row, Col,   Button,
    Card,
    CardHeader,
    CardBody,
    NavItem,
    NavLink,
    Nav,
    Progress,
    Table } from "reactstrap";
import AdminHeader from "../components/AdminHeader.js"; 
import { ZerodaAPI } from '../api/ZerodaAPI.js';
import '../index.css'
import { adminRoutes } from "../routes/Routes.js";
import alertify from 'alertifyjs';
import {
    
  } from "reactstrap";
  import { CookiesConfig } from "../Config/CookiesConfig.js";
 
import { useContext } from "react";
import { PostProvider,PostContext } from '../PostProvider.js';
 
const Admin = (props) => {
  const {    
    updateGlobleBrokerClientList
    } = useContext(PostContext); 

    useEffect(()=>{ 
      if(CookiesConfig.getCookie("Fnotrader-Secret").length===0){
            alertify.alert(
              'Information',
              'You are no longer logged in to this application. Please re-login.',
              () => {
                window.open("https://www.fnotrader.com/trading/broker-accounts", '_self');
              });
      }else{
           if(CookiesConfig.getCookie("User-ActiveSubscription").toString().toLowerCase()==="false"){
              alertify.alert(
                'Information',
                'You don`t have an active subscription to this application. Please re-login.',
                () => {
                  window.open("https://www.fnotrader.com/trading/broker-accounts", '_self');
                });               
            }
            else{
                  let fnotraderUserid = CookiesConfig.getCookie("Fnotrader-Userid");
                  let fnotraderSecret=CookiesConfig.getCookie("Fnotrader-Secret")
                  loginCheckForFNOTraderData(fnotraderUserid,fnotraderSecret);
            }
      }
   },[]);

   const loginCheckForFNOTraderData=async(fnotraderUserid,fnotraderSecret)=>{      
            const resultData = await ZerodaAPI.loginCheckForFNOTrader(fnotraderUserid,fnotraderSecret);
            if(resultData!=null){
              const {code,data}=resultData;
              if(code===200){
                CookiesConfig.setCookie("Fnotrader-Secret",fnotraderSecret);
                CookiesConfig.setCookie("Fnotrader-Userid",fnotraderUserid);
                CookiesConfig.setCookie("User-ActiveSubscription",data.activeSubscription);
                CookiesConfig.setCookie("User-BrokerLoggedIn",data.brokerLoggedIn);      
                getBrockerAccountList(fnotraderUserid,fnotraderSecret);                
              }
            }else{
                  alertify.alert(
                    'Information',
                    'Invalid login credentials. Please re-login.',
                    () => {
                      window.open("https://www.fnotrader.com/trading/broker-accounts", '_self');
                    });    
            }

}

const getBrockerAccountList=async(fnotraderUserid,fnotraderSecret)=>{ 
// Get the navigate function using useNavigate
    
    const resultData = await ZerodaAPI.getFNOBrockerAccountList(fnotraderUserid,fnotraderSecret);
    if(resultData!=null){    
          const {code,data}=resultData;
          if(code===200){  
            let brokersList=data.brokers.sort((a, b) => (a.isDefault === b.isDefault) ? 0 : a.isDefault ? -1 : 1);    
            updateGlobleBrokerClientList(brokersList);  
            //getJWTToken(); 
          }
    } 
}

// const getJWTToken=async()=>{ 
//   const resultData = await ZerodaAPI.getJWTToken();
//     if(resultData!=null){    
//           const {code,data}=resultData;
//           if(code===200){    
//              //localStorage.setItem("token",resultData) 
//           }
//     } 
// }

    const getRoutes = () => {
        return adminRoutes.map((prop, key) => {      
            return (                
              <Route path={prop.path} element={prop.component} key={key} exact />
            );
           
        });
      };

    const mainContent = React.useRef(null);
    return(
        <>
                <AdminHeader />  
               
                <div className="main-content" ref={mainContent}>   
              
                <Routes>
         {getRoutes()} 
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
       
                                      
                            
        </div>
                            
                
        </>
    )
}
export default Admin;