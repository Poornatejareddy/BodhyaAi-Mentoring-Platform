import React from 'react';
import { Outlet } from 'react-router-dom';
import FloatingChatButton from '../../components/FloatingChatButton';
import MessageNotificationManager from '../../components/notifications/MessageNotificationManager';

function StudentDashboard() { return <><Outlet/><FloatingChatButton/><MessageNotificationManager/></>; }
export default StudentDashboard;
