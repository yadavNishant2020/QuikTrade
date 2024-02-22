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
   import { PostProvider,PostContext } from '../PostProvider.js';
   import { ZerodaAPI } from "../api/ZerodaAPI";
   import { PaperTradingAPI } from "../api/PaperTradingAPI";  
   import { Constant } from "../Config/Constant";
const AdminClosedOrder = () => {
    const {           
        globleClosedList,
        globleSelectedClientInfo,        
        globleSelectedTradingType,
        updateGlobleClosedList,        
        globlemltRealized,
        updateGloblemltRealized
      } = useContext(PostContext); 
      const [closePositionList,setClosePositionList]=useState([]);
      useEffect(()=>{    
        let totalRMTM=0;                 
        if(globleClosedList?.length >0){              
            totalRMTM = globleClosedList.reduce((accumulator, data) => {
                    return accumulator + (parseFloat(data?.closepositionpnl) || 0);
                }, 0);
                setClosePositionList(globleClosedList);
      }else{
        setClosePositionList([]);
      }
      updateGloblemltRealized(totalRMTM);
  },[globleClosedList])

  useEffect(() => {  
    if(globleSelectedTradingType.length>0 && globleSelectedClientInfo.length>0){      
      getOrderClosedList();    
    }
   },[globleSelectedTradingType,globleSelectedClientInfo]);

   const getOrderClosedList=async()=>{         
            let requestData={
                clientid:sessionStorage.getItem("clienttoken"),
                tradermode:sessionStorage.getItem("tradingtype")  
            }
            const resultData=await PaperTradingAPI.getOrderClosedList(requestData);        
            if(resultData!=null){   
                    updateGlobleClosedList(resultData);  
            }
    }

    return (
        <>
                <Card className="shadow">
                          
                          <CardBody>
<Row className='mt-1 mb-1'>
        <Col xl="1"></Col>
        <Col xl="11">
       
        <label className="form-control-label"  htmlFor="input-username" >
                                                                    Realised MTM 
                                                                    </label>
                                                                    <span className={(globlemltRealized>0? ' text-success': (globlemltRealized===0? ' text-data-secondary': ' text-danger'))+" m-1 font-14px  text-center"}> 
                                                                              {globlemltRealized>0?'+':''}{Constant.CurrencyFormat(globlemltRealized)}
                                                                    </span>
        </Col>
</Row>
                            <Row>
                                <Col xl="12" className='closeorderlist'>
                                <div className="table-container">
                                <Table className="align-items-center CloseOrderList">
                                                                <thead className="thead-light">
                                                                            
                                                                            <tr className="text-center">
                                                                                <th scope="col">Product</th>
                                                                                <th scope="col">Instrument</th> 
                                                                                <th scope="col" >Lot</th>                                                                                  
                                                                                <th scope="col" className="text-right">PNL</th>                        
                                                                            </tr>

                                                                </thead>
                                                                <tbody>                                                                   
                                                                { closePositionList !== undefined && closePositionList !== null && closePositionList.length > 0 && (
                                                                        closePositionList?.map((data)=>
                                                                            <tr key={data.orderid}>
                                                                                <td className='text-center'>
                                                                                <span className={ data.closepositionproductname.toLowerCase()==='mis'?'btn text-product-mis text-bold buy-light':'btn text-product-nmrd text-bold sell-light'}>
                                                                        {data.closepositionproductname}
                                                                                    </span>
                                                                                </td>
                                                                                <td className='text-left'>
                                                                                {
                                                                                    data.closepositionstrike === "0"
                                                                                        ? data.closepositioninstrumentname
                                                                                        : (
                                                                                        <>
                                                                                            <strong>{data.closepositioninstrumentname}</strong> {Constant.ConvertShortDate(data.closepositionexpirydate)} {data.closepositionstrike} {data.closepositionordertype}
                                                                                        </>
                                                                                        )
                                                                                }

                                                                                    
                                                                                </td>
                                                                                
                                                                                
                                                                                <td className='text-center' style={{width:"10%"}}>
                                                                                  <fieldset className='border'>
                                                                                  <legend align="right">{data.closepositionqty}</legend>
                                                                                  {data.closepositionlot}
                                                                              </fieldset>

                                                                                </td>
                                                                                
                                                                               
                                                                                <td className={parseFloat(data.closepositionpnl)>0?'text-success text-right':(parseFloat(data.closepositionpnl)<0?'text-danger text-right':'text-data-secondary text-right')}>
                                                                                        {
                                                                                            parseFloat(data.closepositionpnl) < 0
                                                                                                ?  Constant.CurrencyFormat(data.closepositionpnl)
                                                                                                : parseFloat(data.closepositionpnl) > 0
                                                                                                    ? '+' + Constant.CurrencyFormat(data.closepositionpnl)
                                                                                                    : Constant.CurrencyFormat(data.closepositionpnl)
                                                                                        }
                                                                                </td>
                                                                            </tr>
                                                                    )
                                                                  )
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
export default AdminClosedOrder;
