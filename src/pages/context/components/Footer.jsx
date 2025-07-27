import React, {Fragment} from 'react';
import "./footer.css";

const Footer = ()=>{
    return (
        <footer className="footer">
            <div className="container">
                <p className="text-muted">© {new Date().getFullYear()} Hope Health. All rights reserved
                </p>
            </div>
        </footer>
    );
}
export default Footer;