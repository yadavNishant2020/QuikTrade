import axios from "axios";
import { BASE_URL, BROKER_URL, FNOTRADER_URL, ZERODHA_URL } from "../Config/BaseUrl";

export const ZerodaAPI = {

  fetchExpiryData: async (currentStockSymbol) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Fnotrader-Secret': 'e87ab0ed-9c99-48a4-9a91-77136de47ed7',
      'X-Fnotrader-Userid': 'FT8507',
      'Accept': 'application/json, text/plain, */*'
    };

    try {
      const response = await axios.get(`${BROKER_URL}get_option_expiry?name=${currentStockSymbol}`, { headers });

      if (response.status === 200) {
        return response.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching expiry data:', error);
      return null;
    }
  },
  callOptionChain: async (instrumentName, expiryDate) => {
    try {
      var axiosConfig = {
        method: "GET",
        url: `${BROKER_URL}get_option_chain_instruments?name=${instrumentName}&expiry=${expiryDate}`,
        headers: {
          "Content-Type": "application/json",

        },
      };
      const response = await axios(axiosConfig);

      const { status, data } = response;
      if (status === 200) {
        return data;
      } else {
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
        url: `${BASE_URL}zerodha/getsymbolexpiry`,
        headers: {
          "Content-Type": "application/json",
          "token": localStorage.getItem("token")
        },
      };
      const response = await axios(axiosConfig);
      console.log(response);
      const { status, data } = response;
      if (status === 200) {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  getInstrumentDetails: async (instrumentName, instrumentExchange) => {
    try {
      var axiosConfig = {
        method: "GET",
        url: `${BROKER_URL}instruments?name=${instrumentName}&exchange=` + instrumentExchange,
        headers: {
          "Content-Type": "application/json",

        },
      };
      const response = await axios(axiosConfig);
      const { status, data } = response;
      if (status === 200) {
        return data;
      } else {
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

      const { status, data } = response;
      if (status === 200) {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  getOptionChainList: async (name = "NIFTY", expiryDate) => {
    try {
      // if (_expiryDate) {
      //   expiryDate = _expiryDate;
      // }
      var axiosConfig = {
        method: "GET",
        url: `${BASE_URL}zerodha/getOptionChainList?name=${name}&expiryDate=${expiryDate}`,
        headers: {
          "Content-Type": "application/json",
          "token": localStorage.getItem("token")
        },
      };
      const response = await axios(axiosConfig);
      debugger;

      const { status, data } = response;
      if (status === 200) {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }, loginCheckForFNOTrader: async (fnotraderUserId, fnotraderSecret) => {
    try {
      var axiosConfig = {
        method: "GET",
        url: `${FNOTRADER_URL}login-check`,
        headers: {
          "Content-Type": "application/json",
          "X-Fnotrader-Secret": fnotraderSecret,
          "X-Fnotrader-Userid": fnotraderUserId
        },
      };
      const response = await axios(axiosConfig);

      const { status, data } = response;
      if (status === 200) {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }


  }, getFNOBrockerAccountList: async (fnotraderUserId, fnotraderSecret) => {
    try {
      var axiosConfig = {
        method: "GET",
        url: `${FNOTRADER_URL}brokers?status=loggedIn`,
        headers: {
          "Content-Type": "application/json",
          "X-Fnotrader-Secret": fnotraderSecret,
          "X-Fnotrader-Userid": fnotraderUserId
        },
      };
      const response = await axios(axiosConfig);
      const { status, data } = response;
      if (status === 200) {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }


  }, setBrokerCredentials: async (requestData) => {
    try {
      var axiosConfig = {
        method: "POST",
        url: `${BASE_URL}zerodha/setBrokerCredentials`,
        headers: {
          "Content-Type": "application/json",
        },
        data: requestData
      };
      const response = await axios(axiosConfig);
      console.log(response);
      const { status, data } = response;
      if (status === 200) {
        return data;
      } else {
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
        url: `${BASE_URL}zerodha/getMarginBasket`,
        headers: {
          "Content-Type": "application/json",
          "token": localStorage.getItem("token")
        },
        data: requestData
      };
      const response = await axios(axiosConfig);

      const { status, data } = response;
      if (status === 200) {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      console.log('Error Details:' + (error.response || error.request || error.message));
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
      const { status, data } = response;
      if (status === 200) {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      console.log('Error Details:' + (error.response || error.request || error.message));
      return null;
    }
  }, getFundsAndMargins: async (requestData) => {
    try {
      var axiosConfig = {
        method: "POST",
        url: `${BASE_URL}zerodha/getFundsAndMargins`,
        headers: {
          "Content-Type": "application/json",
          "token": localStorage.getItem("token")
        },
        data: requestData
      };
      const response = await axios(axiosConfig);

      const { status, data } = response;
      if (status === 200) {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      console.log('Error Details:' + (error.response || error.request || error.message));
      return null;
    }
  }, getexchangeholidays: async () => {
    try {
      var axiosConfig = {
        method: "GET",
        url: `${BROKER_URL}get_exchange_holidays?exchange=nfo`
      };
      const response = await axios(axiosConfig);
      const { status, data } = response;
      if (status === 200) {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }


  }, getTradesForClient: async (requestData) => {
    try {
      var axiosConfig = {
        method: "POST",
        url: `${BASE_URL}zerodha/getTradesForClient`,
        headers: {
          "Content-Type": "application/json",
          "token": localStorage.getItem("token")
        },
        data: requestData
      };
      const response = await axios(axiosConfig);
      const { status, data } = response;
      if (status === 200) {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      console.log('Error Details:' + (error.response || error.request || error.message));
      return null;
    }
  }, processInsertUpdateRuleData: async (requestData) => {
    try {
      var axiosConfig = {
        method: "POST",
        url: `${BASE_URL}zerodha/processInsertUpdateRuleData`,
        headers: {
          "Content-Type": "application/json",
          "token": localStorage.getItem("token")
        },
        data: requestData
      };
      const response = await axios(axiosConfig);
      const { status, data } = response;
      if (status === 200) {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      console.log('Error Details:' + (error.response || error.request || error.message));
      return null;
    }
  }, getruledata: async (requestData) => {
    try {
      var axiosConfig = {
        method: "POST",
        url: `${BASE_URL}zerodha/getruledata`,
        headers: {
          "Content-Type": "application/json",
          "token": localStorage.getItem("token")
        },
        data: requestData
      };
      const response = await axios(axiosConfig);
      const { status, data } = response;
      if (status === 200) {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      console.log('Error Details:' + (error.response || error.request || error.message));
      return null;
    }
  }, processDeleteRuleData: async (requestData) => {
    try {
      var axiosConfig = {
        method: "POST",
        url: `${BASE_URL}zerodha/processDeleteRuleData`,
        headers: {
          "Content-Type": "application/json",
          "token": localStorage.getItem("token")
        },
        data: requestData
      };
      const response = await axios(axiosConfig);
      const { status, data } = response;
      if (status === 200) {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      console.log('Error Details:' + (error.response || error.request || error.message));
      return null;
    }
  }, getRuleDataById: async (requestData) => {
    try {
      var axiosConfig = {
        method: "POST",
        url: `${BASE_URL}zerodha/getRuleDataById`,
        headers: {
          "Content-Type": "application/json",
          "token": localStorage.getItem("token")
        },
        data: requestData
      };
      const response = await axios(axiosConfig);
      const { status, data } = response;
      if (status === 200) {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      console.log('Error Details:' + (error.response || error.request || error.message));
      return null;
    }
  }




}
export default ZerodaAPI;