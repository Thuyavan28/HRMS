import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  CreditCard,
  FileText,
  Lock,
  Edit2,
  Save,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Download
} from 'lucide-react';
import { employeeService } from '../../services/employeeService';
import { SkeletonProfile } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const MyProfile = () => {
  const toast = useToast();
  const { refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    emergencyContact: '',
    avatar: ''
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await employeeService.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setFormData({
          fullName: res.data.fullName || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
          emergencyContact: res.data.emergencyContact || '',
          avatar: res.data.avatar || ''
        });
      }
    } catch (err) {
      toast.error('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await employeeService.updateProfile(formData);
      if (res.success) {
        toast.success(res.message || 'Profile updated successfully.');
        setProfile(res.data);
        setIsEditing(false);
        refreshUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SkeletonProfile />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Profile Hero Header */}
      <div className="card-surface p-6 flex flex-col md:flex-row items-center md:items-start gap-6 border-dark-700">
        <div className="relative group">
          <img
            src={
              formData.avatar ||
              profile?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'
            }
            alt={profile?.fullName}
            className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-teal-500 shadow-glow-teal-sm"
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-2xl font-extrabold text-slate-100">{profile?.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 text-xs font-semibold">
                  {profile?.status}
                </span>
              </div>
              <p className="text-xs text-dark-300 mt-1">
                {profile?.jobDetails?.title} • {profile?.jobDetails?.department}
              </p>
            </div>

            {activeTab === 'personal' && (
              <div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary text-xs flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-teal-400" /> Edit Personal Info
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-primary text-xs flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-dark-700/60 flex flex-wrap items-center justify-center md:justify-start gap-5 text-xs text-dark-300">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-teal-400" /> {profile?.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-sky-400" /> {profile?.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" /> {profile?.employeeId}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-dark-700 overflow-x-auto space-x-1">
        <button
          onClick={() => {
            setActiveTab('personal');
            setIsEditing(false);
          }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'personal'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-dark-300 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" /> Personal Details
        </button>

        <button
          onClick={() => {
            setActiveTab('job');
            setIsEditing(false);
          }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'job'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-dark-300 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Job Details
          <Lock className="w-3 h-3 text-dark-400" />
        </button>

        <button
          onClick={() => {
            setActiveTab('salary');
            setIsEditing(false);
          }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'salary'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-dark-300 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Salary Structure
          <Lock className="w-3 h-3 text-dark-400" />
        </button>

        <button
          onClick={() => {
            setActiveTab('documents');
            setIsEditing(false);
          }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'documents'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-dark-300 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Documents
          <Lock className="w-3 h-3 text-dark-400" />
        </button>
      </div>

      {/* 3. Tab Contents */}
      {/* TAB 1: Personal Details (Editable) */}
      {activeTab === 'personal' && (
        <div className="card-surface p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100">Personal Information</h3>
            <span className="text-xs text-dark-400">
              {isEditing ? 'Editing mode enabled' : 'Click "Edit Personal Info" to update'}
            </span>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`input-field ${!isEditing ? 'opacity-80 cursor-not-allowed bg-dark-850' : ''}`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5 flex items-center justify-between">
                <span>Work Email</span>
                <span className="text-[10px] text-dark-400 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Corporate Read-only
                </span>
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="input-field opacity-60 cursor-not-allowed bg-dark-850"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`input-field ${!isEditing ? 'opacity-80 cursor-not-allowed bg-dark-850' : ''}`}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Emergency Contact Details
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className={`input-field ${!isEditing ? 'opacity-80 cursor-not-allowed bg-dark-850' : ''}`}
                placeholder="Name & Contact (Relationship)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Residential Address
              </label>
              <textarea
                rows={2}
                disabled={!isEditing}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`input-field ${!isEditing ? 'opacity-80 cursor-not-allowed bg-dark-850' : ''}`}
                placeholder="Street address, city, state, postal code"
              />
            </div>

            {isEditing && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>
            )}
          </form>
        </div>
      )}

      {/* TAB 2: Job Details (Read-only with Lock icon) */}
      {activeTab === 'job' && (
        <div className="card-surface p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-dark-700">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Corporate Job & Role Details
              </h3>
              <p className="text-xs text-dark-300">Managed and maintained by HR Operations</p>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-750 text-dark-300 text-xs font-medium border border-dark-600">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Read-Only
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 rounded-xl bg-dark-850 border border-dark-700 relative">
              <Lock className="w-3.5 h-3.5 text-dark-400 absolute top-4 right-4" />
              <span className="text-[11px] text-dark-400 uppercase font-semibold">Job Title</span>
              <p className="text-sm font-bold text-slate-100 mt-1">{profile?.jobDetails?.title}</p>
            </div>

            <div className="p-4 rounded-xl bg-dark-850 border border-dark-700 relative">
              <Lock className="w-3.5 h-3.5 text-dark-400 absolute top-4 right-4" />
              <span className="text-[11px] text-dark-400 uppercase font-semibold">Department</span>
              <p className="text-sm font-bold text-slate-100 mt-1">{profile?.jobDetails?.department}</p>
            </div>

            <div className="p-4 rounded-xl bg-dark-850 border border-dark-700 relative">
              <Lock className="w-3.5 h-3.5 text-dark-400 absolute top-4 right-4" />
              <span className="text-[11px] text-dark-400 uppercase font-semibold">Designation / Grade</span>
              <p className="text-sm font-bold text-slate-100 mt-1">{profile?.jobDetails?.designation}</p>
            </div>

            <div className="p-4 rounded-xl bg-dark-850 border border-dark-700 relative">
              <Lock className="w-3.5 h-3.5 text-dark-400 absolute top-4 right-4" />
              <span className="text-[11px] text-dark-400 uppercase font-semibold">Work Engagement Type</span>
              <p className="text-sm font-bold text-teal-400 mt-1">{profile?.jobDetails?.workType}</p>
            </div>

            <div className="p-4 rounded-xl bg-dark-850 border border-dark-700 relative">
              <Lock className="w-3.5 h-3.5 text-dark-400 absolute top-4 right-4" />
              <span className="text-[11px] text-dark-400 uppercase font-semibold">Joining Date</span>
              <p className="text-sm font-bold text-slate-100 mt-1">{profile?.jobDetails?.joinDate}</p>
            </div>

            <div className="p-4 rounded-xl bg-dark-850 border border-dark-700 relative">
              <Lock className="w-3.5 h-3.5 text-dark-400 absolute top-4 right-4" />
              <span className="text-[11px] text-dark-400 uppercase font-semibold">Reporting Manager</span>
              <p className="text-sm font-bold text-slate-100 mt-1">{profile?.jobDetails?.reportingManager}</p>
            </div>

            <div className="p-4 rounded-xl bg-dark-850 border border-dark-700 relative">
              <Lock className="w-3.5 h-3.5 text-dark-400 absolute top-4 right-4" />
              <span className="text-[11px] text-dark-400 uppercase font-semibold">Assigned Shift Schedule</span>
              <p className="text-sm font-bold text-slate-100 mt-1">{profile?.jobDetails?.workShift}</p>
            </div>

            <div className="p-4 rounded-xl bg-dark-850 border border-dark-700 relative">
              <Lock className="w-3.5 h-3.5 text-dark-400 absolute top-4 right-4" />
              <span className="text-[11px] text-dark-400 uppercase font-semibold">Primary Work Location</span>
              <p className="text-sm font-bold text-slate-100 mt-1">{profile?.jobDetails?.location}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Salary Structure (Read-only with Lock icon) */}
      {activeTab === 'salary' && (
        <div className="card-surface p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-dark-700">
            <div>
              <h3 className="text-base font-bold text-slate-100">Monthly Compensation & Salary Structure</h3>
              <p className="text-xs text-dark-300">Official monthly payroll breakdown (Read-only)</p>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-750 text-dark-300 text-xs font-medium border border-dark-600">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Read-Only
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Earnings Table */}
            <div className="p-4 rounded-xl bg-dark-850 border border-dark-700 space-y-3">
              <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                Monthly Earnings (USD)
              </h4>
              <div className="space-y-2 text-xs divide-y divide-dark-700/50">
                <div className="flex justify-between py-1.5">
                  <span className="text-dark-300">Basic Pay</span>
                  <span className="font-bold text-slate-100">${profile?.salaryStructure?.basic?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-dark-300">House Rent Allowance (HRA)</span>
                  <span className="font-bold text-slate-100">${profile?.salaryStructure?.hra?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-dark-300">Transport Allowance</span>
                  <span className="font-bold text-slate-100">${profile?.salaryStructure?.transport?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-dark-300">Medical Allowance</span>
                  <span className="font-bold text-slate-100">${profile?.salaryStructure?.medical?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 pt-3 font-semibold text-sm border-t border-dark-700">
                  <span className="text-slate-100">Gross Earnings</span>
                  <span className="text-teal-400">${profile?.salaryStructure?.gross?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions Table */}
            <div className="p-4 rounded-xl bg-dark-850 border border-dark-700 space-y-3">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Statutory Deductions (USD)
              </h4>
              <div className="space-y-2 text-xs divide-y divide-dark-700/50">
                <div className="flex justify-between py-1.5">
                  <span className="text-dark-300">Income Tax Withholding (TDS)</span>
                  <span className="font-bold text-rose-400">-${profile?.salaryStructure?.taxDeduction?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-dark-300">Provident Fund (PF) Contribution</span>
                  <span className="font-bold text-rose-400">-${profile?.salaryStructure?.pfDeduction?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 pt-3 font-semibold text-sm border-t border-dark-700">
                  <span className="text-slate-100">Total Deductions</span>
                  <span className="text-rose-400">
                    -${((profile?.salaryStructure?.taxDeduction || 0) + (profile?.salaryStructure?.pfDeduction || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Highlight */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 to-dark-800 border border-teal-500/40 flex items-center justify-between">
            <div>
              <span className="text-xs text-dark-300 font-medium">Net Monthly Take-Home Pay</span>
              <p className="text-2xl font-black text-teal-400 mt-0.5">
                ${profile?.salaryStructure?.netSalary?.toLocaleString()} USD
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              Direct Deposit Active
            </span>
          </div>
        </div>
      )}

      {/* TAB 4: Documents (Read-only) */}
      {activeTab === 'documents' && (
        <div className="card-surface p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-dark-700">
            <div>
              <h3 className="text-base font-bold text-slate-100">Verified Corporate Documents</h3>
              <p className="text-xs text-dark-300">Employee legal contracts and certificates</p>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-750 text-dark-300 text-xs font-medium border border-dark-600">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Read-Only
            </span>
          </div>

          <div className="space-y-3">
            {profile?.documents && profile.documents.length > 0 ? (
              profile.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-dark-850 border border-dark-700 flex items-center justify-between hover:border-dark-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100">{doc.name}</p>
                      <p className="text-[11px] text-dark-400">
                        {doc.size} • Uploaded on {doc.uploadedAt}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toast.info(`Viewing document: ${doc.name}`)}
                    className="p-2 rounded-lg bg-dark-750 hover:bg-dark-700 text-teal-400 border border-dark-600 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-dark-400">
                No official documents attached to this account yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
