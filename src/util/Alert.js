// src/hooks/useAlert.js
import { useState } from "react";

export default function Alert() {
    const [open, setOpen] = useState(false);
    const [alertStatus, setAlertStatus] = useState("");

    const showAlert = (status) => {
        setAlertStatus(status);
        setOpen(true);
    };

    const closeAlert = () => {
        setAlertStatus("");
        setOpen(false);
    };

    return {
        open,
        alertStatus,
        showAlert,
        closeAlert
    };
}
