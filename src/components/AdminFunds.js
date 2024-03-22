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
   import { PostProvider,PostContext } from '../PostProvider.js';
   import { ZerodaAPI } from '../api/ZerodaAPI.js';
   import { Constant } from "../Config/Constant";

const AdminFunds = () => {
       
    const [availableFunds,setAvailableFunds]=useState([])

        const handleClientFund=()=>{
            getFundsAndMargins();
        }

        useEffect(() => {                    
            getFundsAndMargins();
           },[]);


           const getFundsAndMargins=async()=>{         
            let requestData={
                logintoken:sessionStorage.getItem("apiSecret")                
            }
             const resultData=await ZerodaAPI.getFundsAndMargins(requestData);  
            if(resultData!=null){   
                         console.log(resultData)                   
                         setAvailableFunds(resultData);
            }
          }


    return (
        <>
                <Card className="shadow">
                          
                          <CardBody>
                          <Row>
                                <Col xl="12" className='pt-1 pb-2' style={{textAlign:'right'}}>
                                            <button className='btn btn-primary text-bold'
                                             onClick={()=>handleClientFund()}
                                            >  Refresh</button>
                                </Col>
                            </Row>
                            <Row>
                                <Col xl="12" className='fundlist'>
                                <div className="table-container">
                                              <Table className="align-items-center LogList" >
                                                                        
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td>
                                                                                            Available Margin
                                                                                        </td>
                                                                                        <td className='text-right'>
                                                                                            <span className='font-14px font-bold'>
                                                                                                {Constant.CurrencyFormat(availableFunds?.net)}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td>
                                                                                            Available Cash
                                                                                        </td>
                                                                                        <td className='text-right'>
                                                                                           <span className='font-14px font-bold'>
                                                                                           {Constant.CurrencyFormat(availableFunds?.available?.cash)}
                                                                                          </span> 
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>
                                                                                            Used Margin
                                                                                        </td>
                                                                                        <td className='text-right'>
                                                                                             <span className='font-12px font-bold'>
                                                                                                    {Constant.CurrencyFormat(availableFunds?.utilised?.debits)}
                                                                                             </span>
                                                                                        </td>
                                                                                        <td>
                                                                                            Opening Balance
                                                                                        </td>
                                                                                        <td className='text-right'>
                                                                                        {Constant.CurrencyFormat(availableFunds?.available?.cash)}
                                                                                        
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>                                                                                        
                                                                                        <td>
                                                                                            Payin
                                                                                        </td>
                                                                                        <td className='text-right'>
                                                                                        {Constant.CurrencyFormat(availableFunds?.available?.intradayPayin)}
                                                                                        </td>
                                                                                        <td>
                                                                                            Payout
                                                                                        </td>
                                                                                        <td className='text-right'>
                                                                                        {Constant.CurrencyFormat(availableFunds?.utilised?.payout)}
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>                                                                                        
                                                                                        <td>
                                                                                            SPAN
                                                                                        </td>
                                                                                        <td className='text-right'>
                                                                                            {Constant.CurrencyFormat(availableFunds?.available?.span)}
                                                                                        </td>
                                                                                        <td>
                                                                                            Delivery Changes
                                                                                        </td>
                                                                                        <td className='text-right'>
                                                                                             {Constant.CurrencyFormat(availableFunds?.utilised?.delivery)}
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>                                                                                        
                                                                                        <td>
                                                                                                Exposure
                                                                                        </td>
                                                                                        <td className='text-right'>
                                                                                            {Constant.CurrencyFormat(availableFunds?.available?.exposure)}
                                                                                        </td>
                                                                                        <td>
                                                                                                Option Premium
                                                                                        </td>
                                                                                       
                                                                                        <td className='text-right'>
                                                                                             {Constant.CurrencyFormat(availableFunds?.utilised?.optionPremium)}
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>                                                                                        
                                                                                        <td>
                                                                                                Collateral (Liquid funds)
                                                                                        </td>
                                                                                        <td className='text-right'>
                                                                                            {Constant.CurrencyFormat(availableFunds?.available?.liquid_collateral)}
                                                                                        </td>
                                                                                        <td>
                                                                                                Collateral ( Equity )
                                                                                        </td>
                                                                                        <td className='text-right'>
                                                                                             {Constant.CurrencyFormat(availableFunds?.utilised?.stock_collateral)}
                                                                                        </td>
                                                                                        </tr>
                                                                                    <tr>    
                                                                                        <td>
                                                                                                Total collateral
                                                                                        </td>
                                                                                        <td className='text-right'>
                                                                                             {Constant.CurrencyFormat(availableFunds?.available?.collateral)}
                                                                                        </td>
                                                                                    
                                                                                    </tr>
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
export default AdminFunds;
