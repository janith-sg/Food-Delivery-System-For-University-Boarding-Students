/** Sidebar label → URL segment */
export const TAB_PATHS = {
  Dashboard: 'dashboard',
  'Customer Registration': 'customer-registration',
  'Staff Registration': 'staff-registration',
  'Role Management': 'role-management',
  'Customer Management': 'customer-management',
  'User Profile': 'profile',
  'Support Chatbot': 'support-chatbot',
};

export const pathToTab = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([label, slug]) => [slug, label]),
);

/** Must match backend `STAFF_ROLES` */
export const STAFF_ROLES = ['Delivery Manager', 'Order Manager', 'Food Menu Manager'];

/** Mock data for Role Management tab only */
export const MOCK_ROLE_MGMT_STAFF = [
  { name: 'Sahan Mendis', email: 'sahan@unieats.com', currentRole: 'Delivery Manager', assignRole: 'Delivery Manager', status: 'Approved' },
  { name: 'Tharushi Silva', email: 'tharushi@unieats.com', currentRole: 'Order Manager', assignRole: 'Order Manager', status: 'Approved' },
  { name: 'Pasindu Jayasuriya', email: 'pasindu@unieats.com', currentRole: 'Food Menu Manager', assignRole: 'Food Menu Manager', status: 'Approved' },
];

/** Customer Management tab — dummy rows (UI demo) */
export const MOCK_CUSTOMER_MANAGEMENT = [
  { id: 'mock-cm-1', name: 'Nimali Perera', email: 'nimali.perera@student.uni.lk', studentId: 'IT22045', phone: '0771234567', currentRole: 'Customer', status: 'Active' },
  { id: 'mock-cm-2', name: 'Dinesh Fernando', email: 'dinesh.fernando@student.uni.lk', studentId: 'IT22046', phone: '0772345678', currentRole: 'Customer', status: 'Active' },
  { id: 'mock-cm-3', name: 'Shenali Wijesinghe', email: 'shenali.w@student.uni.lk', studentId: 'IT22047', phone: '0773456789', currentRole: 'Customer', status: 'Active' },
  { id: 'mock-cm-4', name: 'Ishara Madushan', email: 'ishara.madushan@student.uni.lk', studentId: 'IT22048', phone: '0774567890', currentRole: 'Customer', status: 'Active' },
  { id: 'mock-cm-5', name: 'Piumi Rathnayake', email: 'piumi.r@student.uni.lk', studentId: 'IT22049', phone: '0775678901', currentRole: 'Customer', status: 'Active' },
  { id: 'mock-cm-6', name: 'Kavindu Samarasekara', email: 'kavindu.s@student.uni.lk', studentId: 'IT22050', phone: '0776789012', currentRole: 'Customer', status: 'Active' },
  { id: 'mock-cm-7', name: 'Ayesha Nawas', email: 'ayesha.nawas@student.uni.lk', studentId: 'IT22051', phone: '0777890123', currentRole: 'Customer', status: 'Active' },
  { id: 'mock-cm-8', name: 'Ravindu Silva', email: 'ravindu.silva@student.uni.lk', studentId: 'IT22052', phone: '0778901234', currentRole: 'Customer', status: 'Active' },
  { id: 'mock-cm-9', name: 'Kasun Perera', email: 'kasun.perera@student.uni.lk', studentId: 'IT22053', phone: '0779012345', currentRole: 'Customer', status: 'Active' },
  { id: 'mock-cm-10', name: 'Tharindu Jayasinghe', email: 'tharindu.j@student.uni.lk', studentId: 'IT22054', phone: '0770123456', currentRole: 'Customer', status: 'Active' },
];

export const TAB_DESCRIPTIONS = {
  Dashboard: 'Overview of current user system activity.',
};
