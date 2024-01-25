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
   import Select from 'react-select'

const AdminLogs = () => {
            const { 
                globleLogList
        } = useContext(PostContext);
    return (
        <>
                <Card className="shadow">
                          
                          <CardBody>

                            <Row>
                                <Col xl="12" className='logorderlist'>
                                <div className="table-container">
                                              <Table className="align-items-center LogList" >
                                                                        <thead className="thead-light">
                                                                                    
                                                                                    <tr className="text-center">
                                                                                        <th scope="col" >Time Stamp</th>   
                                                                                        <th scope="col">Text</th>
                                                                                    </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                    {globleLogList.map((data,index)=>
                                                                                         <tr key={index}>
                                                                                             <td className='text-center'>{data.logdatetime}</td>
                                                                                            <td className='text-left' style={{whiteSpace: "normal"}}>{data.logtext}</td>
                                                                                        </tr>
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
export default AdminLogs;
