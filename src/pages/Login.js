import React, { useEffect, useState,useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import LoginHeader from '../components/LoginHeader.js'
import { PostProvider,PostContext } from '../PostProvider.js';
import {  
    Container     
  } from "reactstrap";
  import alertify from 'alertifyjs';


const Login = () => {
  const { updateGlobleFnotraderUserId,
    updateGlobleFnotraderSecret
 } = useContext(PostContext);
 
  useEffect(() => {
    alert("hiii")
    // Function to get query string parameter by name
    const getQueryStringValue = (name) => {
      const params = new URLSearchParams(window.location.search);
      return params.get(name);
    };
    // Example: Get the value of the 'paramName' query string parameter     
    const fnotraderUserid = getQueryStringValue('Fnotrader-Userid');     
    const fnotraderSecret = getQueryStringValue('Fnotrader-Secret');    
    if(fnotraderUserid!==null && fnotraderSecret!==null){
      sessionStorage.setItem("fnotraderUserid",fnotraderUserid);
      sessionStorage.setItem("fnotraderSecret",fnotraderSecret);  
      window.open("/authlogin", '_self');
    }else{
            alertify.alert(
              'Information',
              'Invalid requested URL. Please check the URL and try again.',
              () => {
                window.open("https://www.fnotrader.com/trading/broker-accounts", '_self');
              });    
    }
    
  }, []);  
return (
   <>
          <div className="main-content">
           
       <LoginHeader/>
        <div className="header  py-7 py-lg-7" style={{backgroundColor:"#FFFFFF",height: "calc(100vh - 96px)"}}>
          <Container>
            <div className="header-body text-center mb-5">
              
            </div>
          </Container>
          <div className="separator separator-bottom separator-skew zindex-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              version="1.1"
              viewBox="0 0 2560 100"
              x="0"
              y="0"
            >
              <polygon
                className="fill-default"
                points="2560 0 2560 100 0 100"
              />
            </svg>
          </div>
        </div>
        {/* Page content */}
        <div className="bg-gradient-info py-7 py-lg-5">
        <Container className="mt--9 pb-5">
           
        </Container>
        </div>
      </div>
    </>
    )
}
export default Login;