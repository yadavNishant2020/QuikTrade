import alertify from "alertifyjs";
import { useState } from "react";
import { createContext } from "react";

const PostContext=createContext();

const PostProvider = ({children}) => {  
    const [globleSymbol, setGlobleSymbol] = useState('initialValue');
    const [globleExpityvalue,setGlobleExpityValue]=useState('');
    const [globleBrokerName,setGlobleBrokerName]=useState('');
    const [globleCurrentStockIndex,setGlobleCurrentStockIndex]=useState('0.00');
    const [globleCurrentStockIndexFuture,setGlobleCurrentStockIndexFuture]=useState('0.00');
    const [globleSymbolList,setGlobleSymbolList]=useState([]);
    const [globleSymbolExpiryList,setGlobleSymbolExpiryList]=useState([]);
    const [globleSelectedClientInfo,setGlobleSelectedClientInfo]=useState('');
    const [globleSelectedTradingType,setGlobleSelectedTradingType]=useState('');
    const [globleOptionListForSymbol,setGlobleOptionListForSymbol]=useState([]);
    const [globleOptionList,setGlobleOptionList]=useState([]);
    const [globleOptionListForSymbolForLTP,setGlobleOptionListForSymbolForLTP]=useState([]);
    const [globleCurrentATM,setGlobleCurrentATM]=useState(0);
    const [globleTabIndex,setGlobleTabIndex]=useState(0);
    const [globleOptionChainType,setGlobleOptionChainType]=useState('');
    const [globleBusketList,setGlobleBusketList]=useState([]);
    const [globleOrderPosition,setGlobleOrderPosition]=useState([]);
    const [globalTarget,setGlobalTarget]=useState(0);
    const [globalTP,setGlobalTP]=useState(0);
    const [globalStopLoss,setGlobalStopLoss]=useState(0);
    const [globleOrderList,setGlobleOrderList]=useState([]);
    const [globleOptionChainList,setGlobleOptionChainList]=useState([]);
    const [globleUniqueChannelData,setGlobleUniqueChannelData]=useState([]);
    const [globleBrokerClientList,setGlobleBrokerClientList]=useState([]);
    const [globleLogList,setGlobleLogList]=useState([]);    
    const [globalServerTime,setServerTime]=useState('');
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    const [globleClosedList,setGlobleClosedList]=useState([]);
    const [globleChangeDefaultSetting,setGlobleChangeDefaultSetting]=useState(0);
    const [globlemltRealized,setGloblemltRealized]=useState(0);
    const [globlePositionChange,setGloblePositionChange]=useState(0);    
    const [globalConfigPostionData,setGlobleConfigPostionData]=useState([]);  

    const [globleFnotraderUserId,setGlobleFnotraderUserId]=useState('');
    const [globleFnotraderSecret,setGlobleFnotraderSecret]=useState('');
  
    const updateGlobleServerTime = (newValue) => {
        setServerTime(newValue);        
    }
    

    const updateGlobleLogList = (newValue) => {
        setGlobleLogList(newValue);        
    }

    const updateGlobleFnotraderUserId = (newValue) => {
        setGlobleFnotraderUserId(newValue);        
    }
    const updateGlobleFnotraderSecret = (newValue) => {
        setGlobleFnotraderSecret(newValue);        
    }
 
    const updateGlobleBrokerClientList = (newValue) => {
        setGlobleBrokerClientList(newValue);        
    }
    

    const updateGlobleBrokerName = (newValue) => {
        setGlobleBrokerName(newValue);        
    }
    

    
    const updateGlobleConfigPostionData = (newValue) => {
        setGlobleConfigPostionData(newValue);
        
    }


    const updateGlobleUniqueChannelData = (newValue) => {
        setGlobleUniqueChannelData(newValue);
        
    }
    
    const updateGlobleOptionChainList = (newValue) => {
        setGlobleOptionChainList(newValue);
        
    }



    const updateGloblePositionChange = (newValue) => {
        setGloblePositionChange((dataValue)=>dataValue+newValue);
        
    }


    const updateGloblemltRealized = (newValue) => {
        setGloblemltRealized((dataValue)=>newValue);
        
    }

    const updateGlobleChangeDefaultSetting = (newValue) => {
        setGlobleChangeDefaultSetting((dataValue)=>dataValue+newValue);
        
    }

    const updateGlobleClosedList = (newValue) => {
        setGlobleClosedList(newValue);
    }

    const updateGlobalTP = (newValue) => {
        setGlobalTP(newValue);
    }

    const updateGlobleOrderList = (newValue) => {
        setGlobleOrderList(newValue);
    }

    const updatePosition = (newValue)=>{
        setGlobleOrderPosition(newValue)
    }

    const updatePositionByIndex = (newValue,index) => {
        
        setGlobleOrderPosition((prevRowData) => { 
            const updatedTempOrderPosition = prevRowData.map((position, i) => {
                if (i === index) {
                    debugger;
                    //let positionnetlot =(position.positionnetlot<0?(-1)*position.positionnetlot:position.positionnetlot)
                    const updatedExtqty = newValue;//positionnetlot > newValue ? newValue : positionnetlot;
                  return {
                    ...position,
                    exitqty: updatedExtqty,
                  };
                }
                return position;
              });
        
              return updatedTempOrderPosition;
            }); 
           
    }
    

    // const updateGlobleOrderList = (newValue) => {
    //     setGlobleOrderList((previousData) => { 
    //         const index = previousData.findIndex((item) => item.orderid.toString() === newValue?.orderid?.toString());
    //         if (index !== -1) {
    //             const data = previousData[index];                 
    //             previousData[index] = {
    //               ...data,
    //                 orderid: newValue.orderid,
    //                 orderreferanceid: newValue.orderreferanceid,
    //                 strikeprice: newValue.strikeprice,
    //                 productname: newValue.productname,
    //                 ordertype: newValue.ordertype,
    //                 expirydate: newValue.expirydate,
    //                 instrumentname: newValue.orderside,
    //                 orderside: newValue.orderside,
    //                 orderqty: newValue.orderqty,
    //                 nooforderlot: newValue.nooforderlot,
    //                 orderprice: newValue.orderprice,
    //                 tradermode: newValue.tradermode,
    //                 orderidbybroker: newValue.orderidbybroker,
    //                 orderdate: newValue.orderdate,
    //                 clientid: newValue.clientid,
    //                 orderstatus: newValue.orderstatus,
    //                 totalprice: newValue.totalprice,
    //                 instrumentToken: newValue.instrumentToken
    //             };          
    //             return [...previousData];
    //         }else{                
    //             return [...previousData,newValue]
    //         }
    //     })
    //   };
   
   
    const updateGlobalStopLoss=(newValue)=>{
        setGlobalStopLoss(newValue);
    }

    const updateGlobalTarget=(newValue)=>{
        setGlobalTarget(newValue);
    }

    const updateGlobleOrderPosition = (newValue) => {
        setGlobleOrderPosition(newValue);
    }
    // const updateGlobleOrderPosition = (newValue) => {
    //     setGlobleOrderPosition((previousData) => { 
    //         const index = previousData.findIndex((item) => item.instrumentToken === newValue?.instrumentToken?.toString());
    //         if (index !== -1) {
    //             const data = previousData[index];

    //             const newOrderCount = parseInt(data.orderCount) + 1;
    //             const newAvgPrice =
    //               (parseFloat(data.avgPrice) * data.orderCount + parseFloat(newValue.ltp)) / newOrderCount;
          
    //             previousData[index] = {
    //               ...data,
    //               orderCount: newOrderCount,
    //               avgPrice: newAvgPrice.toFixed(2),
    //               ltp: parseFloat(newValue.ltp).toFixed(2),
    //             };
          
    //             return [...previousData];
    //         }else{
    //             const updateData={...newValue,ltp:parseFloat(newValue.ltp).toFixed(2),avgPrice:parseFloat(newValue.ltp).toFixed(2),orderCount:1}
    //             return [...previousData,updateData]
    //         }
    //     })
    //   };


    const updatGlobleBusketList = (newValue) => {
        setGlobleBusketList(newValue);
    };

   


    const updatGlobleOptionChainType = (newValue) => {
        setGlobleOptionChainType(newValue);
    };

    const updatGlobleTabIndex = (newValue) => {
        setGlobleTabIndex((dataValue)=>dataValue+newValue);
    };

    const updateGlobleSelectedTradingType = (newValue) => {
        setGlobleSelectedTradingType(newValue);
    };

    const updateGlobleSelectedClientInfo = (newValue) => {
        setGlobleSelectedClientInfo(newValue);
    };


    const updateGlobleSymbol = (newValue) => {
        setGlobleSymbol(newValue);
    };

    const updateGlobleExpityValue = (newValue) => {
        setGlobleExpityValue(newValue);
    };

    const updateGlobleCurrentStockIndex = (newValue) => {
        setGlobleCurrentStockIndex(newValue);
    };

    const updateGlobleCurrentStockIndexFuture = (newValue) => {
        setGlobleCurrentStockIndexFuture(newValue);
    };

    const updateGlobleSymbolList = (newValue) => {
        setGlobleSymbolList(newValue);
    };

    const updateGlobleSymbolExpiryList = (newValue) => {
        setGlobleSymbolExpiryList(newValue);
    };

    const updateGlobleOptionListForSymbol = (newValue) => {
        setGlobleOptionListForSymbol(newValue);
    };

    const updateGlobleOptionListForSymbolElementValue = (index, newValue) => {
        // Clone the array to avoid mutation
        const newArray = [...globleOptionListForSymbol];
        
        // Update the element at the specified index
        newArray[index] = newValue;
    
        // Set the updated array back in context
        setGlobleOptionListForSymbol(newArray);
      };




    const updateGlobleOptionList = (newValue) => {
        setGlobleOptionList(newValue);
    };


    const updateGlobleOptionListForSymbolForLTP = (newValue) => {
        setGlobleOptionListForSymbolForLTP(newValue);
    };
    
    const updateGlobleCurrentATM = (newValue) => {
        setGlobleCurrentATM(newValue);
    };
    


    
    
    const contextValues = {
        globleSymbol,
        globleExpityvalue,
        globleCurrentStockIndex,
        globleCurrentStockIndexFuture,
        globleSymbolList,
        globleSymbolExpiryList,
        globleSelectedClientInfo,
        globleSelectedTradingType,
        globleOptionListForSymbol,
        globleOptionList,
        globleOptionListForSymbolForLTP,
        globleCurrentATM,
        globleTabIndex,
        globleOptionChainType,
        globalStopLoss,
        globalTarget,
        globleOrderPosition,
        globleOrderList,
        globalTP,
        globleClosedList,
        globleChangeDefaultSetting, 
        globlemltRealized,
        globlePositionChange,
        screenSize,
        globleOptionChainList,
        globleUniqueChannelData,
        globalConfigPostionData,
        globleBrokerName,
        globleBrokerClientList,
        globleFnotraderUserId,
        globleFnotraderSecret,
        globleLogList,
        globalServerTime,
        updateGlobleLogList,
        updateGloblemltRealized,
        updateGlobleSymbol,
        updateGlobleExpityValue,
        updateGlobleCurrentStockIndex,
        updateGlobleCurrentStockIndexFuture,
        updateGlobleSymbolList,
        updateGlobleSymbolExpiryList,
        updateGlobleSelectedTradingType,
        updateGlobleSelectedClientInfo,
        updateGlobleOptionListForSymbol,
        updateGlobleOptionList,
        updateGlobleOptionListForSymbolForLTP,
        updateGlobleOptionListForSymbolElementValue,
        updateGlobleCurrentATM,
        updatGlobleTabIndex,
        updatGlobleOptionChainType,
        updateGlobleOrderPosition,
        updateGlobalStopLoss,
        updateGlobalTarget,
        updateGlobleOrderList,
        updateGlobalTP,
        updatePositionByIndex,
        updatePosition,
        updateGlobleClosedList,
        updateGlobleChangeDefaultSetting,
        updateGloblePositionChange,
        updateGlobleOptionChainList,
        updateGlobleUniqueChannelData,
        updateGlobleConfigPostionData,
        updateGlobleBrokerName,
        updateGlobleBrokerClientList,
        updateGlobleFnotraderUserId,
        updateGlobleFnotraderSecret,
        updateGlobleServerTime
      };
    return (
        <PostContext.Provider
            value={contextValues}>
            {children}
        </PostContext.Provider>
    )
}

export {PostProvider,PostContext}