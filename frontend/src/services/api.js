import axios from "axios";

// 1. .env dan kelayotgan URLni olamiz
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 2. Linkni xavfsiz formatlash (replace orqali ortiqcha slashlarni tozalaymiz)
const API_URL = `${BASE_URL.replace(/\/+$/, "")}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Ixtiyoriy: Logout logikasi
        }
        return Promise.reject(error);
    }
);

export const userApi = {
    register: (data) => api.post("/user/register", data),
    login: (data) => api.post("/user/login", data),
    getMe: () => api.get("/user/me"),
    getAll: () => api.get("/user"),
    search: (searchTerm) => api.get(`/user/search`, { params: { username: searchTerm } }),
};

export const chatApi = {
    createChat: (receiverId) => api.post("/chat", { receiverId: Number(receiverId) }),
    getMyChats: () => api.get("/chat"),
    deleteChat: (id) => api.delete(`/chat/${id}`),
};

export const messageApi = {
    sendMessage: (chat_id, text) => api.post("/message", {
        chat_id: Number(chat_id),
        text
    }),
    getMessages: (chatId) => api.get(`/message/${chatId}`),
    editMessage: (id, text) => api.put(`/message/${id}`, { text }),
    deleteMessage: (id) => api.delete(`/message/${id}`),
    markAsRead: (chatId) => api.put(`/message/read/${chatId}`),
};

export default api;