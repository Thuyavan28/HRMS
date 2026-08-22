import React, { useState } from 'react';
import {
  Layers,
  Play,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileCheck,
  Download,
  Clock,
  Sparkles
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';

export const PayrollRun = () => {
  const toast = useToast();

  const [monthName, setMonthName] = useState('September 2026');
  const [monthCode, setMonthCode] = useState('2026-09');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [runCompleted, setRunCompleted] = useState(false);
  const [generatedRecords, setGeneratedRecords] = useState([]);

  const handleExecuteRun = async () => {
    try {
      setRunning(true);
      setRunCompleted(false);
      setProgress(10);
      setLogs(['Initializing corporate payroll engine...', `Target Pay Period: ${monthName} (${monthCode})`]);

      await new Promise((r) => setTimeout(r, 600));
      setProgress(40);
      setLogs((prev) => [...prev, 'Fetching active employee employment contracts & attendance hours...']);

      await new Promise((r) => setTimeout(r, 600));
      setProgress(75);
      setLogs((prev) => [...prev, 'Computing tax withholdings (TDS) and provident fund contributions...']);

      const res = await adminService.runBulkPayroll({ monthName, monthCode });

      await new Promise((r) => setTimeout(r, 500));
      setProgress(100);

      if (res.success) {
        setLogs((prev) => [
          ...prev,
          `Batch complete: ${res.data.count} payslips successfully generated & archived.`,
          'Direct ACH distribution instructions queued.'
        ]);
        setGeneratedRecords(res.data.records || []);
        setRunCompleted(true);
        toast.success(res.message || 'Payroll run executed successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payroll batch execution failed.');
    } finally {
      setRunning(false);
    }
  };

  const columns = [
    {
      header: 'Employee Name & ID',
      key: 'employeeName',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-100 block">{val}</span>
          <span className="text-[10px] text-dark-300 font-mono">ID: {row.employeeId}</span>
        </div>
      )
    },
    {
      header: 'Department',
      key: 'department',
      render: (val) => <span className="text-slate-200">{val}</span>
    },
    {
      header: 'Gross Pay',
      key: 'gross',
      render: (val) => <span className="font-mono text-xs text-slate-200">${val?.toLocaleString()}</span>
    },
    {
      header: 'Tax Withheld',
      key: 'taxDeduction',
      render: (val) => <span className="font-mono text-xs text-rose-400">-${val?.toLocaleString()}</span>
    },
    {
      header: 'Net Take-Home',
      key: 'netSalary',
      render: (val) => (
        <span className="font-bold text-teal-400 font-mono text-xs">
          ${val?.toLocaleString()} USD
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card-surface p-6 border-dark-700 bg-gradient-to-r from-dark-800 to-dark-850">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Automated Bulk Payroll Processing</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Payroll Run & Batch Generator
          </h1>
          <p className="text-xs text-dark-300 mt-1">
            Execute organization-wide salary computations and generate PDF payslips in a single batch
          </p>
        </div>
      </div>

      {/* Control Card */}
      <div className="card-surface p-6 space-y-6">
        <h3 className="text-base font-bold text-slate-100">Batch Run Configuration</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-dark-300 mb-1.5">
              Select Pay Month
            </label>
            <select
              value={monthCode}
              onChange={(e) => {
                setMonthCode(e.target.value);
                const names = {
                  '2026-09': 'September 2026',
                  '2026-10': 'October 2026',
                  '2026-11': 'November 2026',
                  '2026-12': 'December 2026'
                };
                setMonthName(names[e.target.value] || e.target.value);
              }}
              className="input-field"
              disabled={running}
            >
              <option value="2026-09">September 2026 (Upcoming)</option>
              <option value="2026-10">October 2026</option>
              <option value="2026-11">November 2026</option>
              <option value="2026-12">December 2026</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleExecuteRun}
              disabled={running}
              className="w-full btn-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-glow-teal-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              {running ? 'Processing Batch...' : `Execute Payroll Run for ${monthName}`}
            </button>
          </div>
        </div>

        {/* Progress Bar & Status */}
        {running || progress > 0 ? (
          <div className="space-y-3 pt-4 border-t border-dark-700">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Execution Progress</span>
              <span className="font-bold text-teal-400 font-mono">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-dark-750 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-300 shadow-glow-teal-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}

        {/* Real-time Execution Logs Terminal */}
        {logs.length > 0 && (
          <div className="p-4 rounded-xl bg-dark-900 border border-dark-700 font-mono text-xs space-y-1.5 text-slate-300">
            <p className="text-teal-400 font-bold border-b border-dark-700 pb-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Execution Console Logs
            </p>
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-dark-500">[{new Date().toLocaleTimeString()}]</span>
                <span className="text-slate-200">{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generated Batch Records Result */}
      {runCompleted && generatedRecords.length > 0 && (
        <DataTable
          title={`Batch Results: ${monthName}`}
          subtitle="Generated payroll records ready for audit and export"
          columns={columns}
          data={generatedRecords}
          pageSize={10}
        />
      )}
    </div>
  );
};
