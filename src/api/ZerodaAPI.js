import axios from "axios";
import { BASE_URL,BROKER_URL,FNOTRADER_URL,ZERODHA_URL } from "../Config/BaseUrl";

export const ZerodaAPI = {
  callOptionChain: async (instrumentName,expiryDate) => { 
    try {  
              var axiosConfig = {
                method: "GET",
                url: `${BROKER_URL}get_option_chain_instruments?name=${instrumentName}&expiry=${expiryDate}`,  
                headers: {        
                  "Content-Type": "application/json",
                  
                },    
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
      
  
    },
  getSymbolExpiry: async () => { 
  try {  
            var axiosConfig = {
              method: "GET",
              url: `${BASE_URL}zeroda/getsymbolexpiry`,  
              headers: {        
                "Content-Type": "application/json",
                "token":localStorage.getItem("token")
              },    
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
 getInstrumentDetails: async (instrumentName,instrumentExchange) => { 
    try {  
              var axiosConfig = {
                method: "GET",
                url: `${BROKER_URL}instruments?name=${instrumentName}&exchange=`+instrumentExchange,  
                headers: {        
                  "Content-Type": "application/json",
                  
                },    
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
      
  
    },

  callApiToGetPreviosDayDataForChannel: async (channelToken) => { 
    try {  
              var axiosConfig = {
                method: "GET",
                url: `${BROKER_URL}ticks?tokens=${channelToken}`,  
                headers: {        
                  "Content-Type": "application/json"
                 
                },    
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
      
  
    },
    getOptionChainList:async () => { 
            try {  
                      var axiosConfig = {
                        method: "GET",
                        url: `${BASE_URL}zeroda/getOptionChainList`,  
                        headers: {        
                          "Content-Type": "application/json",
                          "token":localStorage.getItem("token")
                        },    
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
    },loginCheckForFNOTrader: async (fnotraderUserId,fnotraderSecret) => { 
      try {  
                var axiosConfig = {
                  method: "GET",
                  url: `${FNOTRADER_URL}login-check`,  
                  headers: {        
                    "Content-Type": "application/json",
                    "X-Fnotrader-Secret":fnotraderSecret,
                    "X-Fnotrader-Userid":fnotraderUserId
                  },    
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
        
    
      },getFNOBrockerAccountList: async (fnotraderUserId,fnotraderSecret) => { 
        try {  
                  var axiosConfig = {
                    method: "GET",
                    url: `${FNOTRADER_URL}brokers?status=loggedIn`,  
                    headers: {        
                      "Content-Type": "application/json",
                      "X-Fnotrader-Secret":fnotraderSecret,
                      "X-Fnotrader-Userid":fnotraderUserId
                    },    
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
          
      
         },setBrokerCredentials:async (requestData) => { 
          try {  
                    var axiosConfig = {
                      method: "POST",
                      url: `${BASE_URL}zeroda/setBrokerCredentials`,  
                      headers: {        
                        "Content-Type": "application/json",
                      },  
                      data:requestData  
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
         getMarginBasket: async (requestData) => { 
            try {  
                    var axiosConfig = {
                      method: "POST",
                      url: `${BASE_URL}zeroda/getMarginBasket`,  
                      headers: {        
                        "Content-Type": "application/json",
                        "token":localStorage.getItem("token")
                      },    
                      data:requestData
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
                console.log('Error Details:'+(error.response || error.request || error.message));
                return null;
            }
        },
        getJWTToken: async (requestData) => { 
          try {  
                  var axiosConfig = {
                    method: "GET",
                    url: `${BASE_URL}JwtInDotnetCore/getJWTToken`,  
                    headers: {        
                      "Content-Type": "application/json",
                    } 
                     
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
              console.log('Error Details:'+(error.response || error.request || error.message));
              return null;
          }
      }, getFundsAndMargins: async (requestData) => { 
        try {  
                var axiosConfig = {
                  method: "POST",
                  url: `${BASE_URL}zeroda/getFundsAndMargins`,  
                  headers: {        
                    "Content-Type": "application/json",
                    "token":localStorage.getItem("token")
                  },    
                  data:requestData
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
            console.log('Error Details:'+(error.response || error.request || error.message));
            return null;
        }
    },getexchangeholidays: async () => { 
      try {  
                var axiosConfig = {
                  method: "GET",
                  url: `${BROKER_URL}get_exchange_holidays?exchange=nfo`
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
        
    
      },getTradesForClient: async (requestData) => { 
        try {  
                var axiosConfig = {
                  method: "POST",
                  url: `${BASE_URL}zeroda/getTradesForClient`,  
                  headers: {        
                    "Content-Type": "application/json",
                    "token":localStorage.getItem("token")
                  },    
                  data:requestData
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
            console.log('Error Details:'+(error.response || error.request || error.message));
            return null;
        }
    }
          

}
export default ZerodaAPI;