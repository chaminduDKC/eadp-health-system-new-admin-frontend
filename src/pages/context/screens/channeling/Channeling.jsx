import "./channeling.css"
import {
    Alert, Autocomplete,
    Box,
    Button,
    CircularProgress, Collapse, IconButton,
    MenuItem,
    Paper,
    Table, TableBody, TableCell,
    TableContainer,
    TableHead, TablePagination, TableRow,
    TextField
} from "@mui/material";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import React, {useEffect, useState} from "react";
import axiosInstance from "../../../../util/axiosInstance.js";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import AlertHook from '../../../../util/Alert.js'
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';


const columns = [
    { id: 'doctorName', label: 'Doctor', minWidth: 100 },
    { id: 'patientName', label: 'Patient', minWidth: 80 },
    { id: 'reason', label: 'Reason', minWidth: 60 },
    { id: 'date', label: 'Date', minWidth: 100 },
    { id: 'time', label: 'Time', minWidth: 100 },
    { id: 'paymentStatus', label: 'Payment', minWidth: 100 },
    { id: 'status', label: 'Status', minWidth: 100 },


];

const Channeling = ()=>{


    const {open,alertStatus, showAlert, closeAlert} = AlertHook();

    const [patient, setPatient] = useState("");
    const [doctor, setDoctor] = useState("");
    const [time, setTime] = useState("");
    const [reason, setReason] = useState("");
    const [docId, setDocId] = useState("")
    const [docName, setDocName] = useState("")
    const [specName, setSpecName] = useState("")
    const [patId, setPatId] = useState("")
    const [patName, setPatName] = useState("")

    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [selectedDate, setSelectedDate] = useState(null);

    const [bookings, setBookings] = useState([]);

    const [loading, setLoading] = useState(false);

    const [availableSlots, setAvailableSlots] = useState([])
    const [searchText, setSearchText] = useState("")
    const [appointmentCount, setAppointmentCount] = useState(0);

    const [specializations, setSpecializations] = useState([]);
    const [specialization, setSpecialization] = useState([]);
    const [specId, setSpecId] = useState("");




    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        fetchBookings(newPage, rowsPerPage, searchText)
    };

    const handleChangeRowsPerPage = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
        fetchBookings(0, newSize, searchText);

    };




    const rows = bookings.map((pat) => ({
        doctorName: pat.doctorName,
        patientName: pat.patientName,
        reason: pat.reason,
        date: pat.date,
        time: pat.time,
        paymentStatus:pat.paymentStatus,
        status:pat.status,
        bookingId:pat.bookingId
    }));


    const fetchPatients = async (setPatients) => {
        try {
            const response = await axiosInstance.get("http://localhost:9092/api/patients/find-all-patients",
                {headers:   {"Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}`},
                    params: {searchText:"", page: 0, size: 1000}}
            );
            const patientNames = response.data.data.patientList.map((p) => ({
                id: p.patientId,
                name: p.name,
            }));
            setPatients(patientNames);
        } catch (error) {
            showAlert("failed-fetch-pat");
            console.log(error)

        }
    };

    const fetchDoctors = async (setDoctors) =>{
        try {
            const response = await axiosInstance.get("http://localhost:9091/api/doctors/find-all-doctors",
                {headers:   {"Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}`},
                    params: {searchText:"", page: 0, size: 1000}}
            );
            const doctorNames = response.data.data.dataList.map((d) => ({
                id: d.doctorId,
                name: d.name,
            }));
            setDoctors(doctorNames);
        } catch (error) {
            showAlert("failed-fetch-doc");
            console.log(error)
            setDoctors([]);
        }
    }

    const fetchTimeSlots = async (docId, date) => {
        console.log("doc id id in method "+docId)
        console.log("date in method "+date)
        try {
            const response = await axiosInstance.get(`http://localhost:9093/api/availabilities/get-availabilities-by-date-and-doctor/${docId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`
                },
                params: {date: date}
            });
            if (response.data.data.length === 0) {
                showAlert("failed-not-selected-or-available")
                return;
            }
            const slots = response.data.data.map((slot, idx) => ({id: idx, name: slot}));
            setAvailableSlots(slots);
            return slots;
        } catch (error) {
            showAlert("failed-fetch-time-slot");
            console.error("Error fetching time slots:", error);
            return [];
        }
    }



    useEffect(() => {
        fetchBookings(page, rowsPerPage, "");
        fetchPatients(setPatients);
        fetchDoctors(setDoctors);
        fetchSpecializations("");
    }, []);

    useEffect(() => {
        if (doctor && selectedDate) {
            const date = selectedDate.format("YYYY-MM-DD");
            fetchTimeSlots(docId, date);
        } else {
            setAvailableSlots([]);
        }
    }, [selectedDate, doctor]);

    const handleSubmit = async (e)=>{
        setLoading(true);
        e.preventDefault();
        if(!patient || !doctor || !time || !reason || !selectedDate ){
            setLoading(false);
            showAlert("empty-fields");
            return;
        }
        const date = selectedDate.format("YYYY-MM-DD")

        const bookingRequest = {
            patientId:patId,
            patientName:patName,
            doctorId:docId,
            doctorName:docName,
            date:date,
            time:time,
            reason:reason,
            status:"PENDING",
            paymentStatus:"COMPLETED"
        }

        try {
            await axiosInstance.post("http://localhost:9093/api/bookings/create-booking",
                bookingRequest,
                {headers: {"Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}`}}
            );
            setLoading(false);
            showAlert("success-create")
            await fetchBookings(page, rowsPerPage, "");
            clearFields();
        } catch (e) {
            setLoading(false);
            showAlert("failed-create")
            console.log("Could not create booking ", e)
        }

    }

    const fetchBookings = async (pageNumber=page, size = rowsPerPage, searchText = searchText)=>{
        try {
            const response = await axiosInstance.get("http://localhost:9093/api/bookings/find-all-bookings",

                {params: {searchText:searchText, page: pageNumber, size: size}}
            );
            setBookings(response.data.data.bookingList);
            setAppointmentCount(response.data.data.bookingCount);
        } catch (error) {
            showAlert("failed-fetch")
            console.error("Error fetching bookings:", error);
            return [];
        }
    }


    const clearFields = ()=>{
        setPatient("")
        setTime("")
        setReason("")
        setDoctor("")
        setDocId("")
        setPatId("")
        setPatName("")
        setDocName("")
        setAvailableSlots([])
        setSelectedDate(null);
    }

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleCloseDeleteModal = ()=>{
        setDeleteModalOpen(false);
    }

    const [modalData, setModalData] = useState({})
    const deleteBooking = async (booking)=>{

        try {
            await axiosInstance.delete(`http://localhost:9093/api/bookings/delete-by-booking-id/${booking.bookingId}`,
                {headers: {"Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}`}}
            );
            showAlert("success-delete")
            await fetchBookings(page, rowsPerPage, searchText);
        } catch (error) {
            showAlert("failed-delete")
            console.error("Error deleting booking:", error);
        }
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
    const [availableDatesByDoctor, setAvailableDatesByDoctor] = useState([]);
    const getAvailableDatesByDoctor = async (docId)=>{
        const response = await axiosInstance.get(`http://localhost:9093/api/bookings/get-available-dates-by-doctor/${docId}`)
        console.log(response.data.data)
        setAvailableDatesByDoctor(response.data.data)
    }
    const fetchDoctorsBySpecialization = async (specialization)=>{
        console.log(specialization+" Frontend")
        try {
            const response = await axiosInstance.get(`http://localhost:9091/api/doctors/find-doctors-by-specialization`,{params: {specialization}}
            );
            setDoctors(response.data.data);
            console.log(response.data.data);
        } catch (error) {
            console.error("Error fetching doctors by specialization:", error);
        }

        console.log(specialization)
    }

    const [statusModalOpen, setStatusModalOpen] = useState(false);

    const handleCloseStatusModal = ()=>{
        setStatusModalOpen(false);
        fetchBookings(page, rowsPerPage, searchText)
    }
    const handleUpdateStatus = async (status)=>{
        try {
            await axiosInstance.put(
                `http://localhost:9093/api/bookings/update-booking-status/${modalData.bookingId}`,
                { },
                { params:{
                        status: status
                    },headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
            ).then((res)=>{
                console.log(res)
                fetchBookings(page, rowsPerPage, searchText);
                handleCloseStatusModal();
            });

        } catch (e) {
            console.log(e)
        }

    }
    const handleUpdatePaymentStatus = async ()=>{
        await axiosInstance.put(
            `http://localhost:9093/api/bookings/update-payment-status/${modalData.bookingId}`,
            {  },
            { params:{ paymentStatus: "COMPLETED"},headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
        ).then((res)=>{
            fetchBookings(page, rowsPerPage, searchText).then(()=>{
                handleCloseStatusModal();
            });

        });

    }

    return (
        <div className="channeling">
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
                            If you delete, all appointment related data will be lost
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
                                    console.log("done")
                                    deleteBooking(modalData).then(()=>{
                                        fetchBookings(page, rowsPerPage, searchText).then(()=>{
                                            handleCloseDeleteModal();
                                        });
                                    })


                                }} >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>


            <React.Fragment>
                <Dialog
                    open={statusModalOpen}
                    onClose={handleCloseStatusModal}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {modalData.doctorName} with patient :{" "}
                        {modalData.patientName}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Update appointment status or payment below.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        {/*<Button*/}
                        {/*    sx={{ color: "var(--color-green-forest)" }}*/}
                        {/*    onClick={handleCloseStatusModal}*/}
                        {/*    autoFocus*/}
                        {/*>*/}
                        {/*    Cancel*/}
                        {/*</Button>*/}
                        <Button
                            variant="contained"
                            sx={{ backgroundColor: "var(--color-green-forest)" }}
                            disabled={modalData.paymentStatus === "COMPLETED"}
                            onClick={async () => {
                                // Update payment status to COMPLETED
                                handleUpdatePaymentStatus();
                            }}
                        >
                            Confirm Payment
                        </Button>
                        <Button
                            variant="contained"
                            sx={{ backgroundColor: "var(--color-green-forest)" }}
                            disabled={modalData.status === "CONFIRMED" || modalData.status === "CANCELLED"}
                            onClick={async () => {
                                // Update status to CONFIRMED
                                handleUpdateStatus("CONFIRMED")
                            }}
                        >
                            Confirm Appointment
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            disabled={modalData.status === "CANCELLED"}
                            onClick={async () => {
                                // Update status to CANCELLED
                                handleUpdateStatus("CANCELLED")
                            }}
                        >
                            Cancel Appointment
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
            <div className="form-section">

                <form style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    width: "100%",
                    marginTop: "1rem"
                }}>


                    <Autocomplete
                        sx={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            input: { color: 'var(--text-primary)' },
                            label: { color: 'var(--text-secondary)' },
                            marginTop: "10px"
                        }}
                        value={patients.find(p => p.name === patName) || null}
                        onChange={(event, newValue) => {
                            if (newValue) {
                                setPatient(newValue);     // full object
                                setPatId(newValue.id);    // patient ID
                                setPatName(newValue.name); // just the name string
                            } else {
                                setPatient(null);
                                setPatId(null);
                                setPatName("");
                            }
                        }}
                        options={patients}
                        getOptionLabel={(option) => option.name || ""}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        fullWidth
                        renderInput={(params) => <TextField {...params} label="Patients" />}
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
                                setSpecId(newValue.specializationId);    // patient ID
                                setSpecName(newValue.specialization); // just the name string
                                fetchDoctorsBySpecialization(newValue.specialization);
                            } else {
                                setDoctor(null);
                                setDocId(null);
                                setDocName("");
                            }
                        }}
                        options={specializations}
                        getOptionLabel={(option) => option.specialization || ""}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        fullWidth
                        renderInput={(params) => <TextField {...params} label="Specializations" />}
                    />


                    <Autocomplete
                        sx={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            input: { color: 'var(--text-primary)' },
                            label: { color: 'var(--text-secondary)' },
                            marginTop: "10px"
                        }}
                        value={doctors.find(p => p.name === docName) || null}
                        onChange={(event, newValue) => {
                            if (newValue) {
                                setDoctor(newValue);     // full object
                                setDocId(newValue.doctorId);    // patient ID
                                setDocName(newValue.name); // just the name string
                                console.log( (newValue.doctorId)); // just the name string
                                getAvailableDatesByDoctor(newValue.doctorId);
                            } else {
                                getAvailableDatesByDoctor(docId);
                                console.log("New value")
                            }
                        }}
                        options={doctors}
                        getOptionLabel={(option) => option.name || ""}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        fullWidth
                        renderInput={(params) => <TextField {...params} label="Doctors" />}
                    />

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Select Date"
                            value={selectedDate}
                            onChange={(newValue) => {
                                console.log(newValue)
                                console.log(" doc iid is "+docId)
                                setSelectedDate(newValue);
                                if (docId && newValue) {
                                    const formattedDate = newValue.format ? newValue.format("YYYY-MM-DD") : newValue;
                                    fetchTimeSlots(docId, formattedDate);
                                }
                            }}
                            disabled={!docName}
                            disablePast
                            shouldDisableDate={d => {
                                if (!doctor || !availableDatesByDoctor || !Array.isArray(availableDatesByDoctor)) return true;
                                const iso = d.format('YYYY-MM-DD');
                                return !availableDatesByDoctor.includes(iso);
                            }}
                            format="YYYY-MM-DD"
                        />
                    </LocalizationProvider>


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
                        label="Time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    >
                        {availableSlots.map((option) => (
                            <MenuItem key={option.id} value={option.name}>
                                {option.name}
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
                        variant="filled"
                        fullWidth
                        label="Reason"
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />

                    <Box mt={2} gap={2} display="flex" alignItems="center">
                        <Button
                            disabled={time === "" || reason === "" || patName === "" || docName === "" || selectedDate === null}
                            sx={{
                                backgroundColor: "var(--color-green-dark)",
                                color: "var(--color-cream)",
                                height: 40,
                                minWidth: 120,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onClick={(e) => handleSubmit(e)}
                            type="submit"
                            variant="contained"
                        >{loading ? <CircularProgress/> : "Save Appointment"}</Button>
                        <Button
                            sx={{
                                color:"var(--color-green-dark)",
                                backgroundColor:"transparent",
                                fontWeight:"bold",

                            }}
                            onClick={() => {
                            clearFields();
                        }}>Cancel</Button>
                    </Box>
                </form>
            </div>


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
                                {alertStatus === "success-create" && "Appointment booked successfully!"}
                                {alertStatus === "success-update" && "Doctor updated successfully!"}
                                {alertStatus === "success-delete" && "Appointment deleted successfully!"}
                                {alertStatus === "success-fetch" && "Doctors fetched successfully!"}
                                {alertStatus === "failed-create" && "Failed to book appointment. Please try again."}
                                {alertStatus === "failed-update" && "Failed to update doctor. Please try again."}
                                {alertStatus === "failed-delete" && "Failed to delete appointment. Please try again."}
                                {alertStatus === "failed-fetch" && "Failed to fetch appointments list. Please try again."}
                                {alertStatus === "empty-fields" && "Please fill all the fields."}
                                {alertStatus === "failed-fetch-doc" && "Failed to load doctors. Please try again."}
                                {alertStatus === "failed-fetch-pat" && "Failed to load patients. Please try again."}
                                {alertStatus === "failed-fetch-time-slot" && "Failed to load available times. Please try again."}
                                {alertStatus === "failed-not-selected-or-available" && "This doctor haven't selected his availability for this date or this doctor is already booked on selected date. Check availability and try again."}
                            </Alert>
                        </Collapse>
                    </Box>
                )
            }

            <div className="channel-table">


                <TextField
                    sx={{
                        marginBottom: "20px"
                    }}
                    value={searchText}
                    fullWidth
                    id="filled-search"
                    label="Search by doctor name or patient name"
                    type="search"
                    variant="filled"
                    onChange={(e) => {
                        const value = e.target.value;
                        setSearchText(value)
                        console.log("search text is " + value)
                        fetchBookings(page, rowsPerPage, value).then((res) => {
                            console.log(res)
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
                                            <>
                                            <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>

                                                {columns.map((column) => {
                                                    const value = row[column.id];
                                                    return (
                                                        <TableCell key={column.id} align={column.align}>
                                                            {column.id === "doctorName" ?
                                                                <>
                                                                    <IconButton>
                                                                        <SettingsIcon sx={{
                                                                            color:"var(--color-green-forest)",
                                                                        }} onClick={() => {
                                                                            setStatusModalOpen(true);
                                                                            setModalData(row)
                                                                        }}

                                                                        />

                                                                    </IconButton>
                                                                    <IconButton>
                                                                        <DeleteIcon color="error"  onClick={() => {
                                                                            setDeleteModalOpen(true)
                                                                            console.log("row is ")
                                                                            console.log(row)
                                                                            setModalData(row);
                                                                        }}/>
                                                                    </IconButton>
                                                                </>
                                                                : ""

                                                            }
                                                            {
                                                                column.id === "paymentStatus" && value === "COMPLETED" ?
                                                                    <IconButton><CheckCircleIcon sx={{color: "green"}}/>  </IconButton>: ""
                                                            }

                                                            {
                                                                column.id === "status" && value === "CONFIRMED" ?
                                                                    <IconButton><CheckCircleIcon sx={{color: "green"}}/>  </IconButton> : value === "CANCELLED" ?  <IconButton><CancelIcon sx={{color: "red"}}/>  </IconButton> : ""
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


                                            </>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={appointmentCount}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </div>
        </div>
    )
}
export default Channeling;