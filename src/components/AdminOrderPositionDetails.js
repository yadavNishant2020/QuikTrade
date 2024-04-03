import React, { useContext, useEffect, useState } from "react";
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
  FormGroup,
  Input,
  Table,
} from "reactstrap";
import { PostProvider, PostContext } from "../PostProvider.js";
import { CookiesConfig } from "../Config/CookiesConfig.js";
import alertify from "alertifyjs";
import { PaperTradingAPI } from "../api/PaperTradingAPI.js";
import * as signalR from "@microsoft/signalr";
import { BASE_SIGNALR_HUB } from "../Config/BaseUrl";
import { Constant } from "../Config/Constant";
import { LiveTradingAPI } from "../api/LiveTradingAPI";
import Centrifuge from "centrifuge";
import ZerodaAPI from "../api/ZerodaAPI.js";

const AdminOrderPositionDetails = ({ filterOrderPositionList, height }) => {
  const {
    globalStopLoss,
    globalTarget,
    updateGlobalStopLoss,
    updateGlobalTarget,
    globleOrderPosition,
    updateGlobalTP,
    globalTP,
    globleSymbol,
    globleExpityvalue,
    updatePositionByIndex,
    globleCurrentATM,
    globleTabIndex,
    globleClosedList,
    updateGloblemltRealized,
    globleChangeDefaultSetting,
    updatePosition,
    globleSelectedTradingType,
    globleSelectedClientInfo,
    updateGlobleOrderList,
    updateGlobleOrderPosition,
    updateGlobleClosedList,
    globlePositionChange,
    updateGlobleUniqueChannelData,
    globleOptionChainList,
    globalConfigPostionData,
    globleBrokerName,
    updateGlobleLogList,
    updateGlobleServerTime,
    updateGlobleTrades,
  } = useContext(PostContext);

  
  const [searchValue, setSearchValue] = useState("");
  const [mtmchange, setMTMChange] = useState(0);


   const [isexecuteProcess, setIsExecuteProcess] = useState(false);


  const [optionChainDataForPosition, setOptionChainDataForPosition] = useState(
    []
  );
  const [orderPosition, setOrderPosition] = useState([]);

  const [mltUnrealized, setMltUnrealized] = useState(0);

  const [filterOrderPosition, setFilterOrderPosition] = useState([]);

  const [slEdit, setSLEdit] = useState(false);
  const [tragetEdit, setTragetEdit] = useState(false);
  const [tpEdit, setTpEdit] = useState(false);
  const [changeOrderPosition, setChangeOrderPosition] = useState(0);
  const [selectedClientInfo, setSelectedClientInfo] = useState("");
  const [isMounted, setIsMounted] = useState(true);
  const [tpValue, setTpValue] = useState(0);
  const [centrifugePositionInstance, setCentrifugePositionInstance] = useState(null);
  const [editPositionRow, setEditPositionRow] = useState(false);
  const [editPositionRowNo, setEditPositionRowNo] = useState(0);
  //const positionCentrifugeInstance = new Centrifuge('wss://stock-api2.fnotrader.com/connection/websocket');

  const handleSLEdit = () => {
    setSLEdit((slEdit) => !slEdit);
  };

  const handleTragetEdit = () => {
    setTragetEdit((tragetEdit) => !tragetEdit);
  };

  const handleTpEdit = () => {
    setTpEdit((tpEdit) => !tpEdit);
  };

  useEffect(() => {
    if (filterOrderPositionList?.length > 0) {
      setOptionChainDataForPosition(filterOrderPositionList);
    }
  }, [filterOrderPositionList, globlePositionChange]);

  useEffect(() => {
    if (optionChainDataForPosition.length > 0) {
      setOrderPosition((previousData) => {
        if (previousData !== undefined) {
          
          const updatedOrderPosition = previousData.map((position) => {
            const matchingOption = optionChainDataForPosition.find((item) => item.instrumentToken === position.instrumentToken.toString());
            if (matchingOption) {
              return {
                ...position,
                ltp: matchingOption.ltp,
                unrealisedpnl: calculateUnrealisedPnl(position, matchingOption)
              };
            } else {
              return {
                ...position,
                ltp: 0,
                unrealisedpnl: 0
              };
            }
          });
  
          // Update other properties outside the map function
          updatedOrderPosition.forEach((position, index) => {                
            const data = position;
            let defaultSaveedQty=getSetting(data.positioninstrumentname,data.positionexpirydate)?.defaultQty;
            position.moveinouttotalqty=parseInt(data.moveinoutqty)*parseInt(defaultSaveedQty);
            position.newaddtotalqty=parseInt(data.newqty)*parseInt(defaultSaveedQty);
            position.exittotalqty=parseInt(data.exitqty)*parseInt(defaultSaveedQty);

            const matchingOptionFirstInStrick = optionChainDataForPosition.find((dataOrder) => dataOrder.instrumentToken === data.firstInInstrumentToken);
            if (matchingOptionFirstInStrick != null) {
              position.firstInltp = matchingOptionFirstInStrick.ltp;
            } else {
              position.firstInltp = parseFloat(0).toFixed(2);
            }
            const matchingOptionSecondInStrick=optionChainDataForPosition.find((dataOrder)=>dataOrder.instrumentToken===data.secondInInstrumentToken);
            if(matchingOptionSecondInStrick!=null){
                position.secondInltp=matchingOptionSecondInStrick.ltp ;                         
            } else{
                position.secondInltp=parseFloat(0).toFixed(2)
            }

                   const matchingOptionFirstOutStrick=filterOrderPositionList.find((dataOrder)=>dataOrder.instrumentToken===data.firstOutInstrumentToken);
                   if(matchingOptionFirstOutStrick!=null){
                    position.firstOutltp=matchingOptionFirstOutStrick.ltp ;                         
                } else{
                    position.firstOutltp=parseFloat(0).toFixed(2)
                }
                const matchingOptionSecondOutStrick=filterOrderPositionList.find((dataOrder)=>dataOrder.instrumentToken===data.secondOutInstrumentToken);
                if(matchingOptionSecondOutStrick!=null){
                    position.secondOutltp=matchingOptionSecondOutStrick.ltp ;                         
                } else{
                    position.secondOutltp=parseFloat(0).toFixed(2)
                }           

            // Add similar logic for other properties here
          });
  
          return updatedOrderPosition;
        }
  
        // If previousData is undefined, return it unchanged
        return previousData;
      });
    }
  }, [optionChainDataForPosition, globlePositionChange]);

  useEffect(() => {
    if (globleSelectedClientInfo?.length > 0) {
      setSelectedClientInfo(globleSelectedClientInfo);
    }
  }, [globleSelectedClientInfo]);

  useEffect(() => {
    let totalMTM = 0;
    const tokensToFilter = globleOrderPosition.map(
      (item) => item.instrumentToken
    );
    if (orderPosition?.length > 0) {
      totalMTM = orderPosition.reduce((accumulator, data) => {
        return accumulator + (parseFloat(data?.unrealisedpnl) || 0);
      }, 0);
    }
    setMltUnrealized(totalMTM);
  }, [orderPosition, globlePositionChange]);

  useEffect(() => {
    if (orderPosition !== undefined) {
      if (orderPosition.length > 0) {
        if (searchValue.length > 0) {
          const filteredPositions = orderPosition.filter((position) => {
            // Customize this condition based on how you want to filter the data
            return (
              position?.positioninstrumentname
                ?.toLowerCase()
                .includes(searchValue.toLowerCase()) ||
              position?.strikeprice
                ?.toLowerCase()
                .includes(searchValue.toLowerCase()) ||
                position?.positionordertype
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())
            );
          });
          setFilterOrderPosition(filteredPositions);
        } else {
          setFilterOrderPosition(orderPosition);
        }
      } else {
        setFilterOrderPosition([]);
      }
    } else {
      setFilterOrderPosition([]);
    }
  }, [searchValue, orderPosition, changeOrderPosition, globlePositionChange]);

  useEffect(() => {
    if (globleOrderPosition?.length > 0) {
      setOrderPosition(globleOrderPosition);
    } else {
      setOrderPosition([]);
    }
  }, [globleOrderPosition]);

  const calculateUnrealisedPnl = (position, infodata) => {
    return  (parseFloat(infodata.ltp) -parseFloat(position.positionavgprice))*parseFloat(position.positionnetqty);
     
  };

  const handdleMoveInOutQtyChange = (e, index, data) => {
    
    let defaultSaveedQty = getSetting(
      data.positioninstrumentname,
      data.positionexpirydate
    )?.defaultQty;
    let selectedValue = e.target.value;
    setOrderPosition((prevRowData) => {
      const updatedTempOrderPosition = prevRowData.map((position, i) => {
        if (i === index) {
          let positionnetlot = parseInt(position.positionnetlot);
          if (positionnetlot < 0) {
            positionnetlot = -1 * positionnetlot;
          }
          let updatedExtqty = "0"; // Change const to let
          if (parseInt(positionnetlot) < parseInt(selectedValue)) {
            updatedExtqty = position.positionnetlot.toString();
            if (!position.alertDisplayed) {
              alertify.error(
                "Maximum allowed lot size is " +
                  parseInt(positionnetlot).toString()
              );
            }
            updatedExtqty = parseInt(positionnetlot);
            position.alertDisplayed = true;
          } else {
            updatedExtqty = selectedValue;
            position.alertDisplayed = false;
          }
          return {
            ...position,
            moveinoutqty: updatedExtqty,
            moveinouttotalqty:
              updatedExtqty === ""
                ? "0"
                : parseInt(updatedExtqty) * parseInt(defaultSaveedQty),
            manualExitQtyChange: true,
          };
        }
        return position;
      });

      return updatedTempOrderPosition;
    });
  };

  const handdlePositionTrailling = (e, index, data) => {     
    let selectedValue = e.target.value;
    //updatePositionByIndex(selectedValue,index)
    setOrderPosition((prevRowData) => {
      const updatedTempOrderPosition = prevRowData.map((position, i) => {
        if (i === index) {
          const positionTrailling = selectedValue;
          return {
            ...position,
            positiontrailling: positionTrailling,
          };
        }
        return position;
      });
      return updatedTempOrderPosition;
    });
  };

  const handdlePositionTarget = (e, index, data) => {
    let selectedValue = e.target.value;
    setOrderPosition((prevRowData) => {
      const updatedTempOrderPosition = prevRowData.map((position, i) => {
        if (i === index) {
          const positionTargetValue = selectedValue;
          return {
            ...position,
            positiontarget: positionTargetValue,
          };
        }
        return position;
      });

      return updatedTempOrderPosition;
    });
  };

  const handdlePositionStopLoss = (e, index, data) => {
    let selectedValue = e.target.value;  
    setOrderPosition((prevRowData) => {
      const updatedTempOrderPosition = prevRowData.map((position, i) => {
        if (i === index) {
          const positionStopLoss = selectedValue;
          return {
            ...position,
            positionstoploss: positionStopLoss,
          };
        }
        return position;
      });

      return updatedTempOrderPosition;
    });
  };

  const processpositiontrailingData = async (
    positionid,
    stoploss,
    trailing,
    taget,
    ltp
  ) => {
    let requestData = {
      positionid: positionid.toString(),
      stopLoss: stoploss.toString() === "" ? "0" : stoploss.toString(),
      trailingpoint: trailing.toString() === "" ? "0" : trailing.toString(),
      target: taget.toString() === "" ? "0" : taget.toString(),
      starttrailing:ltp.toString()
    };
    const resultData = await PaperTradingAPI.processpositiontrailingData(
      requestData
    );
    if (resultData != null) {
      alertify.success("Stoploss Target updated successfully.");
    }else{
      alertify.error("Unable to process request now.Please try again.");
    }
  };

  const handdleNewQtyChange = (e, index, data) => {
    let defaultSaveedQty = getSetting(
      data.positioninstrumentname,
      data.positionexpirydate
    )?.defaultQty;
    let selectedValue = e.target.value;
    //updatePositionByIndex(selectedValue,index)
    setOrderPosition((prevRowData) => {
      const updatedTempOrderPosition = prevRowData.map((position, i) => {
        if (i === index) {
          const updatedExtqty = selectedValue; //positionnetlot > newValue ? newValue : positionnetlot;
          return {
            ...position,
            newqty: updatedExtqty,
            newaddtotalqty:
              updatedExtqty === ""
                ? "0"
                : parseInt(updatedExtqty) * parseInt(defaultSaveedQty),
            manualExitQtyChange: true,
          };
        }
        return position;
      });

      return updatedTempOrderPosition;
    });
  };

  const handdleExitQtyChange = (e, index, data) => {
    let defaultSaveedQty = getSetting(
      data.positioninstrumentname,
      data.positionexpirydate
    )?.defaultQty;
    let selectedValue = e.target.value;
    //updatePositionByIndex(selectedValue,index)
    setOrderPosition((prevRowData) => {
      const updatedTempOrderPosition = prevRowData.map((position, i) => {
        if (i === index) {
          const updatedExtqty = selectedValue; //positionnetlot > newValue ? newValue : positionnetlot;
          return {
            ...position,
            exitqty: updatedExtqty,
            exittotalqty:
              updatedExtqty === ""
                ? "0"
                : parseInt(updatedExtqty) * parseInt(defaultSaveedQty),
            manualExitQtyChange: true,
          };
        }
        return position;
      });

      return updatedTempOrderPosition;
    });
  };

  const handdleReverseOrderExist = (dataInfo) => {
    setIsExecuteProcess(true);
    const logmessege="Reverse Position "+dataInfo.tradingSymbol+" from "+dataInfo.positionsidetype.toUpperCase()+" to "+(dataInfo.positionsidetype.toLowerCase()==='buy'?'SELL':'BUY');
    if (globleSelectedTradingType.toLowerCase() === "paper") {
      ProcessReverseOrderExistPaper(dataInfo,logmessege);
    } else {
      ProcessReverseOrderExistLive(dataInfo,logmessege);
    }
  };

  const ProcessReverseOrderExistLive = (dataInfo,logmessege) => {
    var configData = JSON.parse(sessionStorage.getItem("defaultConfig"));
    let configInformation = configData.find(
      (data) =>
        data.instrumentname === dataInfo.positioninstrumentname &&
        data.expirydate === dataInfo.positionexpirydate &&
        data.clientId === globleSelectedClientInfo
    );
    const {
      defaultProductName,
      defaultSliceQty,
      defaultOrderType,
      defaultLotSize,
      defaultQty,
      defaultLMTPerCentage,
      defaultShowQty,
    } = { ...configInformation };

    let positiontype = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultProductName;
    let defaultLMTPer = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultLMTPerCentage;
    let orderprice =
      (positiontype === undefined ? "MKT" : positiontype) === "MKT"
        ? dataInfo.ltp
        : parseFloat(defaultLMTPer) > 0
        ? (dataInfo.positionsidetype === "BUY"
            ? "SELL"
            : "BUY"
          ).toLowerCase() === "buy"
          ? parseFloat(
              parseFloat(dataInfo.ltp) +
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
          : parseFloat(
              parseFloat(dataInfo.ltp) -
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
        : parseFloat(dataInfo.ltp);

    let currentLotQty =
      parseInt(dataInfo.positionnetlot) < 0
        ? -1 * parseInt(dataInfo.positionnetlot)
        : parseInt(dataInfo.positionnetlot);

    let data = {
      strikePrice: dataInfo.strikeprice,
      productname: dataInfo.positionproductname,
      ordertype: positiontype,
      expirydate: dataInfo.positionexpirydate,
      instrumentname: dataInfo.positioninstrumentname,
      orderside: dataInfo.positionordertype,
      orderqty: (
        dataInfo.defaultlotqty * parseInt(2 * currentLotQty)
      ).toString(),
      nooforderlot: (2 * currentLotQty).toString(),
      maxorderqty: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultSliceQty.toString(),
      orderprice:
        (positiontype === undefined ? "MKT" : positiontype) === "MKT"
          ? dataInfo.ltp.toString()
          : (Math.round(Number(orderprice) * 20) / 20).toString(),
      tradermode: globleSelectedTradingType,
      orderidbybroker: "",
      clientid: globleSelectedClientInfo,
      lotsize: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultQty.toString(),
      instrumentToken: dataInfo.instrumentToken,
      orderaction: dataInfo.positionsidetype === "BUY" ? "SELL" : "BUY",
      stoploss: "0",
      target: "0",
      trailling: "0",
      orderexchangetoken: dataInfo.positionexchangetoken,
      orderstatus: "Pending",
      firstInInstrumentToken: dataInfo.firstInInstrumentToken.toString(),
      secondInInstrumentToken: dataInfo.secondInInstrumentToken.toString(),
      firstOutInstrumentToken: dataInfo.firstOutInstrumentToken.toString(),
      secondOutInstrumentToken: dataInfo.secondOutInstrumentToken.toString(),
      firstInStrike: dataInfo.firstInStrike.toString(),
      secondInStrike: dataInfo.secondInStrike.toString(),
      firstOutStrike: dataInfo.firstOutStrike.toString(),
      secondOutStrike: dataInfo.secondOutStrike.toString(),
      firstInExchangeToken: dataInfo.firstInExchangeToken.toString(),
      secondInExchangeToken: dataInfo.secondInExchangeToken.toString(),
      firstOutExchangeToken: dataInfo.firstOutExchangeToken.toString(),
      secondOutExchangeToken: dataInfo.secondOutExchangeToken.toString(),
      tradingSymbol: dataInfo.tradingSymbol,
      exchange: dataInfo.exchange,
      brokerName: globleBrokerName,
    };
    processInsertUpdateOrder(data,logmessege);
  };
  const ProcessReverseOrderExistPaper = (dataInfo,logmessege) => {
    var configData = JSON.parse(sessionStorage.getItem("defaultConfig"));
    let configInformation = configData.find(
      (data) =>
        data.instrumentname === dataInfo.positioninstrumentname &&
        data.expirydate === dataInfo.positionexpirydate &&
        data.clientId === globleSelectedClientInfo
    );
    const {
      defaultProductName,
      defaultSliceQty,
      defaultOrderType,
      defaultLotSize,
      defaultQty,
      defaultLMTPerCentage,
      defaultShowQty,
    } = { ...configInformation };

    let positiontype = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultProductName;
    let defaultLMTPer = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultLMTPerCentage;
    let orderprice =
      (positiontype === undefined ? "MKT" : positiontype) === "MKT"
        ? dataInfo.ltp
        : parseFloat(defaultLMTPer) > 0
        ? (dataInfo.positionsidetype === "BUY"
            ? "SELL"
            : "BUY"
          ).toLowerCase() === "buy"
          ? parseFloat(
              parseFloat(dataInfo.ltp) +
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
          : parseFloat(
              parseFloat(dataInfo.ltp) -
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
        : parseFloat(dataInfo.ltp);

    let currentLotQty =
      parseInt(dataInfo.positionnetlot) < 0
        ? -1 * parseInt(dataInfo.positionnetlot)
        : parseInt(dataInfo.positionnetlot);

    let data = {
      strikePrice: dataInfo.strikeprice,
      productname: dataInfo.positionproductname,
      ordertype: positiontype,
      expirydate: dataInfo.positionexpirydate,
      instrumentname: dataInfo.positioninstrumentname,
      orderside: dataInfo.positionordertype,
      orderqty: (
        dataInfo.defaultlotqty * parseInt(2 * currentLotQty)
      ).toString(),
      nooforderlot: (2 * currentLotQty).toString(),
      maxorderqty: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultSliceQty.toString(),
      orderprice:
        (positiontype === undefined ? "MKT" : positiontype) === "MKT"
          ? dataInfo.ltp.toString()
          : (dataInfo.positionsidetype === "BUY"
              ? "SELL"
              : "BUY"
            ).toLowerCase() === "buy"
          ? parseFloat(orderprice) >= parseFloat(dataInfo.ltp)
            ? dataInfo.ltp.toString()
            : orderprice.toString()
          : parseFloat(orderprice) <= parseFloat(dataInfo.ltp)
          ? dataInfo.ltp.toString()
          : orderprice.toString(),
      tradermode: globleSelectedTradingType,
      orderidbybroker: "",
      clientid: globleSelectedClientInfo,
      lotsize: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultQty.toString(),
      instrumentToken: dataInfo.instrumentToken,
      orderaction: dataInfo.positionsidetype === "BUY" ? "SELL" : "BUY",
      stoploss: "0",
      target: "0",
      trailling: "0",
      orderexchangetoken: dataInfo.positionexchangetoken,
      orderstatus:
        (positiontype === undefined ? "MKT" : positiontype) === "MKT"
          ? "Completed"
          : (dataInfo.positionsidetype === "BUY"
              ? "SELL"
              : "BUY"
            ).toLowerCase() === "buy"
          ? parseFloat(orderprice) >= parseFloat(dataInfo.ltp)
            ? "Completed"
            : "Pending"
          : parseFloat(orderprice) <= parseFloat(dataInfo.ltp)
          ? "Completed"
          : "Pending",
      firstInInstrumentToken: dataInfo.firstInInstrumentToken.toString(),
      secondInInstrumentToken: dataInfo.secondInInstrumentToken.toString(),
      firstOutInstrumentToken: dataInfo.firstOutInstrumentToken.toString(),
      secondOutInstrumentToken: dataInfo.secondOutInstrumentToken.toString(),
      firstInStrike: dataInfo.firstInStrike.toString(),
      secondInStrike: dataInfo.secondInStrike.toString(),
      firstOutStrike: dataInfo.firstOutStrike.toString(),
      secondOutStrike: dataInfo.secondOutStrike.toString(),
      firstInExchangeToken: dataInfo.firstInExchangeToken.toString(),
      secondInExchangeToken: dataInfo.secondInExchangeToken.toString(),
      firstOutExchangeToken: dataInfo.firstOutExchangeToken.toString(),
      secondOutExchangeToken: dataInfo.secondOutExchangeToken.toString(),
      tradingSymbol: dataInfo.tradingSymbol,
      exchange: dataInfo.exchange,
      brokerName: globleBrokerName,
    };
    processInsertUpdateOrder(data,logmessege);
  };
  const handdleAddExistQty = (dataInfo, processType) => {
    setIsExecuteProcess(true);
    const logmessege="Added "+dataInfo.newqty.toString()+" lot to "+dataInfo.tradingSymbol;   
    if (processType === "add") {
      if (globleSelectedTradingType.toLowerCase() === "paper") {
        processAddOrderPaper(dataInfo,logmessege);
      } else {
        processAddOrderLive(dataInfo,logmessege);
      }
    }

    //   else{
    //     processExistOrder(dataInfo);
    // }
  };
  const processAddOrderLive = (dataInfo,logmessege) => {
    var configData = JSON.parse(sessionStorage.getItem("defaultConfig"));
    let configInformation = configData.find(
      (data) =>
        data.instrumentname === dataInfo.positioninstrumentname &&
        data.expirydate === dataInfo.positionexpirydate &&
        data.clientId === globleSelectedClientInfo
    );
    const {
      defaultProductName,
      defaultSliceQty,
      defaultOrderType,
      defaultLotSize,
      defaultQty,
      defaultLMTPerCentage,
      defaultShowQty,
    } = { ...configInformation };
    let defaultLMTPer = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultLMTPerCentage;
    let positiontype = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultProductName;
    let orderprice =
      (positiontype === undefined ? "MKT" : positiontype) === "MKT"
        ? dataInfo.ltp
        : parseFloat(defaultLMTPer) > 0
        ? dataInfo.positionsidetype.toLowerCase() === "buy"
          ? parseFloat(
              parseFloat(dataInfo.ltp) +
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
          : parseFloat(
              parseFloat(dataInfo.ltp) -
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
        : parseFloat(dataInfo.ltp);

    let data = {
      strikePrice: dataInfo.strikeprice,
      productname: dataInfo.positionproductname,
      ordertype: positiontype,
      expirydate: dataInfo.positionexpirydate,
      instrumentname: dataInfo.positioninstrumentname,
      orderside: dataInfo.positionordertype,
      orderqty: (
        (getSetting(
          dataInfo.positioninstrumentname,
          dataInfo.positionexpirydate
        ) != null
          ? parseInt(
              getSetting(
                dataInfo.positioninstrumentname,
                dataInfo.positionexpirydate
              ).defaultQty
            )
          : defaultQty) * parseInt(dataInfo.newqty)
      ).toString(),
      nooforderlot: dataInfo.newqty.toString(),
      maxorderqty: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultSliceQty.toString(),
      orderprice:
        (positiontype === undefined ? "MKT" : positiontype) === "MKT"
          ? dataInfo.ltp.toString()
          : (Math.round(Number(orderprice) * 20) / 20).toString(),
      tradermode: globleSelectedTradingType,
      orderidbybroker: "",
      clientid: globleSelectedClientInfo,
      lotsize: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultQty.toString(),
      instrumentToken: dataInfo.instrumentToken,
      orderaction: dataInfo.positionsidetype,
      stoploss: "0",
      target: "0",
      trailling: "0",
      orderexchangetoken: dataInfo.positionexchangetoken,
      orderstatus: "Pending",
      firstInInstrumentToken: dataInfo.firstInInstrumentToken.toString(),
      secondInInstrumentToken: dataInfo.secondInInstrumentToken.toString(),
      firstOutInstrumentToken: dataInfo.firstOutInstrumentToken.toString(),
      secondOutInstrumentToken: dataInfo.secondOutInstrumentToken.toString(),
      firstInStrike: dataInfo.firstInStrike.toString(),
      secondInStrike: dataInfo.secondInStrike.toString(),
      firstOutStrike: dataInfo.firstOutStrike.toString(),
      secondOutStrike: dataInfo.secondOutStrike.toString(),
      firstInExchangeToken: dataInfo.firstInExchangeToken.toString(),
      secondInExchangeToken: dataInfo.secondInExchangeToken.toString(),
      firstOutExchangeToken: dataInfo.firstOutExchangeToken.toString(),
      secondOutExchangeToken: dataInfo.secondOutExchangeToken.toString(),
      tradingSymbol: dataInfo.tradingSymbol,
      exchange: dataInfo.exchange,
      brokerName: globleBrokerName,
    };
    processInsertUpdateOrder(data,logmessege);
  };
  const processAddOrderPaper = (dataInfo,logmessege) => {
    var configData = JSON.parse(sessionStorage.getItem("defaultConfig"));
    let configInformation = configData.find(
      (data) =>
        data.instrumentname === dataInfo.positioninstrumentname &&
        data.expirydate === dataInfo.positionexpirydate &&
        data.clientId === globleSelectedClientInfo
    );
    const {
      defaultProductName,
      defaultSliceQty,
      defaultOrderType,
      defaultLotSize,
      defaultQty,
      defaultLMTPerCentage,
      defaultShowQty,
    } = { ...configInformation };
    let defaultLMTPer = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultLMTPerCentage;
    let positiontype = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultProductName;
    let orderprice =
      (positiontype === undefined ? "MKT" : positiontype) === "MKT"
        ? dataInfo.ltp
        : parseFloat(defaultLMTPer) > 0
        ? dataInfo.positionsidetype.toLowerCase() === "buy"
          ? parseFloat(
              parseFloat(dataInfo.ltp) +
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
          : parseFloat(
              parseFloat(dataInfo.ltp) -
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
        : parseFloat(dataInfo.ltp);

    let data = {
      strikePrice: dataInfo.strikeprice,
      productname: dataInfo.positionproductname,
      ordertype: positiontype,
      expirydate: dataInfo.positionexpirydate,
      instrumentname: dataInfo.positioninstrumentname,
      orderside: dataInfo.positionordertype,
      orderqty: (
        (getSetting(
          dataInfo.positioninstrumentname,
          dataInfo.positionexpirydate
        ) != null
          ? parseInt(
              getSetting(
                dataInfo.positioninstrumentname,
                dataInfo.positionexpirydate
              ).defaultQty
            )
          : defaultQty) * parseInt(dataInfo.newqty)
      ).toString(),
      nooforderlot: dataInfo.newqty.toString(),
      maxorderqty: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultSliceQty.toString(),
      orderprice:
        (positiontype === undefined ? "MKT" : positiontype) === "MKT"
          ? dataInfo.ltp.toString()
          : (dataInfo.positionsidetype === "BUY"
              ? "SELL"
              : "BUY"
            ).toLowerCase() === "buy"
          ? parseFloat(orderprice) >= parseFloat(dataInfo.ltp)
            ? dataInfo.ltp.toString()
            : orderprice.toString()
          : parseFloat(orderprice) <= parseFloat(dataInfo.ltp)
          ? dataInfo.ltp.toString()
          : orderprice.toString(),
      tradermode: globleSelectedTradingType,
      orderidbybroker: "",
      clientid: globleSelectedClientInfo,
      lotsize: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultQty.toString(),
      instrumentToken: dataInfo.instrumentToken,
      orderaction: dataInfo.positionsidetype,
      stoploss: "0",
      target: "0",
      trailling: "0",
      orderexchangetoken: dataInfo.positionexchangetoken,
      orderstatus:
        (positiontype === undefined ? "MKT" : positiontype) === "MKT"
          ? "Completed"
          : dataInfo.positionsidetype.toLowerCase() === "buy"
          ? parseFloat(orderprice) >= parseFloat(dataInfo.ltp)
            ? "Completed"
            : "Pending"
          : parseFloat(orderprice) <= parseFloat(dataInfo.ltp)
          ? "Completed"
          : "Pending",
      firstInInstrumentToken: dataInfo.firstInInstrumentToken.toString(),
      secondInInstrumentToken: dataInfo.secondInInstrumentToken.toString(),
      firstOutInstrumentToken: dataInfo.firstOutInstrumentToken.toString(),
      secondOutInstrumentToken: dataInfo.secondOutInstrumentToken.toString(),
      firstInStrike: dataInfo.firstInStrike.toString(),
      secondInStrike: dataInfo.secondInStrike.toString(),
      firstOutStrike: dataInfo.firstOutStrike.toString(),
      secondOutStrike: dataInfo.secondOutStrike.toString(),
      firstInExchangeToken: dataInfo.firstInExchangeToken.toString(),
      secondInExchangeToken: dataInfo.secondInExchangeToken.toString(),
      firstOutExchangeToken: dataInfo.firstOutExchangeToken.toString(),
      secondOutExchangeToken: dataInfo.secondOutExchangeToken.toString(),
      tradingSymbol: dataInfo.tradingSymbol,
      exchange: dataInfo.exchange,
      brokerName: globleBrokerName,
    };
    processInsertUpdateOrder(data,logmessege);
  };
  const handdleOrderExist = (dataInfo) => {
    setIsExecuteProcess(true);
    const logmessege="EXIT Position "+dataInfo.exitqty.toString()+" lot to "+dataInfo.tradingSymbol;   
    if (globleSelectedTradingType.toLowerCase() === "paper") {
      processExitOrderPaper(dataInfo,logmessege);
    } else {
      processExitOrderLive(dataInfo,logmessege);
    }
  };
  const processExitOrderLive = (dataInfo,logmessege) => {
    var configData = JSON.parse(sessionStorage.getItem("defaultConfig"));
    let configInformation = configData.find(
      (data) =>
        data.instrumentname === dataInfo.positioninstrumentname &&
        data.expirydate === dataInfo.positionexpirydate &&
        data.clientId === globleSelectedClientInfo
    );
    const {
      defaultProductName,
      defaultSliceQty,
      defaultOrderType,
      defaultLotSize,
      defaultQty,
      defaultLMTPerCentage,
      defaultShowQty,
    } = { ...configInformation };
    let defaultLMTPer = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultLMTPerCentage;
    let positiontype = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultProductName;
    let orderprice =
      (positiontype === undefined ? "MKT" : positiontype) === "MKT"
        ? dataInfo.ltp
        : parseFloat(defaultLMTPer) > 0
        ? (dataInfo.positionsidetype === "BUY"
            ? "SELL"
            : "BUY"
          ).toLowerCase() === "buy"
          ? parseFloat(
              parseFloat(dataInfo.ltp) +
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
          : parseFloat(
              parseFloat(dataInfo.ltp) -
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
        : parseFloat(dataInfo.ltp);

    let data = {
      strikePrice: dataInfo.strikeprice,
      productname: dataInfo.positionproductname,
      ordertype: positiontype,
      expirydate: dataInfo.positionexpirydate,
      instrumentname: dataInfo.positioninstrumentname,
      orderside: dataInfo.positionordertype,
      orderqty: (
        (getSetting(
          dataInfo.positioninstrumentname,
          dataInfo.positionexpirydate
        ) != null
          ? parseInt(
              getSetting(
                dataInfo.positioninstrumentname,
                dataInfo.positionexpirydate
              ).defaultQty
            )
          : defaultQty) * parseInt(dataInfo.exitqty)
      ).toString(),
      nooforderlot: dataInfo.exitqty.toString(),
      maxorderqty: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultSliceQty.toString(),
      orderprice:
        (positiontype === undefined ? "MKT" : positiontype) === "MKT"
          ? dataInfo.ltp.toString()
          : (Math.round(Number(orderprice) * 20) / 20).toString(),
      tradermode: globleSelectedTradingType,
      orderidbybroker: "",
      clientid: globleSelectedClientInfo,
      lotsize: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultQty.toString(),
      instrumentToken: dataInfo.instrumentToken,
      orderaction: dataInfo.positionsidetype === "BUY" ? "SELL" : "BUY",
      stoploss: "0",
      target: "0",
      trailling: "0",
      orderexchangetoken: dataInfo.positionexchangetoken,
      orderstatus: "Pending",
      firstInInstrumentToken: dataInfo.firstInInstrumentToken.toString(),
      secondInInstrumentToken: dataInfo.secondInInstrumentToken.toString(),
      firstOutInstrumentToken: dataInfo.firstOutInstrumentToken.toString(),
      secondOutInstrumentToken: dataInfo.secondOutInstrumentToken.toString(),
      firstInStrike: dataInfo.firstInStrike.toString(),
      secondInStrike: dataInfo.secondInStrike.toString(),
      firstOutStrike: dataInfo.firstOutStrike.toString(),
      secondOutStrike: dataInfo.secondOutStrike.toString(),
      firstInExchangeToken: dataInfo.firstInExchangeToken.toString(),
      secondInExchangeToken: dataInfo.secondInExchangeToken.toString(),
      firstOutExchangeToken: dataInfo.firstOutExchangeToken.toString(),
      secondOutExchangeToken: dataInfo.secondOutExchangeToken.toString(),
      tradingSymbol: dataInfo.tradingSymbol,
      exchange: dataInfo.exchange,
      brokerName: globleBrokerName,
    };
    processInsertUpdateOrder(data,logmessege);
  };

  const processExitOrderPaper = (dataInfo,logmessege) => {
    var configData = JSON.parse(sessionStorage.getItem("defaultConfig"));
    let configInformation = configData.find(
      (data) =>
        data.instrumentname === dataInfo.positioninstrumentname &&
        data.expirydate === dataInfo.positionexpirydate &&
        data.clientId === globleSelectedClientInfo
    );
    const {
      defaultProductName,
      defaultSliceQty,
      defaultOrderType,
      defaultLotSize,
      defaultQty,
      defaultLMTPerCentage,
      defaultShowQty,
    } = { ...configInformation };
    let defaultLMTPer = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultLMTPerCentage;
    let positiontype = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultProductName;
    let orderprice =
      (positiontype === undefined ? "MKT" : positiontype) === "MKT"
        ? dataInfo.ltp
        : parseFloat(defaultLMTPer) > 0
        ? (dataInfo.positionsidetype === "BUY"
            ? "SELL"
            : "BUY"
          ).toLowerCase() === "buy"
          ? parseFloat(
              parseFloat(dataInfo.ltp) +
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
          : parseFloat(
              parseFloat(dataInfo.ltp) -
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
        : parseFloat(dataInfo.ltp);

    let data = {
      strikePrice: dataInfo.strikeprice,
      productname: dataInfo.positionproductname,
      ordertype: positiontype,
      expirydate: dataInfo.positionexpirydate,
      instrumentname: dataInfo.positioninstrumentname,
      orderside: dataInfo.positionordertype,
      orderqty: (
        (getSetting(
          dataInfo.positioninstrumentname,
          dataInfo.positionexpirydate
        ) != null
          ? parseInt(
              getSetting(
                dataInfo.positioninstrumentname,
                dataInfo.positionexpirydate
              ).defaultQty
            )
          : defaultQty) * parseInt(dataInfo.exitqty)
      ).toString(),
      nooforderlot: dataInfo.exitqty.toString(),
      maxorderqty: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultSliceQty.toString(),
      orderprice:
        (positiontype === undefined ? "MKT" : positiontype) === "MKT"
          ? dataInfo.ltp.toString()
          : (dataInfo.positionsidetype === "BUY"
              ? "SELL"
              : "BUY"
            ).toLowerCase() === "buy"
          ? parseFloat(orderprice) >= parseFloat(dataInfo.ltp)
            ? dataInfo.ltp.toString()
            : orderprice.toString()
          : parseFloat(orderprice) <= parseFloat(dataInfo.ltp)
          ? dataInfo.ltp.toString()
          : orderprice.toString(),
      tradermode: globleSelectedTradingType,
      orderidbybroker: "",
      clientid: globleSelectedClientInfo,
      lotsize: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultQty.toString(),
      instrumentToken: dataInfo.instrumentToken,
      orderaction: dataInfo.positionsidetype === "BUY" ? "SELL" : "BUY",
      stoploss: "0",
      target: "0",
      trailling: "0",
      orderexchangetoken: dataInfo.positionexchangetoken,
      orderstatus:
        (positiontype === undefined ? "MKT" : positiontype) === "MKT"
          ? "Completed"
          : (dataInfo.positionsidetype === "BUY"
              ? "SELL"
              : "BUY"
            ).toLowerCase() === "buy"
          ? parseFloat(orderprice) >= parseFloat(dataInfo.ltp)
            ? "Completed"
            : "Pending"
          : parseFloat(orderprice) <= parseFloat(dataInfo.ltp)
          ? "Completed"
          : "Pending",
      firstInInstrumentToken: dataInfo.firstInInstrumentToken.toString(),
      secondInInstrumentToken: dataInfo.secondInInstrumentToken.toString(),
      firstOutInstrumentToken: dataInfo.firstOutInstrumentToken.toString(),
      secondOutInstrumentToken: dataInfo.secondOutInstrumentToken.toString(),
      firstInStrike: dataInfo.firstInStrike.toString(),
      secondInStrike: dataInfo.secondInStrike.toString(),
      firstOutStrike: dataInfo.firstOutStrike.toString(),
      secondOutStrike: dataInfo.secondOutStrike.toString(),
      firstInExchangeToken: dataInfo.firstInExchangeToken.toString(),
      secondInExchangeToken: dataInfo.secondInExchangeToken.toString(),
      firstOutExchangeToken: dataInfo.firstOutExchangeToken.toString(),
      secondOutExchangeToken: dataInfo.secondOutExchangeToken.toString(),
      tradingSymbol: dataInfo.tradingSymbol,
      exchange: dataInfo.exchange,
      brokerName: globleBrokerName,
    };
    processInsertUpdateOrder(data,logmessege);
  };

  const processInsertUpdateOrder = async (requestOrderList,logmessege) => {
    const objData={
      orderitems:requestOrderList,
      logmessage:logmessege
    }
    if (globleSelectedTradingType.toLowerCase() === "paper") {
      const resultData = await PaperTradingAPI.processInsertUpdateOrderPaper(
        objData
      );
      if (resultData != null) {
        //setIsExecuteProcess(false);
        alertify.success("Order added successfully.");
        setChangeOrderPosition((data) => data + 1);
      }else{
        setIsExecuteProcess(false);
      }
    } else {
      let requestData = {
        logintoken: sessionStorage.getItem("apiSecret"),
        orderitems: requestOrderList,
        logmessage:logmessege
      };
      const resultData = await LiveTradingAPI.processInsertUpdateOrderLive(
        requestData
      );
      if (resultData != null) {
        //setIsExecuteProcess(false);
        alertify.message(resultData);
      }else{
        setIsExecuteProcess(false);
      }
    }
  };

  const handleKeyDown = (e) => { 
    if (e.key === "Enter" || e.key === "Tab") {
      if (e.target.name === "globalTP") {
        setTpEdit(false);
      } else if (e.target.name === "globalTarget") {
        setTragetEdit(false);
      } else if (e.target.name === "globalStopLoss") {
        setSLEdit(false);
      }
      processtrailingvalues();
    }
  };

  const isValidDecimal = (value) => {
    return /^-?\d*\.?\d+$/.test(value);
  };

  const processtrailingvalues = async () => {   
    
        if(!isValidDecimal(globalStopLoss) && globalStopLoss!==""){
            alertify.error("Stoploss value is invalid.");
            updateGlobalStopLoss("0.00");
            return;
        }
        if(!isValidDecimal(globalTP) && globalTP!==""){
          alertify.error("Trail SL By value is invalid.");
          updateGlobalTP("0.00");
          return;
        }
        if(!isValidDecimal(globalTarget) && globalTarget!==""){
          alertify.error("Target value is invalid.");
          updateGlobalTarget("0.00");
          return;
        }
        let requestData = {
          clientid: globleSelectedClientInfo,
          tradermode: globleSelectedTradingType,
          brockername: globleBrokerName,
          stopLoss: globalStopLoss.toString()===""?"0":globalStopLoss.toString(),
          trailingpoint: globalTP.toString()===""?"0":globalTP.toString(),
          target: globalTarget.toString()===""?"0":globalTarget.toString(),
          currentmtm:mltUnrealized.toString(),
        };
        const resultData = await PaperTradingAPI.processtrailingvalues(requestData);
        if (resultData != null) {
          alertify.success("Stoploss Target updated successfully.");
        }else{
          alertify.error("Unable to process request now.Please try again.");
          gettrailingvalues();      
        }
     
  };

  const handleExitAllPosition = (e) => {
    alertify.confirm(
      "Information",
      "Do you want to exit all open position ?",
      () => {
        setIsExecuteProcess(true);
        const msgtext="EXIT ALL Positions";
        if (globleSelectedTradingType.toLowerCase() === "paper") {
          processExitAllPositionPaper(msgtext);
        } else {
          processExitAllPositionLive(msgtext);
        }
      },
      () => {}
    );
  };

  const handleExitAllOrder = (e) => {
    alertify.confirm(
      "Information",
      "Do you want to exit all penditing order ?",
      () => {
        processAllPendingOrder();
      },
      () => {}
    );
  };

  const processExitAllPositionLive = (logmessage) => {
    
    var configData = JSON.parse(sessionStorage.getItem("defaultConfig"));
    let configInformation = configData.find(
      (data) =>
        data.instrumentname === globleSymbol &&
        data.expirydate === globleExpityvalue &&
        data.clientId === globleSelectedClientInfo
    );
    const {
      defaultProductName,
      defaultSliceQty,
      defaultOrderType,
      defaultLotSize,
      defaultQty,
      defaultLMTPerCentage,
      defaultShowQty,
    } = { ...configInformation };
    //let defaultLMTPer=getSetting(dataInfo.positioninstrumentname, dataInfo.positionexpirydate)?.defaultLMTPerCentage;
    const newOrderPosition = filterOrderPosition.map(
      ({
        strikeprice,
        positionproductname,
        positiontype,
        positioninstrumentname,
        positionexpirydate,
        positionordertype,
        exitqty,
        maxorderqty,
        defaultlotqty,
        positionsidetype,
        instrumentToken,
        positionexchangetoken,
        ltp,
        firstInInstrumentToken,
        secondInInstrumentToken,
        firstOutInstrumentToken,
        secondOutInstrumentToken,
        firstInStrike,
        secondInStrike,
        firstOutStrike,
        secondOutStrike,
        firstInExchangeToken,
        secondInExchangeToken,
        firstOutExchangeToken,
        secondOutExchangeToken,
        tradingSymbol,
        exchange,
      }) => ({
        strikePrice: strikeprice,
        productname: positionproductname,
        ordertype: positiontype,
        expirydate: positionexpirydate,
        instrumentname: positioninstrumentname,
        orderside: positionordertype,
        orderqty: "0",
        totalorderqty: (
          (getSetting(positioninstrumentname, positionexpirydate) != null
            ? parseInt(
                getSetting(positioninstrumentname, positionexpirydate)
                  .defaultQty
              )
            : defaultlotqty) * parseInt(exitqty)
        ).toString(),
        nooforderlot: exitqty.toString(),
        maxorderqty: getSetting(
          positioninstrumentname,
          positionexpirydate
        ).defaultSliceQty.toString(),
        orderprice: ((positiontype === undefined ? "MKT" : positiontype) ===
        "MKT"
          ? ltp
          : parseFloat(
              calculateOrderPrice(
                getSetting(positioninstrumentname, positionexpirydate)
                  ?.defaultLMTPerCentage,
                positiontype,
                positionsidetype,
                ltp
              )
            ) <= parseFloat(ltp)
          ? ltp
          : calculateOrderPrice(
              getSetting(positioninstrumentname, positionexpirydate)
                ?.defaultLMTPerCentage,
              positiontype,
              positionsidetype,
              ltp
            ).toString()
        ).toString(),
        tradermode: globleSelectedTradingType,
        orderidbybroker: "",
        clientid: globleSelectedClientInfo,
        lotsize: getSetting(
          positioninstrumentname,
          positionexpirydate
        ).defaultQty.toString(),
        instrumentToken: instrumentToken,
        orderaction: positionsidetype === "BUY" ? "SELL" : "BUY",
        stoploss: globalStopLoss.toString(),
        target: globalTarget.toString(),
        trailling: globalTP.toString(),
        orderexchangetoken: positionexchangetoken,
        orderstatus: "Pending",
        firstInInstrumentToken: firstInInstrumentToken.toString(),
        secondInInstrumentToken: secondInInstrumentToken.toString(),
        firstOutInstrumentToken: firstOutInstrumentToken.toString(),
        secondOutInstrumentToken: secondOutInstrumentToken.toString(),
        firstInStrike: firstInStrike.toString(),
        secondInStrike: secondInStrike.toString(),
        firstOutStrike: firstOutStrike.toString(),
        secondOutStrike: secondOutStrike.toString(),
        firstInExchangeToken: firstInExchangeToken.toString(),
        secondInExchangeToken: secondInExchangeToken.toString(),
        firstOutExchangeToken: firstOutExchangeToken.toString(),
        secondOutExchangeToken: secondOutExchangeToken.toString(),
        tradingSymbol: tradingSymbol,
        exchange: exchange,
        brokerName: globleBrokerName,
      })
    );
    const scopedUpdatedRowsArray = [];
    const updatedRows = [...newOrderPosition];
    while (updatedRows.some((row) => row.totalorderqty > 0)) {
      updatedRows.forEach((row) => {
        const clonedRow = { ...row };
        if (
          parseInt(clonedRow.totalorderqty) >= parseInt(clonedRow.maxorderqty)
        ) {
          clonedRow.orderqty = clonedRow.maxorderqty.toString();
          clonedRow.nooforderlot = (
            parseInt(clonedRow.maxorderqty) / parseInt(clonedRow.lotsize)
          ).toString();
        } else {
          clonedRow.orderqty = row.totalorderqty.toString();
          clonedRow.nooforderlot = (
            parseInt(row.totalorderqty) / parseInt(clonedRow.lotsize)
          ).toString();
        }
        scopedUpdatedRowsArray.push(clonedRow);
        row.totalorderqty = Math.max(
          0,
          parseInt(row.totalorderqty) - parseInt(clonedRow.maxorderqty)
        );
      });
    }
    processExitAllPositionInBulk(scopedUpdatedRowsArray,logmessage);
  };

  const processExitAllPositionPaper = (logmessage) => {
    var configData = JSON.parse(sessionStorage.getItem("defaultConfig"));
    let configInformation = configData.find(
      (data) =>
        data.instrumentname === globleSymbol &&
        data.expirydate === globleExpityvalue &&
        data.clientId === globleSelectedClientInfo
    );
    const {
      defaultProductName,
      defaultSliceQty,
      defaultOrderType,
      defaultLotSize,
      defaultQty,
      defaultLMTPerCentage,
      defaultShowQty,
    } = { ...configInformation };
    //let defaultLMTPer=getSetting(dataInfo.positioninstrumentname, dataInfo.positionexpirydate)?.defaultLMTPerCentage;
    const newOrderPosition = filterOrderPosition.map(
      ({
        strikeprice,
        positionproductname,
        positiontype,
        positioninstrumentname,
        positionexpirydate,
        positionordertype,
        exitqty,
        maxorderqty,
        defaultlotqty,
        positionsidetype,
        instrumentToken,
        positionexchangetoken,
        ltp,
        firstInInstrumentToken,
        secondInInstrumentToken,
        firstOutInstrumentToken,
        secondOutInstrumentToken,
        firstInStrike,
        secondInStrike,
        firstOutStrike,
        secondOutStrike,
        firstInExchangeToken,
        secondInExchangeToken,
        firstOutExchangeToken,
        secondOutExchangeToken,
        tradingSymbol,
        exchange,
      }) => ({
        strikePrice: strikeprice,
        productname: positionproductname,
        ordertype: positiontype,
        expirydate: positionexpirydate,
        instrumentname: positioninstrumentname,
        orderside: positionordertype,
        orderqty: "0",
        totalorderqty: (
          (getSetting(positioninstrumentname, positionexpirydate) != null
            ? parseInt(
                getSetting(positioninstrumentname, positionexpirydate)
                  .defaultQty
              )
            : defaultlotqty) * parseInt(exitqty)
        ).toString(),
        nooforderlot: exitqty.toString(),
        maxorderqty: getSetting(
          positioninstrumentname,
          positionexpirydate
        ).defaultSliceQty.toString(),
        orderprice: ((positiontype === undefined ? "MKT" : positiontype) ===
        "MKT"
          ? ltp
          : (positionsidetype === "BUY" ? "SELL" : "BUY").toLowerCase() ===
            "buy"
          ? parseFloat(
              calculateOrderPrice(
                getSetting(positioninstrumentname, positionexpirydate)
                  ?.defaultLMTPerCentage,
                positiontype,
                positionsidetype,
                ltp
              )
            ) >= parseFloat(ltp)
            ? ltp
            : calculateOrderPrice(
                getSetting(positioninstrumentname, positionexpirydate)
                  ?.defaultLMTPerCentage,
                positiontype,
                positionsidetype,
                ltp
              ).toString()
          : parseFloat(
              calculateOrderPrice(
                getSetting(positioninstrumentname, positionexpirydate)
                  ?.defaultLMTPerCentage,
                positiontype,
                positionsidetype,
                ltp
              )
            ) <= parseFloat(ltp)
          ? ltp
          : calculateOrderPrice(
              getSetting(positioninstrumentname, positionexpirydate)
                ?.defaultLMTPerCentage,
              positiontype,
              positionsidetype,
              ltp
            ).toString()
        ).toString(),
        tradermode: globleSelectedTradingType,
        orderidbybroker: "",
        clientid: globleSelectedClientInfo,
        lotsize: getSetting(
          positioninstrumentname,
          positionexpirydate
        ).defaultQty.toString(),
        instrumentToken: instrumentToken,
        orderaction: positionsidetype === "BUY" ? "SELL" : "BUY",
        stoploss: globalStopLoss.toString(),
        target: globalTarget.toString(),
        trailling: globalTP.toString(),
        orderexchangetoken: positionexchangetoken,
        orderstatus:
          (positiontype === undefined ? "MKT" : positiontype) === "MKT"
            ? "Completed"
            : (positionsidetype === "BUY" ? "SELL" : "BUY").toLowerCase() ===
              "buy"
            ? parseFloat(
                calculateOrderPrice(
                  getSetting(positioninstrumentname, positionexpirydate)
                    ?.defaultLMTPerCentage,
                  positiontype,
                  positionsidetype,
                  ltp
                )
              ) >= parseFloat(ltp)
              ? "Completed"
              : "Pending"
            : parseFloat(
                calculateOrderPrice(
                  getSetting(positioninstrumentname, positionexpirydate)
                    ?.defaultLMTPerCentage,
                  positiontype,
                  positionsidetype,
                  ltp
                )
              ) <= parseFloat(ltp)
            ? "Completed"
            : "Pending",
        firstInInstrumentToken: firstInInstrumentToken.toString(),
        secondInInstrumentToken: secondInInstrumentToken.toString(),
        firstOutInstrumentToken: firstOutInstrumentToken.toString(),
        secondOutInstrumentToken: secondOutInstrumentToken.toString(),
        firstInStrike: firstInStrike.toString(),
        secondInStrike: secondInStrike.toString(),
        firstOutStrike: firstOutStrike.toString(),
        secondOutStrike: secondOutStrike.toString(),
        firstInExchangeToken: firstInExchangeToken.toString(),
        secondInExchangeToken: secondInExchangeToken.toString(),
        firstOutExchangeToken: firstOutExchangeToken.toString(),
        secondOutExchangeToken: secondOutExchangeToken.toString(),
        tradingSymbol: tradingSymbol,
        exchange: exchange,
        brokerName: globleBrokerName,
      })
    );
    const scopedUpdatedRowsArray = [];
    const updatedRows = [...newOrderPosition];
    while (updatedRows.some((row) => row.totalorderqty > 0)) {
      updatedRows.forEach((row) => {
        const clonedRow = { ...row };
        if (
          parseInt(clonedRow.totalorderqty) >= parseInt(clonedRow.maxorderqty)
        ) {
          clonedRow.orderqty = clonedRow.maxorderqty.toString();
          clonedRow.nooforderlot = (
            parseInt(clonedRow.maxorderqty) / parseInt(clonedRow.lotsize)
          ).toString();
        } else {
          clonedRow.orderqty = row.totalorderqty.toString();
          clonedRow.nooforderlot = (
            parseInt(row.totalorderqty) / parseInt(clonedRow.lotsize)
          ).toString();
        }
        scopedUpdatedRowsArray.push(clonedRow);
        row.totalorderqty = Math.max(
          0,
          parseInt(row.totalorderqty) - parseInt(clonedRow.maxorderqty)
        );
      });
    }
    processExitAllPositionInBulk(scopedUpdatedRowsArray,logmessage);
  };

  const getSetting = (instrumentname, expiryDate) => {    
    const dataSetting = globalConfigPostionData.find(
      (data) =>
        data.instrumentname === instrumentname && data.expirydate === expiryDate
    );
    return dataSetting;
  };

  const calculateOrderPrice = (
    defaultLMTPer,
    defaultOrderType,
    positionsidetype,
    ltp
  ) => {
    const orderprice =
      (defaultOrderType === undefined ? "MKT" : defaultOrderType) === "MKT"
        ? ltp
        : parseFloat(defaultLMTPer) > 0
        ? (positionsidetype === "BUY" ? "SELL" : "BUY").toLowerCase() === "buy"
          ? parseFloat(
              parseFloat(ltp) +
                (parseFloat(ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
          : parseFloat(
              parseFloat(ltp) -
                (parseFloat(ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
        : parseFloat(ltp);
    return Math.round(Number(orderprice) * 20) / 20;
  };

  const processExitAllPositionInBulk = async (requestData,logmessage) => {
    
    if (globleSelectedTradingType.toLowerCase() === "paper") {
      const objReq={
        orderitems: requestData,
        logmessage:logmessage
      }
      const resultData =
        await PaperTradingAPI.processInsertUpdateOrderBulkPaper(objReq);
      if (resultData != null) {
        alertify.success("All open positions closed successfully.");
        setChangeOrderPosition((data) => data + 1);
      }
    } else {
      let dataInfo = {
        logintoken: sessionStorage.getItem("apiSecret"),
        orderitems: requestData,
        logmessage:logmessage
      };
      const resultData = await LiveTradingAPI.processInsertUpdateOrderBulkLive(
        dataInfo
      );
      if (resultData != null) {
        alertify.success("All open positions closed successfully.");
      } else {
      }
    }
  };

  const processInsertUpdateOrderBulkMoveInOut = async (
    requestData,
    message
  ) => {
    if (globleSelectedTradingType.toLowerCase() === "paper") {
      const objRequest={
        orderitems:requestData,
        logmessage:message
      }
      const resultData =
        await PaperTradingAPI.processInsertUpdateOrderBulkPaper(objRequest);
      if (resultData != null) {
        alertify.success(message);
        setChangeOrderPosition((data) => data + 1);
      }
    } else {
      let dataInfo = {
        logintoken: sessionStorage.getItem("apiSecret"),
        orderitems: requestData,
        logmessage:message
      };
      const resultData = await LiveTradingAPI.processInsertUpdateOrderBulkLive(
        dataInfo
      );
      if (resultData != null) {
        if (resultData.indexOf("successfully") !== -1) {
          alertify.success(message);
        } else {
          alertify.message(resultData);
        }
        setChangeOrderPosition((data) => data + 1);
      }
    }
  };

  const processAllPendingOrder = async () => {
    if (globleSelectedTradingType.toLowerCase() === "paper") {
      let requestData = {
        clientid: globleSelectedClientInfo,
        tradermode: globleSelectedTradingType,
        brokerName: globleBrokerName,
        logmessage:"EXIT ALL Pending Orders."
      };
      const resultData = await PaperTradingAPI.processAllPendingOrderForClient(
        requestData
      );
      if (resultData != null) {
        alertify.success("Pending order successfully cancelled.");
        setChangeOrderPosition((data) => data + 1);
      }
    } else {
      let requestData = {
        clientid: globleSelectedClientInfo,
        tradermode: globleSelectedTradingType,
        logintoken: sessionStorage.getItem("apiSecret"),
        brokerName: globleBrokerName,
        logmessage:"EXIT ALL Pending Orders."
      };
      const resultData = await LiveTradingAPI.processAllPendingOrderForClient(
        requestData
      );
      if (resultData != null) {        
        alertify.success(resultData);
        setChangeOrderPosition((data) => data + 1);
      }
    }
  };

  useEffect(() => {
    if (
      globleSelectedTradingType.length > 0 &&
      globleSelectedClientInfo.length > 0
    ) {
      getAllOpenPositionList();
      getOrderCompletedList();
      getOrderClosedList();
      getLogList();
      gettrailingvalues();       
        getTradesForClient();
           
    }
  }, [globleSelectedTradingType, globleSelectedClientInfo]);

  useEffect(() => {
    const connectionData = new signalR.HubConnectionBuilder()
      .withUrl(BASE_SIGNALR_HUB)
      .withAutomaticReconnect()
      .build(); // Adjust the URL based on your server configuration

    connectionData
      .start()
      .then(() => {
        console.log("Connected to SignalR Hub");
        const intervalId = setInterval(() => {
          connectionData.send('KeepAlive');
        }, 30000);
        connectionData.onclose(() => {
          clearInterval(intervalId);
        });
      })
      .catch((err) => console.log(err));
 
    connectionData.on("ReceiveData", (receivedData) => {
      getAllOpenPositionList();
      getOrderCompletedList();
      getOrderClosedList();
      getLogList();
      gettrailingvalues();
      getTradesForClient();
       
    });    
    connectionData.on('ReceiveLogDataToClients', (receivedData) => {        
      getLogList();           
    });
    connectionData.on('ReceiveDataForPosition', (receivedData) => {           
      getPositionStoplossList();         
      console.log("getPositionStoplossList")  
    });
    connectionData.on('ReceiveDataForPositionProfile', (receivedData) => {
      gettrailingvaluesfromtrailing();           
    });
    connectionData.on('ReceiveServerTime', (receivedData) => {
      const receivedTime = new Date(receivedData);      
      updateGlobleServerTime(receivedTime);        
    });
    
    connectionData.on('ReceiveOrderDataToClients', (receivedData) => {
        getOrderCompletedList();   
        getTradesForClient();         
    });
    return () => {    
      console.log("Dis-Connected to SignalR Hub");
      connectionData.stop();
    };
  }, []);

  const getTradesForClient=async()=>{  
      let requestData = {
        logintoken:sessionStorage.getItem("apiSecret")       
      };
      const resultData=await ZerodaAPI.getTradesForClient(requestData);        
      if(resultData!=null){ 
        const {code,data}=resultData;
        if(code!==200){
          updateGlobleTrades(data);
        }else{
          updateGlobleTrades([]);
        }             
      }else{
        updateGlobleTrades([]);
      }   
  }


  const getPositionStoplossList=async()=>{         
    let requestData={
        clientid:sessionStorage.getItem("clienttoken"),
        tradermode:sessionStorage.getItem("tradingtype")  
    }
     const resultData=await PaperTradingAPI.getPositionStoplossList(requestData);        
    if(resultData!=null){   
      setOrderPosition((previousData) => {
            if (previousData !== undefined) {  
               
                if(previousData!=null){
                const updatedOrderPosition = previousData.map((position) => {
                  const matchingOption = resultData.find((item) => item?.positionid.toString() === position?.positionid.toString());
                  if (matchingOption) {
                    return {
                      ...position,
                      positionstoploss: matchingOption.positionstoploss        
                    };
                  }else{
                    return {
                      ...position
                    }
                  }  
                });     
                return updatedOrderPosition;
            }
        }    
      });                          
    }
  }

  const gettrailingvaluesfromtrailing = async () => {
    let requestData = {
      clientid: sessionStorage.getItem("clienttoken"),
      tradermode: sessionStorage.getItem("tradingtype"),
      brockername:sessionStorage.getItem("brokername")  ,
    };
    const resultData = await PaperTradingAPI.gettrailingvaluesfromtrailing(requestData);    
    if (resultData != null) {
      
      if (resultData.length > 0) {
        if(slEdit===false){     
            updateGlobalStopLoss(resultData[0].stopLoss);
        }
        if(tragetEdit===false){         
          updateGlobalTarget(resultData[0].target);
        }
        if(tpEdit===false){         
          updateGlobalTP(resultData[0].trailingpoint);
        }
      } else {
        updateGlobalStopLoss(0);
        updateGlobalTP(0);
        updateGlobalTarget(0);
      }
    }
  };

  const gettrailingvalues = async () => {
    let requestData = {
      clientid: sessionStorage.getItem("clienttoken"),
      tradermode: sessionStorage.getItem("tradingtype"),
      brockername:sessionStorage.getItem("brokername")  ,
    };
    const resultData = await PaperTradingAPI.gettrailingvalues(requestData);
    
    if (resultData != null) {
      if (resultData.length > 0) {
        updateGlobalStopLoss(resultData[0].stopLoss);
        updateGlobalTP(resultData[0].trailingpoint);
        updateGlobalTarget(resultData[0].target);
      } else {
        updateGlobalStopLoss(0);
        updateGlobalTP(0);
        updateGlobalTarget(0);
      }
    }
  };

  const getAllOpenPositionList = async () => {
    let requestData = {
      clientid: sessionStorage.getItem("clienttoken"),
      tradermode: sessionStorage.getItem("tradingtype"),
    };
    const resultData = await PaperTradingAPI.getAllOpenPositionList(
      requestData
    );
    if (resultData != null) {
      setIsExecuteProcess(false);
      let tokentoRegister = [];
      resultData.map((data) => {
        let defaultSaveedQty = getSetting(
          data.positioninstrumentname,
          data.positionexpirydate
        )?.defaultQty;
        data.moveinouttotalqty =
          parseInt(data.moveinoutqty) * parseInt(data.defaultlotqty);
        data.newaddtotalqty =
          parseInt(data.newqty) * parseInt(data.defaultlotqty);
        data.exittotalqty =
          parseInt(data.exitqty) * parseInt(data.defaultlotqty);
        tokentoRegister.push(data.instrumentToken);
        if (data.firstInInstrumentToken !== "") {
          tokentoRegister.push(data.firstInInstrumentToken);
        }
        if (data.secondInInstrumentToken !== "") {
          tokentoRegister.push(data.secondInInstrumentToken);
        }
        if (data.firstOutInstrumentToken !== "") {
          tokentoRegister.push(data.firstOutInstrumentToken);
        }
        if (data.secondOutInstrumentToken !== "") {
          tokentoRegister.push(data.secondOutInstrumentToken);
        }
      });
      const uniqueChannelData = [...new Set(tokentoRegister)];
      updateGlobleUniqueChannelData(uniqueChannelData);
      const dataResult = resultData.map((data) => {
        const matchingOption = filterOrderPositionList.find(
          (dataOrder) => dataOrder.instrumentToken === data.instrumentToken
        );
        if (matchingOption != null) {
          data.ltp = matchingOption.ltp;
          data.unrealisedpnl = calculateUnrealisedPnl(data, matchingOption);
        } else {
          //data.unrealisedpnl = calculateUnrealisedPnl(data, data);
        }
        const matchingOptionFirstInStrick = filterOrderPositionList.find(
          (dataOrder) =>
            dataOrder.instrumentToken === data.firstInInstrumentToken
        );
        if (matchingOptionFirstInStrick != null) {
          data.firstInltp = matchingOptionFirstInStrick.ltp;
        } else {
          data.firstInltp = parseFloat(0).toFixed(2);
        }
        const matchingOptionSecondInStrick = filterOrderPositionList.find(
          (dataOrder) =>
            dataOrder.instrumentToken === data.secondInInstrumentToken
        );
        if (matchingOptionSecondInStrick != null) {
          data.secondInltp = matchingOptionSecondInStrick.ltp;
        } else {
          data.secondInltp = parseFloat(0).toFixed(2);
        }
        const matchingOptionFirstOutStrick = filterOrderPositionList.find(
          (dataOrder) =>
            dataOrder.instrumentToken === data.firstOutInstrumentToken
        );
        if (matchingOptionFirstOutStrick != null) {
          data.firstOutltp = matchingOptionFirstOutStrick.ltp;
        } else {
          data.firstOutltp = parseFloat(0).toFixed(2);
        }
        const matchingOptionSecondOutStrick = filterOrderPositionList.find(
          (dataOrder) =>
            dataOrder.instrumentToken === data.secondOutInstrumentToken
        );
        if (matchingOptionSecondOutStrick != null) {
          data.secondOutltp = matchingOptionSecondOutStrick.ltp;
        } else {
          data.secondOutltp = parseFloat(0).toFixed(2);
        }
        return data;
      });
      updateGlobleOrderPosition(dataResult);
     
    }
  };

  const getOrderCompletedList = async () => {
    let requestData = {
      clientid: sessionStorage.getItem("clienttoken"),
      tradermode: sessionStorage.getItem("tradingtype"),
    };
    const resultData = await PaperTradingAPI.getOrderCompletedList(requestData);
    if (resultData != null) {
      updateGlobleOrderList(resultData);
    }
  };

  const getOrderClosedList = async () => {
    
    let requestData = {
      clientid: sessionStorage.getItem("clienttoken"),
      tradermode: sessionStorage.getItem("tradingtype"),
    };
    const resultData = await PaperTradingAPI.getOrderClosedList(requestData);
    if (resultData != null) {       
     
      updateGlobleClosedList(resultData);
    }
  };

  const getLogList = async () => {
    let requestData = {
      clientid: sessionStorage.getItem("clienttoken"),
      tradermode: sessionStorage.getItem("tradingtype"),
    };
    const resultData = await PaperTradingAPI.getLogList(requestData);
    if (resultData != null) {
      updateGlobleLogList(resultData);
    }
  };

  const handdleFirstPosition = (dataInfo, positionmovetype) => {
    setIsExecuteProcess(true);
    if (globleSelectedTradingType.toLowerCase() === "paper") {
      handdleFirstPositionPaper(dataInfo, positionmovetype);
    } else {
      handdleFirstPositionLive(dataInfo, positionmovetype);
    }
  };

  const handdleFirstPositionLive = (dataInfo, positionmovetype) => {
    
    let message = "";
    var configData = JSON.parse(sessionStorage.getItem("defaultConfig"));
    let configInformation = configData.find(
      (data) =>
        data.instrumentname === globleSymbol &&
        data.expirydate === globleExpityvalue &&
        data.clientId === globleSelectedClientInfo
    );
    const {
      defaultProductName,
      defaultSliceQty,
      defaultOrderType,
      defaultLotSize,
      defaultQty,
      defaultLMTPerCentage,
      defaultShowQty,
    } = { ...configInformation };
    let defaultLMTPer = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultLMTPerCentage;
    let positiontype = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultProductName;
    let orderprice =
      (positiontype === undefined ? "MKT" : positiontype) === "MKT"
        ? dataInfo.ltp
        : parseFloat(defaultLMTPer) > 0
        ? (dataInfo.positionsidetype === "BUY"
            ? "SELL"
            : "BUY"
          ).toLowerCase() === "buy"
          ? parseFloat(
              parseFloat(dataInfo.ltp) +
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
          : parseFloat(
              parseFloat(dataInfo.ltp) -
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
        : parseFloat(dataInfo.ltp);

    let data = {
      strikePrice: dataInfo.strikeprice,
      productname: dataInfo.positionproductname,
      ordertype: positiontype,
      expirydate: dataInfo.positionexpirydate,
      instrumentname: dataInfo.positioninstrumentname,
      orderside: dataInfo.positionordertype,
      orderqty: (
        (getSetting(
          dataInfo.positioninstrumentname,
          dataInfo.positionexpirydate
        ) != null
          ? parseInt(
              getSetting(
                dataInfo.positioninstrumentname,
                dataInfo.positionexpirydate
              ).defaultQty
            )
          : defaultQty) * parseInt(dataInfo.moveinoutqty)
      ).toString(),
      nooforderlot: dataInfo.moveinoutqty.toString(),
      maxorderqty: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultSliceQty.toString(),
      orderprice: (Math.round(Number(orderprice) * 20) / 20).toString(),
      tradermode: globleSelectedTradingType,
      orderidbybroker: "",
      clientid: globleSelectedClientInfo,
      lotsize: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultQty.toString(),
      instrumentToken: dataInfo.instrumentToken,
      orderaction: dataInfo.positionsidetype === "BUY" ? "SELL" : "BUY",
      stoploss: "0",
      target: "0",
      trailling: "0",
      orderexchangetoken: dataInfo.positionexchangetoken,
      orderstatus: "Pending",
      firstInInstrumentToken: dataInfo.firstInInstrumentToken.toString(),
      secondInInstrumentToken: dataInfo.secondInInstrumentToken.toString(),
      firstOutInstrumentToken: dataInfo.firstOutInstrumentToken.toString(),
      secondOutInstrumentToken: dataInfo.secondOutInstrumentToken.toString(),
      firstInStrike: dataInfo.firstInStrike.toString(),
      secondInStrike: dataInfo.secondInStrike.toString(),
      firstOutStrike: dataInfo.firstOutStrike.toString(),
      secondOutStrike: dataInfo.secondOutStrike.toString(),
      firstInExchangeToken: dataInfo.firstInExchangeToken.toString(),
      secondInExchangeToken: dataInfo.secondInExchangeToken.toString(),
      firstOutExchangeToken: dataInfo.firstOutExchangeToken.toString(),
      secondOutExchangeToken: dataInfo.secondOutExchangeToken.toString(),
      tradingSymbol: dataInfo.tradingSymbol,
      exchange: dataInfo.exchange,
      brokerName: globleBrokerName,
    };

    let currentStrike = "";
    let currentInstrumentToken = "";
    let currentExchangeToken = "";
    let currentltp = "";
    if (positionmovetype === "in") {
      currentStrike = dataInfo.firstInStrike.toString();
      currentInstrumentToken = dataInfo.firstInInstrumentToken.toString();
      currentExchangeToken = dataInfo.firstInExchangeToken.toString();
      currentltp = dataInfo.firstInltp;
    } else {
      currentStrike = dataInfo.firstOutStrike.toString();
      currentInstrumentToken = dataInfo.firstOutInstrumentToken.toString();
      currentExchangeToken = dataInfo.firstOutExchangeToken.toString();
      currentltp = dataInfo.firstOutltp;
    }

    let temptype = dataInfo.positionordertype;
    let dataNewStrick = Constant.GetNewStrike(
      dataInfo.positioninstrumentname,
      currentStrike,
      temptype
    );
    //let dataNewTradingSymbol=Constant.GetNewTradingSymbol(dataInfo.positioninstrumentname,currentStrike,temptype);

    const {
      newFirstInStrike,
      newSecondInStrike,
      newFirstOutStrike,
      newSecondOutStrike,
      tradingSymbol,
    } = dataNewStrick;
    let newFirstInInstrumentToken = Constant.GetStrikeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newFirstInStrike,
      temptype
    );
    let newSecondInInstrumentToken = Constant.GetStrikeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newSecondInStrike,
      temptype
    );
    let newFirstOutInstrumentToken = Constant.GetStrikeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newFirstOutStrike,
      temptype
    );
    let newSecondOutInstrumentToken = Constant.GetStrikeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newSecondOutStrike,
      temptype
    );
    let newFirstInExchangeToken = Constant.GetStrikeExchangeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newFirstInStrike,
      temptype
    );
    let newSecondInExchangeToken = Constant.GetStrikeExchangeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newSecondInStrike,
      temptype
    );
    let newFirstOutExchangeToken = Constant.GetStrikeExchangeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newFirstOutStrike,
      temptype
    );
    let newSecondOutExchangeToken = Constant.GetStrikeExchangeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newSecondOutStrike,
      temptype
    );

    let orderpriceNew =
      (positiontype === undefined ? "MKT" : positiontype) === "MKT"
        ? dataInfo.ltp
        : parseFloat(defaultLMTPer) > 0
        ? dataInfo.positionsidetype.toLowerCase() === "buy"
          ? parseFloat(
              parseFloat(currentltp) +
                (parseFloat(currentltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
          : parseFloat(
              parseFloat(currentltp) -
                (parseFloat(currentltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
        : parseFloat(currentltp);

    let newCurrentTradingSymbol = Constant.GetTradaingSymbol(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      currentStrike,
      temptype
    );
    let newCurrentTradingExchange = Constant.GetStrikeExchange(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      currentStrike,
      temptype
    );

    let dataNew = {
      strikePrice: currentStrike,
      productname: dataInfo.positionproductname,
      ordertype: positiontype,
      expirydate: dataInfo.positionexpirydate,
      instrumentname: dataInfo.positioninstrumentname,
      orderside: dataInfo.positionordertype,
      orderqty: (
        (getSetting(
          dataInfo.positioninstrumentname,
          dataInfo.positionexpirydate
        ) != null
          ? parseInt(
              getSetting(
                dataInfo.positioninstrumentname,
                dataInfo.positionexpirydate
              ).defaultQty
            )
          : defaultQty) * parseInt(dataInfo.moveinoutqty)
      ).toString(),
      nooforderlot: dataInfo.moveinoutqty.toString(),
      maxorderqty: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultSliceQty.toString(),
      orderprice: (Math.round(Number(orderpriceNew) * 20) / 20).toString(),
      tradermode: globleSelectedTradingType,
      orderidbybroker: "",
      clientid: globleSelectedClientInfo,
      lotsize: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultQty.toString(),
      instrumentToken: currentInstrumentToken,
      orderaction: dataInfo.positionsidetype,
      stoploss: "0",
      target: "0",
      trailling: "0",
      orderexchangetoken: currentExchangeToken,
      orderstatus: "Pending",
      firstInInstrumentToken: newFirstInInstrumentToken.toString(),
      secondInInstrumentToken: newSecondInInstrumentToken.toString(),
      firstOutInstrumentToken: newFirstOutInstrumentToken.toString(),
      secondOutInstrumentToken: newSecondOutInstrumentToken.toString(),
      firstInStrike: newFirstInStrike.toString(),
      secondInStrike: newSecondInStrike.toString(),
      firstOutStrike: newFirstOutStrike.toString(),
      secondOutStrike: newSecondOutStrike.toString(),
      firstInExchangeToken: newFirstInExchangeToken.toString(),
      secondInExchangeToken: newSecondInExchangeToken.toString(),
      firstOutExchangeToken: newFirstOutExchangeToken.toString(),
      secondOutExchangeToken: newSecondOutExchangeToken.toString(),
      tradingSymbol: newCurrentTradingSymbol,
      exchange: newCurrentTradingExchange,
      brokerName: globleBrokerName,
    };

    message =
      dataInfo.moveinoutqty.toString() +
      " Qty - Position " +
      dataInfo.positioninstrumentname +
      " " +
      dataInfo.strikeprice +
      " " +
      dataInfo.positionordertype +
      " moved to " +
      dataInfo.positioninstrumentname +
      " " +
      currentStrike +
      " " +
      dataInfo.positionordertype;

    const orderArray = [];
    orderArray.push(...[data, dataNew]);
    processInsertUpdateOrderBulkMoveInOut(orderArray, message);
  };
  const handdleFirstPositionPaper = (dataInfo, positionmovetype) => {
    
    let message = "";
    var configData = JSON.parse(sessionStorage.getItem("defaultConfig"));
    let configInformation = configData.find(
      (data) =>
        data.instrumentname === globleSymbol &&
        data.expirydate === globleExpityvalue &&
        data.clientId === globleSelectedClientInfo
    );
    const {
      defaultProductName,
      defaultSliceQty,
      defaultOrderType,
      defaultLotSize,
      defaultQty,
      defaultLMTPerCentage,
      defaultShowQty,
    } = { ...configInformation };
    let defaultLMTPer = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultLMTPerCentage;
    let positiontype = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultProductName;
    let orderprice =
      (positiontype === undefined ? "MKT" : positiontype) === "MKT"
        ? dataInfo.ltp
        : parseFloat(defaultLMTPer) > 0
        ? (dataInfo.positionsidetype === "BUY"
            ? "SELL"
            : "BUY"
          ).toLowerCase() === "buy"
          ? parseFloat(
              parseFloat(dataInfo.ltp) +
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
          : parseFloat(
              parseFloat(dataInfo.ltp) -
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
        : parseFloat(dataInfo.ltp);

    let data = {
      strikePrice: dataInfo.strikeprice,
      productname: dataInfo.positionproductname,
      ordertype: positiontype,
      expirydate: dataInfo.positionexpirydate,
      instrumentname: dataInfo.positioninstrumentname,
      orderside: dataInfo.positionordertype,
      orderqty: (
        (getSetting(
          dataInfo.positioninstrumentname,
          dataInfo.positionexpirydate
        ) != null
          ? parseInt(
              getSetting(
                dataInfo.positioninstrumentname,
                dataInfo.positionexpirydate
              ).defaultQty
            )
          : defaultQty) * parseInt(dataInfo.moveinoutqty)
      ).toString(),
      nooforderlot: dataInfo.moveinoutqty.toString(),
      maxorderqty: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultSliceQty.toString(),
      orderprice:
        (positiontype === undefined ? "MKT" : positiontype) === "MKT"
          ? dataInfo.ltp.toString()
          : (dataInfo.positionsidetype === "BUY"
              ? "SELL"
              : "BUY"
            ).toLowerCase() === "buy"
          ? parseFloat(orderprice) >= parseFloat(dataInfo.ltp)
            ? dataInfo.ltp.toString()
            : orderprice.toString()
          : parseFloat(orderprice) <= parseFloat(dataInfo.ltp)
          ? dataInfo.ltp.toString()
          : orderprice.toString(),
      tradermode: globleSelectedTradingType,
      orderidbybroker: "",
      clientid: globleSelectedClientInfo,
      lotsize: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultQty.toString(),
      instrumentToken: dataInfo.instrumentToken,
      orderaction: dataInfo.positionsidetype === "BUY" ? "SELL" : "BUY",
      stoploss: "0",
      target: "0",
      trailling: "0",
      orderexchangetoken: dataInfo.positionexchangetoken,
      orderstatus:
        (positiontype === undefined ? "MKT" : positiontype) === "MKT"
          ? "Completed"
          : (dataInfo.positionsidetype === "BUY"
              ? "SELL"
              : "BUY"
            ).toLowerCase() === "buy"
          ? parseFloat(orderprice) >= parseFloat(dataInfo.ltp)
            ? "Completed"
            : "Pending"
          : parseFloat(orderprice) <= parseFloat(dataInfo.ltp)
          ? "Completed"
          : "Pending",
      firstInInstrumentToken: dataInfo.firstInInstrumentToken.toString(),
      secondInInstrumentToken: dataInfo.secondInInstrumentToken.toString(),
      firstOutInstrumentToken: dataInfo.firstOutInstrumentToken.toString(),
      secondOutInstrumentToken: dataInfo.secondOutInstrumentToken.toString(),
      firstInStrike: dataInfo.firstInStrike.toString(),
      secondInStrike: dataInfo.secondInStrike.toString(),
      firstOutStrike: dataInfo.firstOutStrike.toString(),
      secondOutStrike: dataInfo.secondOutStrike.toString(),
      firstInExchangeToken: dataInfo.firstInExchangeToken.toString(),
      secondInExchangeToken: dataInfo.secondInExchangeToken.toString(),
      firstOutExchangeToken: dataInfo.firstOutExchangeToken.toString(),
      secondOutExchangeToken: dataInfo.secondOutExchangeToken.toString(),
      tradingSymbol: dataInfo.tradingSymbol,
      exchange: dataInfo.exchange,
      brokerName: globleBrokerName,
    };

    let currentStrike = "";
    let currentInstrumentToken = "";
    let currentExchangeToken = "";
    let currentltp = "";
    if (positionmovetype === "in") {
      currentStrike = dataInfo.firstInStrike.toString();
      currentInstrumentToken = dataInfo.firstInInstrumentToken.toString();
      currentExchangeToken = dataInfo.firstInExchangeToken.toString();
      currentltp = dataInfo.firstInltp;
    } else {
      currentStrike = dataInfo.firstOutStrike.toString();
      currentInstrumentToken = dataInfo.firstOutInstrumentToken.toString();
      currentExchangeToken = dataInfo.firstOutExchangeToken.toString();
      currentltp = dataInfo.firstOutltp;
    }

    let temptype = dataInfo.positionordertype;
    let dataNewStrick = Constant.GetNewStrike(
      dataInfo.positioninstrumentname,
      currentStrike,
      temptype
    );
    const {
      newFirstInStrike,
      newSecondInStrike,
      newFirstOutStrike,
      newSecondOutStrike,
    } = dataNewStrick;
    let newFirstInInstrumentToken = Constant.GetStrikeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newFirstInStrike,
      temptype
    );
    let newSecondInInstrumentToken = Constant.GetStrikeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newSecondInStrike,
      temptype
    );
    let newFirstOutInstrumentToken = Constant.GetStrikeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newFirstOutStrike,
      temptype
    );
    let newSecondOutInstrumentToken = Constant.GetStrikeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newSecondOutStrike,
      temptype
    );
    let newFirstInExchangeToken = Constant.GetStrikeExchangeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newFirstInStrike,
      temptype
    );
    let newSecondInExchangeToken = Constant.GetStrikeExchangeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newSecondInStrike,
      temptype
    );
    let newFirstOutExchangeToken = Constant.GetStrikeExchangeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newFirstOutStrike,
      temptype
    );
    let newSecondOutExchangeToken = Constant.GetStrikeExchangeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newSecondOutStrike,
      temptype
    );
    let orderpriceNew =
      (positiontype === undefined ? "MKT" : positiontype) === "MKT"
        ? dataInfo.ltp
        : parseFloat(defaultLMTPer) > 0
        ? dataInfo.positionsidetype.toLowerCase() === "buy"
          ? parseFloat(
              parseFloat(currentltp) +
                (parseFloat(currentltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
          : parseFloat(
              parseFloat(currentltp) -
                (parseFloat(currentltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
        : parseFloat(currentltp);
    let newCurrentTradingSymbol = Constant.GetTradaingSymbol(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      currentStrike,
      temptype
    );
    let newCurrentTradingExchange = Constant.GetStrikeExchange(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      currentStrike,
      temptype
    );

    let dataNew = {
      strikePrice: currentStrike,
      productname: dataInfo.positionproductname,
      ordertype: positiontype,
      expirydate: dataInfo.positionexpirydate,
      instrumentname: dataInfo.positioninstrumentname,
      orderside: dataInfo.positionordertype,
      orderqty: (
        (getSetting(
          dataInfo.positioninstrumentname,
          dataInfo.positionexpirydate
        ) != null
          ? parseInt(
              getSetting(
                dataInfo.positioninstrumentname,
                dataInfo.positionexpirydate
              ).defaultQty
            )
          : defaultQty) * parseInt(dataInfo.moveinoutqty)
      ).toString(),
      nooforderlot: dataInfo.moveinoutqty.toString(),
      maxorderqty: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultSliceQty.toString(),
      orderprice:
        (positiontype === undefined ? "MKT" : positiontype) === "MKT"
          ? currentltp.toString()
          : dataInfo.positionsidetype.toLowerCase() === "buy"
          ? parseFloat(orderpriceNew) >= parseFloat(currentltp)
            ? currentltp.toString()
            : orderpriceNew.toString()
          : parseFloat(orderpriceNew) <= parseFloat(currentltp)
          ? currentltp.toString()
          : orderpriceNew.toString(),
      tradermode: globleSelectedTradingType,
      orderidbybroker: "",
      clientid: globleSelectedClientInfo,
      lotsize: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultQty.toString(),
      instrumentToken: currentInstrumentToken,
      orderaction: dataInfo.positionsidetype,
      stoploss: "0",
      target: "0",
      trailling: "0",
      orderexchangetoken: currentExchangeToken,
      orderstatus:
        (positiontype === undefined ? "MKT" : positiontype) === "MKT"
          ? "Completed"
          : dataInfo.positionsidetype.toLowerCase() === "buy"
          ? parseFloat(orderpriceNew) >= parseFloat(currentltp)
            ? "Completed"
            : "Pending"
          : parseFloat(orderpriceNew) <= parseFloat(currentltp)
          ? "Completed"
          : "Pending",
      firstInInstrumentToken: newFirstInInstrumentToken.toString(),
      secondInInstrumentToken: newSecondInInstrumentToken.toString(),
      firstOutInstrumentToken: newFirstOutInstrumentToken.toString(),
      secondOutInstrumentToken: newSecondOutInstrumentToken.toString(),
      firstInStrike: newFirstInStrike.toString(),
      secondInStrike: newSecondInStrike.toString(),
      firstOutStrike: newFirstOutStrike.toString(),
      secondOutStrike: newSecondOutStrike.toString(),
      firstInExchangeToken: newFirstInExchangeToken.toString(),
      secondInExchangeToken: newSecondInExchangeToken.toString(),
      firstOutExchangeToken: newFirstOutExchangeToken.toString(),
      secondOutExchangeToken: newSecondOutExchangeToken.toString(),
      tradingSymbol: newCurrentTradingSymbol,
      exchange: newCurrentTradingExchange,
      brokerName: globleBrokerName,
    };

    message =
      dataInfo.moveinoutqty.toString() +
      " Qty - Position " +
      dataInfo.positioninstrumentname +
      " " +
      dataInfo.strikeprice +
      " " +
      dataInfo.positionordertype +
      " moved to " +
      dataInfo.positioninstrumentname +
      " " +
      currentStrike +
      " " +
      dataInfo.positionordertype;

    const orderArray = [];
    orderArray.push(...[data, dataNew]);
    processInsertUpdateOrderBulkMoveInOut(orderArray, message);
  };

  const handdleSecondPosition = (dataInfo, positionmovetype) => {
    setIsExecuteProcess(true);
    if (globleSelectedTradingType.toLowerCase() === "paper") {
      handdleSecondPositionPaper(dataInfo, positionmovetype);
    } else {
      handdleSecondPositionLive(dataInfo, positionmovetype);
    }
  };

  const handdleSecondPositionLive = (dataInfo, positionmovetype) => {
    let message = "";
    var configData = JSON.parse(sessionStorage.getItem("defaultConfig"));
    let configInformation = configData.find(
      (data) =>
        data.instrumentname === globleSymbol &&
        data.expirydate === globleExpityvalue &&
        data.clientId === globleSelectedClientInfo
    );
    const {
      defaultProductName,
      defaultSliceQty,
      defaultOrderType,
      defaultLotSize,
      defaultQty,
      defaultLMTPerCentage,
      defaultShowQty,
    } = { ...configInformation };
    let defaultLMTPer = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultLMTPerCentage;
    let positiontype = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultProductName;
    let orderprice =
      (positiontype === undefined ? "MKT" : positiontype) === "MKT"
        ? dataInfo.ltp
        : parseFloat(defaultLMTPer) > 0
        ? (dataInfo.positionsidetype === "BUY"
            ? "SELL"
            : "BUY"
          ).toLowerCase() === "buy"
          ? parseFloat(
              parseFloat(dataInfo.ltp) +
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
          : parseFloat(
              parseFloat(dataInfo.ltp) -
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
        : parseFloat(dataInfo.ltp);

    let data = {
      strikePrice: dataInfo.strikeprice,
      productname: dataInfo.positionproductname,
      ordertype: positiontype,
      expirydate: dataInfo.positionexpirydate,
      instrumentname: dataInfo.positioninstrumentname,
      orderside: dataInfo.positionordertype,
      orderqty: (
        (getSetting(
          dataInfo.positioninstrumentname,
          dataInfo.positionexpirydate
        ) != null
          ? parseInt(
              getSetting(
                dataInfo.positioninstrumentname,
                dataInfo.positionexpirydate
              ).defaultQty
            )
          : defaultQty) * parseInt(dataInfo.moveinoutqty)
      ).toString(),
      nooforderlot: dataInfo.moveinoutqty.toString(),
      maxorderqty: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultSliceQty.toString(),
      orderprice: (Math.round(Number(orderprice) * 20) / 20).toString(),
      tradermode: globleSelectedTradingType,
      orderidbybroker: "",
      clientid: globleSelectedClientInfo,
      lotsize: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultQty.toString(),
      instrumentToken: dataInfo.instrumentToken,
      orderaction: dataInfo.positionsidetype === "BUY" ? "SELL" : "BUY",
      stoploss: "0",
      target: "0",
      trailling: "0",
      orderexchangetoken: dataInfo.positionexchangetoken,
      orderstatus: "Pending",
      firstInInstrumentToken: dataInfo.firstInInstrumentToken.toString(),
      secondInInstrumentToken: dataInfo.secondInInstrumentToken.toString(),
      firstOutInstrumentToken: dataInfo.firstOutInstrumentToken.toString(),
      secondOutInstrumentToken: dataInfo.secondOutInstrumentToken.toString(),
      firstInStrike: dataInfo.firstInStrike.toString(),
      secondInStrike: dataInfo.secondInStrike.toString(),
      firstOutStrike: dataInfo.firstOutStrike.toString(),
      secondOutStrike: dataInfo.secondOutStrike.toString(),
      firstInExchangeToken: dataInfo.firstInExchangeToken.toString(),
      secondInExchangeToken: dataInfo.secondInExchangeToken.toString(),
      firstOutExchangeToken: dataInfo.firstOutExchangeToken.toString(),
      secondOutExchangeToken: dataInfo.secondOutExchangeToken.toString(),
      tradingSymbol: dataInfo.tradingSymbol,
      exchange: dataInfo.exchange,
      brokerName: globleBrokerName,
    };

    let currentStrike = "";
    let currentInstrumentToken = "";
    let currentExchangeToken = "";
    let currentltp = "";
    if (positionmovetype === "in") {
      currentStrike = dataInfo.secondInStrike.toString();
      currentInstrumentToken = dataInfo.secondInInstrumentToken.toString();
      currentExchangeToken = dataInfo.secondInExchangeToken.toString();
      currentltp = dataInfo.secondInltp;
    } else {
      currentStrike = dataInfo.secondOutStrike.toString();
      currentInstrumentToken = dataInfo.secondOutInstrumentToken.toString();
      currentExchangeToken = dataInfo.secondOutExchangeToken.toString();
      currentltp = dataInfo.secondOutltp;
    }

    let temptype = dataInfo.positionordertype;
    let dataNewStrick = Constant.GetNewStrike(
      dataInfo.positioninstrumentname,
      currentStrike,
      temptype
    );
    const {
      newFirstInStrike,
      newSecondInStrike,
      newFirstOutStrike,
      newSecondOutStrike,
    } = dataNewStrick;
    let newFirstInInstrumentToken = Constant.GetStrikeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newFirstInStrike,
      temptype
    );
    let newSecondInInstrumentToken = Constant.GetStrikeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newSecondInStrike,
      temptype
    );
    let newFirstOutInstrumentToken = Constant.GetStrikeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newFirstOutStrike,
      temptype
    );
    let newSecondOutInstrumentToken = Constant.GetStrikeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newSecondOutStrike,
      temptype
    );
    let newFirstInExchangeToken = Constant.GetStrikeExchangeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newFirstInStrike,
      temptype
    );
    let newSecondInExchangeToken = Constant.GetStrikeExchangeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newSecondInStrike,
      temptype
    );
    let newFirstOutExchangeToken = Constant.GetStrikeExchangeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newFirstOutStrike,
      temptype
    );
    let newSecondOutExchangeToken = Constant.GetStrikeExchangeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newSecondOutStrike,
      temptype
    );

    let orderpriceNew =
      (positiontype === undefined ? "MKT" : positiontype) === "MKT"
        ? dataInfo.ltp
        : parseFloat(defaultLMTPer) > 0
        ? dataInfo.positionsidetype.toLowerCase() === "buy"
          ? parseFloat(
              parseFloat(currentltp) +
                (parseFloat(currentltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
          : parseFloat(
              parseFloat(currentltp) -
                (parseFloat(currentltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
        : parseFloat(currentltp);

    let newCurrentTradingSymbol = Constant.GetTradaingSymbol(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      currentStrike,
      temptype
    );
    let newCurrentTradingExchange = Constant.GetStrikeExchange(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      currentStrike,
      temptype
    );

    let dataNew = {
      strikePrice: currentStrike,
      productname: dataInfo.positionproductname,
      ordertype: positiontype,
      expirydate: dataInfo.positionexpirydate,
      instrumentname: dataInfo.positioninstrumentname,
      orderside: dataInfo.positionordertype,
      orderqty: (
        (getSetting(
          dataInfo.positioninstrumentname,
          dataInfo.positionexpirydate
        ) != null
          ? parseInt(
              getSetting(
                dataInfo.positioninstrumentname,
                dataInfo.positionexpirydate
              ).defaultQty
            )
          : defaultQty) * parseInt(dataInfo.moveinoutqty)
      ).toString(),
      nooforderlot: dataInfo.moveinoutqty.toString(),
      maxorderqty: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultSliceQty.toString(),
      orderprice: (Math.round(Number(orderpriceNew) * 20) / 20).toString(),
      tradermode: globleSelectedTradingType,
      orderidbybroker: "",
      clientid: globleSelectedClientInfo,
      lotsize: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultQty.toString(),
      instrumentToken: currentInstrumentToken,
      orderaction: dataInfo.positionsidetype,
      stoploss: "0",
      target: "0",
      trailling: "0",
      orderexchangetoken: currentExchangeToken,
      orderstatus: "Pending",
      firstInInstrumentToken: newFirstInInstrumentToken.toString(),
      secondInInstrumentToken: newSecondInInstrumentToken.toString(),
      firstOutInstrumentToken: newFirstOutInstrumentToken.toString(),
      secondOutInstrumentToken: newSecondOutInstrumentToken.toString(),
      firstInStrike: newFirstInStrike.toString(),
      secondInStrike: newSecondInStrike.toString(),
      firstOutStrike: newFirstOutStrike.toString(),
      secondOutStrike: newSecondOutStrike.toString(),
      firstInExchangeToken: newFirstInExchangeToken.toString(),
      secondInExchangeToken: newSecondInExchangeToken.toString(),
      firstOutExchangeToken: newFirstOutExchangeToken.toString(),
      secondOutExchangeToken: newSecondOutExchangeToken.toString(),
      tradingSymbol: newCurrentTradingSymbol,
      exchange: newCurrentTradingExchange,
      brokerName: globleBrokerName,
    };
    const orderArray = [];
    orderArray.push(...[data, dataNew]);
    message =
      dataInfo.moveinoutqty.toString() +
      " Qty - Position " +
      dataInfo.positioninstrumentname +
      " " +
      dataInfo.strikeprice +
      " " +
      dataInfo.positionordertype +
      " moved to " +
      dataInfo.positioninstrumentname +
      " " +
      currentStrike +
      " " +
      dataInfo.positionordertype;

    processInsertUpdateOrderBulkMoveInOut(orderArray, message);
  };

  const handdleSecondPositionPaper = (dataInfo, positionmovetype) => {
    
    let message = "";
    var configData = JSON.parse(sessionStorage.getItem("defaultConfig"));
    let configInformation = configData.find(
      (data) =>
        data.instrumentname === globleSymbol &&
        data.expirydate === globleExpityvalue &&
        data.clientId === globleSelectedClientInfo
    );
    const {
      defaultProductName,
      defaultSliceQty,
      defaultOrderType,
      defaultLotSize,
      defaultQty,
      defaultLMTPerCentage,
      defaultShowQty,
    } = { ...configInformation };
    let defaultLMTPer = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultLMTPerCentage;
    let positiontype = getSetting(
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate
    )?.defaultProductName;
    let orderprice =
      (positiontype === undefined ? "MKT" : positiontype) === "MKT"
        ? dataInfo.ltp
        : parseFloat(defaultLMTPer) > 0
        ? (dataInfo.positionsidetype === "BUY"
            ? "SELL"
            : "BUY"
          ).toLowerCase() === "buy"
          ? parseFloat(
              parseFloat(dataInfo.ltp) +
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
          : parseFloat(
              parseFloat(dataInfo.ltp) -
                (parseFloat(dataInfo.ltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
        : parseFloat(dataInfo.ltp);

    let data = {
      strikePrice: dataInfo.strikeprice,
      productname: dataInfo.positionproductname,
      ordertype: positiontype,
      expirydate: dataInfo.positionexpirydate,
      instrumentname: dataInfo.positioninstrumentname,
      orderside: dataInfo.positionordertype,
      orderqty: (
        (getSetting(
          dataInfo.positioninstrumentname,
          dataInfo.positionexpirydate
        ) != null
          ? parseInt(
              getSetting(
                dataInfo.positioninstrumentname,
                dataInfo.positionexpirydate
              ).defaultQty
            )
          : defaultQty) * parseInt(dataInfo.moveinoutqty)
      ).toString(),
      nooforderlot: dataInfo.moveinoutqty.toString(),
      maxorderqty: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultSliceQty.toString(),
      orderprice:
        (positiontype === undefined ? "MKT" : positiontype) === "MKT"
          ? dataInfo.ltp.toString()
          : (dataInfo.positionsidetype === "BUY"
              ? "SELL"
              : "BUY"
            ).toLowerCase() === "buy"
          ? parseFloat(orderprice) >= parseFloat(dataInfo.ltp)
            ? dataInfo.ltp.toString()
            : orderprice.toString()
          : parseFloat(orderprice) <= parseFloat(dataInfo.ltp)
          ? dataInfo.ltp.toString()
          : orderprice.toString(),
      tradermode: globleSelectedTradingType,
      orderidbybroker: "",
      clientid: globleSelectedClientInfo,
      lotsize: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultQty.toString(),
      instrumentToken: dataInfo.instrumentToken,
      orderaction: dataInfo.positionsidetype === "BUY" ? "SELL" : "BUY",
      stoploss: "0",
      target: "0",
      trailling: "0",
      orderexchangetoken: dataInfo.positionexchangetoken,
      orderstatus:
        (positiontype === undefined ? "MKT" : positiontype) === "MKT"
          ? "Completed"
          : (dataInfo.positionsidetype === "BUY"
              ? "SELL"
              : "BUY"
            ).toLowerCase() === "buy"
          ? parseFloat(orderprice) >= parseFloat(dataInfo.ltp)
            ? "Completed"
            : "Pending"
          : parseFloat(orderprice) <= parseFloat(dataInfo.ltp)
          ? "Completed"
          : "Pending",
      firstInInstrumentToken: dataInfo.firstInInstrumentToken.toString(),
      secondInInstrumentToken: dataInfo.secondInInstrumentToken.toString(),
      firstOutInstrumentToken: dataInfo.firstOutInstrumentToken.toString(),
      secondOutInstrumentToken: dataInfo.secondOutInstrumentToken.toString(),
      firstInStrike: dataInfo.firstInStrike.toString(),
      secondInStrike: dataInfo.secondInStrike.toString(),
      firstOutStrike: dataInfo.firstOutStrike.toString(),
      secondOutStrike: dataInfo.secondOutStrike.toString(),
      firstInExchangeToken: dataInfo.firstInExchangeToken.toString(),
      secondInExchangeToken: dataInfo.secondInExchangeToken.toString(),
      firstOutExchangeToken: dataInfo.firstOutExchangeToken.toString(),
      secondOutExchangeToken: dataInfo.secondOutExchangeToken.toString(),
      tradingSymbol: dataInfo.tradingSymbol,
      exchange: dataInfo.exchange,
      brokerName: globleBrokerName,
    };

    let currentStrike = "";
    let currentInstrumentToken = "";
    let currentExchangeToken = "";
    let currentltp = "";
    if (positionmovetype === "in") {
      currentStrike = dataInfo.secondInStrike.toString();
      currentInstrumentToken = dataInfo.secondInInstrumentToken.toString();
      currentExchangeToken = dataInfo.secondInExchangeToken.toString();
      currentltp = dataInfo.secondInltp;
    } else {
      currentStrike = dataInfo.secondOutStrike.toString();
      currentInstrumentToken = dataInfo.secondOutInstrumentToken.toString();
      currentExchangeToken = dataInfo.secondOutExchangeToken.toString();
      currentltp = dataInfo.secondOutltp;
    }

    let temptype = dataInfo.positionordertype;
    let dataNewStrick = Constant.GetNewStrike(
      dataInfo.positioninstrumentname,
      currentStrike,
      temptype
    );
    const {
      newFirstInStrike,
      newSecondInStrike,
      newFirstOutStrike,
      newSecondOutStrike,
    } = dataNewStrick;
    let newFirstInInstrumentToken = Constant.GetStrikeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newFirstInStrike,
      temptype
    );
    let newSecondInInstrumentToken = Constant.GetStrikeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newSecondInStrike,
      temptype
    );
    let newFirstOutInstrumentToken = Constant.GetStrikeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newFirstOutStrike,
      temptype
    );
    let newSecondOutInstrumentToken = Constant.GetStrikeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newSecondOutStrike,
      temptype
    );
    let newFirstInExchangeToken = Constant.GetStrikeExchangeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newFirstInStrike,
      temptype
    );
    let newSecondInExchangeToken = Constant.GetStrikeExchangeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newSecondInStrike,
      temptype
    );
    let newFirstOutExchangeToken = Constant.GetStrikeExchangeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newFirstOutStrike,
      temptype
    );
    let newSecondOutExchangeToken = Constant.GetStrikeExchangeToken(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      newSecondOutStrike,
      temptype
    );

    let orderpriceNew =
      (positiontype === undefined ? "MKT" : positiontype) === "MKT"
        ? dataInfo.ltp
        : parseFloat(defaultLMTPer) > 0
        ? dataInfo.positionsidetype.toLowerCase() === "buy"
          ? parseFloat(
              parseFloat(currentltp) +
                (parseFloat(currentltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
          : parseFloat(
              parseFloat(currentltp) -
                (parseFloat(currentltp) * parseFloat(defaultLMTPer)) / 100
            ).toFixed(2)
        : parseFloat(currentltp);

    let newCurrentTradingSymbol = Constant.GetTradaingSymbol(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      currentStrike,
      temptype
    );
    let newCurrentTradingExchange = Constant.GetStrikeExchange(
      globleOptionChainList,
      dataInfo.positioninstrumentname,
      dataInfo.positionexpirydate,
      currentStrike,
      temptype
    );

    let dataNew = {
      strikePrice: currentStrike,
      productname: dataInfo.positionproductname,
      ordertype: positiontype,
      expirydate: dataInfo.positionexpirydate,
      instrumentname: dataInfo.positioninstrumentname,
      orderside: dataInfo.positionordertype,
      orderqty: (
        (getSetting(
          dataInfo.positioninstrumentname,
          dataInfo.positionexpirydate
        ) != null
          ? parseInt(
              getSetting(
                dataInfo.positioninstrumentname,
                dataInfo.positionexpirydate
              ).defaultQty
            )
          : defaultQty) * parseInt(dataInfo.moveinoutqty)
      ).toString(),
      nooforderlot: dataInfo.moveinoutqty.toString(),
      maxorderqty: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultSliceQty.toString(),
      orderprice:
        (positiontype === undefined ? "MKT" : positiontype) === "MKT"
          ? currentltp.toString()
          : dataInfo.positionsidetype.toLowerCase() === "buy"
          ? parseFloat(orderpriceNew) >= parseFloat(currentltp)
            ? currentltp.toString()
            : orderpriceNew.toString()
          : parseFloat(orderpriceNew) <= parseFloat(currentltp)
          ? currentltp.toString()
          : orderpriceNew.toString(),
      tradermode: globleSelectedTradingType,
      orderidbybroker: "",
      clientid: globleSelectedClientInfo,
      lotsize: getSetting(
        dataInfo.positioninstrumentname,
        dataInfo.positionexpirydate
      ).defaultQty.toString(),
      instrumentToken: currentInstrumentToken,
      orderaction: dataInfo.positionsidetype,
      stoploss: "0",
      target: "0",
      trailling: "0",
      orderexchangetoken: currentExchangeToken,
      orderstatus:
        (positiontype === undefined ? "MKT" : positiontype) === "MKT"
          ? "Completed"
          : dataInfo.positionsidetype.toLowerCase() === "buy"
          ? parseFloat(orderpriceNew) >= parseFloat(currentltp)
            ? "Completed"
            : "Pending"
          : parseFloat(orderpriceNew) <= parseFloat(currentltp)
          ? "Completed"
          : "Pending",
      firstInInstrumentToken: newFirstInInstrumentToken.toString(),
      secondInInstrumentToken: newSecondInInstrumentToken.toString(),
      firstOutInstrumentToken: newFirstOutInstrumentToken.toString(),
      secondOutInstrumentToken: newSecondOutInstrumentToken.toString(),
      firstInStrike: newFirstInStrike.toString(),
      secondInStrike: newSecondInStrike.toString(),
      firstOutStrike: newFirstOutStrike.toString(),
      secondOutStrike: newSecondOutStrike.toString(),
      firstInExchangeToken: newFirstInExchangeToken.toString(),
      secondInExchangeToken: newSecondInExchangeToken.toString(),
      firstOutExchangeToken: newFirstOutExchangeToken.toString(),
      secondOutExchangeToken: newSecondOutExchangeToken.toString(),
      tradingSymbol: newCurrentTradingSymbol,
      exchange: newCurrentTradingExchange,
      brokerName: globleBrokerName,
    };
    const orderArray = [];
    orderArray.push(...[data, dataNew]);
    message =
      dataInfo.moveinoutqty.toString() +
      " Qty - Position " +
      dataInfo.positioninstrumentname +
      " " +
      dataInfo.strikeprice +
      " " +
      dataInfo.positionordertype +
      " moved to " +
      dataInfo.positioninstrumentname +
      " " +
      currentStrike +
      " " +
      dataInfo.positionordertype;

    processInsertUpdateOrderBulkMoveInOut(orderArray, message);
  };

  const handleRowClick = (e, index) => {
    setEditPositionRow(true);
    setEditPositionRowNo(index);
  };

  const handleKeyDownPosition = (e, index,data) => {
    
    if (e.key === "Enter" || e.key === "Tab") {
      if(!isValidDecimal(data.positionstoploss) && data.positionstoploss!==""){
        alertify.error("Stoploss value is invalid.");         
        return;
    }
    if(!isValidDecimal(data.positiontrailling) && data.positiontrailling!==""){
      alertify.error("Trail SL By value is invalid.");       
      return;
    }
    if(!isValidDecimal(data.positiontarget) && data.positiontarget!==""){
      alertify.error("Target value is invalid.");       
      return;
    }
      setEditPositionRow(false);
      setEditPositionRow("-1");
      processpositiontrailingData(data.positionid,data.positionstoploss,data.positiontrailling,data.positiontarget,data.ltp);
    }
  };

  return (
    <>
      <Card className="shadow">
        <CardHeader className="border-0">
          <Row className="align-items-center">
            <Col xl="2"  md="6" xs="12">
              <Input
                className="form-control-alternative"
                id="input-postal-code"
                placeholder="Search"
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </Col>
            <Col xl="3"  md="6" xs="12" style={{ height: "25px", lineHeight: "20px" }}>
              <label className="form-control-label" htmlFor="input-username">
                Unrealised MTM
              </label>
              <span
                className={
                  (mltUnrealized > 0
                    ? " text-success"
                    : mltUnrealized < 0
                    ? "text-danger"
                    : "text-data-secondary") + " m-1 font-14px  text-center"
                }
              >
                {mltUnrealized > 0 ? "+" : ""}
                {Constant.CurrencyFormat(mltUnrealized)}
              </span>
            </Col>
            <Col xl="1"  md="2" xs="4" className="stoplosstarget">
              <fieldset
                className="border"
                onClick={() => {
                  setSLEdit(true);
                }}
              >
                <legend align="right">StopLoss</legend>
                {!slEdit ? (
                  <label className="float-right">
                    {parseFloat(globalStopLoss) !== 0 && globalStopLoss !== "" 
                      ?  parseFloat(globalStopLoss).toFixed(2)
                      :  parseFloat(globalStopLoss) === 0 && parseFloat(globalTP) !== 0 ? parseFloat(globalStopLoss): "---"}
                  </label>
                ) : (
                  <Input
                    className="form-control-alternative text-right"
                    id="input-postal-code"
                    placeholder="SL"
                    type="number"
                    min="0"
                    name="globalStopLoss"
                    value={globalStopLoss}
                    onKeyDown={handleKeyDown}                   
                    onChange={(e) => {     
                          updateGlobalStopLoss(e.target.value);
                       
                    }}
                  />
                )}
              </fieldset>
            </Col>
            <Col xl="1"  md="2" xs="4" className="stoplosstarget">
              <fieldset
                className="border"
                onClick={() => {
                  setTragetEdit(true);
                }}
              >
                <legend align="right">Target</legend>

                {!tragetEdit ? (
                  <label className="float-right">
                    {parseFloat(globalTarget)  !== 0 && globalTarget !== "" 
                      ? parseFloat(globalTarget).toFixed(2)
                      : "---"}
                  </label>
                ) : (
                  <Input
                    className="form-control-alternative text-right"
                    id="input-postal-code"
                    placeholder="Trailing"
                    type="number"
                    min="0"
                    name="globalTarget"
                    value={globalTarget}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => {
                      updateGlobalTarget(e.target.value);
                    }}
                  />
                )}
              </fieldset>
            </Col>
            <Col xl="1" md="2" xs="4" className="stoplosstarget">
              <fieldset
                className="border"
                onClick={() => {
                  setTpEdit(true);
                }}
              >
                <legend align="right">Trail SL By</legend>
                {!tpEdit ? (
                  <label className="float-right">
                    {parseFloat(globalTP)  !== 0 && globalTarget !== "" 
                      ? parseFloat(globalTP).toFixed(2)
                      : "---"}
                  </label>
                ) : (
                  <Input
                    className="form-control-alternative text-right"
                    id="input-postal-code"
                    placeholder="TP"
                    type="number"
                    min="0"
                    name="globalTP"
                    onKeyDown={handleKeyDown}
                    value={globalTP}
                    onChange={(e) => {
                      updateGlobalTP(e.target.value);
                    }}
                  />
                )}
              </fieldset>
            </Col>

            <Col xl="4" md="6" xs="12" className="text-center">
              <Button
               disabled={                 
                isexecuteProcess
              }
                className="font-10px"
                color="danger"
                href="#pablo"
                onClick={(e) => handleExitAllPosition(e)}
                size="sm"
              >
                Exit All Positions
              </Button>
              <Button
                className="font-10px"
                color="danger"
                href="#pablo"
                onClick={(e) => handleExitAllOrder(e)}
                size="sm"
              >
                Exit All Orders
              </Button>
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          <Row>
            <Col xl="12 orderposition">
              <div className="table-container" style={{ height: height }}>
                <Table className="align-items-center">
                  <thead className="thead-light">
                    <tr className="text-center">
                      <th scope="col" style={{ width: "3%" }}>
                        Side
                      </th>
                      <th scope="col" style={{ width: "5%" }}>
                        Instrument
                      </th>
                      <th scope="col" style={{ width: "3%" }}>
                        Product
                      </th>
                      <th scope="col" style={{ width: "5%" }}>
                        Lot
                      </th>
                      <th scope="col" className="text-right" style={{ width: "4%" }}>
                        Avg Price
                      </th>
                      <th scope="col" className="text-right" style={{ width: "3%" }}>
                        LTP
                      </th>
                      <th scope="col" className="text-right" style={{ width: "5%" }}>
                        P&L
                      </th>
                      <th scope="col" style={{ width: "4%" }}>
                        Trailing
                      </th>
                      <th scope="col" style={{ width: "4%" }}>
                        Target
                      </th>
                      <th scope="col" style={{ width: "4%" }}>
                        StopLoss
                      </th>
                      <th scope="col" colSpan={3}>
                        Risk-ON&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Lot&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Risk-OFF
                      </th>
                      <th scope="col" style={{ width: "9%" }}>
                        Add
                      </th>
                      <th scope="col" style={{ width: "9%" }}>
                        Exit
                      </th>
                      <th scope="col" style={{ width: "5%" }}>
                        Reverse
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterOrderPosition !== undefined &&
                      filterOrderPosition !== null &&
                      filterOrderPosition.length > 0 &&
                      filterOrderPosition?.map((dataInfo, index) => {
                        if (dataInfo) {
                          return (
                              <tr key={index} className={dataInfo.positionordertype==='CE'?"ce-light":"pe-light"}>
                                <td className="text-center">
                                  <span
                                    className={
                                      dataInfo.positionsidetype.toLowerCase() ===
                                      "buy"
                                        ? "btn text-success text-bold buy-light"
                                        : "btn text-danger text-bold sell-light"
                                    }
                                  >
                                    {dataInfo.positionsidetype}
                                  </span>
                                </td>
                                <td className="text-left">
                                  {dataInfo.strikeprice === "0" ? (
                                    dataInfo.positioninstrumentname
                                  ) : (
                                    <>
                                      <strong>
                                        {" "}
                                        {dataInfo.positioninstrumentname}{" "}
                                      </strong>{" "}
                                      {Constant.ConvertShortDate(
                                        dataInfo.positionexpirydate
                                      )}{" "}
                                      {dataInfo.strikeprice}{" "}
                                      {dataInfo.positionordertype}
                                    </>
                                  )}
                                </td>
                                <td className="text-center">
                                  <span
                                    className={
                                      dataInfo.positionproductname.toLowerCase() ===
                                      "mis"
                                        ? "btn text-product-mis text-bold buy-light"
                                        : "btn text-product-nmrd text-bold sell-light"
                                    }
                                  >
                                    {dataInfo.positionproductname}
                                  </span>
                                </td>
                                <td className="text-center">
                                  {/* {dataInfo.positionnetqty} */}

                                  <fieldset className="border">
                                    <legend align="right">
                                      {parseInt(dataInfo.positionnetqty) < 0
                                        ? -1 * dataInfo.positionnetqty
                                        : dataInfo.positionnetqty}
                                    </legend>
                                    {dataInfo.positionnetlot}
                                  </fieldset>
                                </td>

                                <td className="text-right">
                                  {parseFloat(dataInfo.positionavgprice) < 0
                                    ? Constant.CurrencyFormat(
                                        dataInfo.positionavgprice
                                      )
                                    : Constant.CurrencyFormat(
                                        dataInfo.positionavgprice
                                      )}
                                </td>
                                <td className="text-right">
                                  {Constant.CurrencyFormat(dataInfo.ltp)}
                                </td>
                                <td
                                  className={
                                    parseFloat(dataInfo?.unrealisedpnl) > 0
                                      ? "text-success text-right"
                                      : parseFloat(dataInfo?.unrealisedpnl) < 0
                                      ? "text-danger text-right"
                                      : "text-data-secondary text-right"
                                  }
                                >
                                  {parseFloat(dataInfo.unrealisedpnl) < 0
                                    ? Constant.CurrencyFormat(dataInfo.unrealisedpnl)
                                    : parseFloat(dataInfo.unrealisedpnl) > 0
                                    ? "+" +
                                      Constant.CurrencyFormat(dataInfo.unrealisedpnl)
                                    : Constant.CurrencyFormat(dataInfo.unrealisedpnl)}
                                </td>
                                <td
                                  className="text-right"
                                  onClick={(e) => handleRowClick(e, index)}
                                >
                                  {editPositionRow === true &&
                                  editPositionRowNo === index ? (
                                    <Input
                                      className="form-control-alternative"
                                      id="input-position-trailling"
                                      placeholder="Trailling"
                                      type="number"
                                      min="1"
                                      onKeyDown={(e) =>
                                        handleKeyDownPosition(e, index,dataInfo)
                                      }
                                      value={         
                                          dataInfo.positiontrailling
                                      }
                                      onChange={(e) =>
                                        handdlePositionTrailling(e, index, dataInfo)
                                      }
                                      
                                    />
                                  ) : parseFloat(dataInfo.positiontrailling) !== 0 && dataInfo.positiontrailling !== "" ? (
                                        parseFloat(dataInfo.positiontrailling).toFixed(2)
                                    ) : (
                                        "---"
                                    )
                                }
                                </td>
                                <td
                                  className="text-right"
                                  onClick={(e) => handleRowClick(e, index)}
                                >
                                  {editPositionRow === true &&
                                  editPositionRowNo === index ? (
                                    <Input
                                      className="form-control-alternative"
                                      id="input-position-target"
                                      placeholder="Target"
                                      type="number"
                                      min="1"
                                      onKeyDown={(e) =>
                                        handleKeyDownPosition(e, index,dataInfo)
                                      }
                                      value={
                                       dataInfo.positiontarget
                                       }
                                      onChange={(e) =>
                                        handdlePositionTarget(e, index, dataInfo)
                                      }
                                      
                                    />
                                  ) :                              
                                  parseFloat(dataInfo.positiontarget) !== 0 && dataInfo.positiontarget !== "" ? (
                                        parseFloat(dataInfo.positiontarget).toFixed(2)
                                    ) : (
                                        "---"
                                    )
                                  
                                  
                                  }
                                </td>
                                <td
                                  className="text-right"
                                  onClick={(e) => handleRowClick(e, index)}
                                >
                                  {editPositionRow === true &&
                                  editPositionRowNo === index ? (
                                    <Input
                                      className="form-control-alternative"
                                      id="input-position-stoploss"
                                      placeholder="StopLoss"
                                      type="number"
                                      min="1"
                                      onKeyDown={(e) =>
                                        handleKeyDownPosition(e, index,dataInfo)
                                      }
                                      value={
                                      dataInfo.positionstoploss
                                      }
                                      onChange={(e) =>
                                        handdlePositionStopLoss(e, index, dataInfo)
                                      }
                                      
                                    />
                                  ) : 
                                   parseFloat(dataInfo.positionstoploss) !== 0 && dataInfo.positionstoploss !== "" ? (
                                        parseFloat(dataInfo.positionstoploss).toFixed(2)
                                    ) : (
                                        "---"
                                    )
                                   }
                                </td>

                                <td className="text-center" style={{ width: "4%" }}>
                                  {dataInfo.positionordertype.toLowerCase() ===
                                  "fut" ? (
                                    ""
                                  ) : (
                                    <div
                                      className="moveinout"
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <button
                                        className="btn btn-danger text-black  movein-light mr-1"
                                        disabled={
                                          !(parseFloat(dataInfo.secondInltp) > 0 && dataInfo.moveinoutqty > 0 && !isexecuteProcess)
                                        }                                         
                                        onClick={(e) =>
                                          handdleSecondPosition(dataInfo, "in")
                                        }
                                      >
                                        <b> {dataInfo.secondInStrike} </b>(
                                        {dataInfo.secondInltp})
                                      </button>
                                      <button
                                        className="btn btn-danger text-black  movein-light mr-1"
                                        disabled={
                                          !(parseFloat(dataInfo.firstInltp) > 0 && dataInfo.moveinoutqty > 0 && !isexecuteProcess)
                                        }                                           
                                        onClick={(e) =>
                                          handdleFirstPosition(dataInfo, "in")
                                        }
                                      >
                                        <b> {dataInfo.firstInStrike}</b> (
                                        {dataInfo.firstInltp})
                                      </button>
                                    </div>
                                  )}
                                </td>
                                <td className="text-center" style={{ width: "5%" }}>
                                  {dataInfo.positionordertype.toLowerCase() ===
                                  "fut" ? (
                                    "---"
                                  ) : (
                                    <fieldset className="border">
                                      <legend align="right">
                                        {dataInfo.moveinouttotalqty}
                                      </legend>
                                      <Input
                                        style={{padding:"0.74rem !important" ,textAlign:"center"}}
                                        className="form-control-alternative"
                                        id="input-postal-code"
                                        placeholder="Qty"
                                        type="number"
                                        min="1"
                                        value={dataInfo.moveinoutqty}
                                        onChange={(e) =>
                                          handdleMoveInOutQtyChange(
                                            e,
                                            index,
                                            dataInfo
                                          )
                                        }
                                      />
                                    </fieldset>
                                  )}
                                </td>
                                <td
                                  className="text-center moveinout"
                                  style={{ width: "4%" }}
                                >
                                  {dataInfo.positionordertype.toLowerCase() ===
                                  "fut" ? (
                                    ""
                                  ) : (
                                    <div
                                      className="moveinout"
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <button
                                        className="btn btn-success moveout-light text-black  mr-1"
                                        disabled={
                                          !(parseFloat(dataInfo.firstOutltp) > 0 && dataInfo.moveinoutqty > 0 && !isexecuteProcess)
                                        }
                                        onClick={(e) =>
                                          handdleFirstPosition(dataInfo, "out")
                                        }
                                      >
                                        <b> {dataInfo.firstOutStrike}</b> (
                                        {dataInfo.firstOutltp})
                                      </button>
                                      <button
                                        className="btn btn-success moveout-light text-black     ml-1"
                                        disabled={
                                          !(parseFloat(dataInfo.secondOutltp) > 0 && dataInfo.moveinoutqty > 0 && !isexecuteProcess)
                                        }                                       
                                        onClick={(e) =>
                                          handdleSecondPosition(dataInfo, "out")
                                        }
                                      >
                                        <b> {dataInfo.secondOutStrike}</b> (
                                        {dataInfo.secondOutltp})
                                      </button>
                                    </div>
                                  )}
                                </td>
                                <td className="text-center">
                                  <div className="form-group addexistnewqty">
                                    <button
                                      className={`btn hide btn-danger text-danger text-bold sell-light mr-0 ${
                                        parseFloat(dataInfo.ltp) < 0 ||
                                        dataInfo.ltp === undefined
                                          ? "disabled"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        handdleAddExistQty(dataInfo, "exit")
                                      }
                                      disabled={
                                        parseFloat(dataInfo.ltp) < 0 ||
                                        dataInfo.ltp === undefined
                                          ? true
                                          : false
                                      }
                                    >
                                      <i className="fas fa-close"></i>
                                    </button>
                                    <fieldset className="border">
                                      <legend align="right">
                                        {dataInfo.newaddtotalqty}
                                      </legend>
                                      <Input
                                      style={{width: "100%", padding:"0.74rem !important",textAlign:"center"}}
                                        className="form-control-alternative"
                                        
                                        id="input-postal-code"
                                        placeholder="Qty"
                                        type="number"
                                        min="1"
                                        value={dataInfo.newqty}
                                        onChange={(e) =>
                                          handdleNewQtyChange(e, index, dataInfo)
                                        }
                                      />
                                    </fieldset>
                                    <button
                                      className={`btn btn-success buy-light text-success text-bold ml-1 ${
                                        !parseFloat(dataInfo.ltp) ||
                                        !parseInt(dataInfo.newqty)
                                          ? "disabled"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        handdleAddExistQty(dataInfo, "add")
                                      }
                                      disabled={
                                        !parseFloat(dataInfo.ltp) ||
                                        !parseInt(dataInfo.newqty)||
                                        isexecuteProcess
                                      }
                                    >
                                      ADD
                                    </button>
                                  </div>
                                </td>
                                <td className="text-center">
                                  <div className="form-group">
                                    <fieldset className="border">
                                      <legend align="right">
                                        {dataInfo.exittotalqty}
                                      </legend>
                                      <Input
                                        style={{width: "100%", padding:"0.74rem !important" ,textAlign:"center"}}
                                        className="form-control-alternative"
                                        id="input-postal-code"
                                        placeholder="Qty"
                                        type="number"
                                        min="1"
                                        value={dataInfo.exitqty}
                                        onChange={(e) =>
                                          handdleExitQtyChange(e, index, dataInfo)
                                        }
                                      />
                                    </fieldset>
                                    <button
                                      className={`btn btn-danger text-danger text-bold sell-light ml-1 ${
                                        !parseFloat(dataInfo.ltp) ||
                                        !parseInt(dataInfo.exitqty)
                                          ? "disabled"
                                          : ""
                                      }`}
                                      disabled={
                                        !parseFloat(dataInfo.ltp) ||
                                        !parseInt(dataInfo.exitqty)||
                                        isexecuteProcess
                                      }
                                      onClick={() => handdleOrderExist(dataInfo)}
                                    >
                                      EXIT
                                    </button>
                                  </div>
                                </td>
                                <td className="text-center">
                                  <button
                                   disabled={                                     
                                    isexecuteProcess
                                  }
                                    className="btn btn-warning ml-1"
                                    onClick={() => handdleReverseOrderExist(dataInfo)}
                                  >
                                    REVERSE
                                  </button>
                                </td>
                              </tr>
                          );
                        }
                    })}
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </>
  );
};
export default AdminOrderPositionDetails;
