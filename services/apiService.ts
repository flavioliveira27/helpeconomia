const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('token') || null;
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${API_URL}${endpoint}`;
        const config = {
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
                throw new Error(data.error || 'Erro na requisição');
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

    async getCurrentUser() {
        return this.request('/api/auth/me');
    }

    logout() {
        this.setToken(null);
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
}

export const apiService = new ApiService();
