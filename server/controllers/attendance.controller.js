import { dataStore } from '../repositories/dataStore.js';

export const getMyAttendance = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const records = dataStore.getAttendanceForEmployee(employeeId);
    const today = dataStore.getTodayAttendance(employeeId);

    const totalDays = records.length;
    const presentCount = records.filter(r => r.status === 'Present').length;
    const lateCount = records.filter(r => r.status === 'Late').length;
    const absentCount = records.filter(r => r.status === 'Absent').length;

    res.status(200).json({
      success: true,
      data: {
        records,
        summary: {
          totalDays,
          presentCount,
          lateCount,
          absentCount,
          attendanceRate: totalDays ? Math.round(((presentCount + lateCount) / totalDays) * 100) : 0
        },
        todayStatus: today || null
      }
    });
  } catch (error) {
    next(error);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const result = dataStore.checkIn(employeeId);

    if (result.alreadyCheckedIn) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today at ' + result.record.checkIn,
        data: result.record
      });
    }

    res.status(200).json({
      success: true,
      message: `Checked in successfully at ${result.record.checkIn}. Have a productive day!`,
      data: result.record
    });
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const result = dataStore.checkOut(employeeId);

    if (result.notCheckedIn) {
      return res.status(400).json({
        success: false,
        message: 'You must check in first before checking out.'
      });
    }

    res.status(200).json({
      success: true,
      message: `Checked out successfully at ${result.record.checkOut}. Great work today!`,
      data: result.record
    });
  } catch (error) {
    next(error);
  }
};

export const getTodayStatus = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const today = dataStore.getTodayAttendance(employeeId);

    res.status(200).json({
      success: true,
      data: {
        isCheckedIn: !!(today && today.checkIn),
        isCheckedOut: !!(today && today.checkOut),
        checkIn: today ? today.checkIn : null,
        checkOut: today ? today.checkOut : null,
        status: today ? today.status : 'Not Clocked In',
        date: new Date().toISOString().split('T')[0]
      }
    });
  } catch (error) {
    next(error);
  }
};
