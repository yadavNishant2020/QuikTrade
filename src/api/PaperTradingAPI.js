import axios from "axios";
import { BASE_URL,BROKER_URL } from "../Config/BaseUrl";

export const PaperTradingAPI = {
  processInsertUpdateDefaultConfiguration: async (requestData) => { 
    debugger;
  try {  
            var axiosConfig = {
              method: "POST",
              url: `${BASE_URL}paperTrading/processInsertUpdateDefaultConfiguration`,  
              headers: {        
                "Content-Type": "application/json",
              },    
              data:requestData,
            };
            const response = await axios(axiosConfig);    
            console.log(response);
            const {status,data}=response;
            if(status===200){
                return data;
            }else{
                return null;
            }
  } catch (error) {
        console.log(error);
        return null;
  }
    

  },getDefaultConfiguration: async (requestData) => { 
    try {  
              var axiosConfig = {
                method: "POST",
                url: `${BASE_URL}paperTrading/getDefaultConfiguration`,  
                headers: {        
                  "Content-Type": "application/json",
                },    
                data:requestData,
              };
              const response = await axios(axiosConfig);    
              console.log(response);
              const {status,data}=response;
              if(status===200){
                  return data;
              }else{
                  return null;
              }
    } catch (error) {
          console.log(error);
          return null;
    }
      
  
    },
    processInsertUpdateOrderPaper: async (requestData) => { 
     
    try {  
              var axiosConfig = {
                method: "POST",
                url: `${BASE_URL}paperTrading/processInsertUpdateOrder`,  
                headers: {        
                  "Content-Type": "application/json",
                },    
                data:requestData,
              };
              const response = await axios(axiosConfig);    
              console.log(response);
              const {status,data}=response;
              if(status===200){
                  return data;
              }else{
                  return null;
              }
    } catch (error) {
          console.log(error);
          return null;
    }
      
  
    }, processInsertUpdateOrderBulkPaper: async (requestData) => { 
      debugger;
    try {  
              var axiosConfig = {
                method: "POST",
                url: `${BASE_URL}paperTrading/processInsertUpdateOrderBulk`,  
                headers: {        
                  "Content-Type": "application/json",
                },    
                data:requestData,
              };
              const response = await axios(axiosConfig);    
              console.log(response);
              const {status,data}=response;
              if(status===200){
                  return data;
              }else{
                  return null;
              }
    } catch (error) {
          console.log(error);
          return null;
    }
      
  
    },    
    getOrderCompletedList: async (requestData) => { 
      debugger;
    try {  
              var axiosConfig = {
                method: "POST",
                url: `${BASE_URL}paperTrading/getOrderCompletedList`,  
                headers: {        
                  "Content-Type": "application/json",
                },    
                data:requestData,
              };
              const response = await axios(axiosConfig);    
              console.log(response);
              const {status,data}=response;
              if(status===200){
                  return data;
              }else{
                  return null;
              }
    } catch (error) {
          console.log(error);
          return null;
    }
      
  
    }, processAllPendingOrderForClient: async (requestData) => { 
       
    try {  
              var axiosConfig = {
                method: "POST",
                url: `${BASE_URL}paperTrading/processAllPendingOrderForClient`,  
                headers: {        
                  "Content-Type": "application/json",
                },    
                data:requestData,
              };
              const response = await axios(axiosConfig);    
              console.log(response);
              const {status,data}=response;
              if(status===200){
                  return data;
              }else{
                  return null;
              }
    } catch (error) {
          console.log(error);
          return null;
    }
      
  
    },getallconfigforposition: async (requestData) => { 
       
      try {  
                var axiosConfig = {
                  method: "POST",
                  url: `${BASE_URL}paperTrading/getallconfigforposition`,  
                  headers: {        
                    "Content-Type": "application/json",
                  },    
                  data:requestData,                  
                };
                const response = await axios(axiosConfig);    
                console.log(response);
                const {status,data}=response;
                if(status===200){
                    return data;
                }else{
                    return null;
                }
      } catch (error) {
            console.log(error);
            return null;
      }
        
    
      }

    
}