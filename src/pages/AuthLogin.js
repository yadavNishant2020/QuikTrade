import React, { useEffect, useState, useContext } from 'react'
import { CookiesConfig } from "../Config/CookiesConfig.js";
import { ZerodaAPI } from '../api/ZerodaAPI.js';
import { PostProvider, PostContext } from '../PostProvider.js';
import alertify from 'alertifyjs';
const AuthLogin = () => {
  const { globleFnotraderUserId,
    globleFnotraderSecret
  } = useContext(PostContext);
  useEffect(() => {
    let fnotraderUserId = sessionStorage.getItem("fnotraderUserid");
    let fnotraderSecret = sessionStorage.getItem("fnotraderSecret");
    if (fnotraderUserId.length > 0 && fnotraderSecret.length > 0) {
      const dataInfo = loginCheckForFNOTraderData(fnotraderUserId, fnotraderSecret);
    }
  }, []);

  const getexchangeholidays = async () => {
    const resultData = await ZerodaAPI.getexchangeholidays();
    if (resultData != null) {
      const { code, data } = resultData;
      if (code === 200) {
        CookiesConfig.setCookie("holidaylist", JSON.stringify(data["NFO"]));
        sessionStorage.setItem("currentStockSymbol", "NIFTY")
        window.open("/admin/dashboard", '_self');
      }
    }
  }

  const loginCheckForFNOTraderData = async (fnotraderUserid, fnotraderSecret) => {
    // Get the navigate function using useNavigate
    const resultData = await ZerodaAPI.loginCheckForFNOTrader(fnotraderUserid, fnotraderSecret);
    if (resultData != null) {
      const { code, data } = resultData;
      if (code === 200) {
        CookiesConfig.setCookie("Fnotrader-Secret", fnotraderSecret);
        CookiesConfig.setCookie("Fnotrader-Userid", fnotraderUserid);
        CookiesConfig.setCookie("User-ActiveSubscription", data.activeSubscription);
        CookiesConfig.setCookie("User-BrokerLoggedIn", data.brokerLoggedIn);
        //  alertify.alert(
        //    'Information',
        //    'Login successfully.',
        //    () => {
        //      
        //      getexchangeholidays();                
        //    });
        window.open("/admin/dashboard", '_self');
      }
    } else {
      alertify.alert(
        'Information',
        'Invalid login credentials. Please re-login.',
        () => {
          window.open("https://www.fnotrader.com/trading/broker-accounts", '_self');
        });
    }

  }
}

export default AuthLogin;