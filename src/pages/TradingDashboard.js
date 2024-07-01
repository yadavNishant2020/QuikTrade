import { React, useEffect, useState, useLayoutEffect, useRef } from "react";
import AdminStockIndex from "../components/AdminStockIndex.js";
import AdminDefaultConfig from "../components/AdminDefaultConfig.js";
import AdminGeneralSetting from "../components/AdminGeneralSetting.js";
import AdminRMSSetting from "../components/AdminRMSSetting.js";
import AdminOptionChain from "../components/AdminOptionChain.js";
import AdminOptionChainSetup from "../components/AdminOptionChainSetup.js";
import AdminOrderPositionDetails from "../components/AdminOrderPositionDetails.js";
import AdminStraddle from "../components/AdminStraddle.js";
import AdminStrangle from "../components/AdminStrangle.js";
import AdminOrderFooter from "../components/AdminOrderFooter.js";
import AdminRule from "../components/AdminRule.js";
import AdminCompletedOrder from "../components/AdminCompletedOrder.js";
import AdminTrades from "../components/AdminTrades.js";
import { ZerodaAPI } from "../api/ZerodaAPI.js";
import Centrifuge from "centrifuge";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import LoaderComponent from "../components/LoaderComponent.js";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardHeader,
  CardBody,
  NavItem,
  NavLink,
  Nav,
  Progress,
  Table,
} from "reactstrap";
import { PostProvider, PostContext } from "../PostProvider.js";
import { useContext } from "react";
import AdminFooter from "../components/AdminFooter.js";
import { PaperTradingAPI } from "../api/PaperTradingAPI.js";
import { CookiesConfig } from "../Config/CookiesConfig.js";
import AdminClosedOrder from "../components/AdminClosedOrder.js";
import AdminLogs from "../components/AdminLogs.js";
import AdminFunds from "../components/AdminFunds.js";
import ModalComponent from "../components/modal.js";

const TreadingDashboard = () => {
  const divRef = useRef(null);
  const [selectedDropdownValue, setSelectedDropdownValue] = useState("default");
  const handleDropdownChange = (event) => {
    setSelectedDropdownValue(event.target.value);
  };

  const [configOpenSlider, setConfigOpenSlider] = useState(false);
  const [ruleOpenSlider, setRuleOpenSlider] = useState(false);
  const [sideMenuTroggle, setSideMenuTroggle] = useState(false);
  const [sideMenuName, setSideMenuName] = useState("");
  const [optionChainList, setOptionChainList] = useState([]);
  const [filterOptionChainList, setFilterOptionChainList] = useState([]);
  const [filterFutureChainList, setFilterFutureChainList] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [initSocket, setInitSocket] = useState(false);
  const [centrifugeInstance, setCentrifugeInstance] = useState(null);
  const [baseTable, setBaseTable] = useState([]);
  const [baseTableDisconnect, setBaseTableDisconnect] = useState([]);

  const [strickPrices, setStrickPrices] = useState(0);
  const [channelStatus, setChannelStatus] = useState(0);
  const [channelProcessStatus, setChannelProcessStatus] = useState(0);
  const [filterOrderPositionList, setOrderPositionList] = useState([]);
  const [height, setHeight] = useState(0);
  const [sideMenuSettingTroggle, setSideMenuSettingTroggle] = useState(false);
  const [sideMenuRMSTroggle, setSideMenuRMSTroggle] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [displayPopUp, setDisplayPopUp] = useState(true);
  const [expiryDate, setExpiryDate] = useState(null);

  const centrifugeInstanceNew = new Centrifuge(
    "wss://stock-api2.fnotrader.com/connection/websocket"
  );
  const {
    globleSymbol,
    globleExpityvalue,
    globleCurrentStockIndex,
    globleCurrentATM,
    globleCurrentStockIndexFuture,
    updateGlobleCurrentATM,
    updatGlobleTabIndex,
    globleOptionChainType,
    globleSelectedClientInfo,
    globleOrderPosition,
    updateGloblePositionChange,
    updateGlobleOptionChainList,
    globleUniqueChannelData,
    globleChangeDefaultSetting,
    updateGlobleConfigPostionData,
    globleSelectedTradingType,
    globalServerTime,
    globalProcessRMS,
  } = useContext(PostContext);


  useEffect(() => {
    const fetchExpiryData = async () => {
      const currentStockSymbol = localStorage.getItem("currentStockSymbol");
      const currentExpiryData = localStorage.getItem("currentExpityData");
      const result = await ZerodaAPI.fetchExpiryData(currentStockSymbol);

      if (result && result.data && result.data.expiries) {
        const expiries = result.data.expiries;
        if (expiries.length > 0) {
          const firstExpiryDate = expiries[0];
          if (currentExpiryData === globleExpityvalue) {
            setExpiryDate(globleExpityvalue);
          } 
          else if (currentExpiryData.length > 0) {
            setExpiryDate(firstExpiryDate);
          } 
          else {
            setExpiryDate(firstExpiryDate);
          }
          getOptionChainList(currentStockSymbol, globleExpityvalue);
        }
      }
    };

    fetchExpiryData();
  }, [globleSymbol, globleExpityvalue]);

  useLayoutEffect(() => {
    const handleResize = () => {
      setHeight(divRef?.current?.children[0]?.clientHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (
      globleSelectedClientInfo.length > 0 &&
      globleSelectedTradingType.length > 0
    ) {
      let data = {
        clientId: globleSelectedClientInfo,
        tradermode: globleSelectedTradingType,
      };
      getallconfigforpositionData(data);
    }
  }, [
    globleChangeDefaultSetting,
    globleSelectedClientInfo,
    globleSelectedTradingType,
  ]);

  const getallconfigforpositionData = async (requestData) => {
    const resultData = await PaperTradingAPI.getallconfigforposition(
      requestData
    );

    if (resultData != null) {
      updateGlobleConfigPostionData(resultData);
    }
  };

  useEffect(() => {
    if (globleSymbol.length > 0 && globleExpityvalue.length > 0) {
      let data = baseTable;
      setBaseTableDisconnect(baseTable);
      setBaseTable([]);
      setFilterOptionChainList([]);
      if (centrifugeInstance) {
        // Disconnect the existing WebSocket instance
        centrifugeInstance.disconnect();
      }
      // Create a new Centrifuge instance
      const newCentrifugeInstance = new Centrifuge(
        "wss://stock-api2.fnotrader.com/connection/websocket"
      );
      // Connect to the server
      newCentrifugeInstance.connect();

      // Save the new instance to state
      setCentrifugeInstance(newCentrifugeInstance);
      // Cleanup on component unmount
      return () => {
        newCentrifugeInstance.disconnect();
      };
    }
  }, [globleSymbol, globleExpityvalue]);

  const processOptionChainArray = () => {
    let dataInfo = [];
    if (globleOptionChainType === "opt") {
      dataInfo = optionChainList.filter(
        (data) =>
          data.name === globleSymbol &&
          data.expiryDate === globleExpityvalue &&
          data.strikePrice > 0 &&
          data.tokenType === globleOptionChainType
      );
      const newoptionChainData = dataInfo
        .slice()
        .sort((a, b) => {
          const strickComparison =
            parseFloat(a.strikePrice) - parseFloat(b.strikePrice);
          return strickComparison === 0
            ? a.instrumentType.localeCompare(b.instrumentType)
            : strickComparison;
        })
        .map((data) => data?.strikePrice);

      let infoOptionChain = getElementRange(
        [...new Set(newoptionChainData)],
        strickPrices,
        10,
        "strikePrice"
      );
      const filteredArray = dataInfo.filter((item) =>
        infoOptionChain.includes(item.strikePrice)
      );
      if (infoOptionChain.length > 0) {
        let strikePriceDiff =
          parseInt(infoOptionChain[1]) - parseInt(infoOptionChain[0]);
        sessionStorage.setItem("strikePriceDiff", strikePriceDiff);
      }

      setBaseTable(filteredArray);
      setFilterOptionChainList(filteredArray);
    } else {
      dataInfo = optionChainList.filter(
        (data) =>
          data.name === globleSymbol && data.tokenType === globleOptionChainType
      );

      setBaseTable(dataInfo);
      setFilterOptionChainList(dataInfo);
    }
  };

  const getElementRange = (arr, targetId, range, key) => {
    const targetIndex = arr.findIndex((item) => item === targetId.toString());
    if (targetIndex === -1) {
      return [];
    }
    const startIndex = Math.max(0, targetIndex - range);
    const endIndex = Math.min(arr.length - 1, targetIndex + range);
    return arr.slice(startIndex, endIndex + 1);
  };

  useEffect(() => {
    if (
      globleOptionChainType.length > 0 &&
      optionChainList?.length === totalRows &&
      optionChainList?.length > 0 &&
      globleSymbol.length > 0 &&
      globleExpityvalue.length > 0
    ) {
      setChannelStatus(0);
      processOptionChainArray();
    }
  }, [
    optionChainList,
    globleSymbol,
    globleExpityvalue,
    strickPrices,
    globleOptionChainType,
  ]);

  useEffect(() => {
    if (parseFloat(globleCurrentStockIndex) > 0) {
      const valueStr = Math.round(globleCurrentStockIndex).toString();
      let last2 = parseInt(valueStr.slice(-2));
      let diff = 0;
      let atm_price;
      if (last2 >= 90) {
        diff = 100 - last2;
        atm_price = parseInt(valueStr) + diff;
      } else if (last2 < 90) {
        atm_price = parseInt(valueStr) - last2;
      } else {
        atm_price = parseInt(valueStr);
      }
      updateGlobleCurrentATM(parseInt(atm_price));
    }
  }, [globleCurrentStockIndex]);

  const handleRuleSilder = () => {
    setRuleOpenSlider((ruleOpenSlider) => !ruleOpenSlider);
  };

  const getOptionChainList = async (name, expiryDate) => {
    let data = await ZerodaAPI.getOptionChainList(name, expiryDate);
    if (data != null) {
      setTotalRows(data.length);
      setOptionChainList(data);
      updateGlobleOptionChainList(data);
    }
  };

  const processOptionChain = () => {
    // Initialize Centrifuge client
    const centrifugeInstanceNew = new Centrifuge(
      "wss://stock-api2.fnotrader.com/connection/websocket"
    );
    // Connect to the server
    //let selectedChannel=optionChainList.find((data)=>data.underlying===globleSymbol && data.expiryDate===globleExpityvalue)
    centrifugeInstanceNew.on("connect", () => {
      baseTable.map((cName) => {
        // Subscribe to the channel (replace 'your-channel' with the actual channel name)
        if (cName.instrumentToken !== undefined) {
          const channel = centrifugeInstanceNew.subscribe(
            cName.instrumentToken
          );
          // Event listener for messages on the channel
          channel.on("publish", (data) => {
            setChannelStatus(1);
            if (data.data !== null) {
              //console.log(data.data)
              let infodata = data.data;
              //rocessOptionChainLtp(data.data);
              setFilterOptionChainList((previousData) => {
                if (previousData != undefined) {
                  updatGlobleTabIndex(1);
                  const index = previousData.findIndex(
                    (item) =>
                      item.instrumentToken === infodata?.token?.toString()
                  );
                  if (index !== -1) {
                    previousData[index].ltp = parseFloat(infodata.lp).toFixed(
                      2
                    );
                    previousData[index].atp = parseFloat(infodata.atp).toFixed(
                      2
                    );
                    return previousData;
                  } else {
                    const tempBaseTable = baseTable.find(
                      (item) =>
                        item.instrumentToken === infodata?.token?.toString()
                    );
                    const updateData = {
                      ...tempBaseTable,
                      ltp: parseFloat(infodata.lp).toFixed(2),
                      atp: parseFloat(infodata.atp).toFixed(2),
                    };
                    return [...previousData, updateData];
                  }
                } else {
                  // let dataInfo=optionChainList.filter((data)=>data.name===globleSymbol && data.expiryDate===globleExpityvalue && data.strikePrice>0 );
                  // setBaseTable(dataInfo);
                }
              });
            }
          });

          // Cleanup on component unmount
          return () => {
            setChannelStatus(0);
            channel.unsubscribe();
            centrifugeInstanceNew.disconnect();
          };
        }
      });
    });
    centrifugeInstanceNew.on("disconnect", () => {
      setChannelStatus(0);
      callApiToGetPreviosDayData();
      //console.log('Disconnected from Centrifuge');
    });
    // Connect to Centrifuge server
    centrifugeInstanceNew.connect();

    // Cleanup on component unmount
    return () => {
      centrifugeInstanceNew.disconnect();
    };
  };

  const isMarketHours = () => {
    // if (globalServerTime !== "") {
    //   const receivedTime = new Date(globalServerTime);
    //   const formattedCurrentDate = `${receivedTime.getFullYear()}-${(
    //     receivedTime.getMonth() + 1
    //   )
    //     .toString()
    //     .padStart(2, "0")}-${receivedTime
    //       .getDate()
    //       .toString()
    //       .padStart(2, "0")}`;
    //   let holidays = JSON.parse(CookiesConfig.getCookie("holidaylist"));
    //   const isHoliday = holidays.some(
    //     (holiday) => holiday.formattedDate === formattedCurrentDate
    //   );
    //   const marketOpenTime = new Date();
    //   marketOpenTime.setHours(9, 15, 0, 0); // 9:15 AM
    //   const marketCloseTime = new Date();
    //   marketCloseTime.setHours(15, 30, 0, 0); // 3:30 PM
    //   const dayOfWeek = receivedTime.getDay();
    //   if (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday) {
    //     return false;
    //   } else {
    //     return (
    //       receivedTime >= marketOpenTime && receivedTime <= marketCloseTime
    //     );
    //   }
    // } else {
    //   const receivedTime = new Date();
    //   const formattedCurrentDate = `${receivedTime.getFullYear()}-${(
    //     receivedTime.getMonth() + 1
    //   )
    //     .toString()
    //     .padStart(2, "0")}-${receivedTime
    //       .getDate()
    //       .toString()
    //       .padStart(2, "0")}`;
    //   let holidays = JSON.parse(CookiesConfig.getCookie("holidaylist"));
    //   const isHoliday = holidays.some(
    //     (holiday) => holiday.formattedDate === formattedCurrentDate
    //   );
    //   const marketOpenTime = new Date();
    //   marketOpenTime.setHours(9, 15, 0, 0); // 9:15 AM
    //   const marketCloseTime = new Date();
    //   marketCloseTime.setHours(15, 30, 0, 0); // 3:30 PM
    //   const dayOfWeek = receivedTime.getDay();
    //   if (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday) {
    //     return false;
    //   } else {
    //     return (
    //       receivedTime >= marketOpenTime && receivedTime <= marketCloseTime
    //     );
    //   }
    // }
  };

  const callApiToGetPreviosDayData = async () => {
    if (baseTable?.length > 0) {
      baseTable.map(async (cName) => {
        const result = await ZerodaAPI.callApiToGetPreviosDayDataForChannel(
          cName.instrumentToken
        );
        const { code, data } = result;
        let infodata = data[cName.instrumentToken];
        setFilterOptionChainList((previousData) => {
          if (previousData != undefined) {
            updatGlobleTabIndex(1);
            const index = previousData.findIndex(
              (item) => item.instrumentToken === infodata?.token?.toString()
            );
            if (index !== -1) {
              previousData[index].ltp = parseFloat(infodata?.lp).toFixed(2);
              previousData[index].atp = parseFloat(infodata?.atp).toFixed(2);
              return previousData;
            } else {
              const tempBaseTable = baseTable.find(
                (item) => item.instrumentToken === infodata?.token?.toString()
              );
              const updateData = {
                ...tempBaseTable,
                ltp: parseFloat(infodata?.lp).toFixed(2),
                atp: parseFloat(infodata?.atp).toFixed(2),
              };
              return [...previousData, updateData];
            }
          } else {
            // let dataInfo=optionChainList.filter((data)=>data.name===globleSymbol && data.expiryDate===globleExpityvalue && data.strikePrice>0 );
            // setBaseTable(dataInfo);
          }
        });
      });

      setInterval(function () {
        updatGlobleTabIndex(1);
      }, 1000);
    }
  };

  useEffect(() => {
    if (parseFloat(globleCurrentStockIndex) > 0) {
      const valueStr = Math.round(globleCurrentStockIndex).toString();
      let last2 = parseInt(valueStr.slice(-2));
      let diff = 0;
      let atm_price;
      if (last2 >= 90) {
        diff = 100 - last2;
        atm_price = parseInt(valueStr) + diff;
      } else if (last2 < 90) {
        atm_price = parseInt(valueStr) - last2;
      } else {
        atm_price = parseInt(valueStr);
      }
      setStrickPrices(parseInt(atm_price));
      updateGlobleCurrentATM(parseInt(atm_price));
    }
  }, [globleCurrentStockIndex]);

  useEffect(() => {
    if (parseFloat(globleCurrentStockIndex) > 0 && optionChainList.length > 0) {
      const newoptionChainData = optionChainList.filter(
        (data) =>
          data.name === globleSymbol &&
          data.expiryDate === globleExpityvalue &&
          data.tokenType === "opt"
      );
      if (newoptionChainData.length > 0) {
        const differences = newoptionChainData.map((dataInfo) =>
          Math.abs(globleCurrentStockIndex - parseFloat(dataInfo.strikePrice))
        );
        const nearestValueIndex = differences.indexOf(Math.min(...differences));
        const nearestValue = newoptionChainData[nearestValueIndex]?.strikePrice;
        setStrickPrices(parseInt(nearestValue));
        updateGlobleCurrentATM(parseInt(nearestValue));
      }
    }
  }, [
    globleCurrentStockIndex,
    optionChainList,
    globleSymbol,
    globleExpityvalue,
    globleOptionChainType,
  ]);

  useEffect(() => {
    if (!isMarketHours()) {
      callApiToGetPreviosDayDataForPosition();
    } else {
      if (globleUniqueChannelData?.length > 0) {
        processPositionDataFromSocket();
      } else {
      }
    }
  }, [globleUniqueChannelData]);

  const callApiToGetPreviosDayDataForPosition = async () => {
    if (globleUniqueChannelData?.length > 0) {
      globleUniqueChannelData.map(async (cName) => {
        const result = await ZerodaAPI.callApiToGetPreviosDayDataForChannel(
          cName
        );
        const { code, data } = result;
        let infodata = data[cName];
        setOrderPositionList((previousData) => {
          if (previousData != undefined) {
            updateGloblePositionChange(1);
            const index = previousData.findIndex(
              (item) => item.instrumentToken === infodata?.token?.toString()
            );
            if (index !== -1) {
              previousData[index].ltp = parseFloat(infodata.lp).toFixed(2);
              return previousData;
            } else {
              const updateData = {
                instrumentToken: infodata.token.toString(),
                ltp: parseFloat(infodata.lp).toFixed(2),
              };
              //  const updateData={...tempBaseTable,ltp:getRandomFloat(getRandomFloat(1.0, 10.0)).toFixed(2)}
              return [...previousData, updateData];
            }
          } else {
            // let dataInfo=optionChainList.filter((data)=>data.name===globleSymbol && data.expiryDate===globleExpityvalue && data.strikePrice>0 );
            // setBaseTable(dataInfo);
          }
        });
      });

      setInterval(function () {
        updatGlobleTabIndex(1);
      }, 1000);
    }
  };

  const processPositionDataFromSocket = () => {
    // Initialize Centrifuge client

    // Connect to the server
    const centrifugePositionInstanceNew = new Centrifuge(
      "wss://stock-api2.fnotrader.com/connection/websocket"
    );
    centrifugePositionInstanceNew.on("connect", () => {
      globleUniqueChannelData.forEach((cName) => {
        // Subscribe to the channel (replace 'your-channel' with the actual channel name)
        if (cName !== undefined) {
          const channel = centrifugePositionInstanceNew.subscribe(cName);
          // Event listener for messages on the channel
          channel.on("publish", (data) => {
            setChannelStatus(1);
            if (data.data !== null) {
              let infodata = data.data;
              setOrderPositionList((previousData) => {
                if (previousData != null) {
                  updateGloblePositionChange(1);
                  const index = previousData.findIndex(
                    (item) =>
                      item.instrumentToken === infodata?.token?.toString()
                  );
                  // const tempBaseTable = globleUniqueChannelData.find((item) => item=== infodata?.token?.toString());
                  if (index !== -1) {
                    previousData[index].ltp = parseFloat(infodata.lp).toFixed(
                      2
                    );
                    // previousData[index].ltp = parseFloat(getRandomFloat(1.0, 10.0)).toFixed(2);
                    return [...previousData];
                  } else {
                    const updateData = {
                      instrumentToken: infodata.token.toString(),
                      ltp: parseFloat(infodata.lp).toFixed(2),
                    };
                    //  const updateData={...tempBaseTable,ltp:getRandomFloat(getRandomFloat(1.0, 10.0)).toFixed(2)}
                    return [...previousData, updateData];
                  }
                }
              });
            }
          });

          // Cleanup on component unmount
          return () => {
            setChannelStatus(0);
            channel.unsubscribe();
            centrifugePositionInstanceNew.disconnect();
          };
        }
      });
    });
    centrifugePositionInstanceNew.on("disconnect", () => {
      //console.log('Disconnected from Centrifuge');
      setChannelStatus(0);
    });
    // Connect to Centrifuge server
    centrifugePositionInstanceNew.connect();

    // Cleanup on component unmount
    return () => {
      // console.log("Cleaning up Centrifuge");
      centrifugePositionInstanceNew.disconnect();
    };
  };

  const getRandomFloat = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  const processOffLineOptionChain = async () => {
    setInitSocket(true);
    optionChainList.map(async (cName) => {
      // Subscribe to the channel (replace 'your-channel' with the actual channel name)
      if (cName.instrumentToken !== undefined) {
        const result = await ZerodaAPI.callApiToGetPreviosDayDataForChannel(
          cName.instrumentToken
        );
      }
    });
  };

  useEffect(() => {
    if (baseTable?.length > 0) {
      if (!isMarketHours()) {
        callApiToGetPreviosDayData();
      } else {
        processOptionChain();
      }
    }
  }, [baseTable]);

  const handleSideMenuGeneralSettingTroggle = (menuname) => {
    setSideMenuName(menuname);
    setSideMenuTroggle(false);
    setSideMenuRMSTroggle(false);
    setSideMenuSettingTroggle(
      (sideMenuSettingTroggle) => !sideMenuSettingTroggle
    );
  };

  const handleSideMenuTroggle = (menuname) => {
    setSideMenuName(menuname);
    setSideMenuSettingTroggle(false);
    setSideMenuRMSTroggle(false);
    setSideMenuTroggle((sideMenuTroggle) => !sideMenuTroggle);
  };

  const handleSideMenuRMSSettingTroggle = (menuname) => {
    setSideMenuName(menuname);
    setSideMenuSettingTroggle(false);
    setSideMenuTroggle(false);
    setSideMenuRMSTroggle((sideMenuRMSTroggle) => !sideMenuRMSTroggle);
  };

  // when pop-up is closed this function triggers
  const closePopUp = () => {
    // setting key "seenPopUp" with value true into localStorage
    localStorage.setItem("seenPopUp", true);
    // setting state to false to not display pop-up
    setDisplayPopUp(false);
  };

  const modalContent = [
    "9 out of 10 individual traders in Equity, Futures & Options segment incurred net losses.",
    "On an average, loss makers registered net trading loss close to ₹ 50,000.",
    "Over and above the net trading losses incurred, loss makers expended an additional 28% of net trading losses at transaction costs.",
    "Those making net trading profits, incurred between 15% to 50% of such profits as transaction cost.",
  ];

  const additionalInfo =
    "SEBI study dated January 25, 2023, on “Analysis of Profit and Loss of Individual Traders dealing in equity Futures and Options (F&O) Segment”, wherein Aggregate Level findings are based on annual Profit/Loss incurred by individual traders in equity F&O during FY 2021-22.";

  return (
    <>
      <div>
        {displayPopUp && (
          <ModalComponent
            open={displayPopUp}
            onClose={closePopUp}
            title="Risk Disclosures on Derivatives"
            content={modalContent}
            additionalInfo={additionalInfo}
          />
        )}
      </div>
      <Container fluid style={{}}>
        <div style={{ width: "100%", height: "100%" }}>
          {globalProcessRMS && <LoaderComponent />}
          <div
            className={
              sideMenuTroggle
                ? "full-open mainpanel"
                : sideMenuSettingTroggle
                ? "full-open mainpanel"
                : sideMenuRMSTroggle
                ? "full-open mainpanel"
                : "full-close mainpanel"
            }
            ref={divRef}
          >
            
              <Row
                className="dashboard mt-1 optionchaindashboard"
                id="_optionchaindashboard_id"
              >
                <Col xl="12" className="firstDiv">
                  <Tabs style={{ backgroundColor: "#FFFFFF" }}>
                    <TabList>
                      <Tab>Basket</Tab>
                      <Tab>Straddle</Tab>
                      <Tab>Strangle</Tab>
                      <Tab>Rules</Tab>
                    </TabList>
                    <TabPanel>
                      <AdminOptionChain
                        filterOptionChainList={filterOptionChainList}
                        height={height}
                      />
                    </TabPanel>
                    <TabPanel>
                      <AdminStraddle
                        filterOptionChainList={filterOptionChainList}
                        height={height}
                      />
                    </TabPanel>
                    <TabPanel>
                      <AdminStrangle
                        filterOptionChainList={filterOptionChainList}
                        height={height}
                      />
                    </TabPanel>

                    <TabPanel style={{ position: "relative" }}>
                      <AdminRule height={height} />
                    </TabPanel>
                  </Tabs>
                </Col>
              </Row>

              <Row className="dashboard mt-1 positiondashboardlist">
                <Col xl="12">
                  <AdminOrderPositionDetails
                    filterOrderPositionList={filterOrderPositionList}
                    height={height}
                  />
                </Col>
                <Col xl="6">
                  <Tabs style={{ backgroundColor: "#FFFFFF" }}>
                    <TabList>
                      <Tab>Orders</Tab>
                      <Tab>Trades</Tab>
                    </TabList>
                    {!isMinimized && (
                      <>
                        <TabPanel>
                          <AdminCompletedOrder />
                        </TabPanel>
                        <TabPanel>
                          <AdminTrades />
                        </TabPanel>
                      </>
                    )}
                  </Tabs>
                </Col>
                <Col xl="6">
                  <Tabs style={{ backgroundColor: "#FFFFFF" }}>
                    <TabList
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <Tab>CLOSED POSITION</Tab>
                        <Tab>LOGS</Tab>
                        <Tab>FUNDS</Tab>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "1px",
                        }}
                      >
                        <Button
                          onClick={() => setIsMinimized(false)}
                          className="button-no-style"
                        >
                          <i className="fas fa-window-maximize"></i>
                        </Button>
                        <Button
                          onClick={() => setIsMinimized(true)}
                          className="button-no-style"
                        >
                          <i className="fas fa-window-minimize"></i>
                        </Button>
                      </div>
                    </TabList>
                    {!isMinimized && (
                      <>
                        <TabPanel>
                          <AdminClosedOrder />
                        </TabPanel>
                        <TabPanel>
                          <AdminLogs />
                        </TabPanel>
                        <TabPanel>
                          <AdminFunds />
                        </TabPanel>
                      </>
                    )}
                  </Tabs>
                </Col>
              </Row>

            <Row className="dashboard mt-1 orderdashboardlist"></Row>
            <AdminFooter />
          </div>
          <div className={sideMenuTroggle ? "sidepanel" : "hide sidepanel"}>
            {sideMenuName ? <AdminDefaultConfig /> : ""}
          </div>
          <div
            className={sideMenuSettingTroggle ? "sidepanel" : "hide sidepanel"}
          >
            {sideMenuName ? <AdminGeneralSetting /> : ""}
          </div>
          <div className={sideMenuRMSTroggle ? "sidepanel" : "hide sidepanel"}>
            {sideMenuName ? <AdminRMSSetting /> : ""}
          </div>

          <div className="sidemenu">
            <Row>
              <Col xl="12 pt-1 text-center text-theam">
                <i
                  className="fas fa-gear"
                  onClick={() => handleSideMenuTroggle("Setting")}
                ></i>
              </Col>
              <Col xl="12">
                <hr />
              </Col>
              <Col xl="12 pt-1 text-center text-theam">
                <i
                  className="fas fa-sliders"
                  onClick={() =>
                    handleSideMenuGeneralSettingTroggle("GeneralSetting")
                  }
                ></i>
              </Col>
              <Col xl="12" className="hide">
                <hr />
              </Col>
              <Col xl="12 pt-1 text-center text-theam">
                <i
                  className="fas fa-toolbox"
                  onClick={() => handleSideMenuRMSSettingTroggle("RMSSetting")}
                ></i>
              </Col>
              <Col xl="12" className="hide">
                <hr />
              </Col>
            </Row>
          </div>
        </div>
      </Container>
    </>
  );
};
export default TreadingDashboard;
