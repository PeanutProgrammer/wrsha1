import React, { useEffect, useState } from "react";
import '../style/Header.css';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { getAuthUser, removeAuthUser } from "../helper/Storage";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Header = () => {
    const auth = getAuthUser();
    const navigate = useNavigate();

    const logout = () => {
        axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/auth/logout`, {}, {
            headers: {
                token: auth.token
            }
        });

        removeAuthUser();
        navigate("/");
    };

    const UserOn = 'sideNav';
    const [User, setUser] = useState(UserOn);

    const Close = () => {
        setUser('sideNav');
    };

    const list = () => {
        if (User === UserOn) {
            setUser('sideNavNone');
        } else {
            setUser(UserOn);
        }
    };

    useEffect(() => {
        setUser('sideNavNone');
    }, []);

    return (
        <>
            <Navbar bg="dark" variant="dark" className="header">
                <Container fluid>
                    <Navbar.Brand href="/dashboard/Home">الورش الرئيسية للأسلحة رقم (1)</Navbar.Brand>

                    <div className="wel">
                        مرحباً, <span>{auth.name}</span>
                    </div>

                    <Nav className="ms-auto">
                        <Nav.Link onClick={logout}>تسجيل خروج</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
        </>
    );
};

export default Header;
