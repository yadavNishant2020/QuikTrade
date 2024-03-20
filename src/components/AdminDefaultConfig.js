import {React,useContext,useEffect,useState} from 'react' 
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
   import { ZerodaAPI } from "../api/ZerodaAPI";
   import { PaperTradingAPI } from "../api/PaperTradingAPI";
   import { CookiesConfig } from "../Config/CookiesConfig.js";
import alertify from 'alertifyjs';
 

const AdminDefaultConfig = () => {

  const {  
    globleSymbol   ,
    globleExpityvalue,
    globleSelectedClientInfo,
    updateGlobleChangeDefaultSetting,
    globleSelectedTradingType
  } = useContext(PostContext); 

  const [showValidationError,setShowValidationError]=useState(false);  
   const [productName,setProductName]=useState('');
   const [validity,setValidity]=useState('');
   const [orderType,setOrderType]=useState('');
   const [brokerType,setBrokerType]=useState('');  
   const [defaultLotValue,setDefaultLotValue]=useState(0);
   const [defaultLotSize,setDefaultLotSize]=useState(0);
   const [currentLotValue,setCurrentLotValue]=useState(0);
   const [currentLotSize,setCurrentLotSize]=useState(1);
   const [displayLotSize,setDisplayLotSize]=useState(0);
   const [isButtonDisabled, setButtonDisabled] = useState(false);
   const productOptions = [
        { value: 'MIS', label: 'MIS' }   ,   
        { value: 'NRML', label: 'NRML' }   ,
  
      ]
      const validityOptions = [
        { value: 'DAY', label: 'DAY' },
        { value: 'IOC', label: 'IOC' }   ,   
                
      ]

      const orderTypeOption = [
        { value: 'MKT', label: 'MKT' }   ,   
        { value: 'LMT', label: 'LMT (MPT)' }   ,        
      ]


      const brokerTypeOption = [
        { value: 'Buy First', label: 'Buy First' }   ,   
        { value: 'Sell First', label: 'Sell First' }   ,        
      ]


    

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

      const generateRandomString = (length) => {
        const possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';
        
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * possibleCharacters.length);
          randomString += possibleCharacters.charAt(randomIndex);
        }
      
        return randomString;
      };
    


      useEffect(()=>{
         setProductName(productOptions[0]);
         setValidity(validityOptions[0]);
         setOrderType(orderTypeOption[0]);
         setBrokerType(brokerTypeOption[0]);
         setCurrentLotValue(defaultLotValue);          
         if(sessionStorage.getItem("defaultConfig").length>0){           
          var configData=JSON.parse(sessionStorage.getItem("defaultConfig"));
          if(configData.length>0){
                setCreateConfig({
                  ...createConfig,
                  instrumentname:configData[0].instrumentname,
                  expirydate:configData[0].expirydate,
                  clientId:configData[0].clientId,       
                  defaultProductName:configData[0].defaultProductName,
                  defaultMaxQty:configData[0].defaultMaxQty,
                  defaultSliceLot:configData[0].defaultSliceLot,  
                  defaultSliceQty:configData[0].defaultSliceQty,
                  defaultValidity:configData[0].defaultValidity,
                  defaultOrderType:configData[0].defaultOrderType,
                  defaultLotSize:configData[0].defaultLotSize,
                  defaultQty:configData[0].defaultQty,
                  defaultBrokerType:configData[0].defaultBrokerType,         
                  defaultShowQty:configData[0].defaultShowQty  ,
                  defaultTradingMode:globleSelectedTradingType 
                }); 
          }
         }
      },[])

      const [createConfig, setCreateConfig] = useState({
        instrumentname:"",
         expirydate:"",
         clientId:"",
         defaultMaxQty:"",
         defaultSliceLot:"",
         defaultProductName: productOptions[0].value,
         defaultSliceQty:"",
         defaultValidity:validityOptions[0].value,
         defaultOrderType:orderTypeOption[0].value,
         defaultLotSize:"",
         defaultQty:"",
         defaultBrokerType:brokerTypeOption[0].value,         
         defaultShowQty:0,
         defaultTradingMode:globleSelectedTradingType
       });
     
       
      //  useEffect(()=>{
      //   if(globleSymbol.length>0 && globleExpityvalue.length>0 && globleSelectedClientInfo.length>0){
      //           setCreateConfig({
      //             ...createConfig,
      //             instrumentname:globleSymbol,
      //             expirydate:globleExpityvalue,
      //             clientId:globleSelectedClientInfo          
      //           }); 
      //   }
      //  },[globleSymbol,globleExpityvalue,globleSelectedClientInfo])
       

     const handleChange = (e) => {
                  
            const name = e.target.name;
            let value = e.target.value;
            const isValidChar = /^-?\d*$/.test(value);
            if (!isValidChar) {
              // Prevent the input if the key is not valid
              e.preventDefault();
            }else{
            if(name==="defaultSliceLot"){
              
              let defaultSliceQty=parseInt(createConfig.defaultQty)*(value==""?0:parseInt(value));
              let defaultMaxQty=createConfig.defaultMaxQty;              
              if(parseInt(defaultSliceQty)<=parseInt(defaultMaxQty)){
                    setCreateConfig((values) => ({
                        ...values,
                        [name]: value,
                        defaultSliceQty:(value==""?0:parseInt(value))*parseInt(createConfig.defaultQty)
                    }))
              }else{
                      alertify.error("Max Slice Qty is "+createConfig.defaultMaxQty)
                      setCreateConfig((values) => ({
                        ...values,
                        [name]: parseInt(createConfig.defaultMaxQty)/parseInt(createConfig.defaultQty),
                        defaultSliceQty:createConfig.defaultMaxQty
                    }))
              }
            } 
            else if (name === "defaultLotSize") {
              setCreateConfig((values) => ({
                ...values,
                [name]: value,
                defaultShowQty: values.defaultQty * (value==""?0:parseInt(value))
               }));
          } else {
              setCreateConfig((values) => ({ ...values, [name]: value }));
          }
        }
      };

      


      const handleDefaultConfig=async()=>{ 
        if(createConfig.defaultOrderType==='LMT' && (createConfig.defaultLMTPerCentage===""|| createConfig.defaultLMTPerCentage==="0")){
            setShowValidationError(true);          
        }else if(createConfig.defaultLotSize===""|| createConfig.defaultLotSize==="0"){
          setShowValidationError(true);          
        }else if(createConfig.defaultSliceLot===""|| createConfig.defaultSliceLot==="0"){
          setShowValidationError(true);          
        }else{        
            setButtonDisabled(true);
            let result = await PaperTradingAPI.processInsertUpdateDefaultConfiguration(createConfig);
            if(result!=null){
              if(result.length>0){           
                  sessionStorage.getItem("defaultConfig");
                  sessionStorage.setItem("defaultConfig",JSON.stringify(result));
                  alertify.success("Configuration saved successfully.")
                  setButtonDisabled(false);                   
                  updateGlobleChangeDefaultSetting(1)
              }
            } 
        }   
        // setTimeout(function(){
        //   setShowValidationError(false);
        // },3000)
      }
      
      

      

      useEffect(()=>{
        if(globleSymbol.length>0 && globleExpityvalue.length>0 && globleSelectedClientInfo.length>0 && globleSelectedTradingType.length>0){
          getDefaultConfiguration();
        }
     },[globleSymbol,globleExpityvalue,globleSelectedClientInfo,globleSelectedTradingType])



    const getDefaultConfiguration=async ()=>{    
      let dataInfo={
        clientId:globleSelectedClientInfo,
        instrumentName:globleSymbol,
        expityDate:globleExpityvalue,
        tradingMode:globleSelectedTradingType
      }
      let result = await PaperTradingAPI.getDefaultConfiguration(dataInfo);    
      if(result!=null){
         if(result.length>0){
            sessionStorage.removeItem("defaultConfig");
            sessionStorage.setItem("defaultConfig",JSON.stringify(result));
            AssignDataToFormCOntrol();
         }else{        
          if(globleSymbol!=undefined && globleExpityvalue!=undefined){
            getDefaultConfigFromBroker(globleSymbol,globleExpityvalue);
          }        
        }
      }else{
        
        if(globleSymbol!=undefined && globleExpityvalue!=undefined){
          getDefaultConfigFromBroker(globleSymbol,globleExpityvalue);
        }  
      }   
  
    }

    const getDefaultConfigFromBroker = async (instrumentName,expiryDate) => {   
     
      const result =await  ZerodaAPI.callOptionChain(instrumentName,expiryDate);
      if(result!=null){     
          const {code,data}=result;   
          if(data!=null){
             if(data["opt"][expiryDate]!=null){
                let defaultArray=new Array();
                let dataInfo={
                  instrumentname:instrumentName,
                  expirydate:expiryDate,
                  clientId:globleSelectedClientInfo,
                  defaultProductName: "MIS",
                  defaultMaxQty:data["opt"][expiryDate][0].volumeFreeze,
                  defaultSliceLot:parseInt(data["opt"][expiryDate][0].volumeFreeze)/parseInt(data["opt"][expiryDate][0].lotSize) ,
                  defaultSliceQty:data["opt"][expiryDate][0].volumeFreeze,
                  defaultValidity:"DAY",
                  defaultOrderType:"MKT",
                  defaultLotSize:1,
                  defaultQty:data["opt"][expiryDate][0].lotSize,
                  defaultBrokerType:"Buy First",         
                  defaultShowQty:data["opt"][expiryDate][0].lotSize,
                  defaultLMTPerCentage:0,
                  defaultTradingMode:globleSelectedTradingType
                }
                defaultArray.push(dataInfo);
                sessionStorage.removeItem("defaultConfig");
                sessionStorage.setItem("defaultConfig",JSON.stringify(defaultArray));
                AssignDataToFormCOntrol();
             }
  
          }else{
            return null;
          }
      }else{
          return null;
      }    
    }

    const AssignDataToFormCOntrol=()=>{
        if(sessionStorage.getItem("defaultConfig").length>0){           
            var configData=JSON.parse(sessionStorage.getItem("defaultConfig"));
            let configInformation=configData.find((data)=>data.instrumentname===globleSymbol && data.expirydate===globleExpityvalue && data.clientId===globleSelectedClientInfo);
            if(configInformation!=undefined){
                if(configInformation!==null){
                  setCreateConfig(configInformation)
                  let defaultOrderType= configInformation.defaultOrderType
                  let orderTypeData=orderTypeOption.find((data)=>data.value===defaultOrderType);
                  setOrderType(orderTypeData)
                  let defaultProductName= configInformation.defaultProductName
                  let productNameData=productOptions.find((data)=>data.value===defaultProductName);
                  setProductName(productNameData)
                  let defaultValidity= configInformation.defaultValidity
                  let validityData=validityOptions.find((data)=>data.value===defaultValidity);
                  setValidity(validityData)
                  let defaultBrokerType= configInformation.defaultBrokerType
                  let brokerTypeData=brokerTypeOption.find((data)=>data.value===defaultBrokerType);
                  setBrokerType(brokerTypeData);                
            } 
          }             
        }
    }

    

    return (

<Card className="admindefaultconfig">
                                <CardHeader className="bg-transparent">
                                    <Row className="align-items-center">
                                                <div className="col">
                                                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                                                           {globleSymbol}({globleSelectedTradingType})                                                         
                                                    </h6>   
                                                                                      
                                                </div>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                 <Row>
                                    <Col xl="12">
                                                <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-username"
                                                        >
                                                            Product Name
                                                        </label>
                                                        <Select options={productOptions} 
                                                        value={productName} styles={customStyles}
                                                        onChange={(e) => {                                                         
                                                         setProductName(e);
                                                         setCreateConfig({
                                                           ...createConfig,
                                                           defaultProductName: e.value,
                                                         });
                                                       }}
                                                        />
                                                </FormGroup>
                                    </Col>
                                 </Row>
                                 <Row>
                                    <Col xl="12">
                                                <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-username"
                                                        >
                                                           Slice Qty (Max Qty/Order)
                                                        </label>
                                                        <fieldset className={showValidationError  && (createConfig.defaultSliceLot===0|| createConfig.defaultSliceLot==='')?'was-validated':'border'} >
                                                            <legend align="right">{createConfig.defaultSliceQty}</legend>
                                                        <Input className={showValidationError  && (createConfig.defaultSliceLot===0|| createConfig.defaultSliceLot==='')?'was-validated':''}
                                                               value={createConfig.defaultSliceLot}
                                                                id="input-postal-code"
                                                                placeholder="Slice Lot"                                                               
                                                                name="defaultSliceLot"
                                                                onChange={handleChange}
                                                                type="number"
                                                                min="1"  
                                                                onKeyPress={(e) => {
                                                                  // Prevents non-numeric characters from being entered
                                                                  if (isNaN(Number(e.key))) {
                                                                      e.preventDefault();
                                                                  }
                                                                }}      
                                                            />
                                                            </fieldset>
                                                      
                                                </FormGroup>
                                    </Col>
                                 </Row>
                                 <Row>
                                    <Col xl="12">
                                                <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-username"
                                                        >
                                                           Validity
                                                        </label>
                                                        <Select options={validityOptions}  
                                                        value={validity}
                                                        onChange={(e) => {
                                                         setValidity(e);
                                                         setCreateConfig({
                                                           ...createConfig,
                                                           defaultValidity: e.value,
                                                         })
                                                        }}
                                                        styles={customStyles}
                        
                                                        />
                                                </FormGroup>
                                    </Col>
                                 </Row>
                                 <Row>
                                    <Col xl="12">
                                                <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-username"
                                                        >
                                                           Order Type
                                                        </label>
                                                        <Select options={orderTypeOption} 
                                                          value={orderType}
                                                          styles={customStyles}
                                                          onChange={(e) => {
                                                            setOrderType(e);
                                                            setCreateConfig({
                                                              ...createConfig,
                                                              defaultOrderType: e.value,
                                                            })
                                                         }}
                                                        />
                                                </FormGroup>
                                    </Col>
                                 </Row>
                                 {createConfig.defaultOrderType==='LMT'?
                                 (<Row>
                                    <Col xl="12">
                                                <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-username"
                                                        >
                                                          Price Buffer % (Market Product)
                                                        </label>
                                                        <Input className={ showValidationError && createConfig.defaultOrderType==='LMT'
                                                                && (createConfig.defaultLMTPerCentage===0|| createConfig.defaultLMTPerCentage==='')?'was-validated':''}
                                                               value={createConfig.defaultLMTPerCentage}
                                                                id="input-postal-code"
                                                                placeholder="Default Lot"                                                               
                                                                name="defaultLMTPerCentage"
                                                                type="number"
                                                                min="1"        
                                                                onChange={handleChange}
                                                            />
                                                </FormGroup>
                                    </Col>
                                 </Row>):""}
                                 
                                 <Row>
                                    <Col xl="12">
                                                <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-username"
                                                        >
                                                          Default Qty (Per Click)
                                                        </label>
                                                        <fieldset className={ showValidationError  && (createConfig.defaultLotSize===0|| createConfig.defaultLotSize==='')?'was-validated':'border'}>
                                                            <legend align="right">{createConfig.defaultShowQty}</legend>
                                                        <Input className={ showValidationError  && (createConfig.defaultLotSize===0|| createConfig.defaultLotSize==='')?'was-validated':''}
                                                               value={createConfig.defaultLotSize}
                                                                id="input-postal-code"
                                                                placeholder="Default Lot"                                                               
                                                                name="defaultLotSize"
                                                                type="number"
                                                                min="1"        
                                                                onChange={handleChange}
                                                                onKeyPress={(e) => {
                                                                  // Prevents non-numeric characters from being entered
                                                                  if (isNaN(Number(e.key))) {
                                                                      e.preventDefault();
                                                                  }
                                                                }}
                                                            />
                                                            </fieldset>
                                                </FormGroup>
                                    </Col>
                                 </Row>
                                 <Row>
                                    <Col xl="12">
                                                <FormGroup>
                                                        <label
                                                            className="form-control-label"
                                                            htmlFor="input-username"
                                                        >
                                                          Order Sequence
                                                        </label>
                                                        <Select options={brokerTypeOption} 
                                                         value={brokerType}
                                                         styles={customStyles}
                                                         onChange={(e) => {
                                                           setBrokerType(e);
                                                           setCreateConfig({
                                                             ...createConfig,
                                                             defaultBrokerType: e.value,
                                                           })
                                                        }}
                                                         
                        
                                                        />
                                                </FormGroup>
                                    </Col>
                                 </Row>
                                 <Row>
                                    <Col xl="12" style={{textAlign:"center"}}>
                                    <Button
                      color="primary" 
                      disabled={isButtonDisabled}
                      onClick={() => handleDefaultConfig()}
                      size="sm"
                      className='mt-2'
                    >
                      <i className="fas fa-floppy-disk" aria-hidden="true"></i> Save

                    </Button>  
                                    </Col>
                                 </Row>
                                </CardBody>
                                </Card>
   )
}
export default AdminDefaultConfig;