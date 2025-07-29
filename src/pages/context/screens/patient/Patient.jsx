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
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import CakeIcon from '@mui/icons-material/Cake';
import LockIcon from '@mui/icons-material/Lock';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';



const columns = [
    { id: 'name', label: 'Name', minWidth: 100 },
    { id: 'age', label: 'Age', minWidth: 80 },
    { id: 'phone', label: 'Phone', minWidth: 60 },
    { id: 'email', label: 'Email', minWidth: 100 },
    { id: 'address', label: 'Address', minWidth: 100 },


];




const Patient = ()=>{
    const theme = useTheme();
    const [value, setValue] = useState("0");

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const {alertStatus, open, showAlert, closeAlert} = AlertHook();


    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [age, setAge] = useState(null);
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [showModalPassword, setShowModalPassword] = useState(false);


    const genders = [
        "Male","Female","Other"
    ]

    const [patients, setPatients] = useState([])

    const [enableEditMode, setEnableEditMode] = useState(false)
    const [updateUserId, setUpdateUserId] = useState("")

    const [loading, setLoading] = useState(false);
    const [patientCount, setPatientCount] = useState(0);

    const [openModalProfileDetails, setOpenModalProfileDetails] = useState(false);



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

    const [openModal, setOpenModal] = useState(false);

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

    const handleCloseModal = () => {
        setOpenModal(false);
        setOpenModalProfileDetails(false)
    };


    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleCloseDeleteModal = ()=>{
        setDeleteModalOpen(false);
    }

    const deletePatient = async (userId) => {

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



    const handleChangePassword = async ()=>{
        console.log(modalData.name)
        console.log(modalData.userId)
        await axiosInstance.put(`http://localhost:9090/api/users/update-password/${modalData.userId}`, {}, {params:{
                password:newPassword,
                role:"patient"
            }} ).then((res)=>{
            setNewPassword("")
            console.log(res.data)
            showAlert("success-change-password")
            setPassword("")
        }).catch((err)=>{
            console.log(err)
            showAlert("failed-change-password")
        })
    }

    const handleChangeEmail = async ()=>{
        await axiosInstance.put(`http://localhost:9090/api/users/update-email/${modalData.userId}`, {}, {params:{
                email:newEmail,
                role:"patient"
            }} ).then((res)=>{
            setNewEmail("")
            fetchPatients(page, rowsPerPage, searchText)
            console.log(res.data)
            showAlert("success-change-email")
            setEmail("")
        }).catch((err)=>{
            console.log(err)
            showAlert("failed-change-email")
        })

    }

    const isValidEmail = /\S+@\S+\.\S+/.test(email);
    const isValidName =/^[A-Za-z\s]+$/.test(name);
    const isValidPhone =/^\+?\d{9,12}$/.test(phone);
    const isValidAddress =/^[A-Za-z0-9\s,.\-#\/]+$/.test(address);
    const isValidPassword = /^(?=.*[@&$])[A-Za-z0-9@&$]{6,}$/.test(password);
    const isValidAge = /^(1[0-9]|[2-9][0-9])$/.test(age);
    const isValidForm = isValidEmail && isValidName && isValidPhone && isValidAddress && isValidPassword && isValidAge;

    return (
        <>




                <BootstrapDialog
                    onClose={handleCloseModal}
                    aria-labelledby="customized-dialog-title"
                    open={openModalProfileDetails}
                >
                    <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                        {modalData.name}

                        <IconButton aria-label="delete patient" sx={{
                            marginLeft:"10px",
                        }}>
                            <DeleteIcon color="error" onClick={()=>{
                                setDeleteModalOpen(true)
                            }} />
                        </IconButton>
                    </DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseModal}
                        sx={(theme) => ({
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: theme.palette.grey[500],
                        })}
                    >
                        <CloseIcon />
                    </IconButton>
                    <DialogContent dividers>
                        <Box>
                            <Box sx={{
                                display:"flex",
                                flexDirection:"column",
                                alignItems:"center",
                                width:"500px",
                                boxShadow:"rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
                                borderRadius:"10px"

                            }}>
                                {
                                    modalData.image? (
                                        <img style={{width:"100px", height:"100px", borderRadius:"50%"}} src={modalData.image} alt="profile"/>
                                    ):(

                                        <IconButton sx={{
                                            width:"160px",
                                            height:"160px",
                                            borderRadius:"50%"
                                        }}>
                                            <AccountCircleIcon sx={{
                                                width:"160px",
                                                height:"160px",
                                                borderRadius:"50%"
                                            }} />
                                        </IconButton>

                                    )}
                                <Typography variant="h6">
                                    {modalData.name}
                                </Typography>
                            </Box>
                            <Box sx={{display:"flex", alignItems:"center", justifyContent:"space-around"}}>
                                <Box sx={{display:"flex", gap:"10px", alignItems:"center", marginTop:"10px"}}>
                                    <i className="fa-solid fa-envelope"></i>
                                    <Typography>
                                        {modalData.email}
                                    </Typography>
                                </Box>
                                <Box sx={{display: "flex", gap: "10px", alignItems: "center", marginTop: "10px"}}>
                                    <i className="fa-solid fa-location-dot"></i>
                                    <Typography>
                                        {modalData.address}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "18px",
                                    padding: "20px",
                                    marginTop: "12px",
                                    width: "100%",
                                    boxShadow:
                                        "rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
                                    borderRadius: "16px",
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <i className="fa-solid fa-house" style={{ color: "#4caf50", fontSize: 20 }}></i>
                                    <Box>
                                        <Typography variant="caption" color="textSecondary">
                                            City
                                        </Typography>
                                        <Typography variant="body1">{modalData.address}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <i className="fa-solid fa-phone" style={{ color: "#2196f3", fontSize: 20 }}></i>
                                    <Box>
                                        <Typography variant="caption" color="textSecondary">
                                            Phone
                                        </Typography>
                                        <Typography variant="body1">{modalData.phone}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <i className="fa-solid fa-user-doctor" style={{ color: "#9c27b0", fontSize: 20 }}></i>
                                    <Box>
                                        <Typography variant="caption" color="textSecondary">
                                            Age
                                        </Typography>
                                        <Typography variant="body1">{modalData.age}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <i className="fa-solid fa-hospital" style={{ color: "#ff9800", fontSize: 20 }}></i>
                                    <Box>
                                        <Typography variant="caption" color="textSecondary">
                                            Gender
                                        </Typography>
                                        <Typography variant="body1">{modalData.gender}</Typography>
                                    </Box>
                                </Box>

                            </Box>
                            <Box>
                                <Box sx={{ mt: 1.5, width: "100%" }}>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                                        Change Password
                                    </Typography>
                                    <Box sx={{
                                        display: "flex",
                                        gap: 2, alignItems: "center",

                                        mb: 2
                                    }}>
                                        <TextField
                                            label="New Password"
                                            type={showModalPassword ? "text" : "password"}
                                            variant="filled"
                                            fullWidth
                                            sx={{ backgroundColor: "var(--bg-secondary)" }}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />

                                        <Button
                                            onClick={()=>{
                                                handleChangePassword()
                                            }}
                                            variant="contained"
                                            sx={{
                                                backgroundColor: "var(--color-green-dark)",
                                                color: "var(--color-cream)",
                                                fontWeight: "bold",
                                                minWidth: 120,
                                                width: "180px",
                                            }}
                                        >
                                            Update Password
                                        </Button>


                                    </Box>
                                    <FormControlLabel style={{marginTop:"-30px"}} control={
                                        <Checkbox
                                            checked={showModalPassword}
                                            onChange={e => setShowModalPassword(e.target.checked)}
                                        />
                                    }
                                                      label="show password"
                                                      sx={{color: "var(--text-primary)", marginTop: "10px"}}
                                    />

                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                                        Change Email
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                        <TextField
                                            label="New Email"
                                            type="email"
                                            variant="filled"
                                            fullWidth
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            sx={{ backgroundColor: "var(--bg-secondary)" }}
                                        />
                                        <Button
                                            onClick={()=>{
                                                handleChangeEmail(modalData.userId)
                                            }}
                                            variant="contained"
                                            sx={{
                                                backgroundColor: "var(--color-green-dark)",
                                                color: "var(--color-cream)",
                                                fontWeight: "bold",
                                                minWidth: 120,
                                                width: "180px",
                                            }}
                                        >
                                            Update Email
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>

                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button autoFocus onClick={handleCloseModal}>
                            Save changes
                        </Button>
                    </DialogActions>
                </BootstrapDialog>


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
                                            setOpenModal(false);
                                            handleCloseDeleteModal();
                                        });
                                    })


                                }} >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>





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
                                                                                setOpenModalProfileDetails(true)

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