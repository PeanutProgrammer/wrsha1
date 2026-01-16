import React, { useState } from "react";
import Header from './shared/Header';
import Footer from './shared/Footer';
import Aside from './shared/Aside';
import './style/App.css';
import './style/Home.css';
import { Outlet } from 'react-router-dom';

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Header collapsed={collapsed
      }/>
      <div className={`app-container ${collapsed ? 'collapsed' : 'expanded'}`}>
        <Aside setCollapsed={setCollapsed} collapsed={collapsed} />
        <main className="main-content">
          <div className="content-container">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}

export default App;
