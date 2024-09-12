import api from '@/services/api';
import { defineStore } from 'pinia';

interface User {
    id: number;
    username: string;
}

interface Tokens {
    access: string;
    refresh: string;
}

interface LoginCredentials {
    username: string;
    password: string;
}

interface RegisterData {
    username: string;
    password: string;
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: localStorage.getItem('accessToken') || (null as string | null),
        refreshToken: localStorage.getItem('refreshToken') || (null as string | null),
        user: null as User | null
    }),

    actions: {
        async login(credentials: LoginCredentials) {
            try {
                const response = await api.post<Tokens & { user: User }>('/login/', credentials);
                if (response.data.refresh) {
                    this.setTokens(response.data);
                    this.user = response.data.user;
                } else {
                    console.error('No refresh token received');
                    throw new Error('No refresh token received');
                }
            } catch (error) {
                console.error('Login failed:', error);
                throw error;
            }
        },

        async register(userData: RegisterData) {
            try {
                const response = await api.post<User>('/register/', userData);
                await this.login(userData);
                return response.data;
            } catch (error) {
                console.error('Registration failed:', error);
                throw error;
            }
        },

        setTokens(tokens: Tokens) {
            this.accessToken = tokens.access;
            this.refreshToken = tokens.refresh;
            localStorage.setItem('accessToken', tokens.access);
            localStorage.setItem('refreshToken', tokens.refresh);
        },

        async refreshAccessToken() {
            if (!this.refreshToken) throw new Error('No refresh token available');

            try {
                const response = await api.post<{ access: string }>('/token/refresh/', {
                    refresh: this.refreshToken
                });
                this.accessToken = response.data.access;
                localStorage.setItem('accessToken', response.data.access);
            } catch (error) {
                console.error('Token refresh failed:', error);
                this.logout();
                throw error;
            }
        },

        logout() {
            this.accessToken = null;
            this.refreshToken = null;
            this.user = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    },

    getters: {
        isAuthenticated: (state) => !!state.accessToken,
        getUser: (state) => state.user
    }
});
