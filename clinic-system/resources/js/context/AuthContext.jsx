// resources/js/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await api.get('/user');
            console.log('Auth check - user:', response.data);
            setUser(response.data);
        } catch (error) {
            console.error('Auth check failed:', error.response?.status, error.response?.data);
            if (error.response?.status === 401) {
                window.location.href = '/login';
            }
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error.response?.status, error.response?.data);
        } finally {
            setUser(null);
            window.location.href = '/login';
        }
    };

    const value = {
        user,
        setUser,
        logout,
        loading,
        isAuthenticated: !!user,
        hasRole: (role) => user?.role === role,
        role: user?.role || null,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};