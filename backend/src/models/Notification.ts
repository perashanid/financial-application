import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'payment_due' | 'goal_reached' | 'loan_overdue' | 'bill_added' | 'campaign_contribution' | 'security_alert';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: Date;
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
  };
  sentAt?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['payment_due', 'goal_reached', 'loan_overdue', 'bill_added', 'campaign_contribution', 'security_alert'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
