import './patient.css'
import {
    Alert,
    Box,
    Button,
    CircularProgress, Collapse, IconButton,
    MenuItem,
    Paper,
    Table, TableBody, TableCell,
    TableContainer,
    TableHead, TablePagination, TableRow,
    TextField, Checkbox, AppBar, useTheme, FormControlLabel
} from "@mui/material";
import React, {useEffect, useState} from "react";
import axiosInstance from "../../../../util/axiosInstance.js";
import EditIcon from "@mui/icons-material/Edit";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DialogTitle from "@mui/material/DialogTitle";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import DialogActions from "@mui/material/DialogActions";
import {styled} from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogContentText from "@mui/material/DialogContentText";
import AlertHook from '../../../../util/Alert.js'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import {

    Grid,
    Divider
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WcIcon from '@mui/icons-material/Wc';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';

const columns = [
    { id: 'name', label: 'Name', minWidth: 100 },
    { id: 'age', label: 'Age', minWidth: 80 },
    { id: 'phone', label: 'Phone', minWidth: 60 },
    { id: 'email', label: 'Email', minWidth: 100 },
    { id: 'address', label: 'Address', minWidth: 100 },


];




const Patient = ()=>{

    const {alertStatus, open, showAlert, closeAlert} = AlertHook();


    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [age, setAge] = useState(null);
    const [password, setPassword] = useState("");



    const genders = [
        "Male","Female","Other"
    ]

    const [patients, setPatients] = useState([])

    const [enableEditMode, setEnableEditMode] = useState(false)
    const [updateUserId, setUpdateUserId] = useState("")

    const [loading, setLoading] = useState(false);
    const [patientCount, setPatientCount] = useState(0);


    const handleSubmit = async (e)=>{
        e.preventDefault();
        setLoading(true);

        if(enableEditMode){
            if(!name || !address || !phone || !gender || !age ){
                showAlert("empty-fields")
                setLoading(false);
                return;
            }
            const updateRequest = {
                name:name,
                address:address,
                phone:phone,
                gender:gender,
                age:age
            };
            try{
                await axiosInstance.put(`http://localhost:9090/api/users/update-user/${updateUserId}`,
                    updateRequest, {headers:{Authorization:`Bearer ${localStorage.getItem("access_token")}`}});
                fetchPatients();
                setEnableEditMode(false)
                clearFields();
                setLoading(false)
                showAlert("success-update")
            } catch (e) {
                showAlert("failed-update")
                console.log(e)
                setLoading(false);
            }
        } else{
            if(!name || !email || !address || !phone || !gender || !age || !password){
                showAlert("empty-fields")
                setLoading(false);
                return;
            }
            const request = {
                name:name,
                email:email,
                password:password,
                address:address,
                phone:phone,
                gender:gender,
                age:age
            };

            try {
                await axiosInstance.post("http://localhost:9090/api/users/register-patient",
                    request, {headers:{Authorization:`Bearer ${localStorage.getItem("access_token")}`}});

                await fetchPatients();
                await clearFields();
                setLoading(false)
                showAlert("success-create")
                setLoading(false);
                await fetchPatients()
                await clearFields();
            } catch (e) {
                showAlert("failed-create")
                await fetchPatients();
                console.log(e)
                setLoading(false);
            }
        }
    }


    useEffect(() => {
        fetchPatients();
    }, []);

    const clearFields = async () => {
        setGender(null);
        setEmail("");
        setPhone("");
        setName("");
        setAge("");
        setAddress("")
        setPassword("");
    }


    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        fetchPatients(newPage, rowsPerPage, searchText)
    };

    const handleChangeRowsPerPage = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
        fetchPatients(0, newSize, searchText);
    };

    const [searchText, setSearchText] = useState("")


    const fetchPatients = async (pageNumber = page, size = rowsPerPage, search = searchText)=>{
        try {
            const response = await axiosInstance.get("http://localhost:9092/api/patients/find-all-patients", {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
                params:{
                    searchText:search,
                    page:pageNumber,
                    size:size
                }
            });
            setPatients(response.data.data.patientList);
            setPatientCount(response.data.data.patientCount)

        } catch (error) {
            showAlert("failed-fetch")
            console.error("Error fetching patients:", error);
        }
    }


    const rows = patients.map((pat) => ({
        name: pat.name,
        email: pat.email,
        phone: pat.phone,
        address: pat.address,
        age: pat.age,
        gender:pat.gender,
        patientId:pat.patientId,
        userId:pat.userId
    }));

    const [modalData, setModalData] = useState({})


    const editPatient = async (patient)=>{
        await clearFields();
        setData(patient);
        setEnableEditMode(true);
        setUpdateUserId(patient.userId);

    }
    const setData = (patient)=>{
        setName(patient.name);
        setEmail(patient.email);
        setAddress(patient.address);
        setPhone(patient.phone);
        setPassword("");
    }

    const BootstrapDialog = styled(Dialog)(({ theme }) => ({
        '& .MuiDialogContent-root': {
            padding: theme.spacing(2),
        },
        '& .MuiDialogActions-root': {
            padding: theme.spacing(1),
        },
    }));



    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleCloseDeleteModal = ()=>{
        setDeleteModalOpen(false);
    }

    const deletePatient = async (userId) => {
        console.log(userId)

        try {
             await axiosInstance.delete(`http://localhost:9090/api/users/delete-user/${userId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
            });

                await fetchPatients();
                showAlert("success-delete")
        } catch (e) {
            showAlert("failed-delete")
            console.log(e)
        }


    }







    const isValidEmail = /\S+@\S+\.\S+/.test(email);
    const isValidName =/^[A-Za-z\s]+$/.test(name);
    const isValidPassword = /^(?=.*[@&$])[A-Za-z0-9@&$]{6,}$/.test(password);

    const [openProfileModal, setOpenProfileModal] = useState(false);

    const handleCloseProfileModal = ()=>{
        setOpenProfileModal(false);
    }

    const infoItems = [
        { label: 'Email', icon: <EmailIcon sx={{ color: '#d32f2f' }} />, field: 'email' },
        { label: 'Phone', icon: <PhoneIcon sx={{ color: '#388e3c' }} />, field: 'phone' },
        { label: 'Date of Birth', icon: <CalendarTodayIcon sx={{ color: '#f57c00' }} />, field: 'dob' },
        { label: 'Gender', icon: <WcIcon sx={{ color: '#7b1fa2' }} />, field: 'gender' },
        { label: 'Blood Type', icon: <BloodtypeIcon sx={{ color: '#c62828' }} />, field: 'bloodType' },
        { label: 'Address', icon: <LocationOnIcon sx={{ color: '#0288d1' }} />, field: 'address' },
    ];

    return (
        <>
            {
                open && (
                    <Box sx={{ width: '50%', margin: "0 auto", position: "absolute", top: "65px", right: "0", left: "0", zIndex: "14" }}>
                        <Collapse in={open}>
                            <Alert
                                severity={alertStatus.includes("success") ? "success" : "error"}
                                action={
                                    <IconButton
                                        aria-label="close"
                                        color="inherit"
                                        onClick={closeAlert}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                }
                            >
                                {alertStatus === "success-create" && "Patient created successfully!"}
                                {alertStatus === "success-update" && "Patient updated successfully!"}
                                {alertStatus === "success-delete" && "Patient deleted successfully!"}
                                {alertStatus === "success-fetch" && "Patients fetched successfully!"}
                                {alertStatus === "failed-create" && "Failed to create patient. Please try again."}
                                {alertStatus === "failed-update" && "Failed to update patient. Please try again."}
                                {alertStatus === "failed-delete" && "Failed to delete patient. Please try again."}
                                {alertStatus === "failed-fetch" && "Failed to fetch patients. Please try again."}
                                {alertStatus === "empty-fields" && "Please fill all the fields."}
                            </Alert>
                        </Collapse>
                    </Box>
                )
            }

            <div className="patient">
                <BootstrapDialog
                    open={openProfileModal}
                    onClose={handleCloseProfileModal}
                    aria-labelledby="patient-details-title"
                    PaperProps={{
                        sx: {
                            width: '600px',
                            maxWidth: '95%',
                            borderRadius: 2
                        }
                    }}
                >
                    <DialogTitle sx={{ m: 0, p: 2 , display:"flex", alignItems:"center", justifyContent:"space-between"}} id="patient-details-title">
                       <Box sx={{display:"flex", alignItems:"center"}}>
                           <Typography variant="h6" fontWeight="bold">
                               Patient Details
                           </Typography>
                           <IconButton sx={{marginLeft:"10px"}}>
                               <DeleteIcon
                                   onClick={()=>{
                                      setDeleteModalOpen(true)
                                   }}
                                   color="error" />
                           </IconButton>
                       </Box>
                        <IconButton
                            aria-label="close"
                            onClick={handleCloseProfileModal}
                            sx={{
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent dividers>

                            <Box sx={{
                                display:"flex",
                                alignItems:"center",
                                width:"100%",
                                boxShadow:"rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
                                borderRadius:"10px",
                                mx:"auto",
                                marginBottom:"10px"

                            }}>
                                {
                                    modalData.image? (
                                        <img style={{width:"100px", height:"100px", borderRadius:"50%"}} src={modalData.image} alt="profile"/>
                                    ):(

                                        <IconButton
                                            disabled
                                            sx={{
                                            width:"160px",
                                            height:"160px",
                                            borderRadius:"50%"
                                        }}>
                                            <AccountCircleIcon
                                                sx={{
                                                width:"160px",
                                                height:"160px",
                                                borderRadius:"50%"
                                            }}
                                            />
                                        </IconButton>

                                    )}
                                <Typography variant="h6">
                                    {modalData.name}
                                </Typography>
                            </Box>
                        <Grid container spacing={2}>
                            {infoItems.map((item, index) => (
                                <Box width="48%" mx="auto">
                                    <Paper
                                        elevation={3}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: 2,
                                            borderRadius: 2,
                                            height: '100%',
                                            width:"100%"
                                        }}
                                    >
                                        {item.icon}
                                        <Box ml={2}>
                                            <Typography
                                                variant="subtitle2"
                                                color="text.secondary"
                                                fontWeight="medium"
                                            >
                                                {item.label}
                                            </Typography>
                                            <Typography variant="body1">
                                                {modalData[item.field] || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Box>
                            ))}
                        </Grid>
                        {/**/}



                        {/**/}
                        <Box sx={{display:"flex",height:"40px", width:"100%", gap:"30px", mx:"auto", marginTop:"20px"}}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                sx={{
                                    height: '100%',
                                    '& .MuiInputBase-root': {
                                        height: '100%',
                                    },
                                    '& .MuiInputBase-input': {
                                        height: '100%',
                                        boxSizing: 'border-box',
                                        padding: '10px 14px', // optional: adjust vertical alignment
                                    }
                                }}
                            />
                            <Button sx={{
                                backgroundColor:"var(--color-green-forest)",
                                color:"var(--color-cream)",
                                width:"300px"
                            }}
                                    onClick={()=>{

                                    }}
                            >change email</Button>

                        </Box>
                        <Box sx={{display:"flex",height:"40px", width:"100%", gap:"30px", mx:"auto", marginTop:"20px"}}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                sx={{
                                    height: '100%',
                                    '& .MuiInputBase-root': {
                                        height: '100%',
                                    },
                                    '& .MuiInputBase-input': {
                                        height: '100%',
                                        boxSizing: 'border-box',
                                        padding: '10px 14px', // optional: adjust vertical alignment
                                    }
                                }}
                            />
                            <Button sx={{
                                backgroundColor:"var(--color-green-forest)",
                                color:"var(--color-cream)",
                                width:"300px"
                            }}
                                    onClick={()=>{

                                    }}
                            >change password</Button>

                        </Box>
                    </DialogContent>

                    <DialogActions>
                        <Button
                            onClick={handleCloseProfileModal}
                            sx={{
                                backgroundColor: "var(--color-green-dark)",
                                color: "var(--color-cream)",
                                '&:hover': {
                                    backgroundColor: "var(--color-green-forest)",
                                }
                            }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </BootstrapDialog>

                {/*delete modal*/}
                <React.Fragment>
                    <Dialog
                        open={deleteModalOpen}
                        onClose={handleCloseDeleteModal}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                            {"Delete?"}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                If you delete, all patient related data will be delete
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                sx={{
                                    color:"var(--color-green-forest)"
                                }}
                                onClick={()=>{
                                    handleCloseDeleteModal();
                                }} autoFocus>Cancel</Button>
                            <Button variant='contained'
                                    sx={{
                                        backgroundColor:"var(--color-green-forest)"
                                    }}
                                    onClick={()=>{
                                        deletePatient(modalData.userId).then(()=>{
                                            fetchPatients().then(()=>{
                                                handleCloseDeleteModal();
                                                handleCloseProfileModal();
                                            });
                                        })


                                    }} >
                                Delete
                            </Button>
                        </DialogActions>
                    </Dialog>
                </React.Fragment>


                <div className="form-section">
                    <form>
                        <TextField

                            label="Name"
                            variant="filled"
                            margin="normal"
                            helperText={!isValidName ? "Name must be contain only letters" : ""}
                            fullWidth
                            required
                            type="text"
                            value={name}
                            onChange={(e => setName(e.target.value))}
                        />
                        <TextField

                            label="Email"
                            variant="filled"
                            margin="normal"
                            helperText={!isValidEmail ? "Invalid email address" : ""}
                            fullWidth
                            disabled={enableEditMode}
                            required
                            type="email"
                            value={email}
                            onChange={(e => setEmail(e.target.value))}
                        />
                        <TextField

                            label="Address"
                            variant="filled"

                            margin="normal"
                            fullWidth
                            required
                            type="text"
                            value={address}
                            onChange={(e => setAddress(e.target.value))}
                        />
                        <TextField

                            label="Password"
                            variant="filled"
                            margin="normal"
                            helperText={!isValidPassword ? "Password must be at least 6 characters long, include special characters" : ""}
                            fullWidth
                            disabled={enableEditMode}
                            required
                            type="password"
                            value={password}
                            onChange={(e => setPassword(e.target.value))}
                        />
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            flexDirection: {xs: "column", sm: "row"}
                        }}>
                            <TextField

                                label="Phone"
                                variant="filled"
                                margin="normal"
                                fullWidth

                                required
                                type="text"
                                value={phone}
                                onChange={(e => setPhone(e.target.value))}
                            />
                            <TextField
                                sx={{
                                    marginTop: "8px"
                                }}
                                id="outlined-select-experience"
                                select
                                variant="filled"
                                fullWidth
                                label="Gender"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                            >
                                {genders.map((option) => (
                                    <MenuItem key={option} value={option}
                                              sx={{
                                                  color: 'var(--text-primary)',
                                                  backgroundColor: 'var(--bg-secondary)'
                                              }}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField

                                label="Age"
                                variant="filled"
                                margin="normal"
                                fullWidth
                                required
                                type="number"
                                value={age}
                                onChange={(e => setAge(e.target.value))}
                            />
                        </Box>
                        <Box mt={2} gap={2} display="flex" alignItems="center">
                            <Button type="submit" onClick={(e) => {
                                handleSubmit(e);
                            }} variant="contained"

                                    sx={{
                                        backgroundColor: "var(--color-green-dark)",
                                        color: "var(--color-cream)",
                                        height: 40,
                                        minWidth: 120,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                {loading ?
                                    <CircularProgress size={24} sx={{color: 'var(--bg-primary)'}}/>
                                    : enableEditMode ? "Update User" : "Save User"}
                            </Button>

                            <Button
                                sx={{
                                    color:"var(--color-green-dark)",
                                    backgroundColor:"transparent",
                                    fontWeight:"bold",

                                }}

                                onClick={() => {
                                    setEnableEditMode(false)
                                    setLoading(false)
                                    clearFields();
                                }}>Cancel</Button>

                        </Box>
                    </form>
                </div>
                <div className="patient-table">
                    <TextField
                        sx={{
                            marginBottom: "20px"
                        }}
                        value={searchText}
                        fullWidth
                        id="filled-search"
                        label="Search by name or email"
                        type="search"
                        variant="filled"
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearchText(value)
                            console.log("search text is " + value)
                            fetchPatients(page, rowsPerPage, value).then(() => {

                            })

                        }}
                    >
                    </TextField>
                    <hr/>

                    <Paper sx={{width: '100%', overflow: 'hidden'}}>
                        <TableContainer sx={{maxHeight: 575}}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        {columns.map((column) => (
                                            <TableCell
                                                sx={{
                                                    fontWeight: "bold"
                                                }}
                                                key={column.id}
                                                align={column.align}
                                                style={{minWidth: column.minWidth}}
                                                onClick={() => {
                                                    console.log(column)
                                                }}
                                            >
                                                {column.label}
                                            </TableCell>
                                        ))}

                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    { rows
                                        .map((row) => {

                                            return (
                                                <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>

                                                    {columns.map((column) => {
                                                        const value = row[column.id];
                                                        return (
                                                            <TableCell key={column.id} align={column.align}>
                                                                {column.id === "name" ?
                                                                    <>
                                                                        <IconButton>
                                                                            <EditIcon onClick={() => {
                                                                                editPatient(row);
                                                                            }}

                                                                            />

                                                                        </IconButton>
                                                                        <IconButton>
                                                                            <CalendarMonthIcon onClick={() => {
                                                                                setModalData(row)
                                                                                setOpenProfileModal(true)

                                                                            }}/>
                                                                        </IconButton>
                                                                    </>
                                                                    : ""

                                                                }
                                                                {value}



                                                            </TableCell>
                                                        );
                                                    })}
                                                    <Box sx={{
                                                        marginTop: "6px"
                                                    }}>

                                                    </Box>
                                                </TableRow>
                                            );
                                        })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 100]}
                            component="div"
                            count={patientCount}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Paper>
                </div>
                </div>
        </>
    )
}
export default Patient;