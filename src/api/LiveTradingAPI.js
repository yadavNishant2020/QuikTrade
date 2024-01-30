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
          
      
        }, processInsertUpdateOrderBulkLive: async (requestData) => {
            try {  
                  var axiosConfig = {
                    method: "POST",
                    url: `${BASE_URL}LiveTrading/processInsertUpdateOrderBulk`,  
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