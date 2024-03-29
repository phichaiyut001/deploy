import React, { useState, useEffect } from "react";
import LayoutAdmin from "./components/LayoutAdmin";
import { useDispatch } from "react-redux";
import axios from "axios";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Table, Modal, Form, Input, Select, message } from "antd";
import Swal from "sweetalert2";

const Items = () => {
  const [file, setFile] = useState(null);
  const [itemsData, setItemsData] = useState([]);
  const dispatch = useDispatch();
  const [popupModal, setPopupModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  //useEffect
  const getAllItems = async () => {
    try {
      dispatch({
        type: "SHOW_LOADING",
      });
      const { data } = await axios.get(
        "https://deploy-serverss.vercel.app/api/items/get-item"
      );
      const itemWithIndex = data.map((items, index) => ({
        ...items,
        index: index + 1,
      }));
      setItemsData(itemWithIndex);
      dispatch({ type: "HIDE_LOADING" });
      console.log(data);
    } catch (error) {
      dispatch({ type: "HIDE_LOADING" });
      console.log(error);
    }
  };

  useEffect(() => {
    getAllItems();
  }, []);

  //handle delete

  const handleDelete = async (record) => {
    try {
      const swalResult = await Swal.fire({
        title: "ต้องการที่จะลบหรือไม่ ?",
        text: "กด Cancel เพื่อยกเลิก !",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (swalResult.isConfirmed) {
        dispatch({
          type: "SHOW_LOADING",
        });

        await axios.post(
          "https://deploy-serverss.vercel.app/api/items/delete-item",
          { itemId: record._id }
        );

        Swal.fire({
          title: "Deleted!",
          text: "สินค้าถูกลบแล้ว",
          icon: "success",
        });

        message.success("items Deleted Successfully");
        getAllItems();
        setPopupModal(false);
        dispatch({ type: "HIDE_LOADING" });
      }
    } catch (error) {
      dispatch({ type: "HIDE_LOADING" });
      message.error("Something Went Wrong");
      console.log(error);
    }
  };

  //able data
  const columns = [
    {
      title: "No",
      dataIndex: "index",
      width: 10,
    },
    { title: "ชื่อสินค้า", dataIndex: "name" },
    {
      title: "รูปสินค้า",
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
    { title: "ราคา", dataIndex: "price" },
    { title: "จำนวน", dataIndex: "stock" },
    {
      title: "หมวดหมู่",
      dataIndex: "category",
      sorter: (a, b) => a.category.localeCompare(b.category),
    },
    {
      title: "",
      dataIndex: "_id",
      render: (id, record) => (
        <div>
          <EditOutlined
            style={{ cursor: "pointer" }}
            onClick={() => {
              setEditItem(record);
              setFile(null);
              setPopupModal(true);
            }}
          />
          <DeleteOutlined
            style={{ cursor: "pointer" }}
            onClick={() => {
              handleDelete(record);
            }}
          />
        </div>
      ),
    },
  ];

  // handle submit
  const handleSubmit = async (value) => {
    const formData = new FormData();
    formData.append("name", value.name);
    formData.append("price", value.price);
    formData.append("stock", value.stock);
    formData.append("category", value.category);
    if (file) {
      formData.append("image", file);
    }

    try {
      dispatch({
        type: "SHOW_LOADING",
      });

      if (editItem === null) {
        // Add Item
        await axios.post(
          "https://deploy-serverss.vercel.app/api/items/add-item",
          formData
        );
        message.success("Item Added Successfully");
      } else {
        // Update Item using PUT request
        await axios.put(
          `https://deploy-serverss.vercel.app/api/items/edit-item/${editItem._id}`,
          formData
        );
        message.success("Item Update Successfully");
      }

      getAllItems();
      setPopupModal(false);
      dispatch({
        type: "HIDE_LOADING",
      });
    } catch (error) {
      dispatch({
        type: "HIDE_LOADING",
      });
      message.error("Something Went Wrong");
      console.log(error);
    }
  };

  return (
    <LayoutAdmin>
      <main className="main-container">
        <div className="d-flex justify-content-between">
          <h1>รายการสินค้า</h1>
          <Button type="primary" onClick={() => setPopupModal(true)}>
            เพิ่มสินค้า
          </Button>
        </div>
        <Table columns={columns} dataSource={itemsData} bordered />

        {popupModal && (
          <Modal
            title={`${editItem !== null ? "แก้ไขสินค้า " : "เพิ่มสินค้า ใหม่"}`}
            open={popupModal}
            onCancel={() => {
              setEditItem(null);
              setPopupModal(false);
            }}
            footer={false}
          >
            <Form
              layout="vertical"
              initialValues={editItem}
              onFinish={handleSubmit}
            >
              <Form.Item
                name="name"
                label="ชื่อสินค้า"
                rules={[{ required: true, message: "กรุณากรอก ชื่อสินค้า" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="price"
                label="ราคา"
                rules={[{ required: true, message: "กรุณากรอก ราคาสินค้า" }]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item
                name="stock"
                label="จำนวน"
                rules={[{ required: true, message: "กรุณากรอก จำนวนสินค้า" }]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item
                name="image"
                label="รูปสินค้า"
                rules={[{ required: true, message: "กรุณาใส่รูปสินค้า" }]}
              >
                {editItem && editItem.image && (
                  <div>
                    <img
                      src={`/images/${editItem.image}`} // Assuming the 'image' field contains the URL of the existing image
                      alt="Current Item Image"
                      style={{ maxWidth: "100px", marginBottom: "10px" }}
                    />
                  </div>
                )}
                <Input type="file" onChange={handleFileChange} />
              </Form.Item>
              <Form.Item
                name="category"
                label="หมวดหมู่"
                rules={[{ required: true, message: "กรุณาเลือกประเภท สินค้า" }]}
              >
                <Select>
                  <Select.Option value="drinks">Drinks</Select.Option>
                  <Select.Option value="rice">Rice</Select.Option>
                  <Select.Option value="fish">Fish</Select.Option>
                  <Select.Option value="etc">Snack</Select.Option>
                  <Select.Option value="chili">Chilli</Select.Option>
                </Select>
              </Form.Item>
              <div className="d-flex justify-content-end">
                <Button type="primary" htmlType="submit">
                  บันทึก
                </Button>
              </div>
            </Form>
          </Modal>
        )}
      </main>
    </LayoutAdmin>
  );
};

export default Items;
