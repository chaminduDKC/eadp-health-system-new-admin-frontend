import React from 'react';
import "./header.css"
import {NavLink} from "react-router-dom";

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {stopTokenRefreshInterval} from "../../../util/axiosInstance.js";

const Header = ()=>{

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    return (
        <>
            <div className='header'>
            <div className="logo">
                <img src="https://img.freepik.com/premium-vector/health-logo-design-simple-concept-premium-vector_855487-1399.jpg" alt=""/>
            </div>
            <ul className="list">
                <li className="list-item"><NavLink to="/context/home" className={({ isActive }) => isActive ? "active" : undefined}>Home</NavLink></li>
                <li className="list-item"><NavLink to="/context/doctors" className={({ isActive }) => isActive ? "active" : undefined}>Doctor Services</NavLink></li>
                <li className="list-item"><NavLink to="/context/patients" className={({ isActive }) => isActive ? "active" : undefined}>Patient Service</NavLink></li>
                <li className="list-item"><NavLink to="/context/bookings" className={({ isActive }) => isActive ? "active" : undefined}>Channeling</NavLink></li>
                <li className="list-item"><NavLink to="/context/recents" className={({ isActive }) => isActive ? "active" : undefined}>Recent</NavLink></li>
                <li className="list-item"><NavLink to="/context/reviews" className={({ isActive }) => isActive ? "active" : undefined}>Reviews</NavLink></li>
                {/*<li className="list-item"><NavLink to="/context/settings" className={({ isActive }) => isActive ? "active" : undefined}>Settings</NavLink></li>*/}
            </ul>
            <div className="user">
                <span className="user-name">{localStorage.getItem("email")?.split("@")[0]}</span>
                <button onClick={handleClickOpen}>Logout</button>
            </div>
        </div>
            <React.Fragment>
                <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Logout?"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            If you logout, you will be redirected to the login page. Are you sure you want to logout?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            sx={{
                                color:"var(--color-green-forest)"
                            }}
                            onClick={()=>{
                            handleClose();
                        }} autoFocus>Cancel</Button>
                        <Button variant='contained'
                                sx={{
                                    backgroundColor:"var(--color-green-forest)"
                                }}
                                onClick={()=>{
                                    handleClose();
                                    stopTokenRefreshInterval();
                                    localStorage.clear();
                                    window.location.href = "/login";
                        }} >
                            Logout
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
            </>
    )
}
export default Header;