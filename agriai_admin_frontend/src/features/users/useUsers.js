import { useState, useEffect, useCallback } from 'react';
import { userService } from './userService';

const DEFAULT_PAGE_SIZE = 10;

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({ role: '', isActive: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size: DEFAULT_PAGE_SIZE,
        ...(filters.role && { role: filters.role }),
        ...(filters.isActive !== '' && { isActive: filters.isActive === 'true' }),
      };
      const res = await userService.getUsers(params);
      setUsers(res.data.content);
      setTotalElements(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const deleteUser = async (id) => {
    await userService.softDeleteUser(id);
    fetchUsers();
  };

  return {
    users,
    totalElements,
    totalPages,
    page,
    setPage,
    filters,
    applyFilters,
    loading,
    error,
    refresh: fetchUsers,
    deleteUser,
  };
}
