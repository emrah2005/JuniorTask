import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta?.env?.VITE_API_BASE || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle common errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API service functions with error handling
export const apiService = {
  // Auth endpoints
  auth: {
    login: async (credentials) => {
      try {
        const response = await api.post('/auth/login', credentials);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Login failed');
      }
    },
    
    register: async (userData) => {
      try {
        const response = await api.post('/auth/register', userData);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Registration failed');
      }
    },
    
    getCurrentUser: async () => {
      try {
        const response = await api.get('/auth/me');
        return response.data;
      } catch (error) {
        throw new Error('Failed to get current user');
      }
    }
  },

  // Dashboard endpoints
  dashboard: {
    getSuperAdminStats: async () => {
      try {
        const response = await api.get('/dashboard/superadmin');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch SuperAdmin stats:', error);
        return {
          stats: {
            totalUsers: 0,
            totalBusinesses: 0,
            totalBookings: 0,
            acceptedBookings: 0,
            totalRevenue: 0
          },
          charts: {
            monthlyRevenue: [],
            monthlyBookings: []
          }
        };
      }
    },
    
    getAdminStats: async () => {
      try {
        const response = await api.get('/dashboard/admin');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch Admin stats:', error);
        return {
          stats: {
            totalRevenue: 0,
            monthlyRevenue: 0,
            totalBookings: 0,
            acceptedBookings: 0
          }
        };
      }
    },
    
    getUserStats: async () => {
      try {
        const response = await api.get('/dashboard/user');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch User stats:', error);
        return {
          stats: {
            totalBookings: 0,
            acceptedBookings: 0,
            totalSpent: 0
          }
        };
      }
    }
  },

  // Business endpoints
  businesses: {
    getAll: async () => {
      try {
        const response = await api.get('/businesses');
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
        return [];
      }
    },
    
    create: async (businessData) => {
      try {
        const response = await api.post('/businesses', businessData);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to create business');
      }
    },
    
    update: async (id, businessData) => {
      try {
        const response = await api.put(`/businesses/${id}`, businessData);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to update business');
      }
    },
    
    delete: async (id) => {
      try {
        await api.delete(`/businesses/${id}`);
        return true;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to delete business');
      }
    }
  },

  // Service endpoints
  services: {
    getByBusiness: async (businessId) => {
      try {
        const response = await api.get(`/services/business/${businessId}`);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Failed to fetch services:', error);
        return [];
      }
    },
    
    create: async (serviceData) => {
      try {
        const response = await api.post('/services', serviceData);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to create service');
      }
    },
    
    update: async (id, serviceData) => {
      try {
        const response = await api.put(`/services/${id}`, serviceData);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to update service');
      }
    },
    
    delete: async (id) => {
      try {
        await api.delete(`/services/${id}`);
        return true;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to delete service');
      }
    }
  },

  // Booking endpoints
  bookings: {
    getAll: async () => {
      try {
        const response = await api.get('/bookings');
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        return [];
      }
    },
    
    getByBusiness: async (businessId) => {
      try {
        const response = await api.get(`/bookings/business/${businessId}`);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Failed to fetch business bookings:', error);
        return [];
      }
    },
    
    create: async (bookingData) => {
      try {
        const response = await api.post('/bookings', bookingData);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to create booking');
      }
    },
    
    updateStatus: async (id, status) => {
      try {
        const response = await api.put(`/bookings/${id}/status`, { status });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to update booking status');
      }
    },
    
    delete: async (id) => {
      try {
        await api.delete(`/bookings/${id}`);
        return true;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to delete booking');
      }
    }
  },

  // Stats endpoints
  stats: {
    getMonthlyRevenue: async (businessId) => {
      try {
        const response = await api.get(`/stats/monthly-revenue/${businessId}`);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Failed to fetch monthly revenue:', error);
        return [];
      }
    },
    
    getRevenuePerService: async (businessId) => {
      try {
        const response = await api.get(`/stats/revenue-per-service/${businessId}`);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Failed to fetch revenue per service:', error);
        return [];
      }
    },
    
    getBookingsPerMonth: async (businessId) => {
      try {
        const response = await api.get(`/stats/bookings-per-month/${businessId}`);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Failed to fetch bookings per month:', error);
        return [];
      }
    }
  },

  // Groups endpoints
  groups: {
    getAll: async () => {
      try {
        const response = await api.get('/groups');
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Failed to fetch groups:', error);
        return [];
      }
    },
    getMyTrainerGroups: async () => {
      try {
        const response = await api.get('/groups/trainer/my');
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Failed to fetch trainer groups:', error);
        return [];
      }
    },
    create: async (groupData) => {
      try {
        const response = await api.post('/groups', groupData);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to create group');
      }
    },
    update: async (id, groupData) => {
      try {
        const response = await api.put(`/groups/${id}`, groupData);
        return response.data;
      } catch (error) {
        const apiErr = error.response?.data;
        if (apiErr?.errors && Array.isArray(apiErr.errors) && apiErr.errors.length > 0) {
          throw new Error(apiErr.errors[0].msg || 'Failed to update group');
        }
        throw new Error(apiErr?.error || 'Failed to update group');
      }
    }
  },

  // Memberships endpoints
  memberships: {
    getByGroup: async (groupId) => {
      try {
        const response = await api.get(`/memberships/group/${groupId}`);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Failed to fetch memberships:', error);
        return [];
      }
    },
    upsert: async (membershipData) => {
      try {
        const response = await api.post('/memberships', membershipData);
        return response.data;
      } catch (error) {
        const apiErr = error.response?.data;
        if (apiErr?.errors && Array.isArray(apiErr.errors) && apiErr.errors.length > 0) {
          throw new Error(apiErr.errors[0].msg || 'Failed to upsert membership');
        }
        throw new Error(apiErr?.error || 'Failed to upsert membership');
      }
    }
  },

  // Attendance endpoints
  attendance: {
    selfCheckin: async (payload) => {
      try {
        const response = await api.post('/attendance/self', payload);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to self check-in');
      }
    },
    coachCheckin: async (payload) => {
      try {
        const response = await api.post('/attendance/coach', payload);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to coach check-in');
      }
    },
    getSession: async (groupId, sessionDatetime) => {
      try {
        const response = await api.get(`/attendance/session`, { params: { group_id: groupId, session_datetime: sessionDatetime } });
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Failed to fetch session attendance:', error);
        return [];
      }
    },
    getSummary: async (params) => {
      try {
        const response = await api.get('/attendance/summary', { params });
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Failed to fetch attendance summary:', error);
        return [];
      }
    },
    getList: async (params) => {
      try {
        const response = await api.get('/attendance/list', { params });
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Failed to fetch attendance list:', error);
        return [];
      }
    }
  },

  // User endpoints
  users: {
    getAll: async () => {
      try {
        const response = await api.get('/users');
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
      }
    },
    create: async (userData) => {
      try {
        const response = await api.post('/users', userData);
        return response.data;
      } catch (error) {
        const apiErr = error.response?.data;
        if (apiErr?.errors && Array.isArray(apiErr.errors) && apiErr.errors.length > 0) {
          throw new Error(apiErr.errors[0].msg || 'Failed to create user');
        }
        throw new Error(apiErr?.error || 'Failed to create user');
      }
    },
    
    update: async (id, userData) => {
      try {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to update user');
      }
    },
    
    delete: async (id) => {
      try {
        await api.delete(`/users/${id}`);
        return true;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to delete user');
      }
    }
  }
};

export default apiService;
