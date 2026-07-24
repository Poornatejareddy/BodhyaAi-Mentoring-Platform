import React from 'react';
import { Outlet } from 'react-router-dom';
import MessageNotificationManager from '../../components/notifications/MessageNotificationManager';

function AdminDashboard() { return <><Outlet/><MessageNotificationManager/></>; }
export default AdminDashboard;
