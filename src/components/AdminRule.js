import React, { useEffect, useState } from 'react' 
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

const AdminRule = ({optionChainData}) => {
    return (
        <>
          <div className="rules-tab">
            <Card className="shadow">
                          
                          <CardBody>
                                    <Row className="align-items-center">
                                                <div xl="2">
                                                    
                                                                                      
                                                </div>
                                    </Row>

                          </CardBody>
                </Card>
          </div>
        </>
    )
}
export default AdminRule;