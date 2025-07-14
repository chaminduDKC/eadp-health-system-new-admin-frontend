import React, {useState} from 'react';
import {Box, Button, Checkbox, FormControlLabel, TextField, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";
import axios from "axios";


const CookieManagerService = {
    set:(token, key)=> localStorage.setItem(key, token),
    get: (key) => localStorage.getItem(key),
    tokenIsExists:(key)=> !!localStorage.getItem(key),
};



const Login = ({ onLogin }) => {





    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e)=>{
        e.preventDefault();

        const params = new URLSearchParams();
        params.append("grant_type", "password")
        params.append("client_id", "hope-health-client")
        params.append("username",username);
        params.append("password", password);

        try{

            const response = await axios.post(
                "http://localhost:8080/realms/hope-health-realm/protocol/openid-connect/token",
                params,
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );

            const token = response.data.access_token;
            console.log(token)
            const refreshToken = response.data.refresh_token;
            // Set email in context after successful login
            CookieManagerService.set(token, "access_token")
            CookieManagerService.set(refreshToken, "refresh_token")

            const payload = JSON.parse(atob(token.split('.')[1]));
            const roles = payload.resource_access?.["hope-health-client"]?.roles || [];

            if (roles.includes("admin")) {
                if(CookieManagerService.tokenIsExists("access_token")) {
                    if (onLogin) onLogin(username); // Pass username/email up
                    localStorage.setItem("email", username);
                    navigate("/context");
                }
            } else {
                alert("You need administrator privileges to access this application.");
            }

        } catch (e){
            console.log(e)
            alert("login failed")
        }

    }
    // const isValidEmail = /\S+@\S+\.\S+/.test(username);
    // const isValidPassword = /^(?=.*[@&$])[A-Za-z0-9@&$]{6,}$/.test(password);
    // const isValidForm = isValidEmail && isValidPassword;


    return (

        <div>
            <Box maxWidth={400} mx="auto" mt={5} p={3} border="1px solid #ccc" borderRadius={2}>
                <Typography sx={{

                }} variant="h5" mb={2}> Sign in</Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        required
                        type="email"
                        value={username}
                        onChange={(e => setUsername(e.target.value))}

                    />

                    <TextField
                        label="Password"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e => setPassword(e.target.value))}

                    />
                    <FormControlLabel control={
                        <Checkbox checked={showPassword}
                                  onChange={(e)=> setShowPassword(e.target.checked)} />
                    }
                                      sx={{ marginTop:"10px"}}
                                      label="show password"

                    />
                    {/*<Button type="submit" variant="contained" color="secondary" disabled={loading || !isValidForm} fullWidth={true}>Login</Button>*/}
                    <Button type="submit" variant="contained" color="secondary"  fullWidth={true}>Login</Button>
                </form>

            </Box>
        </div>

    );
};

export default Login;
