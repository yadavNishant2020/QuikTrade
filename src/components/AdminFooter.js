import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Nav, NavItem, NavLink } from "reactstrap";
const AdminFooter = () => {
    return (
        <footer className="footer">
          {/* <Row className="align-items-center justify-content-xl-between">
            <Col xl="12">
              <div className="copyright text-center text-xl-left text-muted">
                © {new Date().getFullYear()}{" - "} {new Date().getFullYear()+1}
                <a
                  className="font-weight-bold ml-1"
                  href="https://www.creative-tim.com?ref=adr-admin-footer"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Techquadra Team
                </a>
              </div>
            </Col>
    
           
          </Row> */}
        </footer>
      );
}

export default AdminFooter;