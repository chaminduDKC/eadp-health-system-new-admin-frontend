import './doctor.css';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress, Collapse,
    FormControlLabel, IconButton,
    MenuItem,
    Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TablePagination, TableRow,
    TextField
} from "@mui/material";

import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));



import React, {useEffect, useState} from "react";
import axiosInstance from "../../../../util/axiosInstance.js";


import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon from "@mui/icons-material/Close";
import DialogContentText from "@mui/material/DialogContentText";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateCalendar, DatePicker, LocalizationProvider, TimePicker} from "@mui/x-date-pickers";


const columns = [
    { id: 'name', label: 'Name', minWidth: 100 },
    { id: 'phoneNumber', label: 'Phone', minWidth: 60 },
    // { id: 'email', label: 'Email', minWidth: 100 },
    { id: 'city', label: 'City', minWidth: 80 },
    { id: 'hospital', label: 'Hospital', minWidth: 100 },
    { id: 'specialization', label: 'Specialization', minWidth: 100 },
    { id: 'address', label: 'Address', minWidth: 100 },


];

const Doctor = ()=>{

    const [name, setName] = useState("");
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [specialization, setSpecialization] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [hospital, setHospital] = useState("")
    const [city, setCity] = useState("")
    const [experience, setExperience] = useState("");
    const [licenceNo, setLicenceNo] = useState("");

    const hospitals = [
        {
            value: "Matara",
            label: "Matara General Hospital"
        },
        {
            value: "Galle",
            label: "Galle General Hospital"
        },
        {
            value: "Pasgoda",
            label: "Pasgoda Hospital"
        },
        {
            value: "Deniyaya",
            label: "Deniyaya Hospital"
        }

    ]
    const cities = [
        {
            value: "Matara",
            city: "Matara",
        },
        {
            value: "Galle",
            city: "Galle",
        },
        {
            value: "Pasgoda",
            city: "Pasgoda",
        },
        {
            value: "Deniyaya",
            city: "Deniyaya",
        },
    ]
    const experiences = [
        {
            value: "1",
        },
        {
            value: "2"
        },
        {
            value: "3",
        },
        {
            value: "4",
        },
        {
            value: "5",
        },
        {
            value: "5+",
        },
    ]
    const [doctors, setDoctors] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [update, setUpdate] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editDoctorId, setEditDoctorId] = useState(null);
    const [doctorCount, setDoctorCount] = useState(0);

    const [open, setOpen] = useState(true);

    const [alertStatus, setAlertStatus] = useState("");

    const [openModal, setOpenModal] = useState(false);

    const [modalData, setModalData] = useState({})


    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);


    const [selectedDate, setSelectedDate] = useState(null);



    const handleClickOpenModal = (row) => {
        setOpenModal(true);
        console.log(row)
        setModalData(row)
    };
    const handleCloseModal = () => {
        setOpenModal(false);
    };


    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleCloseDeleteModal = ()=>{
        setDeleteModalOpen(false);
    }

    const handleSubmit = async (e) => {
        setAlertStatus("");
        if(!name ||  !address || !phone || !specialization  || !hospital || !city || !experience || !licenceNo) {
            setOpen(true)
            setAlertStatus("empty-fields")
            return;
        }
        e.preventDefault();
        setLoading(true)
        setAlertStatus("");

        if(isEditMode){

            e.preventDefault();
            console.log("Update mode is on")
            const doctorRequest = {
                email: email,
                name:name,
                password:password,
                address:address,
                phone:phone,
                hospital:hospital,
                city:city,
                experience:experience,
                specialization:specialization,
                licenceNo:licenceNo
            }
            console.log(doctorRequest)
            try {
                await axiosInstance.put(
                    `http://localhost:9091/api/doctors/update-doctor/${editDoctorId}`,
                    doctorRequest,
                    {

                    }
                )
                setOpen(true)
                setAlertStatus("success-update")
                setIsEditMode(false)
                setLoading(false)
                clearAllFields();
                 await fetchDoctors();
            } catch (e) {
                setOpen(true)
                setAlertStatus("failed-update")
                console.log("Failed to update with error "+ e)
            }


        } else {
            if(!name ||  !address || !phone || !specialization  || !hospital || !city || !experience || !licenceNo || !email || !password){
                setOpen(true)
                setAlertStatus("empty-fields")
                return;
            }

            setUpdate(false)

            try {
                // Step 1: Prepare user data for user-service
                const userRequest = {
                    email: email,
                    name:name,
                    password: password,
                };

                // Step 2: Send request to user-service

                const userResponse = await axiosInstance.post(
                    "http://localhost:9090/api/users/register-doctor",
                    userRequest,
                    {

                    }
                );

                const userId = userResponse.data.data.userId;
                const userName = userResponse.data.data.name;

                // Step 3: Prepare doctor data for doctor-service
                const doctorRequest = {
                    userId: userId,
                    name: userName,
                    email: email,
                    phoneNumber: phone,
                    specialization: specialization,
                    experience: experience,
                    hospital: hospital,
                    address: address,
                    licenseNo: licenceNo,
                    city: city
                };
                // Step 4: Send request to doctor-service
                await axiosInstance.post(
                    "http://localhost:9091/api/doctors/create-doctor",
                    doctorRequest,
                    {
                    }
                );
                setOpen(true)
                setAlertStatus("success-create")
                await fetchDoctors();
                clearAllFields();

            } catch (error) {
                setLoading(false)
                console.error("Error creating doctor:", error);
                setOpen(true)
                setAlertStatus("failed-create")
            }
        }

    };
    const countAll = async () => {
        try {
            const response = await axiosInstance.get("http://localhost:9091/api/doctors/count-all", {
            })

            setDoctorCount(response.data.data);
            console.log(response.data.data);
        } catch (e) {
            console.log(" E " + e)
        }

    }

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };


    const [searchText, setSearchText] = useState("")

    const fetchDoctors = async (pageNumber = page, size = rowsPerPage, search = searchText) => {
        setAlertStatus("");
        setLoading(false);
        setError(null);
        setUpdate(false);
        await countAll();

        try {
            const response = await axiosInstance.get('/doctors/find-all-doctors', {
                baseURL: 'http://localhost:9091/api', // baseURL dynamically set here
                params: {
                    searchText: search,
                    page: pageNumber,
                    size: size
                }
            });

            setDoctors(response.data.data.dataList);
            console.log(response.data.data.dataList);

        } catch (err) {
            console.log("Error is " + err);
            setError(err.message || 'Something went wrong');
            setOpen(true);
            setAlertStatus("failed-fetch");

        } finally {
            setLoading(false);
        }
    };


    const deleteDoctor = async (doctorId, userId)=>{

        setUpdate(false)
        try{
            const response = await axiosInstance.delete(
                `http://localhost:9091/api/doctors/delete-doctor/${doctorId}`,
                {
                    params:{
                        userId:userId
                    }
                }
            )

            setOpen(true)
            setAlertStatus("success-delete")
            console.log(response)
        } catch (e){
            setOpen(true)
            setAlertStatus("failed-delete")
            console.log(e)
        }
    }

    const setData = (doc)=>{
        clearAllFields();
        setName(doc.name)
        setSpecialization(doc.specialization)
        setLicenceNo(doc.licenceNo)
        setEmail(doc.email)
        setAddress(doc.address)
        setPhone(doc.phoneNumber)
        setExperience(doc.experience)
        setCity(doc.city)
        setHospital(doc.hospital)
    }
    const editDoctor =(doc)=>{
        setIsEditMode(true);
        setEditDoctorId(doc.doctorId)
        console.log(doc.doctorId);
        clearAllFields();
        setData(doc);
    }


    const clearAllFields = ()=>{
        setUpdate(false)
        setCity("Select City")
        setHospital("Select Hospital")
        setEmail("")
        setName("")
        setLicenceNo("")
        setAddress("")
        setExperience("Select Experience")
        setPassword("")
        setPhone("")
        setSpecialization("")
        setShowPassword(false)
    }

    useEffect(() => {
        fetchDoctors()
    }, []);

    const handleAvailableTimes = async (doctorId)=>{
        const formattedDate = selectedDate.format("YYYY-MM-DD");
        const startTimeHours = startTime.$H;
        const startTimeMins = startTime.$m;


        const formattedStartHours = startTimeHours < 10 ? '0' + startTimeHours : startTimeHours;
        const formattedStartMinutes = startTimeMins < 10 ? '0' + startTimeMins : startTimeMins;

        const timeStringStart = `${formattedStartHours}:${formattedStartMinutes}`;


        const endTimeHours = endTime.$H;
        const endTimeMins = endTime.$m;


        const formattedEndHours = endTimeHours < 10 ? '0' + endTimeHours : endTimeHours;
        const formattedEndMinutes = endTimeMins < 10 ? '0' + endTimeMins : endTimeMins;

        const timeStringEnd = `${formattedEndHours}:${formattedEndMinutes}`;

        console.log(formattedDate)
        console.log(doctorId)
        console.log(timeStringStart)
        console.log(timeStringEnd)

        try {
            const requestBody = {
                doctorId:doctorId,
                date:formattedDate,
                startTime:timeStringStart,
                endTime:timeStringEnd
            }
            const response = await axiosInstance.post("http://localhost:9093/api/availabilities/save-availabilities", requestBody).then(
                response =>{
                    console.log(response)
                }
            ).catch(()=>{
                console.log("Failed Request")
            })
            console.log(response);
        } catch (e) {
            console.log(e)
        }


    }

    const rows = doctors.map((doc) => ({
        name: doc.name,
        email: doc.email,
        phoneNumber: doc.phoneNumber,
        specialization: doc.specialization,
        experience: doc.experience,
        hospital: doc.hospital,
        address: doc.address,
        licenceNo: doc.licenceNo,
        city: doc.city,
        doctorId: doc.doctorId,
        userId: doc.userId
    }));


    return (
        <>
            <BootstrapDialog
                sx={{

                }}
                onClose={handleCloseModal}
                aria-labelledby="customized-dialog-title"
                open={openModal}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">

                    {modalData.name}
                    <IconButton>
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
                    <Typography gutterBottom>
                        Select available time period for this doctor
                    </Typography>
                    <Box width="500px">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateCalendar value={selectedDate} onChange={(newValue) => setSelectedDate(newValue)} />

                        <Box sx={{
                            display:"flex",
                            gap:"20px"
                        }}>
                        <TimePicker
                            label="Start time"
                            value={startTime}
                            onChange={(newValue) => setStartTime(newValue)}
                        />


                        <TimePicker
                            label="End time"
                            value={endTime}
                            onChange={(newValue) => setEndTime(newValue)}
                        />
                       </Box>
                    </LocalizationProvider>


                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        disabled={startTime == null || endTime == null || selectedDate == null}
                        sx={{
                        backgroundColor:"var(--color-green-dark)",
                        color:"var(--color-cream)"
                    }} autoFocus onClick={()=>{
                        handleAvailableTimes(modalData.doctorId).then(()=>{
                            handleCloseModal();
                        })
                    }}>
                        Save info
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
                            If you delete, all doctor related data will be delete
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
                                    deleteDoctor(modalData.doctorId, modalData.userId).then(()=>{
                                        fetchDoctors();
                                    })
                                    setOpenModal(false);
                                    handleCloseDeleteModal();

                                }} >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>

            {
                alertStatus !== "" && (
                    <Box sx={{
                        width: "100%",
                        position: "fixed",
                        top: "6vh",
                        zIndex: 1000,
                        transform: "translateX(-50%)"
                    }}>
                        <Collapse in={open}>
                            <Alert
                                severity={alertStatus.includes("success") ? "success" : "error"}
                                action={
                                    <IconButton
                                        aria-label="close"
                                        color="inherit"
                                        onClick={() => {
                                            setAlertStatus("");
                                            setOpen(false);
                                        }}
                                    >
                                        <CloseIcon/>
                                    </IconButton>
                                }
                            >
                                {alertStatus === "success-create" && "Doctor created successfully!"}
                                {alertStatus === "success-update" && "Doctor updated successfully!"}
                                {alertStatus === "success-delete" && "Doctor deleted successfully!"}
                                {alertStatus === "success-fetch" && "Doctors fetched successfully!"}
                                {alertStatus === "failed-create" && "Failed to create doctor. Please try again."}
                                {alertStatus === "failed-update" && "Failed to update doctor. Please try again"}
                                {alertStatus === "failed-delete" && "Failed to delete doctor. Please try again."}
                                {alertStatus === "failed-fetch" && "Failed to fetch doctors. Please try again."}
                                {alertStatus === "empty-fields" && "Please fill all the fields."}
                            </Alert>
                        </Collapse>
                    </Box>
                )
            }
        <div className="doctor">
            <div className="form-section">
                <form onSubmit={handleSubmit}>
                    <TextField
                        sx={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            input: {color: 'var(--text-primary)'},
                            label: {color: 'var(--text-secondary)'}
                        }}
                        label="Name"
                        variant="filled"
                        margin="normal"
                        fullWidth
                        required
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <TextField
                        sx={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            input: {color: 'var(--text-primary)'},
                            label: {color: 'var(--text-secondary)'}
                        }}
                        label="Email"
                        variant="filled"
                        margin="normal"
                        fullWidth
                        disabled={isEditMode}
                        required
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <TextField
                        sx={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            input: {color: 'var(--text-primary)'},
                            label: {color: 'var(--text-secondary)'}
                        }}
                        label="Password"
                        variant="filled"
                        margin="normal"
                        disabled={isEditMode}
                        fullWidth
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <FormControlLabel control={
                        <Checkbox
                            checked={showPassword}
                            onChange={e => setShowPassword(e.target.checked)}
                        />
                    }
                                      label="show password"
                                      sx={{color: "var(--text-primary)", marginTop: "10px"}}
                    />
                    <Box sx={{display: "flex", width: "100%", justifyContent: "space-between", gap: "10px"}}>
                        <TextField
                            sx={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                input: {color: 'var(--text-primary)'},
                                label: {color: 'var(--text-secondary)'}
                            }}
                            label="Phone"
                            variant="filled"
                            margin="normal"
                            fullWidth
                            required
                            type="text"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                        />
                        <TextField
                            sx={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                input: {color: 'var(--text-primary)'},
                                label: {color: 'var(--text-secondary)'}
                            }}
                            label="Licence No"
                            variant="filled"
                            margin="normal"
                            fullWidth
                            required
                            type="text"
                            value={licenceNo}
                            onChange={e => setLicenceNo(e.target.value)}
                        />
                        <TextField
                            sx={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                input: {color: 'var(--text-primary)'},
                                label: {color: 'var(--text-secondary)'}
                            }}
                            fullWidth
                            label="Specialization"
                            variant="filled"
                            margin="normal"
                            required
                            type="text"
                            value={specialization}
                            onChange={e => setSpecialization(e.target.value)}
                        />
                    </Box>
                    <TextField
                        sx={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            input: {color: 'var(--text-primary)'},
                            label: {color: 'var(--text-secondary)'}
                        }}
                        label="Address"
                        variant="filled"
                        margin="normal"
                        fullWidth
                        required
                        type="text"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                    />
                    <Box sx={{
                        display: "flex",
                        width: "100%",
                        justifyContent: "space-between",
                        gap: "10px",
                        marginTop: "20px"
                    }}>
                        <TextField
                            sx={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                input: {color: 'var(--text-primary)'},
                                label: {color: 'var(--text-secondary)'}
                            }}
                            id="outlined-select-hospital"
                            select
                            label="Select Hospital"
                            variant="filled"
                            fullWidth
                            value={hospital}
                            onChange={e => setHospital(e.target.value)}
                            helperText="Please select hospital"
                        >
                            {hospitals.map((option) => (
                                <MenuItem key={option.value} value={option.value} sx={{
                                    color: 'var(--text-primary)',
                                    backgroundColor: 'var(--bg-secondary)'
                                }}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            sx={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                input: {color: 'var(--text-primary)'},
                                label: {color: 'var(--text-secondary)'}
                            }}
                            id="outlined-select-city"
                            select
                            variant="filled"
                            fullWidth
                            label="Select City"
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            helperText="Please select city"
                        >
                            {cities.map((option) => (
                                <MenuItem key={option.value} value={option.value} sx={{
                                    color: 'var(--text-primary)',
                                    backgroundColor: 'var(--bg-secondary)'
                                }}>
                                    {option.city}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            sx={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                input: {color: 'var(--text-primary)'},
                                label: {color: 'var(--text-secondary)'}
                            }}
                            id="outlined-select-experience"
                            select
                            variant="filled"
                            fullWidth
                            label="Select Experience"
                            value={experience}
                            onChange={e => setExperience(e.target.value)}
                            helperText="Please select experience in years"
                        >
                            {experiences.map((option) => (
                                <MenuItem key={option.value} value={option.value} sx={{
                                    color: 'var(--text-primary)',
                                    backgroundColor: 'var(--bg-secondary)'
                                }}>
                                    {option.value}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                    <Box mt={2} gap={2} display="flex" alignItems="center">
                        <Button type="submit" onClick={(e) => handleSubmit(e)} variant="contained"
                                disabled={loading}
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
                                : isEditMode ? "Update User" : "Save User"}
                        </Button>

                            <Button
                                sx={{
                                    color:"var(--color-green-dark)",

                                    fontWeight:"bold"
                                }}

                                onClick={() => {
                                    setUpdate(false)
                                    setIsEditMode(false)
                                    setLoading(false)
                                    clearAllFields();
                                }}>Cancel</Button>

                    </Box>

                </form>
            </div>
            <div className="doctor-table">
                <TextField
                    sx={{
                        marginBottom:"20px"
                    }}
                    value={searchText}
                    fullWidth
                    id="filled-search"
                    label="Search by name or specialization or email"
                    type="search"
                    variant="filled"
                    onChange={(e)=>{
                        const value = e.target.value;
                        setSearchText(value)
                        console.log("search text is "+value)
                        fetchDoctors(page, rowsPerPage, value).then(()=>{

                        })

                    }}
                >
                </TextField>
                <hr />

                <Paper sx={{width: '100%', overflow: 'hidden'}}>
                    <TableContainer sx={{maxHeight: 575}}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell
                                            sx={{
                                                fontWeight:"bold"
                                            }}
                                            key={column.id}
                                            align={column.align}
                                            style={{minWidth: column.minWidth}}
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => {

                                        return (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={row.code} >

                                                {columns.map((column) => {
                                                    const value = row[column.id];
                                                    return (
                                                        <TableCell key={column.id} align={column.align}>
                                                            {value}
                                                            {column.id === "name" ?
                                                                <>
                                                            <IconButton>
                                                                <EditIcon onClick={()=>{
                                                                    editDoctor(row);
                                                                }}

                                                                />

                                                            </IconButton>
                                                                <IconButton>
                                                                    <CalendarMonthIcon onClick={()=>{
                                                                        handleClickOpenModal(row)
                                                                    }} />
                                                                </IconButton>
                                                                </>
                                                                : ""

                                                            }


                                                        </TableCell>
                                                    );
                                                })}
                                                <Box sx={{
                                                    marginTop:"6px"
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
                        count={rows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </div>
        </div>
            </>
    );
}
export default Doctor;