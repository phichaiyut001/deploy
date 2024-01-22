import React, { useState, useEffect } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  DeleteOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { Button, Modal, Table, message, Form, Input, Select } from "antd";

const CartPage = () => {
  const [changeAmount, setChangeAmount] = useState(0);
  const [isCashPaymentMode, setIsCashPaymentMode] = useState(false);
  const [subTotal, setSubTotal] = useState(0);
  const [billPopup, setBillPopup] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.rootReducer);
  //handle increament
  const handleIncressment = (record) => {
    dispatch({
      type: "UPDATE_CART",
      payload: { ...record, quantity: record.quantity + 1 },
    });
  };
  const handleDecressment = (record) => {
    if (record.quantity !== 1) {
      dispatch({
        type: "UPDATE_CART",
        payload: { ...record, quantity: record.quantity - 1 },
      });
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    {
      title: "Image",
      dataIndex: "image",
      render: (image, record) => (
        <img
          src={`/images/${image}`}
          alt={record.name}
          height="60"
          width="60"
        />
      ),
    },
    { title: "Price", dataIndex: "price" },
    {
      title: "Quantity",
      dataIndex: "_id",
      render: (id, record) => (
        <div>
          <PlusCircleOutlined
            className="mx-3"
            style={{ cursor: "pointer" }}
            onClick={() => handleIncressment(record)}
          />
          <b>{record.quantity}</b>
          <MinusCircleOutlined
            className="mx-3"
            style={{ cursor: "pointer" }}
            onClick={() => handleDecressment(record)}
          />
        </div>
      ),
    },
    {
      title: "Actions",
      dataIndex: "_id",
      render: (id, record) => (
        <DeleteOutlined
          style={{ cursor: "pointer" }}
          onClick={() =>
            dispatch({
              type: "DELETE_FORM_CART",
              payload: record,
            })
          }
        />
      ),
    },
  ];

  useEffect(() => {
    let temp = 0;
    cartItems.forEach((item) => (temp = temp + item.price * item.quantity));
    setSubTotal(temp);
  }, [cartItems]);

  //handleSubmit
  const handleSubmit = async (value) => {
    try {
      let newObject = {
        ...value,
        cartItems,
        subTotal,
        changeAmount,
        userId: JSON.parse(localStorage.getItem("auth"))._id,
      };

      if (value.paymentMode === "cash") {
        // ตรวจสอบว่าจำนวนเงินสดมากกว่าหรือเท่ากับราคารวมทั้งหมด
        if (parseFloat(value.change) >= subTotal) {
          newObject = {
            ...newObject,
            change: parseFloat(value.change),
          };
          
          // คำนวณจำนวนเงินทอดคืน
          const changeAmount = parseFloat(value.change) - subTotal;
          setChangeAmount(changeAmount);

          await axios.post("/api/bills/add-bills", newObject);
          dispatch({
            type: "CLEAR_CART",
          });
          message.success("Bill Generated");

          navigate("/bills");
          
    
        } else {
          // จำนวนเงินสดไม่เพียงพอ
          message.error("จำนวนเงินสดไม่เพียงพอ");
        }
      } else if (value.paymentMode === "promptpay") {
        // ถ้าไม่ได้เลือก "เงินสด" ให้ลบ property "change" ออกจาก newObject
        //delete newObject.change;
        newObject = {
          ...newObject,
          change: 0,
        };

        await axios.post("/api/bills/add-bills", newObject);
        dispatch({
          type: "CLEAR_CART",
        });
        message.success("Bill Generated");
        navigate("/bills");
      }
    } catch (error) {
      message.error("Something Went Wrong");
      console.log(error);
    }
  };

  return (
    <DefaultLayout>
      <h1>Cart Page</h1>
      <Table columns={columns} dataSource={cartItems} bordered />
      <div className="d-flex flex-column align-items-end">
        <hr />
        <h3>
          Subt Total : <b> {subTotal.toLocaleString()} </b> ฿{" "}
        </h3>
        <Button type="primary" onClick={() => setBillPopup(true) }>
          Create Invoice
        </Button>
      </div>
      <Modal
        title="Create Invoice"
        visible={billPopup}
        onCancel={() => setBillPopup(false)}
        footer={false}
      >
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="paymentMode" label="Payment Method">
            <Select
              onChange={(value) => setIsCashPaymentMode(value === "cash")}
            >
              <Select.Option value="cash">เงินสด</Select.Option>
              <Select.Option value="promptpay">โอน</Select.Option>
            </Select>
          </Form.Item>
          {/* ใช้ isCashPaymentMode เพื่อตรวจสอบการแสดงหรือซ่อน input */}
          {isCashPaymentMode && (
            <Form.Item name="change" label="รับเงิน">
              <Input
                onChange={(e) => {
                  const receivedAmount = parseFloat(e.target.value);
                  const change = receivedAmount - subTotal;
                  setChangeAmount(change);
                }}
              />
            </Form.Item>
          )}
          <div className="bill-it">
            <h5>
              Total : <b>{subTotal.toLocaleString()}</b>
            </h5>
            {changeAmount > 0 && (
              <h5>
                Change : <b>{changeAmount.toLocaleString()}</b>
              </h5>
            )}
          </div>
          <div className="d-flex justify-content-end">
            <Button type="primary" htmlType="submit">
              Generate Bill
            </Button>
          </div>
        </Form>
      </Modal>
    </DefaultLayout>
  );
};

export default CartPage;