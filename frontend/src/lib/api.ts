/**
 * API Client for Last-Mile Optimizer
 * Uses Next.js API routes as a proxy to the Django backend
 */
import axios, { AxiosInstance, AxiosError } from 'axios';

// Use relative URL for Next.js API routes (they're on the same domain)
const API_BASE_URL = '/api';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor for auth
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          // Only redirect if not already on auth pages
          if (typeof window !== 'undefined') {
            const isAuthPage = window.location.pathname.startsWith('/login') || 
                               window.location.pathname.startsWith('/register');
            if (!isAuthPage) {
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
    });
    
    this.setToken(response.data.access_token);
    return response.data;
  }

  async register(data: {
    email: string;
    password: string;
    business_name: string;
    business_type: string;
    phone_number?: string;
    city?: string;
  }) {
    const response = await this.client.post('/auth/register', data);
    this.setToken(response.data.access_token);
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async updateProfile(data: { business_name?: string; phone_number?: string; city?: string; address?: string }) {
    const response = await this.client.patch('/auth/me', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.client.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  }

  // Orders
  async getOrders(params?: { status?: string; date?: string; limit?: number; offset?: number }) {
    const response = await this.client.get('/orders', { params });
    return response.data;
  }

  async getOrder(id: number) {
    const response = await this.client.get(`/orders/${id}`);
    return response.data;
  }

  async createOrder(data: any) {
    const response = await this.client.post('/orders', data);
    return response.data;
  }

  async createOrdersBulk(orders: any[]) {
    const response = await this.client.post('/orders/bulk', { orders });
    return response.data;
  }

  async uploadOrdersCSV(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post('/orders/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updateOrder(id: number, data: any) {
    const response = await this.client.patch(`/orders/${id}`, data);
    return response.data;
  }

  async deleteOrder(id: number) {
    await this.client.delete(`/orders/${id}`);
  }

  // Routes
  async getRoutes(params?: { date?: string; status?: string }) {
    const response = await this.client.get('/routes', { params });
    return response.data;
  }

  async getRoute(id: number) {
    const response = await this.client.get(`/routes/${id}`);
    return response.data;
  }

  async createRoute(data: { name?: string; route_date: string; vehicle_type: string; order_ids: number[] }) {
    const response = await this.client.post('/routes', data);
    return response.data;
  }

  async optimizeRoute(id: number, returnToStart: boolean = false) {
    const response = await this.client.post(`/routes/${id}/optimize`, {}, {
      params: { return_to_start: returnToStart }
    });
    return response.data;
  }

  async assignRiderToRoute(routeId: number, riderId: number) {
    const response = await this.client.post(`/routes/${routeId}/assign`, { rider_id: riderId });
    return response.data;
  }

  async exportRoutePDF(id: number) {
    const response = await this.client.get(`/routes/${id}/export/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async exportRouteCSV(id: number) {
    const response = await this.client.get(`/routes/${id}/export/csv`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Riders
  async getRiders() {
    const response = await this.client.get('/riders');
    return response.data;
  }

  async createRider(data: { name: string; phone_number: string; vehicle_type?: string }) {
    const response = await this.client.post('/riders', data);
    return response.data;
  }

  async updateRider(id: number, data: any) {
    const response = await this.client.patch(`/riders/${id}`, data);
    return response.data;
  }

  async deleteRider(id: number) {
    await this.client.delete(`/riders/${id}`);
  }

  async setRiderPin(riderId: number, pin: string) {
    const response = await this.client.post(`/riders/${riderId}/set-pin`, { pin });
    return response.data;
  }

  // ==================== RIDER PORTAL API ====================
  
  async riderLogin(phone_number: string, pin: string) {
    const response = await this.client.post('/riders/auth/login', {
      phone_number,
      pin,
    });
    this.setToken(response.data.access_token);
    return response.data;
  }

  async riderSetPin(phone_number: string, pin: string) {
    const response = await this.client.post('/riders/auth/set-pin', {
      phone_number,
      pin,
    });
    return response.data;
  }

  async getRiderProfile() {
    const response = await this.client.get('/riders/portal/me');
    return response.data;
  }

  async getRiderActiveRoute() {
    const response = await this.client.get('/riders/portal/active-route');
    return response.data;
  }

  async updateRiderLocation(latitude: number, longitude: number) {
    const response = await this.client.post('/riders/portal/update-location', {
      latitude,
      longitude,
    });
    return response.data;
  }

  async completeDelivery(stopId: number, data: {
    status: 'completed' | 'failed';
    cod_collected?: number;
    failure_reason?: string;
    recipient_name?: string;
  }) {
    const response = await this.client.post(`/riders/portal/complete-delivery/${stopId}`, data);
    return response.data;
  }

  async getRiderHistory() {
    const response = await this.client.get('/riders/portal/history');
    return response.data;
  }

  async riderGoOffline() {
    const response = await this.client.post('/riders/portal/go-offline');
    return response.data;
  }

  // POD
  async generateOTP(orderId: number) {
    const response = await this.client.post(`/pod/generate-otp/${orderId}`);
    return response.data;
  }

  async verifyOTP(orderId: number, otpCode: string) {
    const response = await this.client.post('/pod/verify-otp', null, {
      params: { order_id: orderId, otp_code: otpCode },
    });
    return response.data;
  }

  async createPOD(data: any) {
    const response = await this.client.post('/pod', data);
    return response.data;
  }

  async uploadPODPhoto(orderId: number, file: File) {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('order_id', orderId.toString());
    
    const response = await this.client.post('/pod/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getPOD(orderId: number) {
    const response = await this.client.get(`/pod/${orderId}`);
    return response.data;
  }

  // Reports
  async getSavingsReport(startDate?: string, endDate?: string) {
    const response = await this.client.get('/reports/savings', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  }

  async downloadSavingsReportPDF(startDate?: string, endDate?: string) {
    const response = await this.client.get('/reports/savings/pdf', {
      params: { start_date: startDate, end_date: endDate },
      responseType: 'blob',
    });
    return response.data;
  }

  async getDailyCODReport(date?: string) {
    const response = await this.client.get('/reports/cod/daily', {
      params: { target_date: date },
    });
    return response.data;
  }

  async getCODDiscrepancies(threshold?: number) {
    const response = await this.client.get('/reports/cod/discrepancies', {
      params: { threshold_percent: threshold },
    });
    return response.data;
  }

  // Pilot Applications (public endpoints)
  async submitPilotApplication(data: {
    name: string;
    email: string;
    company: string;
    phone: string;
    fleet_size: string;
    challenges?: string;
  }) {
    const response = await this.client.post('/pilots/apply', data);
    return response.data;
  }

  async getPilotStats() {
    const response = await this.client.get('/pilots/stats');
    return response.data;
  }
}

export const api = new ApiClient();
export default api;