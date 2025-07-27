import React from 'react';
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import {Outlet} from "react-router-dom";

const Context = () => {
    return (
        <div >
            <Header  />
            <div className="context-container" style={{
                paddingTop:"6vh",
                paddingBottom:"4vh",

            }}>
                <Outlet />
            </div>

            <Footer />
        </div>
    )
};

export default Context;
