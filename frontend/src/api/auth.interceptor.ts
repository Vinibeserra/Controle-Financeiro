import type { InternalAxiosRequestConfig } from "axios";
import { api } from "./api";

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("@finance:token");

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
},
error => {
    return Promise.reject(error);
}
);