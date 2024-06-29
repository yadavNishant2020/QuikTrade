import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardHeader,
  CardBody,
  NavItem,
  NavLink,
  Nav,
  Progress,
  FormGroup,
  Input,
  Table,
} from "reactstrap";
import Select from "react-select";
import { PostProvider, PostContext } from "../PostProvider.js";
import { ZerodaAPI } from "../api/ZerodaAPI";
import { PaperTradingAPI } from "../api/PaperTradingAPI";
import { Constant } from "../Config/Constant";
import { LiveTradingAPI } from "../api/LiveTradingAPI";
import alertify from "alertifyjs";
const AdminCompletedOrder = () => {
  const [orderCompletedList, setOrderCompletedList] = useState([]);
  const [completedOrderCount, setCompletedOrderCount] = useState([]);
  const [processOrder, setProcessOrder] = useState(false);
  const {
    globleOrderList,
    globleSelectedClientInfo,
    updateGlobleOrderList,
    updateGlobleOrderPosition,
    globleSelectedTradingType,
    updateGlobleClosedList,
  } = useContext(PostContext);

  const handdleTextBoxEvent = (e, index, refType) => {
    let selectedValue = e.target.value;
    // Update the state for the selected row
    setOrderCompletedList((prevRowData) => {
      if (selectedValue > 0) {
        prevRowData[index][refType] = selectedValue;
      } else {
        prevRowData[index][refType] = "";
      }
      return prevRowData;
    });
  };

  useEffect(() => {
    if (globleOrderList.length > 0) {
      setOrderCompletedList(globleOrderList);
    } else {
      setOrderCompletedList([]);
    }
  }, [globleOrderList]);

  useEffect(() => {
    if (globleOrderList.length > 0) {
      setCompletedOrderCount(
        globleOrderList?.filter(
          (data) => data.orderstatus.toUpperCase() === "COMPLETED"
        )?.length
      );
    } else {
      setCompletedOrderCount(0);
    }
  }, [orderCompletedList]);

  const handleKeyDown = (e, index, data) => {
    if (e.key === "Enter") {
      setProcessOrder(true);
      if (globleSelectedTradingType.toLowerCase() === "paper") {
        processorderupdatepaper(
          data.orderid,
          data.instrumentToken,
          data.orderprice,
          data.orderaction
        );
      } else {
        processorderupdatelive(
          data.orderid,
          data.instrumentToken,
          data.orderidbybroker,
          data.orderprice,
          data.orderaction
        );
      }
    }
  };

  const processorderupdatepaper = async (
    orderid,
    instrumentToken,
    orderprice,
    orderaction
  ) => {
    let requestData = {
      orderid: orderid.toString(),
      instrumentToken: instrumentToken,
      orderprice: orderprice.toString(),
      orderaction: orderaction,
    };
    const resultData = await PaperTradingAPI.processorderupdatepaper(
      requestData
    );
    if (resultData != null) {
      setProcessOrder(false);
      if (resultData.toString() === "true") {
        alertify.success("Order prices updated successfully.");
      } else {
        alertify.error("Unable to process request now.Please try again.");
      }
    } else {
      setProcessOrder(false);
      alertify.error("Unable to process request now.Please try again.");
    }
  };

  const processorderupdatelive = async (
    orderid,
    instrumentToken,
    orderidbybroker,
    orderprice,
    orderaction
  ) => {
    let requestData = {
      orderid: orderid.toString(),
      instrumentToken: instrumentToken,
      orderidbybroker: orderidbybroker,
      orderprice: orderprice.toString(),
      logintoken: sessionStorage.getItem("apiSecret"),
      orderaction: orderaction,
    };
    const resultData = await LiveTradingAPI.processorderupdatelive(requestData);
    if (resultData != null) {
      setProcessOrder(false);
      alertify.success(resultData);
    } else {
      setProcessOrder(false);
    }
  };

  const onexitpendingorder = (data) => {

    if (globleSelectedTradingType.toLowerCase() === "paper") {
      processexitpendingorderpaper(data.orderid);
    } else {
      processexitpendingorderlive(data.orderid, data.orderidbybroker);
    }
  };

  const processexitpendingorderpaper = async (orderid) => {
    let requestData = {
      orderid: orderid.toString(),
    };
    const resultData = await PaperTradingAPI.processexitpendingorderpaper(
      requestData
    );
    if (resultData != null) {
      if (resultData.toString() === "true") {
        alertify.success("Order cancelled successfully.");
      } else {
        alertify.error("Unable to process request now.Please try again.");
      }
    } else {
      alertify.error("Unable to process request now.Please try again.");
    }
  };

  const processexitpendingorderlive = async (orderid, orderidbybroker) => {
    let requestData = {
      orderid: orderid.toString(),
      orderidbybroker: orderidbybroker,
      logintoken: sessionStorage.getItem("apiSecret"),
    };
    const resultData = await LiveTradingAPI.processexitpendingorderlive(
      requestData
    );
    if (resultData != null) {
      alertify.success(resultData);
    } else {
      alertify.error("Unable to process request now.Please try again.");
    }
  };

  return (
    <>
      <Card className="shadow">
        <CardBody>
          <Row className="mt-1 mb-1">
            <Col xl="1"></Col>
            <Col xl="11">
              <label
                className="form-control-label mr-1"
                htmlFor="input-username"
              >
                Total Orders :
              </label>
              <span className="text-bold font-14px">
                {orderCompletedList?.length}
              </span>
              <label
                className="form-control-label ml-1 mr-1"
                htmlFor="input-username"
              >
                Completed :
              </label>
              <span className="text-bold text-success font-14px">
                {completedOrderCount}
              </span>
            </Col>
          </Row>
          <Row>
            <Col xl="12 completeorderlist">
              <div className="table-container">
                <Table className="align-items-center OrderList">
                  <thead className="thead-light">
                    <tr className="text-center">
                      <th scope="col">Time Stamp</th>
                      <th scope="col">Order ID</th>
                      <th scope="col">Side</th>
                      <th scope="col">Instrument</th>
                      <th scope="col">Product</th>

                      <th scope="col">Type</th>
                      <th
                        scope="col"
                        className="text-center"
                        style={{ width: "12%" }}
                      >
                        Lot
                      </th>
                      <th
                        scope="col"
                        className="text-right"
                        style={{ width: "8%" }}
                      >
                        Price
                      </th>
                      <th scope="col">Status</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderCompletedList !== undefined &&
                      orderCompletedList !== null &&
                      orderCompletedList.length > 0 &&
                      orderCompletedList?.map((data, index) => (
                        <tr key={data.orderid}>
                          <td className="text-center">{data.ordertimestamp}</td>
                          <td className="text-center">
                            {globleSelectedTradingType === "Live"
                              ? data.orderidbybroker
                              : data.orderreferanceid}
                          </td>
                          <td className="text-center">
                            <span
                              className={
                                data.orderaction.toLowerCase() === "buy"
                                  ? "btn text-success text-bold buy-light"
                                  : "btn text-danger text-bold sell-light"
                              }
                            >
                              {data.orderaction}
                            </span>
                          </td>
                          <td className="text-left">
                            {data.strikeprice === "0" ? (
                              data.instrumentname
                            ) : (
                              <>
                                <strong>{data.instrumentname}</strong>{" "}
                                {Constant.ConvertShortDate(data.expirydate)}{" "}
                                {data.strikeprice} {data.orderside}
                              </>
                            )}
                          </td>

                          <td className="text-center">
                            <span
                              className={
                                data.productname.toLowerCase() === "mis"
                                  ? "btn text-product-mis text-bold buy-light"
                                  : "btn text-product-nmrd text-bold sell-light"
                              }
                            >
                              {data.productname}
                            </span>
                          </td>

                          <td className="text-center">{data.ordertype}</td>
                          <td className="text-center" style={{ width: "10%" }}>
                            <fieldset className="border">
                              <legend align="right">
                                {data.filledQty}/{data.orderqty}
                              </legend>
                              {data.filledLot}/{data.nooforderlot}
                            </fieldset>
                          </td>
                          <td className="text-right" style={{ width: "8%" }}>
                            {data.orderstatus.toLowerCase() === "pending" ||
                              data.orderstatus.toLowerCase() === "open" ? (
                              <Input
                                className="form-control-alternative form-row-data text-right"
                                id="input-postal-code"
                                style={{ marginTop: "3px" }}
                                placeholder="Price"
                                name="orderprice"
                                type="number"
                                min="1"
                                inputMode="numeric"
                                value={data.orderprice}
                                onKeyDown={(e) => handleKeyDown(e, index, data)}
                                onChange={(e) =>
                                  handdleTextBoxEvent(e, index, "orderprice")
                                }
                                disabled={processOrder}
                              />
                            ) : (
                              Constant.CurrencyFormat(data.orderprice)
                            )}
                          </td>
                          <td className="text-center">
                            <span
                              style={{ fontSize: "8px" }}
                              className={`badge ${data.orderstatus.toLowerCase() === "completed"
                                  ? "badge-success"
                                  : data.orderstatus.toLowerCase() ===
                                    "pending" ||
                                    data.orderstatus.toLowerCase() === "open"
                                    ? "badge-warning"
                                    : "badge-cancel"
                                }`}
                            >
                              {data.orderstatus}
                            </span>
                          </td>
                          <td className="text-center">
                            {data.orderstatus.toLowerCase() === "pending" ||
                              data.orderstatus.toLowerCase() === "open" ? (
                              <span
                                style={{
                                  fontWeight: "bold",
                                  padding: "5px",
                                  cursor: "pointer",
                                }}
                                className="text-danger"
                                onClick={() => {
                                  onexitpendingorder(data);
                                }}
                              >
                                <i className="fa fa-remove  font-13px"></i>{" "}
                                <span className="font-9px">Exit </span>
                              </span>
                            ) : (
                              ""
                            )}
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
  );
};
export default AdminCompletedOrder;
