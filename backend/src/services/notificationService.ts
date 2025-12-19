import { Notification } from '../models/Notification';

interface CreateNotificationData {
  userId: string;
  type: 'payment_due' | 'goal_reached' | 'loan_overdue' | 'bill_added' | 'campaign_contribution' | 'security_alert';
  title: string;
  message: string;
  data?: any;
  channels?: {
    inApp?: boolean;
    email?: boolean;
    sms?: boolean;
  };
}

export class NotificationService {
  async createNotification(data: CreateNotificationData) {
    const notification = await Notification.create({
      user: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
      channels: {
        inApp: data.channels?.inApp ?? true,
        email: data.channels?.email ?? false,
        sms: data.channels?.sms ?? false,
      },
      sentAt: new Date(),
    });

    // TODO: Send email/SMS if channels are enabled
    // This would integrate with SendGrid/Twilio

    return notification;
  }

  async getNotifications(filter: any, limit?: number) {
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit || 50);

    return notifications;
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true, readAt: new Date() },
      { new: true }
    );

    return notification;
  }

  async markAllAsRead(userId: string) {
    const result = await Notification.updateMany(
      { user: userId, read: false },
      { read: true, readAt: new Date() }
    );

    return result;
  }

  async deleteNotification(notificationId: string, userId: string) {
    const result = await Notification.findOneAndDelete({ _id: notificationId, user: userId });
    return result;
  }

  // Helper methods for specific notification types
  async notifyGoalReached(userId: string, goalName: string) {
    return this.createNotification({
      userId,
      type: 'goal_reached',
      title: 'Savings Goal Reached!',
      message: `Congratulations! You've reached your savings goal: ${goalName}`,
      channels: { inApp: true, email: true },
    });
  }

  async notifyLoanOverdue(userId: string, loanDetails: any) {
    return this.createNotification({
      userId,
      type: 'loan_overdue',
      title: 'Loan Payment Overdue',
      message: `Your loan payment for ${loanDetails.counterparty} is overdue`,
      data: loanDetails,
      channels: { inApp: true, email: true, sms: true },
    });
  }

  async notifyBillAdded(userId: string, groupName: string, amount: number) {
    return this.createNotification({
      userId,
      type: 'bill_added',
      title: 'New Bill Added',
      message: `A new bill of ${amount} BDT was added to ${groupName}`,
      channels: { inApp: true },
    });
  }
}

export const notificationService = new NotificationService();
