import axios from 'axios';

const client = axios.create({
    baseURL: "http://localhost:3000",
    headers:{
        "Content-Type": "application/json",
        'accept': 'application/json'
    }
});

client.interceptors.request.use((config) => {
    let access_token = localStorage.getItem('access_token');
    if(access_token){
        config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
    },
    (error) => Promise.reject(error)
);

client.interceptors.response.use(
    (response) => response,
    async (error) => {
        let access_token = localStorage.getItem('access_token');
        let refresh_token = localStorage.getItem('refresh_token');
        let originalRequest = error.config;
        if(error.response.status == 401 && !originalRequest._retry){
            originalRequest._retry = true;
            if(!access_token || !refresh_token){
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                return Promise.reject(error);
            }
            try{
                let response = await client.post('/api/auth/refresh', {refresh_token: refresh_token});
                let newaccess_token = response.data.access_token;
                let newrefresh_token = response.data.refresh_token;
                originalRequest.headers.Authorization = `Bearer ${newaccess_token}`;

                localStorage.setItem('access_token', newaccess_token);
                localStorage.setItem('refresh_token', newrefresh_token);
                return client(originalRequest);
            }catch(err){
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export const api = {
    Registration: async (user) => {
        let result = await client.post('/api/auth/register', user);
        return result.data;
    },
    Login: async (user) => {
        let result = await client.post('/api/auth/login', user);
        return result.data;
    },
    RefreshToken: async (refresh_token) => {
        let result = await client.post('/api/auth/refresh', {refresh_token: refresh_token});
        return result.data;
    },
    GetMe: async () => {
        let result = await client.get('/api/auth/me');
        return result.data;
    },
    GetUsers: async () => {
        let result = await client.get('/api/users'); 
        return result.data;
    },
    GetUser: async (id) => {
        let result = await client.get(`/api/users/${id}`);
        return result.data;
    },
    UpdateUser: async (updatedUser) => {
        let result = await client.put(`/api/users/${updatedUser.id}`, updatedUser);
        return result.data;
    },
    BanUser: async (userId) => {
        let result = await client.delete(`/api/users/${userId}`); // не удаляет, а блокирует(меняет isBanned на true)
        return result.data;
    },
    CreateProduct: async (product) => {
        let result = await client.post('/api/products', product);
        return result.data;
    },
    GetProducts: async () => {
        let result = await client.get('/api/products');
        return result.data;
    },
    GetProduct: async (id) => {
        let result = await client.get(`/api/products/${id}`);
        return result.data;
    },
    UpdateProduct: async (updatedProduct) => {
        let result = await client.put(`/api/products/${updatedProduct.id}`, updatedProduct);
        return result.data;
    },
    DeleteProduct: async (id) => {
        let result = await client.delete(`/api/products/${id}`);
        return result.data;
    },
};