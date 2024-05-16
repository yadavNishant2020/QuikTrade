import {React,useContext,useEffect,useState} from 'react' 
import { Container, Row, Col,   Button,
   Card,
   CardHeader,
   CardBody,
   FormGroup,
   Input,
   } from "reactstrap";
   import { PaperTradingAPI } from "../api/PaperTradingAPI";
   import { PostProvider,PostContext } from '../PostProvider.js';
   import alertify from 'alertifyjs';

const AdminGeneralSetting = () => {
    const [showValidationError,setShowValidationError]=useState(false);  
    const [stoplosspoint,setStoplossPoint]=useState(0);
    const [targetpoints,setTargetPoints]=useState(0);
    const [rmslimit,setRmsLimit]=useState(0);
    const [createGeneralConfig, setCreateGeneralConfig] = useState({
         instrumentname:"",
         stoplosspoint:"0",
         targetpoint:"0",       
         clientid:sessionStorage.getItem("clienttoken"),
         brokername:sessionStorage.getItem("brokername") 
       });

       const {  
        globleSymbol   ,
        globleExpityvalue,
        globleSelectedClientInfo,
        updateGlobleChangeDefaultSetting,
        globleSelectedTradingType
      } = useContext(PostContext);

       const [isButtonDisabled, setButtonDisabled] = useState(false);

       const handleGeneralSettingConfig=async()=>{ 
            debugger;
            setButtonDisabled(true);
            let result = await PaperTradingAPI.processInsertUpdateGeneralConfiguration(createGeneralConfig);
            if(result!=null){
              if(result.length>0){           
                  sessionStorage.getItem("generalConfig");
                  sessionStorage.setItem("generalConfig",JSON.stringify(result));
                  alertify.success("Configuration saved successfully.")
                  setButtonDisabled(false);          
              }
            }else{
                setButtonDisabled(false);
            } 
       }

       useEffect(()=>{
        if(globleSymbol.length>0 && sessionStorage.getItem("clienttoken").length>0 && sessionStorage.getItem("brokername").length>0){
            setCreateGeneralConfig({
                ...createGeneralConfig,
                stoplosspoint:"0",
                targetpoint:"0",      
                instrumentname:globleSymbol,
                clientid:sessionStorage.getItem("clienttoken"),
                brokername:sessionStorage.getItem("brokername"), 
                 
            });
            getGeneralConfiguration();
        }
     },[globleSymbol,sessionStorage.getItem("clienttoken"),sessionStorage.getItem("brokername")])

     const getGeneralConfiguration=async ()=>{ 
        let dataInfo={
            clientId:sessionStorage.getItem("clienttoken") ,
            brokername:sessionStorage.getItem("brokername")
          }
          let result = await PaperTradingAPI.getGeneralConfiguration(dataInfo); 
          if(result!=null){
                if(result.length>0){
                    sessionStorage.removeItem("generalConfig");
                    sessionStorage.setItem("generalConfig",JSON.stringify(result));
                    AssignDataToFormControl();
                }else{
                    setCreateGeneralConfig({
                        ...createGeneralConfig,
                        stoplosspoint:"0",
                        targetpoint:"0",      
                        instrumentname:globleSymbol,
                        clientid:sessionStorage.getItem("clienttoken"),
                        brokername:sessionStorage.getItem("brokername")                         
                    });
                } 
          }else{
            setCreateGeneralConfig({
                ...createGeneralConfig,
                stoplosspoint:"0",
                targetpoint:"0",      
                instrumentname:globleSymbol,
                clientid:sessionStorage.getItem("clienttoken"),
                brokername:sessionStorage.getItem("brokername")                         
            });
          }  
     }

     const AssignDataToFormControl=()=>{
        if(sessionStorage.getItem("generalConfig").length>0){   
            debugger;        
            var configData=JSON.parse(sessionStorage.getItem("generalConfig"));            
            let configInformation=configData.filter((data)=>data.instrumentname===globleSymbol  && data.clientid===globleSelectedClientInfo);
            if(configInformation!=undefined){
                if(configInformation!==null){
                    const updatedConfigInformation = configInformation.map((config) => ({
                        ...config,
                        stoplosspoint: config.stoplosspoint.toString(),
                        stoplosspoint: config.stoplosspoint.toString()
                      }));
                    setCreateGeneralConfig(updatedConfigInformation[0])
                }
            }
        }

     }

     const handleChange = (e) => {
        const name = e.target.name;
        let value = e.target.value;
        const isValidChar = /^-?\d*$/.test(value);
        if (!isValidChar) {
          // Prevent the input if the key is not valid
          e.preventDefault();
        }else{
        if(name==="stoplosspoint"){
            setCreateGeneralConfig((values) => ({ ...values, [name]: value.toString() }));
        } 
        else {
            setCreateGeneralConfig((values) => ({ ...values, [name]: value.toString() }));
      }
    }
  };

    return (
        <>
        <Card className="admindefaultconfig">
                                <CardHeader className="bg-transparent">
                                    <Row className="align-items-center">
                                                <div className="col">
                                                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                                                            {globleSymbol}                                                   
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
                                                          StopLoss Points
                                                        </label>
                                                        
                                                        <Input 
                                                                 
                                                                id="input-postal-code"
                                                                placeholder="StopLoss Points"                                                               
                                                                name="stoplosspoint"                                                                
                                                                type="number"
                                                                min="1"  
                                                                onChange={handleChange}
                                                                value={createGeneralConfig.stoplosspoint}
                                                                onKeyPress={(e) => {
                                                                  // Prevents non-numeric characters from being entered
                                                                  if (isNaN(Number(e.key))) {
                                                                      e.preventDefault();
                                                                  }
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
                                                          Target Points
                                                        </label>
                                                        
                                                        <Input 
                                                                 
                                                                id="input-postal-code"
                                                                placeholder="Target Points"                                                               
                                                                name="targetpoint"                                                                
                                                                type="number"
                                                                min="1"  
                                                                onChange={handleChange}
                                                                value={createGeneralConfig.targetpoint}
                                                                onKeyPress={(e) => {
                                                                  // Prevents non-numeric characters from being entered
                                                                  if (isNaN(Number(e.key))) {
                                                                      e.preventDefault();
                                                                  }
                                                                }}      
                                                            />
                                                           
                                                      
                                                </FormGroup>
                                    </Col>
                                 </Row>
                                 <Row>
                                    <Col xl="12" style={{textAlign:"center"}}>
                                        <Button
                                            color="primary"
                                            size="sm"
                                            className='mt-2'
                                            disabled={isButtonDisabled}
                                            onClick={() => handleGeneralSettingConfig()}
                                        >
                                                <i className="fas fa-floppy-disk" aria-hidden="true"></i> Save

                                        </Button>  
                                    </Col>
                                 </Row>
                                 
                                 </CardBody>
            </Card>
        </>
    )
}

export default AdminGeneralSetting;