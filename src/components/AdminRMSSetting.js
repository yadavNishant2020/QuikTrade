import {React,useContext,useEffect,useState} from 'react' 
import { Container, Row, Col,   Button,
   Card,
   CardHeader,
   CardBody,
   FormGroup,
   Input,
   } from "reactstrap";
   import { PaperTradingAPI } from "../api/PaperTradingAPI.js";
   import { PostProvider,PostContext } from '../PostProvider.js';
   import alertify from 'alertifyjs';
   

const AdminRMSSetting = () => {  
    const [createRMSConfig, setCreateRMSConfig] = useState({          
         rmslimit:"0",              
         clientid:sessionStorage.getItem("clienttoken"),
         brokername:sessionStorage.getItem("brokername"),
         tradingmode:sessionStorage.getItem("tradingtype")
       });

       const {         
        globleSelectedClientInfo,        
        globleSelectedTradingType
      } = useContext(PostContext);

       const [isButtonDisabled, setButtonDisabled] = useState(false);

       const handleRMSSettingConfig=async()=>{ 
            debugger;
            setButtonDisabled(true);
            let result = await PaperTradingAPI.processInsertUpdateRMSConfiguration(createRMSConfig);
            if(result!=null){
              if(result.length>0){           
                  sessionStorage.getItem("RMSConfig");
                  sessionStorage.setItem("RMSConfig",JSON.stringify(result));
                  alertify.success("Configuration saved successfully.")
                  setButtonDisabled(false);          
              }
            }else{
                setButtonDisabled(false);
            } 
       }

       useEffect(()=>{
        if(sessionStorage.getItem("tradingtype").length>0 && sessionStorage.getItem("clienttoken").length>0 && sessionStorage.getItem("brokername").length>0){
            setCreateRMSConfig({
                ...createRMSConfig,              
                rmslimit:"0",  
                clientid:sessionStorage.getItem("clienttoken"),
                brokername:sessionStorage.getItem("brokername"), 
                tradingmode:sessionStorage.getItem("tradingtype")
                 
            });
            getRMSConfiguration();
        }
     },[sessionStorage.getItem("tradingtype"),sessionStorage.getItem("clienttoken"),sessionStorage.getItem("brokername")])

     const getRMSConfiguration=async ()=>{ 
        let dataInfo={
            clientId:sessionStorage.getItem("clienttoken") ,
            brokername:sessionStorage.getItem("brokername"),
            tradingmode:sessionStorage.getItem("tradingtype")
          }
          let result = await PaperTradingAPI.getRMSConfiguration(dataInfo); 
          debugger;
          if(result!=null){
                if(result.length>0){
                    sessionStorage.removeItem("RMSConfig");
                    sessionStorage.setItem("RMSConfig",JSON.stringify(result));
                    AssignDataToFormControl();
                }else{
                    setCreateRMSConfig({
                        ...createRMSConfig,  
                        rmslimit:"0",                
                        clientid:sessionStorage.getItem("clienttoken"),
                        brokername:sessionStorage.getItem("brokername"), 
                        tradingmode:sessionStorage.getItem("tradingtype")
                    });
                } 
          }else{
            setCreateRMSConfig({
                ...createRMSConfig,  
                rmslimit:"0",                
                clientid:sessionStorage.getItem("clienttoken"),
                brokername:sessionStorage.getItem("brokername"), 
                tradingmode:sessionStorage.getItem("tradingtype")
            });
          }  
     }

     useEffect(() => {
        // Function to check if the current time is greater than 9:15
        const checkTime = () => {
          const currentTime = new Date();
          const targetTime = new Date();
          targetTime.setHours(9);
          targetTime.setMinutes(15);
          targetTime.setSeconds(0);
          targetTime.setMilliseconds(0);
          setButtonDisabled(currentTime > targetTime);
        };    
        // Call the checkTime function when the component mounts
        checkTime();    
        // Update the button state every minute
        const interval = setInterval(checkTime, 60000);    
        // Clean up the interval on component unmount
        return () => clearInterval(interval);
      }, []);

     const AssignDataToFormControl=()=>{
        if(sessionStorage.getItem("RMSConfig").length>0){           
            var configData=JSON.parse(sessionStorage.getItem("RMSConfig"));            
            let configInformation=configData.find((data)=>data.tradingmode===sessionStorage.getItem("tradingtype") && data.clientid===globleSelectedClientInfo);
            if(configInformation!=undefined){
                if(configInformation!==null){
                    setCreateRMSConfig(configInformation)
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
        if(name==="rmslimit"){
            setCreateRMSConfig((values) => ({ ...values, [name]: value.toString() }));
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
                                                            {globleSelectedTradingType}                                                   
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
                                                          RMS Limit
                                                        </label>
                                                        
                                                        <Input 
                                                                 
                                                                id="input-postal-code"
                                                                placeholder="RMS Limit"                                                               
                                                                name="rmslimit"                                                                
                                                                type="number"
                                                                min="1"  
                                                                onChange={handleChange}
                                                                value={createRMSConfig.rmslimit}
                                                                    
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
                                            onClick={() => handleRMSSettingConfig()}
                                        >
                                                <i className="fas fa-floppy-disk" aria-hidden="true"></i> Save

                                        </Button>  
                                    </Col>
                                 </Row>
                                 <Row>
                                        <Col xl="12" className='font-10px' style={{padding:"10px 0px",textAlign:"center",color:"red",fontWeight:"bolder"}}>
                                         <hr/>
                                        </Col>
                                 </Row>
                                 <Row>
                                        <Col xl="12" className='font-10px' style={{textAlign:"center",color:"red",fontWeight:"bolder"}}>
                                        + The RMS value can be changed until 9:15 AM
                                        </Col>
                                 </Row>
                                 </CardBody>
            </Card>
        </>
    )
}

export default AdminRMSSetting;