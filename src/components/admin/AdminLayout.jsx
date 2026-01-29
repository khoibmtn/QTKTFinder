import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import AdminSidebar from './AdminSidebar';
import CategoryManagement from './CategoryManagement';
import DataImport from './DataImport';
import ConfigurationPage from './ConfigurationPage';
import './AdminLayout.css';

const AdminLayout = () => {
    const [activeTab, setActiveTab] = useState('category');

    // Lifted state for CategoryManagement - persists when switching tabs
    const [categoryState, setCategoryState] = useState({
        records: [],
        loaded: false,
        message: ''
    });

    // Chuẩn QTKT options from config
    const [chuanQTKTOptions, setChuanQTKTOptions] = useState([
        { value: 'QTKT theo chuẩn cũ', label: 'QTKT theo chuẩn cũ' },
        { value: 'QTKT theo chuẩn mới', label: 'QTKT theo chuẩn mới' }
    ]);

    // Load chuẩn QTKT options from firestore settings
    useEffect(() => {
        loadChuanQTKTOptions();
    }, []);

    const loadChuanQTKTOptions = async () => {
        try {
            const docRef = doc(db, 'settings', 'chuanQTKT');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().options) {
                setChuanQTKTOptions(docSnap.data().options);
            }
        } catch (error) {
            console.error('Error loading chuanQTKT options:', error);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'category':
                return (
                    <CategoryManagement
                        categoryState={categoryState}
                        setCategoryState={setCategoryState}
                        chuanQTKTOptions={chuanQTKTOptions}
                    />
                );
            case 'import':
                return <DataImport />;
            case 'config':
            case 'password':
                return (
                    <ConfigurationPage
                        chuanQTKTOptions={chuanQTKTOptions}
                        setChuanQTKTOptions={setChuanQTKTOptions}
                    />
                );
            default:
                return (
                    <CategoryManagement
                        categoryState={categoryState}
                        setCategoryState={setCategoryState}
                        chuanQTKTOptions={chuanQTKTOptions}
                    />
                );
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="admin-main">
                <header className="admin-topbar">
                    <Link to="/" className="back-link">
                        ← Quay lại tìm kiếm
                    </Link>
                </header>
                <div className="admin-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
