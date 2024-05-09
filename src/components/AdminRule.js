import React, { useEffect, useState,useContext } from 'react' 
import Switch from "react-switch";
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
   import { CookiesConfig } from "../Config/CookiesConfig.js";
   import ZerodaAPI from "../api/ZerodaAPI.js";
   import alertify from 'alertifyjs';
   import { PostProvider,PostContext } from '../PostProvider.js';
const AdminRule = (height) => {
  const [selectedAttribute,setSelectedAttribute]=useState('');
  const [selectedArthmaticSymbolList,setSelectedArthmaticSymbolList]=useState('');  
  const [multipleCondition,setMultipleCondition]=useState([]);
  const [switchActiveState,setSwitchActiveState]=useState(false);
  const [stockSymbolInformation, setStockSymbolInformation] = useState([]);
  const [symbolSelect, setSymbolSelect] = useState("");
  const [createRuleConfig, setCreateRuleConfig] = useState({
    ruleid:"0",
    instrumentname:"",
    stockattribute:"",
    stockattributevalue:"",  
    symbol:"", 
    symbolvalue:"", 
    waittick:"",    
    rulestatus:false,  
    clientid:sessionStorage.getItem("clienttoken"),
    brokername:sessionStorage.getItem("brokername"),
    tradingmode:sessionStorage.getItem("tradingtype")
  });
  const [tableInformation, setTableInformation] = useState(true);
  const [previousRuleList, setPreviousRuleList] = useState([]);
  const [editRule, setEditRule] = useState(true);
  const {      
    globleSelectedClientInfo,     
    globleSelectedTradingType
  } = useContext(PostContext); 

  const stockAttribute = [
    { value: "SPOT LTP", label: "SPOT LTP" },
    { value: "FUT LTP", label: "FUT LTP" },
    { value: "CE LTP", label: "CE LTP" },
    { value: "PE LTP", label: "PE LTP" },
    { value: "COMBINED LTP", label: "COMBINED LTP" },
    { value: "TIME", label: "TIME" }
  ];

  useEffect(()=>{
    addelementtoconditionarray(0);
    setSymbolData();
  },[]);

  const addNewRowToCondition=()=>{
    addelementtoconditionarray(1);
  }


  useEffect(()=>{
    if( globleSelectedClientInfo.length>0 && globleSelectedTradingType.length>0){
     
      getruledata();
    }
 },[globleSelectedClientInfo,globleSelectedTradingType])

 const getruledata = (e) => {
  getruledataList();
};

const getruledataList=async()=>{
  let objRequest={
    clientid:sessionStorage.getItem("clienttoken"),
    brokername:sessionStorage.getItem("brokername") ,
    tradingMode:globleSelectedTradingType
  }
  const resultData = await ZerodaAPI.getruledata(objRequest);
  if(resultData!=null){ 
      setPreviousRuleList(resultData);
   }
}


  const addelementtoconditionarray=(identity)=>{
    const newRandomNumber = Math.floor(Math.random() * 100) + 1;
  
    let multipleConditionArray=identity===0?[]:multipleCondition;
    let model={};
    model["ruledetailid"]="0";
    model["orderside"]="BUY";
    model["orderqty"]="";
    model["ordertype"]="CE";
    model["ordertypevalue"]="";
    model["rowsrno"]=newRandomNumber;
    multipleConditionArray.push(model);        
    setMultipleCondition(multipleConditionArray);
  }

  const removeItem = (idToRemove) => {
    setMultipleCondition(prevItems => prevItems.filter(item => item.rowsrno !== idToRemove));
  };


  const arthmaticSymbolList = [
    { value: "EQ", label: "EQ" },
    { value: "GT", label: "GT" },
    { value: "GE", label: "GE" },
    { value: "LT", label: "LT" },
    { value: "LE", label: "LE" } 
  ];
  

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

const handdleRowChange=(refValue,index,refType)=>{

  if(refType==="orderside"){
    setMultipleCondition((prevRowData) => {            
      const updatedRowData = [...prevRowData]; // Create a copy of the array
      updatedRowData[index].orderside =
      refValue.toLowerCase() === "buy" ? "SELL" : "BUY"; 
      return updatedRowData;
    })
  }
  if(refType==="ordertype"){
    setMultipleCondition((prevRowData) => {            
      const updatedRowData = [...prevRowData]; // Create a copy of the array
      updatedRowData[index].ordertype =
      refValue.toLowerCase() === "ce" ? "PE" : "CE"; 
      return updatedRowData;
    })
  }

}

const handleActiveChange=()=>{  
  setSwitchActiveState((switchState)=>!switchState); 
  setCreateRuleConfig({
    ...createRuleConfig,
    rulestatus: !createRuleConfig.rulestatus,
  });
}

const setSymbolData = () => {
  let stockSymbols = JSON.parse(CookiesConfig.getCookie("symbolList"));
  stockSymbols.unshift("");
  const StockSymbolList = stockSymbols.map((cl) => {
    return {
      label: cl,
      value: cl,
    };
  });
  setStockSymbolInformation(StockSymbolList);
};

const handleSymbolChange = (e) => {
  setSymbolSelect(e);  
  setCreateRuleConfig({
    ...createRuleConfig,
    instrumentname: e.value,
  });
};

const handleRulesConfig = async(e) => {
    debugger;
    if(createRuleConfig.rulestatus===true){
      createRuleConfig.rulestatus="1";
    }else{
      createRuleConfig.rulestatus="0";
    }

    let objRequest={
        masterrule:createRuleConfig,
        detailsrule:multipleCondition
    }
    const resultData = await ZerodaAPI.processInsertUpdateRuleData(objRequest);
    if(resultData!=null){        
      if(editRule===false){
        alertify.success("Rule information saved successfully.");
        clearRuleData();
      }else{
        alertify.success("Rule information updated successfully.");
        setTableInformation(true);
        clearRuleData();
        getruledataList();
      }   
    }
};

const deleteRecord=(ruleid)=>{  
  alertify.confirm(
    "Information",
    "Do you want to delete selected rule ?",
    () => {
      processDeleteRuleData(ruleid);
    },
    () => {}
  );

}

const processDeleteRuleData=async(ruleid)=>{
  let objRequest={
    ruleid:ruleid.toString()     
}
  const resultData = await ZerodaAPI.processDeleteRuleData(objRequest);
  if(resultData!=null){  
    alertify.success("Rule information deleted successfully.")
    getruledata();

  }
}

const editRecord=async(ruleid)=>{  
  let objRequest={
    ruleid:ruleid.toString()     
  }
  const resultData = await ZerodaAPI.getRuleDataById(objRequest);
  if(resultData!=null){  
    setTableInformation(false);    
    setEditRule(true);
    let data={
      ruleid:resultData.masterrule.ruleid,
      instrumentname:resultData.masterrule.instrumentname,
      stockattribute:resultData.masterrule.stockattribute,
      stockattributevalue:resultData.masterrule.stockattributevalue, 
      symbol:resultData.masterrule.symbol,
      symbolvalue:resultData.masterrule.symbolvalue,
      waittick:resultData.masterrule.waittick, 
      rulestatus:resultData.masterrule.rulestatus==="1"?true:false,   
      clientid:sessionStorage.getItem("clienttoken"),
      brokername:sessionStorage.getItem("brokername"),
      tradingmode:sessionStorage.getItem("tradingtype")
    }
    setCreateRuleConfig(data);

    let dataInstrumentname=stockSymbolInformation.find((data)=>data.value===resultData.masterrule.instrumentname)
    setSymbolSelect(dataInstrumentname);

    let dataAtt=stockAttribute.find((data)=>data.value===resultData.masterrule.stockattribute)
    setSelectedAttribute(dataAtt);

    let dataSymbol=arthmaticSymbolList.find((data)=>data.value===resultData.masterrule.symbol)
    setSelectedArthmaticSymbolList(dataSymbol);

    if(resultData.masterrule.rulestatus==="1"){
      setSwitchActiveState(true); 
    }else{
      setSwitchActiveState(false); 
    }
    

    let multipleConditionArray=[];
    for(var i=0;i<resultData.detailsrule.length;i++){
      let model={};
      model["ruledetailid"]=resultData.detailsrule[i].ruledetailid;
      model["orderside"]=resultData.detailsrule[i].orderside;
      model["orderqty"]=resultData.detailsrule[i].orderqty;
      model["ordertype"]=resultData.detailsrule[i].ordertype;
      model["ordertypevalue"]=resultData.detailsrule[i].ordertypevalue;
      model["rowsrno"]=resultData.detailsrule[i].rowsrno;
      multipleConditionArray.push(model);     
    }       
    setMultipleCondition(multipleConditionArray);

  }
}




const clearRuleData=()=>{
  let data={
    ruleid:"0",
    instrumentname:"",
    stockattribute:"",
    stockattributevalue:"",  
    symbol:"", 
    symbolvalue:"", 
    waittick:"",    
    rulestatus:false,  
    clientid:sessionStorage.getItem("clienttoken"),
    brokername:sessionStorage.getItem("brokername"),
    tradingmode:sessionStorage.getItem("tradingtype")
  }
  setCreateRuleConfig(data);
  const newRandomNumber = Math.floor(Math.random() * 100) + 1;  
  let multipleConditionArray=[];
  let model={};
  model["ruledetailid"]="0";
  model["orderside"]="BUY";
  model["orderqty"]="";
  model["ordertype"]="CE";
  model["ordertypevalue"]="";
  model["rowsrno"]=newRandomNumber;
  multipleConditionArray.push(model);        
  setMultipleCondition(multipleConditionArray);
  setSelectedAttribute("");
  setSelectedArthmaticSymbolList("");
  setSymbolSelect("");
  setEditRule(false);
}

const handlerowchange = (e,reftype,index) => {
  let selectedValue = e.target.value;
  if(reftype==="orderqty"){
      setMultipleCondition((prevRowData)=>{
        const updatedTempOrderPosition = prevRowData.map((position, i) => {
          if (i === index) {
            const updatedExtqty = selectedValue; //positionnetlot > newValue ? newValue : positionnetlot;
            return {
              ...position,
              orderqty: updatedExtqty
            };
          }
          return position;
        });
        return updatedTempOrderPosition;
      })
  }else{
    setMultipleCondition((prevRowData)=>{
      const updatedTempOrderPosition = prevRowData.map((position, i) => {
        if (i === index) {
          const updatedExtqty = selectedValue; //positionnetlot > newValue ? newValue : positionnetlot;
          return {
            ...position,
            ordertypevalue: updatedExtqty
          };
        }
        return position;
      });
      return updatedTempOrderPosition;
    })
  }
  
}

const addNewRecord = (e) => {
  clearRuleData(); 
  setTableInformation(false);
}

const showListRecord = (e) => {
  clearRuleData();
  getruledataList();
  setTableInformation(true);

}




return (
        <>
          <div className="rules-tab">
            <Card className="shadow">
                          
                          <CardBody>
                                {tableInformation?
                                    <>
                                        <Row className="align-items-center mt-2">
                                            <Col xl="12" style={{textAlign:"right"}}>
                                                      <Button  onClick={()=>addNewRecord()}                                                      
                                                         className='font-10px btn-info mr-40'                                                     
                                                         href="#pablo"                                                         
                                                         size="sm"
                                                        
                                                       >
                                                       Add New Rule 
                                                       </Button>   

                                                    
                                                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col xl="12" className='adminrulelist'>
                                                <div className="table-container"  style={{height:height}} >
                                                      <Table className="align-items-center">
                                                      <thead className="thead-light">
                                                          <tr className="text-center">
                                                            <th scope="col" style={{width:"5%"}}>
                                                                    Sr.No
                                                            </th>
                                                            <th scope="col" style={{ width: "70%" }}>
                                                                    Rule Description
                                                            </th>
                                                            <th scope="col" style={{ width: "15%" }}>
                                                                      Active
                                                            </th>
                                                            <th scope="col" style={{ width: "10%" }}>
                                                                      
                                                            </th>
                                                          </tr>
                                                      </thead>
                                                      <tbody>
                                                  
                                                    {
                                                      previousRuleList !== undefined &&
                                                      previousRuleList !== null &&
                                                      previousRuleList.length > 0 &&
                                                        previousRuleList.map((dataInfo, index) => {
                                                          return (  
                                                              <tr  key={index}>
                                                                <td className="text-center">
                                                                  {dataInfo.srno}
                                                                </td>
                                                                <td>
                                                                  {dataInfo.ruledescription}
                                                                </td>
                                                                <td className="text-center">
                                                                    <span className={dataInfo.rulestatus==='Yes'?'text-success text-bold':'text-danger text-bold'}>
                                                                        {dataInfo.rulestatus}
                                                                  </span>
                                                                </td>
                                                                <td>
                                                                  <i className='fa fa-pencil mr-2 text-info' onClick={()=>editRecord(dataInfo.ruleid)}></i>
                                                                  <i className='fa fa-trash text-danger' onClick={()=>deleteRecord(dataInfo.ruleid)} ></i>
                                                                </td>
                                                              </tr>
                                                          )
                                                        })
                                                    }
                                                    </tbody>
                                                    </Table>
                                                  </div>
                                            </Col>
                                        </Row>
                                    </>
                                    :
                                    <Row className="align-items-center mt-2" >
                                          <Col xl="3" className='mx-auto'>
                                          <Row  className='mt-2'> 
                                                    <Col xl="6">
                                                     
                                                        <label  className="form-control-label">
                                                              Instrument Name     
                                                        </label>
                                                    </Col>
                                                    <Col xl="6">
                                                            <Select options={stockSymbolInformation} 
                                                            value={symbolSelect}
                                                            onChange={handleSymbolChange} 
                                                            styles={customStyles}
                                                            ></Select>
                                                        
                                                    </Col>
                                                </Row>
                                                <Row  className='mt-2'> 
                                                    <Col xl="6">
                                                     
                                                        <label  className="form-control-label">
                                                              Stock Attribute      
                                                        </label>
                                                    </Col>
                                                    <Col xl="6">
                                                            <Select options={stockAttribute} 
                                                            value={selectedAttribute} styles={customStyles}
                                                            onChange={(e) => {                                                         
                                                              setSelectedAttribute(e);
                                                              setCreateRuleConfig({
                                                                ...createRuleConfig,
                                                                stockattribute: e.value,
                                                              });
                                                            }}
                                                            ></Select>
                                                        
                                                    </Col>
                                                </Row>
                                                <Row  className='mt-2'> 
                                                    <Col xl="6">
                                                         
                                                            <label  className="form-control-label">
                                                                Stock Attribute Value      
                                                            </label>
                                                    </Col>
                                                    <Col xl="6">
                                                            <Input                                                                
                                                                id="input-postal-code"
                                                                placeholder=" Stock Attribute Value"                                                               
                                                                name="defaultSliceLot"                                                                
                                                                type="number"
                                                                min="1"  
                                                                value={createRuleConfig.stockattributevalue}
                                                                onChange={(e) => {      
                                                                  setCreateRuleConfig({
                                                                    ...createRuleConfig,
                                                                    stockattributevalue: e.target.value,
                                                                  });
                                                                }}
                                                                   
                                                            />
                                                         
                                                    </Col>
                                                </Row>
                                                <Row  className='mt-2'>
                                                    <Col xl="6">                                                        
                                                            <label  className="form-control-label">
                                                                  Symbol     
                                                            </label>
                                                            </Col>
                                                            <Col xl="6">
                                                            <Select options={arthmaticSymbolList} 
                                                            value={selectedArthmaticSymbolList} styles={customStyles}
                                                            onChange={(e) => {                                                         
                                                              setSelectedArthmaticSymbolList(e);
                                                              setCreateRuleConfig({
                                                                ...createRuleConfig,
                                                                symbol: e.value,
                                                              });
                                                            }}
                                                            ></Select>
                                                        
                                                      </Col>
                                                </Row> 
                                                <Row  className='mt-2'>
                                                    <Col xl="6">
                                                        
                                                            <label  className="form-control-label">
                                                                  Symbol Value     
                                                            </label>
                                                    </Col>
                                                    <Col xl="6">
                                                            <Input                                                                
                                                                id="input-postal-code"
                                                                placeholder="Symbol Value"                                                               
                                                                name="defaultSliceLot"                                                                
                                                                type="number"
                                                                min="1"  
                                                                value={createRuleConfig.symbolvalue}
                                                                onChange={(e) => {    
                                                                  setCreateRuleConfig({
                                                                    ...createRuleConfig,
                                                                    symbolvalue: e.target.value,
                                                                  });
                                                                }}
                                                                    
                                                            />
                                                        
                                                      </Col>
                                                </Row> 
                                                <Row  className='mt-2'>
                                                      <Col xl="6">
                                                       
                                                            <label  className="form-control-label">
                                                                 Wait Tick    
                                                            </label>
                                                            </Col>
                                                            <Col xl="6">
                                                            <Input                                                                
                                                                id="input-postal-code"
                                                                placeholder="Wait Tick"                                                               
                                                                name="defaultSliceLot"                                                                
                                                                type="number"
                                                                min="1"  
                                                                value={createRuleConfig.waittick}
                                                                onChange={(e) => {                                                         
                                                                 
                                                                  setCreateRuleConfig({
                                                                    ...createRuleConfig,
                                                                    waittick: e.target.value,
                                                                  });
                                                                }}
                                                                onKeyPress={(e) => {
                                                                  // Prevents non-numeric characters from being entered
                                                                  if (isNaN(Number(e.key))) {
                                                                      e.preventDefault();
                                                                  }
                                                                }}      
                                                            />
                                                        
                                                      </Col>
                                                </Row> 
                                                <Row  className='mt-2'>
                                                      <Col xl="6">                                                       
                                                            <label  className="form-control-label">
                                                                Active 
                                                            </label>
                                                         </Col>
                                                         <Col xl="6">
                                                            <Switch height={20}  
                                                            onChange={handleActiveChange} checked={switchActiveState}
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
                                             </Col>       
                                             <Col xl="6" className='mx-auto'>
                                                <Row>
                                                    <Col xl="10" style={{textAlign:"right"}}>
                                                    <Button  onClick={()=>addNewRowToCondition()}                                                      
                                                         className='font-10px btn-info'                                                     
                                                         href="#pablo"                                                         
                                                         size="sm"
                                                       >
                                                       Add
                                                       </Button>              
                                                      </Col>
                                                 </Row>
                                               <Row>
                                                <Col xl="10" className='AdminRule'>
                                                  <div className="table-container">
                                                        <Table className="align-items-center table-flush header-table"  responsive>
                                                                      <thead className="thead-light">
                                                                                  <tr className="text-center">
                                                                                      <th scope="col" style={{width:"25%"}}>SIDE</th>
                                                                                      <th scope="col" style={{width:"20%"}} >QTY</th>   
                                                                                      <th scope="col" style={{width:"25%"}} >TYPE</th>  
                                                                                      <th scope="col" style={{width:"20%"}}>VALUE</th>  
                                                                                      <th scope="col"></th>   
                                                                                  </tr>                                                                                
                                                                      </thead>
                                                                      <tbody>
                                                                      {multipleCondition.map((data, index) => (
                                                                            <tr>
                                                                                 <td className="text-center cursor-row" onClick={()=>handdleRowChange(data.orderside,index,"orderside")}>
                                                                                    <span className={ data?.orderside?.toLowerCase()==='buy'?'text-success text-bold buy-light':'text-danger text-bold sell-light'}>
                                                                                        { data.orderside}
                                                                                      </span>
                                                                                 </td>
                                                                                 <td className="text-left">
                                                                                 <Input                                                                
                                                                                        id="input-postal-code"
                                                                                        placeholder="QTY"                                                               
                                                                                        className="form-control-alternative form-row-data"
                                                                                        style={{marginTop:"3px"}}
                                                                                        name="orderqty"   
                                                                                        type="number"   
                                                                                        min="1"  
                                                                                        value={data.orderqty}
                                                                                        onChange={(e) =>
                                                                                          handlerowchange(e,"orderqty", index)
                                                                                        }
                                                                                        onKeyPress={(e) => {
                                                                                          // Prevents non-numeric characters from being entered
                                                                                          if (isNaN(Number(e.key))) {
                                                                                              e.preventDefault();
                                                                                          }
                                                                                        }}      
                                                                                      />
                                                                                 </td>
                                                                                 <td className="text-center cursor-row" onClick={()=>handdleRowChange(data.ordertype,index,"ordertype")}>
                                                                                      <span>
                                                                                        { data.ordertype}
                                                                                      </span>
                                                                                 </td>
                                                                                 <td className="text-left">
                                                                                 <Input                                                                
                                                                                        id="input-postal-code"
                                                                                        className="form-control-alternative form-row-data"
                                                                                        style={{marginTop:"3px"}}
                                                                                        placeholder="Value"                                                               
                                                                                        name="ordertypevalue"                                                                
                                                                                        type="number"
                                                                                        min="1"  
                                                                                        value={data.ordertypevalue}
                                                                                        onChange={(e) =>
                                                                                          handlerowchange(e,"ordertypevalue", index)
                                                                                        }
                                                                                      />
                                                                                 </td>
                                                                                 <td className="text-center">
                                                                                  {index!==0?
                                                                                 <i className='fas fa-trash px-1 row_action_icon' onClick={()=>removeItem(data.rowsrno)}></i>                                                                             
                                                                                    :""
                                                                                  }
                                                                                 </td>
                                                                            </tr>
                                                                      ))}

                                                                      </tbody>
                                                          </Table>
                                                    </div>
                                                </Col>
                                               </Row>
                                               <Row className="align-items-center mt-2">
                                          <Col xl="10" className='mx-auto'>
                                                  <hr/>
                                          </Col>
                                    </Row>
                                    <Row className="align-items-center mt-2" >
                                          <Col xl="12" className='text-center'>
                                        
                                          <Button                                                     
                                                         className='font-10px'
                                                         color="primary"                                                     
                                                         href="#pablo"                                                         
                                                         size="sm"
                                                         onClick={() => handleRulesConfig()}
                                                       >
                                                       Save
                                                       </Button>     
                                                       <Button                                                     
                                                         className='font-10px btn-danger'                                                     
                                                         href="#pablo"                                                         
                                                         size="sm"
                                                         disabled={ editRule}
                                                       >
                                                       Clear
                                                       </Button> 

                                                      <Button  onClick={()=>showListRecord()}                                                      
                                                         className='font-10px btn-info mr-40'                                                     
                                                         href="#pablo"                                                         
                                                         size="sm"
                                                        
                                                       >
                                                       Show Rule List
                                                       </Button>    
                                          </Col>
                                    </Row>                                                                    
                                                </Col>
                                    </Row>
                                 }
                          </CardBody>
                </Card>
          </div>
        </>
    )
}
export default AdminRule;