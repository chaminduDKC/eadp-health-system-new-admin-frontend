import './doctor.css';
import AlertHook from '../../../../util/Alert.js'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {
    Alert, Autocomplete,
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
import SettingsIcon from '@mui/icons-material/Settings';

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
import MailIcon from '@mui/icons-material/Mail';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon from "@mui/icons-material/Close";
import DialogContentText from "@mui/material/DialogContentText";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateCalendar, DatePicker, LocalizationProvider, TimePicker} from "@mui/x-date-pickers";
import PropTypes from "prop-types";


const columns = [
    { id: 'name', label: 'Name', minWidth: 100 },
    //{ id: 'phoneNumber', label: 'Phone', minWidth: 60 },
    // { id: 'email', label: 'Email', minWidth: 100 },
    { id: 'city', label: 'City', minWidth: 80 },
    { id: 'hospital', label: 'Hospital', minWidth: 100 },
    { id: 'specialization', label: 'Specialization', minWidth: 100 },
   // { id: 'address', label: 'Address', minWidth: 100 },


];


function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


const Doctor = ()=>{

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };


    const {open, alertStatus, showAlert, closeAlert} = AlertHook();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("")
    const [newEmail, setNewEmail] = useState("")
    const [password, setPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [specialization, setSpecialization] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showModalPassword, setShowModalPassword] = useState(false)
    const [hospital, setHospital] = useState("")
    const [city, setCity] = useState("")
    const [experience, setExperience] = useState("");
    const [licenceNo, setLicenceNo] = useState("");

    const hospitals = [
        {
            value: "General Hospital - Matara",
            label: "General Hospital = Matara"
        },
        {
            value: "Asiri Hospital - Matara",
            label: "Asiri Hospital - Matara"
        },
        {
            value: "Labeema Hospital - Kotawila",
            label: "Labeema Hospital - Kotawila"
        },
        {
            value: "Karapitiya Teaching Hospital - Galle",
            label: "Karapitiya Teaching Hospital - Galle"
        },
        {
            value: "Ruhunu Hospital - Galle",
            label: "Ruhunu Hospital - Galle"
        }

    ]
    const cities = ["Matara", "Galle"];
    const [doctors, setDoctors] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [update, setUpdate] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editDoctorId, setEditDoctorId] = useState(null);
    const [doctorCount, setDoctorCount] = useState(0);


    const [openModal, setOpenModal] = useState(false);

    const [modalData, setModalData] = useState({})

    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    const [isAlertOpen, setIsAlertOpen] = useState(false);

    // to add new hospital
    const [openAddHospitalModal, setOpenAddHospitalModal] = useState(false);
    const [hospitalName, setHospitalName] = useState("");

    const saveHospital = async ()=>{
    await axiosInstance.post("http://localhost:9091/api/hospitals/save-hospital", {hospitalName:hospitalName}).then((res)=>{
            console.log(res.data)
            setOpenAddHospitalModal(false)
            showAlert("success-add-h")
            setHospitalName("")
        }).catch((err)=>{
            console.log(err)
            showAlert("failed-add-h")
        })
    }

    // to add specialization

    const [openSpecializationModal, setOpenAddSpecializationModal] = useState(false)
    const [specializationName, setSpecializationName] = useState("")
    const [specializations, setSpecializations] = useState([])
    const [specName, setSpecName] = useState("")
    // const [specId, setSpecId] = useState("")

    const saveSpecialization = async ()=>{
        await axiosInstance.post("http://localhost:9091/api/specializations/create-specialization", {specialization:specializationName}).then((res)=>{
            console.log(res.data)
            setOpenAddSpecializationModal(false)
            showAlert("success-add-s")
            setSpecializationName("")
        }).catch((err)=>{
            console.log(err)
            showAlert("failed-add-s")
        })
    }




    const handleCloseModal = () => {
        setOpenModal(false);
        setOpenAddHospitalModal(false);
        setOpenAddSpecializationModal(false);
        setOpenModalProfileDetails(false);
    };


    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [openModalProfileDetails, setOpenModalProfileDetails] = useState(false);

    const handleCloseDeleteModal = ()=>{
        setDeleteModalOpen(false);
    }

    const handleSubmit = async (e) => {

        if(!name ||  !address || !phone || !specialization  || !hospital || !city || !experience || !licenceNo) {
            showAlert("empty-fields")
            return;
        }



        e.preventDefault();
        setLoading(true)

        if(isEditMode){

            e.preventDefault();
            console.log("Update mode is on")
            const doctorRequest = {
                name:name,
                address:address,
                phone:phone,
                hospital:hospital,
                city:city,
                experience:experience,
                specialization:specName,
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


                showAlert("success-update")

            } catch (e) {
                showAlert("failed-update")
                console.log("Failed to update with error "+ e)
            }


        } else {
            if(!name ||  !address || !phone || !specialization  || !hospital || !city || !experience || !licenceNo || !email || !password){
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

                console.log(userRequest)
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
                    specialization: specName,
                    experience: experience,
                    hospital: hospital.value,
                    address: address,
                    licenseNo: licenceNo,
                    city: city
                };
                console.log(doctorRequest)
                // Step 4: Send request to doctor-service
                await axiosInstance.post(
                    "http://localhost:9091/api/doctors/create-doctor",
                    doctorRequest,
                    {
                    }
                );
                console.log("Created")
                showAlert("success-create")
                await fetchDoctors();
                clearAllFields();

            } catch (error) {
                showAlert("failed-create")
                setLoading(false)
                console.error("Error creating doctor:", error);

            }
        }

    };

    const isValidEmail = /\S+@\S+\.\S+/.test(email);
    const isValidName =/^[A-Za-z\s]+$/.test(name);
    const isValidPhone =/^\+?\d{9,12}$/.test(phone);
    const isValidLicenceNo =/^[A-Za-z0-9\-\/]+$/.test(licenceNo);
    const isValidAddress =/^[A-Za-z0-9\s,.\-#\/]+$/.test(address);
    const isValidPassword = /^(?=.*[@&$])[A-Za-z0-9@&$]{6,}$/.test(password);
    const isValidExperience =/^[0-9]{1,2}$/.test(experience);
    // const isValidForm = isValidEmail && isValidPassword && isValidName && isValidPhone && isValidLicenceNo && isValidAddress && isValidExperience;


    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchText, setSearchText] = useState("")

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        fetchDoctors(newPage, rowsPerPage, searchText);
    };

    const handleChangeRowsPerPage = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
        fetchDoctors(0, newSize, searchText);

    };




    const fetchDoctors = async (pageNumber = page, size = rowsPerPage, search = searchText) => {

        setLoading(false);
        setError(null);
        setUpdate(false);


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
            setDoctorCount(response.data.data.dataCount)


        } catch (err) {
            showAlert("failed-fetch")
            console.log("Error is " + err);
            setError(err.message || 'Something went wrong');


        } finally {
            setLoading(false);
        }
    };


    const deleteDoctor = async (doctorId, userId)=>{
        console.log(doctorId, userId)

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


            showAlert("success-delete")
            console.log(response)
        } catch (e){
            showAlert("failed-delete")
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
        console.log(doc)
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
        fetchDoctors(page, rowsPerPage, searchText)
        fetchSpecializations();
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
                    showAlert("success-set-date")
                    console.log(response)
                }
            ).catch(()=>{
                showAlert("failed-set-date")
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
    const [alreadySelectedDates, setAlreadySelectedDates] = useState([]);

    const fetchAlreadySelectedDates = async (doctorId)=>{
    await axiosInstance.get(`http://localhost:9093/api/availabilities/find-selected-dates-by-doctor-id/${doctorId}`).then(res=>{

        setAlreadySelectedDates(res.data.data)
        console.log(res.data.data);
    })

}

    const fetchSpecializations = async ()=>{
        try {
            const response = await axiosInstance.get("http://localhost:9091/api/specializations/find-all-specializations",{params: {searchText:""}}
            );
            setSpecializations(response.data.data);
            console.log(response.data.data);
        } catch (error) {
            console.error("Error fetching specializations:", error);
        }
    }

    const handleChangePassword = async ()=>{
        console.log(modalData.name)
        console.log(modalData.userId)
        await axiosInstance.put(`http://localhost:9090/api/users/update-password/${modalData.userId}`, {}, {params:{
                password:newPassword,
                role:"doctor"
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
                 role:"doctor"
            }} ).then((res)=>{
                setNewEmail("")
             fetchDoctors(page, rowsPerPage, searchText)
                console.log(res.data)
                showAlert("success-change-email")
                setEmail("")
            }).catch((err)=>{
                console.log(err)
                showAlert("failed-change-email")
            })

    }
    return (
        <>
            { isAlertOpen && (
                <Box sx={{ width: '50%', margin:"0 auto", position:"absolute", top:"65px", right:"0", left:"0", zIndex:"14" }}>
                    <Collapse in={open}>
                        <Alert
                            severity="error"
                            action={
                                <IconButton
                                    aria-label="close"
                                    color="inherit"
                                    onClick={() => {
                                        setIsAlertOpen(false);
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
            )}


            {/*for profile details modal*/}

            <BootstrapDialog
                sx={{
                    height:"730px",
                    minHeight:"730px"
                }}
                onClose={handleCloseModal}
                aria-labelledby="customized-dialog-title"
                open={openModalProfileDetails}
            >
                <DialogTitle sx={{ m: 0, p: 1 }} id="customized-dialog-title">

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

                    <Box sx={{ width: '500px' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                <Tab label="Calendar" {...a11yProps(0)} />
                                <Tab label="Profile" {...a11yProps(1)} />
                                <Tab label="Security" {...a11yProps(2)} />
                            </Tabs>
                        </Box>
                        <CustomTabPanel value={value} index={0}>
                            {/*Calendar*/}
                            <Box width="450px" sx={{
                                display:"flex",
                                flexDirection:"column",
                                alignItems:"center",
                                width:"100%",
                                boxShadow:"rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
                                borderRadius:"10px",
                                marginTop:"12px"
                            }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateCalendar  shouldDisableDate={(date) =>
                                        alreadySelectedDates.includes(date.format('YYYY-MM-DD'))
                                    } value={selectedDate} onChange={(newValue) => setSelectedDate(newValue)} />

                                    <Box sx={{
                                        width:"95%",
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

                            <Box width="100%" display="flex" justifyContent="flex-end">
                                <Button
                                    disabled={startTime == null || endTime == null || selectedDate == null}
                                    sx={{
                                        backgroundColor:"var(--color-green-dark)",
                                        color:"var(--color-cream)",
                                        marginTop:"10px",
                                        paddingX:"20px",
                                        marginBottom:"10px",
                                        marginRight:"10px"
                                    }} autoFocus onClick={()=>{
                                    handleAvailableTimes(modalData.doctorId).then(()=>{
                                        // handleCloseModal();
                                    })
                                }}>
                                    Save
                                </Button>
                            </Box>
                            </Box>
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={1}>
                           <Box>
                               <Box sx={{
                                   display:"flex",
                                   flexDirection:"column",
                                   alignItems:"center",
                                   width:"100%",
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
                                           <Typography variant="body1">{modalData.city}</Typography>
                                       </Box>
                                   </Box>
                                   <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                       <i className="fa-solid fa-phone" style={{ color: "#2196f3", fontSize: 20 }}></i>
                                       <Box>
                                           <Typography variant="caption" color="textSecondary">
                                               Phone
                                           </Typography>
                                           <Typography variant="body1">{modalData.phoneNumber}</Typography>
                                       </Box>
                                   </Box>
                                   <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                       <i className="fa-solid fa-user-doctor" style={{ color: "#9c27b0", fontSize: 20 }}></i>
                                       <Box>
                                           <Typography variant="caption" color="textSecondary">
                                               Specialization
                                           </Typography>
                                           <Typography variant="body1">{modalData.specialization}</Typography>
                                       </Box>
                                   </Box>
                                   <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                       <i className="fa-solid fa-hospital" style={{ color: "#ff9800", fontSize: 20 }}></i>
                                       <Box>
                                           <Typography variant="caption" color="textSecondary">
                                               Hospital
                                           </Typography>
                                           <Typography variant="body1">{modalData.hospital}</Typography>
                                       </Box>
                                   </Box>
                                   <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                       <i className="fa-solid fa-id-card" style={{ color: "#607d8b", fontSize: 20 }}></i>
                                       <Box>
                                           <Typography variant="caption" color="textSecondary">
                                               Licence No
                                           </Typography>
                                           <Typography variant="body1">{modalData.licenceNo}</Typography>
                                       </Box>
                                   </Box>
                               </Box>

                           </Box>
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={2}>
                            <Box>
                                <Box sx={{
                                    display:"flex",
                                    flexDirection:"column",
                                    alignItems:"center",
                                    width:"100%",
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
                        </CustomTabPanel>
                    </Box>
                </DialogContent>
                <DialogActions>

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
                                        handleCloseDeleteModal();
                                        setOpenModal(false);
                                        setOpenModalProfileDetails(false)
                                        fetchDoctors(page, rowsPerPage, searchText);
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
                                {alertStatus === "success-create" && "Doctor created successfully!"}
                                {alertStatus === "success-update" && "Doctor updated successfully!"}
                                {alertStatus === "success-delete" && "Doctor deleted successfully!"}
                                {alertStatus === "success-fetch" && "Doctors fetched successfully!"}
                                {alertStatus === "failed-create" && "Failed to create doctor. Please try again."}
                                {alertStatus === "failed-update" && "Failed to update doctor. Please try again."}
                                {alertStatus === "failed-delete" && "Failed to delete doctor. Please try again."}
                                {alertStatus === "failed-fetch" && "Failed to fetch doctors. Please try again."}
                                {alertStatus === "empty-fields" && "Please fill all the fields."}
                                {alertStatus === "success-set-date" && "Date and time selected successfully"}
                                {alertStatus === "failed-set-date" && "Failed to select date and time"}
                                {alertStatus === "success-add-h" && "Hospital added successfully"}
                                {alertStatus === "success-add-s" && "Specialization added successfully"}
                                {alertStatus === "failed-add-h" && "Failed to add hospital"}
                                {alertStatus === "failed-add-s" && "Failed to add specialization"}
                                {alertStatus === "failed-name" && "Invalid name"}
                                {alertStatus === "failed-email" && "Invalid email"}
                                {alertStatus === "failed-password" && "Invalid password"}
                                {alertStatus === "failed-phone" && "Invalid phone number"}
                                {alertStatus === "success-change-password" && "Password changed successfully"}
                                {alertStatus === "failed-change-password" && "Failed to change the password"}
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
                        helperText={!isValidPassword ? "Password must contain at least one of @, &, or $ and be at least 6 characters long" :""}
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
                    <Box sx={{display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", gap: "10px"}}>
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
                        <Autocomplete
                            sx={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                input: { color: 'var(--text-primary)' },
                                label: { color: 'var(--text-secondary)' },
                                marginTop: "10px"
                            }}
                            value={specializations.find(p => p.specialization === specName) || null}
                            onChange={(event, newValue) => {
                                if (newValue) {
                                    setSpecialization(newValue);     // full object
                                    // patient ID
                                    setSpecName(newValue.specialization); // just the name string

                                } else {
                                    // setDoctor(null);
                                    // setDocId(null);
                                    // setDocName("");
                                }
                            }}
                            options={specializations}
                            getOptionLabel={(option) => option.specialization || ""}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            fullWidth
                            renderInput={(params) => <TextField {...params} label="Specializations" />}
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
                        <Autocomplete
                            sx={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                input: {color: 'var(--text-primary)'},
                                label: {color: 'var(--text-secondary)'},

                            }}
                            value={hospital}
                            onChange={(event, newValue) => setHospital(newValue)}
                            options={hospitals}
                            fullWidth
                            renderInput={(params) => <TextField {...params} label="Hospital" />}
                        />

                        <Autocomplete
                            sx={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                input: {color: 'var(--text-primary)'},
                                label: {color: 'var(--text-secondary)'},
                            }}
                            value={city}
                            onChange={(event, newValue) => setCity(newValue)}
                            options={cities}
                            fullWidth
                            renderInput={(params) => <TextField {...params} label="City" />}
                        />

                        <TextField
                            sx={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                input: {color: 'var(--text-primary)'},
                                label: {color: 'var(--text-secondary)'}
                            }}
                            id="outlined-select-experience"
                            variant="filled"
                            fullWidth
                            label="Experience in years"
                            type="number"
                            value={experience}
                            onChange={e => setExperience(e.target.value)}
                        >

                        </TextField>
                    </Box>
                    <Box mt={2} gap={2} display="flex" alignItems="center">
                        <Button type="submit" onClick={(e) => {
                            handleSubmit(e).then(()=>{
                                if(isEditMode){
                                    console.log("Updated huto")
                                    setIsEditMode(false)
                                    setLoading(false)
                                    clearAllFields();
                                    fetchDoctors();
                                }
                            })
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
                    <TableContainer sx={{maxHeight: 550}}>
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
                                    .map((row) => {

                                        return (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={row.code} >

                                                {columns.map((column) => {
                                                    const value = row[column.id];
                                                    return (
                                                        <TableCell key={column.id} align={column.align}>
                                                            {column.id === "name" &&
                                                                <>
                                                                    <IconButton>
                                                                        <EditIcon onClick={()=>{
                                                                            editDoctor(row);
                                                                        }}

                                                                        />

                                                                    </IconButton>
                                                                    <IconButton>
                                                                        <SettingsIcon
                                                                            sx={{
                                                                                color:"var(--color-green-forest)",
                                                                            }}
                                                                            onClick={()=>{

                                                                            fetchAlreadySelectedDates(row.doctorId).then(()=>{
                                                                                setOpenModalProfileDetails(true)
                                                                                setModalData(row)
                                                                                console.log(row)
                                                                            })

                                                                        }} />
                                                                    </IconButton>
                                                                </>


                                                            }
                                                            {value}



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
                        count={doctorCount}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </div>

            <BootstrapDialog
                sx={{

                }}
                onClose={handleCloseModal}
                aria-labelledby="customized-dialog-title"
                open={openSpecializationModal}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    {/*title go here*/}
                    <IconButton>

                    </IconButton>
                </DialogTitle>

                <IconButton
                    aria-label="close"
                    onClick={()=>{
                        console.log("close modal")
                        handleCloseModal()
                    }}
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

                    </Typography>
                    <Box width="500px">

                        <form>
                            <TextField
                                id="specialization"
                                label="Specialization"
                                type="text"
                                fullWidth
                                value={specializationName}
                                onChange={(e)=>{
                                    setSpecializationName(e.target.value)
                                }}

                            />
                        </form>

                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        sx={{
                            backgroundColor:"var(--color-green-dark)",
                            color:"var(--color-cream)"
                        }} autoFocus onClick={()=>{
                        saveSpecialization();
                    }}>
                        Save
                    </Button>
                </DialogActions>
            </BootstrapDialog>

        </div>
            <BootstrapDialog
            sx={{

            }}
            onClose={handleCloseModal}
            aria-labelledby="customized-dialog-title"
            open={openAddHospitalModal}
        >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                {/*title go here*/}
                <IconButton>

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

                </Typography>
                <Box width="500px">

                    <form>
                        <TextField
                            id="hospital"
                            label="Hospital Name"
                            type="text"
                            fullWidth
                            value={hospitalName}
                            onChange={(e)=>{
                                setHospitalName(e.target.value)
                            }}

                        />
                    </form>

                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    sx={{
                        backgroundColor:"var(--color-green-dark)",
                        color:"var(--color-cream)"
                    }} autoFocus onClick={()=>{
                    saveHospital();
                }}>
                    Save
                </Button>
            </DialogActions>
        </BootstrapDialog>



            <Box sx={{
                marginTop:"20px",
                marginLeft:"30px",
                width:"100%",
                display:"flex",
                justifyContent:"flex-start",
                gap:"20px"
            }}>

                <Button sx={{
                    backgroundColor:"var(--color-green-forest)",
                    color:"var(--color-cream)",
                    fontWeight:"bold"
                }} variant="contained" onClick={()=>{
                    setOpenAddHospitalModal(true);
                }} >
                    + Add Hospital
                </Button>

                <Button sx={{
                    backgroundColor:"var(--color-green-forest)",
                    color:"var(--color-cream)",
                    fontWeight:"bold"
                }} variant="contained" onClick={()=>{
                    setOpenAddSpecializationModal(true);
                }} >
                    + Add Specialization
                </Button>
            </Box>



            </>
    );
}
export default Doctor;