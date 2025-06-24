#!/usr/bin/env python3
"""
HAWK Security Multi-Channel Notification System - Minimal Version
Sends security alerts via Email (SendGrid) and SMS (Twilio)
"""

import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from twilio.rest import Client
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ============================================================================
# EMAIL FUNCTIONS
# ============================================================================

def create_welcome_email(recipient_name="User"):
    """Create welcome email"""
    subject = "Welcome to HAWK Security Notifications"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #333; text-align: center;">Welcome to HAWK Security</h1>
        <p>Hello {recipient_name},</p>
        <p>Your email has been successfully set up to receive security notifications from HAWK Security.</p>
        <p style="color: #666; font-size: 12px;">
            HAWK Security System - {datetime.now().strftime("%B %d, %Y at %I:%M %p")}
        </p>
    </div>
    """
    return subject, html_content

def create_security_alert_email(vulnerability_type="Critical Security Vulnerability", severity="HIGH"):
    """Create security alert email"""
    subject = f"🚨 HAWK Security Alert: {vulnerability_type} Detected"
    
    severity_colors = {"CRITICAL": "#DC2626", "HIGH": "#EA580C", "MEDIUM": "#D97706", "LOW": "#65A30D"}
    severity_color = severity_colors.get(severity, "#DC2626")
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #333;">🛡️ HAWK Security Alert</h1>
            <div style="background-color: {severity_color}; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block;">
                <strong>{severity} PRIORITY</strong>
            </div>
        </div>
        
        <div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0;">
            <h2 style="color: #DC2626; margin-top: 0;">Security Vulnerability Detected</h2>
            <p><strong>Threat Type:</strong> {vulnerability_type}</p>
            <p><strong>Severity Level:</strong> {severity}</p>
            <p><strong>Detection Time:</strong> {datetime.now().strftime("%B %d, %Y at %I:%M %p")}</p>
        </div>
        
        <h3>Recommended Actions:</h3>
        <ul>
            <li>Review and update security patches immediately</li>
            <li>Check system logs for suspicious activity</li>
            <li>Monitor network traffic for anomalies</li>
        </ul>
        
        <p style="color: #666; font-size: 12px;">
            HAWK Security System - Alert ID: HAWK-{datetime.now().strftime("%Y%m%d")}-{hash(datetime.now()) % 10000:04d}
        </p>
    </div>
    """
    return subject, html_content

def send_email(from_email, to_email, subject, html_content):
    """Send email using SendGrid"""
    api_key = os.environ.get('SENDGRID_API_KEY')
    if not api_key:
        print("❌ Error: SENDGRID_API_KEY not set!")
        return False
    
    try:
        message = Mail(from_email=from_email, to_emails=to_email, subject=subject, html_content=html_content)
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        print(f"✅ Email sent successfully! Status: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")
        return False

# ============================================================================
# SMS FUNCTIONS
# ============================================================================

def create_welcome_sms(recipient_name="User"):
    """Create welcome SMS"""
    return f"""🛡️ HAWK Security Welcome!

Hello {recipient_name}, your phone is now set up for security alerts.

HAWK Security Team"""

def create_security_alert_sms(vulnerability_type="Critical Security Vulnerability", severity="HIGH"):
    """Create security alert SMS"""
    alert_id = f"HAWK-{datetime.now().strftime('%Y%m%d')}-{hash(datetime.now()) % 10000:04d}"
    time_str = datetime.now().strftime("%m/%d %I:%M%p")
    
    return f""" HAWK SECURITY ALERT
{severity} PRIORITY: {vulnerability_type}
Time: {time_str}
Alert ID: {alert_id}"""

def send_sms(to_phone, message):
    """Send SMS using Twilio"""
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    from_phone = os.environ.get('TWILIO_PHONE_NUMBER')
    
    if not all([account_sid, auth_token, from_phone]):
        print("❌ Error: Twilio credentials not set!")
        return False
    
    try:
        client = Client(account_sid, auth_token)
        message_obj = client.messages.create(body=message, from_=from_phone, to=to_phone)
        print(f"✅ SMS sent successfully! SID: {message_obj.sid}")
        return True
    except Exception as e:
        print(f"❌ Error sending SMS: {str(e)}")
        return False

# ============================================================================
# MULTI-CHANNEL FUNCTIONS
# ============================================================================

def send_welcome_notifications(email_config, sms_config):
    """Send welcome notifications via email and SMS"""
    subject, html_content = create_welcome_email(email_config['recipient_name'])
    email_success = send_email(email_config['from_email'], email_config['to_email'], subject, html_content)
    
    sms_message = create_welcome_sms(sms_config['recipient_name'])
    sms_success = send_sms(sms_config['to_phone'], sms_message)
    
    return email_success, sms_success

def send_security_alert_notifications(email_config, sms_config, vulnerability_type="Critical Security Vulnerability", severity="HIGH"):
    """Send security alert notifications via email and SMS"""
    subject, html_content = create_security_alert_email(vulnerability_type, severity)
    email_success = send_email(email_config['from_email'], email_config['to_email'], subject, html_content)
    
    sms_message = create_security_alert_sms(vulnerability_type, severity)
    sms_success = send_sms(sms_config['to_phone'], sms_message)
    
    return email_success, sms_success

# ============================================================================
# MAIN FUNCTION
# ============================================================================

def main():
    """Main function"""
    # Configuration
    EMAIL_CONFIG = {
        'from_email': os.getenv('FROM_EMAIL', 'pravartak99@gmail.com'),
        'to_email': os.getenv('TO_EMAIL', 'shantanukulkarni1229@gmail.com'),
        'recipient_name': os.getenv('RECIPIENT_NAME', 'User')
    }
    
    SMS_CONFIG = {
        'to_phone': os.getenv('TO_PHONE', '+1234567890'),
        'recipient_name': os.getenv('RECIPIENT_NAME', 'User')
    }
    
    print("🛡️ HAWK Security Notification System")
    print("=" * 50)
    
    print("\nSelect notification type:")
    print("1. Welcome Notifications (Email + SMS)")
    print("2. Security Alert (Email + SMS)")
    print("3. Email Only - Welcome")
    print("4. Email Only - Security Alert")
    print("5. SMS Only - Welcome")
    print("6. SMS Only - Security Alert")
    
    choice = input("\nEnter choice (1-6): ").strip()
    
    if choice == "1":
        email_success, sms_success = send_welcome_notifications(EMAIL_CONFIG, SMS_CONFIG)
        print(f"\nResults: Email={'✅' if email_success else '❌'}, SMS={'✅' if sms_success else '❌'}")
        
    elif choice == "2":
        email_success, sms_success = send_security_alert_notifications(EMAIL_CONFIG, SMS_CONFIG)
        print(f"\nResults: Email={'✅' if email_success else '❌'}, SMS={'✅' if sms_success else '❌'}")
        
    elif choice == "3":
        subject, html_content = create_welcome_email(EMAIL_CONFIG['recipient_name'])
        send_email(EMAIL_CONFIG['from_email'], EMAIL_CONFIG['to_email'], subject, html_content)
        
    elif choice == "4":
        subject, html_content = create_security_alert_email()
        send_email(EMAIL_CONFIG['from_email'], EMAIL_CONFIG['to_email'], subject, html_content)
        
    elif choice == "5":
        sms_message = create_welcome_sms(SMS_CONFIG['recipient_name'])
        send_sms(SMS_CONFIG['to_phone'], sms_message)
        
    elif choice == "6":
        sms_message = create_security_alert_sms()
        send_sms(SMS_CONFIG['to_phone'], sms_message)
        
    else:
        print("❌ Invalid choice")

if __name__ == "__main__":
    main()