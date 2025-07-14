import './patient.css'
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
import React, {useEffect, useState} from "react";
import axiosInstance from "../../../../util/axiosInstance.js";
import EditIcon from "@mui/icons-material/Edit";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DialogTitle from "@mui/material/DialogTitle";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import {DateCalendar, LocalizationProvider, TimePicker} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import DialogActions from "@mui/material/DialogActions";
import {styled} from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogContentText from "@mui/material/DialogContentText";




const columns = [
    { id: 'name', label: 'Name', minWidth: 100 },
    { id: 'age', label: 'Age', minWidth: 80 },
    { id: 'phone', label: 'Phone', minWidth: 60 },
    { id: 'email', label: 'Email', minWidth: 100 },
    { id: 'address', label: 'Address', minWidth: 100 },


];

const Patient = ()=>{

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



    const handleSubmit = async (e)=>{
        e.preventDefault();
        setLoading(true);
        if(!name || !email || !address || !phone || !gender || !age || !password){
            alert("Please fill all the required fields");
            setLoading(false);
            return;
        }



        if(enableEditMode){
            const updateRequest = {
                name:name,
                email:email,
                address:address,
                password:password,
                phone:phone,
                gender:gender,
                age:age
            };

            try{

                const response = await axiosInstance.put(`http://localhost:9090/api/users/update-user/${updateUserId}`,
                    updateRequest, {headers:{Authorization:`Bearer ${localStorage.getItem("access_token")}`}});

                console.log("response for update \n "+response.data.code)
                setLoading(false)
            } catch (e) {
                console.log(e)
                setLoading(false);
            }
        } else{
            const request = {
                name:name,
                email:email,
                password:password,
                address:address,
                phone:phone,
                gender:gender,
                age:age
            };

            console.log(request);
            try {
                console.log("Started")
                const response = await axiosInstance.post("http://localhost:9090/api/users/register-patient",
                    request, {headers:{Authorization:`Bearer ${localStorage.getItem("access_token")}`}});

                console.log(response.data.data)
                console.log("Completed")
                setLoading(false);
                await fetchPatients()
                await clearFields();
            } catch (e) {
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
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
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
            console.log(response.data.data);
        } catch (error) {
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



    const handleClickOpenModal = (row) => {
        setOpenModal(true);
        console.log(row)
        setModalData(row)
    };

    const editPatient = async (patient)=>{
        await clearFields();
        setData(patient);
        console.log("Edit called with "+ patient.address)
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
    };


    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleCloseDeleteModal = ()=>{
        setDeleteModalOpen(false);
    }

    const deletePatient = async (userId) => {
        console.log("delete called with id "+userId)
        console.log(userId)

        const response = await axiosInstance.delete(`http://localhost:9090/api/users/delete-user/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });
        console.log(response)
        if(response.status === 204){
            await fetchPatients();
        } else {
            alert("Failed to delete patient");
        }
    }

    return (
        <>
            <BootstrapDialog
                sx={{

                }}
                onClose={handleCloseModal}
                aria-labelledby="customized-dialog-title"
                open={openModal}
            >
                <DialogTitle sx={{ m: 0, p: 2, width:"500px" }} id="customized-dialog-title">

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
                        Name    : {modalData.name}
                    </Typography>

                    <Typography gutterBottom>
                        Email   : {modalData.email}
                    </Typography>

                    <Typography gutterBottom>
                        Address : {modalData.address}
                    </Typography>

                    <Typography gutterBottom>
                        Gender  : {modalData.gender}
                    </Typography>

                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={()=>{
                            handleCloseModal();
                        }}
                        sx={{
                            backgroundColor:"var(--color-green-dark)",
                            color:"var(--color-cream)"
                        }} autoFocus>
                        Close
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
            <div className="patient">
                <div className="form-section">
                    <form>
                        <TextField

                            label="Name"
                            variant="filled"
                            margin="normal"
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
                            fullWidth
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
                            fullWidth
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
                                handleSubmit(e).then(()=>{
                                    fetchPatients().then(()=>{
                                        setEnableEditMode(false);
                                        setLoading(false);
                                        clearFields();
                                    })
                                })
                            }} variant="contained"
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
                                                <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>

                                                    {columns.map((column) => {
                                                        const value = row[column.id];
                                                        return (
                                                            <TableCell key={column.id} align={column.align}>
                                                                {value}
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
                                                                                handleClickOpenModal(row)
                                                                            }}/>
                                                                        </IconButton>
                                                                    </>
                                                                    : ""

                                                                }


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
    )
}
export default Patient;