const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export class ApiError extends Error {
    code?: string;
    user?: any;

    constructor(message: string, code?: string, user?: any) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.user = user;
    }
}

class ApiService {
    private token: string | null;

    constructor() {
        this.token = localStorage.getItem('token') || null;
    }

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    getHeaders() {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint: string, options: RequestInit = {}) {
        const url = `${API_URL}${endpoint}`;
        const config: RequestInit = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new ApiError(data.error || 'Erro na requisição', data.code, data.user);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    async login(email, password) {
        const data = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    }

    async googleLogin(token) {
        const data = await this.request('/api/auth/google', {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    }

    async getCurrentUser() {
        return this.request('/api/auth/me');
    }

    logout() {
        this.setToken(null);
    }

    async updateProfile(data: { name?: string; currentPassword?: string; newPassword?: string }) {
        return this.request('/api/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async registerUser(userData: any) {
        const data = await this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    }

    // Users
    async getAllUsers() {
        return this.request('/api/users');
    }

    async createUser(userData) {
        return this.request('/api/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async updateUser(id, userData) {
        return this.request(`/api/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }

    async deleteUser(id) {
        return this.request(`/api/users/${id}`, {
            method: 'DELETE',
        });
    }

    // Helper to map API response to Frontend model
    _mapTransaction(t) {
        return {
            ...t,
            paymentMethod: t.payment_method || t.paymentMethod, // Handle both snake_case (DB) and potential camelCase
            amount: Number(t.amount) // Ensure amount is number
        };
    }

    // Transactions
    async getAllTransactions() {
        const transactions = await this.request('/api/transactions');
        return transactions.map(t => this._mapTransaction(t));
    }

    async createTransaction(transactionData) {
        const response = await this.request('/api/transactions', {
            method: 'POST',
            body: JSON.stringify(transactionData),
        });
        return this._mapTransaction(response.transaction);
    }

    async updateTransaction(id, transactionData) {
        const response = await this.request(`/api/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(transactionData),
        });
        return this._mapTransaction(response.transaction);
    }

    async deleteTransaction(id) {
        return this.request(`/api/transactions/${id}`, {
            method: 'DELETE',
        });
    }

    async getSummary() {
        return this.request('/api/transactions/summary');
    }

    // Password Reset
    async forgotPassword(email: string) {
        return this.request('/api/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    async resetPassword(token: string, newPassword: string) {
        return this.request('/api/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, newPassword }),
        });
    }
}

export const apiService = new ApiService();
