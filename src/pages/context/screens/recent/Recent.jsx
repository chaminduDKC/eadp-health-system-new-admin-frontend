import axiosInstance from "../../../../util/axiosInstance.js";
import {
    Box,
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
import EditIcon from "@mui/icons-material/Edit";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import React, {useEffect, useState} from "react";
import './recent.css'


const columns = [
    { id: 'dateTime', label: 'Date & Time', minWidth: 100 },
    { id: 'action', label: 'Activity', minWidth: 80 },
    { id: 'description', label: 'Description', minWidth: 60 },
];

const Recent = ()=>{


    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [activities, setActivities] = useState([]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const [searchText, setSearchText] = useState("");

    const fetchActivities = async (pageNumber = page, pageSize = rowsPerPage, search = searchText)=>{
        const resp = await axiosInstance.get("http://localhost:9094/api/recent-activities/get-all-activities",{params:{
            searchText:search, page:pageNumber, size:pageSize
            }}).then(res=>{
            console.log(res.data.data.activityList)
            setActivities(res.data.data.activityList)
        }).catch((err)=>{
            console.error(err);
        })

    }
    const rows = activities.map((act) => ({
        action:act.action,
        dateTime:act.dateTime,
        description:act.description
    }));

    useEffect(() => {
        fetchActivities();
    }, []);
    return (
        <div className="recent">
            <div className="recent-table">
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
                                                                {/*<IconButton>*/}
                                                                {/*    <EditIcon onClick={() => {*/}
                                                                {/*        editPatient(row);*/}
                                                                {/*    }}*/}

                                                                {/*    />*/}

                                                                {/*</IconButton>*/}
                                                                {/*<IconButton>*/}
                                                                {/*    <CalendarMonthIcon onClick={() => {*/}
                                                                {/*        handleClickOpenModal(row)*/}
                                                                {/*    }}/>*/}
                                                                {/*</IconButton>*/}
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
    );
}
export default Recent;