import React, { useState } from 'react';
import UserMenuBar from '../components/UserMenuBar';
import AdminSidebar from '../components/AdminSidebar';
import LoginPage from './LoginPage';
import idPhoto1 from '../mock/r1.png';
import idPhoto2 from '../mock/r2.png';
import idPhoto3 from '../mock/r3.png';

const AdminDashboard = () => {
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [previousTab, setPreviousTab] = useState('Dashboard');
  const [profileForm, setProfileForm] = useState({
    name: 'Induja Customer',
    phone: '+94 77 456 1122',
    email: 'induja@unieats.com',
    photo: idPhoto1,
  });
  const salesHeights = [82, 95, 76, 88, 110, 72, 105, 84, 98, 120, 90, 0];
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const registrationRows = [
    {
      name: 'Ayesha Nawas',
      email: 'ayesha@unieats.com',
      studentId: 'IT22045',
      phone: '+94 77 123 4455',
      role: 'Student',
      photo: idPhoto1,
      status: 'Pending',
    },
    {
      name: 'Ravindu Silva',
      email: 'ravindu@unieats.com',
      studentId: 'IT22087',
      phone: '+94 77 887 1122',
      role: 'Student',
      photo: idPhoto2,
      status: 'Pending',
    },
    {
      name: 'Kasun Perera',
      email: 'kasun@unieats.com',
      studentId: 'IT22102',
      phone: '+94 71 222 8899',
      role: 'Delivery',
      photo: idPhoto3,
      status: 'Pending',
    },
  ];
  const roleRows = [
    {
      name: 'Nimali Perera',
      email: 'nimali@unieats.com',
      currentRole: 'Customer',
      assignRole: 'Customer',
      status: 'Approved',
    },
    {
      name: 'Dinesh Fernando',
      email: 'dinesh@unieats.com',
      currentRole: 'Customer',
      assignRole: 'Customer',
      status: 'Approved',
    },
    {
      name: 'Shenali Wijesinghe',
      email: 'shenali@unieats.com',
      currentRole: 'Customer',
      assignRole: 'Customer',
      status: 'Approved',
    },
    {
      name: 'Ishara Madushan',
      email: 'ishara@unieats.com',
      currentRole: 'Customer',
      assignRole: 'Customer',
      status: 'Approved',
    },
    {
      name: 'Piumi Rathnayake',
      email: 'piumi@unieats.com',
      currentRole: 'Customer',
      assignRole: 'Customer',
      status: 'Approved',
    },
    {
      name: 'Kavindu Samarasekara',
      email: 'kavindu@unieats.com',
      currentRole: 'Customer',
      assignRole: 'Customer',
      status: 'Approved',
    },
    {
      name: 'Sahan Mendis',
      email: 'sahan@unieats.com',
      currentRole: 'Delivery Manager',
      assignRole: 'Delivery Manager',
      status: 'Approved',
    },
    {
      name: 'Tharushi Silva',
      email: 'tharushi@unieats.com',
      currentRole: 'Order Manager',
      assignRole: 'Order Manager',
      status: 'Approved',
    },
    {
      name: 'Pasindu Jayasuriya',
      email: 'pasindu@unieats.com',
      currentRole: 'Food Menu Manager',
      assignRole: 'Food Menu Manager',
      status: 'Approved',
    },
  ];
  const customerRoleRows = roleRows.filter((row) => row.currentRole === 'Customer');
  const staffRoleRows = roleRows.filter((row) => row.currentRole !== 'Customer');
  const [staffManagementRows, setStaffManagementRows] = useState(staffRoleRows);
  const [customerManagementRows, setCustomerManagementRows] = useState(customerRoleRows);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');

  const filteredCustomerRows = customerManagementRows.filter(
    (row) =>
      row.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      row.email.toLowerCase().includes(customerSearchTerm.toLowerCase()),
  );

  const handleStaffRoleChange = (email, nextRole) => {
    setStaffManagementRows((prevRows) =>
      prevRows.map((row) => (row.email === email ? { ...row, currentRole: nextRole, assignRole: nextRole } : row)),
    );
  };

  const handleRemoveStaff = (email, name) => {
    const isConfirmed = window.confirm(`Remove ${name} from the system?`);
    if (!isConfirmed) {
      return;
    }
    setStaffManagementRows((prevRows) => prevRows.filter((row) => row.email !== email));
  };

  const handleRemoveCustomer = (email, name) => {
    const isConfirmed = window.confirm(`Remove customer ${name} from the system?`);
    if (!isConfirmed) {
      return;
    }
    setCustomerManagementRows((prevRows) => prevRows.filter((row) => row.email !== email));
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    window.alert('Profile saved successfully (UI only).');
    setActiveTab(previousTab);
  };

  const openUserProfile = () => {
    if (activeTab !== 'User Profile') {
      setPreviousTab(activeTab);
    }
    setActiveTab('User Profile');
  };

  if (isLoggedOut) {
    return <LoginPage />;
  }

  if (activeTab === 'User Profile') {
    return (
      <div className="min-h-screen bg-white">
        <UserMenuBar onLogout={() => setIsLoggedOut(true)} onProfileClick={openUserProfile} />
        <main className="p-5">
          <section className="max-w-3xl mx-auto bg-white border border-[#48A111]/45 rounded-2xl p-6">
            <h1 className="text-[24px] font-extrabold text-black">User Profile</h1>
            <p className="mt-2 text-black text-[14px]">View and update your profile details.</p>

            <form className="mt-6 space-y-4" onSubmit={handleProfileSave}>
              <div className="flex items-center gap-4">
                <img
                  src={profileForm.photo}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border border-[#48A111]/35"
                />
                <label className="text-sm font-bold text-black">
                  Profile Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-1 block text-sm text-black"
                    onChange={(e) => {
                      const selectedFile = e.target.files && e.target.files[0];
                      if (!selectedFile) return;
                      const previewUrl = URL.createObjectURL(selectedFile);
                      setProfileForm((prev) => ({ ...prev, photo: previewUrl }));
                    }}
                  />
                </label>
              </div>

              <div>
                <label className="text-sm font-bold text-black" htmlFor="profileName">
                  Name
                </label>
                <input
                  id="profileName"
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-[#48A111]/40 bg-white px-3 py-2 text-black text-sm outline-none focus:border-[#48A111]"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-black" htmlFor="profilePhone">
                  Phone Number
                </label>
                <input
                  id="profilePhone"
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-[#48A111]/40 bg-white px-3 py-2 text-black text-sm outline-none focus:border-[#48A111]"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-black" htmlFor="profileEmail">
                  Email
                </label>
                <input
                  id="profileEmail"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-[#48A111]/40 bg-white px-3 py-2 text-black text-sm outline-none focus:border-[#48A111]"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#48A111] text-white text-sm font-bold transition-all duration-300 hover:bg-[#3d8e0c]"
              >
                Save Profile
              </button>
            </form>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <UserMenuBar onLogout={() => setIsLoggedOut(true)} onProfileClick={openUserProfile} />

      <main className="p-5">
        <div className="grid grid-cols-[300px_1fr] gap-5 min-h-[calc(100vh-104px)]">
          <AdminSidebar activeTab={activeTab} onTabClick={setActiveTab} />

          <section className="bg-white border border-[#48A111]/45 rounded-2xl p-5 min-h-full transition-all duration-300 hover:shadow-xl hover:border-[#48A111]/80">
            <h1 className="text-[24px] font-extrabold text-black">{activeTab}</h1>
            <p className="mt-2 text-black text-[14px]">
              {activeTab === 'Dashboard'
                ? 'Overview of current user system activity.'
                : activeTab === 'User Registration'
                  ? 'Dummy data list of registrations awaiting admin review.'
                  : activeTab === 'Staff Management'
                    ? 'Manage staff roles and remove staff users from the system.'
                    : activeTab === 'Customer Management'
                      ? 'Search customers and remove customer accounts.'
                  : 'This section is UI-only for now.'}
            </p>

            {activeTab === 'Dashboard' ? (
              <div className="mt-6 grid grid-cols-[1.2fr_1fr] gap-5">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="rounded-xl border border-[#48A111]/45 p-4 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 hover:border-[#48A111] hover:bg-[#48A111]/10">
                    <div className="text-sm text-black/70">Customers</div>
                    <div className="mt-2 text-4xl font-extrabold text-black">3,782</div>
                    <div className="mt-2 inline-block rounded-full bg-[#48A111]/35 px-3 py-1 text-xs font-bold text-black transition-all duration-300 hover:bg-[#48A111]/65 hover:scale-105">
                      +11.01%
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#48A111]/45 p-4 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 hover:border-[#48A111] hover:bg-[#48A111]/10">
                    <div className="text-sm text-black/70">Orders</div>
                    <div className="mt-2 text-4xl font-extrabold text-black">5,359</div>
                    <div className="mt-2 inline-block rounded-full bg-[#48A111]/20 px-3 py-1 text-xs font-bold text-black transition-all duration-300 hover:bg-[#48A111]/45 hover:scale-105">
                      -9.05%
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#48A111]/45 p-4 bg-white transition-all duration-300 hover:shadow-xl hover:border-[#48A111] hover:-translate-y-1">
                  <h2 className="text-xl font-extrabold text-black">Monthly Sales</h2>
                  <div className="mt-4 h-[210px] rounded-lg border border-[#48A111]/35 px-3 py-3">
                    <div className="h-[160px] flex items-end gap-2">
                      {salesHeights.map((height, index) => (
                        <div key={months[index]} className="flex-1 flex flex-col items-center justify-end gap-2">
                          <div
                            className={
                              height > 0
                                ? 'w-full max-w-[22px] rounded-t-md bg-[#48A111] transition-all duration-300 hover:bg-[#2f7a08] hover:scale-105'
                                : 'w-full max-w-[22px]'
                            }
                            style={{ height: `${height}px` }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 grid grid-cols-12 gap-2 text-[11px] font-semibold text-black/70">
                      {months.map((month) => (
                        <div key={month} className="text-center">
                          {month}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#48A111]/45 p-4 bg-white h-fit transition-all duration-300 hover:shadow-xl hover:border-[#48A111] hover:-translate-y-1">
                <h2 className="text-xl font-extrabold text-black">Monthly Target</h2>
                <p className="mt-1 text-sm text-black/70">Target you have set for each month</p>

                <div className="mt-6 flex justify-center">
                  <div className="w-[220px] h-[120px] rounded-t-full border-[14px] border-[#48A111]/35 border-b-0 relative">
                    <div className="absolute top-[-14px] left-[-14px] w-[220px] h-[120px] rounded-t-full border-[14px] border-[#48A111] border-b-0 border-r-transparent" />
                  </div>
                </div>

                <div className="text-center -mt-4">
                  <div className="text-5xl font-extrabold text-black">75.55%</div>
                  <div className="mt-2 inline-block rounded-full bg-[#48A111]/35 px-3 py-1 text-xs font-bold text-black transition-all duration-300 hover:bg-[#48A111]/65 hover:scale-105">
                    +10%
                  </div>
                </div>

                <p className="mt-5 text-center text-sm text-black/70">
                  You earn $3287 today, it's higher than last month.
                  <br />
                  Keep up your good work!
                </p>

                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg border border-[#48A111]/35 p-2 transition-all duration-300 hover:bg-[#48A111]/20 hover:-translate-y-1 hover:shadow-lg hover:border-[#48A111]/70">
                    <div className="text-xs text-black/70">Target</div>
                    <div className="text-xl font-extrabold text-black">$20K</div>
                  </div>
                  <div className="rounded-lg border border-[#48A111]/35 p-2 transition-all duration-300 hover:bg-[#48A111]/20 hover:-translate-y-1 hover:shadow-lg hover:border-[#48A111]/70">
                    <div className="text-xs text-black/70">Revenue</div>
                    <div className="text-xl font-extrabold text-black">$20K</div>
                  </div>
                  <div className="rounded-lg border border-[#48A111]/35 p-2 transition-all duration-300 hover:bg-[#48A111]/20 hover:-translate-y-1 hover:shadow-lg hover:border-[#48A111]/70">
                    <div className="text-xs text-black/70">Today</div>
                    <div className="text-xl font-extrabold text-black">$20K</div>
                  </div>
                </div>
              </div>
              </div>
            ) : null}

            {activeTab === 'User Registration' ? (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full border-collapse rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-[#48A111]/20">
                      <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Name</th>
                      <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Email</th>
                      <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Student ID</th>
                      <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Phone</th>
                      <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Role</th>
                      <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">ID Photo</th>
                      <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Status</th>
                      <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrationRows.map((row) => (
                      <tr key={row.studentId} className="hover:bg-[#48A111]/10">
                        <td className="p-3 text-sm text-black border border-[#48A111]/25">{row.name}</td>
                        <td className="p-3 text-sm text-black border border-[#48A111]/25">{row.email}</td>
                        <td className="p-3 text-sm text-black border border-[#48A111]/25">{row.studentId}</td>
                        <td className="p-3 text-sm text-black border border-[#48A111]/25">{row.phone}</td>
                        <td className="p-3 text-sm text-black border border-[#48A111]/25">{row.role}</td>
                        <td className="p-3 border border-[#48A111]/25">
                          <div className="w-16 h-16">
                            <img
                              src={row.photo}
                              alt={`${row.name} student id`}
                              className="w-16 h-16 rounded-lg object-cover border border-[#48A111]/35 transition-transform duration-200 hover:scale-[3.2] hover:z-20 relative cursor-zoom-in"
                            />
                          </div>
                        </td>
                        <td className="p-3 text-sm font-semibold text-black border border-[#48A111]/25">{row.status}</td>
                        <td className="p-3 border border-[#48A111]/25">
                          <div className="flex gap-2">
                            <button type="button" className="px-3 py-1.5 rounded-lg bg-[#48A111] text-white text-xs font-bold">
                              Approve
                            </button>
                            <button type="button" className="px-3 py-1.5 rounded-lg border border-black/40 text-black text-xs font-bold">
                              Decline
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {activeTab === 'Role Management' ? (
              <div className="mt-6 space-y-6">
                <div className="overflow-x-auto">
                  <h3 className="mb-2 text-lg font-extrabold text-black">Customers</h3>
                  <table className="w-full border-collapse rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-[#48A111]/20">
                        <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Name</th>
                        <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Email</th>
                        <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Current Role</th>
                        <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Assign Role</th>
                        <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Status</th>
                        <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerRoleRows.map((row) => (
                        <tr key={row.email} className="hover:bg-[#48A111]/10">
                          <td className="p-3 text-sm text-black border border-[#48A111]/25">{row.name}</td>
                          <td className="p-3 text-sm text-black border border-[#48A111]/25">{row.email}</td>
                          <td className="p-3 text-sm text-black border border-[#48A111]/25">{row.currentRole}</td>
                          <td className="p-3 text-sm border border-[#48A111]/25">
                            <select
                              defaultValue={row.assignRole}
                              className="w-full rounded-lg border border-[#48A111]/40 bg-white px-3 py-1.5 text-black text-sm outline-none"
                            >
                              <option>Customer</option>
                              <option>Delivery Manager</option>
                              <option>Order Manager</option>
                              <option>Food Menu Manager</option>
                            </select>
                          </td>
                          <td className="p-3 text-sm font-semibold text-black border border-[#48A111]/25">{row.status}</td>
                          <td className="p-3 border border-[#48A111]/25">
                            <button type="button" className="px-3 py-1.5 rounded-lg bg-[#48A111] text-white text-xs font-bold">
                              Save Role
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto">
                  <h3 className="mb-2 text-lg font-extrabold text-black">Staff</h3>
                  <table className="w-full border-collapse rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-[#48A111]/20">
                        <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Name</th>
                        <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Email</th>
                        <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Current Role</th>
                        <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Assign Role</th>
                        <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Status</th>
                        <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffRoleRows.map((row) => (
                        <tr key={row.email} className="hover:bg-[#48A111]/10">
                          <td className="p-3 text-sm text-black border border-[#48A111]/25">{row.name}</td>
                          <td className="p-3 text-sm text-black border border-[#48A111]/25">{row.email}</td>
                          <td className="p-3 text-sm text-black border border-[#48A111]/25">{row.currentRole}</td>
                          <td className="p-3 text-sm border border-[#48A111]/25">
                            <select
                              defaultValue={row.assignRole}
                              className="w-full rounded-lg border border-[#48A111]/40 bg-white px-3 py-1.5 text-black text-sm outline-none"
                            >
                              <option>Delivery Manager</option>
                              <option>Order Manager</option>
                              <option>Food Menu Manager</option>
                              <option>Customer</option>
                            </select>
                          </td>
                          <td className="p-3 text-sm font-semibold text-black border border-[#48A111]/25">{row.status}</td>
                          <td className="p-3 border border-[#48A111]/25">
                            <button type="button" className="px-3 py-1.5 rounded-lg bg-[#48A111] text-white text-xs font-bold">
                              Save Role
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {activeTab === 'Staff Management' ? (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full border-collapse rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-[#48A111]/20">
                      <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Name</th>
                      <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Email</th>
                      <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Current Role</th>
                      <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Assign New Role</th>
                      <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Status</th>
                      <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffManagementRows.map((row) => (
                      <tr key={row.email} className="hover:bg-[#48A111]/10">
                        <td className="p-3 text-sm text-black border border-[#48A111]/25">{row.name}</td>
                        <td className="p-3 text-sm text-black border border-[#48A111]/25">{row.email}</td>
                        <td className="p-3 text-sm text-black border border-[#48A111]/25">{row.currentRole}</td>
                        <td className="p-3 text-sm border border-[#48A111]/25">
                          <select
                            value={row.assignRole}
                            onChange={(e) => handleStaffRoleChange(row.email, e.target.value)}
                            className="w-full rounded-lg border border-[#48A111]/40 bg-white px-3 py-1.5 text-black text-sm outline-none"
                          >
                            <option>Delivery Manager</option>
                            <option>Order Manager</option>
                            <option>Food Menu Manager</option>
                          </select>
                        </td>
                        <td className="p-3 text-sm font-semibold text-black border border-[#48A111]/25">{row.status}</td>
                        <td className="p-3 border border-[#48A111]/25">
                          <div className="flex gap-2">
                            <button type="button" className="px-3 py-1.5 rounded-lg bg-[#48A111] text-white text-xs font-bold">
                              Save Role
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveStaff(row.email, row.name)}
                              className="px-3 py-1.5 rounded-lg border border-black/40 text-black text-xs font-bold hover:bg-black/5"
                            >
                              Remove User
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {staffManagementRows.length === 0 ? (
                  <div className="mt-3 rounded-lg border border-dashed border-[#48A111]/50 bg-[#48A111]/10 p-3 text-sm text-black">
                    No staff users available.
                  </div>
                ) : null}
              </div>
            ) : null}

            {activeTab === 'Customer Management' ? (
              <div className="mt-6">
                <div className="mb-4">
                  <input
                    type="text"
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                    placeholder="Search by customer name or email"
                    className="w-full max-w-md rounded-lg border border-[#48A111]/40 bg-white px-3 py-2 text-black text-sm outline-none focus:border-[#48A111]"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-[#48A111]/20">
                        <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Name</th>
                        <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Email</th>
                        <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Current Role</th>
                        <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Status</th>
                        <th className="text-left p-3 text-sm font-bold text-black border border-[#48A111]/35">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomerRows.map((row) => (
                        <tr key={row.email} className="hover:bg-[#48A111]/10">
                          <td className="p-3 text-sm text-black border border-[#48A111]/25">{row.name}</td>
                          <td className="p-3 text-sm text-black border border-[#48A111]/25">{row.email}</td>
                          <td className="p-3 text-sm text-black border border-[#48A111]/25">{row.currentRole}</td>
                          <td className="p-3 text-sm font-semibold text-black border border-[#48A111]/25">{row.status}</td>
                          <td className="p-3 border border-[#48A111]/25">
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomer(row.email, row.name)}
                              className="px-3 py-1.5 rounded-lg border border-black/40 text-black text-xs font-bold hover:bg-black/5"
                            >
                              Remove Customer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredCustomerRows.length === 0 ? (
                  <div className="mt-3 rounded-lg border border-dashed border-[#48A111]/50 bg-[#48A111]/10 p-3 text-sm text-black">
                    No customers found.
                  </div>
                ) : null}
              </div>
            ) : null}

            {activeTab !== 'Dashboard' &&
            activeTab !== 'User Registration' &&
            activeTab !== 'Role Management' &&
            activeTab !== 'Staff Management' &&
            activeTab !== 'Customer Management' ? (
              <div className="mt-6 rounded-xl border border-dashed border-[#48A111]/60 bg-[#48A111]/10 p-4 text-black text-sm">
                Dummy content for <b>{activeTab}</b> will be added later.
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;