import "./channeling.css"
import {Box, Button, CircularProgress, MenuItem, TextField} from "@mui/material";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {useEffect, useState} from "react";
import axiosInstance from "../../../../util/axiosInstance.js";
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
            setPatients([]);
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
        fetchBookings();
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
            await fetchBookings();
            clearFields();
        } catch (e) {
            setLoading(false);
            alert("Could not create booking, please try again later");
            console.log("Could not create booking ", e)
        }

    }

    const fetchBookings = async ()=>{
        try {
            const response = await axiosInstance.get("http://localhost:9093/api/bookings/find-all-bookings",
                {headers: {"Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}`},
                    params: {searchText:"", page: 0, size: 1000}}
            );
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


    return (
        <div className="channeling">
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

                    <Box mt={5} gap={6} display="flex" alignItems="center">
                        <Button
                            sx={{

                                outline: "none !important",
                                border: "none !important",
                                boxShadow: "none !important"
                            }}
                            onClick={(e) => handleSubmit(e)}
                            type="submit"
                            variant="contained"
                        >{loading ? <CircularProgress/> : "Save Appointment"}</Button>
                        <Button onClick={() => {
                            clearFields();
                        }}>Cancel</Button>
                    </Box>
                </form>
            </div>
            <div className="channel-table">

            </div>
        </div>
    )
}
export default Channeling;