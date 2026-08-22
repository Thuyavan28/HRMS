import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Mail,
  Phone,
  Shield,
  Briefcase,
  KeyRound,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Lock,
  Sparkles
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';

export const EmployeeManagement = () => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('employees'); // 'employees' | 'invitations'
  const [employees, setEmployees] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Employee Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    email: '',
    phone: '',
    role: 'employee', // HR/Admin assigns role here
    department: 'Engineering',
    title: 'Frontend Engineer',
    designation: 'Senior IC',
    workType: 'Full-Time (Remote)',
    basicSalary: 6500
  });

  // Generated Invitation Success Dialog
  const [generatedInvite, setGeneratedInvite] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const [empRes, invRes] = await Promise.all([
        adminService.getEmployees(),
        adminService.getInvitations()
      ]);

      if (empRes.success && empRes.data) {
        setEmployees(empRes.data.employees || []);
      }
      if (invRes.success && invRes.data) {
        setInvitations(invRes.data.invitations || []);
      }
    } catch (err) {
      toast.error('Failed to load employee directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await adminService.createEmployee(formData);
      if (res.success && res.data) {
        toast.success(res.message || 'Employee created & invitation generated.');
        setIsAddModalOpen(false);
        setGeneratedInvite(res.data);
        fetchEmployees();
        // Reset form
        setFormData({
          fullName: '',
          employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
          email: '',
          phone: '',
          role: 'employee',
          department: 'Engineering',
          title: 'Frontend Engineer',
          designation: 'Senior IC',
          workType: 'Full-Time (Remote)',
          basicSalary: 6500
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create employee.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (empId, currentStatus) => {
    try {
      const res = await adminService.toggleEmployeeStatus(empId);
      if (res.success) {
        toast.success(res.message);
        fetchEmployees();
      }
    } catch (err) {
      toast.error('Failed to update employee status.');
    }
  };

  const handleResendInvitation = async (invId) => {
    try {
      const res = await adminService.resendInvitation(invId);
      if (res.success && res.data) {
        toast.success('New invitation token generated!');
        setGeneratedInvite(res.data);
        fetchEmployees();
      }
    } catch (err) {
      toast.error('Failed to resend invitation.');
    }
  };

  const handleRevokeInvitation = async (invId) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) return;
    try {
      const res = await adminService.revokeInvitation(invId);
      if (res.success) {
        toast.success('Invitation revoked.');
        fetchEmployees();
      }
    } catch (err) {
      toast.error('Failed to revoke invitation.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Activation link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Employees Table Columns
  const employeeColumns = [
    {
      header: 'Employee Details',
      key: 'fullName',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'}
            alt={val}
            className="w-9 h-9 rounded-full object-cover border border-dark-600"
          />
          <div>
            <Link
              to={`/admin/employees/${row.employeeId}`}
              className="font-bold text-slate-100 hover:text-teal-400 transition-colors block"
            >
              {val}
            </Link>
            <span className="text-[11px] text-dark-300 font-mono">ID: {row.employeeId}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Department & Role',
      key: 'jobDetails',
      render: (val) => (
        <div>
          <span className="text-slate-200 block text-xs">{val?.department || 'General'}</span>
          <span className="text-[11px] text-dark-400">{val?.title || 'Staff'}</span>
        </div>
      )
    },
    {
      header: 'Work Mode',
      key: 'jobDetails.workType',
      render: (_, row) => (
        <span className="text-xs text-dark-300">{row.jobDetails?.workType || 'Full-Time'}</span>
      )
    },
    {
      header: 'Work Email',
      key: 'email',
      render: (val) => (
        <span className="text-xs font-mono text-dark-300">{val}</span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      header: 'Actions',
      key: 'id',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/employees/${row.employeeId}`}
            className="px-2.5 py-1 rounded-lg bg-dark-750 hover:bg-dark-700 text-teal-400 border border-dark-600 text-xs font-semibold"
          >
            Edit Profile
          </Link>
          <button
            onClick={() => handleToggleStatus(row.employeeId, row.status)}
            className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
              row.status === 'Active'
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
            }`}
            title={row.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
          >
            {row.status === 'Active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
          </button>
        </div>
      )
    }
  ];

  // Invitations Table Columns
  const invitationColumns = [
    {
      header: 'Target Employee',
      key: 'fullName',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-100 block">{val}</span>
          <span className="text-[10px] text-dark-300 font-mono">ID: {row.employeeId}</span>
        </div>
      )
    },
    {
      header: 'Invited Email',
      key: 'email',
      render: (val) => <span className="font-mono text-xs text-slate-200">{val}</span>
    },
    {
      header: 'Assigned Role',
      key: 'role',
      render: (val) => (
        <span className="px-2 py-0.5 rounded-md bg-dark-750 border border-dark-600 text-teal-300 font-mono text-[11px] uppercase font-bold flex items-center gap-1 w-fit">
          <Lock className="w-3 h-3 text-amber-400" />
          {val}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      header: 'Expires At',
      key: 'expiresAt',
      render: (val) => (
        <span className="text-dark-400 text-xs font-mono">
          {new Date(val).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'id',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.status === 'INVITED' && (
            <>
              <button
                onClick={() => {
                  const clientUrl = window.location.origin;
                  copyToClipboard(`${clientUrl}/activate?token=${row.token}`);
                }}
                className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Copy Activation Link"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </button>
              <button
                onClick={() => handleResendInvitation(row.id)}
                className="p-1.5 rounded-lg bg-dark-750 hover:bg-dark-700 text-slate-300 border border-dark-600 cursor-pointer"
                title="Refresh & Resend Invitation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleRevokeInvitation(row.id)}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer"
                title="Revoke Invitation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header with Tab Switches & Add Button */}
      <div className="card-surface p-6 border-dark-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Employee Directory & Onboarding
          </h1>
          <p className="text-xs text-dark-300 mt-1">
            Manage corporate staff records, assign authoritative roles, and dispatch onboarding invitations
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="flex items-center bg-dark-850 p-1 rounded-xl border border-dark-700">
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'employees'
                  ? 'bg-teal-500 text-white shadow-glow-teal-sm'
                  : 'text-dark-300 hover:text-slate-200'
              }`}
            >
              All Employees ({employees.length})
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'invitations'
                  ? 'bg-teal-500 text-white shadow-glow-teal-sm'
                  : 'text-dark-300 hover:text-slate-200'
              }`}
            >
              Invitations ({invitations.length})
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-glow-teal-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* 2. Main Tables */}
      {loading ? (
        <SkeletonTable rows={8} cols={6} />
      ) : activeTab === 'employees' ? (
        <DataTable
          title="Active Workforce Register"
          subtitle="Showing all registered organization personnel"
          columns={employeeColumns}
          data={employees}
          filterKey="department"
          filterOptions={[
            { label: 'Engineering', value: 'Engineering' },
            { label: 'Design & UX', value: 'Design & UX' },
            { label: 'Product', value: 'Product' },
            { label: 'Human Resources', value: 'Human Resources' },
            { label: 'Infrastructure', value: 'Infrastructure' }
          ]}
          pageSize={10}
        />
      ) : (
        <DataTable
          title="Invitation & Onboarding Ledger"
          subtitle="Cryptographic single-use activation invitations generated by HR"
          columns={invitationColumns}
          data={invitations}
          filterKey="status"
          filterOptions={[
            { label: 'Invited / Pending', value: 'INVITED' },
            { label: 'Accepted', value: 'ACCEPTED' },
            { label: 'Expired', value: 'EXPIRED' }
          ]}
          pageSize={10}
        />
      )}

      {/* 3. Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee & Generate Invitation"
        subtitle="The organization assigns the employee role; an invitation token will be generated."
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateEmployee}
              disabled={creating}
              className="btn-primary text-xs font-semibold flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>{creating ? 'Generating Invitation...' : 'Create Employee & Send Invitation'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Arun Kumar"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Employee ID (System Auto-assigned)
              </label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="input-field font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Work Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="arun.kumar@dayflow.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="input-field"
              />
            </div>

            {/* AUTHORITATIVE ROLE SELECTION (HR/ADMIN ASSIGNMENT ONLY) */}
            <div className="sm:col-span-2 p-3.5 rounded-xl bg-dark-850 border border-teal-500/30">
              <label className="block text-xs font-bold text-teal-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Assigned Account Role (Organization Controlled)
              </label>
              <p className="text-[11px] text-dark-400 mb-2">
                This role is cryptographically tied to the invitation. The employee cannot change this role during activation.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    formData.role === 'employee'
                      ? 'bg-teal-500/15 border-teal-500 text-teal-200 shadow-glow-teal-sm'
                      : 'bg-dark-750 border-dark-600 text-dark-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="employee"
                    checked={formData.role === 'employee'}
                    onChange={() => setFormData({ ...formData, role: 'employee' })}
                    className="accent-teal-500"
                  />
                  <div>
                    <span className="font-bold text-xs block text-slate-100">Employee Role</span>
                    <span className="text-[10px] text-dark-400">Standard employee portal access</span>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    formData.role === 'admin'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-200'
                      : 'bg-dark-750 border-dark-600 text-dark-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={() => setFormData({ ...formData, role: 'admin' })}
                    className="accent-amber-500"
                  />
                  <div>
                    <span className="font-bold text-xs block text-slate-100">HR / Admin Role</span>
                    <span className="text-[10px] text-dark-400">Full HR management access</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="input-field"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design & UX">Design & UX</option>
                <option value="Product">Product</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Job Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Work Mode
              </label>
              <select
                value={formData.workType}
                onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                className="input-field"
              >
                <option value="Full-Time (Remote)">Full-Time (Remote)</option>
                <option value="Full-Time (Hybrid)">Full-Time (Hybrid)</option>
                <option value="Full-Time (On-site)">Full-Time (On-site)</option>
                <option value="Contractor">Contractor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Base Monthly Salary ($)
              </label>
              <input
                type="number"
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                className="input-field"
                required
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 4. Generated Invitation Success Modal & Email Simulation */}
      {generatedInvite && (
        <Modal
          isOpen={true}
          onClose={() => setGeneratedInvite(null)}
          title="Invitation Generated & Email Dispatched"
          subtitle="The employee record has been provisioned with fixed role & employee ID"
          footer={
            <div className="flex items-center justify-between w-full gap-3">
              <button
                type="button"
                onClick={() => {
                  const url = generatedInvite.activationUrl || `${window.location.origin}/signup?token=${generatedInvite.invitation?.token}`;
                  window.open(url, '_blank');
                }}
                className="btn-secondary text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Signup Link (Test Flow) →</span>
              </button>
              <button
                type="button"
                onClick={() => setGeneratedInvite(null)}
                className="btn-primary text-xs font-semibold px-6"
              >
                Done & Close
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-emerald-300 block">
                  Employee Provisioned & Role Locked in Database
                </span>
                <span className="text-dark-300">
                  Role: <strong className="text-teal-300 uppercase">{generatedInvite.invitation?.role || 'EMPLOYEE'}</strong> | Employee ID: <strong className="text-teal-300">{generatedInvite.employee?.employeeId || generatedInvite.invitation?.employeeId}</strong>.
                  These values are locked and will be auto-filled during signup.
                </span>
              </div>
            </div>

            {/* Simulated Email Envelope Preview */}
            <div className="p-4 rounded-xl bg-dark-850 border border-dark-700 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-dark-750">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-teal-400" /> Dispatched Email Notification
                </span>
                <span className="text-[10px] text-teal-400 font-mono">Delivered to Inbox</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <p className="text-dark-300">
                  <strong className="text-slate-200">To:</strong> {generatedInvite.employee?.email || generatedInvite.invitation?.email}
                </p>
                <p className="text-dark-300">
                  <strong className="text-slate-200">Subject:</strong> Welcome to Dayflow — Complete Your Employee Account Setup
                </p>
                <p className="text-dark-400 italic pt-1">
                  "Hello {generatedInvite.employee?.fullName}, you have been invited to Dayflow HRMS as an {generatedInvite.invitation?.role?.toUpperCase()}. Click the link below to verify your email, customize your name, and set your password."
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Activation Link (Single-Use, Valid for 7 Days)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedInvite.activationUrl || `${window.location.origin}/signup?token=${generatedInvite.invitation?.token}`}
                  className="input-field font-mono text-xs bg-dark-900 select-all"
                />
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      generatedInvite.activationUrl ||
                        `${window.location.origin}/signup?token=${generatedInvite.invitation?.token}`
                    )
                  }
                  className="btn-primary text-xs font-semibold px-4 py-2.5 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
