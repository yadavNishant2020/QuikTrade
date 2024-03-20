import { React, useEffect, useState } from "react";
import { Link, json } from "react-router-dom";
import Select from "react-select";
import "../index.css";
import { ZerodaAPI } from "../api/ZerodaAPI.js";
import { CookiesConfig } from "../Config/CookiesConfig.js";
import Moment from "moment";
import Centrifuge from "centrifuge";
import { Container, DropdownMenu, DropdownItem, Row, Col } from "reactstrap";
import { useContext } from "react";
import {  PostContext } from "../PostProvider.js";
import { PaperTradingAPI } from "../api/PaperTradingAPI.js"; 
import alertify from "alertifyjs";
import { Nav, UncontrolledDropdown, DropdownToggle } from "reactstrap";
import StaticPopup from "./Static-Popup.js";

const AdminHeaderProfile = () => { 
  const [show, setShow] = useState(false);
  const handdleLogOut = () => {
    alertify.confirm(
      "Logout Confirmation",
      "Do you want to logout.",
      () => {
        CookiesConfig.removeCookie("Fnotrader-Secret");
        CookiesConfig.removeCookie("Fnotrader-Userid");
        CookiesConfig.removeCookie("User-ActiveSubscription");
        CookiesConfig.removeCookie("User-BrokerLoggedIn");
        sessionStorage.removeItem("fnotraderUserid");
        sessionStorage.removeItem("fnotraderSecret");
        sessionStorage.clear();
        window.open(
          "https://www.fnotrader.com/trading/broker-accounts",
          "_self"
        );
      },
      () => {}
    );
  };

  const handleClosePopup =()=>{
    setShow(false);
  }

  return (
    <>
      <div className="header" style={{ backgroundColor: "#FFFFFF" }}>
        <Container fluid>
          <div className="header-body">
            {/* Card stats */}
            <Row className="py-1">
              <Col xl="2">
                <img
                  alt="..."
                  src={require("../assets/img/icons/common/icon.png")}
                  //src={"../assets/img/icons/common/quickTrade.svg"}
                  style={{ height: "25px", marginRight: "5px" }}
                />

                <img
                  alt="..."
                  src={require("../assets/img/icons/common/logo.jpg")}
                  //src={"../assets/img/icons/common/quickTrade.svg"}
                  style={{ height: "32px" }}
                />
              </Col>
              <Col xl="2" xs="12">
               
              </Col>
              <Col xl="3" xs="12">
               
              </Col>
              <Col xl="5">
                <Row>
                  <Col xl="5" xs="5">
                  
                  </Col>
                  <Col xl="5" xs="5">
                  
                  </Col>
                  <Col xl="2" xs="2" style={{ textAlign: "right" }}>
                    <Nav className="align-items-center d-none d-md-flex" navbar>
                      <UncontrolledDropdown nav>
                        <DropdownToggle className="pr-0" nav>
                          <i
                            className="fas fa-gear"
                            style={{ fontSize: "20px" }}
                          ></i>
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-arrow" right>
                          <DropdownItem className="noti-title" header tag="div">
                            <h6 className="text-overflow m-0">Welcome!</h6>
                          </DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem to="/admin/dashboard" tag={Link}>
                            <i className="ni ni-tv-2" />
                            <span>Dashboard</span>
                          </DropdownItem>
                          <DropdownItem
                            href="#pablo"
                            onClick={(e) => handdleLogOut()}
                          >
                            <i className="ni ni-user-run" />
                            <span>Logout</span>
                          </DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </Nav>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
      <StaticPopup 
        message={["Please buy a valid subscription to trade with the Broker Account."]} 
        title={"Upgrade Now"}
        isShow={show}
        link={"/quiktrade/pricing"}
        btnText_1={"Upgrade Now"}
        btnText_2={"Cancel"}
        handleClosePopup={handleClosePopup}
      /> 
    </>
  );
};
export default AdminHeaderProfile;
