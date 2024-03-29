import React, { useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (value) => {
    try {
      dispatch({
        type: "SHOW_LOADING",
      });
      const res = await axios.post(
        "https://deploy-serverss.vercel.app/api/users/login",
        value
      );
      // Storing the user details in localStorage -> we can use sessions and cookies otherwise

      localStorage.setItem("auth", JSON.stringify(res.data));
      const isAdmin = res.data.roles.includes("admin");

      // Navigate to the appropriate route based on the user's role
      if (isAdmin) {
        navigate("/dashboard");
        message.success("ยินดีต้อนรับ Admin ");
      } else {
        navigate("/");
        message.success("เข้าสู่ระบบสำเร็จ ");
      }
      //   navigate("/");
      dispatch({ type: "HIDE_LOADING" });
    } catch (error) {
      dispatch({ type: "HIDE_LOADING" });
      message.error("UserId หรือ Password ไม่ถูกต้อง!");
      console.log(error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("auth")) {
      localStorage.getItem("auth");
      navigate("/");
    }
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={process.env.PUBLIC_URL + "/images/Banner1.jpg"}
        alt="Login Image"
        style={{ width: "900px", height: "600px", marginRight: "20px" }}
      />
      <div className="register">
        <div className="register-from">
          <h1>ระบบ POS ร้านข้าวปลาทอด </h1>
          <h3>Login Page</h3>
          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="UserId"
              label="User ID"
              rules={[{ required: true, message: "กรุณากรอก Username" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "กรุณากรอก Password" }]}
            >
              <Input type="password" />
            </Form.Item>
            <div className="d-flex justify-content-between">
              <p>
                Not a user Please
                <Link to="/register"> Register Here !</Link>
              </p>
              <Button type="primary" htmlType="submit">
                Login
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
