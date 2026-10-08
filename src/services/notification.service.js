const Notification = require('../models/notification.model');

class NotificationService {
  /**
   * Helper function to create a notification
   */
  async createNotification({ user, type, title, message, relatedJob, relatedApplication }) {
    return await Notification.create({
      user,
      type,
      title,
      message,
      relatedJob,
      relatedApplication,
      isRead: false
    });
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(userId) {
    return await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('relatedJob', 'title companyName')
      .populate('relatedApplication', 'status');
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    return notification;
  }

  /**
   * Mark all notifications of user as read
   */
  async markAllAsRead(userId) {
    await Notification.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return true;
  }
}

module.exports = new NotificationService();
