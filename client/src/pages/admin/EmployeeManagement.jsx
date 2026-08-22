import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Power,
  CheckCircle,
  Building,
  Mail,
  Phone
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';

export const EmployeeManagement = () => {
  const toast = useToast();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    department: 'Engineering',
    title: 'Senior Software Engineer',
    designation: 'Senior IC',
    workType: 'Full-Time (Remote)',
    basicSalary: 6500,
    role: 'employee'
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await adminService.getEmployees();
      if (res.success && res.data) {
        setEmployees(res.data.employees || []);
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
      setSubmitting(true);
      const res = await adminService.createEmployee(formData);
      if (res.success) {
        toast.success(res.message || 'Employee created successfully.');
        setIsAddModalOpen(false);
        setFormData({
          fullName: '',
          employeeId: '',
          email: '',
          department: 'Engineering',
          title: 'Senior Software Engineer',
          designation: 'Senior IC',
          workType: 'Full-Time (Remote)',
          basicSalary: 6500,
          role: 'employee'
        });
        fetchEmployees();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create employee.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (employeeId, name, currentStatus) => {
    const action = currentStatus === 'Active' ? 'deactivate' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${action} ${name}?`)) return;

    try {
      const res = await adminService.toggleEmployeeStatus(employeeId);
      if (res.success) {
        toast.success(res.message);
        fetchEmployees();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update employee status.');
    }
  };

  const columns = [
    {
      header: 'Employee Name & Email',
      key: 'fullName',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <img
            src={
              row.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'
            }
            alt={val}
            className="w-8 h-8 rounded-full object-cover border border-teal-500/40"
          />
          <div>
            <Link
              to={`/admin/employees/${row.employeeId || row.id}`}
              className="font-bold text-slate-100 hover:text-teal-400 block transition-colors"
            >
              {val}
            </Link>
            <span className="text-[11px] text-dark-300">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Employee ID',
      key: 'employeeId',
      render: (val) => <span className="font-mono text-xs text-dark-300 font-semibold">{val}</span>
    },
    {
      header: 'Department',
      key: 'jobDetails',
      render: (val) => <span className="text-slate-200">{val?.department || 'General'}</span>
    },
    {
      header: 'Designation / Role',
      key: 'jobDetails',
      render: (val) => <span className="text-dark-300 text-xs">{val?.title || 'Staff'}</span>
    },
    {
      header: 'Work Mode',
      key: 'jobDetails',
      render: (val) => <StatusBadge status={val?.workType || 'Full-Time'} />
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
            to={`/admin/employees/${row.employeeId || row.id}`}
            className="p-1.5 rounded-lg bg-dark-750 hover:bg-dark-700 text-teal-400 border border-dark-600 transition-colors"
            title="Edit Full Profile"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => handleToggleStatus(row.employeeId || row.id, row.fullName, row.status)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              row.status === 'Active'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
            }`}
            title={row.status === 'Active' ? 'Deactivate Employee' : 'Reactivate Employee'}
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header */}
      <div className="card-surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-dark-700">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Employee Directory & Workforce Management
          </h1>
          <p className="text-xs text-dark-300 mt-1">
            Search, manage contracts, job grades, compensation structures, and statuses
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary text-xs font-semibold flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add New Employee
        </button>
      </div>

      {/* 2. Employee Data Table */}
      {loading ? (
        <SkeletonTable rows={8} cols={7} />
      ) : (
        <DataTable
          title="All Company Employees"
          subtitle="Showing active, hybrid, and remote staff records"
          columns={columns}
          data={employees}
          filterKey="status"
          filterOptions={[
            { label: 'Active', value: 'Active' },
            { label: 'Deactivated', value: 'Deactivated' }
          ]}
          pageSize={10}
        />
      )}

      {/* 3. Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard New Employee"
        subtitle="Create workspace account, configure job role, and initialize salary structure"
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
              disabled={submitting}
              className="btn-primary text-xs font-semibold flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              {submitting ? 'Creating Profile...' : 'Save & Onboard'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="input-field"
                placeholder="e.g. Rachel Adams"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Employee ID
              </label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="input-field"
                placeholder="EMP-1300"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-300 mb-1.5">
              Work Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              placeholder="rachel.adams@dayflow.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                <option value="Finance & Ops">Finance & Ops</option>
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
                placeholder="e.g. Backend Lead"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Work Type
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
                Monthly Base Salary ($)
              </label>
              <input
                type="number"
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                className="input-field"
                min="1000"
                required
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
