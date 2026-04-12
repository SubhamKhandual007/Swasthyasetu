import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaBars,
    FaUser,
    FaHospital,
    FaDroplet,
    FaPills,
    FaCalendarDays,
    FaChevronLeft,
    FaChevronRight,
    FaBell,
    FaFileMedical
} from 'react-icons/fa6';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    const menuItems = [
        { title: 'Dashboard', path: '/dashboard', icon: <FaBars /> },
        { title: 'Profile', path: '/profile', icon: <FaUser /> },
        { title: 'Blood Bank', path: '/blood-donation', icon: <FaDroplet /> },
        { title: 'Hospitals', path: '/hospitals', icon: <FaHospital /> },
        { title: 'Pharmacy', path: '/medicine-stores', icon: <FaPills /> },
        { title: 'Appointments', path: '/nutritionist-appointments', icon: <FaCalendarDays /> },
        { title: 'Records', path: '/medical-records', icon: <FaFileMedical /> },
        { title: 'Alerts', path: '/notifications', icon: <FaBell /> },
    ];

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
            <button
                className={styles.toggleBtn}
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>

            <nav className={styles.nav}>
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        className={`${styles.navLink} ${location.pathname === item.path ? styles.active : ''}`}
                        title={isCollapsed ? item.title : ''}
                    >
                        <span className={styles.icon}>{item.icon}</span>
                        {!isCollapsed && <span className={styles.title}>{item.title}</span>}
                    </Link>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
