import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

// Custom hook for API calls with loading and error states
export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

// Custom hook for dashboard stats
export const useDashboardStats = (role) => {
  const getStatsByRole = useCallback(() => {
    switch (role) {
      case 'SuperAdmin':
        return apiService.dashboard.getSuperAdminStats();
      case 'Admin':
        return apiService.dashboard.getAdminStats();
      case 'User':
        return apiService.dashboard.getUserStats();
      default:
        return Promise.resolve({
          stats: { totalRevenue: 0, monthlyRevenue: 0, totalBookings: 0, acceptedBookings: 0 },
          charts: { monthlyRevenue: [], monthlyBookings: [] }
        });
    }
  }, [role]);

  return useApi(getStatsByRole, [role]);
};

// Custom hook for businesses
export const useBusinesses = () => {
  return useApi(apiService.businesses.getAll, []);
};

// Custom hook for bookings
export const useBookings = () => {
  return useApi(apiService.bookings.getAll, []);
};

// Custom hook for business bookings
export const useBusinessBookings = (businessId) => {
  const getBusinessBookings = useCallback(() => {
    return apiService.bookings.getByBusiness(businessId);
  }, [businessId]);

  return useApi(getBusinessBookings, [businessId]);
};

// Custom hook for services
export const useServices = (businessId) => {
  const getServices = useCallback(() => {
    return apiService.services.getByBusiness(businessId);
  }, [businessId]);

  return useApi(getServices, [businessId]);
};

// Custom hook for stats
export const useStats = (businessId) => {
  const getStats = useCallback(() => {
    return Promise.all([
      apiService.stats.getMonthlyRevenue(businessId),
      apiService.stats.getRevenuePerService(businessId),
      apiService.stats.getBookingsPerMonth(businessId)
    ]);
  }, [businessId]);

  return useApi(getStats, [businessId]);
};

export default useApi;
