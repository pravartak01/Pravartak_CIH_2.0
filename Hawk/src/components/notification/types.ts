
export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  emailAddress: string;
  phoneNumber: string;
  alertLevel: string;
  frequency: string;
  timeframe: string;
  emailVerified?: boolean;
}

export interface TestNotificationResponse {
  success: boolean;
  notification_id?: string;
  email_sent: boolean;
  sms_sent: boolean;
  email_details?: any;
  sms_details?: any;
  email_error?: string;
  sms_error?: string;
}
