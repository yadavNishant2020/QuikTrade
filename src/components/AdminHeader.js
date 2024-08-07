import { React, useEffect, useState } from "react";
import { Link, json } from "react-router-dom";
import Select from "react-select";
import "../index.css";
import { ZerodaAPI } from "../api/ZerodaAPI";
import { CookiesConfig } from "../Config/CookiesConfig.js";
import Moment from "moment";
import Centrifuge from "centrifuge";
import { Container, DropdownMenu, DropdownItem, Row, Col } from "reactstrap";
import { useContext } from "react";
import { PostContext } from "../PostProvider.js";
import { PaperTradingAPI } from "../api/PaperTradingAPI";
import alertify from "alertifyjs";
import { Nav, UncontrolledDropdown, DropdownToggle } from "reactstrap";
import StaticPopup from "./Static-Popup.js";

const AdminHeader = () => {
  const [symbolSelect, setSymbolSelect] = useState("");
  const [expityvalue, setExpityValue] = useState("");
  const [currentStockIndex, setCurrentStockIndex] = useState("0.00");
  const [currentStockIndexFuture, setCurrentStockIndexFuture] = useState("0.00");
  const [stockSymbolInformation, setStockSymbolInformation] = useState([]);
  const [currentStockLTP, setCurrentStockLTP] = useState("0.00");
  const [currentStockLTPPercent, setCurrentStockLTPPercent] = useState("0.00");
  const [currentStockLTPFuture, setCurrentStockLTPFuture] = useState("0.00");
  const [currentStockLTPPercentFuture, setCurrentStockLTPPercentFuture] = useState("0.00");
  const [expityData, setExpityData] = useState([]);
  const [show, setShow] = useState(false);
  const [stopLastPrice, setStopLastPrice] = useState(false);
  const [futureLastPrice, setFutureLastPrice] = useState(false);

  const [stopLastAmt, setStopLastAmt] = useState(0);
  const [futureLastAmt, setFutureLastAmt] = useState(0);
  const {
    updateGlobleSymbol,
    updateGlobleOptionChainList,
    updateGlobleExpityValue,
    updateGlobleCurrentStockIndex,
    updateGlobleCurrentStockIndexFuture,
    updateGlobleSelectedTradingType,
    updateGlobleSelectedClientInfo,
    updateGlobleBrokerName,
    globleBrokerClientList,
    globalServerTime,
    updateGlobalProcessRMS
  } = useContext(PostContext);
  const [channelName, setChannelName] = useState([]);
  const [indexData, setIndexData] = useState([]);
  const [channelStatus, setChannelStatus] = useState(0);

  const [brokerSelect, setBrokerSelect] = useState("");
  const [clientSelect, setClientSelect] = useState("");
  const [tradingTypeSelect, setTradingTypeSelect] = useState("");

  const [optionsBroker, setOptionsBroker] = useState([]);
  const [optionsClient, setOptionsClient] = useState([]);

  const optionsTradingType = [
    { value: "Paper", label: "Paper" },
    { value: "Live", label: "Live" },
  ];

  useEffect(() => {
    if (globleBrokerClientList != null) {
      if (globleBrokerClientList.length > 0) {
        let brokerName = [];
        let clientList = [];
        globleBrokerClientList.map((dataClient) => {
          let index = brokerName.findIndex(
            (databroker) => databroker.value === dataClient.type
          );
          if (index === -1) {
            let data = {
              value: dataClient.type.toUpperCase(),
              label: dataClient.type.toUpperCase(),
            };
            brokerName.push(data);
          }
        });
        setOptionsBroker(brokerName);
        if (sessionStorage.getItem("brokername") !== null && sessionStorage.getItem("brokername") !== "") {
          let currentBrokerName = sessionStorage.getItem("brokername");
          var currentBrokerList = brokerName.find((data) => data.value === currentBrokerName);
          setBrokerSelect(currentBrokerList);
          updateGlobleBrokerName(currentBrokerName);
        } else {
          if (brokerSelect === "") {
            setBrokerSelect(brokerName[0]);
            let indexClient = globleBrokerClientList.findIndex(
              (dataClient) => dataClient.userName === brokerName[0].value
            );
            updateGlobleBrokerName(brokerName[0].value);
            sessionStorage.setItem("brokername", brokerName[0].value);
          }
        }
        sessionStorage.setItem(
          "apiSecret",
          globleBrokerClientList[0].apiKey +
          ":" +
          globleBrokerClientList[0].apiToken
        );
        if (brokerName.length > 0) {
          const firstBrokerNameValue = sessionStorage.getItem("brokername"); // Assuming brokerName[0].value exists
          clientList = globleBrokerClientList
            .filter(
              (dataClient) =>
                dataClient.type.toUpperCase() === firstBrokerNameValue
            )
            .map((dataInfo) => ({
              value: dataInfo.userName,
              label: dataInfo.userName,
            }));
        } else {
          clientList = []; // Provide a default value if brokerName is empty
        }
        setOptionsClient(clientList);
        if (sessionStorage.getItem("clienttoken") !== null && sessionStorage.getItem("clienttoken") !== "") {
          setClientSelect(clientList[0]);
          updateGlobleSelectedClientInfo(sessionStorage.getItem("clienttoken"));
        } else {
          if (clientSelect === "") {
            setClientSelect(clientList[0]);
            updateGlobleSelectedClientInfo(clientList[0].value);
            sessionStorage.setItem("clienttoken", clientList[0].value);
          }
        }
      }
    }
  }, [globleBrokerClientList]);

  useEffect(() => {
    CookiesConfig.removeCookie("symbolList");
    if (CookiesConfig.getCookie("symbolList").length > 0) {
      var symbolData = JSON.parse(CookiesConfig.getCookie("symbolList"));
      if (symbolData.length === 0) {
        getSymbolExpiry();
      } else {
        setSymbolData();
      }
    } else {
      getSymbolExpiry();
    }

    if (sessionStorage.getItem("tradingtype") !== null && sessionStorage.getItem("tradingtype") !== "") {
      updateGlobleSelectedTradingType(sessionStorage.getItem("tradingtype"));
      let dataTraderType = optionsTradingType.find((data) => data.label === sessionStorage.getItem("tradingtype"));
      if (dataTraderType !== null) {
        setTradingTypeSelect(dataTraderType);
      }
    } else {
      if (tradingTypeSelect === "") {
        setTradingTypeSelect(optionsTradingType[0]);
        sessionStorage.setItem("tradingtype", optionsTradingType[0].value);
        updateGlobleSelectedTradingType(optionsTradingType[0].value);
      }
    }


  }, []);


  useEffect(() => {
    if (sessionStorage.getItem("clienttoken") !== null
      && sessionStorage.getItem("clienttoken") !== ""
      && sessionStorage.getItem("tradingtype") !== null
      && sessionStorage.getItem("tradingtype") !== ""
    )
      document.title = sessionStorage.getItem("clienttoken") + " (" + sessionStorage.getItem("tradingtype") + ") - QuikTrade - FNOTrader.com"; // Set the title when the component mounts
  }, [sessionStorage.getItem("clienttoken"),
  sessionStorage.getItem("tradingtype")]); // Empty dependency array to ensure it only runs once on mount

  const setSymbolData = () => {
    let stockSymbols = JSON.parse(CookiesConfig.getCookie("symbolList"));
    const StockSymbolList = stockSymbols.map((cl) => {
      return {
        label: cl,
        value: cl,
      };
    });
    setStockSymbolInformation(StockSymbolList);
  };

  const getSymbolExpiry = async () => {
    let symbol = [];
    let data = await ZerodaAPI.getSymbolExpiry();
    if (data != null) {
      if (data.objExpiryData != null) {
        data.objExpiryData.map((cl) => symbol.push(cl.name));
        CookiesConfig.setCookie("symbolList", JSON.stringify(symbol));
        localStorage.setItem(
          "symbolExpiryData",
          JSON.stringify(data.objExpiryData)
        );
      }
      if (data.objTokenData != null) {
        localStorage.setItem(
          "symbolSpotTokenList",
          JSON.stringify(data.objTokenData)
        );
      }
      setSymbolData();
    }
  };

  const getExpiryForSymbol = (symbolName) => {
    let symbolExpiryData = JSON.parse(
      localStorage.getItem("symbolExpiryData")
    );
    if (symbolExpiryData != null) {
      const objExpiryList = symbolExpiryData.find(
        (expiry) => expiry.name === symbolName
      );
      let dsSpotTokenList = JSON.parse(
        localStorage.getItem("symbolSpotTokenList")
      );
      if (dsSpotTokenList != null) {
        if (channelName?.length == 0) {
          let channelData = dsSpotTokenList.map((data) => ({
            instrumentToken: data.instrumentToken,
            tokenType: data.tokenType,
          }));
          setChannelName(channelData);
        }
        const { expiries } = objExpiryList;
        const expiriesList = expiries.map((cl) => {
          return {
            label: Moment(new Date(cl)).format("DD MMM yyyy"),
            value: cl,
          };
        });
        setExpityData(expiriesList);
      }
    }
  };

  useEffect(() => {
    if (expityData.length > 0) {
      if (sessionStorage.getItem("currentExpityData") !== null && sessionStorage.getItem("currentExpityData") !== "") {
        let currentExpityData = sessionStorage.getItem("currentExpityData");
        let expiryCurrentData = expityData.find((data) => data.value === currentExpityData);
        if (expiryCurrentData != null) {
          setExpityValue(expiryCurrentData);
          updateGlobleExpityValue(currentExpityData);
        }
      } else {
        setExpityValue(expityData[0]);
        updateGlobleExpityValue(expityData[0].value);
        sessionStorage.setItem("currentExpityData", expityData[0].value);
      }
    }
  }, [expityData]);

  useEffect(() => {
    if (channelName != "") {
      setStopLastPrice(false);
      setStopLastAmt(0);
      setFutureLastPrice(false);
      setFutureLastAmt(0);
      if (!isMarketHours()) {
        callApiToGetPreviosDayData();
      } else {
        getStockIndex();
      }

    }
  }, [channelName]);

  const getStockIndex = () => {
    // Initialize Centrifuge client
    const centrifugeInstance = new Centrifuge(
      "wss://stock-api2.fnotrader.com/connection/websocket"
    );
    // Set up event listeners for connection state
    centrifugeInstance.on("connect", () => {
      //console.log('Connected to Centrifuge');    
      channelName.map((cName) => {
        const channel = centrifugeInstance.subscribe(cName.instrumentToken);
        channel.on("publish", (data) => {
          if (data.data != null) {
            setChannelStatus(1);
            let infodata = data.data;
            setIndexData((previousData) => {
              const index = previousData.findIndex(
                (dataToken) =>
                  dataToken.token === parseInt(cName.instrumentToken) &&
                  dataToken.tokenType === cName.tokenType
              );
              if (index !== -1) {
                // If the name exists, update it
                const newData = [...previousData];
                const updatedInfoData = {
                  ...infodata,
                  tokenType: cName.tokenType,
                };
                newData[index] = updatedInfoData;
                return newData;
              } else {
                // If the name doesn't exist, add it
                const updatedInfoData = {
                  ...infodata,
                  tokenType: cName.tokenType,
                };
                return [...previousData, updatedInfoData];
              }
            });
          }
        });
        channel.on("close", (data) => {
          setChannelStatus(0);
          //console.log('Channel closed');
        });
        channel.on("unsubscribe", (data) => {
          setChannelStatus(0);

        });
        channel.on("error", (err) => {
          //console.error('Channel error:', err);
        });
      });
      // ... Add more channel event listeners or configurations as needed
    });

    centrifugeInstance.on("disconnect", () => {
      //console.log('Disconnected from Centrifuge');
    });
    // Connect to Centrifuge server
    centrifugeInstance.connect();

    // Cleanup on component unmount
    return () => {

      centrifugeInstance.disconnect();
    };
  };

  const callApiToGetPreviosDayData = async () => {
    if (channelName?.length > 0) {
      channelName.map(async (cName) => {
        const result = await ZerodaAPI.callApiToGetPreviosDayDataForChannel(
          cName.instrumentToken
        );
        const { code, data } = result;
        let infodata = data[cName.instrumentToken];
        setIndexData((previousData) => {
          const index = previousData.findIndex(
            (dataToken) =>
              dataToken.token === parseInt(cName.instrumentToken) &&
              dataToken.tokenType === cName.tokenType
          );
          if (index !== -1) {
            // If the name exists, update it
            const newData = [...previousData];
            const updatedInfoData = { ...infodata, tokenType: cName.tokenType };
            newData[index] = updatedInfoData;
            return newData;
          } else {
            // If the name doesn't exist, add it
            const updatedInfoData = { ...infodata, tokenType: cName.tokenType };
            return [...previousData, updatedInfoData];
          }
        });
      });
    }
  };

  const callApiToHeadtocken = async (instrumentToken) => {
    const result = await ZerodaAPI.callApiToGetPreviosDayDataForChannel(
      instrumentToken
    );
    if (result !== null) {
      const { code, data } = result;
      let infodata = data[instrumentToken];
      return infodata.prev.p;
    } else {
      return 0;
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      if (indexData?.length > 0 && symbolSelect) {
        let dsSpotTokenList = JSON.parse(
          localStorage.getItem("symbolSpotTokenList")
        );

        let infoData = dsSpotTokenList.find(
          (data) =>
            data.underlying === symbolSelect.value && data.tokenType === "spot"
        );
        if (infoData != undefined) {
          const { instrumentToken } = infoData;
          let infoIndexData = indexData.find(
            (data) =>
              data.token === parseInt(instrumentToken) && data.tokenType === "spot"
          );
          if (infoIndexData != null) {
            //Call your asynchronous function inside async function                           
            let lastDayClosing = stopLastAmt;
            if (stopLastPrice === false) {
              lastDayClosing = await callApiToHeadtocken(instrumentToken);
              setStopLastPrice(true);
              setStopLastAmt(lastDayClosing);
            }
            const { lp } = infoIndexData;
            setCurrentStockIndex(lp);
            updateGlobleCurrentStockIndex(lp);
            const dataStockLTP = parseFloat(lp) - parseFloat(lastDayClosing);
            setCurrentStockLTP(parseFloat(dataStockLTP).toFixed(2));
            const changePer =
              ((parseFloat(lp) - parseFloat(lastDayClosing)) /
                parseFloat(lastDayClosing)) *
              100;
            setCurrentStockLTPPercent(
              (parseFloat(changePer).toFixed(2) < 0 ? -1 : 1) *
              parseFloat(changePer).toFixed(2)
            );
          }
          calculateFuture();
        }
      }
    };
    fetchData(); // Call the async function inside useEffect

  }, [indexData, symbolSelect, stopLastAmt, futureLastAmt]);

  useEffect(() => {
    if (symbolSelect !== "" && expityvalue !== "") {
      setStopLastPrice(false);
      setStopLastAmt(0);
      setFutureLastPrice(false);
      setFutureLastAmt(0);
    }
  }, [symbolSelect, expityvalue]);


  const calculateFuture = () => {
    const fetchDataFuture = async () => {
      let dsSpotTokenList = JSON.parse(
        localStorage.getItem("symbolSpotTokenList")
      );
      let infoFutureData = dsSpotTokenList.find(
        (data) =>
          data.underlying === symbolSelect.value && data.tokenType === "future"
      );
      const { instrumentToken } = infoFutureData;
      let lastDayClosinglp = futureLastAmt;
      if (futureLastPrice === false) {
        lastDayClosinglp = await callApiToHeadtocken(instrumentToken);
        setFutureLastPrice(true);
        setFutureLastAmt(lastDayClosinglp);
      }

      let infoFutureIndexData = indexData.find(
        (data) =>
          data.token === parseInt(instrumentToken) && data.tokenType === "future"
      );
      if (infoFutureIndexData != null) {
        const { lp } = infoFutureIndexData;
        const dayOpen = infoFutureIndexData?.do;
        setCurrentStockIndexFuture(lp);
        updateGlobleCurrentStockIndexFuture(lp);
        const dataStockLTP = parseFloat(lp) - parseFloat(lastDayClosinglp);
        setCurrentStockLTPFuture(parseFloat(dataStockLTP).toFixed(2));
        const changePer =
          ((parseFloat(lp) - parseFloat(lastDayClosinglp)) /
            parseFloat(lastDayClosinglp)) *
          100;
        setCurrentStockLTPPercentFuture(
          (parseFloat(changePer).toFixed(2) < 0 ? -1 : 1) *
          parseFloat(changePer).toFixed(2)
        );
      }
    }
    fetchDataFuture(); // Call the async function inside useEffect
  };

  useEffect(() => {
    if (stockSymbolInformation.length > 0) {
      if (symbolSelect === "") {
        if (sessionStorage.getItem("currentStockSymbol") !== null && sessionStorage.getItem("currentStockSymbol") !== null) {
          let currentStockSymbol = sessionStorage.getItem("currentStockSymbol")
          let stockSymbolData = stockSymbolInformation.find((data) => data.label === currentStockSymbol);
          setSymbolSelect(stockSymbolData);
          getExpiryForSymbol(currentStockSymbol);
          updateGlobleSymbol(currentStockSymbol);
        } else {
          setSymbolSelect(stockSymbolInformation[0]);
          sessionStorage.setItem(
            "currentStockSymbol",
            stockSymbolInformation[0].value
          );
          getExpiryForSymbol(stockSymbolInformation[0].value);
          updateGlobleSymbol(stockSymbolInformation[0].value);
        }
      }
    }
  }, [stockSymbolInformation]);

  const handleClientData = (e) => {
    setClientSelect(e);
    updateGlobleSelectedClientInfo(e.value);
    sessionStorage.setItem("clienttoken", e.value);
    updateGlobalProcessRMS(false);
  };

  const handleBrokerData = (e) => {
    let clientList = [];
    setBrokerSelect(e);
    updateGlobleBrokerName(e.value);
    sessionStorage.setItem("brokername", e.value);
    updateGlobalProcessRMS(false);
    if (e.value.length > 0) {
      const firstBrokerNameValue = e.value; // Assuming brokerName[0].value exists
      clientList = globleBrokerClientList
        .filter(
          (dataClient) => dataClient.type.toUpperCase() === firstBrokerNameValue
        )
        .map((dataInfo) => ({
          value: dataInfo.userName,
          label: dataInfo.userName,
        }));
    } else {
      clientList = []; // Provide a default value if brokerName is empty
    }
    setOptionsClient(clientList);
    setClientSelect(clientList[0]);
    updateGlobleSelectedClientInfo(clientList[0].value);
    sessionStorage.setItem("clienttoken", clientList[0].value);
  };

  const handleTradingTypeData = (e) => {
    updateGlobalProcessRMS(false);
    if (brokerSelect.value == "ZERODHA" && CookiesConfig.getCookie("User-ActiveSubscription").toString().toLowerCase() === "false") {
      setShow(true);
      return;
    } else if (brokerSelect.value != "ZERODHA" && CookiesConfig.getCookie("User-ActiveSubscription").toString().toLowerCase() === "false") {
      alertify.alert(
        'Information',
        'Only paper trading is enabled for ' + brokerSelect.value,
        () => {

        });
      return;
    }

    setTradingTypeSelect(e);
    sessionStorage.setItem("tradingtype", e.value);
    updateGlobleSelectedTradingType(e.value);

  };

  const handleExpityData = (e) => {
    setExpityValue(e);
    updateGlobleExpityValue(e.value);
    sessionStorage.setItem("currentExpityData", e.value);
    debugger;
    localStorage.setItem("currentExpityData", e.value);
    const currentStockSymbol = localStorage.getItem("currentStockSymbol");
    getOptionChainList(currentStockSymbol, e.value);

  };

  const handleSymbolChange = (e) => {
    setSymbolSelect(e);
    sessionStorage.setItem("currentStockSymbol", e.value);
    sessionStorage.setItem("currentExpityData", "");
    localStorage.setItem("currentStockSymbol", e.value);
    localStorage.setItem("currentExpityData", "");
    getExpiryForSymbol(e.value);
    updateGlobleSymbol(e.value);
    getOptionChainList(e.value);
  };

  const getOptionChainList = async (name, expiryDate) => {
    let data = await ZerodaAPI.getOptionChainList(name, expiryDate);

    if (data != null) {
      updateGlobleOptionChainList(data);
    }
  };
  const customStyles = {
    control: (provided) => ({
      ...provided,
      height: "25.5px", // Set the height for the control (input)
      fontSize: "9px",
      minHeight: "25.5px",
    }),
    menu: (provided) => ({
      ...provided,
      fontSize: "9px",
      minHeight: "25px",
      zIndex: "999999999",
    }),
  };

  useEffect(() => {
    if (
      clientSelect !== "" &&
      symbolSelect !== "" &&
      expityvalue !== "" &&
      tradingTypeSelect !== ""
    ) {
      getDefaultConfiguration();
      getRMSConfiguration();
    }
  }, [clientSelect, symbolSelect, expityvalue, tradingTypeSelect]);


  useEffect(() => {
    if (
      clientSelect !== "" &&
      symbolSelect !== ""
    ) {
      getGeneralConfiguration();
    }
  }, [clientSelect, symbolSelect]);


  const getDefaultConfiguration = async () => {
    if (clientSelect !== "" && symbolSelect !== "" && expityvalue !== "") {
      let dataInfo = {
        clientId: clientSelect.value,
        instrumentName: symbolSelect.value,
        expityDate: expityvalue.value,
        tradingMode: tradingTypeSelect.value,
      };
      let result = await PaperTradingAPI.getDefaultConfiguration(dataInfo);
      if (result != null) {
        if (result.length > 0) {
          sessionStorage.removeItem("defaultConfig");
          sessionStorage.setItem("defaultConfig", JSON.stringify(result));
        } else {
          if (
            symbolSelect.value != undefined &&
            expityvalue.value != undefined
          ) {
            getDefaultConfigFromBroker(symbolSelect.value, expityvalue.value, tradingTypeSelect.value);
          }
        }
      } else {
        if (symbolSelect.value != undefined && expityvalue.value != undefined) {
          getDefaultConfigFromBroker(symbolSelect.value, expityvalue.value, tradingTypeSelect.value);
        }
      }
    }
  };

  const getGeneralConfiguration = async () => {
    let dataInfo = {
      clientId: sessionStorage.getItem("clienttoken"),
      brokername: sessionStorage.getItem("brokername")
    }
    let result = await PaperTradingAPI.getGeneralConfiguration(dataInfo);
    if (result != null) {
      if (result.length > 0) {
        sessionStorage.removeItem("generalConfig");
        sessionStorage.setItem("generalConfig", JSON.stringify(result));
      }
    }
  }


  const getRMSConfiguration = async () => {
    let dataInfo = {
      clientId: sessionStorage.getItem("clienttoken"),
      brokername: sessionStorage.getItem("brokername"),
      tradingmode: sessionStorage.getItem("tradingtype"),
      instrumentName: symbolSelect.value,
      expiryDate: expityvalue.value,
    }
    let result = await PaperTradingAPI.getRMSConfiguration(dataInfo);
    if (result != null) {
      if (result.length > 0) {
        sessionStorage.removeItem("RMSConfig");
        sessionStorage.setItem("RMSConfig", JSON.stringify(result));

      } else {

      }
    } else {

    }
  }


  const isMarketHours = () => {
    // if (globalServerTime !== "") {
    //   const receivedTime = new Date(globalServerTime);
    //   const formattedCurrentDate = `${receivedTime.getFullYear()}-${(receivedTime.getMonth() + 1).toString().padStart(2, '0')}-${receivedTime.getDate().toString().padStart(2, '0')}`;
    //   let holidays = JSON.parse(CookiesConfig.getCookie("holidaylist"));
    //   const isHoliday = holidays.some(holiday => holiday.formattedDate === formattedCurrentDate);
    //   const marketOpenTime = new Date();
    //   marketOpenTime.setHours(9, 15, 0, 0); // 9:15 AM
    //   const marketCloseTime = new Date();
    //   marketCloseTime.setHours(15, 30, 0, 0); // 3:30 PM  
    //   const dayOfWeek = receivedTime.getDay();
    //   if (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday) {
    //     return false;
    //   } else {
    //     return receivedTime >= marketOpenTime && receivedTime <= marketCloseTime;
    //   }
    // } else {
    //   const receivedTime = new Date();
    //   const formattedCurrentDate = `${receivedTime.getFullYear()}-${(receivedTime.getMonth() + 1).toString().padStart(2, '0')}-${receivedTime.getDate().toString().padStart(2, '0')}`;
    //   let holidays = JSON.parse(CookiesConfig.getCookie("holidaylist"));
    //   const isHoliday = holidays.some(holiday => holiday.formattedDate === formattedCurrentDate);
    //   const marketOpenTime = new Date();
    //   marketOpenTime.setHours(9, 15, 0, 0); // 9:15 AM
    //   const marketCloseTime = new Date();
    //   marketCloseTime.setHours(15, 30, 0, 0); // 3:30 PM
    //   const dayOfWeek = receivedTime.getDay();

    //   if (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday) {
    //     return false;
    //   } else {
    //     return receivedTime >= marketOpenTime && receivedTime <= marketCloseTime;
    //   }
    // }
  };


  const getDefaultConfigFromBroker = async (instrumentName, expiryDate, tradingTypeSelect) => {
    const result = await ZerodaAPI.callOptionChain(instrumentName, expiryDate);
    if (result != null) {
      const { code, data } = result;
      if (data != null) {
        if (data["opt"][expiryDate] != null) {
          let defaultArray = new Array();
          let dataInfo = {
            instrumentname: instrumentName,
            expirydate: expiryDate,
            clientId: clientSelect.value,
            defaultProductName: "MIS",
            defaultMaxQty: data["opt"][expiryDate][0].volumeFreeze,
            defaultSliceLot:
              parseInt(data["opt"][expiryDate][0].volumeFreeze) /
              parseInt(data["opt"][expiryDate][0].lotSize),
            defaultSliceQty: data["opt"][expiryDate][0].volumeFreeze,
            defaultValidity: "DAY",
            defaultOrderType: "MKT",
            defaultLotSize: 1,
            defaultQty: data["opt"][expiryDate][0].lotSize,
            defaultBrokerType: "Buy First",
            defaultShowQty: data["opt"][expiryDate][0].lotSize,
            defaultLMTPerCentage: 0,
            defaultTradingMode: tradingTypeSelect
          };
          defaultArray.push(dataInfo);
          sessionStorage.removeItem("defaultConfig");
          sessionStorage.setItem("defaultConfig", JSON.stringify(defaultArray));
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  };

  const handdleLogOut = () => {
    alertify.confirm(
      "Logout Confirmation",
      "Do you want to logout.",
      () => {
        CookiesConfig.removeCookie("Fnotrader-Secret");
        CookiesConfig.removeCookie("Fnotrader-Userid");
        CookiesConfig.removeCookie("User-ActiveSubscription");
        CookiesConfig.removeCookie("User-BrokerLoggedIn");
        sessionStorage.removeItem("fnotraderUserid");
        sessionStorage.removeItem("fnotraderSecret");
        sessionStorage.clear();
        window.open(
          "https://www.fnotrader.com/trading/broker-accounts",
          "_self"
        );
      },
      () => { }
    );
  };

  const handleClosePopup = () => {
    setShow(false);
  }

  return (
    <>
      <div className="header" style={{ backgroundColor: "#FFFFFF" }}>
        <Container fluid>
          <div className="header-body">
            {/* Card stats */}
            <Row className="py-1">
              <Col xl="2">
                <img
                  alt="..."
                  src={require("../assets/img/icons/common/icon.png")}
                  //src={"../assets/img/icons/common/quickTrade.svg"}
                  style={{ height: "25px", marginRight: "5px" }}
                />

                <img
                  alt="..."
                  src={require("../assets/img/icons/common/logo.jpg")}
                  //src={"../assets/img/icons/common/quickTrade.svg"}
                  style={{ height: "32px" }}
                />
              </Col>
              <Col xl="2" xs="12">
                <Row>
                  <Col xl="6" xs="6">
                    <Select
                      options={optionsBroker}
                      value={brokerSelect}
                      styles={customStyles}
                      onChange={handleBrokerData}
                    />
                  </Col>
                  <Col xl="6" xs="6">
                    <Select
                      options={optionsClient}
                      value={clientSelect}
                      styles={customStyles}
                      onChange={handleClientData}
                    />
                  </Col>
                </Row>
              </Col>
              <Col xl="3" xs="12">
                <Row>
                  <Col xl="4" xs="4">
                    <Select
                      options={optionsTradingType}
                      value={tradingTypeSelect}
                      styles={customStyles}
                      onChange={handleTradingTypeData}
                    />
                  </Col>
                  <Col xl="4" xs="4">
                    <Select
                      options={stockSymbolInformation}
                      value={symbolSelect}
                      onChange={handleSymbolChange}
                      styles={customStyles}
                    />
                  </Col>
                  <Col xl="4" xs="4">
                    <Select
                      options={expityData}
                      value={expityvalue}
                      styles={customStyles}
                      onChange={handleExpityData}
                    />
                  </Col>
                </Row>
              </Col>
              <Col xl="5">
                <Row>
                  <Col xl="5" xs="5">
                    <Row>
                      <Col xl="12" className="" style={{ textAlign: "center" }}>
                        <label className="form-control-label mr-2">SPOT</label>
                        <label
                          className={
                            "form-control-label  mr-2 " +
                            (parseFloat(currentStockLTP) >= 0
                              ? "text-success currentstock"
                              : "text-danger currentstock")
                          }
                        >
                          {parseFloat(currentStockIndex).toFixed(2)}
                        </label>
                        <label
                          className={
                            "form-control-label  " +
                            (parseFloat(currentStockLTP) >= 0
                              ? "text-success currentstock"
                              : "text-danger currentstock")
                          }
                        >
                          {parseFloat(currentStockLTP) >= 0 ? "+" : ""}
                          {parseFloat(currentStockLTP).toFixed(2)}(
                          {parseFloat(currentStockLTP) >= 0 ? "+" : "-"}
                          {parseFloat(currentStockLTPPercent).toFixed(2)}%)
                        </label>
                      </Col>
                    </Row>
                  </Col>
                  <Col xl="5" xs="5">
                    <Row>
                      <Col xl="12" style={{ textAlign: "center" }}>
                        <label className="form-control-label  mr-2">
                          FUTURE
                        </label>
                        <label
                          className={
                            " form-control-label  mr-2 " +
                            (currentStockLTPFuture >= 0
                              ? "text-success currentstock"
                              : "text-danger currentstock")
                          }
                        >
                          {parseFloat(currentStockIndexFuture).toFixed(2)}
                        </label>
                        <label
                          className={
                            " form-control-label " +
                            (currentStockLTPFuture >= 0
                              ? "text-success currentstock"
                              : "text-danger currentstock")
                          }
                        >
                          {parseFloat(currentStockLTPFuture) >= 0 ? "+" : ""}
                          {parseFloat(currentStockLTPFuture).toFixed(2)}(
                          {parseFloat(currentStockLTPFuture) >= 0 ? "+" : "-"}
                          {parseFloat(currentStockLTPPercentFuture).toFixed(2)}
                          %)
                        </label>
                      </Col>
                    </Row>
                  </Col>
                  <Col xl="2" xs="2" style={{ textAlign: "right" }}>
                    <Nav className="align-items-center d-none d-md-flex" navbar>
                      <UncontrolledDropdown nav>
                        <DropdownToggle className="pr-0" nav>
                          <i
                            className="fas fa-gear"
                            style={{ fontSize: "20px" }}
                          ></i>
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-arrow" right>
                          <DropdownItem className="noti-title" header tag="div">
                            <h6 className="text-overflow m-0">Welcome!</h6>
                          </DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem to="https://www.fnotrader.com/trading/broker-accounts" tag={Link}>
                            <i className="ni ni-single-02" />
                            <span>Broker List</span>
                          </DropdownItem>
                          <DropdownItem
                            href="#pablo"
                            onClick={(e) => handdleLogOut()}
                          >
                            <i className="ni ni-user-run" />
                            <span>Logout</span>
                          </DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </Nav>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
      <StaticPopup
        message={["Please buy a valid subscription to trade with the Broker Account."]}
        title={"Upgrade Now"}
        isShow={show}
        link={"/quiktrade/pricing"}
        btnText_1={"Upgrade Now"}
        btnText_2={"Cancel"}
        handleClosePopup={handleClosePopup}
      />
    </>
  );
};
export default AdminHeader;
