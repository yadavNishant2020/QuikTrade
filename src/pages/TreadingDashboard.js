
import {React,useEffect,useState, useLayoutEffect, useRef} from 'react'
import AdminStockIndex from "../components/AdminStockIndex.js";
import AdminDefaultConfig from "../components/AdminDefaultConfig.js";
import AdminOptionChain from "../components/AdminOptionChain.js";
import AdminOptionChainSetup from "../components/AdminOptionChainSetup.js";
import AdminOrderPositionDetails from "../components/AdminOrderPositionDetails.js";
import AdminStraddle from "../components/AdminStraddle.js";
import AdminStrangle from "../components/AdminStrangle.js";
import AdminOrderFooter from "../components/AdminOrderFooter.js";
import AdminRule from "../components/AdminRule.js";
import AdminCompletedOrder from "../components/AdminCompletedOrder.js";
import { ZerodaAPI } from "../api/ZerodaAPI";
import Centrifuge from 'centrifuge';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
 
import { Container, Row, Col,   Button,
   Card,
   CardHeader,
   CardBody,
   NavItem,
   NavLink,
   Nav,
   Progress,
   Table } from "reactstrap";
   import { PostProvider,PostContext } from '../PostProvider.js';
   import { useContext } from 'react';  
   import AdminFooter from "../components/AdminFooter.js";
   import { PaperTradingAPI } from '../api/PaperTradingAPI.js';

const TreadingDashboard = () => {
    const divRef = useRef(null);

    const [configOpenSlider,setConfigOpenSlider]=useState(false);    
    const [ruleOpenSlider,setRuleOpenSlider]=useState(false);
    const [sideMenuTroggle,setSideMenuTroggle]=useState(false);
    const [sideMenuName,setSideMenuName]=useState('');
    const [optionChainList,setOptionChainList]=useState([]);
    const [filterOptionChainList,setFilterOptionChainList]=useState([]);
    const [filterFutureChainList,setFilterFutureChainList]=useState([]);
    const [totalRows,setTotalRows]=useState(0);
    const [initSocket,setInitSocket]=useState(false);
    const [centrifugeInstance, setCentrifugeInstance] = useState(null);
    const [baseTable,setBaseTable]=useState(false);
    const [strickPrices,setStrickPrices]=useState(0);
    const [channelStatus,setChannelStatus]=useState(0);
    const [channelProcessStatus,setChannelProcessStatus]=useState(0);
    const [filterOrderPositionList,setOrderPositionList]=useState([]);
    const [height, setHeight] = useState(0)


    const centrifugeInstanceNew = new Centrifuge('wss://stock-api.fnotrader.com/connection/websocket');
    const { globleSymbol,
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
      globalServerTime
   } = useContext(PostContext);
    
    useEffect(()=>{ 
      getOptionChainList(); 

    },[]);
 
    useLayoutEffect(() => {
      const handleResize = () => {
        setHeight(divRef?.current?.children[0]?.clientHeight);
        

      };
      handleResize();
      window.addEventListener('resize', handleResize);
  
      return () => {
        window.removeEventListener('resize', handleResize);
      }
    }, []);

    useEffect(()=>{ 
      if(globleSelectedClientInfo.length>0 && globleSelectedTradingType.length>0){
        let data={
          clientId:globleSelectedClientInfo   ,
          tradermode:globleSelectedTradingType        
          }
          getallconfigforpositionData(data);    
      }
     },[globleChangeDefaultSetting,globleSelectedClientInfo,globleSelectedTradingType]); 





    const getallconfigforpositionData=async (requestData)=>{     
         
      const resultData=await PaperTradingAPI.getallconfigforposition(requestData);   
              
      if(resultData!=null){
              //console.log(resultData);
              updateGlobleConfigPostionData(resultData);
      }
  }
  
    useEffect(() => {
      if (globleSymbol.length > 0 && globleExpityvalue.length > 0) {
        
        setBaseTable([]);
        setFilterOptionChainList([]);
        if (centrifugeInstance) {
          // Disconnect the existing WebSocket instance
          centrifugeInstance.disconnect();
        }
  
        // Create a new Centrifuge instance
        const newCentrifugeInstance = new Centrifuge('wss://stock-api.fnotrader.com/connection/websocket');
  
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

    const processOptionChainArray=()=>{
      let dataInfo=[];
      if(globleOptionChainType==='opt'){
              dataInfo=optionChainList.filter((data)=>
              data.name===globleSymbol && data.expiryDate===globleExpityvalue && 
              data.strikePrice>0 && data.tokenType===globleOptionChainType);              
              const newoptionChainData = dataInfo.slice().sort((a, b) => {
                  const strickComparison = parseFloat(a.strikePrice) - parseFloat(b.strikePrice);
                  return strickComparison === 0 ? a.instrumentType.localeCompare(b.instrumentType) : strickComparison;
                }).map((data) => data?.strikePrice);

                let infoOptionChain=getElementRange([...new Set(newoptionChainData)],strickPrices,10,"strikePrice");
                const filteredArray = dataInfo.filter(item => infoOptionChain.includes(item.strikePrice));
                setBaseTable(filteredArray);
                setFilterOptionChainList(filteredArray);
      }else{
            dataInfo=optionChainList.filter((data)=>
            data.name===globleSymbol    && 
            data.tokenType===globleOptionChainType);

            setBaseTable(dataInfo);
                setFilterOptionChainList(dataInfo);
      } 
    }

    const getElementRange = (arr, targetId, range, key) => {      
      const targetIndex = arr.findIndex((item) => item === targetId.toString());    
      if (targetIndex === -1) {
        return [];
      }    
      const startIndex = Math.max(0, targetIndex - range);
      const endIndex = Math.min(arr.length - 1, targetIndex + range);    
      return arr.slice(startIndex, endIndex + 1);
    };

    useEffect(()=>{  
      if(globleOptionChainType.length>0 && optionChainList?.length===totalRows && optionChainList?.length>0 && globleSymbol.length>0 && globleExpityvalue.length>0){
        setChannelStatus(0);            
        processOptionChainArray();
      }    
    },[optionChainList,globleSymbol,globleExpityvalue,strickPrices,globleOptionChainType])





    useEffect(()=>{  
      if(parseFloat(globleCurrentStockIndex)>0){  
        const valueStr = Math.round(globleCurrentStockIndex).toString();
        let last2 = parseInt(valueStr.slice(-2));
        let diff = 0;
        let atm_price;
        if(last2 >= 90)
        {
          diff = 100 - last2; 
          atm_price = parseInt(valueStr) + diff;
        }
        else if(last2 < 90)
        {
          atm_price = parseInt(valueStr) - last2;
        }
        else
        {
          atm_price = parseInt(valueStr);
        }         
        updateGlobleCurrentATM(parseInt(atm_price))
      }
  },[globleCurrentStockIndex])


    const handleRuleSilder=()=>{
        setRuleOpenSlider((ruleOpenSlider)=>!ruleOpenSlider);
    }


    const getOptionChainList=async ()=>{       
      
      let data = await ZerodaAPI.getOptionChainList();       
      if(data!=null){
        setTotalRows(data.length);
        setOptionChainList(data);
        updateGlobleOptionChainList(data);
      }    
    }

    



    const processOptionChain = () => {
         
          // Initialize Centrifuge client
            const centrifugeInstanceNew = new Centrifuge('wss://stock-api.fnotrader.com/connection/websocket');
            // Connect to the server
            //let selectedChannel=optionChainList.find((data)=>data.underlying===globleSymbol && data.expiryDate===globleExpityvalue)
            centrifugeInstanceNew.on('connect', () => {                                   
              baseTable.map((cName) => {  
            // Subscribe to the channel (replace 'your-channel' with the actual channel name)
                      if (cName.instrumentToken !== undefined) { 
                          const channel = centrifugeInstanceNew.subscribe(cName.instrumentToken);
                          // Event listener for messages on the channel
                          channel.on('publish', (data) => {  
                           
                            setChannelStatus(1);                   
                            if (data.data !== null) {
                            //console.log(data.data)
                            let infodata=data.data;
                              //rocessOptionChainLtp(data.data);
                              setFilterOptionChainList((previousData) => { 
                                if(previousData!=undefined){                        
                                    updatGlobleTabIndex(1);                                                   
                                    const index = previousData.findIndex((item) => item.instrumentToken === infodata?.token?.toString());
                                    if (index !== -1) {
                                      previousData[index].ltp = parseFloat(infodata.lp).toFixed(2);
                                      previousData[index].atp = parseFloat(infodata.atp).toFixed(2);                            
                                      return previousData;
                                    }else{                            
                                      const tempBaseTable = baseTable.find((item) => item.instrumentToken === infodata?.token?.toString());
                                      const updateData={...tempBaseTable,ltp:parseFloat(infodata.lp).toFixed(2),atp:parseFloat(infodata.atp).toFixed(2)}
                                      return [...previousData,updateData]
                                    }
                                  }else{
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
              })
         
        });
        centrifugeInstanceNew.on('disconnect', () => {
          setChannelStatus(0);
          callApiToGetPreviosDayData();
          //console.log('Disconnected from Centrifuge');
        });
        // Connect to Centrifuge server
        centrifugeInstanceNew.connect();
    
        // Cleanup on component unmount
        return () => {
         console.log('Cleaning up Centrifuge');
         centrifugeInstanceNew.disconnect();
        }; 
    }


    const isMarketHours = () => {         
      if(globalServerTime!==""){    
      const receivedTime = new Date(globalServerTime);
      const marketOpenTime = new Date();
      marketOpenTime.setHours(9, 15, 0, 0); // 9:15 AM
      const marketCloseTime = new Date();
      marketCloseTime.setHours(15, 30, 0, 0); // 3:30 PM
      return receivedTime >= marketOpenTime && receivedTime <= marketCloseTime;
    }else{
      return true;
    }
  };

    const callApiToGetPreviosDayData=async ()=>{
      if(baseTable?.length>0){
          baseTable.map(async  (cName) => {
               const result =await ZerodaAPI.callApiToGetPreviosDayDataForChannel(cName.instrumentToken);
               const{code,data}=result;
               let infodata=data[cName.instrumentToken];
               setFilterOptionChainList((previousData) => { 
                if(previousData!=undefined){                        
                    updatGlobleTabIndex(1);                                                   
                    const index = previousData.findIndex((item) => item.instrumentToken === infodata?.token?.toString());
                    if (index !== -1) {
                      previousData[index].ltp = parseFloat(infodata.lp).toFixed(2);
                      previousData[index].atp = parseFloat(infodata.atp).toFixed(2);                            
                      return previousData;
                    }else{                            
                      const tempBaseTable = baseTable.find((item) => item.instrumentToken === infodata?.token?.toString());
                      const updateData={...tempBaseTable,ltp:parseFloat(infodata.lp).toFixed(2),atp:parseFloat(infodata.atp).toFixed(2)}
                      return [...previousData,updateData]
                    }
                  }else{
                    // let dataInfo=optionChainList.filter((data)=>data.name===globleSymbol && data.expiryDate===globleExpityvalue && data.strikePrice>0 );
                    // setBaseTable(dataInfo);
                  }
                });
     
             })

             setInterval(function(){updatGlobleTabIndex(1);      },1000)
       }
     }


    useEffect(()=>{  
      if(parseFloat(globleCurrentStockIndex)>0){  

        const valueStr = Math.round(globleCurrentStockIndex).toString();
        let last2 = parseInt(valueStr.slice(-2));
        let diff = 0;
        let atm_price;
        if(last2 >= 90)
        {
          diff = 100 - last2; 
          atm_price = parseInt(valueStr) + diff;
        }
        else if(last2 < 90)
        {
          atm_price = parseInt(valueStr) - last2;
        }
        else
        {
          atm_price = parseInt(valueStr);
        }        
        setStrickPrices(parseInt(atm_price));
        updateGlobleCurrentATM(parseInt(atm_price))
      }
  },[globleCurrentStockIndex])



      useEffect(()=>{  
      
      if(parseFloat(globleCurrentStockIndex)>0 && optionChainList.length>0){ 
        
         const newoptionChainData=  optionChainList.filter((data)=>data.name===globleSymbol && data.expiryDate===globleExpityvalue && data.tokenType==='opt')
        if(newoptionChainData.length>0){
                
                const differences =newoptionChainData.map(dataInfo => Math.abs(globleCurrentStockIndex - parseFloat(dataInfo.strikePrice)));
                const nearestValueIndex = differences.indexOf(Math.min(...differences));
                const nearestValue = newoptionChainData[nearestValueIndex]?.strikePrice;
                
                setStrickPrices(parseInt(nearestValue));
                updateGlobleCurrentATM(parseInt(nearestValue))
        }

         
      }
  },[globleCurrentStockIndex,optionChainList,globleSymbol,globleExpityvalue,globleOptionChainType])

  
  useEffect(()=>{        
    if(globleUniqueChannelData?.length>0){                     
        processPositionDataFromSocket()
    }else{          
      
    }
  },[globleUniqueChannelData])


  const callApiToGetPreviosDayDataForPosition=async ()=>{
    if(globleUniqueChannelData?.length>0){
      globleUniqueChannelData.map(async  (cName) => {
             const result =await ZerodaAPI.callApiToGetPreviosDayDataForChannel(cName);
             const{code,data}=result;
             let infodata=data[cName];
             setOrderPositionList((previousData) => { 
              if(previousData!=undefined){                        
                  updateGloblePositionChange(1);                                                    
                  const index = previousData.findIndex((item) => item.instrumentToken === infodata?.token?.toString());
                  if (index !== -1) {
                    previousData[index].ltp = parseFloat(infodata.lp).toFixed(2);                                             
                    return previousData;
                  }else{                            
                    const updateData={instrumentToken:infodata.token.toString(),ltp:parseFloat(infodata.lp).toFixed(2)}
                    //  const updateData={...tempBaseTable,ltp:getRandomFloat(getRandomFloat(1.0, 10.0)).toFixed(2)}
                    return [...previousData,updateData]
                  }
                }else{
                  // let dataInfo=optionChainList.filter((data)=>data.name===globleSymbol && data.expiryDate===globleExpityvalue && data.strikePrice>0 );
                  // setBaseTable(dataInfo);
                }
              });
   
           })

           setInterval(function(){updatGlobleTabIndex(1); },1000)
     }
   }

  const processPositionDataFromSocket = () => {         
    // Initialize Centrifuge client
      
      // Connect to the server   
      const centrifugePositionInstanceNew = new Centrifuge('wss://stock-api.fnotrader.com/connection/websocket');       
      centrifugePositionInstanceNew.on('connect', () => {
        
        if(!isMarketHours()){
          callApiToGetPreviosDayDataForPosition()
        }

        globleUniqueChannelData.forEach((cName) => {                              
                // Subscribe to the channel (replace 'your-channel' with the actual channel name)
                if (cName !== undefined) { 
                    const channel = centrifugePositionInstanceNew.subscribe(cName);
                    // Event listener for messages on the channel
                    channel.on('publish', (data) => {   
                        setChannelStatus(1);        
                        if (data.data !== null) {                         
                         let infodata=data.data;  
                         setOrderPositionList((previousData)=>{                                    
                            if (previousData != null) {                                   
                                    updateGloblePositionChange(1);                                            
                                    const index = previousData.findIndex((item) => item.instrumentToken === infodata?.token?.toString());
                                   // const tempBaseTable = globleUniqueChannelData.find((item) => item=== infodata?.token?.toString());
                                    if (index !== -1) {                                             
                                        previousData[index].ltp = parseFloat(infodata.lp).toFixed(2); 
                                       // previousData[index].ltp = parseFloat(getRandomFloat(1.0, 10.0)).toFixed(2);                                           
                                        return [...previousData];
                                    }else{                                        
                                        const updateData={instrumentToken:infodata.token.toString(),ltp:parseFloat(infodata.lp).toFixed(2)}
                                        //  const updateData={...tempBaseTable,ltp:getRandomFloat(getRandomFloat(1.0, 10.0)).toFixed(2)}
                                        return [...previousData,updateData]
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
            
        })
   
  });
  centrifugePositionInstanceNew.on('disconnect', () => {        
    //console.log('Disconnected from Centrifuge');
    setChannelStatus(0);       
  });
  // Connect to Centrifuge server
  centrifugePositionInstanceNew.connect();

  // Cleanup on component unmount
  return () => {
    console.log('Cleaning up Centrifuge');
   centrifugePositionInstanceNew.disconnect();
  }; 
}

const getRandomFloat = (min, max) => {
  return Math.random() * (max - min) + min;
};


    const processOffLineOptionChain = async () => {   
            setInitSocket(true);        
            optionChainList.map(async (cName) => {  
              
            // Subscribe to the channel (replace 'your-channel' with the actual channel name)
            if (cName.instrumentToken !== undefined) { 
                const result =await  ZerodaAPI.callApiToGetPreviosDayDataForChannel(cName.instrumentToken);
                
            }
        })
    }

    useEffect(()=>{       
      if(baseTable?.length>0){
        debugger;
        if(!isMarketHours()){                
          callApiToGetPreviosDayData()
        } else{
          processOptionChain();  
        }
              
      }
    },[baseTable])




      const handleSideMenuTroggle=(menuname)=>{
        setSideMenuName(menuname);
        setSideMenuTroggle((sideMenuTroggle)=>!sideMenuTroggle)
      }

    return (
       <>    
         <Container fluid style={{}}>
          <div style={{"width":"100%", height:"100%"}}>
         
                    <div className={sideMenuTroggle?'full-open mainpanel':'full-close mainpanel'} ref={divRef}>
                                <Row className='dashboard mt-1 optionchaindashboard'  id="_optionchaindashboard_id">                                
                                    <Col xl="12" className='firstDiv' >                                      
                                                <Tabs style={{backgroundColor:"#FFFFFF"}}>
                                                    <TabList>
                                                    <Tab>Basket</Tab>
                                                    <Tab>Straddle</Tab>
                                                    <Tab>Strangle</Tab>
                                                   
                                                    <Tab>Rules</Tab>
                                                    </TabList>

                                                    <TabPanel>
                                                        <AdminOptionChain filterOptionChainList={filterOptionChainList} height={height}/>
                                                    </TabPanel>
                                                    <TabPanel>
                                                        <AdminStraddle  filterOptionChainList={filterOptionChainList} height={height} /> 
                                                    </TabPanel>
                                                    <TabPanel>                                        
                                                        <AdminStrangle filterOptionChainList={filterOptionChainList} height={height}/>                                         
                                                    </TabPanel>
                                                   
                                                    <TabPanel>
                                                          <AdminRule />    
                                                    </TabPanel>
                                                </Tabs>
                                            
                                            
                                      
                                    </Col>
                                  
                                </Row>
                                    <Row  className="dashboard mt-1 positiondashboardlist">
                                            <Col xl="12">
                                          
                                                            <AdminOrderPositionDetails filterOrderPositionList={filterOrderPositionList} height={height}/>
                                                        
                                            </Col>
                                    </Row>
                                    <Row   className="dashboard mt-1 orderdashboardlist">
                                            <Col xl="8">
                                            <Tabs style={{backgroundColor:"#FFFFFF"}}>
                                                <TabList>
                                                        <Tab>Orders</Tab>
                                                        </TabList>
                                                        <TabPanel>
                                            <AdminCompletedOrder />
                                            </TabPanel>
                                               </Tabs>
                                            </Col>
                                            <Col xl="4">
                                            <AdminOrderFooter />
                                              </Col>
                                    </Row>
                                    <AdminFooter />
                    </div>
                    <div className={sideMenuTroggle?'sidepanel':'hide sidepanel'}>
                      {sideMenuName?<AdminDefaultConfig/>:""}
                    </div>
                    <div className='sidemenu'>
                       <Row>
                            <Col xl="12 pt-1 text-center text-theam" >
                                <i className='fas fa-gear' onClick={() => handleSideMenuTroggle('Setting')}></i>
                            </Col>
                            <Col  xl="12">
                            <hr/>
                            </Col>
                       </Row>
                       
                       
                    </div>
                
            </div>
          </Container>
      </>
   )
}
export default TreadingDashboard;