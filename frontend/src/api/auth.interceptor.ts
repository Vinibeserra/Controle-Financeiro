import type { AxiosError } from "axios";
import { api } from "./api";
import axios from "axios";

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("@finance:token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,

    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            const refreshToken = localStorage.getItem("@finance:refreshToken");

            if (!refreshToken) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    error.config!.headers.Authorization = `Bearer ${token}`;
                    return api.request(error.config!);
                });
            }

            isRefreshing = true;

            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/auth/refresh`,
                    { refreshToken }
                );

                const { accessToken } = response.data;

                sessionStorage.setItem("@finance:token", accessToken);

                api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

                processQueue(null, accessToken);

                error.config!.headers.Authorization = `Bearer ${accessToken}`;
                return api.request(error.config!);

            } catch (err) {
                processQueue(err as AxiosError, null);
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
