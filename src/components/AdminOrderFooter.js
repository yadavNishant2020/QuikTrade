import { ZerodaAPI } from "../api/ZerodaAPI";
import Centrifuge from 'centrifuge';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
 
import { Container, Row, Col,   Button,
   Card,
   CardHeader,
   CardBody,
   NavItem,
   NavLink,
   Nav,
   Progress,
   Table } from "reactstrap";
   import { PostProvider,PostContext } from '../PostProvider.js';
   import { useContext } from 'react';  
import AdminLogs from "./AdminLogs.js";
import AdminClosedOrder from "./AdminClosedOrder.js";
import AdminFunds from "./AdminFunds.js";


const AdminOrderFooter = () => {
    return (
        <>
<Tabs style={{backgroundColor:"#FFFFFF"}}>
                                                    <TabList>
                                                    <Tab>CLOSED POSITION</Tab>  
                                                    <Tab>LOGS</Tab> 
                                                    <Tab>FUNDS</Tab>                                                                                                          
                                                    </TabList>
                                                    <TabPanel>
                                                        <AdminClosedOrder /> 
                                                    </TabPanel>
                                                    <TabPanel>
                                                        <AdminLogs />
                                                    </TabPanel>
                                                    <TabPanel>
                                                        <AdminFunds />
                                                    </TabPanel>
                                                   
</Tabs>
                                                    </>
                                                    )
}
export default AdminOrderFooter;
