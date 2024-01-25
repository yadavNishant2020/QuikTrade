import { Link } from "react-router-dom";
// reactstrap components
import {
  UncontrolledCollapse,
  NavbarBrand,
  Navbar,
  Container,
  Row,
  Col,
} from "reactstrap";

const LoginHeader = () => {
  return (
    <>
      <Navbar className="navbar-top navbar-horizontal navbar-dark" expand="md">
        <Container className="px-4">
          <NavbarBrand to="/" tag={Link}>
          <div class="container-fluid"> 
            <img
              alt="..."
              src={require("../assets/img/tradingterminallogo.png")}
            />
            
            </div>
          </NavbarBrand>
          <button className="navbar-toggler" id="navbar-collapse-main">
            <span className="navbar-toggler-icon" />
          </button>
          
        </Container>
      </Navbar>
    </>
  );
};

export default LoginHeader;
