import axiosInstance from "../../../../util/axiosInstance.js";
import {
    Alert,
    Box, Button, Collapse,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead, TablePagination,
    TableRow,
    TextField
} from "@mui/material";
import AlertHook from '../../../../util/Alert.js'
import React, {useEffect, useState} from "react";
import './recent.css'
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";


const columns = [
    { id: 'dateTime', label: 'Date & Time', minWidth: 100 },
    { id: 'action', label: 'Activity', minWidth: 80 },
    { id: 'description', label: 'Description', minWidth: 60 },
];

const Recent = ()=>{

    const {
        open,
        alertStatus,
        showAlert,
        closeAlert
    } = AlertHook();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [activities, setActivities] = useState([]);
    const [activityCount, setActivityCount] = useState(0)
    const [deleteId, setDeleteId] = useState("");

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        fetchActivities(newPage, rowsPerPage, searchText)
    };

    const handleChangeRowsPerPage = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
        fetchActivities(0, newSize, searchText);
    };
    const [searchText, setSearchText] = useState("");


    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleCloseDeleteModal = ()=>{
        setDeleteModalOpen(false);
    }


    const fetchActivities = async (pageNumber = page, pageSize = rowsPerPage, search = searchText)=>{
        const resp = await axiosInstance.get("http://localhost:9094/api/recent-activities/get-all-activities",{params:{
            searchText:search, page:pageNumber, size:pageSize
            }}).then(res=>{

            setActivities(res.data.data.activityList)
            setActivityCount(res.data.data.activityCount)
        }).catch((err)=>{
            showAlert("failed-fetch")
            console.error(err);
        })

    }
    const rows = activities.map((act) => ({
        activityId:act.activityId,
        action:act.action,
        dateTime:act.dateTime,
        description:act.description
    }));

    // const countAll = async ()=>{
    //     const response = await axiosInstance.get("http://localhost:9094/api/recent-activities/count-all", {params:{
    //         searchText:""
    //         }})
    //     setActivityCount(response.data.data)
    // }
    useEffect(() => {
        fetchActivities();

    }, []);


    const deleteActivity = async (activityId)=>{
        try {
            const resp = await axiosInstance.delete(`http://localhost:9094/api/recent-activities/delete-activity/${activityId}`).then(()=>{
                fetchActivities(page, rowsPerPage, searchText);
                showAlert("success-delete")
            })
        } catch (e) {
            console.log(e)
            showAlert("failed-delete")
        }
    }
    return (
        <div className="recent">

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
                                {alertStatus === "success-delete" && "Activity deleted successfully!"}
                                {alertStatus === "failed-delete" && "Failed to delete activity. Please try again."}
                                {alertStatus === "failed-fetch" && "Failed to fetch recent activities. Please try again."}
                            </Alert>
                        </Collapse>
                    </Box>
                )
            }

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
                                    deleteActivity(deleteId);
                                    handleCloseDeleteModal();

                                }} >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>

            <div className="recent-table">
            <TextField
                sx={{
                    marginBottom: "20px"
                }}
                value={searchText}
                fullWidth
                id="filled-search"
                label="Search by activity"
                type="search"
                variant="filled"
                onChange={(e) => {
                    const value = e.target.value;
                    setSearchText(value)
                    console.log("search text is " + value)
                    fetchActivities(page, rowsPerPage, value).then(() => {

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
                                        <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>

                                            {columns.map((column) => {
                                                const value = row[column.id];
                                                return (
                                                    <TableCell key={column.id} align={column.align}>
                                                        {column.id === "dateTime" ?
                                                            <>
                                                                <IconButton>
                                                                    <DeleteIcon color="error" onClick={() => {
                                                                        setDeleteId(row.activityId);
                                                                        setDeleteModalOpen(true)
                                                                    }}

                                                                    />

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
                    count={activityCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
            </div>
        </div>
    );
}
export default Recent;