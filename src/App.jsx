import {Navigate, Route, Routes} from "react-router-dom";
import Login from "./pages/login/Login.jsx";
import {useEffect, useState} from "react";
import Context from "./pages/context/Context.jsx";
import Doctor from "./pages/context/screens/doctor/Doctor.jsx";
import Home from "./pages/context/screens/home/Home.jsx";
import Patient from "./pages/context/screens/patient/Patient.jsx";
import Channeling from "./pages/context/screens/channeling/Channeling.jsx";
import Recent from "./pages/context/screens/recent/Recent.jsx";
import Review from "./pages/context/screens/review/Review.jsx";
import {startTokenRefreshInterval} from "./util/axiosInstance.js";


function isValidToken(token) {
    // Check for undefined, null, empty string
    return token && token !== 'undefined' && token.trim() !== '';
}

function App() {

    const [isAuthenticated, setIsAuthenticated] = useState(isValidToken(localStorage.getItem("access_token")));
    const [email, setEmail] = useState("");
    useEffect(() => {
        setIsAuthenticated(isValidToken(localStorage.getItem("access_token")))
    }, [isAuthenticated]);

    const handleLogin = (userEmail) => {
        setIsAuthenticated(true);
        setEmail(userEmail);
    };

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) startTokenRefreshInterval();
    }, []);

    return (

        <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/context" /> : <Navigate to="/login" />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/context" /> : <Login onLogin={handleLogin} />} />
            <Route path="/context" element={isAuthenticated ? <Context onLogout={()=> setIsAuthenticated(false)} email={email}/> : <Navigate to="/login" />} >
                <Route path='/context' element={<Navigate to='/context/home' /> } />
                <Route path='/context/home' element={<Home />} />
                <Route path='/context/doctors' element={<Doctor />} />
                <Route path='/context/patients' element={< Patient/>} />
                <Route path='/context/bookings' element={<Channeling />} />
                <Route path='/context/recents' element={<Recent />} />
                <Route path='/context/reviews' element={<Review />} />
            </Route>
        </Routes>

    );

}

export default App
