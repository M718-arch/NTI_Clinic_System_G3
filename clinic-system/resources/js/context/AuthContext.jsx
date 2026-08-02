import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
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
            setUser(response.data);
        } catch (error) {
            console.error('Auth check failed:', error.response?.status, error.response?.data);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            const userResponse = await api.get('/user');
            setUser(userResponse.data);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error.response?.data);
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            // Note: plain axios here, not the `api` client — `api` has baseURL '/api',
            // but Laravel's /logout route (from auth.php) is NOT under /api.
            await axios.post('/logout', {}, {
                withCredentials: true,
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
            });
        } catch (error) {
            console.error('Logout error:', error.response?.status, error.response?.data);
        } finally {
            setUser(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
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