import React, { useContext, useEffect, useState,useRef } from 'react' 
 
import { Container, Row, Col,   Button,
   Card,
   CardHeader,
   CardBody,
   NavItem,
   NavLink,
   Nav,
   Progress,
   FormGroup,
   Input,
   Table } from "reactstrap";
   import Select from 'react-select'
   import { PostProvider,PostContext } from '../PostProvider.js';
   import alertify from 'alertifyjs';
   import 'alertifyjs/build/css/alertify.css';
   import 'alertifyjs/build/css/themes/default.css';
   import { CookiesConfig } from "../Config/CookiesConfig.js";
   import { PaperTradingAPI } from "../api/PaperTradingAPI"; 
   import { Constant } from "../Config/Constant";
const AdminStraddle = ({filterOptionChainList}) => {
    const tableRef = useRef(null);
    const [strikePrices,setStrikePrices]=useState(0)
    const [straddleData,setStraddleData]=useState([]);
    const [optionChainData,setOptionChainData]=useState([]);   
    const {  
        globleSymbol,
        globleExpityvalue,
        globleOptionListForSymbol,
        globleCurrentStockIndex,
        globleCurrentStockIndexFuture,
        updateGlobleOptionListForSymbol,
        globleCurrentATM,
        globleOptionChainType,
        globleTabIndex,
        globleSelectedClientInfo,
        globleSelectedTradingType,
        updateGlobleOrderList,
        updateGlobleOrderPosition,
        updateGlobleClosedList,
        globalStopLoss,
        globalTarget,
        globalTP,
        globleChangeDefaultSetting,
        screenSize,
        globleOptionChainList,
        globleBrokerName
      } = useContext(PostContext); 

 
      useEffect(()=>{               
        if(globleCurrentATM>0){                  
          setStrikePrices(globleCurrentATM)       
        } 
      },[globleCurrentATM]); 



      useEffect(() => {             
        if (filterOptionChainList?.length > 0) { 
          const newOptionChainData = filterOptionChainList
            .filter((data) => data.name === globleSymbol && data.expiryDate === globleExpityvalue && data.tokenType === "opt")
            .slice()
            .sort((a, b) => {
              const strickComparison = parseFloat(a.strikePrice) - parseFloat(b.strikePrice);
              return strickComparison === 0 ? a.instrumentType.localeCompare(b.instrumentType) : strickComparison;
            });     
            var configData=JSON.parse(sessionStorage.getItem("defaultConfig"));
            let configInformation=configData.find((data)=>data.instrumentname===globleSymbol && data.expirydate===globleExpityvalue && data.clientId===globleSelectedClientInfo);
            const{instrumentname,defaultProductName,defaultSliceQty, defaultValidity, defaultOrderType,    defaultLotSize,       defaultQty,        defaultBrokerType, defaultShowQty}={...configInformation};
                  
             
            const updatedChainData = newOptionChainData.map((data) => ({
              ...data,
              // celot: defaultLotSize || 1,
              // celotqty: defaultShowQty || (1*data.lotSize),
              // pelot: defaultLotSize || 1,
              // pelotqty: defaultShowQty || (1*data.lotSize),
              // totallot: (2*defaultLotSize) || 2,
              // totallotqty: (2*defaultShowQty) || (2*data.lotSize),
            }));   

            
         
      
          // Use the functional form of setStraddleData to ensure you're working with the latest state
          setStraddleData(prevStraddleData => {
            // Merge the constant properties with the dynamic ones
           
            const mergedData = updatedChainData.map(data => ({
              ...data,
              celot: prevStraddleData.find(d => d.instrumentToken === data.instrumentToken)?.celot || data.celot,
              celotqty: prevStraddleData.find(d => d.instrumentToken === data.instrumentToken)?.celotqty || data.celotqty,
              pelot: (prevStraddleData.find(d => d.instrumentToken === data.instrumentToken)?.pelot !== undefined)
                ? prevStraddleData.find(d => d.instrumentToken === data.instrumentToken)?.pelot
                : data.pelot,
              pelotqty: (prevStraddleData.find(d => d.instrumentToken === data.instrumentToken)?.pelotqty !== undefined)
                ? prevStraddleData.find(d => d.instrumentToken === data.instrumentToken)?.pelotqty
                : data.pelotqty,
              totallot: (prevStraddleData.find(d => d.instrumentToken === data.instrumentToken)?.totallot !== undefined)
                ? prevStraddleData.find(d => d.instrumentToken === data.instrumentToken)?.totallot
                : data.totallot,
              totallotqty: (prevStraddleData.find(d => d.instrumentToken === data.instrumentToken)?.totallotqty !== undefined)
                ? prevStraddleData.find(d => d.instrumentToken === data.instrumentToken)?.totallotqty
                : data.totallotqty,
            }));
            return mergedData;
          });
        } 
      }, [filterOptionChainList, globleSymbol, globleExpityvalue,globleTabIndex]);
      

      useEffect(() => {    
          if(globleSelectedClientInfo.length>0){
            var configData=JSON.parse(sessionStorage.getItem("defaultConfig"));
            let configInformation=configData.find((data)=>data.instrumentname===globleSymbol && data.expirydate===globleExpityvalue && data.clientId===globleSelectedClientInfo);
            const{instrumentname,defaultProductName,defaultSliceQty, defaultValidity, defaultOrderType,    defaultLotSize,       defaultQty,        defaultBrokerType, defaultShowQty}={...configInformation};
            setStraddleData(prevStraddleData => {
              return prevStraddleData.map(rowData => {
                debugger;
                // Update each row here
                return {
                  ...rowData,
                  celot: defaultLotSize || 1,
                  celotqty: defaultShowQty || (1*rowData.lotSize),
                  pelot: defaultLotSize || 1,
                  pelotqty: defaultShowQty || (1*rowData.lotSize),
                  totallot: defaultLotSize || 1,
                  totallotqty: defaultShowQty || (1*rowData.lotSize),
                };
              });
            });
          }
      },[globleSelectedClientInfo,globleChangeDefaultSetting])
  
      

      useEffect(()=>{      
                     
        if(strikePrices>0 && screenSize!=null){     
         
              const targetRow = tableRef.current.querySelector('div table tbody tr.selected-strike');          
              if (targetRow) {
                const rowIndex = Array.from(targetRow.parentNode.children).indexOf(targetRow);
                const tableRows = Array.from(tableRef.current.querySelectorAll('tbody tr'));
                const newtargetRow = tableRows[(rowIndex)-3];
                if(screenSize.height>551){
                  tableRef.current.scrollTop = newtargetRow.offsetTop-16;                 
                }else{
                  tableRef.current.scrollTop = newtargetRow.offsetTop-8;                 

                }   
              }    
      }
  },[strikePrices,screenSize])

  const handdleTextBoxEvent = (e, index,refType) => {
      
    let selectedValue = e.target.value;   
    // Update the state for the selected row
    setStraddleData((prevRowData) => {  
        debugger;
        let defaultLotSize= prevRowData[index]["lotSize"];
        let sizeMaxQty= prevRowData[index]["volumeFreeze"];
      if(refType==="celot"){ 
         debugger;
         let petotalqty= prevRowData[index]["pelotqty"];
         if(petotalqty===""){
            petotalqty="0";
         }

         let pelot= prevRowData[index]["pelot"];
         if(pelot===""){
            pelot="0";
         }
          if(selectedValue>0){
            let currentTotalQty=(parseInt(selectedValue)*defaultLotSize)+parseFloat(petotalqty);
            let currentTotalLot=parseInt(selectedValue)+parseFloat(pelot);
            prevRowData[index][refType] =selectedValue;              
            prevRowData[index]["celotqty"]=(parseInt(selectedValue)*defaultLotSize);
            // prevRowData[index]["totallotqty"]=currentTotalQty;
            // prevRowData[index]["totallot"]=currentTotalLot;
          }else{
            prevRowData[index][refType] ="";
            let currentTotalQty=(parseInt(0)*defaultLotSize)+parseFloat(petotalqty);
            let currentTotalLot=parseInt(0)+parseFloat(pelot);
            prevRowData[index]["celotqty"]="0";
            // prevRowData[index]["totallotqty"]=currentTotalQty;
            // prevRowData[index]["totallot"]=currentTotalLot;
          }
      }else if(refType==="pelot"){
        let cetotalqty= prevRowData[index-1]["celotqty"];
         if(cetotalqty===""){
            cetotalqty="0";
         }

         let celot= prevRowData[index-1]["celot"];
         if(celot===""){
            celot="0";
         }
            
         if(selectedValue>0){
            let currentTotalQty=(parseInt(selectedValue)*defaultLotSize)+parseFloat(cetotalqty);
            let currentTotalLot=parseInt(selectedValue)+parseFloat(celot);
            prevRowData[index][refType] =selectedValue;              
            prevRowData[index]["pelotqty"]=(parseInt(selectedValue)*defaultLotSize);
            // prevRowData[index]["totallotqty"]=currentTotalQty;
            // prevRowData[index]["totallot"]=currentTotalLot;          
         }else{
            prevRowData[index][refType] ="";
            let currentTotalQty=(parseInt(0)*defaultLotSize)+parseFloat(cetotalqty);
            prevRowData[index]["pelotqty"]="0";
            let currentTotalLot=parseInt(0)+parseFloat(celot);
            // prevRowData[index]["totallotqty"]=currentTotalQty;
            // prevRowData[index]["totallot"]=currentTotalLot;
         }       
      }else{
        if(selectedValue>0){
            let currentTotalQty=(parseInt(selectedValue)*defaultLotSize);           
            prevRowData[index][refType] =selectedValue;              
            prevRowData[index]["totallotqty"]=currentTotalQty;     
        }else{
                prevRowData[index][refType] ="";
                prevRowData[index]["totallotqty"]="0";
        }
      }     
      return prevRowData;
    });
  } 

  const handdleOrderInformationForCE=(e,data,side)=>{  
    if(globleSelectedTradingType.toLowerCase()==="paper"){
      handdleOrderInformationForCEPaper(e,data,side);
    }else{
      handdleOrderInformationForCELive(e,data,side);
    }
  }

  const handdleOrderInformationForCELive=(e,data,side)=>{    
    var configData=JSON.parse(sessionStorage.getItem("defaultConfig"));
    let configInformation=configData.find((data)=>data.instrumentname===globleSymbol && data.expirydate===globleExpityvalue && data.clientId===globleSelectedClientInfo);
    const{  defaultProductName,   defaultSliceQty, 
      defaultOrderType,     defaultLotSize,       
      defaultQty,           defaultLMTPerCentage,
      defaultShowQty
     }={...configInformation};
     let defaultLMTPer=(defaultLMTPerCentage===undefined?0: defaultLMTPerCentage);
     let temptype='CE'
     let dataNewStrick=Constant.GetNewStrike(globleSymbol,data.strikePrice,temptype);
     const{newFirstInStrike,newSecondInStrike,newFirstOutStrike,newSecondOutStrike}=dataNewStrick;
     let newFirstInInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstInStrike,temptype);
     let newSecondInInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondInStrike,temptype)
     let newFirstOutInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstOutStrike,temptype)
     let newSecondOutInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondOutStrike,temptype)
     let newFirstInExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstInStrike,temptype);
     let newSecondInExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondInStrike,temptype);
     let newFirstOutExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstOutStrike,temptype);
     let newSecondOutExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondOutStrike,temptype);
     let orderprice=(
      defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'? data.ltp:
        (parseFloat(defaultLMTPer)>0?
        side.toLowerCase()==='buy'?
        (parseFloat(parseFloat(data.ltp)+(parseFloat(data.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)):
        (parseFloat(parseFloat(data.ltp)-(parseFloat(data.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2))
        :parseFloat(data.ltp)) 
    let dataRequest={
      strikePrice:data.strikePrice,   
      productname:(defaultProductName===undefined?'MIS':defaultProductName),
      ordertype:(defaultOrderType===undefined?'MKT': defaultOrderType),
      expirydate:globleExpityvalue,
      instrumentname:globleSymbol,
      orderside:'CE',
      orderqty:data.celotqty.toString(),
      nooforderlot:data.celot.toString(),
      maxorderqty:defaultSliceQty.toString(),
      orderprice:((defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'?data.ltp.toString():
      orderprice.toString()),
      tradermode:globleSelectedTradingType,
      orderidbybroker:"" ,
      clientid:globleSelectedClientInfo,
      lotsize:defaultQty.toString(),
      instrumentToken:data.instrumentToken,
      orderaction:side.toUpperCase(),
      stoploss:globalStopLoss.toString(),
      target:globalTarget.toString(),
      trailling:globalTP.toString(),
      orderexchangetoken:data.exchangeToken,
      orderstatus:'Pending',
      firstInInstrumentToken:newFirstInInstrumentToken.toString(),
      secondInInstrumentToken:newSecondInInstrumentToken.toString(),
      firstOutInstrumentToken:newFirstOutInstrumentToken.toString(),
      secondOutInstrumentToken:newSecondOutInstrumentToken.toString(),
      firstInStrike:newFirstInStrike.toString(),
      secondInStrike:newSecondInStrike.toString(),
      firstOutStrike:newFirstOutStrike.toString(),
      secondOutStrike:newSecondOutStrike.toString(),            
      firstInExchangeToken:newFirstInExchangeToken.toString(),
      secondInExchangeToken:newSecondInExchangeToken.toString(),
      firstOutExchangeToken:newFirstOutExchangeToken.toString(),
      secondOutExchangeToken:newSecondOutExchangeToken.toString() ,
      tradingSymbol:data.tradingSymbol,
      exchange:data.exchange,
      brokerName:globleBrokerName
    }
    processInsertUpdateOrder(dataRequest);
}

  const handdleOrderInformationForCEPaper=(e,data,side)=>{      
        
      var configData=JSON.parse(sessionStorage.getItem("defaultConfig"));
      let configInformation=configData.find((data)=>data.instrumentname===globleSymbol && data.expirydate===globleExpityvalue && data.clientId===globleSelectedClientInfo);
      const{  defaultProductName,   defaultSliceQty, 
        defaultOrderType,     defaultLotSize,       
        defaultQty,           defaultLMTPerCentage,
        defaultShowQty
       }={...configInformation};
       let defaultLMTPer=(defaultLMTPerCentage===undefined?0: defaultLMTPerCentage);
       let temptype='CE'
       let dataNewStrick=Constant.GetNewStrike(globleSymbol,data.strikePrice,temptype);
       const{newFirstInStrike,newSecondInStrike,newFirstOutStrike,newSecondOutStrike}=dataNewStrick;
       let newFirstInInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstInStrike,temptype);
       let newSecondInInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondInStrike,temptype)
       let newFirstOutInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstOutStrike,temptype)
       let newSecondOutInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondOutStrike,temptype)
       let newFirstInExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstInStrike,temptype);
       let newSecondInExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondInStrike,temptype);
       let newFirstOutExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstOutStrike,temptype);
       let newSecondOutExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondOutStrike,temptype);
       let orderprice=(
        defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'? data.ltp:
          (parseFloat(defaultLMTPer)>0?
          side.toLowerCase()==='buy'?
          (parseFloat(parseFloat(data.ltp)+(parseFloat(data.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)):
          (parseFloat(parseFloat(data.ltp)-(parseFloat(data.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2))
          :parseFloat(data.ltp)) 
      let dataRequest={
        strikePrice:data.strikePrice,   
        productname:(defaultProductName===undefined?'MIS':defaultProductName),
        ordertype:(defaultOrderType===undefined?'MKT': defaultOrderType),
        expirydate:globleExpityvalue,
        instrumentname:globleSymbol,
        orderside:'CE',
        orderqty:data.celotqty.toString(),
        nooforderlot:data.celot.toString(),
        maxorderqty:defaultSliceQty.toString(),
        orderprice:((defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'?data.ltp.toString():
        (side.toLowerCase()==='buy'?
        (parseFloat(orderprice)>=parseFloat(data.ltp)?data.ltp.toString():orderprice.toString()):
        (parseFloat(orderprice)<=parseFloat(data.ltp)?data.ltp.toString():orderprice.toString()))),
        tradermode:globleSelectedTradingType,
        orderidbybroker:"" ,
        clientid:globleSelectedClientInfo,
        lotsize:defaultQty.toString(),
        instrumentToken:data.instrumentToken,
        orderaction:side.toUpperCase(),
        stoploss:globalStopLoss.toString(),
        target:globalTarget.toString(),
        trailling:globalTP.toString(),
        orderexchangetoken:data.exchangeToken,
        orderstatus:((defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'?'Completed':
        (side.toLowerCase()==='buy'?
        (parseFloat(orderprice)>=parseFloat(data.ltp)?'Completed':'Pending'):
        (parseFloat(orderprice)<=parseFloat(data.ltp)?'Completed':'Pending'))),
        firstInInstrumentToken:newFirstInInstrumentToken.toString(),
        secondInInstrumentToken:newSecondInInstrumentToken.toString(),
        firstOutInstrumentToken:newFirstOutInstrumentToken.toString(),
        secondOutInstrumentToken:newSecondOutInstrumentToken.toString(),
        firstInStrike:newFirstInStrike.toString(),
        secondInStrike:newSecondInStrike.toString(),
        firstOutStrike:newFirstOutStrike.toString(),
        secondOutStrike:newSecondOutStrike.toString(),            
        firstInExchangeToken:newFirstInExchangeToken.toString(),
        secondInExchangeToken:newSecondInExchangeToken.toString(),
        firstOutExchangeToken:newFirstOutExchangeToken.toString(),
        secondOutExchangeToken:newSecondOutExchangeToken.toString() ,
        tradingSymbol:data.tradingSymbol,
        exchange:data.exchange,
        brokerName:globleBrokerName
      }
      processInsertUpdateOrder(dataRequest);
  }

  const handdleOrderInformationForPE=(e,data,pedata,side)=>{      
    if(globleSelectedTradingType.toLowerCase()==="paper"){
      handdleOrderInformationForPEPaper(e,data,pedata,side);
    }else{
      handdleOrderInformationForPELive(e,data,pedata,side);
    }
  }
  
  const handdleOrderInformationForPELive=(e,data,pedata,side)=>{      
    console.log(data);
    var configData=JSON.parse(sessionStorage.getItem("defaultConfig"));
    let configInformation=configData.find((data)=>data.instrumentname===globleSymbol && data.expirydate===globleExpityvalue && data.clientId===globleSelectedClientInfo);
    const{  defaultProductName,   defaultSliceQty, 
      defaultOrderType,     defaultLotSize,       
      defaultQty,           defaultLMTPerCentage,
      defaultShowQty
     }={...configInformation};
     let defaultLMTPer=(defaultLMTPerCentage===undefined?0: defaultLMTPerCentage); 
     let temptype='PE'
     let dataNewStrick=Constant.GetNewStrike(globleSymbol,pedata.strikePrice,temptype);
     const{newFirstInStrike,newSecondInStrike,newFirstOutStrike,newSecondOutStrike}=dataNewStrick;
     let newFirstInInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstInStrike,temptype);
     let newSecondInInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondInStrike,temptype)
     let newFirstOutInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstOutStrike,temptype)
     let newSecondOutInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondOutStrike,temptype)
     let newFirstInExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstInStrike,temptype);
     let newSecondInExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondInStrike,temptype);
     let newFirstOutExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstOutStrike,temptype);
     let newSecondOutExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondOutStrike,temptype);

     let orderprice=(defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'? pedata.ltp:(parseFloat(defaultLMTPer)>0?
     side.toLowerCase()==='buy'?
     (parseFloat(parseFloat(pedata.ltp)+(parseFloat(pedata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)):
     (parseFloat(parseFloat(pedata.ltp)-(parseFloat(pedata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2))
     :parseFloat(pedata.ltp))

    let dataRequest={
      strikePrice:pedata.strikePrice,   
      productname:(defaultProductName===undefined?'MIS':defaultProductName),
      ordertype:(defaultOrderType===undefined?'MKT': defaultOrderType),
      expirydate:globleExpityvalue,
      instrumentname:globleSymbol,
      orderside:'PE',
      orderqty:data.pelotqty.toString(),
      nooforderlot:data.pelot.toString(),
      maxorderqty:defaultSliceQty.toString(),
      orderprice:((defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'?pedata.ltp.toString():
      orderprice.toString()),     
      tradermode:globleSelectedTradingType,
      orderidbybroker:"" ,
      clientid:globleSelectedClientInfo,
      lotsize:defaultQty.toString(),
      instrumentToken:pedata.instrumentToken,
      orderaction:side.toUpperCase(),
      stoploss:globalStopLoss.toString(),
      target:globalTarget.toString(),
      trailling:globalTP.toString(),
      orderexchangetoken:pedata.exchangeToken,
      orderstatus:'Pending',
      firstInInstrumentToken:newFirstInInstrumentToken.toString(),
        secondInInstrumentToken:newSecondInInstrumentToken.toString(),
        firstOutInstrumentToken:newFirstOutInstrumentToken.toString(),
        secondOutInstrumentToken:newSecondOutInstrumentToken.toString(),
        firstInStrike:newFirstInStrike.toString(),
        secondInStrike:newSecondInStrike.toString(),
        firstOutStrike:newFirstOutStrike.toString(),
        secondOutStrike:newSecondOutStrike.toString(),            
        firstInExchangeToken:newFirstInExchangeToken.toString(),
        secondInExchangeToken:newSecondInExchangeToken.toString(),
        firstOutExchangeToken:newFirstOutExchangeToken.toString(),
        secondOutExchangeToken:newSecondOutExchangeToken.toString() ,
        tradingSymbol:pedata.tradingSymbol,
        exchange:pedata.exchange,
        brokerName:globleBrokerName
    }
    processInsertUpdateOrder(dataRequest);
  }

  const handdleOrderInformationForPEPaper=(e,data,pedata,side)=>{      
    console.log(data);
    var configData=JSON.parse(sessionStorage.getItem("defaultConfig"));
    let configInformation=configData.find((data)=>data.instrumentname===globleSymbol && data.expirydate===globleExpityvalue && data.clientId===globleSelectedClientInfo);
    const{  defaultProductName,   defaultSliceQty, 
      defaultOrderType,     defaultLotSize,       
      defaultQty,           defaultLMTPerCentage,
      defaultShowQty
     }={...configInformation};
     let defaultLMTPer=(defaultLMTPerCentage===undefined?0: defaultLMTPerCentage); 
     let temptype='PE'
     let dataNewStrick=Constant.GetNewStrike(globleSymbol,pedata.strikePrice,temptype);
     const{newFirstInStrike,newSecondInStrike,newFirstOutStrike,newSecondOutStrike}=dataNewStrick;
     let newFirstInInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstInStrike,temptype);
     let newSecondInInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondInStrike,temptype)
     let newFirstOutInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstOutStrike,temptype)
     let newSecondOutInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondOutStrike,temptype)
     let newFirstInExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstInStrike,temptype);
     let newSecondInExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondInStrike,temptype);
     let newFirstOutExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstOutStrike,temptype);
     let newSecondOutExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondOutStrike,temptype);

     let orderprice=(defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'? pedata.ltp:(parseFloat(defaultLMTPer)>0?
     side.toLowerCase()==='buy'?
     (parseFloat(parseFloat(pedata.ltp)+(parseFloat(pedata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)):
     (parseFloat(parseFloat(pedata.ltp)-(parseFloat(pedata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2))
     :parseFloat(pedata.ltp))

    let dataRequest={
      strikePrice:pedata.strikePrice,   
      productname:(defaultProductName===undefined?'MIS':defaultProductName),
      ordertype:(defaultOrderType===undefined?'MKT': defaultOrderType),
      expirydate:globleExpityvalue,
      instrumentname:globleSymbol,
      orderside:'PE',
      orderqty:data.pelotqty.toString(),
      nooforderlot:data.pelot.toString(),
      maxorderqty:defaultSliceQty.toString(),
      orderprice:((defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'?pedata.ltp.toString():
                (side.toLowerCase()==='buy'?
                (parseFloat(orderprice)>=parseFloat(pedata.ltp)?pedata.ltp.toString():orderprice.toString()):
                (parseFloat(orderprice)<=parseFloat(pedata.ltp)?pedata.ltp.toString():orderprice.toString()))),     
      tradermode:globleSelectedTradingType,
      orderidbybroker:"" ,
      clientid:globleSelectedClientInfo,
      lotsize:defaultQty.toString(),
      instrumentToken:pedata.instrumentToken,
      orderaction:side.toUpperCase(),
      stoploss:globalStopLoss.toString(),
      target:globalTarget.toString(),
      trailling:globalTP.toString(),
      orderexchangetoken:pedata.exchangeToken,
      orderstatus:((defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'?'Completed':
      (side.toLowerCase()==='buy'?
      (parseFloat(orderprice)>=parseFloat(pedata.ltp)?'Completed':'Pending'):
      (parseFloat(orderprice)<=parseFloat(pedata.ltp)?'Completed':'Pending'))),
      firstInInstrumentToken:newFirstInInstrumentToken.toString(),
        secondInInstrumentToken:newSecondInInstrumentToken.toString(),
        firstOutInstrumentToken:newFirstOutInstrumentToken.toString(),
        secondOutInstrumentToken:newSecondOutInstrumentToken.toString(),
        firstInStrike:newFirstInStrike.toString(),
        secondInStrike:newSecondInStrike.toString(),
        firstOutStrike:newFirstOutStrike.toString(),
        secondOutStrike:newSecondOutStrike.toString(),            
        firstInExchangeToken:newFirstInExchangeToken.toString(),
        secondInExchangeToken:newSecondInExchangeToken.toString(),
        firstOutExchangeToken:newFirstOutExchangeToken.toString(),
        secondOutExchangeToken:newSecondOutExchangeToken.toString() ,
        tradingSymbol:pedata.tradingSymbol,
        exchange:pedata.exchange,
        brokerName:globleBrokerName
    }
    processInsertUpdateOrder(dataRequest);
  }

  const handdleOrderInformationForCombine=(e,data,pedata,side)=>{      
    if(globleSelectedTradingType.toLowerCase()==="paper"){
      handdleOrderInformationForCombinePaper(e,data,pedata,side);
    }else{
      handdleOrderInformationForCombineLive(e,data,pedata,side);
    }
  }

const handdleOrderInformationForCombineLive=(e,data,pedata,side)=>{  
  debugger;    
  const orderArray = [];
  var configData=JSON.parse(sessionStorage.getItem("defaultConfig"));
  let configInformation=configData.find((data)=>data.instrumentname===globleSymbol && data.expirydate===globleExpityvalue && data.clientId===globleSelectedClientInfo);
    const{  defaultProductName,   defaultSliceQty, 
      defaultOrderType,     defaultLotSize,       
      defaultQty,           defaultLMTPerCentage,
      defaultShowQty
     }={...configInformation};
     let defaultLMTPer=(defaultLMTPerCentage===undefined?0: defaultLMTPerCentage); 
     let temptype='CE'
     let dataNewStrick=Constant.GetNewStrike(globleSymbol,data.strikePrice,temptype);
     const{newFirstInStrike,newSecondInStrike,newFirstOutStrike,newSecondOutStrike}=dataNewStrick;
     let newFirstInInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstInStrike,temptype);
     let newSecondInInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondInStrike,temptype)
     let newFirstOutInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstOutStrike,temptype)
     let newSecondOutInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondOutStrike,temptype)
     let newFirstInExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstInStrike,temptype);
     let newSecondInExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondInStrike,temptype);
     let newFirstOutExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstOutStrike,temptype);
     let newSecondOutExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondOutStrike,temptype);

     let orderpricece=(
      defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'? data.ltp:
        (parseFloat(defaultLMTPer)>0?
        side.toLowerCase()==='buy'?
        (parseFloat(parseFloat(data.ltp)+(parseFloat(data.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)):
        (parseFloat(parseFloat(data.ltp)-(parseFloat(data.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2))
        :parseFloat(data.ltp)) 

  let dataRequestCE={
    strikePrice:data.strikePrice,   
    productname:(defaultProductName===undefined?'MIS':defaultProductName),
    ordertype:(defaultOrderType===undefined?'MKT': defaultOrderType),
    expirydate:globleExpityvalue,
    instrumentname:globleSymbol,
    orderside:'CE',
    totalorderqty:data.totallotqty.toString(),
    totalnooforderlot:data.totallot.toString(),
    maxorderqty:defaultSliceQty.toString(),
    orderprice:((defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'?data.ltp.toString():
    orderpricece.toString()), 
    tradermode:globleSelectedTradingType,
    orderidbybroker:"" ,
    clientid:globleSelectedClientInfo,
    lotsize:defaultQty.toString(),
    instrumentToken:data.instrumentToken,
    orderaction:side.toUpperCase(),
    stoploss:globalStopLoss.toString(),
    target:globalTarget.toString(),
    trailling:globalTP.toString(),
    orderexchangetoken:data.exchangeToken,
    orderstatus:'Pending',
    firstInInstrumentToken:newFirstInInstrumentToken.toString(),
        secondInInstrumentToken:newSecondInInstrumentToken.toString(),
        firstOutInstrumentToken:newFirstOutInstrumentToken.toString(),
        secondOutInstrumentToken:newSecondOutInstrumentToken.toString(),
        firstInStrike:newFirstInStrike.toString(),
        secondInStrike:newSecondInStrike.toString(),
        firstOutStrike:newFirstOutStrike.toString(),
        secondOutStrike:newSecondOutStrike.toString(),            
        firstInExchangeToken:newFirstInExchangeToken.toString(),
        secondInExchangeToken:newSecondInExchangeToken.toString(),
        firstOutExchangeToken:newFirstOutExchangeToken.toString(),
        secondOutExchangeToken:newSecondOutExchangeToken.toString(),
        tradingSymbol:data.tradingSymbol,
        exchange:data.exchange,
        brokerName:globleBrokerName
  }
  temptype='PE'
  dataNewStrick=Constant.GetNewStrike(globleSymbol,pedata.strikePrice,temptype);
   
  let newFirstInStrike1=0;
  let newSecondInStrike1=0;
  let newFirstOutStrike1=0;
  let newSecondOutStrike1=0;
  if(dataNewStrick!=null){
    newFirstInStrike1=dataNewStrick.newFirstInStrike;
    newSecondInStrike1=dataNewStrick.newSecondInStrike;
    newFirstOutStrike1=dataNewStrick.newFirstOutStrike;
    newSecondOutStrike1=dataNewStrick.newSecondOutStrike;
  }

  newFirstInInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstInStrike1,temptype);
  newSecondInInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondInStrike1,temptype)
  newFirstOutInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstOutStrike1,temptype)
  newSecondOutInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondOutStrike1,temptype)
  newFirstInExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstInStrike1,temptype);
  newSecondInExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondInStrike1,temptype);
  newFirstOutExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstOutStrike1,temptype);
  newSecondOutExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondOutStrike1,temptype);


  let orderpricepe=(defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'? pedata.ltp:(parseFloat(defaultLMTPer)>0?
     side.toLowerCase()==='buy'?
     (parseFloat(parseFloat(pedata.ltp)+(parseFloat(pedata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)):
     (parseFloat(parseFloat(pedata.ltp)-(parseFloat(pedata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2))
     :parseFloat(pedata.ltp))

  let dataRequestPE={
    strikePrice:pedata.strikePrice,   
    productname:(defaultProductName===undefined?'MIS':defaultProductName),
    ordertype:(defaultOrderType===undefined?'MKT': defaultOrderType),
    expirydate:globleExpityvalue,
    instrumentname:globleSymbol,
    orderside:'PE',
    totalorderqty:data.totallotqty.toString(),
    totalnooforderlot:data.totallot.toString(),
    maxorderqty:defaultSliceQty.toString(),
    orderprice:((defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'?pedata.ltp.toString():
    orderpricepe.toString()),   
    tradermode:globleSelectedTradingType,
    orderidbybroker:"" ,
    clientid:globleSelectedClientInfo,
    lotsize:defaultQty.toString(),
    instrumentToken:pedata.instrumentToken,
    orderaction:side.toUpperCase(),
    stoploss:globalStopLoss.toString(),
    target:globalTarget.toString(),
    trailling:globalTP.toString(),
    orderexchangetoken:pedata.exchangeToken,
    orderstatus:'Pending',
      firstInInstrumentToken:newFirstInInstrumentToken.toString(),
        secondInInstrumentToken:newSecondInInstrumentToken.toString(),
        firstOutInstrumentToken:newFirstOutInstrumentToken.toString(),
        secondOutInstrumentToken:newSecondOutInstrumentToken.toString(),
        firstInStrike:newFirstInStrike1.toString(),
        secondInStrike:newSecondInStrike1.toString(),
        firstOutStrike:newFirstOutStrike1.toString(),
        secondOutStrike:newSecondOutStrike1.toString(),            
        firstInExchangeToken:newFirstInExchangeToken.toString(),
        secondInExchangeToken:newSecondInExchangeToken.toString(),
        firstOutExchangeToken:newFirstOutExchangeToken.toString(),
        secondOutExchangeToken:newSecondOutExchangeToken.toString(),
        tradingSymbol:pedata.tradingSymbol,
        exchange:pedata.exchange,
        brokerName:globleBrokerName
  }
  orderArray.push(...[dataRequestCE, dataRequestPE]);
  const scopedUpdatedRowsArray = [];
    const updatedRows = [...orderArray];
        while (updatedRows.some((row) => row.totalorderqty > 0)) {
          updatedRows.forEach((row) => {   
            const clonedRow = { ...row }; 
            if(parseInt(clonedRow.totalorderqty)>= parseInt(defaultSliceQty)){              
              clonedRow.orderqty=defaultSliceQty.toString();
              clonedRow.nooforderlot=(parseInt(defaultSliceQty)/parseInt(defaultQty)).toString();
            }else{
              clonedRow.orderqty=row.totalorderqty.toString()
              clonedRow.nooforderlot=(parseInt(row.totalorderqty)/parseInt(defaultQty)).toString();
            }  
            scopedUpdatedRowsArray.push(clonedRow);
            row.totalorderqty = Math.max(0, parseInt(row.totalorderqty) - parseInt(defaultSliceQty));        
          });          
    }
    processInsertUpdateOrderBulk(scopedUpdatedRowsArray);
}
const handdleOrderInformationForCombinePaper=(e,data,pedata,side)=>{  
  debugger;    
  const orderArray = [];
  var configData=JSON.parse(sessionStorage.getItem("defaultConfig"));
  let configInformation=configData.find((data)=>data.instrumentname===globleSymbol && data.expirydate===globleExpityvalue && data.clientId===globleSelectedClientInfo);
    const{  defaultProductName,   defaultSliceQty, 
      defaultOrderType,     defaultLotSize,       
      defaultQty,           defaultLMTPerCentage,
      defaultShowQty
     }={...configInformation};
     let defaultLMTPer=(defaultLMTPerCentage===undefined?0: defaultLMTPerCentage); 
     let temptype='CE'
     let dataNewStrick=Constant.GetNewStrike(globleSymbol,data.strikePrice,temptype);
     const{newFirstInStrike,newSecondInStrike,newFirstOutStrike,newSecondOutStrike}=dataNewStrick;
     let newFirstInInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstInStrike,temptype);
     let newSecondInInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondInStrike,temptype)
     let newFirstOutInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstOutStrike,temptype)
     let newSecondOutInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondOutStrike,temptype)
     let newFirstInExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstInStrike,temptype);
     let newSecondInExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondInStrike,temptype);
     let newFirstOutExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstOutStrike,temptype);
     let newSecondOutExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondOutStrike,temptype);

     let orderpricece=(
      defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'? data.ltp:
        (parseFloat(defaultLMTPer)>0?
        side.toLowerCase()==='buy'?
        (parseFloat(parseFloat(data.ltp)+(parseFloat(data.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)):
        (parseFloat(parseFloat(data.ltp)-(parseFloat(data.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2))
        :parseFloat(data.ltp)) 

  let dataRequestCE={
    strikePrice:data.strikePrice,   
    productname:(defaultProductName===undefined?'MIS':defaultProductName),
    ordertype:(defaultOrderType===undefined?'MKT': defaultOrderType),
    expirydate:globleExpityvalue,
    instrumentname:globleSymbol,
    orderside:'CE',
    totalorderqty:data.totallotqty.toString(),
    totalnooforderlot:data.totallot.toString(),
    maxorderqty:defaultSliceQty.toString(),
    orderprice:((defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'?data.ltp.toString():
    (side.toLowerCase()==='buy'?
    (parseFloat(orderpricece)>=parseFloat(data.ltp)?data.ltp.toString():orderpricece.toString()):
    (parseFloat(orderpricece)<=parseFloat(data.ltp)?data.ltp.toString():orderpricece.toString()))), 
    tradermode:globleSelectedTradingType,
    orderidbybroker:"" ,
    clientid:globleSelectedClientInfo,
    lotsize:defaultQty.toString(),
    instrumentToken:data.instrumentToken,
    orderaction:side.toUpperCase(),
    stoploss:globalStopLoss.toString(),
    target:globalTarget.toString(),
    trailling:globalTP.toString(),
    orderexchangetoken:data.exchangeToken,
    orderstatus:((defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'?'Completed':
    (side.toLowerCase()==='buy'?
    (parseFloat(orderpricece)>=parseFloat(data.ltp)?'Completed':'Pending'):
    (parseFloat(orderpricece)<=parseFloat(data.ltp)?'Completed':'Pending'))),
    firstInInstrumentToken:newFirstInInstrumentToken.toString(),
        secondInInstrumentToken:newSecondInInstrumentToken.toString(),
        firstOutInstrumentToken:newFirstOutInstrumentToken.toString(),
        secondOutInstrumentToken:newSecondOutInstrumentToken.toString(),
        firstInStrike:newFirstInStrike.toString(),
        secondInStrike:newSecondInStrike.toString(),
        firstOutStrike:newFirstOutStrike.toString(),
        secondOutStrike:newSecondOutStrike.toString(),            
        firstInExchangeToken:newFirstInExchangeToken.toString(),
        secondInExchangeToken:newSecondInExchangeToken.toString(),
        firstOutExchangeToken:newFirstOutExchangeToken.toString(),
        secondOutExchangeToken:newSecondOutExchangeToken.toString(),
        tradingSymbol:data.tradingSymbol,
        exchange:data.exchange,
        brokerName:globleBrokerName
  }
  temptype='PE'
  dataNewStrick=Constant.GetNewStrike(globleSymbol,pedata.strikePrice,temptype);
   
  let newFirstInStrike1=0;
  let newSecondInStrike1=0;
  let newFirstOutStrike1=0;
  let newSecondOutStrike1=0;
  if(dataNewStrick!=null){
    newFirstInStrike1=dataNewStrick.newFirstInStrike;
    newSecondInStrike1=dataNewStrick.newSecondInStrike;
    newFirstOutStrike1=dataNewStrick.newFirstOutStrike;
    newSecondOutStrike1=dataNewStrick.newSecondOutStrike;
  }

  newFirstInInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstInStrike1,temptype);
  newSecondInInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondInStrike1,temptype)
  newFirstOutInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstOutStrike1,temptype)
  newSecondOutInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondOutStrike1,temptype)
  newFirstInExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstInStrike1,temptype);
  newSecondInExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondInStrike1,temptype);
  newFirstOutExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstOutStrike1,temptype);
  newSecondOutExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondOutStrike1,temptype);


  let orderpricepe=(defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'? pedata.ltp:(parseFloat(defaultLMTPer)>0?
     side.toLowerCase()==='buy'?
     (parseFloat(parseFloat(pedata.ltp)+(parseFloat(pedata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)):
     (parseFloat(parseFloat(pedata.ltp)-(parseFloat(pedata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2))
     :parseFloat(pedata.ltp))

  let dataRequestPE={
    strikePrice:pedata.strikePrice,   
    productname:(defaultProductName===undefined?'MIS':defaultProductName),
    ordertype:(defaultOrderType===undefined?'MKT': defaultOrderType),
    expirydate:globleExpityvalue,
    instrumentname:globleSymbol,
    orderside:'PE',
    totalorderqty:data.totallotqty.toString(),
    totalnooforderlot:data.totallot.toString(),
    maxorderqty:defaultSliceQty.toString(),
    orderprice:((defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'?pedata.ltp.toString():
    (side.toLowerCase()==='buy'?
    (parseFloat(orderpricepe)>=parseFloat(pedata.ltp)?pedata.ltp.toString():orderpricepe.toString()):
    (parseFloat(orderpricepe)<=parseFloat(pedata.ltp)?pedata.ltp.toString():orderpricepe.toString()))),   
    tradermode:globleSelectedTradingType,
    orderidbybroker:"" ,
    clientid:globleSelectedClientInfo,
    lotsize:defaultQty.toString(),
    instrumentToken:pedata.instrumentToken,
    orderaction:side.toUpperCase(),
    stoploss:globalStopLoss.toString(),
    target:globalTarget.toString(),
    trailling:globalTP.toString(),
    orderexchangetoken:pedata.exchangeToken,
    orderstatus:((defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'?'Completed':
      (side.toLowerCase()==='buy'?
      (parseFloat(orderpricepe)>=parseFloat(pedata.ltp)?'Completed':'Pending'):
      (parseFloat(orderpricepe)<=parseFloat(pedata.ltp)?'Completed':'Pending'))
      ),
      firstInInstrumentToken:newFirstInInstrumentToken.toString(),
        secondInInstrumentToken:newSecondInInstrumentToken.toString(),
        firstOutInstrumentToken:newFirstOutInstrumentToken.toString(),
        secondOutInstrumentToken:newSecondOutInstrumentToken.toString(),
        firstInStrike:newFirstInStrike1.toString(),
        secondInStrike:newSecondInStrike1.toString(),
        firstOutStrike:newFirstOutStrike1.toString(),
        secondOutStrike:newSecondOutStrike1.toString(),            
        firstInExchangeToken:newFirstInExchangeToken.toString(),
        secondInExchangeToken:newSecondInExchangeToken.toString(),
        firstOutExchangeToken:newFirstOutExchangeToken.toString(),
        secondOutExchangeToken:newSecondOutExchangeToken.toString(),
        tradingSymbol:pedata.tradingSymbol,
        exchange:pedata.exchange,
        brokerName:globleBrokerName
  }
  orderArray.push(...[dataRequestCE, dataRequestPE]);
  const scopedUpdatedRowsArray = [];
    const updatedRows = [...orderArray];
        while (updatedRows.some((row) => row.totalorderqty > 0)) {
          updatedRows.forEach((row) => {   
            const clonedRow = { ...row }; 
            if(parseInt(clonedRow.totalorderqty)>= parseInt(defaultSliceQty)){              
              clonedRow.orderqty=defaultSliceQty.toString();
              clonedRow.nooforderlot=(parseInt(defaultSliceQty)/parseInt(defaultQty)).toString();
            }else{
              clonedRow.orderqty=row.totalorderqty.toString()
              clonedRow.nooforderlot=(parseInt(row.totalorderqty)/parseInt(defaultQty)).toString();
            }  
            scopedUpdatedRowsArray.push(clonedRow);
            row.totalorderqty = Math.max(0, parseInt(row.totalorderqty) - parseInt(defaultSliceQty));        
          });          
    }
    processInsertUpdateOrderBulk(scopedUpdatedRowsArray);
}

const processInsertUpdateOrder=async(requestNewBucketList)=>{
  debugger;
  const resultData=await PaperTradingAPI.processInsertUpdateOrderPaper(requestNewBucketList);
  debugger;
  if(resultData!=null){ 
    // updateGlobleOrderList(resultData.orderitems);
    // updateGlobleOrderPosition(resultData.positionitems);
    // updateGlobleClosedList(resultData.closedresponseitem);
    alertify.success("Order added successfully.")
  }else{
    
  }
}

const processInsertUpdateOrderBulk=async(requestNewBucketList)=>{
  debugger;
  const resultData=await PaperTradingAPI.processInsertUpdateOrderBulkPaper(requestNewBucketList);
  debugger;
  if(resultData!=null){ 
    // updateGlobleOrderList(resultData.orderitems);
    // updateGlobleOrderPosition(resultData.positionitems);
    // updateGlobleClosedList(resultData.closedresponseitem);
    alertify.success("Order added successfully.")
  }else{
    
  }
}
    
    return (
        <>
                <Card className="shadow">
                          
                          <CardBody>
                          <Row>
                                            <Col className='Straddle' xl="12">
                                            <div className="table-container" ref={tableRef}>
                                            <Table className="align-items-center" >
                                                  <thead className="thead-light">
                                                                                <tr class="text-center">
                                                                                    <th colSpan={5} className='bg bg-primary text-white'>CALL</th>
                                                                                    <th colSpan={5} className='bg bg-info text-white'>PUT</th>
                                                                                    <th colSpan={5} className='bg bg-success text-white'>COMBINE</th>
                                                                                </tr>
                                                                                            <tr class="text-center">
                                                                                            
                                                                                
                                                                                    <th scope="col" style={{width:"5%"}}>Strike</th>   
                                                                                    <th scope="col" style={{width:"5%"}}>LTP</th> 
                                                                                    <th scope="col" style={{width:"5%"}}>ATP</th>                                                                               
                                                                                    <th scope="col" style={{width:"5%"}}>LOT</th>   
                                                                                    <th scope="col" style={{width:"10%"}}>Action</th>  
                                                                                    <th scope="col" style={{width:"5%"}}>Strike</th>
                                                                                    <th scope="col" style={{width:"5%"}}>LTP</th> 
                                                                                    <th scope="col" style={{width:"5%"}}>ATP</th>  
                                                                                    <th scope="col" style={{width:"5%"}}>LOT</th> 
                                                                                    <th scope="col" style={{width:"10%"}}>Action</th>  
                                                                                    <th scope="col" style={{width:"5%"}}>Strike</th>
                                                                                    <th scope="col" style={{width:"5%"}}>LTP</th>   
                                                                                    <th scope="col" style={{width:"5%"}}>ATP</th>                                                                              
                                                                                    <th scope="col" style={{width:"5%"}}>LOT</th> 
                                                                                    <th scope="col" style={{width:"10%"}}>Action</th>  
                                                                                    </tr>
                                                   </thead>
                                                      <tbody>
                                                                                {
                                                                                    straddleData.length>0?
                                                                                    straddleData.map((data,index)=>
                                                                                        (index % 2 === 0? (
                                                                                            <tr className={parseFloat(data.strikePrice)===strikePrices?'selected-strike bg-warning-light text-center':'text-center'}>
                                                                                                <td scope="col" style={{width:"5%"}} className={data.strikePrice<strikePrices?'bg-warning-light text-center':'text-center'}>
                                                                                                    {data?.strikePrice}
                                                                                                </td>
                                                                                                <td scope="col" style={{width:"5%"}} className={data.strikePrice<strikePrices?'bg-warning-light text-center':'text-center'}>
                                                                                                    
                                                                                                    { data?.ltp?.toString() }
                                                                                                </td>  
                                                                                                <td scope="col" style={{width:"5%"}} className={data.strikePrice<strikePrices?'bg-warning-light text-center':'text-center'}>
                                                                                                    
                                                                                                    { data?.atp?.toString() }
                                                                                                </td>                                                                                     
                                                                                                <td scope="col" style={{width:"5%"}} className={data.strikePrice<strikePrices?'bg-warning-light text-center':'text-center'}>
                                                                                                <fieldset className="border">
                                                                                   <legend align="right">{data.celotqty}</legend>
                                                                                
                                                                                  <Input
                                                                                        className="form-control-alternative form-row-data"
                                                                                        id="input-postal-code"
                                                                                        placeholder="LOT"                                                                
                                                                                        name="defaultQty"   
                                                                                        value={data.celot}  
                                                                                        type="number"
                                                                                        min="1"        
                                                                                        onChange={(e) =>handdleTextBoxEvent(e,index,"celot")} 
                                                                                                                                              
                                                                                    />
                                                                                 
                                                                                </fieldset>
                                                                                                </td>
                                                                                                <td scope="col" style={{width:"10%"}} className={data.strikePrice<strikePrices?'bg-warning-light text-center':'text-center'}>
                                                                                                        <button className={`btn btn-success buy-light text-success text-bold ${!parseFloat(data.ltp) || !parseInt(data.celot) ? 'disabled' : ''}`} 
                                                                                                        disabled={!parseFloat(data.ltp) || !parseInt(data.celot)}
                                                                                                        onClick={(e)=>handdleOrderInformationForCE(e,data,'Buy')}> BUY</button>
                                                                                                        <button className={`btn btn-danger text-danger text-bold sell-light ${!parseFloat(data.ltp) || !parseInt(data.celot) ? 'disabled' : ''}` }
                                                                                                        disabled={!parseFloat(data.ltp) || !parseInt(data.celot)}
                                                                                                        onClick={(e)=>handdleOrderInformationForCE(e,data,'Sell')}>SELL</button>
                                                                                                </td>
                                                                                                <td scope="col" style={{width:"5%"}} className={data.strikePrice>strikePrices?'bg-warning-light text-center':'text-center'}>
                                                                                                    {straddleData[index+1]?.strikePrice}
                                                                                                </td>
                                                                                                <td scope="col" style={{width:"5%"}} className={data.strikePrice>strikePrices?'bg-warning-light text-center':'text-center'}>
                                                                                                    {  straddleData[index+1]?.ltp    }
                                                                                                    
                                                                                                </td>
                                                                                                <td scope="col" style={{width:"5%"}} className={data.strikePrice>strikePrices?'bg-warning-light text-center':'text-center'}>
                                                                                                {  straddleData[index+1]?.atp    }
                                                                                                </td>
                                                                                                <td scope="col" style={{width:"5%"}} className={data.strikePrice>strikePrices?'bg-warning-light text-center':'text-center'}>
                                                                                                    <fieldset className="border">
                                                                                                        <legend align="right">{data.pelotqty}</legend>
                                                                                                        
                                                                                                        <Input
                                                                                                                className="form-control-alternative form-row-data"
                                                                                                                id="input-postal-code"
                                                                                                                placeholder="LOT"                                                                
                                                                                                                name="defaultQty"   
                                                                                                                value={data.pelot}  
                                                                                                                type="number"
                                                                                                                min="1"        
                                                                                                                onChange={(e) =>handdleTextBoxEvent(e,index,"pelot")} 
                                                                                                                                                                    
                                                                                                            />
                                                                                                        
                                                                                                    </fieldset>
                                                                                                </td>
                                                                                                <td scope="col" style={{width:"10%"}} className={data.strikePrice>strikePrices?'bg-warning-light text-center':'text-center'}>
                                                                                                        <button className={`btn btn-success buy-light text-success text-bold ${!parseFloat(data.ltp) || !parseInt(data.pelot) ? 'disabled' : ''}` }
                                                                                                        disabled={!parseFloat(data.ltp) || !parseInt(data.pelot)}                                                                                                        
                                                                                                        onClick={(e)=>handdleOrderInformationForPE(e,data,straddleData[index+1],'Buy','PE')}> BUY</button>
                                                                                                        <button className={`btn btn-danger text-danger text-bold sell-light ${!parseFloat(data.ltp) || !parseInt(data.pelot) ? 'disabled' : ''} `} 
                                                                                                        disabled={!parseFloat(data.ltp) || !parseInt(data.pelot)}                                                                                                        
                                                                                                        onClick={(e)=>handdleOrderInformationForPE(e,data,straddleData[index+1],'Sell','PE')}> SELL</button>
                                                                                                </td>
                                                                                                <td scope="col" style={{width:"5%"}} className='text-center'>
                                                                                                    {parseInt(data?.strikePrice)}
                                                                                                </td>
                                                                                                <td scope="col" style={{width:"5%"}} className='text-center'>
                                                                                                    {parseFloat(parseFloat(data?.ltp)+parseFloat(straddleData[index+1]?.ltp)).toFixed(2)}
                                                                                                </td>
                                                                                                <td scope="col" style={{width:"5%"}} className='text-center'>
                                                                                                    {parseFloat(parseFloat(data?.atp)+parseFloat(straddleData[index+1]?.atp)).toFixed(2)}
                                                                                                </td>
                                                                                                <td scope="col"  style={{width:"5%"}} className='text-center'>
                                                                                                <fieldset className="border">
                                                                                                        <legend align="right">{data.totallotqty}</legend>
                                                                                                        
                                                                                                        <Input
                                                                                                                className="form-control-alternative form-row-data"
                                                                                                                id="input-postal-code"
                                                                                                                placeholder="LOT"                                                                
                                                                                                                name="defaultQty"   
                                                                                                                value={data.totallot} 
                                                                                                                type="number"
                                                                                                                min="1"         
                                                                                                                onChange={(e) =>handdleTextBoxEvent(e,index,"totallot")} 
                                                                                                                                                                    
                                                                                                            />
                                                                                                        
                                                                                                    </fieldset>
                                                                                                </td>
                                                                                                <td scope="col" style={{width:"10%"}} className='text-center'>
                                                                                                        <button className={`btn btn-success buy-light text-success text-bold ${!parseFloat(data.ltp) || !parseInt(data.totallot) ? 'disabled' : ''}` } 
                                                                                                        disabled={!parseFloat(data.ltp) || !parseInt(data.totallot)}  
                                                                                                        onClick={(e)=>handdleOrderInformationForCombine(e,data,straddleData[index+1],'Buy')}> BUY</button>
                                                                                                        <button className={`btn btn-danger text-danger text-bold sell-light ${!parseFloat(data.ltp) || !parseInt(data.totallot) ? 'disabled' : ''}` } 
                                                                                                        disabled={!parseFloat(data.ltp) || !parseInt(data.totallot)}  
                                                                                                        onClick={(e)=>handdleOrderInformationForCombine(e,data,straddleData[index+1],'Sell')}> SELL</button>
                                                                                                </td>
                                                                                            
                                                                                            </tr>

                                                                                        ):"")
                                                                                    ):""
                                                                                }
                                                                                </tbody>
                                                                </Table>
                                                    </div>
                                            </Col>
                            </Row>
                            
                          </CardBody>
                </Card>
        </>
    )
}
export default AdminStraddle;