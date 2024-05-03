import React, { useEffect, useState,useRef, useContext } from 'react' 
import Switch from "react-switch";
import Centrifuge from 'centrifuge';
import CustomSwitch from '../CustomSwitch/CustomSwitch.js';
import { CookiesConfig } from '../Config/CookiesConfig.js';
 
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
   Table, 
   CardFooter} from "reactstrap";
   import Select from 'react-select'
   import { PostProvider,PostContext } from '../PostProvider.js';
   import { ZerodaAPI } from "../api/ZerodaAPI";
   import { PaperTradingAPI } from "../api/PaperTradingAPI";   
   import { LiveTradingAPI } from "../api/LiveTradingAPI";      
   import alertify from 'alertifyjs';
   import 'alertifyjs/build/css/alertify.css';
   import 'alertifyjs/build/css/themes/default.css'; 
   import { Constant } from "../Config/Constant";
import { data } from 'jquery';
   

const AdminOptionChain = ({filterOptionChainList, height}) => {
  const optionsInfo = [
    {
        label: "Option",
        value: 'opt',
        selectedBackgroundColor: "#5e72e4",
    },
    {
        label: "Future",
        value: "future",        
        selectedBackgroundColor: "#5e72e4",
    }
 ];
    const tableRef = useRef(null);
    const [strikePrices,setStrikePrices]=useState(0)
    const [sortedCurrentOptionChain,setsortedCurrentOptionChain]=useState([]);
    const [switchState,setSwitchState]=useState(false)
    const [bucketList,setBucketList]=useState([])
    const [busketMargin,setBusketMargin]=useState(0)
    const [requiredBusketMargin,setRequiredBusketMargin]=useState(0)  
    const [scrollHeight, setScrollHeight] = useState(160); 
    const [quickBuySell,setQuickBuySell]=useState(false);
    const [editBucketRow,setEditBucketRow]=useState(false);
    const [editBucketRowNo,setEditBucketRowNo]=useState('-1'); 
    const [optionChainData,setOptionChainData]=useState([])
    const [startWebStocket,setStartWebStocket]=useState(0)
    const [processArray,setProcessArray]=useState([])
    const [diableBasketExecute,setDiableBasketExecute]=useState(false)

    const {  
      globleSymbol,
      globleExpityvalue,
      globleTabIndex,      
      globleCurrentATM,
      updatGlobleOptionChainType,
      globleOptionChainType,     
      globleOptionChainList,
      globalStopLoss,
      globalTarget,       
      globalTP,
      globleSelectedClientInfo,
      globleSelectedTradingType,    
      globalConfigPostionData,
      globleBrokerName
    } = useContext(PostContext); 

    const sideOptions= [
      { value: 'BUY', label: 'BUY' }   ,   
      { value: 'SELL', label: 'SELL' }  
    ]

    const typeOptions= [
      { value: 'CE', label: 'CE' }   ,   
      { value: 'PE', label: 'PE' }  
    ]

    const orderTypeOption = [
      { value: 'MKT', label: 'MKT' }   ,   
      { value: 'LMT', label: 'LMT' }   ,        
    ]
   
    const productOptions = [
      { value: 'MIS', label: 'MIS' }   ,   
      { value: 'NRML', label: 'NRML' }   ,

    ]
      const handleChange=()=>{
        CookiesConfig.setCookie("switchState",!switchState);
        setSwitchState((switchState)=>!switchState); 
      }

    
      // const handleQuickBuySell=()=>{
      //   setQuickBuySell(quickBuySell=>!quickBuySell)
      // }

      useEffect(()=>{ 
        
        if(filterOptionChainList?.length>0 && globleOptionChainType.length>0){ 
          if(globleOptionChainType==='opt'){     
                const newoptionChainData=  filterOptionChainList.filter((data)=>data.name===globleSymbol && data.expiryDate===globleExpityvalue && data.tokenType===globleOptionChainType).slice().sort((a, b) => {
                const strickComparison = a.strikePrice - b.strikePrice;
                  return strickComparison === 0 ? a.instrumentType.localeCompare(b.instrumentType) : strickComparison;
                });
                setOptionChainData(newoptionChainData);
          }else{
              const newoptionChainData=  filterOptionChainList.filter((data)=>data.name===globleSymbol && data.tokenType===globleOptionChainType).slice().sort((a, b) => {
              const strickComparison = a.strikePrice - b.strikePrice;
                return strickComparison === 0 ? a.instrumentType.localeCompare(b.instrumentType) : strickComparison;
              });
              setOptionChainData(newoptionChainData);
          }
        } 
      },[filterOptionChainList,globleSymbol,globleExpityvalue,strikePrices,globleOptionChainType]); 


      useEffect(()=>{             
        if(optionChainData?.length>0){   
          setProcessArray(optionChainData.map((data)=>({instrumentToken:data.instrumentToken})))       
        } 
      },[optionChainData]); 


      useEffect(()=>{               
        if(globleCurrentATM>0){                  
          setStrikePrices(globleCurrentATM)       
        } 
      },[globleCurrentATM]); 

   
      useEffect(()=>{             
          setOptionChainData([]);
          updatGlobleOptionChainType('opt');
          debugger;
          let switchState=false;
          if(CookiesConfig.getCookie("switchState")===null){
            CookiesConfig.setCookie("switchState",false);
          }else if(CookiesConfig.getCookie("switchState").toString().toLowerCase()==="true"){
            switchState=true;
          }else{
            switchState=false;
          }
          setSwitchState(switchState); 
          
      },[]); 
      
      useEffect(()=>{  
        if(globleSelectedTradingType.length>0 && globleSelectedClientInfo.length>0){ 
            debugger;
            let basketName="basketName_"+globleSelectedTradingType+globleSelectedClientInfo;
            if(CookiesConfig.getItemWithExpiry(basketName).length>0){           
                  var busketList=JSON.parse(CookiesConfig.getItemWithExpiry(basketName));
                  debugger;
                  var filterbasket=busketList.filter((data)=>data.basketTraderMode===globleSelectedTradingType
                                    && data.basketClient===globleSelectedClientInfo)
                  if(filterbasket.length>0){
                    setBucketList(filterbasket);
                   // processBasketMargin(filterbasket);   
                  }else{
                    setBucketList([]);
                    //processBasketMargin([]);   
                  }
                          
            }else{
              setBucketList([]);
              //processBasketMargin([]);   
            }
      }
    },[globleSelectedClientInfo,globleSelectedTradingType]); 

      useEffect(()=>{  
        if(bucketList!==null){
         if(bucketList?.length>0){          
            bucketList.map((data)=>{              
                let dataLTP=filterOptionChainList.find((dataList)=>dataList.instrumentToken===data?.instrumentToken);
                if(dataLTP!=null){
                  data.bucketStickePrice= (data.bucketOrderType==='MKT'?dataLTP.ltp:data.bucketStickePrice);
                  data.bucketltp=dataLTP.ltp
                }
            })
         }
        }
    },[bucketList,globleTabIndex]); 

      


      useEffect(()=>{             
        if(optionChainData?.length>0){  
              const newoptionChainData=  optionChainData.slice().sort((a, b) => {
                const strickComparison = parseFloat(a.strikePrice) - parseFloat(b.strikePrice);                
                return strickComparison === 0 ? a.instrumentType.localeCompare(b.instrumentType) : strickComparison;
              });  
              setsortedCurrentOptionChain(newoptionChainData); 
        } 
      },[optionChainData]); 


      useEffect(()=>{                   
          if(strikePrices>0 && globleOptionChainType==='opt'){                   
                const targetRow = tableRef.current.querySelector('div table tbody tr.selected-strike');          
                if (targetRow) {
                  const rowIndex = Array.from(targetRow.parentNode.children).indexOf(targetRow);
                  const tableRows = Array.from(tableRef.current.querySelectorAll('tbody tr'));
                  const newtargetRow = tableRows[(rowIndex)-3];                   
                  tableRef.current.scrollTop = newtargetRow?.offsetTop+8;                 
                }    
        }
    },[strikePrices,sortedCurrentOptionChain])


      const customStyles = {   
        control: (provided) => ({
          ...provided,
          height: '25px', // Set the height for the control (input)
          fontSize: '9px',
          minHeight: '25px',
          
        }),
        menu: (provided) => ({
          ...provided,
          fontSize: '9px',
          minHeight: '25px',
        }),
    };


    const customStylesForTable = {   
      control: (provided) => ({
        ...provided,
        height: '25px', // Set the height for the control (input)
        fontSize: '9px',
        minHeight: '25px',
        width: '100%'
        
      }),
      menu: (provided) => ({
        ...provided,
        fontSize: '9px',
        minHeight: '25px',
      }),
  };



  
    

  const handleBasketQuickBuySell=(chaindata,type,side)=>{ 
      debugger;
      let temptype='';
      if(type==='Call'){
        temptype='CE';
      }else{
        temptype='PE'
      }      
      let dataNewStrick=Constant.GetNewStrike(globleSymbol,chaindata.strikePrice,temptype);
      const{newFirstInStrike,newSecondInStrike,newFirstOutStrike,newSecondOutStrike}=dataNewStrick;
      let newFirstInInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstInStrike,temptype);
      let newSecondInInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondInStrike,temptype)
      let newFirstOutInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstOutStrike,temptype)
      let newSecondOutInstrumentToken=Constant.GetStrikeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondOutStrike,temptype)
      let newFirstInExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstInStrike,temptype);
      let newSecondInExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondInStrike,temptype);
      let newFirstOutExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newFirstOutStrike,temptype);
      let newSecondOutExchangeToken=Constant.GetStrikeExchangeToken(globleOptionChainList,globleSymbol,globleExpityvalue,newSecondOutStrike,temptype);
      let expiryNewDate=(globleOptionChainType==='opt'?globleExpityvalue: chaindata.expiry.split('T')[0])
      var configData=JSON.parse(sessionStorage.getItem("defaultConfig"));
      let configInformation=configData.find((data)=>data.instrumentname===globleSymbol && data.expirydate===globleExpityvalue && data.clientId===globleSelectedClientInfo && data.defaultTradingMode===sessionStorage.getItem("tradingtype"));
      const{  defaultProductName,   defaultSliceQty, 
              defaultOrderType,     defaultLotSize,       
              defaultQty,           defaultLMTPerCentage,
              defaultShowQty
          }={...configInformation};
      let defaultLMTPer=(defaultLMTPerCentage===undefined?0: defaultLMTPerCentage); 
      if(globleSelectedTradingType.toLowerCase()==="paper"){
        processPaperModeOptionChanin(chaindata,temptype,side,expiryNewDate,
          newFirstInStrike,newSecondInStrike,newFirstOutStrike,newSecondOutStrike,
          newFirstInInstrumentToken,newSecondInInstrumentToken,newFirstOutInstrumentToken,newSecondOutInstrumentToken,
          newFirstInExchangeToken,newSecondInExchangeToken,newFirstOutExchangeToken,newSecondOutExchangeToken,
          defaultProductName,defaultOrderType,defaultShowQty,defaultLMTPer,
          defaultSliceQty,defaultLotSize,defaultQty
          )
      }else{
        processLiveModeOptionChanin(chaindata,temptype,side,expiryNewDate,
          newFirstInStrike,newSecondInStrike,newFirstOutStrike,newSecondOutStrike,
          newFirstInInstrumentToken,newSecondInInstrumentToken,newFirstOutInstrumentToken,newSecondOutInstrumentToken,
          newFirstInExchangeToken,newSecondInExchangeToken,newFirstOutExchangeToken,newSecondOutExchangeToken,
          defaultProductName,defaultOrderType,defaultShowQty,defaultLMTPer,
          defaultSliceQty,defaultLotSize,defaultQty
          )
      }
  }

  const processLiveModeOptionChanin=(chaindata,temptype,side,expiryNewDate,
      newFirstInStrike,newSecondInStrike,newFirstOutStrike,newSecondOutStrike,
      newFirstInInstrumentToken,newSecondInInstrumentToken,newFirstOutInstrumentToken,newSecondOutInstrumentToken,
      newFirstInExchangeToken,newSecondInExchangeToken,newFirstOutExchangeToken,newSecondOutExchangeToken,
      defaultProductName,defaultOrderType,defaultShowQty,defaultLMTPer,
      defaultSliceQty,defaultLotSize,defaultQty)=>{
        if(switchState===false){          
          if(editBucketRow===false){
            let basketPriceAmt= (
              defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'? chaindata.ltp:
                (parseFloat(defaultLMTPer)>0?
                side.toLowerCase()==='buy'?
                (parseFloat(parseFloat(chaindata.ltp)+(parseFloat(chaindata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)):
                (parseFloat(parseFloat(chaindata.ltp)-(parseFloat(chaindata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2))
                :parseFloat(chaindata.ltp));
              var stoplosspoint=0;
              var targetpoint=0;
              var newStoplosspoint=0
              var newTargetpoint=0;
              var dataSetting=JSON.parse(sessionStorage.getItem("generalConfig"));
              var settingData=dataSetting.find((data)=>data.instrumentname===chaindata.name);   
              if(settingData!=undefined){         
                  if(settingData!==null){
                    stoplosspoint=settingData.stoplosspoint;
                    targetpoint=settingData.targetpoint;
                    if (side.toLowerCase()==="sell"){
                      newStoplosspoint= (parseFloat(parseFloat(basketPriceAmt)+parseFloat(stoplosspoint)).toFixed(2))
                      newTargetpoint=(parseFloat(parseFloat(basketPriceAmt)-parseFloat(targetpoint)).toFixed(2))
                    }else{
                      newStoplosspoint= (parseFloat(parseFloat(basketPriceAmt)-parseFloat(stoplosspoint)).toFixed(2))
                      newTargetpoint=(parseFloat(parseFloat(basketPriceAmt)+parseFloat(targetpoint)).toFixed(2))
                    }
                  }
              }
            let newdata={
              bucketSide:side.toUpperCase(),
              bucketSymbol:(globleOptionChainType==='opt'? globleSymbol: chaindata?.name+' '+(new Date(chaindata.expiryDate)).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()+' '+ chaindata?.instrumentType),
              bucketStrike:chaindata.strikePrice,
              bucketExpiry:expiryNewDate,
              bucketType:(globleOptionChainType==='opt'? temptype:'FUT'),
              bucketProduct:(defaultProductName===undefined?'MIS': defaultProductName),
              bucketOrderType:(defaultOrderType===undefined?'MKT': defaultOrderType),
              bucketSliceQty:(defaultLotSize===undefined?1:defaultLotSize),
              bucketDefaultQty:(defaultQty===undefined?chaindata.lotSize:defaultQty),
              bucketLotTotalQty:(defaultShowQty===undefined?chaindata.lotSize:defaultShowQty),
              bucketMaxQty:(defaultSliceQty===undefined?chaindata.volumeFreeze:defaultSliceQty),
              bucketStickePrice:basketPriceAmt , 
              bucketSL:newStoplosspoint.toString(),
              bucketTarget:newTargetpoint.toString(),
              bucketMargin:0,
              instrumentToken:chaindata.instrumentToken,
              exchangeToken:chaindata.exchangeToken,
              bucketltp:chaindata.ltp,
              basketFirstInInstrumentToken:(globleOptionChainType==='opt'?
              newFirstInInstrumentToken.toString():""),
              basketSecondInInstrumentToken:(globleOptionChainType==='opt'?
              newSecondInInstrumentToken.toString():""),
              basketFirstOutInstrumentToken:(globleOptionChainType==='opt'?
              newFirstOutInstrumentToken.toString():""),
              basketSecondOutInstrumentToken:(globleOptionChainType==='opt'?
              newSecondOutInstrumentToken.toString():""),
              basketFirstInStrike:(globleOptionChainType==='opt'?
              newFirstInStrike.toString():""),
              basketSecondInStrike:(globleOptionChainType==='opt'?
              newSecondInStrike.toString():""),
              basketFirstOutStrike:(globleOptionChainType==='opt'?
              newFirstOutStrike.toString():""),
              basketSecondOutStrike:(globleOptionChainType==='opt'?
              newSecondOutStrike.toString():""),
              basketFirstInExchangeToken:(globleOptionChainType==='opt'?
              newFirstInExchangeToken.toString():""),
              basketSecondInExchangeToken:(globleOptionChainType==='opt'?
              newSecondInExchangeToken.toString():""),
              basketFirstOutExchangeToken:(globleOptionChainType==='opt'?
              newFirstOutExchangeToken.toString():""),
              basketSecondOutExchangeToken:(globleOptionChainType==='opt'?
              newSecondOutExchangeToken.toString() :""),
              baskettradingSymbol:chaindata.tradingSymbol,
              basketexchange:chaindata.exchange,
              basketBrokerName:globleBrokerName,
              basketTraderMode:globleSelectedTradingType,
              basketClient: globleSelectedClientInfo
            };
  
            const updatedList=[...bucketList,newdata];  
            let sortdata=sortBasketList(updatedList);         
            setBucketList(sortdata);   
            let basketName="basketName_"+globleSelectedTradingType+globleSelectedClientInfo;       
            CookiesConfig.setItemWithExpiry(basketName,JSON.stringify(sortdata));
            setEditBucketRow(false);
            setEditBucketRowNo('-1');
            //processBasketMargin(sortdata);

            
          }else{
              alertify.error("You have unsaved changes in the basket list. Please save those changes first.")
          }
      }else{
        debugger;
          let orderPrice=(defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'? chaindata.ltp:(parseFloat(defaultLMTPer)>0?
          side.toLowerCase()==='buy'?
          (parseFloat(parseFloat(chaindata.ltp)+(parseFloat(chaindata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)):
          (parseFloat(parseFloat(chaindata.ltp)-(parseFloat(chaindata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2))
          :parseFloat(chaindata.ltp))
          let data={
            strikePrice:chaindata.strikePrice,   
            productname:(defaultProductName===undefined?'MIS':defaultProductName),
            ordertype:(defaultOrderType===undefined?'MKT': defaultOrderType),
            expirydate:expiryNewDate,
            instrumentname:(globleOptionChainType==='opt'? globleSymbol: chaindata?.name+' '+(new Date(chaindata.expiryDate)).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()+' '+ chaindata?.instrumentType),
            orderside:(globleOptionChainType==='opt'? temptype:'FUT'),
            orderqty:(defaultShowQty===undefined?chaindata.lotSize:defaultShowQty.toString()),
            nooforderlot:(defaultLotSize===undefined?"1":defaultLotSize.toString()),
            maxorderqty:(defaultSliceQty===undefined?chaindata.volumeFreeze.toString():defaultSliceQty.toString()),
            orderprice:(defaultOrderType==='MKT'? chaindata.ltp.toString():
            (Math.round(Number(orderPrice) * 20) / 20).toString()),
            tradermode:globleSelectedTradingType,
            orderidbybroker:"" ,
            clientid:globleSelectedClientInfo,
            lotsize:(defaultQty===undefined?chaindata.lotSize:defaultQty.toString()),
            instrumentToken:chaindata.instrumentToken,
            orderaction:side.toUpperCase(),
            stoploss:"0",
            target:"0",
            trailling:"0",
            orderexchangetoken:chaindata.exchangeToken,
            orderstatus:'Pending',
            firstInInstrumentToken:(globleOptionChainType==='opt'?
            newFirstInInstrumentToken.toString():""),
            secondInInstrumentToken:(globleOptionChainType==='opt'?
            newSecondInInstrumentToken.toString():""),
            firstOutInstrumentToken:(globleOptionChainType==='opt'?
            newFirstOutInstrumentToken.toString():""),
            secondOutInstrumentToken:(globleOptionChainType==='opt'?
            newSecondOutInstrumentToken.toString():""),
            firstInStrike:(globleOptionChainType==='opt'?
            newFirstInStrike.toString():""),
            secondInStrike:(globleOptionChainType==='opt'?
            newSecondInStrike.toString():""),
            firstOutStrike:(globleOptionChainType==='opt'?
            newFirstOutStrike.toString():""),
            secondOutStrike:(globleOptionChainType==='opt'?
            newSecondOutStrike.toString():""),            
            firstInExchangeToken:(globleOptionChainType==='opt'?
            newFirstInExchangeToken.toString():""),
            secondInExchangeToken:(globleOptionChainType==='opt'?
            newSecondInExchangeToken.toString():""),
            firstOutExchangeToken:(globleOptionChainType==='opt'?
            newFirstOutExchangeToken.toString():""),
            secondOutExchangeToken:(globleOptionChainType==='opt'?
            newSecondOutExchangeToken.toString() :""),
            tradingSymbol:chaindata.tradingSymbol,
            exchange:chaindata.exchange,
            brokerName:globleBrokerName
          }    
          processInsertUpdateOrder(data);
      }
  }

  const processPaperModeOptionChanin=(chaindata,temptype,side,expiryNewDate,
      newFirstInStrike,newSecondInStrike,newFirstOutStrike,newSecondOutStrike,
      newFirstInInstrumentToken,newSecondInInstrumentToken,newFirstOutInstrumentToken,newSecondOutInstrumentToken,
      newFirstInExchangeToken,newSecondInExchangeToken,newFirstOutExchangeToken,newSecondOutExchangeToken,
      defaultProductName,defaultOrderType,defaultShowQty,defaultLMTPer,
      defaultSliceQty,defaultLotSize,defaultQty)=>{
      if(switchState===false){  
        debugger;        
        if(editBucketRow===false){
          
          let indexOfBasket=bucketList.findIndex((data)=>data.baskettradingSymbol===chaindata.tradingSymbol
                                &&  data.bucketProduct===(defaultProductName===undefined?'MIS': defaultProductName)
                                &&  data.bucketOrderType===(defaultOrderType===undefined?'MKT': defaultOrderType)
                                && data.bucketSide===side.toUpperCase())
          
          if(indexOfBasket===-1){
            let basketPriceAmt= (
              defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'? chaindata.ltp:
                (parseFloat(defaultLMTPer)>0?
                side.toLowerCase()==='buy'?
                (parseFloat(parseFloat(chaindata.ltp)+(parseFloat(chaindata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)):
                (parseFloat(parseFloat(chaindata.ltp)-(parseFloat(chaindata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2))
                :parseFloat(chaindata.ltp));
              var stoplosspoint=0;
              var targetpoint=0;
              var newStoplosspoint=0
              var newTargetpoint=0;
              var dataSetting=JSON.parse(sessionStorage.getItem("generalConfig"));
              var settingData=dataSetting.find((data)=>data.instrumentname===chaindata.name);            
              if(settingData!=undefined){       
                if(settingData!==null){
                  stoplosspoint=settingData.stoplosspoint;
                  targetpoint=settingData.targetpoint;
                  if (side.toLowerCase()==="sell"){
                    newStoplosspoint= (parseFloat(parseFloat(basketPriceAmt)+parseFloat(stoplosspoint)).toFixed(2))
                    newTargetpoint=(parseFloat(parseFloat(basketPriceAmt)-parseFloat(targetpoint)).toFixed(2))
                  }else{
                    newStoplosspoint= (parseFloat(parseFloat(basketPriceAmt)-parseFloat(stoplosspoint)).toFixed(2))
                    newTargetpoint=(parseFloat(parseFloat(basketPriceAmt)+parseFloat(targetpoint)).toFixed(2))
                  }
                }
              }
              
              let newdata={
                bucketSide:side.toUpperCase(),
                bucketSymbol:(globleOptionChainType==='opt'? globleSymbol: chaindata?.name+' '+(new Date(chaindata.expiryDate)).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()+' '+ chaindata?.instrumentType),
                bucketStrike:chaindata.strikePrice,
                bucketExpiry:expiryNewDate,
                bucketType:(globleOptionChainType==='opt'? temptype:'FUT'),
                bucketProduct:(defaultProductName===undefined?'MIS': defaultProductName),
                bucketOrderType:(defaultOrderType===undefined?'MKT': defaultOrderType),
                bucketSliceQty:(defaultLotSize===undefined?1:defaultLotSize),
                bucketDefaultQty:(defaultQty===undefined?chaindata.lotSize:defaultQty),
                bucketLotTotalQty:(defaultShowQty===undefined?chaindata.lotSize:defaultShowQty),
                bucketMaxQty:(defaultSliceQty===undefined?chaindata.volumeFreeze:defaultSliceQty),
                bucketStickePrice:basketPriceAmt , 
                bucketSL:newStoplosspoint.toString(),
                bucketTarget:newTargetpoint.toString(),
                bucketMargin:0,
                instrumentToken:chaindata.instrumentToken,
                exchangeToken:chaindata.exchangeToken,
                bucketltp:chaindata.ltp,
                basketFirstInInstrumentToken:(globleOptionChainType==='opt'?
                newFirstInInstrumentToken.toString():""),
                basketSecondInInstrumentToken:(globleOptionChainType==='opt'?
                newSecondInInstrumentToken.toString():""),
                basketFirstOutInstrumentToken:(globleOptionChainType==='opt'?
                newFirstOutInstrumentToken.toString():""),
                basketSecondOutInstrumentToken:(globleOptionChainType==='opt'?
                newSecondOutInstrumentToken.toString():""),
                basketFirstInStrike:(globleOptionChainType==='opt'?
                newFirstInStrike.toString():""),
                basketSecondInStrike:(globleOptionChainType==='opt'?
                newSecondInStrike.toString():""),
                basketFirstOutStrike:(globleOptionChainType==='opt'?
                newFirstOutStrike.toString():""),
                basketSecondOutStrike:(globleOptionChainType==='opt'?
                newSecondOutStrike.toString():""),
                basketFirstInExchangeToken:(globleOptionChainType==='opt'?
                newFirstInExchangeToken.toString():""),
                basketSecondInExchangeToken:(globleOptionChainType==='opt'?
                newSecondInExchangeToken.toString():""),
                basketFirstOutExchangeToken:(globleOptionChainType==='opt'?
                newFirstOutExchangeToken.toString():""),
                basketSecondOutExchangeToken:(globleOptionChainType==='opt'?
                newSecondOutExchangeToken.toString() :""),
                baskettradingSymbol:chaindata.tradingSymbol,
                basketexchange:chaindata.exchange,
                basketBrokerName:globleBrokerName,
                basketTraderMode:globleSelectedTradingType,
                basketClient: globleSelectedClientInfo
              };
              const updatedList=[...bucketList,newdata];  
              let sortdata=sortBasketList(updatedList);         
              setBucketList(sortdata);    
              let basketName="basketName_"+globleSelectedTradingType+globleSelectedClientInfo;      
              CookiesConfig.setItemWithExpiry(basketName,JSON.stringify(sortdata));
          }else{
            setBucketList((previousData) => {
                // Check if the quantity has already been updated
                if (previousData[indexOfBasket].updated) {
                    previousData[indexOfBasket].updated = false;
                    return previousData; // If already updated, return previous data without modification
                }            
                const newData = [...previousData]; // Create a copy of the previous data to avoid mutation
                const oldQty = newData[indexOfBasket].bucketLotTotalQty; // Retrieve the old quantity from the previous data
                const updatedQty = oldQty + (defaultShowQty === undefined ? chaindata.lotSize : defaultShowQty); // Calculate the updated quantity
                newData[indexOfBasket].bucketLotTotalQty = updatedQty; // Update the quantity in the new data
                const oldLot = newData[indexOfBasket].bucketSliceQty; 
                const updatedLot = oldLot+(defaultLotSize===undefined?1:defaultLotSize)// Calculate the updated quantity
                newData[indexOfBasket].bucketSliceQty=updatedLot
                newData[indexOfBasket].updated = true; // Mark the item as updated to prevent multiple updates
                
                let basketName="basketName_"+globleSelectedTradingType+globleSelectedClientInfo;      
                var busketList=JSON.parse(CookiesConfig.getItemWithExpiry(basketName));
                busketList[indexOfBasket].bucketSliceQty=updatedLot;
                busketList[indexOfBasket].bucketLotTotalQty=updatedQty;                   
                CookiesConfig.setItemWithExpiry(basketName,JSON.stringify(busketList));
                
                return newData; // Return the updated data
            });
          }
          setEditBucketRow(false);
          setEditBucketRowNo('-1');
         // processBasketMargin(sortdata);
        }else{
            alertify.error("You have unsaved changes in the basket list. Please save those changes first.")
        }
    }else{
        let orderPrice=(defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'? chaindata.ltp:(parseFloat(defaultLMTPer)>0?
        side.toLowerCase()==='buy'?
        (parseFloat(parseFloat(chaindata.ltp)+(parseFloat(chaindata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)):
        (parseFloat(parseFloat(chaindata.ltp)-(parseFloat(chaindata.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2))
        :parseFloat(chaindata.ltp))
        let data={
          strikePrice:chaindata.strikePrice,   
          productname:(defaultProductName===undefined?'MIS':defaultProductName),
          ordertype:(defaultOrderType===undefined?'MKT': defaultOrderType),
          expirydate:expiryNewDate,
          instrumentname:(globleOptionChainType==='opt'? globleSymbol: chaindata?.name+' '+(new Date(chaindata.expiryDate)).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()+' '+ chaindata?.instrumentType),
          orderside:(globleOptionChainType==='opt'? temptype:'FUT'),
          orderqty:(defaultShowQty===undefined?chaindata.lotSize:defaultShowQty.toString()),
          nooforderlot:(defaultLotSize===undefined?"1":defaultLotSize.toString()),
          maxorderqty:(defaultSliceQty===undefined?chaindata.volumeFreeze.toString():defaultSliceQty.toString()),
          orderprice:(defaultOrderType==='MKT'? chaindata.ltp.toString():         
          (side.toLowerCase()==='buy'?
          (parseFloat(orderPrice)>=parseFloat(chaindata.ltp)?chaindata.ltp.toString():orderPrice.toString()):
          (parseFloat(orderPrice)<=parseFloat(chaindata.ltp)?chaindata.ltp.toString():orderPrice.toString()))),
          tradermode:globleSelectedTradingType,
          orderidbybroker:"" ,
          clientid:globleSelectedClientInfo,
          lotsize:(defaultQty===undefined?chaindata.lotSize:defaultQty.toString()),
          instrumentToken:chaindata.instrumentToken,
          orderaction:side.toUpperCase(),
          stoploss:"0",
          target:"0",
          trailling:"0",
          orderexchangetoken:chaindata.exchangeToken,
          orderstatus:((defaultOrderType===undefined?'MKT': defaultOrderType)==='MKT'?'Completed':
          (side.toLowerCase()==='buy'?
          (parseFloat(orderPrice)>=parseFloat(chaindata.ltp)?'Completed':'Pending'):
          (parseFloat(orderPrice)<=parseFloat(chaindata.ltp)?'Completed':'Pending'))),
          firstInInstrumentToken:(globleOptionChainType==='opt'?
          newFirstInInstrumentToken.toString():""),
          secondInInstrumentToken:(globleOptionChainType==='opt'?
          newSecondInInstrumentToken.toString():""),
          firstOutInstrumentToken:(globleOptionChainType==='opt'?
          newFirstOutInstrumentToken.toString():""),
          secondOutInstrumentToken:(globleOptionChainType==='opt'?
          newSecondOutInstrumentToken.toString():""),
          firstInStrike:(globleOptionChainType==='opt'?
          newFirstInStrike.toString():""),
          secondInStrike:(globleOptionChainType==='opt'?
          newSecondInStrike.toString():""),
          firstOutStrike:(globleOptionChainType==='opt'?
          newFirstOutStrike.toString():""),
          secondOutStrike:(globleOptionChainType==='opt'?
          newSecondOutStrike.toString():""),            
          firstInExchangeToken:(globleOptionChainType==='opt'?
          newFirstInExchangeToken.toString():""),
          secondInExchangeToken:(globleOptionChainType==='opt'?
          newSecondInExchangeToken.toString():""),
          firstOutExchangeToken:(globleOptionChainType==='opt'?
          newFirstOutExchangeToken.toString():""),
          secondOutExchangeToken:(globleOptionChainType==='opt'?
          newSecondOutExchangeToken.toString() :""),
          tradingSymbol:chaindata.tradingSymbol,
          exchange:chaindata.exchange,
          brokerName:globleBrokerName 
        }    
        processInsertUpdateOrder(data);
    }
  }

  const sortBasketList=(updatedList)=>{       
      var configData=JSON.parse(sessionStorage.getItem("defaultConfig"));
      let configInformation=configData.find((data)=>data.instrumentname===globleSymbol && data.expirydate===globleExpityvalue && data.clientId===globleSelectedClientInfo && data.defaultTradingMode===sessionStorage.getItem("tradingtype"));
      const{   
              defaultBrokerType 
          }={...configInformation};

      const columnToRemove = 'bucketSrNo';
      // Create a new array without the specified column
      if(updatedList!=undefined){
        const newBasketList = updatedList.map(item => {
          if (item && columnToRemove && Object.prototype.hasOwnProperty.call(item, columnToRemove)) {
              const { [columnToRemove]: _, ...rest } = item;
              return rest;
          }
          return item;
      });
      
      
      // Group the items by bucketSide
      let sortedDataTemp = []
      
      if(defaultBrokerType==='Buy First'){
          sortedDataTemp=newBasketList.sort((a, b) => {
            // Compare bucketSide in descending order ('sell' comes before 'buy')
            const bucketSort = a.bucketSide.localeCompare(b.bucketSide);
            if (bucketSort !== 0) {
              return bucketSort;
            }             
          });
      }else{
         
          sortedDataTemp=newBasketList.sort((a, b) => {
            // Compare bucketSide in descending order ('sell' comes before 'buy')
            const bucketSort = b.bucketSide.localeCompare(a.bucketSide);
            if (bucketSort !== 0) {
              return bucketSort;
            }             
          });
      
      }
      
      
      const groupedByBucketSide = sortedDataTemp.reduce((acc, item) => {
        const key = item && item.bucketSide !== undefined ? item.bucketSide : "undefined"; // Check if item is defined and has bucketSide property
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {});
      
     // Sort each group by bucketSide
     for (const key in groupedByBucketSide) {
      groupedByBucketSide[key] = groupedByBucketSide[key].sort((a, b) => a.bucketSide.localeCompare(b.bucketSide));
    } 
      // Flatten the sorted groups
      const sortedData = Object.values(groupedByBucketSide).flat();
      const updatedListWithSerialNumbers = sortedData.map((item, index) => ({
        bucketSrNo: index + 1,
        ...item, // You might want to spread the properties of the original item
      }));            
      const sortdata=updatedListWithSerialNumbers.sort(function(a,b){
        return a.bucketSrNo - b.bucketSrNo;
        }
      );
      return sortdata;
      }else{
        return [];
      }
  }

  const processInsertUpdateOrder=async (data)=>{
      if(globleSelectedTradingType.toLowerCase()==="paper"){
        const requestData={
          orderitems: data,
          logmessage:""
        }
           
          const resultData=await PaperTradingAPI.processInsertUpdateOrderPaper(requestData);        
          if(resultData!=null){           
            alertify.success("Order added successfully.")
          }
      }else{
        let requestData={
          logintoken:sessionStorage.getItem("apiSecret"),
          orderitems:data,
          logmessage:""
        }
        const resultData=await LiveTradingAPI.processInsertUpdateOrderLive(requestData);        
        if(resultData!=null){           
          alertify.message(resultData);
        }
      }
  }

  const handleBucketSorting=(bucketData,direction)=>{          
          const {bucketSrNo}=bucketData;
          let currentBucketItem=getSelectedBucketBySrNo(bucketSrNo)
          let srno=0;
          if(direction==="up"){
            srno=bucketSrNo-1
          }else{
            srno=bucketSrNo+1
          }
          let bucketToShiftItem=getSelectedBucketBySrNo(srno);
          let bucketArray=[];
          bucketArray.push(srno);
          bucketArray.push(bucketSrNo);
          const allbucket=getSelectedBucketArray(bucketArray);
          const updateCurrent={...currentBucketItem,bucketSrNo:srno};
          const updateOld={...bucketToShiftItem,bucketSrNo:bucketSrNo}
          const updateCurrentInfo=[...allbucket,updateCurrent];
          const updateOldInfo=[...updateCurrentInfo,updateOld];
          debugger;
          const sortdata=updateOldInfo.sort(function(a,b){
            return a.bucketSrNo - b.bucketSrNo;
            }
        );
          setBucketList(sortdata);
          let basketName="basketName_"+globleSelectedTradingType+globleSelectedClientInfo; 
          CookiesConfig.setItemWithExpiry(basketName,JSON.stringify(sortdata));
  }

  const getSelectedBucketBySrNo=(no)=> {
      return bucketList.find((d) => d.bucketSrNo === no);
  }

  const getSelectedBucketArray=(no)=> {
      return bucketList.filter(item => !no.includes(item.bucketSrNo))
  }
    
  const handleBucketDataCopy=(data,index)=>{
      alertify.confirm(
        'Information',
        'Do you want to copy current data from basket ?',
        () => {
          let showSuccess=false;
          setBucketList((prevRowData) => {  
                    let newdata = prevRowData.find(item => item.bucketSrNo === data.bucketSrNo);            
                    const updatedList=[...bucketList,newdata];
                    // Update the array with serial numbers
                    
                    let sortdata=sortBasketList(updatedList);
                    
                    // Update the state with the new array
                    setBucketList(sortdata);
                    let basketName="basketName_"+globleSelectedTradingType+globleSelectedClientInfo; 
                    CookiesConfig.setItemWithExpiry(basketName,JSON.stringify(sortdata));    
                    if(!showSuccess){
                     alertify.success("Select item copy from Busket.")
                      showSuccess=true;
                    }                 
                    //processBasketMargin(sortdata);
                    return sortdata;
           }) 
        },
        () => {
           
        } );
  }
    
  const handleBucketDataDelete=(data)=>{      
      alertify.confirm(
        'Information',
        'Do you want to delete current data from basket ?',
        () => {
          let showSuccess=false;
          setBucketList((prevRowData) => {  
                    let updatedList = prevRowData.filter(item => item.bucketSrNo !== data.bucketSrNo);            
                    let sortData=updatedList.sort(function(a,b){
                      return a.bucketSrNo - b.bucketSrNo;
                      }
                    );
                    let newUpdatedList = sortData.map((item, newIndex) => {
                      return {
                        ...item,
                        bucketSrNo: newIndex+1, // Replace 'newValue' with the updated value
                      }            
                    });
                    let basketName="basketName_"+globleSelectedTradingType+globleSelectedClientInfo; 
                    CookiesConfig.setItemWithExpiry(basketName,JSON.stringify(newUpdatedList));
                    if(!showSuccess){
                      alertify.success("Select item deleted from Busket.");
                      showSuccess=true;
                    }    
                    //processBasketMargin(newUpdatedList);               
                    return newUpdatedList;
           })    
           
        },
        () => {
           
        }
      );

      
  }


  const handleBasketEdit=(processtype,index)=>{
      if(processtype==="edit"){
        if(parseInt(editBucketRowNo)===-1){
            setEditBucketRow(true);
            setEditBucketRowNo(index);
        }else{
          alertify.confirm(
            'Information',
            'You have unsaved changes in the basket list. Do you want to auto save them before editing another row?Are you sure you want to proceed?',
            () => {
              // "Yes" button clicked
              setEditBucketRow(true);
              setEditBucketRowNo(index);
            },
            () => {
               
            }
          );
        }
      }else{
        setEditBucketRow(false);
        setEditBucketRowNo("-1");
         let basketName="basketName_"+globleSelectedTradingType+globleSelectedClientInfo; 
        CookiesConfig.setItemWithExpiry(basketName,JSON.stringify(bucketList));   
        alertify.success("Basket data updated successfully.")
      }
     
  }

  const handleSwitchSelectorChange=(value)=>{
      updatGlobleOptionChainType(value);
  }

  const calculateLTPPercentage=(ltp,lastDayClosinglp)=>{
      let changePer=0;
      if(ltp>0){
          changePer=parseFloat((((parseFloat(ltp) - parseFloat(lastDayClosinglp)) / parseFloat(lastDayClosinglp)) * 100)) 
      }
      return parseFloat(changePer).toFixed(2);
  }

  const setForRowDropDown=(data,infoType)=>{      
          if(infoType==="bucketOrderType"){
                let dataInfo=orderTypeOption.find((x)=>x.value===data.bucketOrderType);
                return dataInfo;
          }else if(infoType==="bucketProduct"){
                let dataInfo=productOptions.find((x)=>x.value===data.bucketProduct);
                return dataInfo;
          }else if(infoType==="bucketType"){
            let dataInfo=typeOptions.find((x)=>x.value===data.bucketType);
            return dataInfo;
          }else if(infoType==="bucketSide"){
            let dataInfo=sideOptions.find((x)=>x.value===data.bucketSide);
            return dataInfo;
          }
  }

  const handdleTextBoxEvent = (e, index,refType) => {      
      let selectedValue = e.target.value;     
      // Update the state for the selected row
      setBucketList((prevRowData) => {  
        if(refType==="bucketSliceQty"){            
           let bucketDefaultQty= prevRowData[index]["bucketDefaultQty"];
           let bucketMaxQty= prevRowData[index]["bucketMaxQty"];
           let maxLot=parseInt(bucketMaxQty)/parseInt(bucketDefaultQty);
            if(selectedValue>0){
                debugger;
                    let totalQty=bucketDefaultQty*selectedValue;
                    prevRowData[index]["bucketLotTotalQty"] =totalQty;
                    prevRowData[index][refType] =selectedValue;                    
            }else{
              prevRowData[index][refType] ="";
            }
        }   else{
          if (selectedValue === '' || selectedValue.charAt(0) !== '0') {
            prevRowData[index][refType] =selectedValue;
          }
         
        }     
       // processBasketMargin(prevRowData)        
        return prevRowData;
      });
      

  }
  const handleClearBasket=()=>{
        setEditBucketRow(false);
        setEditBucketRowNo("-1");
        let basketName="basketName_"+globleSelectedTradingType+globleSelectedClientInfo; 
        CookiesConfig.removeLocalStorageItem(basketName);
        setBusketMargin(Constant.CurrencyFormat(parseFloat(0)))
        setRequiredBusketMargin(Constant.CurrencyFormat(parseFloat(0)))
        setBucketList([]);         
  }
  const handleRowClick=(e,index)=>{
        debugger;
        setEditBucketRow(true);
        setEditBucketRowNo(index);      
  }
  const handleKeyDown=(e,index)=>{
      if (e.key === 'Enter' || e.key === 'Tab') {
        setEditBucketRow(false);
        setEditBucketRowNo("-1");   
        //processBasketMargin(bucketList) 
      }  
  }
  const handdleRowChange=(refValue,index,refType)=>{
       
      var configData=JSON.parse(sessionStorage.getItem("defaultConfig"));
      let configInformation=configData.find((data)=>data.instrumentname===globleSymbol && data.expirydate===globleExpityvalue && data.clientId===globleSelectedClientInfo && data.defaultTradingMode===sessionStorage.getItem("tradingtype"));
      const{  defaultProductName,   defaultSliceQty, 
        defaultOrderType,     defaultLotSize,       
        defaultQty,           defaultLMTPerCentage,
        defaultShowQty
        }={...configInformation};
        let defaultLMTPer=(defaultLMTPerCentage===undefined?0: defaultLMTPerCentage); 
        if(refType==="side"){
          setBucketList((prevRowData) => {            
            const updatedRowData = [...prevRowData]; // Create a copy of the array
            // Toggle between BUY and SELL
           
            let filterData=filterOptionChainList.find((data)=>data.instrumentToken===updatedRowData[index].instrumentToken);
            let newltpPrice=updatedRowData[index].bucketOrderType.toLowerCase()==='lmt'?
            parseFloat(defaultLMTPer)>0?
                  refValue.toLowerCase() ==='sell'?
                        parseFloat(parseFloat(filterData.ltp)+(parseFloat(filterData.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2):
                        parseFloat(parseFloat(filterData.ltp)-(parseFloat(filterData.ltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)
                      :parseFloat(filterData.ltp).toString()
                      :parseFloat(filterData.ltp).toString()

            updatedRowData[index].bucketSide =
              refValue.toLowerCase() === "buy" ? "SELL" : "BUY"; 
            updatedRowData[index].bucketStickePrice =  newltpPrice;
            //processBasketMargin(updatedRowData);
            return updatedRowData;
          });
          
          
        }else if(refType==="bucketType"){
          setBucketList((prevRowData) => {     
              const updatedRowData = [...prevRowData]; // Create a copy of the array
              let bucketStrike= updatedRowData[index]["bucketStrike"];
              updatedRowData[index].bucketType =
              refValue.toLowerCase() === "ce" ? "PE" : "CE"; 
              let updateAddInfo=sortedCurrentOptionChain.find((infoData)=>infoData.strikePrice===bucketStrike && infoData.instrumentType=== "ce" ? "PE" : "CE")
              updatedRowData[index]["instrumentToken"] =updateAddInfo.instrumentToken;
            //  processBasketMargin(updatedRowData)
              return updatedRowData;
          });
        }else   if(refType==="bucketProduct"){
          setBucketList((prevRowData) => {            
            const updatedRowData = [...prevRowData]; // Create a copy of the array
            // Toggle between BUY and SELL
            updatedRowData[index].bucketProduct =
              refValue.toLowerCase() === "mis" ? "NRML" : "MIS";  
           //   processBasketMargin(updatedRowData);    
            return updatedRowData;
          });
        }else   if(refType==="bucketOrderType"){
          //setEditBucketRow(true);
          refValue.toLowerCase() === "mkt" ? setEditBucketRowNo(index): setEditBucketRowNo("-1")
          setBucketList((prevRowData) => {      
            debugger;      
            const updatedRowData = [...prevRowData]; // Create a copy of the array
            // Toggle between BUY and SELL
         
            updatedRowData[index].bucketOrderType =
              refValue.toLowerCase() === "mkt" ? "LMT" : "MKT";   
            updatedRowData[index].bucketStickePrice =  "mkt" ? 
            (parseFloat(defaultLMTPer)>0?
                      updatedRowData[index].bucketSide.toLowerCase()==='buy'?                        
                        parseFloat(parseFloat(updatedRowData[index].bucketltp)+(parseFloat(updatedRowData[index].bucketltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)   
                        : parseFloat(parseFloat(updatedRowData[index].bucketltp)-(parseFloat(updatedRowData[index].bucketltp)*parseFloat(defaultLMTPer)/100)).toFixed(2)
                : updatedRowData[index].bucketStickePrice.toString()):updatedRowData[index].bucketStickePrice.toString();   
           //     processBasketMargin(updatedRowData)
                return updatedRowData;
          });
        }
        
  }
  const handleBasketExecuteOrder=(e)=>{  
      setEditBucketRow(false);
      setEditBucketRowNo("-1");
      var configData=JSON.parse(sessionStorage.getItem("defaultConfig"));
      let configInformation=configData.find((data)=>data.instrumentname===globleSymbol && data.expirydate===globleExpityvalue && data.clientId===globleSelectedClientInfo && data.defaultTradingMode===sessionStorage.getItem("tradingtype"));
      const{  defaultProductName,   defaultSliceQty, 
        defaultOrderType,     defaultLotSize,       
        defaultQty,           defaultLMTPerCentage,
        defaultShowQty
        }={...configInformation};
        let defaultLMTPer=(defaultLMTPerCentage===undefined?0: defaultLMTPerCentage); 
        const scopedUpdatedRowsArray = [];
        const updatedRows = [...bucketList];
        while (updatedRows.some((row) => row.bucketLotTotalQty > 0)) {
          updatedRows.forEach((row) => {   
            const clonedRow = { ...row }; 
            if(parseInt(clonedRow.bucketLotTotalQty)>= parseInt(defaultSliceQty)){              
              clonedRow.processqty=parseInt(defaultSliceQty);
            }else{
              clonedRow.processqty=parseInt(row.bucketLotTotalQty)
            }  
            scopedUpdatedRowsArray.push(clonedRow);
            row.bucketLotTotalQty = Math.max(0, parseInt(row.bucketLotTotalQty) - parseInt(defaultSliceQty));        
          });          
        }
        if(globleSelectedTradingType.toLowerCase()==="paper"){
          processInsertUpdateOrderBulkPaper(scopedUpdatedRowsArray);
        }else{
          processInsertUpdateOrderBulkLive(scopedUpdatedRowsArray);
        }

  }
  const processInsertUpdateOrderBulkLive=(scopedUpdatedRowsArray)=>{
      const newBucketList = scopedUpdatedRowsArray.map(({ bucketStrike, bucketProduct,
        bucketOrderType,bucketExpiry,
        bucketSymbol,bucketType,processqty,bucketSliceQty,
        bucketMaxQty,bucketStickePrice,bucketDefaultQty,instrumentToken,
        bucketSide,exchangeToken,bucketltp,basketFirstInInstrumentToken,
        basketSecondInInstrumentToken, basketFirstOutInstrumentToken,
        basketSecondOutInstrumentToken,basketFirstInStrike,
        basketSecondInStrike,basketFirstOutStrike,
        basketSecondOutStrike,basketFirstInExchangeToken,
        basketSecondInExchangeToken,basketFirstOutExchangeToken,basketSecondOutExchangeToken,
        baskettradingSymbol,basketexchange,basketBrokerName
      }) => ({
        strikePrice:bucketStrike,   
        productname:bucketProduct,
        ordertype:bucketOrderType,
        expirydate:bucketExpiry,
        instrumentname:bucketSymbol,
        orderside:bucketType,
        orderqty:processqty.toString(),
        nooforderlot:(parseInt(processqty)/parseInt(getSetting(bucketSymbol,bucketExpiry)?.defaultQty)).toString(),
        maxorderqty:getSetting(bucketSymbol,bucketExpiry)?.defaultSliceQty.toString(),
        orderprice:(bucketOrderType==='MKT'? bucketltp.toString():(Math.round(Number(bucketStickePrice) * 20) / 20).toString()),
        tradermode:globleSelectedTradingType,
        orderidbybroker:"" ,
        clientid:globleSelectedClientInfo,
        lotsize:getSetting(bucketSymbol,bucketExpiry)?.defaultQty.toString(),
        instrumentToken:instrumentToken,
        orderaction:bucketSide,
        stoploss:"0",
        target:"0",
        trailling:"0",
        orderexchangetoken:exchangeToken.toString(),
        orderstatus:'Pending',
        firstInInstrumentToken:basketFirstInInstrumentToken,
        secondInInstrumentToken:basketSecondInInstrumentToken, 
        firstOutInstrumentToken:basketFirstOutInstrumentToken,
        secondOutInstrumentToken:basketSecondOutInstrumentToken,
        firstInStrike:basketFirstInStrike,
        secondInStrike:basketSecondInStrike,
        firstOutStrike:basketFirstOutStrike,
        secondOutStrike:basketSecondOutStrike,
        firstInExchangeToken:basketFirstInExchangeToken,
        secondInExchangeToken:basketSecondInExchangeToken,
        firstOutExchangeToken:basketFirstOutExchangeToken,
        secondOutExchangeToken:basketSecondOutExchangeToken     ,
        tradingSymbol:baskettradingSymbol,
        exchange:basketexchange,
        brokerName:basketBrokerName
        }));  
           
    setDiableBasketExecute(true);
    processInsertUpdateOrderBulk(newBucketList);  
  }
  const processInsertUpdateOrderBulkPaper=(scopedUpdatedRowsArray)=>{
      const newBucketList = scopedUpdatedRowsArray.map(({ bucketStrike, bucketProduct,
        bucketOrderType,bucketExpiry,
        bucketSymbol,bucketType,processqty,bucketSliceQty,
        bucketMaxQty,bucketStickePrice,bucketDefaultQty,instrumentToken,
        bucketSide,exchangeToken,bucketltp,basketFirstInInstrumentToken,
        basketSecondInInstrumentToken, basketFirstOutInstrumentToken,
        basketSecondOutInstrumentToken,basketFirstInStrike,
        basketSecondInStrike,basketFirstOutStrike,
        basketSecondOutStrike,basketFirstInExchangeToken,
        basketSecondInExchangeToken,basketFirstOutExchangeToken,basketSecondOutExchangeToken,
        baskettradingSymbol,basketexchange,basketBrokerName,bucketSL,bucketTarget
      }) => ({
        strikePrice:bucketStrike,   
        productname:bucketProduct,
        ordertype:bucketOrderType,
        expirydate:bucketExpiry,
        instrumentname:bucketSymbol,
        orderside:bucketType,
        orderqty:processqty.toString(),
        nooforderlot:(parseInt(processqty)/parseInt(getSetting(bucketSymbol,bucketExpiry)?.defaultQty)).toString(),
        maxorderqty:getSetting(bucketSymbol,bucketExpiry)?.defaultSliceQty.toString(),
        orderprice:(bucketOrderType==='MKT'? bucketltp.toString():         
        (bucketSide.toLowerCase()==='buy'?
        (parseFloat(bucketStickePrice)>=parseFloat(bucketltp)?bucketltp.toString():bucketStickePrice.toString()):
        (parseFloat(bucketStickePrice)<=parseFloat(bucketltp)?bucketltp.toString():bucketStickePrice.toString()))),
        tradermode:globleSelectedTradingType,
        orderidbybroker:"" ,
        clientid:globleSelectedClientInfo,
        lotsize:getSetting(bucketSymbol,bucketExpiry)?.defaultQty.toString(),
        instrumentToken:instrumentToken,
        orderaction:bucketSide,
        stoploss:bucketSL.toString(),
        target:bucketTarget.toString(),
        trailling:"0",
        orderexchangetoken:exchangeToken.toString(),
        orderstatus:(bucketOrderType==='MKT'?'Completed':         
        (bucketSide.toLowerCase()==='buy'?
        (parseFloat(bucketStickePrice)>=parseFloat(bucketltp)?'Completed':'Pending'):
        (parseFloat(bucketStickePrice)<=parseFloat(bucketltp)?'Completed':'Pending'))),
        firstInInstrumentToken:basketFirstInInstrumentToken,
        secondInInstrumentToken:basketSecondInInstrumentToken, 
        firstOutInstrumentToken:basketFirstOutInstrumentToken,
        secondOutInstrumentToken:basketSecondOutInstrumentToken,
        firstInStrike:basketFirstInStrike,
        secondInStrike:basketSecondInStrike,
        firstOutStrike:basketFirstOutStrike,
        secondOutStrike:basketSecondOutStrike,
        firstInExchangeToken:basketFirstInExchangeToken,
        secondInExchangeToken:basketSecondInExchangeToken,
        firstOutExchangeToken:basketFirstOutExchangeToken,
        secondOutExchangeToken:basketSecondOutExchangeToken     ,
        tradingSymbol:baskettradingSymbol,
        exchange:basketexchange,
        brokerName:basketBrokerName
        }));  
         
    setDiableBasketExecute(true);
    processInsertUpdateOrderBulk(newBucketList);  
  }
  const getSetting=(instrumentname,expiryDate)=>{   
      debugger;      
      const dataSetting=globalConfigPostionData.find((data)=>data.instrumentname===instrumentname && data.expirydate===expiryDate);
      return dataSetting;
  }
  const processInsertUpdateOrderBulk=async(requestNewBucketList)=>{    
    if(globleSelectedTradingType.toLowerCase()==="paper"){
      const objReq={
        orderitems: requestNewBucketList,
        logmessage:"Basket order is executed."
      }
      const resultData=await PaperTradingAPI.processInsertUpdateOrderBulkPaper(objReq);
      if(resultData!=null){
        setDiableBasketExecute(false);
        let basketName="basketName_"+globleSelectedTradingType+globleSelectedClientInfo;
        CookiesConfig.removeLocalStorageItem(basketName);
        setBucketList([]);
        setBusketMargin(Constant.CurrencyFormat(parseFloat(0)))
        setRequiredBusketMargin(Constant.CurrencyFormat(parseFloat(0)))         
          alertify.success("Basket Order added successfully.")
      }else{
        setDiableBasketExecute(false);
      }
    }else{
      let dataInfo={
        logintoken:sessionStorage.getItem("apiSecret"),
        orderitems :requestNewBucketList,
        logmessage:"Basket order is executed."
      }
      const resultData=await LiveTradingAPI.processInsertUpdateOrderBulkLive(dataInfo);
      if(resultData!=null){
        alertify.message(resultData);
        setDiableBasketExecute(false);
        let basketName="basketName_"+globleSelectedTradingType+globleSelectedClientInfo;
        CookiesConfig.removeLocalStorageItem(basketName);
        setBucketList([]);
        setBusketMargin(Constant.CurrencyFormat(parseFloat(0)))
        setRequiredBusketMargin(Constant.CurrencyFormat(parseFloat(0)));
         
          
      }else{
        setDiableBasketExecute(false);
      }
    }
  }
  const processBasketMargin=async()=>{
    debugger;
    if(bucketList!=null){
          if(bucketList.length>0){      
      const processBasket = bucketList.map(({                   
        bucketSide,
        basketexchange,
        baskettradingSymbol,
        bucketOrderType,
        bucketProduct,
        bucketLotTotalQty,
        bucketStickePrice
            }) => ({                
                TransactionType:bucketSide,
                Exchange:basketexchange,
                TradingSymbol:baskettradingSymbol,
                Variety:"regular",
                Product: bucketProduct,
                OrderType: (bucketOrderType==='MKT'?'MARKET':'LIMIT'),
                Quantity: bucketLotTotalQty,
                Price: (bucketOrderType==='MKT'?0:bucketStickePrice),
                TriggerPrice: 0
            }));            
            const dataBasketRequest={basketMarginList:processBasket,logintoken:sessionStorage.getItem("apiSecret")};
            let data=await ZerodaAPI.getMarginBasket(dataBasketRequest);
            debugger;
            setBusketMargin(Constant.CurrencyFormat(parseFloat(data.final.total)))
            setRequiredBusketMargin(Constant.CurrencyFormat(parseFloat(data.initial.total)))
            setBucketList((previousData) => {
              if (previousData !== null && previousData!==undefined) {
                const updatedOrderPosition = previousData.map((position,index) => {
                  debugger;
                  const matchingOption = data.orders.find((item) => {
                    return item.tradingsymbol === position?.baskettradingSymbol.toString() && 
                           item.exchange === position.basketexchange &&
                           data.orders.indexOf(item) === index;
                  });
                  if (matchingOption) {
                    return {
                      ...position,
                      bucketMargin:Constant.CurrencyFormat(parseFloat(matchingOption.total))
                      
                    };
                  }
                })  
                return updatedOrderPosition;               
              }
              return previousData;
            });
          }else{
            setBusketMargin(Constant.CurrencyFormat(parseFloat(0)))
            setRequiredBusketMargin(Constant.CurrencyFormat(parseFloat(0)))
          }
    }
           
  }

  return (
            <>
             <Card className="shadow">
                          
                                <CardBody>
                                  <Row>
                                  <Col xl="3">
                                    
                                      <Row  className='mt-1'> 
                                            <Col xl="4" xs="6" className='py-1'>
                                                   <div className="your-required-wrapper" style={{width: "100%", height: "22px"}}>
        {/* <SwitchSelector           
            options={optionsInfo}             
            backgroundColor={"#FFFFFF"}
            border={ '1px solid #5e72e4'} 
            fontColor={ '#5e72e4'} 
            initial={0}
            value={'future'}
            onChange={handleSwitchSelectorChange}
        /> */}

<CustomSwitch options={optionsInfo} onChange={handleSwitchSelectorChange} />

    </div>
                                            </Col>
                                            <Col xl="4" xs="3" className='py-2' style={{textAlign:"right"}}>
                                            <label  className="form-control-label">
                                                    <span className='quik'>Quik</span><span className='trade'>Trade</span>           
                                                                  </label>
                                            </Col>
                                            <Col xl="3" xs="3" className='py-1'>
                                            <Switch height={20}   onChange={handleChange} checked={switchState} 
                                                      onColor='#2dce89'
                                                      offColor='#808080'
                                                      offHandleColor="#dcdcdc40"
                                                      onHandleColor="#dcdcdc40"  
                                                      uncheckedIcon={
                                                        <div  className='font-9px'
                                                          style={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            height: "100%",                                                            
                                                            color: "#FFFFFF",
                                                            paddingRight: 10,
                                                            paddingLeft:2,
                                                            fontWeight:"bold"
                                                          }}
                                                        >
                                                          No
                                                        </div>
                                                      }
                                                      checkedIcon={
                                                        <div className='font-9px'
                                                        style={{
                                                          display: "flex",
                                                          justifyContent: "center",
                                                          alignItems: "center",
                                                          height: "100%",                                                           
                                                          color: "#FFFFFF",
                                                          paddingRight: 5,
                                                          paddingLeft:15,
                                                          fontWeight:"bold"
                                                        }}
                                                      >
                                                        Yes
                                                      </div>
                                                      }
                                                      uncheckedHandleIcon={
                                                        false
                                                      }
                                                      checkedHandleIcon={
                                                        false
                                                      }
                                                      
                                                      />
                                                     </Col>
                                      </Row>
                                      {globleOptionChainType==='opt'?
                                      <Row className='optionChain mt-1'>
                                        <Col xl="12"> 
                                          {/* <div className="table-container" ref={tableRef} style={{height:height}} class="callPut_ltp"> */}
                                          <div className="table-container" ref={tableRef} class="callPut_ltp">

                                                  <Table className="align-items-center">
                                                                      <thead className="thead-light">
                                                                                  <tr className="text-center">
                                                                                  <th scope="col" style={{width:"40%"}} className='bg bg-success text-white' colSpan={2}>CALL LTP </th>
                                                                                  <th scope="col" style={{width:"20%"}}>Strike</th>   
                                                                                  <th scope="col" style={{width:"40%"}} className='bg bg-danger text-white' colSpan={2}>PUT LTP </th>   
                                                                                  </tr>
                                                                                
                                                                      </thead>
                                                   
                                                                      <tbody>
                                                                              {
                                                                                      sortedCurrentOptionChain.map((data,index) =>(
                                                                                              (
                                                                                                  (index % 2 === 0? (
                                                                                                          <tr className={parseFloat(data.strikePrice)===strikePrices?'selected-strike text-center':'text-center'}  key={index}>                                                                                                
                                                                                                              <td style={{width:"15%"}} className={data.strikePrice<=strikePrices?'bg-warning-light':''}>
                                                                                                                  { data?.ltp?.toString()}
                                                                                                              </td>
                                                                                                              <td  style={{width:"25%"}}  className={data.strikePrice<=strikePrices?'bg-warning-light':''}>
                                                                                                                      <button className='btn btn-success buy-light text-success text-bold' onClick={()=>handleBasketQuickBuySell(data,'Call','Buy')}>  BUY</button>
                                                                                                                      <button className='btn btn-danger text-danger text-bold sell-light' onClick={()=>handleBasketQuickBuySell(data,'Call','Sell')}>  SELL</button>
                                                                                                              </td>                                                                                                 
                                                                                                              <td className={parseFloat(data.strikePrice)===strikePrices?'bg-warning-light text-bold':''}>{data.strikePrice}</td>
                                                                                                              <td style={{width:"25%"}} className={data.strikePrice>=strikePrices?'bg-warning-light':''}>
                                                                                                                      <button className='btn btn-success buy-light text-success text-bold' onClick={()=>handleBasketQuickBuySell(sortedCurrentOptionChain[index+1],'Put','Buy')}> BUY</button>
                                                                                                                      <button className='btn btn-danger text-danger text-bold sell-light' onClick={()=>handleBasketQuickBuySell(sortedCurrentOptionChain[index+1],'Put','Sell')}> SELL</button>
                                                                                                              </td>
                                                                                                              <td style={{width:"15%"}} className={data.strikePrice>=strikePrices?'bg-warning-light':''}> 
                                                                                                              {sortedCurrentOptionChain[index+1]?.ltp}</td>
                                                                                                          </tr>
                                                                                                  ):"")
                                                                                                  
                                                                                              ) 
                                                                                      ))
                                                                              }
                                                                      </tbody>
                                                  </Table>
                                           </div> 
                                        </Col>
                                      </Row>
                                      :<Row className='optionChain mt-1'>
                                         <Col xl="12">
                                         <div className="table-container"   class="callPut_ltp">
                                                  <Table className="align-items-center table-flush header-table"  responsive>
                                                                      
                                                                      <thead className="thead-light">
                                                                                  <tr className="text-center">
                                                                                  <th scope="col">FUTURE</th>
                                                                                  <th scope="col">LTP</th>   
                                                                                  <th scope="col"></th>   
                                                                                  </tr>
                                                                                
                                                                      </thead>
                                                                      <tbody>
                                                                              {
                                                                                      sortedCurrentOptionChain.map((data,index) =>(                                                                                              
                                                                                                <tr>
                                                                                                  <td className="text-center">{ `${data?.name} ${(new Date(data.expiryDate)).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${data?.instrumentType}`
                                                                                                  }</td>
                                                                                                  <td className="text-center">{data.ltp} <span className={calculateLTPPercentage(data.ltp,data.lastDayClosinglp)>=0?'text-success':'text-danger'}>({(calculateLTPPercentage(data.ltp,data.lastDayClosinglp)>=0? '+': '')}{calculateLTPPercentage(data.ltp,data.lastDayClosinglp)})</span> </td>
                                                                                                  <td className="text-right">
                                                                                                            <button className='btn btn-success buy-light text-success text-bold' onClick={()=>handleBasketQuickBuySell(data,'Call','Buy')}>  BUY</button>
                                                                                                            <button className='btn btn-danger text-danger text-bold sell-light' onClick={()=>handleBasketQuickBuySell(data,'Call','Sell')}>  SELL</button>
                                                                                                  </td>
                                                                                                </tr>
                                                                                                )
                                                                                      )
                                                                              }
                                                                              </tbody>
                                                                      
                                                  </Table>
                                          </div>
                                                  
                                         </Col>
                                      </Row>}
                                  </Col>
                                  <Col xl="9" className='busketList' style={{backgroundColor:"#FFFFFF"}}>
                                                  <Row>
                                                    <Col xl="12" className='busketView'>
                                                        <div className="table-container" style={{height:height}} class="busketView_container">
                                                            <Table className="align-items-center" >
                                                                    <thead class="thead-light">
                                                                                <tr className="text-center">                                                                            
                                                                                <th scope="col" style={{width: "8%"}}>Side</th>
                                                                                <th scope="col" style={{width: "7%"}}>Symbol</th>   
                                                                                <th scope="col" style={{width: "7%"}}>Strike</th>   
                                                                                <th scope="col" style={{width: "7%"}}>Expiry</th>  
                                                                                <th scope="col" style={{width: "8%"}}>Type</th>  
                                                                                <th scope="col" style={{width: "8%"}}>Product</th> 
                                                                                <th scope="col" style={{width: "8%"}}>Order Type</th>
                                                                                <th scope="col" style={{width: "9%"}}>Lot</th>                                                                            
                                                                                <th scope="col" style={{width: "9%"}}>Price</th>  
                                                                                <th scope="col" style={{width: "9%"}}>StopLoss</th> 
                                                                                <th scope="col" style={{width: "9%"}}>Target</th>  
                                                                                <th scope="col" style={{width: "9%"}}> Margin</th>                                                                             
                                                                                <th scope="col" colSpan={2} style={{width: "10%"}}>Action</th>                                                                            
                                                                                </tr>
                                                                      </thead>
                                                                      <tbody>{
                                                                     
                                                                        (bucketList!==undefined && bucketList!==null && bucketList.length>0?(
                                                                         
                                                                          bucketList?.map((data,index)=>
                                                                            data!=undefined?
                                                                                (<tr key={index}>
                                                                                
                                                                                <td style={{width: "8%"}} className='text-center cursor-row' onClick={()=>handdleRowChange(data.bucketSide,index,"side")}> 
                                                                                      <span className={ data?.bucketSide?.toLowerCase()==='buy'?'text-success text-bold buy-light':'text-danger text-bold sell-light'}>
                                                                                        { data.bucketSide}
                                                                                      </span>
                                                                                 </td>
                                                                                <td className='text-left'>{data?.bucketSymbol}</td>
                                                                                <td className='text-center'>{
                                                                                 data.bucketStrike==="0"?'---':data?.bucketStrike
                                                                                 }</td>
                                                                                <td className='text-center'>{
                                                                                  Constant.ConvertShortDate(data?.bucketExpiry)
                                                                               
                                                                                }</td>
                                                                                <td className='text-center cursor-row' onClick={()=>(data?.bucketType!=='FUT')?handdleRowChange(data.bucketType,index,"bucketType"):null}>
                                                                                    {data?.bucketType}   
                                                                                </td>
                                                                                <td className='text-center cursor-row'  onClick={()=>handdleRowChange(data.bucketProduct,index,"bucketProduct")}>
                                                                                    
                                                                                <span className={ data.bucketProduct.toLowerCase()==='mis'?'text-product-mis text-bold buy-light':'text-product-nmrd text-bold sell-light'}>
                                                                                      {data.bucketProduct}
                                                                                    </span>
                                                                                    
                                                                                </td>
                                                                                <td className='text-center cursor-row' onClick={()=>handdleRowChange(data.bucketOrderType,index,"bucketOrderType")}>
                                                                                    {data.bucketOrderType}
                                                                                </td>
                                                                                <td className='text-center defaultqty'  onClick={(e)=>handleRowClick(e,index)} >
                                                                                <fieldset className="border">
                                                                                   <legend align="right">{data.bucketLotTotalQty}</legend>
                                                                                  {editBucketRow===true && editBucketRowNo===index?
                                                                                  <Input
                                                                                        className="form-control-alternative form-row-data"
                                                                                        id="input-postal-code"
                                                                                        placeholder="LOT"                                                                
                                                                                        name="defaultQty"  
                                                                                        type="number"
                                                                                        min="1"        
                                                                                        step="1" 
                                                                                        inputMode="numeric"
                                                                                        value={data.bucketSliceQty}  
                                                                                        onKeyDown={(e)=>handleKeyDown(e,index)}
                                                                                        onChange={(e) =>handdleTextBoxEvent(e,index,"bucketSliceQty")} 
                                                                                        onKeyPress={(e) => {
                                                                                          // Prevents non-numeric characters from being entered
                                                                                          if (isNaN(Number(e.key))) {
                                                                                              e.preventDefault();
                                                                                          }
                                                                                      }}
                                                                                    />
                                                                                  : <label>
                                                                                    {data.bucketSliceQty}
                                                                                  </label>
                                                                                  
                                                                                }
                                                                                </fieldset>
                                                                                  
                                                                                  </td>
                                                                                <td className='text-right cursor-row'  onClick={(e)=>data.bucketOrderType==='LMT'?handleRowClick(e,index):null}>
                                                                                {
                                                                                  editBucketRow===true && editBucketRowNo===index && data.bucketOrderType==='LMT'?
                                                                                  <Input
                                                                                        className="form-control-alternative form-row-data text-right"
                                                                                        id="input-postal-code"
                                                                                        style={{marginTop:"3px"}}
                                                                                        placeholder="Price"                                                                
                                                                                        name="defaultQty"   
                                                                                        type="number"
                                                                                        min="1"        
                                                                                        value={data.bucketStickePrice} 
                                                                                        onKeyDown={(e)=>handleKeyDown(e,index)}
                                                                                        onChange={(e) =>handdleTextBoxEvent(e,index,"bucketStickePrice")}                                                     
                                                                                    />
                                                                                  : (data.bucketOrderType==='MKT'?'---':data.bucketStickePrice)
                                                                                }  
                                                                                  
                                                                                  </td>
                                                                                <td className='text-right' onClick={(e)=>handleRowClick(e,index)}>
                                                                                {
                                                                                  editBucketRow===true && editBucketRowNo===index?
                                                                                  <Input
                                                                                        className="form-control-alternative form-row-data text-right"
                                                                                        id="input-postal-code"
                                                                                        placeholder="STOPLOSS"                                                                
                                                                                        name="rowstoploss" 
                                                                                        type="number"
                                                                                        min="1"        
                                                                                        value={data.bucketSL}      
                                                                                        onKeyDown={(e)=>handleKeyDown(e,index)}
                                                                                        onChange={(e) =>handdleTextBoxEvent(e,index,"bucketSL")}                                      
                                                                                    />
                                                                                  : (parseFloat(data.bucketSL)>0? data.bucketSL:'---')
                                                                                  
                                                                                }  
                                                                                </td>
                                                                                <td className='text-right' onClick={(e)=>handleRowClick(e,index)}>
                                                                                {
                                                                                  editBucketRow===true && editBucketRowNo===index?
                                                                                  <Input
                                                                                        className="form-control-alternative form-row-data text-right"
                                                                                        id="input-postal-code"
                                                                                        placeholder="TARGET"                                                                
                                                                                        name="rowTARGET"     
                                                                                        type="number"
                                                                                        min="1"        
                                                                                        value={data.bucketTarget}   
                                                                                        onKeyDown={(e)=>handleKeyDown(e,index)}
                                                                                        onChange={(e) =>handdleTextBoxEvent(e,index,"bucketTarget")}                                            
                                                                                    />
                                                                                  :(parseFloat(data.bucketTarget)>0? data.bucketTarget:'---')
                                                                                  
                                                                                }  
                                                                                  
                                                                                </td>
                                                                                <td className='text-right'>
                                                                                      {
                                                                                        (parseFloat(data.bucketMargin)>0? data.bucketMargin:'---')
                                                                                      }                                                                               
                                                                                </td>
                                                                                <td className='text-center'>
                                                                                {
                                                                                  editBucketRow && editBucketRowNo===index?
                                                                                  <i className='fas fa-check px-1 row_action_icon' onClick={()=>handleBasketEdit('save',index)}></i>:
                                                                                  <i className='fas fa-edit px-1 row_action_icon' onClick={()=>handleBasketEdit('edit',index)}></i>
                                                                                  
                                                                                }
                                                                                  <i className='fas fa-copy px-1 row_action_icon' onClick={()=>handleBucketDataCopy(data,index)}></i>
                                                                                  <i className='fas fa-trash px-1 row_action_icon' onClick={()=>handleBucketDataDelete(data)}></i>                                                                             
                                                                                
                                                                                                            
                                                                                </td>
                                                                                <td>
                                                                                {index>0?
                                                                                  <button className='btn btn-info row_action_icon' onClick={()=>handleBucketSorting(data,'up')}>
                                                                                  <i className='fas fa-arrow-up'></i> </button>:""
                                                                                  }
                                                                                  {(bucketList.length-1)!== index?
                                                                                  <button className='btn btn-danger row_action_icon' onClick={()=>handleBucketSorting(data,'down')}>
                                                                                  <i className='fas fa-arrow-down'></i></button>
                                                                                    :""
                                                                                }                
                                                                                </td>
                                                                                </tr>):''                                                                                  
                                                                          )):'')
                                                                      }
                                                                      </tbody>
                                                            </Table>
                                                        </div>
                                                    </Col>
                                                   </Row>
                                                  <Row className="busketList_btn_container" style={{backgroundColor:"#dcdcdc29" }}>
                                                  <Col xl="2" md="3" xs="6" style={{textAlign:"center",lineHeight:"0.8rem"}} className='py-1 d-flex flex-column'>
                                                  <label className='font-13px'
                                                                  style={{marginBottom:"0px"}}                 >
                                                                      {requiredBusketMargin}
                                                                  </label>
                                                                  
                                                                  <span className='font-10px uppercase'>                                                                
                                                                      <b>Required Margin</b>  
                                                                  </span>
                                                  </Col>
                                                  <Col xl="2" md="3" xs="6" style={{textAlign:"center" ,lineHeight:"0.8rem"}} className='py-1 d-flex flex-column'>
                                                  <label  
                                                                  style={{marginBottom:"0px"}}
                                                                    className='font-13px'
                                                                >
                                                                   {busketMargin}
                                                                  </label>
                                                                   
                                                                  <span className='font-10px uppercase'>                                                                
                                                                      <b>Final Margin</b>  
                                                                  </span>
                                                  </Col>
                                                  <Col xl="5"  md="6" xs="12" className='busketList_btns'>
                                                  <Button                                                         
                                                        color="primary" className='font-10px'                                                        
                                                        href="#pablo"
                                                        onClick={(e) => handleBasketExecuteOrder(e)}
                                                        size="sm"
                                                        disabled={ bucketList?.length===0  ? true : diableBasketExecute}
                                                      >
                                                        Execute
                                                      </Button> 
                                                      <Button
                                                         
                                                        color="danger"    className='font-10px'                                                     
                                                        href="#pablo"
                                                        onClick={handleClearBasket}
                                                        size="sm"
                                                        disabled={ bucketList?.length===0  ? true : diableBasketExecute}
                                                      >
                                                       Clear
                                                      </Button>

                                                      <Button                                                         
                                                         className='font-10px btn-info'                                                     
                                                         href="#pablo"
                                                         onClick={processBasketMargin}
                                                         size="sm"
                                                         disabled={ bucketList?.length===0  ? true : diableBasketExecute}
                                                       >
                                                        Calculate Margin
                                                       </Button>


                                                      </Col>
                                                   
                                              </Row>
                                      </Col>
                                  </Row>
                                   
                                   
                                </CardBody>
                                
                                </Card>
            
            </>
    )
}
export default AdminOptionChain;