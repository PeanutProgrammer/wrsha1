import React, { useState } from "react";
import './style/Login.css';
import axios from "axios";
import Alert from "react-bootstrap/Alert";
import { setAuthUser } from "./helper/Storage";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [login, setlogin] = useState({
        username: "",
        password: "",
        err: [],
        loading: false,
    });

    const LoginFun = (e) => {
        e.preventDefault();
        setlogin({ ...login, loading: true, err: [] });
        axios
          .post(`${process.env.REACT_APP_BACKEND_BASE_URL}/auth/login`, {
            username: login.username,
            password: login.password,
          })
          .then((resp) => {
            setlogin({ ...login, loading: false, err: [] });
            setAuthUser(resp.data);
            navigate("dashboard/Home");
          })
          .catch((err) => {
            console.log(err + "");
            setlogin({
              ...login,
              loading: false,
              err: err.response.data.errors,
            });

            setTimeout(() => {
              setlogin((prev) => ({ ...prev, err: [] }));
            }, 3000);
          });
    }

    return (
        <section className="Log">
            <div className="form-box">
                  {/* ✅ Floating error alert box */}
    {login.err.length > 0 && (
      <div className="error-container">
        {login.err.map((error, index) => (
          <Alert key={index} variant="danger" className="p-2 text-center mb-0">
            {error.msg}
          </Alert>
        ))}
      </div>
    )}
                <div className="form-value">
                    <form onSubmit={LoginFun}>
                        <h2 className="hh2">تسجيل الدخول</h2>

                        <div className="inputbox">
                            <ion-icon name="mail-outline"></ion-icon>
                            <input
                                id="username"
                                type="text"
                                required
                                value={login.username}
                                onChange={(e) => setlogin({ ...login, username: e.target.value })}
                            />
                            <label htmlFor="username">اسم المستخدم</label>
                        </div>

                        <div className="inputbox">
                            <ion-icon name="lock-closed-outline"></ion-icon>
                            <input
                                id="password"
                                type="password"
                                required
                                value={login.password}
                                onChange={(e) => setlogin({ ...login, password: e.target.value })}
                            />
                            <label htmlFor="password">كلمة السر</label>
                        </div>

                        <div className="forget">
                            <label>
                                <input className="check" type="checkbox" /> تذكرني
                            </label>
                        </div>

                        <button className="Buton" disabled={login.loading}>
                            {login.loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Login;
