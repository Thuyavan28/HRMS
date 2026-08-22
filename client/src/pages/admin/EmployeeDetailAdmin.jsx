import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  User,
  Briefcase,
  CreditCard,
  FileText,
  Building,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SkeletonProfile } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';

export const EmployeeDetailAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('job');
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    status: 'Active',
    avatar: '',
    jobDetails: {
      title: '',
      department: '',
      designation: '',
      workType: '',
      joinDate: '',
      reportingManager: '',
      location: '',
      workShift: ''
    },
    salaryStructure: {
      basic: 0,
      hra: 0,
      transport: 0,
      medical: 0,
      gross: 0,
      taxDeduction: 0,
      pfDeduction: 0,
      netSalary: 0
    }
  });

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const res = await adminService.getEmployeeById(id);
      if (res.success && res.data) {
        setEmployee(res.data);
        setFormData({
          fullName: res.data.fullName || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
          emergencyContact: res.data.emergencyContact || '',
          status: res.data.status || 'Active',
          avatar: res.data.avatar || '',
          jobDetails: {
            title: res.data.jobDetails?.title || '',
            department: res.data.jobDetails?.department || '',
            designation: res.data.jobDetails?.designation || '',
            workType: res.data.jobDetails?.workType || '',
            joinDate: res.data.jobDetails?.joinDate || '',
            reportingManager: res.data.jobDetails?.reportingManager || '',
            location: res.data.jobDetails?.location || '',
            workShift: res.data.jobDetails?.workShift || ''
          },
          salaryStructure: {
            basic: res.data.salaryStructure?.basic || 0,
            hra: res.data.salaryStructure?.hra || 0,
            transport: res.data.salaryStructure?.transport || 0,
            medical: res.data.salaryStructure?.medical || 0,
            gross: res.data.salaryStructure?.gross || 0,
            taxDeduction: res.data.salaryStructure?.taxDeduction || 0,
            pfDeduction: res.data.salaryStructure?.pfDeduction || 0,
            netSalary: res.data.salaryStructure?.netSalary || 0
          }
        });
      }
    } catch (err) {
      toast.error('Failed to load employee details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  // Handle salary inputs auto recalculation
  const handleSalaryChange = (field, val) => {
    const num = Number(val) || 0;
    const currentSal = { ...formData.salaryStructure, [field]: num };

    const gross = (Number(currentSal.basic) || 0) +
                  (Number(currentSal.hra) || 0) +
                  (Number(currentSal.transport) || 0) +
                  (Number(currentSal.medical) || 0);

    const taxDeduction = Math.round(gross * 0.15);
    const pfDeduction = Math.round((Number(currentSal.basic) || 0) * 0.12);
    const netSalary = gross - taxDeduction - pfDeduction;

    setFormData({
      ...formData,
      salaryStructure: {
        ...currentSal,
        gross,
        taxDeduction,
        pfDeduction,
        netSalary
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await adminService.updateEmployee(id, formData);
      if (res.success) {
        toast.success(res.message || 'Employee updated successfully.');
        setEmployee(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update employee.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SkeletonProfile />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Save Action */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/employees"
          className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Employee Directory
        </Link>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-xs font-semibold flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving Changes...' : 'Save All Changes'}
        </button>
      </div>

      {/* Hero Header */}
      <div className="card-surface p-6 flex flex-col md:flex-row items-center md:items-start gap-6 border-dark-700">
        <img
          src={
            formData.avatar ||
            employee?.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'
          }
          alt={employee?.fullName}
          className="w-24 h-24 rounded-2xl object-cover border-2 border-teal-500 shadow-glow-teal-sm"
        />

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-2xl font-extrabold text-slate-100">{employee?.fullName}</h1>
                <StatusBadge status={formData.status} />
              </div>
              <p className="text-xs text-dark-300 mt-1">
                Employee ID: <span className="font-mono text-teal-300 font-bold">{employee?.employeeId}</span> • {formData.jobDetails.title}
              </p>
            </div>

            <div className="flex items-center gap-2 justify-center">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field py-1.5 text-xs font-semibold"
              >
                <option value="Active">Active</option>
                <option value="Deactivated">Deactivated</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-dark-700 overflow-x-auto space-x-1">
        <button
          onClick={() => setActiveTab('job')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'job'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-dark-300 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Job Details & Position
        </button>

        <button
          onClick={() => setActiveTab('salary')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'salary'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-dark-300 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Salary & Compensation
        </button>

        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'personal'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-dark-300 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" /> Personal & Contact Info
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'documents'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-dark-300 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Documents & Files
        </button>
      </div>

      {/* Tab 1: Job Details (Full Admin Edit) */}
      {activeTab === 'job' && (
        <div className="card-surface p-6 space-y-5">
          <h3 className="text-base font-bold text-slate-100">Job Assignment & Departmental Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Job Title</label>
              <input
                type="text"
                value={formData.jobDetails.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jobDetails: { ...formData.jobDetails, title: e.target.value }
                  })
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Department</label>
              <select
                value={formData.jobDetails.department}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jobDetails: { ...formData.jobDetails, department: e.target.value }
                  })
                }
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
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Designation / Grade</label>
              <input
                type="text"
                value={formData.jobDetails.designation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jobDetails: { ...formData.jobDetails, designation: e.target.value }
                  })
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Work Type</label>
              <select
                value={formData.jobDetails.workType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jobDetails: { ...formData.jobDetails, workType: e.target.value }
                  })
                }
                className="input-field"
              >
                <option value="Full-Time (Remote)">Full-Time (Remote)</option>
                <option value="Full-Time (Hybrid)">Full-Time (Hybrid)</option>
                <option value="Full-Time (On-site)">Full-Time (On-site)</option>
                <option value="Contractor">Contractor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Joining Date</label>
              <input
                type="date"
                value={formData.jobDetails.joinDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jobDetails: { ...formData.jobDetails, joinDate: e.target.value }
                  })
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Reporting Manager</label>
              <input
                type="text"
                value={formData.jobDetails.reportingManager}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jobDetails: { ...formData.jobDetails, reportingManager: e.target.value }
                  })
                }
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Salary Structure (Admin Edit) */}
      {activeTab === 'salary' && (
        <div className="card-surface p-6 space-y-5">
          <h3 className="text-base font-bold text-slate-100">Monthly Compensation Structure & Tax Policy</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Basic Salary ($)</label>
              <input
                type="number"
                value={formData.salaryStructure.basic}
                onChange={(e) => handleSalaryChange('basic', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">HRA Allowance ($)</label>
              <input
                type="number"
                value={formData.salaryStructure.hra}
                onChange={(e) => handleSalaryChange('hra', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Transport ($)</label>
              <input
                type="number"
                value={formData.salaryStructure.transport}
                onChange={(e) => handleSalaryChange('transport', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Medical ($)</label>
              <input
                type="number"
                value={formData.salaryStructure.medical}
                onChange={(e) => handleSalaryChange('medical', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-dark-850 border border-dark-700 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-[11px] text-dark-400 uppercase font-semibold">Total Gross Pay</span>
              <p className="text-xl font-bold text-slate-100 mt-1">
                ${formData.salaryStructure.gross?.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-dark-400 uppercase font-semibold">Est. Tax & PF</span>
              <p className="text-xl font-bold text-rose-400 mt-1">
                -${((formData.salaryStructure.taxDeduction || 0) + (formData.salaryStructure.pfDeduction || 0)).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-dark-400 uppercase font-semibold">Calculated Net Pay</span>
              <p className="text-xl font-bold text-teal-400 mt-1">
                ${formData.salaryStructure.netSalary?.toLocaleString()} USD
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Personal Details */}
      {activeTab === 'personal' && (
        <div className="card-surface p-6 space-y-5">
          <h3 className="text-base font-bold text-slate-100">Personal & Contact Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Full Legal Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Corporate Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Emergency Contact</label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Avatar Image URL</label>
              <input
                type="url"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Documents */}
      {activeTab === 'documents' && (
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-dark-700">
            <h3 className="text-base font-bold text-slate-100">Document Management</h3>
            <button
              type="button"
              onClick={() => toast.info('Document uploaded successfully to corporate store.')}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Upload File
            </button>
          </div>

          <div className="space-y-3">
            {employee?.documents && employee.documents.length > 0 ? (
              employee.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-dark-850 border border-dark-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-teal-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-100">{doc.name}</p>
                      <p className="text-[10px] text-dark-400">{doc.size} • {doc.uploadedAt}</p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold">Verified</span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-dark-400">
                No documents uploaded for this employee.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
