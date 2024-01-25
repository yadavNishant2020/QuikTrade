import React, { useState } from "react";
import { Link } from "react-router-dom";
 
import '../index.css'
import { Card, CardBody, CardTitle, 
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  NavbarBrand,
  Navbar,  
  Nav,
  Container,
  Row,
  Media,
  Col} from "reactstrap";

const AdminStockIndex = ({stockSymbolsdata}) => {
    return (
        <>
          <div className="header pb-1 stockindexinfo" style={{backgroundColor: "#FFFFFF",marginTop:"2px"}}>
            <Container fluid>
              <div className="header-body">
                {/* Card stats */}
                <Row className="flex-row d-flex justify-content-center text-center">  
                           {
                            stockSymbolsdata?.map((data,index)=>
                              <div className="px-4" key={index}>
                                        <div className="header">
                                              {data.label}
                                        </div>
                                        <div>
                                            <hr />
                                        </div>
                                        <div className="stockvalue bg-success text-white">
                                              {data.value} ( {data.ltpcharges} {data.ltppercent}% ) <i className="fas fa-arrow-up ml-1"></i>
                                        </div>
                                </div> 
                              )
                           }
                            
                                       
                                          <div className="px-3">
                                                <div  className="header">VIX</div>
                                                <div><hr /></div>
                                                <div className="stockvalue bg-danger text-white">19,443.50 ( 5.00 30% )
                                                <i className="fas fa-arrow-down ml-1"></i>
                                                </div>
                                          </div>

                                      
                                
                </Row>
              </div>
            </Container>
          </div>
        </>
      );
}
export default AdminStockIndex;