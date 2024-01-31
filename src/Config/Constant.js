export const Constant = {
    ConvertShortDate : (datestring) => {
        const dateObject = new Date(datestring);
        const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(dateObject);
        const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(dateObject);
        const formattedDate = `${day} ${month}`;
        return formattedDate;
    },CurrencyFormat:(num)=>{          
        if(num!=undefined)
            if(num !=null){
                    if(num==='NaN'){
                        return (0).toLocaleString('en-IN');
                    }else{                 
                        //const floatValue = (num / 100).toFixed(2)
                    return   (num).toLocaleString('en-IN',{
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      });
                    }
            }else{
                return (0).toFixed(2).toLocaleString('en-IN');
            }
        else    
            return (0).toFixed(2).toLocaleString('en-IN');
     },GetNewStrike:(ordersymbol,currentString,orderType)=>{        
        let strikeDiff=0;
        let newFirstInStrike=0;
        let newSecondInStrike=0;
        let newFirstOutStrike=0;
        let newSecondOutStrike=0;
        if(ordersymbol==="NIFTY"){
                strikeDiff=50;
        }else  if(ordersymbol==="BANKNIFTY"){
                strikeDiff=100;
        }else  if(ordersymbol==="FINNIFTY"){
                strikeDiff=50;
        } else if(ordersymbol==="SENSEX"){
                strikeDiff=100;
        } else if(ordersymbol==="MIDCPNIFTY"){
                strikeDiff=25;
        }
        if(orderType==='CE'){
            newFirstInStrike=parseInt(currentString)-strikeDiff;
            newSecondInStrike=parseInt(currentString)-(2*strikeDiff);
            newFirstOutStrike=parseInt(currentString)+strikeDiff;
            newSecondOutStrike=parseInt(currentString)+(2*strikeDiff);
        }else{
            newFirstOutStrike=parseInt(currentString)-strikeDiff;
            newSecondOutStrike=parseInt(currentString)-(2*strikeDiff);
            newFirstInStrike=parseInt(currentString)+strikeDiff;
            newSecondInStrike=parseInt(currentString)+(2*strikeDiff);
        }
        let data={};
        data["newFirstInStrike"]=newFirstInStrike;
        data["newSecondInStrike"]=newSecondInStrike;
        data["newFirstOutStrike"]=newFirstOutStrike;
        data["newSecondOutStrike"]=newSecondOutStrike;
        return data;


},GetStrikeToken:(data,ordersymbol,orderexpiry,currentStrikePrice,orderType)=>{
    debugger;
    let filterData=data.find((dataInfo)=>dataInfo.name===ordersymbol 
                            && dataInfo.expiryDate===orderexpiry
                            && dataInfo.strikePrice===currentStrikePrice.toString()
                            && dataInfo.instrumentType===orderType)
    return filterData?.instrumentToken;

},GetStrikeExchangeToken:(data,ordersymbol,orderexpiry,currentStrikePrice,orderType)=>{     
    let filterData=data.find((dataInfo)=>dataInfo.name===ordersymbol 
                            && dataInfo.expiryDate===orderexpiry
                            && dataInfo.strikePrice===currentStrikePrice.toString()
                            && dataInfo.instrumentType===orderType)
    return filterData?.exchangeToken;

},GetTradaingSymbol:(data,ordersymbol,orderexpiry,currentStrikePrice,orderType)=>{
    debugger;
    let filterData=data.find((dataInfo)=>dataInfo.name===ordersymbol 
                            && dataInfo.expiryDate===orderexpiry
                            && dataInfo.strikePrice===currentStrikePrice.toString()
                            && dataInfo.instrumentType===orderType)
    return filterData?.tradingSymbol;

},GetStrikeExchange:(data,ordersymbol,orderexpiry,currentStrikePrice,orderType)=>{
    debugger;
    let filterData=data.find((dataInfo)=>dataInfo.name===ordersymbol 
                            && dataInfo.expiryDate===orderexpiry
                            && dataInfo.strikePrice===currentStrikePrice.toString()
                            && dataInfo.instrumentType===orderType)
    return filterData?.exchange;

}

      
}