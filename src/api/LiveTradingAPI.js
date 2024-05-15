import axios from "axios";
import { BASE_URL,BROKER_URL } from "../Config/BaseUrl";

export const LiveTradingAPI = {
    processInsertUpdateOrderLive: async (requestData) => {
        try {  
                  var axiosConfig = {
                    method: "POST",
                    url: `${BASE_URL}LiveTrading/processInsertUpdateOrder`,  
                    headers: {        
                      "Content-Type": "application/json",
                      "token":localStorage.getItem("token")
                    },    
                    data:requestData,
                  };
                  const response = await axios(axiosConfig);    
                  
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
          
      
        }, processInsertUpdateOrderBulkLive: async (requestData) => {
            try {  
                  var axiosConfig = {
                    method: "POST",
                    url: `${BASE_URL}LiveTrading/processInsertUpdateOrderBulk`,  
                    headers: {        
                      "Content-Type": "application/json",
                      "token":localStorage.getItem("token")
                    },    
                    data:requestData,
                  };
                  const response = await axios(axiosConfig);    
                  
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
          
      
        },processAllPendingOrderForClient: async (requestData) => { 
       
          try {  
                    var axiosConfig = {
                      method: "POST",
                      url: `${BASE_URL}LiveTrading/processAllPendingOrderForClient`,  
                      headers: {        
                        "Content-Type": "application/json",
                        "token":localStorage.getItem("token")
                      },    
                      data:requestData,
                    };
                    const response = await axios(axiosConfig);    
                    
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
            
        
          },processorderupdatelive: async (requestData) => { 
       
            try {  
                      var axiosConfig = {
                        method: "POST",
                        url: `${BASE_URL}LiveTrading/processorderupdatelive`,  
                        headers: {        
                          "Content-Type": "application/json",
                          "token":localStorage.getItem("token")
                        },    
                        data:requestData,
                      };
                      const response = await axios(axiosConfig);    
                      
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
              
          
            },processexitpendingorderlive: async (requestData) => { 
       
              try {  
                        var axiosConfig = {
                          method: "POST",
                          url: `${BASE_URL}LiveTrading/processexitpendingorderlive`,  
                          headers: {        
                            "Content-Type": "application/json",
                            "token":localStorage.getItem("token")
                          },    
                          data:requestData,
                        };
                        const response = await axios(axiosConfig);    
                        
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