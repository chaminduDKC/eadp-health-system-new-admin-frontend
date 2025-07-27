import './home.css'
import axiosInstance from "../../../../util/axiosInstance.js";
import {useEffect, useState} from "react";
import CloseIcon from "@mui/icons-material/Close";
import {Alert, Box, Collapse, IconButton} from "@mui/material";

const Home = ()=>{

    const [docCount, setDocCount] = useState(0);
    const [patCount, setPatCount] = useState(0);
    const [bokCount, setBokCount] = useState(0);
    const [tdyBokCount, setTdyBokCount] = useState(0);
    const [pendingDocs, setPendingDocs] = useState(0);
    const [pendingPats, setPendingPats] = useState(0);

    const [open, setOpen] = useState(true);

    const [isError, setIsError] = useState(false);

    const doctorCount = async ()=>{
        try {
            const count = await axiosInstance.get("http://localhost:9091/api/doctors/countAll", {

            });
            setDocCount(count.data.data)
            setIsError(false)
        } catch (error) {
            console.error("Error fetching doctor count:", error);
            setIsError(true);
            return 0; // Return 0 or handle the error as needed
        }

    }

    const patientCount = async ()=>{
        try {
            const count = await axiosInstance.get("http://localhost:9092/api/patients/countAll", {

            });
            setPatCount(count.data.data)
            setIsError(false);
        } catch (error) {
            setIsError(true);
            console.error("Error fetching patient count:", error);
            return 0; // Return 0 or handle the error as needed
        }

    }

    const bookingCount = async ()=>{
        try {
            const count = await axiosInstance.get("http://localhost:9093/api/bookings/count-all", {

            });
            setBokCount(count.data.data)
            setIsError(false);
        } catch (error) {
            setIsError(true);
            console.error("Error fetching booking count:", error);
            return 0; // Return 0 or handle the error as needed
        }
    }
    const todayBookingCount = async ()=>{
        try {
            const count = await axiosInstance.get("http://localhost:9093/api/bookings/count-today", {
                params:{
                    date: new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
                }
            });
            setTdyBokCount(count.data.data)
            setIsError(false);
        } catch (error) {
            setIsError(true);
            console.error("Error fetching today's booking count:", error);
            return 0; // Return 0 or handle the error as needed
        }
    }



    useEffect(() => {
        doctorCount();
        patientCount();
        bookingCount();
        todayBookingCount();
    }, []);

    return (
        <>
            {
                isError && (
                    <Box sx={{ width: '50%', margin:"0 auto", position:"absolute", top:"65px", right:"0", left:"0" }}>
                        <Collapse in={open}>
                            <Alert
                                severity="error"
                                action={
                                    <IconButton
                                        aria-label="close"
                                        color="inherit"
                                        onClick={() => {
                                            setIsError(false);
                                            setOpen(false);
                                        }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                }
                            >
                                Failed to fetch data. Please try again later.
                            </Alert>
                        </Collapse>
                    </Box>
                )
            }
        <div className="home">
            <div className="service-cards">
                <div className="card">
                    <i className="fa-solid fa-user-doctor"></i>
                    <h3>Registered Doctors</h3>
                    <h1>{docCount}</h1>
                </div>

                <div className="card">
                    <i className="fa-solid fa-hospital-user"></i>
                    <h3>Registered Patients</h3>
                    <h1>{patCount}</h1>
                </div>

                <div className="card">

                    <i className="fa-solid fa-stethoscope"></i>
                    <h3>Today Appointments</h3>
                    <h1>{tdyBokCount}</h1>
                </div>

                <div className="card">
                    <i className="fa-solid fa-calendar-check"></i>
                    <h3>All Appointments</h3>
                    <h1>{bokCount}</h1>
                </div>
                <div className="card">
                    <i className="fa-solid fa-star-half-stroke"></i>
                    <h3>Reviews</h3>
                    <h1>23</h1>
                </div>

            </div>
        </div>
            </>
    );
}
export default Home;