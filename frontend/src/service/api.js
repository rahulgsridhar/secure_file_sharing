import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:443/api', // Change this to your backend URL
});

export default api;
