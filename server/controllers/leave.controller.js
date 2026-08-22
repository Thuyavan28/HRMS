import { dataStore } from '../repositories/dataStore.js';

export const getMyLeaves = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const leaves = dataStore.getLeavesForEmployee(employeeId);
    const profile = dataStore.getEmployeeProfile(employeeId);

    const pendingCount = leaves.filter(l => l.status === 'Pending').length;
    const approvedCount = leaves.filter(l => l.status === 'Approved').length;
    const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;

    res.status(200).json({
      success: true,
      data: {
        leaves,
        balances: profile ? profile.leaveBalances : { annual: 18, monthly: 2, daily: 5, hourly: 16, sick: 10 },
        summary: {
          totalRequests: leaves.length,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const applyLeave = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const { leaveType, fromDate, toDate, remarks } = req.body;

    // Calculate duration in days
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end - start);
    const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newLeave = dataStore.applyLeave(employeeId, {
      leaveType,
      fromDate,
      toDate,
      duration,
      remarks
    });

    res.status(201).json({
      success: true,
      message: `Leave application for ${duration} day(s) submitted successfully. HR will review your request.`,
      data: newLeave
    });
  } catch (error) {
    next(error);
  }
};

export const cancelLeave = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const leaveId = req.params.id;

    const result = dataStore.cancelLeave(leaveId, employeeId);

    if (result.notFound) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found.'
      });
    }

    if (result.unauthorized) {
      return res.status(403).json({
        success: false,
        message: 'You cannot cancel another employee\'s leave request.'
      });
    }

    if (result.notPending) {
      return res.status(400).json({
        success: false,
        message: 'Only Pending leave requests can be cancelled. Please contact HR to modify approved/rejected leaves.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully.'
    });
  } catch (error) {
    next(error);
  }
};
