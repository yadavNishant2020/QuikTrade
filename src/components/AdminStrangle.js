import React, { useContext, useEffect, useState } from 'react' 
 
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
   import alertify from 'alertifyjs';
   import 'alertifyjs/build/css/alertify.css';
   import 'alertifyjs/build/css/themes/default.css';
   import { PostProvider,PostContext } from '../PostProvider.js';
   import { CookiesConfig } from "../Config/CookiesConfig.js";
   import { PaperTradingAPI } from "../api/PaperTradingAPI";
   import { LiveTradingAPI } from "../api/LiveTradingAPI"; 
   import { Constant } from "../Config/Constant";
const AdminStrangle = ({filterOptionChainList}) => {
    const [strikePrices,setStrikePrices]=useState(0);
    const [strangleList,setStrangleList]=useState([]);
    const [tempStraddleData,setTempStraddleData]=useState([]);
    
    const {  
        globleSymbol,
        globleExpityvalue,
        globleOptionListForSymbol,
        globleCurrentStockIndex,
        globleCurrentStockIndexFuture,
        updateGlobleOptionListForSymbol,
        globleCurrentATM,
        globleTabIndex,
        globleOptionChainType,
        globleSelectedClientInfo,
        globleSelectedTradingType,
        updateGlobleOrderList,
        updateGlobleOrderPosition,
        updateGlobleClosedList,
        globalStopLoss,
        globalTarget,
        globalTP,
        globleChangeDefaultSetting,
        globleOptionChainList,
        globleBrokerName
      } = useContext(PostContext); 

      useEffect(()=>{               
        if(globleCurrentATM>0){                  
          setStrikePrices(globleCurrentATM)       
        } 
      },[globleCurrentATM]); 

      useEffect(()=>{            
        
        if(filterOptionChainList?.length>0 && globleSymbol.length>0 && globleExpityvalue.length>0){ 
            
            const newoptionChainData=  filterOptionChainList.filter((data)=>data.name===globleSymbol && data.expiryDate===globleExpityvalue && data.tokenType==="opt").slice().sort((a, b) => {
                const strickComparison = parseFloat(a.strikePrice) - parseFloat(b.strikePrice);
                
                return strickComparison === 0 ? a.instrumentType.localeCompare(b.instrumentType) : strickComparison;
              });  

              var configData=JSON.parse(sessionStorage.getItem("defaultConfig"));
              let configInformation=configData.find((data)=>data.instrumentname===globleSymbol && data.expirydate===globleExpityvalue && data.clientId===globleSelectedClientInfo);
              const{instrumentname,defaultProductName,defaultSliceQty, defaultValidity, defaultOrderType,    defaultLotSize,       defaultQty,        defaultBrokerType, defaultShowQty}={...configInformation};
                    

              const updatedChainData = newoptionChainData.map((data) => ({
                ...data,
                celot: defaultLotSize || 1,
                celotqty: defaultShowQty || (1*data.lotSize),
                pelot: defaultLotSize || 1,
                pelotqty: defaultShowQty || (1*data.lotSize),
                totallot: defaultLotSize || 1,
                totallotqty: defaultShowQty || (1*data.lotSize),
              }));   

              setTempStraddleData(prevStraddleData => {
                // Merge the constant properties with the dynamic ones
                const mergedData = updatedChainData.map(data => ({
                  ...data,
                  celot: prevStraddleData.find(d => d.instrumentToken === data.instrumentToken)?.celot || data.celot,
                  celotqty: prevStraddleData.find(d => d.instrumentToken === data.instrumentToken)?.celotqty || data.celotqty,
                  pelot: prevStraddleData.find(d => d.instrumentToken === data.instrumentToken)?.pelot || data.pelot,
                  pelotqty: prevStraddleData.find(d => d.instrumentToken === data.instrumentToken)?.pelotqty || data.pelotqty,
                  totallot: prevStraddleData.find(d => d.instrumentToken === data.instrumentToken)?.totallot || data.totallot,
                  totallotqty: prevStraddleData.find(d => d.instrumentToken === data.instrumentToken)?.totallotqty || data.totallotqty,
                }));
          
                return mergedData;
              });
        } 
      },[filterOptionChainList,globleSymbol,globleExpityvalue,strikePrices,globleTabIndex]);
      
 
      

      useEffect(() => {    
        if(globleSelectedClientInfo.length>0){
          var configData=JSON.parse(sessionStorage.getItem("defaultConfig"));
          let configInformation=configData.find((data)=>data.instrumentname===globleSymbol && data.expirydate===globleExpityvalue && data.clientId===globleSelectedClientInfo);
          const{instrumentname,defaultProductName,defaultSliceQty, defaultValidity, defaultOrderType,    defaultLotSize,       defaultQty,        defaultBrokerType, defaultShowQty}={...configInformation};
          setStrangleList(prevStraddleData => {
            return prevStraddleData.map(rowData => {
               
              // Update each row here
              return {
                ...rowData,
                celot: defaultLotSize || 1,
                celotqty: defaultShowQty || (1*rowData.lotSize),
                pelot: defaultLotSize || 1,
                pelotqty: defaultShowQty || (1*rowData.lotSize),
                totallot: (2*defaultLotSize) || 2,
                totallotqty: (2*defaultShowQty) || (2*rowData.lotSize),
              };
            });
          });
        }
    },[globleSelectedClientInfo,globleChangeDefaultSetting])

      useEffect(()=>{  
         
        if(tempStraddleData?.length>0  && strikePrices>0){ 
             
            let strikeDiff=0;
            if(globleSymbol==="NIFTY"){
                    strikeDiff=50;
            }else  if(globleSymbol==="BANKNIFTY"){
                    strikeDiff=100;
            }else  if(globleSymbol==="FINNIFTY"){
                    strikeDiff=50;
            } else if(globleSymbol==="SENSEX"){
                    strikeDiff=100;
            } else if(globleSymbol==="MIDCPNIFTY"){
                    strikeDiff=25;
            }
            for(let i=1;i<=10;i++){
                 
                let callvalue =strikePrices+(i*strikeDiff);
                let putcalvalue=strikePrices+((-i)*strikeDiff);                
                let ceData=tempStraddleData.find((data)=>data.strikePrice===callvalue.toString() && data.instrumentType==='CE')
                let peData=tempStraddleData.find((data)=>data.strikePrice===putcalvalue.toString() && data.instrumentType==='PE')
                if(ceData!=null){                      
                        setStrangleList((previousData) => {
                              
                            if(previousData!=null){
                                    let isPresent = previousData?.find((data)=>data.instrumentType==='CE' && data.strikePrice===ceData.strikePrice);
                                    if(isPresent!==null && isPresent!==undefined){
                                         
                                        const updatedData = previousData.map((item) => {
                                            if (item.strikePrice === ceData.strikePrice && item.instrumentType === 'CE') {
                                              return {
                                                ...item,
                                                ltp: parseFloat(ceData.ltp).toFixed(2),
                                                atp: parseFloat(ceData.atp).toFixed(2),
                                              };
                                            }
                                            return item;
                                          });                                    
                                          return updatedData;
                                    }else{
                                        return [...previousData,ceData]
                                    }
                            }
                        })
                }
                if(peData!=null){
                    setStrangleList((previousData) => {                      
                                if(previousData!=null){ 
                                        let isPresent = previousData?.find((data)=>data.instrumentType==='PE' && data.strikePrice===peData.strikePrice);
                                        if(isPresent!==null && isPresent!==undefined){
                                            const updatedData = previousData.map((item) => {
                                                if (item.strikePrice === peData.strikePrice && item.instrumentType === 'PE') {
                                                  return {
                                                    ...item,
                                                    ltp: parseFloat(peData.ltp).toFixed(2),
                                                    atp: parseFloat(peData.atp).toFixed(2),
                                                  };
                                                }
                                                return item;
                                              });                                        
                                              return updatedData;
                                        }else{
                                            return [...previousData,peData]
                                        }
                            }
                    })
                }       

            }
            
        } 
      },[tempStraddleData,strikePrices]); 
      
      useEffect(()=>{  
                if(strangleList.length>0){
                        console.log(strangleList)
                } 
      },[strangleList])
      const handdleTextBoxEvent = (e, index,refType) => {
      
        let selectedValue = e.target.value;   
        // Update the state for the selected row
        setStrangleList((prevRowData) => {  
            let defaultLotSize= prevRowData[index]["lotSize"];
            let sizeMaxQty= prevRowData[index]["volumeFreeze"];
          if(refType==="celot"){ 
              
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
                prevRowData[index]["celotqty"]="0";
                let currentTotalQty=(parseInt(0)*defaultLotSize)+parseFloat(petotalqty);
                let currentTotalLot=parseInt(0)+parseFloat(pelot);
                // prevRowData[index]["totallotqty"]=currentTotalQty;
                // prevRowData[index]["totallot"]=currentTotalLot;
              }
          }else if(refType==="pelot"){
            let cetotalqty= prevRowData[index]["celotqty"];
             if(cetotalqty===""){
                cetotalqty="0";
             }
    
             let celot= prevRowData[index]["celot"];
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
                prevRowData[index]["pelotqty"]="0";
                let currentTotalQty=(parseInt(0)*defaultLotSize)+parseFloat(cetotalqty);
                let currentTotalLot=parseInt(0)+parseFloat(celot);
                // prevRowData[index]["totallotqty"]=currentTotalQty;
                // prevRowData[index]["totallot"]=currentTotalLot;
             }       
          }else{
            if(selectedValue>0){
                let currentTotalQty=(parseInt(selectedValue)*defaultLotSize);           
                    prevRowData[index][refType] =selectedValue;              
                    prevRowData[index]["totallotqty"]=parseInt(currentTotalQty);      
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
         let orderprice=(
          defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'? data.ltp:
            (parseFloat(defaultLMTPer)>0?
            side.toLowerCase()==='buy'?
            (parseFloat(parseFloat(data.ltp)+(parseFloat(data.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)):
            (parseFloat(parseFloat(data.ltp)-(parseFloat(data.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2))
            :parseFloat(data.ltp)) 
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
          (Math.round(Number(orderprice) * 20) / 20).toString()), 
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
      debugger;    
      console.log(data);
      var configData=JSON.parse(sessionStorage.getItem("defaultConfig"));
      let configInformation=configData.find((data)=>data.instrumentname===globleSymbol && data.expirydate===globleExpityvalue && data.clientId===globleSelectedClientInfo);
      const{  defaultProductName,   defaultSliceQty, 
        defaultOrderType,     defaultLotSize,       
        defaultQty,           defaultLMTPerCentage,
        defaultShowQty
       }={...configInformation};
       let defaultLMTPer=(defaultLMTPerCentage===undefined?0: defaultLMTPerCentage);
       let orderprice=(
        defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'? data.ltp:
          (parseFloat(defaultLMTPer)>0?
          side.toLowerCase()==='buy'?
          (parseFloat(parseFloat(data.ltp)+(parseFloat(data.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)):
          (parseFloat(parseFloat(data.ltp)-(parseFloat(data.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2))
          :parseFloat(data.ltp)) 
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
       let orderprice=(defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'? pedata.ltp:(parseFloat(defaultLMTPer)>0?
       side.toLowerCase()==='buy'?
       (parseFloat(parseFloat(pedata.ltp)+(parseFloat(pedata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)):
       (parseFloat(parseFloat(pedata.ltp)-(parseFloat(pedata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2))
       :parseFloat(pedata.ltp))
      
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
        (Math.round(Number(orderprice) * 20) / 20).toString()),  
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
                    secondOutExchangeToken:newSecondOutExchangeToken.toString(),
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
     let orderprice=(defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'? pedata.ltp:(parseFloat(defaultLMTPer)>0?
     side.toLowerCase()==='buy'?
     (parseFloat(parseFloat(pedata.ltp)+(parseFloat(pedata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)):
     (parseFloat(parseFloat(pedata.ltp)-(parseFloat(pedata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2))
     :parseFloat(pedata.ltp))
    
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
                      (parseFloat(orderprice)<=parseFloat(pedata.ltp)?'Completed':'Pending'))
                  ),
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
      (Math.round(Number(orderpricece) * 20) / 20).toString() ), 
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
    let orderpricepe=(
      defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'? pedata.ltp:
        (parseFloat(defaultLMTPer)>0?
        side.toLowerCase()==='buy'?
        (parseFloat(parseFloat(pedata.ltp)+(parseFloat(pedata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)):
        (parseFloat(parseFloat(pedata.ltp)-(parseFloat(pedata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2))
        :parseFloat(pedata.ltp))
  
  temptype='PE'
  let newFirstInStrike1=0;
  let newSecondInStrike1=0;
  let newFirstOutStrike1=0;
  let newSecondOutStrike1=0;
  dataNewStrick=Constant.GetNewStrike(globleSymbol,pedata.strikePrice,temptype);
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
      (Math.round(Number(orderpricepe) * 20) / 20).toString()),  
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
        secondOutExchangeToken:newSecondOutExchangeToken.toString() ,
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
    let orderpricepe=(
      defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'? pedata.ltp:
        (parseFloat(defaultLMTPer)>0?
        side.toLowerCase()==='buy'?
        (parseFloat(parseFloat(pedata.ltp)+(parseFloat(pedata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)):
        (parseFloat(parseFloat(pedata.ltp)-(parseFloat(pedata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2))
        :parseFloat(pedata.ltp))
  
  temptype='PE'
  let newFirstInStrike1=0;
  let newSecondInStrike1=0;
  let newFirstOutStrike1=0;
  let newSecondOutStrike1=0;
  dataNewStrick=Constant.GetNewStrike(globleSymbol,pedata.strikePrice,temptype);
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
        secondOutExchangeToken:newSecondOutExchangeToken.toString() ,
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

  
const processInsertUpdateOrder=async(requestOrderList)=>{  
  if(globleSelectedTradingType.toLowerCase()==="paper"){ 
      const resultData=await PaperTradingAPI.processInsertUpdateOrderPaper(requestOrderList);   
      if(resultData!=null){      
        alertify.success("Order added successfully.")
      }else{    
      }
    }else{
      let requestData={logintoken:sessionStorage.getItem("apiSecret"),orderitems:requestOrderList}
      const resultData=await LiveTradingAPI.processInsertUpdateOrderLive(requestData);        
      if(resultData!=null){           
        if(resultData==="true"){
          alertify.success("Order added successfully.")
        }else{
          alertify.error("Order rejected, Markets are closed right now.")
        } 
      }
    }
    
}

const processInsertUpdateOrderBulk=async(requestOrderList)=>{
  if(globleSelectedTradingType.toLowerCase()==="paper"){
      const resultData=await PaperTradingAPI.processInsertUpdateOrderBulk(requestOrderList);
      if(resultData!=null){      
        alertify.success("Order added successfully.")
      }else{
        
      }
}else{
        let dataInfo={
          logintoken:sessionStorage.getItem("apiSecret"),
          orderitems :requestOrderList
        }
        const resultData=await LiveTradingAPI.processInsertUpdateOrderBulkLive(dataInfo);
        if(resultData!=null){     
          if(resultData==="true"){
            alertify.success("Order added successfully.")
          }else{
            alertify.error("Order rejected, Markets are closed right now.")
          } 
        }else{
          
        }
  }
}

    return (
        <>
                <Card className="shadow">                          
                          <CardBody>
                          <Row>
                                            <Col xl="12" className='strangle'>
                                            <div className="table-container">
                                                    <Table className="align-items-center">
                                                                        <thead className="thead-light">
                                                                                    <tr class="text-center">
                                                                                        <th colSpan={5} className='bg bg-primary text-white' scope="col">CALL</th>
                                                                                        <th  className='bg bg-info text-white' colSpan={5}  scope="col">PUT</th>
                                                                                        <th  className='bg bg-success text-white' colSpan={5}  scope="col">COMBINE</th>
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
                                                                                                    <th scope="col" style={{width:"5%"}}>LTP</th>
                                                                                                    <th scope="col" style={{width:"5%"}}>ATP</th>   
                                                                                                    <th scope="col" style={{width:"5%"}}>LOT</th> 
                                                                                                    <th scope="col" style={{width:"10%"}}>Action</th> 
                                                                                    </tr>
                                                                        </thead>
                                                                         
                                                                        <tbody >
                                                                                {
                                                                                    strangleList.length>0?
                                                                                    strangleList.filter((dataInfo)=>dataInfo.name===globleSymbol && dataInfo.expiryDate===globleExpityvalue).map((data,index)=>
                                                                                        (index % 2 === 0? (
                                                                                            <tr className={parseFloat(data.strikePrice)===strikePrices?'selected-strike bg-warning-light text-center':'text-center'}>
                                                                                                <td scope="col" style={{width:"5%"}} className='text-center'>
                                                                                                    {data?.strikePrice}
                                                                                                </td>
                                                                                                <td scope="col" style={{width:"5%"}} className='text-center'>
                                                                                                    
                                                                                                    { data?.ltp?.toString() }
                                                                                                </td>  
                                                                                                <td scope="col" style={{width:"5%"}} className='text-center'>
                                                                                                    
                                                                                                    { data?.atp?.toString() }
                                                                                                </td>                                                                                     
                                                                                                <td scope="col" style={{width:"5%"}} className='text-center'>
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
                                                                                                <td scope="col" style={{width:"10%"}} className='text-center'>
                                                                                                       <button className={`btn btn-success buy-light text-success text-bold ${!parseFloat(data.ltp) || !parseInt(data.celot) ? 'disabled' : ''}`} 
                                                                                                        disabled={!parseFloat(data.ltp) || !parseInt(data.celot)}
                                                                                                       onClick={(e)=>handdleOrderInformationForCE(e,data,'Buy')}> BUY</button>
                                                                                                       <button className={`btn btn-danger text-danger text-bold sell-light ${!parseFloat(data.ltp) || !parseInt(data.celot) ? 'disabled' : ''}` }
                                                                                                        disabled={!parseFloat(data.ltp) || !parseInt(data.celot)}                                                                                                       
                                                                                                       onClick={(e)=>handdleOrderInformationForCE(e,data,'Sell')}>SELL</button>
                                                                                                </td>
                                                                                                <td scope="col" style={{width:"5%"}} className='text-center'>
                                                                                                    {strangleList[index+1]?.strikePrice}
                                                                                                </td>
                                                                                                <td scope="col" style={{width:"5%"}} className='text-center'>
                                                                                                    {  strangleList[index+1]?.ltp    }
                                                                                                    
                                                                                                </td>
                                                                                                <td scope="col" style={{width:"5%"}} className='text-center'>
                                                                                                {  strangleList[index+1]?.atp    }
                                                                                                </td>
                                                                                                <td scope="col" style={{width:"5%"}} className='text-center'>
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
                                                                                                <td scope="col" style={{width:"10%"}} className='text-center'>
                                                                                              
                                                                                                
                                                                                                        <button className={`btn btn-success buy-light text-success text-bold ${!parseFloat(data.ltp) || !parseInt(data.pelot) ? 'disabled' : ''}` }
                                                                                                        disabled={!parseFloat(data.ltp) || !parseInt(data.pelot)}                                                                                                          
                                                                                                        onClick={(e)=>handdleOrderInformationForPE(e,data,strangleList[index+1],'Buy','PE')}> BUY</button>
                                                                                                        <button className={`btn btn-danger text-danger text-bold sell-light ${!parseFloat(data.ltp) || !parseInt(data.pelot) ? 'disabled' : ''} `} 
                                                                                                        disabled={!parseFloat(data.ltp) || !parseInt(data.pelot)} 
                                                                                                        onClick={(e)=>handdleOrderInformationForPE(e,data,strangleList[index+1],'Sell','PE')}> SELL</button>
                                                                                                </td>
                                                                                              
                                                                                                <td scope="col" style={{width:"5%"}} className='text-center'>
                                                                                                    {parseFloat(parseFloat(data?.ltp)+parseFloat(strangleList[index+1]?.ltp)).toFixed(2)}
                                                                                                </td>
                                                                                                <td scope="col" style={{width:"5%"}} className='text-center'>
                                                                                                    {parseFloat(parseFloat(data?.atp)+parseFloat(strangleList[index+1]?.atp)).toFixed(2)}
                                                                                                </td>
                                                                                                <td scope="col" style={{width:"5%"}} className='text-center'>
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
                                                                                                onClick={(e)=>handdleOrderInformationForCombine(e,data,strangleList[index+1],'Buy')}> BUY</button>
                                                                                                        <button className={`btn btn-danger text-danger text-bold sell-light ${!parseFloat(data.ltp) || !parseInt(data.totallot) ? 'disabled' : ''}` } 
                                                                                                        disabled={!parseFloat(data.ltp) || !parseInt(data.totallot)}                                                                                                         
                                                                                                        onClick={(e)=>handdleOrderInformationForCombine(e,data,strangleList[index+1],'Sell')}> SELL</button>
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
export default AdminStrangle;