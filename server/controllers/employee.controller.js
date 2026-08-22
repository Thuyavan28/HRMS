import { dataStore } from '../repositories/dataStore.js';

export const getEmployeeDashboard = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const profile = dataStore.getEmployeeProfile(employeeId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found.'
      });
    }

    // Get attendance records for summary calculations
    const attendanceRecords = dataStore.getAttendanceForEmployee(employeeId);
    const todayRecord = dataStore.getTodayAttendance(employeeId);

    const presentDays = attendanceRecords.filter(a => a.status === 'Present').length;
    const lateDays = attendanceRecords.filter(a => a.status === 'Late').length;
    const absentDays = attendanceRecords.filter(a => a.status === 'Absent').length;

    // Upcoming schedule items
    const upcomingSchedule = [
      { id: 'sch-1', title: 'Sprint Retrospective & Demo', time: '11:00 AM - 12:00 PM', date: 'Today', type: 'meeting' },
      { id: 'sch-2', title: 'Design System Alignment Sync', time: '02:30 PM - 03:15 PM', date: 'Today', type: 'design' },
      { id: 'sch-3', title: 'Company All-Hands (Town Hall)', time: '04:00 PM - 05:00 PM', date: 'Tomorrow', type: 'company' },
      { id: 'sch-4', title: 'Labor Day Public Holiday', time: 'Full Day Off', date: 'Sep 01, 2026', type: 'holiday' }
    ];

    // Recent activity feed
    const recentLeaves = dataStore.getLeavesForEmployee(employeeId).slice(0, 2);
    const recentPayroll = dataStore.getPayrollForEmployee(employeeId).slice(0, 1);

    const recentActivity = [
      ...(todayRecord ? [{
        id: 'act-att-today',
        title: todayRecord.checkOut ? 'Checked Out' : 'Checked In',
        description: `Punch registered at ${todayRecord.checkOut || todayRecord.checkIn} (${todayRecord.status})`,
        time: todayRecord.checkOut || todayRecord.checkIn,
        icon: 'clock',
        type: 'attendance'
      }] : []),
      ...recentLeaves.map(l => ({
        id: `act-${l.id}`,
        title: `Leave ${l.status}: ${l.leaveType} (${l.duration}d)`,
        description: `${l.fromDate} to ${l.toDate} - ${l.remarks}`,
        time: new Date(l.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        icon: 'calendar',
        type: 'leave'
      })),
      ...recentPayroll.map(p => ({
        id: `act-${p.id}`,
        title: `Salary Credited: ${p.month}`,
        description: `Net payout of $${p.netSalary.toLocaleString()} processed via ${p.paymentMethod}`,
        time: p.paymentDate,
        icon: 'dollar-sign',
        type: 'payroll'
      }))
    ];

    res.status(200).json({
      success: true,
      data: {
        employee: {
          fullName: profile.fullName,
          employeeId: profile.employeeId,
          designation: profile.jobDetails ? profile.jobDetails.designation : 'Employee',
          department: profile.jobDetails ? profile.jobDetails.department : 'General',
          avatar: profile.avatar
        },
        todayDate: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        punchState: {
          isCheckedIn: !!(todayRecord && todayRecord.checkIn),
          isCheckedOut: !!(todayRecord && todayRecord.checkOut),
          checkInTime: todayRecord ? todayRecord.checkIn : null,
          checkOutTime: todayRecord ? todayRecord.checkOut : null,
          status: todayRecord ? todayRecord.status : 'Not Clocked In'
        },
        attendanceSummary: {
          presentDays,
          lateDays,
          absentDays,
          totalWorkDays: attendanceRecords.length
        },
        leaveBalances: profile.leaveBalances || {
          annual: 18,
          monthly: 2,
          daily: 5,
          hourly: 16,
          sick: 10
        },
        upcomingSchedule,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeProfile = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const profile = dataStore.getEmployeeProfile(employeeId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployeeProfile = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const { fullName, phone, address, emergencyContact, avatar } = req.body;

    // Only allow editable personal fields for employee role
    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (emergencyContact) updates.emergencyContact = emergencyContact;
    if (avatar) updates.avatar = avatar;

    const updated = dataStore.updateEmployeeProfile(employeeId, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found to update.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Personal details updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
