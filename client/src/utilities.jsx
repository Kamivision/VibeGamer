import axios from 'axios';
import { data } from 'react-router-dom';

export const api = axios.create({
    baseURL: '/api/v1/',
});

export const userVerify = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return null;
    }
    api.defaults.headers.common['Authorization'] = `Token ${token}`

    try {
    const response = await api.get('users/');
    if (response.status === 200) {
    return response.data.email;
    }
    return null;
    } catch (error) {
    if (error?.response?.status === 401) {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    return null;
    }
    throw error;
    }
};

export const handleSignOut = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
}

export const handleSignIn = async (data) => {
    let response = await api.post('auth/token/login/', data);
    if (response.status === 200) {
        const token = response.data.auth_token;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Token ${token}`;
        return response.data.username;
    }
    else {
        alert(response.data.error);
        return null;
    }
}

export const handleSignUp = async (data) => {
    let response = await api.post('auth/users/', data);
    if (response.status === 201) {
        let token = response.data.auth_token;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Token ${token}`;
        return response.data.username;
    }
    else {
        alert(response.data.error);
        return false;
    }
}
