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
import {  PostContext } from "../PostProvider.js";
import { PaperTradingAPI } from "../api/PaperTradingAPI"; 
import alertify from "alertifyjs";
import { Nav, UncontrolledDropdown, DropdownToggle } from "reactstrap";
import StaticPopup from "./Static-Popup.js";

const AdminHeader = () => {
  const [symbolSelect, setSymbolSelect] = useState("");
  const [expityvalue, setExpityValue] = useState("");
  const [currentStockIndex, setCurrentStockIndex] = useState("0.00");
  const [currentStockIndexFuture, setCurrentStockIndexFuture] =
    useState("0.00");
  const [stockSymbolInformation, setStockSymbolInformation] = useState([]);
  const [currentStockLTP, setCurrentStockLTP] = useState("0.00");
  const [currentStockLTPPercent, setCurrentStockLTPPercent] = useState("0.00");
  const [currentStockLTPFuture, setCurrentStockLTPFuture] = useState("0.00");
  const [currentStockLTPPercentFuture, setCurrentStockLTPPercentFuture] =
    useState("0.00");
  const [expityData, setExpityData] = useState([]);
  const [show, setShow] = useState(false);
 
  const {
    updateGlobleSymbol,
    updateGlobleExpityValue,
    updateGlobleCurrentStockIndex,
    updateGlobleCurrentStockIndexFuture,
    updateGlobleSelectedTradingType,
    updateGlobleSelectedClientInfo,
    updateGlobleBrokerName,
    globleBrokerClientList,
    globalServerTime,
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
      debugger;
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
        if (brokerSelect === "") {
          setBrokerSelect(brokerName[0]);
          debugger;
          let indexClient = globleBrokerClientList.findIndex(
            (dataClient) => dataClient.userName === brokerName[0].value
          );
          updateGlobleBrokerName(brokerName[0].value);
          sessionStorage.setItem("brokername", brokerName[0].value);
        }
        sessionStorage.setItem(
          "apiSecret",
          globleBrokerClientList[0].apiKey +
            ":" +
            globleBrokerClientList[0].apiToken
        );
        if (brokerName.length > 0) {
          const firstBrokerNameValue = brokerName[0].value; // Assuming brokerName[0].value exists
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
        if (clientSelect === "") {
          setClientSelect(clientList[0]);
          updateGlobleSelectedClientInfo(clientList[0].value);
          sessionStorage.setItem("clienttoken", clientList[0].value);
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

    if (tradingTypeSelect === "") {
      setTradingTypeSelect(optionsTradingType[0]);
      sessionStorage.setItem("tradingtype", optionsTradingType[0].value);
      updateGlobleSelectedTradingType(optionsTradingType[0].value);
    }
  }, []);

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
    debugger;
    let symbol = [];
    let data = await ZerodaAPI.getSymbolExpiry();
    if (data != null) {
      if (data.objExpiryData != null) {
        data.objExpiryData.map((cl) => symbol.push(cl.name));
        CookiesConfig.setCookie("symbolList", JSON.stringify(symbol));
        CookiesConfig.setCookie(
          "symbolExpiryData",
          JSON.stringify(data.objExpiryData)
        );
      }
      if (data.objTokenData != null) {
        CookiesConfig.setCookie(
          "symbolSpotTokenList",
          JSON.stringify(data.objTokenData)
        );
      }
      setSymbolData();
    }
  };

  const getExpiryForSymbol = (symbolName) => {
    debugger;
    let symbolExpiryData = JSON.parse(
      CookiesConfig.getCookie("symbolExpiryData")
    );
    if (symbolExpiryData != null) {
      const objExpiryList = symbolExpiryData.find(
        (expiry) => expiry.name === symbolName
      );
      let dsSpotTokenList = JSON.parse(
        CookiesConfig.getCookie("symbolSpotTokenList")
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
      setExpityValue(expityData[0]);
      updateGlobleExpityValue(expityData[0].value);
    }
  }, [expityData]);

  useEffect(() => {
    if (channelName != "") {
      getStockIndex();
    }
  }, [channelName]);

  const getStockIndex = () => {
    // Initialize Centrifuge client
    const centrifugeInstance = new Centrifuge(
      "wss://stock-api.fnotrader.com/connection/websocket"
    );
    // Set up event listeners for connection state
    centrifugeInstance.on("connect", () => {
      //console.log('Connected to Centrifuge');
      if (!isMarketHours()) { 
        callApiToGetPreviosDayData();
      }
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

  useEffect(() => {
    if (indexData?.length > 0 && symbolSelect) {
      let dsSpotTokenList = JSON.parse(
        CookiesConfig.getCookie("symbolSpotTokenList")
      );
      let infoData = dsSpotTokenList.find(
        (data) =>
          data.underlying === symbolSelect.value && data.tokenType === "spot"
      );
      const { instrumentToken, lastDayClosinglp } = infoData;
      let infoIndexData = indexData.find(
        (data) =>
          data.token === parseInt(instrumentToken) && data.tokenType === "spot"
      );
      if (infoIndexData != null) {
        const { lp } = infoIndexData;
        const dayOpen = infoIndexData?.do;
        setCurrentStockIndex(lp);
        updateGlobleCurrentStockIndex(lp);
        const dataStockLTP = parseFloat(lp) - parseFloat(lastDayClosinglp);
        setCurrentStockLTP(parseFloat(dataStockLTP).toFixed(2));
        const changePer =
          ((parseFloat(lp) - parseFloat(lastDayClosinglp)) /
            parseFloat(lastDayClosinglp)) *
          100;
        setCurrentStockLTPPercent(
          (parseFloat(changePer).toFixed(2) < 0 ? -1 : 1) *
            parseFloat(changePer).toFixed(2)
        );
      }
      calculateFuture();
    }
  }, [indexData, symbolSelect]);

  const calculateFuture = () => {
    let dsSpotTokenList = JSON.parse(
      CookiesConfig.getCookie("symbolSpotTokenList")
    );
    let infoFutureData = dsSpotTokenList.find(
      (data) =>
        data.underlying === symbolSelect.value && data.tokenType === "future"
    );

    const { instrumentToken, lastDayClosinglp } = infoFutureData;
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
  };

  useEffect(() => {
    if (stockSymbolInformation.length > 0) {
      if (symbolSelect == "") {
        setSymbolSelect(stockSymbolInformation[0]);
        CookiesConfig.setCookie(
          "currentStockSymbol",
          stockSymbolInformation[0]
        );
        getExpiryForSymbol(stockSymbolInformation[0].value);
        updateGlobleSymbol(stockSymbolInformation[0].value);
      }
    }
  }, [stockSymbolInformation]);

  const handleClientData = (e) => {
    setClientSelect(e);
    updateGlobleSelectedClientInfo(e.value);
    sessionStorage.setItem("clienttoken", e.value);
  };

  const handleBrokerData = (e) => {
    let clientList = [];
    setBrokerSelect(e);
    updateGlobleBrokerName(e.value);
    sessionStorage.setItem("brokername", e.value);
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

    if(brokerSelect.value == "ZERODHA" && CookiesConfig.getCookie("User-ActiveSubscription").toString().toLowerCase()==="false"){
      setShow(true);   
      return;           
   } else if (brokerSelect.value != "ZERODHA" && CookiesConfig.getCookie("User-ActiveSubscription").toString().toLowerCase()==="false") {
     alertify.alert(
       'Information',
       'Only paper trading is enabled for '+brokerSelect.value,
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
    CookiesConfig.setCookie("currentExpityData", e.value);
  };

  const handleSymbolChange = (e) => {
    setSymbolSelect(e);
    CookiesConfig.setCookie("currentStockSymbol", e.value);
    getExpiryForSymbol(e.value);
    updateGlobleSymbol(e.value);
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
    }
  }, [clientSelect, symbolSelect, expityvalue, tradingTypeSelect]);

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
          debugger;
          sessionStorage.removeItem("defaultConfig");
          sessionStorage.setItem("defaultConfig", JSON.stringify(result));
        } else {
          if (
            symbolSelect.value != undefined &&
            expityvalue.value != undefined
          ) {
            getDefaultConfigFromBroker(symbolSelect.value, expityvalue.value);
          }
        }
      } else {
        debugger;
        if (symbolSelect.value != undefined && expityvalue.value != undefined) {
          getDefaultConfigFromBroker(symbolSelect.value, expityvalue.value);
        }
      }
    }
  };

  const isMarketHours = () => {
    return false;
    // if(globalServerTime!==""){
    //   const receivedTime = new Date(globalServerTime);
    //   const marketOpenTime = new Date();
    //   marketOpenTime.setHours(9, 15, 0, 0); // 9:15 AM
    //   const marketCloseTime = new Date();
    //   marketCloseTime.setHours(15, 30, 0, 0); // 3:30 PM
    //   return receivedTime >= marketOpenTime && receivedTime <= marketCloseTime;
    // }else{
    //   return true;
    // }
    
};


  const getDefaultConfigFromBroker = async (instrumentName, expiryDate) => {
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
        window.open(
          "https://www.fnotrader.com/trading/broker-accounts",
          "_self"
        );
      },
      () => {}
    );
  };

  const handleClosePopup =()=>{
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
                          <DropdownItem to="/admin/user-profile" tag={Link}>
                            <i className="ni ni-single-02" />
                            <span>My profile</span>
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
