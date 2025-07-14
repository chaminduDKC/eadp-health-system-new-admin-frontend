import "./channeling.css"
import {
    Box,
    Button,
    CircularProgress, IconButton,
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
import EditIcon from "@mui/icons-material/Edit";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";



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

    const [patient, setPatient] = useState("");
    const [doctor, setDoctor] = useState("");
    const [time, setTime] = useState("");
    const [reason, setReason] = useState("");
    const [docId, setDocId] = useState("")
    const [docName, setDocName] = useState("")
    const [patId, setPatId] = useState("")
    const [patName, setPatName] = useState("")

    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [selectedDate, setSelectedDate] = useState(null);

    const [bookings, setBookings] = useState([]);

    const [loading, setLoading] = useState(false);

    const [availableSlots, setAvailableSlots] = useState([])
    const [searchText, setSearchText] = useState("")




    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
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
            console.log(patientNames)
        } catch (error) {
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
            console.log(doctorNames)
            setDoctors(doctorNames);
        } catch (error) {
            console.log(error)
            setDoctors([]);
        }
    }

    const fetchTimeSlots = async (doctorId, date) => {
        try {
            const response = await axiosInstance.get(`http://localhost:9093/api/availabilities/get-availabilities-by-date-and-doctor/${doctorId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`
                },
                params: {date: date}
            });
            const slots = response.data.data.map((slot, idx) => ({ id: idx, name: slot }));
            setAvailableSlots(slots);
            return slots;
        } catch (error) {
            console.error("Error fetching time slots:", error);
            return [];
        }


    }

    useEffect(() => {
        fetchBookings(page, rowsPerPage, "");
        fetchPatients(setPatients);
        fetchDoctors(setDoctors);
    }, []);

    useEffect(() => {
        if (doctor && selectedDate) {
            console.log( "doctor is "+doctor)
            const date = selectedDate.format("YYYY-MM-DD");
            fetchTimeSlots(doctor.id, date);
        } else {
            setAvailableSlots([]);
        }
    }, [selectedDate, doctor]);

    const handleSubmit = async (e)=>{
        setLoading(true);
        e.preventDefault();
        if(!patient || !doctor || !time || !reason || !selectedDate ){
            setLoading(false);
            alert("Please fill all the fields");
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
            paymentStatus:"PAID"
        }

        console.log(bookingRequest);

        try {
            const response = await axiosInstance.post("http://localhost:9093/api/bookings/create-booking",
                bookingRequest,
                {headers: {"Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}`}}
            );
            setLoading(false);
            console.log(response.data.data);
            console.log("created")
            await fetchBookings(page, rowsPerPage, "");
            clearFields();
        } catch (e) {
            setLoading(false);
            alert("Could not create booking, please try again later");
            console.log("Could not create booking ", e)
        }

    }

    const fetchBookings = async (pageNumber=page, size = rowsPerPage, searchText = searchText)=>{
        try {
            const response = await axiosInstance.get("http://localhost:9093/api/bookings/find-all-bookings",

                {params: {searchText:searchText, page: pageNumber, size: size}}
            );
            console.log("I am searching "+searchText)
            console.log(response.data.data.bookingList)
            setBookings(response.data.data.bookingList);
        } catch (error) {
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
        console.log("Booking delete called with id "+booking)
        try {
            const response = await axiosInstance.delete(`http://localhost:9093/api/bookings/delete-by-booking-id/${booking.bookingId}`,
                {headers: {"Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}`}}
            );
            console.log(response.data);
            await fetchBookings(page, rowsPerPage, searchText);
        } catch (error) {
            console.error("Error deleting booking:", error);
        }
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
            <div className="form-section">

                <form style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    width: "100%",
                    marginTop: "1rem"
                }}>
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
                        label="Patient"
                        value={patName}
                        onChange={(e) => {
                            const selected = patients.find(p => p.name === e.target.value);
                            setPatient(selected);
                            setPatId(selected.id);
                            setPatName(selected.name);
                        }}
                    >
                        {patients.map((option) => (
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
                        select
                        variant="filled"
                        fullWidth
                        label="Doctors"
                        value={docName}
                        onChange={(e) => {
                            const selected = doctors.find(d => d.name === e.target.value);
                            setDoctor(selected);
                            setDocId(selected.id);
                            setDocName(selected.name);
                        }}
                    >
                        {doctors.map((option) => (
                            <MenuItem key={option.id} value={option.name}>
                                {option.name}
                            </MenuItem>
                        ))}
                    </TextField>


                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Select Date"
                            value={selectedDate}
                            onChange={(newValue) => {
                                setSelectedDate(newValue);
                            }}
                            disablePast
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
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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
                                                                    {/*<IconButton>*/}
                                                                    {/*    <EditIcon onClick={() => {*/}

                                                                    {/*    }}*/}

                                                                    {/*    />*/}

                                                                    {/*</IconButton>*/}
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
                        count={rows.length}
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