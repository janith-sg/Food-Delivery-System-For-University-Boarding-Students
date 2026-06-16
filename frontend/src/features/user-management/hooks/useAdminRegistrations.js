import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useFeedbackModal } from './useFeedbackModal';

export function useAdminRegistrations() {
  const [registrationRows, setRegistrationRows] = useState([]);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const { feedback, dismissFeedback, showFeedback } = useFeedbackModal();

  const fetchRegistrations = useCallback(async () => {
    setRegistrationLoading(true);
    setRegistrationError('');
    try {
      const pendingRes = await axios.get('/api/users/registrations/pending');
      setRegistrationRows(Array.isArray(pendingRes.data) ? pendingRes.data : []);
    } catch (e) {
      setRegistrationError(e.response?.data?.message || e.message || 'Failed to load registrations.');
      setRegistrationRows([]);
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
        const { data: names } = await axios.get('/api/staff-roles/names');
        const list = Array.isArray(names) ? names : [];
        const role =
          row.staffRole && list.includes(row.staffRole) ? row.staffRole : list[0];
        if (!role) {
          showFeedback('error', 'No roles', 'Configure staff roles under User Roles & Permissions first.');
          return;
        }
        body.staffRole = role;
      }
      await axios.patch(`/api/users/${row.id}/registration-status`, body);
      await fetchRegistrations();
      const kind = row.accountType === 'customer' ? 'Customer' : 'Staff member';
      showFeedback('success', 'Success', `${kind} "${row.name}" was approved successfully.`);
    } catch (e) {
      showFeedback(
        'error',
        'Could not approve',
        e.response?.data?.message || 'Something went wrong. Please try again.',
      );
    }
  };

  /** @param {string} id @param {{ accountType?: string; name?: string }} [row] */
  const handleRegistrationDecline = async (id, row) => {
    try {
      await axios.patch(`/api/users/${id}/registration-status`, { status: 'declined' });
      await fetchRegistrations();
      if (row?.accountType === 'customer') {
        showFeedback(
          'success',
          'Declined',
          `Customer "${row.name || 'User'}" was declined and removed from the system.`,
        );
      } else {
        showFeedback('error', 'Declined', 'The registration has been declined.');
      }
    } catch (e) {
      showFeedback(
        'error',
        'Could not decline',
        e.response?.data?.message || 'Something went wrong. Please try again.',
      );
    }
  };

  const pendingCustomerRows = registrationRows.filter((r) => r.accountType === 'customer');
  const pendingStaffRows = registrationRows.filter((r) => r.accountType === 'staff');

  return {
    registrationLoading,
    registrationError,
    handleRegistrationApprove,
    handleRegistrationDecline,
    pendingCustomerRows,
    pendingStaffRows,
    feedback,
    dismissFeedback,
  };
}
