import React from "react";
import Home from "../../app/public/Home";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
    return (
        <div className="flex w-screen h-screen bg-slate-50 text-slate-800">
            <Home>
                <Outlet />
            </Home>
        </div>
    );
}
export default AppLayout;