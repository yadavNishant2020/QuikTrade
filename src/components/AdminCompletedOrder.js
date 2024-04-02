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
const AdminCompletedOrder = () => {

    const {  
        globleOrderList,
        globleSelectedClientInfo,
        updateGlobleOrderList,
        updateGlobleOrderPosition,
        globleSelectedTradingType,
        updateGlobleClosedList
      } = useContext(PostContext); 




    return (
        <>
                <Card className="shadow">
                          
                          <CardBody>
                          <Row className='mt-1 mb-1'>
        <Col xl="1"></Col>
        <Col xl="11">
       
        <label className="form-control-label mr-1"  htmlFor="input-username" >
                                                                    Total Orders : 
                                                                    </label>
                                                                     <span className='text-bold font-14px'>{globleOrderList?.length}
                                                                    </span>
                                                                    <label className="form-control-label ml-1 mr-1"  htmlFor="input-username" >
                                                                    Completed : 
                                                                    </label>
                                                                    <span className='text-bold text-success font-14px'>{globleOrderList.filter((data)=>data.orderstatus.toUpperCase()==='COMPLETED')?.length}
                                                                    </span>
        </Col>
</Row>
                          <Row>
                                <Col xl="12 completeorderlist">
                                        <div className="table-container">
                                              <Table className="align-items-center OrderList" >
                                                                        <thead className="thead-light">
                                                                                    
                                                                                    <tr className="text-center">
                                                                                        <th scope="col" >Time Stamp</th>   
                                                                                        <th scope="col">Order ID</th>
                                                                                        <th scope="col" >Side</th> 
                                                                                        <th scope="col">Instrument</th>   
                                                                                        <th scope="col">Product</th>                                                                                      
                                                                                                                                                                            
                                                                                        <th scope="col" >Type</th>       
                                                                                        <th scope="col" className="text-center" style={{width:"12%"}} >Lot</th>  
                                                                                        <th scope="col" className="text-right">Price</th>  
                                                                                        <th scope="col" >Status</th> 
                                                                                                                        
                                                                                    </tr>

                                                                        </thead>
                                                                        <tbody>
                                                                        {
                                                                        globleOrderList !== undefined && globleOrderList !== null && globleOrderList.length > 0 && (
                                                                            globleOrderList.map((data)=>
                                                                            <tr key={data.orderid}>
                                                                                <td className='text-center'>{data.ordertimestamp}</td>
                                                                                <td className='text-center'>{globleSelectedTradingType==='Live'?data.orderidbybroker:data.orderreferanceid}</td>
                                                                                <td className='text-center'>
                                                                                <span className={ data.orderaction.toLowerCase()==='buy'?'btn text-success text-bold buy-light':'btn text-danger text-bold sell-light'}>
                                                                                    {data.orderaction}
                                                                                    </span>
                                                                                </td>
                                                                                <td className='text-left'>
                                                                                {
  data.strikeprice === "0"
    ? data.instrumentname
    : (
      <>
        <strong>{data.instrumentname}</strong> {Constant.ConvertShortDate(data.expirydate)} {data.strikeprice} {data.orderside}
      </>
    )
}
                                                                                </td>

                                                                                <td className='text-center'> 
                                                                                <span className={ data.productname.toLowerCase()==='mis'?'btn text-product-mis text-bold buy-light':'btn text-product-nmrd text-bold sell-light'}>
                                                                        {data.productname}
                                                                                    </span>
                                                                                </td>
                                                                                
                                                                                
                                                                             
                                                                                <td className='text-center'>{data.ordertype}</td>
                                                                                <td className='text-center' style={{width:"10%"}}> 
                                                                                <fieldset className='border'>
                                                                                        <legend align="right">{data.filledQty}/{data.orderqty}</legend>
                                                                                      {data.filledLot}/{data.nooforderlot}
                                                                                    </fieldset>
                                                                                
                                                                                </td>
                                                                                <td className='text-right'>{Constant.CurrencyFormat(data.orderprice)}</td>
                                                                                <td className='text-center'>
                                                                                <span style={{fontSize:"8px"}} className={`badge ${data.orderstatus.toLowerCase() === 'completed' ? 'badge-success' : (data.orderstatus.toLowerCase() === 'pending' || data.orderstatus.toLowerCase() === 'open')  ? 'badge-warning' : 'badge-cancel'}`}>
                                                                                        {data.orderstatus}
                                                                                        </span>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
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
export default AdminCompletedOrder;
