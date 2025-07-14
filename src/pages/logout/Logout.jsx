import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();
    useEffect(() => {
        // Remove tokens from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Optionally clear all localStorage if needed:
        // localStorage.clear();
        // Redirect to login page
        navigate('/login');
    }, [navigate]);
    return null;
};

export default Logout;