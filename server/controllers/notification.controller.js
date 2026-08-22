import { dataStore } from '../repositories/dataStore.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notifications = dataStore.getNotificationsForUser(userId);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const marked = dataStore.markNotificationAsRead(id, userId);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: { id, isRead: true }
    });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    dataStore.markAllNotificationsAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};
