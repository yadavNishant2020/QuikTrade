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
   import { Constant } from "../Config/Constant.js";

const AdminTrades = () => {       
    const {globalTrades} = useContext(PostContext);
    const [filterOrderTrades, setFilterOrderTrades] = useState([]);
    const [searchOrderValue, setSearchOrderValue] = useState("");
    const [orderTradeData, setOrderTradeData] = useState([]);

    useEffect(() => {
        if (globalTrades?.length > 0) {
            setOrderTradeData(globalTrades);
        }
      }, [globalTrades]);


      useEffect(() => {
        if (orderTradeData !== undefined) {
            if (orderTradeData?.length > 0) {
                if (searchOrderValue.length > 0) {
                    const filteredTrades = orderTradeData.filter((trades) => {                     
                    return (
                        trades?.order_id
                        ?.toLowerCase()
                        .includes(searchOrderValue.toLowerCase())  
                    );
                    });
                    setFilterOrderTrades(filteredTrades);
                } else {
                    setFilterOrderTrades(orderTradeData);
                }
            }
        }else {
            setFilterOrderTrades([]);
        }
      }, [orderTradeData,searchOrderValue]);

    return (
        <>
                <Card className="shadow">
                    <CardHeader className="border-0">
                        <Row className="align-items-center">
                            <Col xl="4"  md="6" xs="12">
                                    <Input
                                        className="form-control-alternative"
                                        id="input-postal-code"
                                        placeholder="Search Order Id"
                                        onChange={(e) => setSearchOrderValue(e.target.value)}
                                    />
                            </Col>
                        </Row>
                    </CardHeader>
                    <CardBody>
                            <Row>
                                        <Col xl="12 completeorderlist">
                                                <div className="table-container">
                                                    <Table className="align-items-center OrderList" >
                                                                                <thead className="thead-light">
                                                                                    <tr className="text-center">
                                                                                        <th scope="col" >Order TimeStamp</th> 
                                                                                        <th scope="col">Trade ID</th>  
                                                                                        <th scope="col">Order ID</th>
                                                                                        <th scope="col">Avg. Price</th>
                                                                                        <th scope="col">QTY</th>
                                                                                        <th scope="col">Transaction Type</th>
                                                                                        <th scope="col">Fill TimeStamp</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                           {
                                                                                                filterOrderTrades !== undefined &&
                                                                                                filterOrderTrades !== null &&
                                                                                                filterOrderTrades.length > 0 &&
                                                                                                filterOrderTrades?.map((dataInfo, index) => {
                                                                                                        if (dataInfo) {                                                                                                                                                                                                                           // Create a new Date object using the timestamp
                                                                                                                const timestamp = dataInfo.fill_timestamp;
                                                                                                                const date = new Date(timestamp);                                                                                                    
                                                                                                                // Get the time in hours, minutes, and seconds
                                                                                                                const hours = date.getHours();
                                                                                                                const minutes = date.getMinutes();
                                                                                                                const seconds = date.getSeconds();                                                                                                    
                                                                                                                // Format the time as needed
                                                                                                                const formattedTime = `${hours}:${minutes}:${seconds}`;
                                                                                                            return (
                                                                                                                <tr key={index}>
                                                                                                                     <td className="text-center">
                                                                                                                            {dataInfo.order_timestamp}
                                                                                                                     </td>
                                                                                                                     <td className="text-center">
                                                                                                                            {dataInfo.trade_id}
                                                                                                                     </td>
                                                                                                                     <td className="text-center">
                                                                                                                            {dataInfo.order_id}
                                                                                                                     </td>
                                                                                                                     <td className="text-center">
                                                                                                                            {dataInfo.average_price}
                                                                                                                     </td>
                                                                                                                     <td className="text-center">
                                                                                                                            {dataInfo.quantity}
                                                                                                                     </td>
                                                                                                                        <td className="text-center">
                                                                                                                                <span
                                                                                                                                    className={
                                                                                                                                    dataInfo.transaction_type.toLowerCase() ===
                                                                                                                                    "buy"
                                                                                                                                        ? "btn text-success text-bold buy-light"
                                                                                                                                        : "btn text-danger text-bold sell-light"
                                                                                                                                    }
                                                                                                                                >
                                                                                                                                    {dataInfo.transaction_type}
                                                                                                                                </span>
                                                                                                                        </td>
                                                                                                                        <td className="text-center">
                                                                                                                            {formattedTime}
                                                                                                                     </td>
                                                                                                                </tr>          
                                                                                                            )
                                                                                                        }
                                                                                                    })
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
export default AdminTrades;
