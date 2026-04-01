import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { STAFF_ROLES } from '../constants/adminTabs';

export function useAdminRegistrations() {
  const [registrationRows, setRegistrationRows] = useState([]);
  const [declinedRows, setDeclinedRows] = useState([]);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState('');

  const fetchRegistrations = useCallback(async () => {
    setRegistrationLoading(true);
    setRegistrationError('');
    try {
      const [pendingRes, declinedRes] = await Promise.all([
        axios.get('/api/users/registrations/pending'),
        axios.get('/api/users/registrations/declined'),
      ]);
      setRegistrationRows(Array.isArray(pendingRes.data) ? pendingRes.data : []);
      setDeclinedRows(Array.isArray(declinedRes.data) ? declinedRes.data : []);
    } catch (e) {
      setRegistrationError(e.response?.data?.message || e.message || 'Failed to load registrations.');
      setRegistrationRows([]);
      setDeclinedRows([]);
    } finally {
      setRegistrationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleRegistrationApprove = async (row) => {
    try {
      const body = { status: 'approved' };
      if (row.accountType === 'staff') {
        const role = row.staffRole && STAFF_ROLES.includes(row.staffRole) ? row.staffRole : STAFF_ROLES[0];
        body.staffRole = role;
      }
      await axios.patch(`/api/users/${row.id}/registration-status`, body);
      await fetchRegistrations();
    } catch (e) {
      window.alert(e.response?.data?.message || 'Could not approve.');
    }
  };

  const handleRegistrationDecline = async (id) => {
    try {
      await axios.patch(`/api/users/${id}/registration-status`, { status: 'declined' });
      await fetchRegistrations();
    } catch (e) {
      window.alert(e.response?.data?.message || 'Could not decline.');
    }
  };

  const handleDeleteDeclinedRecord = async (id, name) => {
    if (!window.confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/users/${id}`);
      await fetchRegistrations();
    } catch (e) {
      window.alert(e.response?.data?.message || 'Could not delete record.');
    }
  };

  const pendingCustomerRows = registrationRows.filter((r) => r.accountType === 'customer');
  const pendingStaffRows = registrationRows.filter((r) => r.accountType === 'staff');
  const declinedCustomerRows = declinedRows.filter((r) => r.accountType === 'customer');
  const declinedStaffRows = declinedRows.filter((r) => r.accountType === 'staff');

  return {
    registrationLoading,
    registrationError,
    handleRegistrationApprove,
    handleRegistrationDecline,
    handleDeleteDeclinedRecord,
    pendingCustomerRows,
    pendingStaffRows,
    declinedCustomerRows,
    declinedStaffRows,
  };
}
