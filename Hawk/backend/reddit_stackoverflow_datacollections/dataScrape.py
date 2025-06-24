import requests
import json
import time
import csv
from datetime import datetime, timedelta
import pymongo
from pymongo import MongoClient
import re
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional
from bson import ObjectId
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import concurrent.futures
import threading
from functools import partial

@dataclass
class VulnerabilityPost:
    platform: str
    post_id: str
    title: str
    content: str
    author: str
    created_date: str
    score: int
    comments_count: int
    tags: List[str]
    solutions: List[Dict]
    severity: Optional[str] = None
    url: Optional[str] = None
    
    def to_dict(self):
        """Convert dataclass to dictionary for MongoDB insertion"""
        return asdict(self)

class VulnerabilityEmailNotifier:
    def __init__(self, from_email: str, to_emails: List[str], api_key: str = None):
        """Initialize email notifier with SendGrid"""
        self.from_email = from_email
        self.to_emails = to_emails if isinstance(to_emails, list) else [to_emails]
        self.api_key = api_key or os.environ.get('SENDGRID_API_KEY')
        
        if not self.api_key:
            print("⚠️ Warning: SENDGRID_API_KEY not found. Email notifications disabled.")
            self.enabled = False
        else:
            self.enabled = True
            print(f"✅ Email notifications enabled for {len(self.to_emails)} recipients")
    
    def create_vulnerability_alert_email(self, vulnerabilities: List[VulnerabilityPost]):
        """Create HTML email for vulnerability alerts"""
        
        # Count vulnerabilities by severity
        severity_counts = {}
        platform_counts = {}
        critical_vulns = []
        
        for vuln in vulnerabilities:
            severity = vuln.severity or 'unknown'
            platform = vuln.platform
            
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
            platform_counts[platform] = platform_counts.get(platform, 0) + 1
            
            if severity == 'critical':
                critical_vulns.append(vuln)
        
        # Determine overall alert level
        if severity_counts.get('critical', 0) > 0:
            alert_level = "CRITICAL"
            alert_color = "#DC2626"
        elif severity_counts.get('high', 0) > 0:
            alert_level = "HIGH"
            alert_color = "#EA580C"
        else:
            alert_level = "MEDIUM"
            alert_color = "#D97706"
        
        subject = f"🚨 HAWK Security Alert: {len(vulnerabilities)} New Vulnerabilities Detected"
        
        # Build severity summary
        severity_summary = ""
        for severity, count in severity_counts.items():
            color = {
                'critical': '#DC2626',
                'high': '#EA580C', 
                'medium': '#D97706',
                'low': '#65A30D',
                'unknown': '#6B7280'
            }.get(severity, '#6B7280')
            
            severity_summary += f"""
            <div style="display: inline-block; margin: 5px; padding: 5px 10px; background-color: {color}; color: white; border-radius: 15px; font-size: 12px;">
                <strong>{severity.upper()}: {count}</strong>
            </div>
            """
        
        # Build platform summary
        platform_summary = ""
        for platform, count in platform_counts.items():
            platform_summary += f"<li><strong>{platform.title()}:</strong> {count} vulnerabilities</li>"
        
        # Build critical vulnerabilities list
        critical_list = ""
        if critical_vulns:
            critical_list = "<h3 style='color: #DC2626;'>🔥 Critical Vulnerabilities Found:</h3><ul>"
            for vuln in critical_vulns[:5]:  # Show only first 5
                critical_list += f"""
                <li style='margin: 10px 0; padding: 10px; background-color: #FEF2F2; border-left: 3px solid #DC2626;'>
                    <strong>{vuln.title[:80]}...</strong><br>
                    <small>Platform: {vuln.platform.title()} | Score: {vuln.score} | Author: {vuln.author}</small><br>
                    <a href="{vuln.url}" style="color: #DC2626;">View Details →</a>
                </li>
                """
            critical_list += "</ul>"
            if len(critical_vulns) > 5:
                critical_list += f"<p><em>...and {len(critical_vulns) - 5} more critical vulnerabilities</em></p>"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #333; margin: 0;">🛡️ HAWK Security Alert</h1>
                <div style="background-color: {alert_color}; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin-top: 15px;">
                    <strong>{alert_level} PRIORITY ALERT</strong>
                </div>
            </div>
            
            <div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <h2 style="color: #DC2626; margin-top: 0;">🚨 New Vulnerabilities Detected</h2>
                <p><strong>Total Vulnerabilities Found:</strong> {len(vulnerabilities)}</p>
                <p><strong>Detection Time:</strong> {datetime.now().strftime("%B %d, %Y at %I:%M %p")}</p>
                <p><strong>Scan Duration:</strong> ~30 seconds (Fast Scan)</p>
                
                <div style="margin: 15px 0;">
                    <strong>Severity Breakdown:</strong><br>
                    {severity_summary}
                </div>
            </div>
            
            <div style="background-color: #F8FAFC; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #374151; margin-top: 0;">📊 Platform Summary</h3>
                <ul style="color: #555; margin: 0;">
                    {platform_summary}
                </ul>
            </div>
            
            {critical_list}
            
            <div style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 15px; margin: 25px 0;">
                <h3 style="color: #1E40AF; margin-top: 0;">🛠️ Recommended Immediate Actions:</h3>
                <ul style="color: #374151; margin: 0;">
                    <li>Review critical and high-severity vulnerabilities immediately</li>
                    <li>Check if any vulnerabilities affect your current systems</li>
                    <li>Apply security patches for affected software</li>
                    <li>Monitor system logs for potential exploitation attempts</li>
                    <li>Update security policies and access controls as needed</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:8080/security-dashboard" style="background-color: #DC2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 15px;">🔍 View Full Report</a>
                <a href="http://localhost:8080/vulnerability-analysis" style="background-color: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">📈 Analyze Threats</a>
            </div>
            
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 6px; margin-top: 25px;">
                <p style="margin: 0; color: #374151; font-size: 14px;">
                    <strong>🤖 Automated Scan Results:</strong> This alert was generated by HAWK's automated vulnerability scanning system. 
                    The scan collected data from Reddit security communities and Stack Overflow security discussions. 
                    Please verify the relevance of these vulnerabilities to your specific environment.
                </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
                🛡️ HAWK Security Monitoring System<br>
                Alert ID: HAWK-{datetime.now().strftime("%Y%m%d")}-{hash(str(vulnerabilities)) % 10000:04d}<br>
                Scan Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")} | Platform Coverage: Reddit, Stack Overflow<br>
                For support: security@hawksecurity.com | 24/7 Hotline: 1-800-HAWK-911
            </p>
        </div>
        """
        
        return subject, html_content
    
    def send_vulnerability_alert(self, vulnerabilities: List[VulnerabilityPost]):
        """Send vulnerability alert email to all recipients"""
        if not self.enabled or not vulnerabilities:
            return False
        
        try:
            subject, html_content = self.create_vulnerability_alert_email(vulnerabilities)
            
            # Send to all recipients
            success_count = 0
            for to_email in self.to_emails:
                try:
                    message = Mail(
                        from_email=self.from_email,
                        to_emails=to_email,
                        subject=subject,
                        html_content=html_content
                    )
                    
                    sg = SendGridAPIClient(self.api_key)
                    response = sg.send(message)
                    
                    print(f"✅ Alert sent to {to_email} (Status: {response.status_code})")
                    success_count += 1
                    
                except Exception as e:
                    print(f"❌ Failed to send to {to_email}: {str(e)}")
            
            print(f"📧 Email Summary: {success_count}/{len(self.to_emails)} emails sent successfully")
            return success_count > 0
            
        except Exception as e:
            print(f"❌ Email notification error: {str(e)}")
            return False
    
    def send_scan_completion_summary(self, total_posts: int, execution_time: str, stats: Dict):
        """Send scan completion summary email"""
        if not self.enabled:
            return False
        
        subject = f"✅ HAWK Vulnerability Scan Complete - {total_posts} Items Found"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #16A34A;">✅ Scan Complete</h1>
                <p style="color: #374151; font-size: 18px; margin: 0;">HAWK Vulnerability Scan Summary</p>
            </div>
            
            <div style="background-color: #F0FDF4; border-left: 4px solid #16A34A; padding: 15px; margin: 20px 0;">
                <h3 style="color: #16A34A; margin-top: 0;">📊 Scan Results</h3>
                <p><strong>Total Items Found:</strong> {total_posts}</p>
                <p><strong>Execution Time:</strong> {execution_time}</p>
                <p><strong>Platforms Scanned:</strong> Reddit, Stack Overflow</p>
                <p><strong>Scan Type:</strong> Fast Scan (30-second limit)</p>
            </div>
            
            <div style="background-color: #F8FAFC; padding: 15px; border-radius: 6px;">
                <h3 style="color: #374151; margin-top: 0;">🔍 Platform Breakdown</h3>
                <p><strong>Reddit:</strong> {stats.get('platform_counts', {}).get('reddit', 0)} posts</p>
                <p><strong>Stack Overflow:</strong> {stats.get('platform_counts', {}).get('stackoverflow', 0)} posts</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="http://localhost:8080/latest-scan" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Results</a>
            </div>
            
            <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
                HAWK Security System | {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
            </p>
        </div>
        """
        
        try:
            for to_email in self.to_emails:
                message = Mail(
                    from_email=self.from_email,
                    to_emails=to_email,
                    subject=subject,
                    html_content=html_content
                )
                
                sg = SendGridAPIClient(self.api_key)
                response = sg.send(message)
            
            print(f"✅ Scan summary sent to {len(self.to_emails)} recipients")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send scan summary: {str(e)}")
            return False

class FastRedditAPI:
    def __init__(self, client_id: str, client_secret: str, user_agent: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.user_agent = user_agent
        self.access_token = None
        self.base_url = "https://oauth.reddit.com"
        self.auth_url = "https://www.reddit.com/api/v1/access_token"
        
    def authenticate(self):
        """Fast authentication with Reddit API"""
        try:
            auth = requests.auth.HTTPBasicAuth(self.client_id, self.client_secret)
            data = {'grant_type': 'client_credentials'}
            headers = {'User-Agent': self.user_agent}
            
            response = requests.post(
                self.auth_url, 
                auth=auth, 
                data=data, 
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                self.access_token = response.json()['access_token']
                print("✅ Reddit authenticated")
                return True
            else:
                print(f"❌ Reddit auth failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Reddit auth error: {e}")
            return False
    
    def get_headers(self):
        return {
            'Authorization': f'bearer {self.access_token}',
            'User-Agent': self.user_agent
        }
    
    def search_fast(self, subreddits: List[str], keywords: List[str], limit: int = 20):
        """Fast search with minimal requests"""
        posts = []
        
        top_subreddits = subreddits[:3]
        top_keywords = keywords[:2]
        
        print(f"🔍 Reddit: {len(top_subreddits)} subreddits, {len(top_keywords)} keywords")
        
        for subreddit in top_subreddits:
            for keyword in top_keywords:
                url = f"{self.base_url}/r/{subreddit}/search"
                params = {
                    'q': keyword,
                    'sort': 'hot',
                    'limit': min(limit, 10),
                    'restrict_sr': 'true',
                    't': 'week'
                }
                
                try:
                    response = requests.get(
                        url, 
                        headers=self.get_headers(), 
                        params=params,
                        timeout=8
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        
                        for post in data['data']['children']:
                            post_data = post['data']
                            
                            vuln_post = VulnerabilityPost(
                                platform='reddit',
                                post_id=post_data['id'],
                                title=post_data['title'],
                                content=post_data.get('selftext', '')[:500],
                                author=post_data['author'],
                                created_date=datetime.fromtimestamp(post_data['created_utc']).isoformat(),
                                score=post_data['score'],
                                comments_count=post_data['num_comments'],
                                tags=[subreddit, keyword],
                                solutions=[],
                                severity=self.quick_classify_severity(post_data['title']),
                                url=f"https://reddit.com{post_data['permalink']}"
                            )
                            posts.append(vuln_post)
                    
                    time.sleep(0.5)
                    
                except Exception as e:
                    print(f"⚠️ Reddit error: {e}")
                    continue
        
        print(f"✅ Reddit: {len(posts)} posts")
        return posts
    
    def quick_classify_severity(self, text: str) -> str:
        """Quick severity classification"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['critical', 'exploit', 'rce', 'zero-day']):
            return 'critical'
        elif any(word in text_lower for word in ['injection', 'xss', 'csrf', 'bypass']):
            return 'high'
        elif any(word in text_lower for word in ['vulnerability', 'security', 'flaw']):
            return 'medium'
        else:
            return 'unknown'

class FastStackOverflowAPI:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.base_url = "https://api.stackexchange.com/2.3"
        
    def search_fast(self, tags: List[str], keywords: List[str], limit: int = 20):
        """Fast search with minimal requests"""
        posts = []
        
        top_tags = tags[:2]
        top_keywords = keywords[:2]
        
        print(f"🔍 SO: {len(top_tags)} tags, {len(top_keywords)} keywords")
        
        for tag in top_tags:
            for keyword in top_keywords:
                url = f"{self.base_url}/search/advanced"
                params = {
                    'order': 'desc',
                    'sort': 'votes',
                    'q': keyword,
                    'tagged': tag,
                    'site': 'stackoverflow',
                    'pagesize': min(limit, 10),
                    'filter': 'withbody'
                }
                
                if self.api_key:
                    params['key'] = self.api_key
                
                try:
                    response = requests.get(url, params=params, timeout=8)
                    
                    if response.status_code == 200:
                        data = response.json()
                        
                        for item in data.get('items', []):
                            vuln_post = VulnerabilityPost(
                                platform='stackoverflow',
                                post_id=str(item['question_id']),
                                title=item['title'],
                                content=item.get('body', '')[:500],
                                author=item['owner']['display_name'],
                                created_date=datetime.fromtimestamp(item['creation_date']).isoformat(),
                                score=item['score'],
                                comments_count=item.get('answer_count', 0),
                                tags=item.get('tags', []) + [keyword],
                                solutions=[],
                                severity=self.quick_classify_severity(item['title']),
                                url=item['link']
                            )
                            posts.append(vuln_post)
                    
                    time.sleep(0.3)
                    
                except Exception as e:
                    print(f"⚠️ SO error: {e}")
                    continue
        
        print(f"✅ SO: {len(posts)} posts")
        return posts
    
    def quick_classify_severity(self, text: str) -> str:
        """Quick severity classification"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['critical', 'exploit', 'rce']):
            return 'critical'
        elif any(word in text_lower for word in ['injection', 'xss', 'csrf']):
            return 'high'
        elif any(word in text_lower for word in ['security', 'vulnerability']):
            return 'medium'
        else:
            return 'unknown'

class FastVulnerabilityMongoDB:
    def __init__(self, connection_string: str = 'mongodb://localhost:27017/', 
                 database_name: str = 'vulnerability_db'):
        """Initialize MongoDB connection with timeout"""
        try:
            self.client = MongoClient(connection_string, serverSelectionTimeoutMS=3000)
            self.client.server_info()
            self.db = self.client[database_name]
            self.posts_collection = self.db.vulnerability_posts
            print("✅ MongoDB connected")
            
        except Exception as e:
            print(f"⚠️ MongoDB unavailable: {e}")
            self.client = None
            self.db = None
    
    def store_posts_fast(self, posts: List[VulnerabilityPost]):
        """Fast bulk storage"""
        if self.db is None or not posts:
            return
            
        try:
            posts_data = [post.to_dict() for post in posts]
            
            bulk_ops = []
            for post_data in posts_data:
                bulk_ops.append(
                    pymongo.UpdateOne(
                        {'post_id': post_data['post_id'], 'platform': post_data['platform']},
                        {'$set': post_data},
                        upsert=True
                    )
                )
            
            if bulk_ops:
                result = self.posts_collection.bulk_write(bulk_ops, ordered=False)
                print(f"✅ Stored {len(bulk_ops)} posts")
                
        except Exception as e:
            print(f"⚠️ Storage error: {e}")
    
    def get_quick_stats(self):
        """Get quick statistics"""
        if self.db is None:
            return {}
        
        try:
            total_posts = self.posts_collection.count_documents({})
            
            platform_stats = list(self.posts_collection.aggregate([
                {"$group": {"_id": "$platform", "count": {"$sum": 1}}}
            ]))
            platform_counts = {stat["_id"]: stat["count"] for stat in platform_stats}
            
            severity_stats = list(self.posts_collection.aggregate([
                {"$group": {"_id": "$severity", "count": {"$sum": 1}}}
            ]))
            severity_counts = {stat["_id"]: stat["count"] for stat in severity_stats}
            
            return {
                "total_posts": total_posts,
                "platform_counts": platform_counts,
                "severity_counts": severity_counts,
                "platforms_scraped": len(platform_counts),
                "critical_vulns": severity_counts.get("critical", 0),
                "high_vulns": severity_counts.get("high", 0),
                "database_status": "Connected"
            }
        except Exception as e:
            print(f"⚠️ Stats error: {e}")
            return {}

class FastVulnerabilityScraper:
    def __init__(self, config: Dict):
        """Initialize fast scraper with email notifications"""
        self.config = config
        self.start_time = None
        
        # Initialize APIs
        self.reddit_api = FastRedditAPI(
            client_id=config.get('reddit_client_id', 'w7WA7ojvZ8WJlANRJVCB7Q'),
            client_secret=config.get('reddit_client_secret', 'SS3AnwhLsf7-9YOk4QG1o5ggc_yIIQ'),
            user_agent=config.get('reddit_user_agent', 'FastVulnerabilityScraper/1.0')
        )
        
        self.stackoverflow_api = FastStackOverflowAPI(
            api_key=config.get('stackoverflow_api_key')
        )
        
        # Initialize database
        self.mongodb = FastVulnerabilityMongoDB(
            connection_string=config.get('mongodb_connection', 'mongodb://localhost:27017/'),
            database_name=config.get('database_name', 'vulnerability_db')
        )
        
        # Initialize email notifier
        self.email_notifier = VulnerabilityEmailNotifier(
            from_email=config.get('from_email', 'pravartak99@gmail.com'),
            to_emails=config.get('to_emails', ['shantanukulkarni1229@gmail.com']),
            api_key=config.get('sendgrid_api_key')
        )
    
    def run_fast_scraping(self, timeout_seconds: int = 25):
        """Run fast scraping operation with email notifications"""
        print("🚀 Starting FAST Vulnerability Collection with Email Alerts")
        print("=" * 60)
        
        self.start_time = datetime.now()
        all_posts = []
        
        # Minimal configuration for speed
        reddit_subreddits = ['cybersecurity', 'netsec', 'webdev']
        keywords = ['vulnerability', 'exploit', 'security flaw']
        stackoverflow_tags = ['security', 'vulnerability']
        
        # Use threading for parallel execution
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            reddit_future = executor.submit(self._scrape_reddit, reddit_subreddits, keywords)
            stackoverflow_future = executor.submit(self._scrape_stackoverflow, stackoverflow_tags, keywords)
            
            try:
                reddit_posts = reddit_future.result(timeout=12)
                stackoverflow_posts = stackoverflow_future.result(timeout=12)
                
                all_posts.extend(reddit_posts)
                all_posts.extend(stackoverflow_posts)
                
            except concurrent.futures.TimeoutError:
                print("⚠️ Some requests timed out, using partial results")
                
                if reddit_future.done():
                    all_posts.extend(reddit_future.result())
                if stackoverflow_future.done():
                    all_posts.extend(stackoverflow_future.result())
        
        # Quick storage
        print(f"\n💾 Storing {len(all_posts)} posts...")
        self.mongodb.store_posts_fast(all_posts)
        
        # Send immediate email alert if vulnerabilities found
        if all_posts:
            print(f"\n📧 Sending vulnerability alert email...")
            self.email_notifier.send_vulnerability_alert(all_posts)
        
        # Quick CSV export
        csv_filename = self.export_to_csv_fast(all_posts)
        
        # Final stats and summary email
        execution_time = datetime.now() - self.start_time
        stats = self.mongodb.get_quick_stats()
        stats.update({
            'execution_time': str(execution_time).split('.')[0],
            'total_posts': len(all_posts)
        })
        
        # Send completion summary
        self.email_notifier.send_scan_completion_summary(
            len(all_posts), 
            str(execution_time).split('.')[0], 
            stats
        )
        
        print(f"\n🎯 FAST OPERATION COMPLETE")
        print("=" * 50)
        print(f"Total Posts: {len(all_posts)}")
        print(f"Reddit: {len([p for p in all_posts if p.platform == 'reddit'])}")
        print(f"Stack Overflow: {len([p for p in all_posts if p.platform == 'stackoverflow'])}")
        print(f"Execution Time: {execution_time}")
        print(f"CSV File: {csv_filename}")
        print(f"Email Alerts: {'✅ Sent' if self.email_notifier.enabled else '❌ Disabled'}")
        print("=" * 50)
        
        return all_posts, stats
    
    def _scrape_reddit(self, subreddits, keywords):
        """Scrape Reddit in separate thread"""
        try:
            if self.reddit_api.authenticate():
                return self.reddit_api.search_fast(subreddits, keywords, limit=15)
            else:
                return []
        except Exception as e:
            print(f"Reddit thread error: {e}")
            return []
    
    def _scrape_stackoverflow(self, tags, keywords):
        """Scrape Stack Overflow in separate thread"""
        try:
            return self.stackoverflow_api.search_fast(tags, keywords, limit=15)
        except Exception as e:
            print(f"SO thread error: {e}")
            return []
    
    def export_to_csv_fast(self, posts: List[VulnerabilityPost]):
        """Fast CSV export"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"vuln_fast_{timestamp}.csv"
        
        try:
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = ['platform', 'title', 'author', 'score', 'severity', 'url']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                
                for post in posts:
                    writer.writerow({
                        'platform': post.platform,
                        'title': post.title[:100],
                        'author': post.author,
                        'score': post.score,
                        'severity': post.severity or 'unknown',
                        'url': post.url or ''
                    })
            
            print(f"✅ CSV exported: {filename}")
            return filename
            
        except Exception as e:
            print(f"⚠️ CSV export error: {e}")
            return None

def main():
    """Main function for fast scraping with email notifications"""
    
    print("🛡️ HAWK Security - Vulnerability Scraper with Email Alerts")
    print("=" * 60)
    
    # Configuration with email settings
    config = {
        # Reddit API Configuration
        'reddit_client_id': 'w7WA7ojvZ8WJlANRJVCB7Q',
        'reddit_client_secret': 'SS3AnwhLsf7-9YOk4QG1o5ggc_yIIQ',
        'reddit_user_agent': 'FastVulnScraper/1.0',
        
        # Database Configuration
        'mongodb_connection': 'mongodb://localhost:27017/',
        'database_name': 'fast_vuln_db',
        
        # Email Configuration
        'from_email': 'pravartak99@gmail.com',  # Your verified SendGrid sender
        'to_emails': [
            'shantanukulkarni1229@gmail.com',     # Primary recipient
            # 'security-team@company.com',        # Add more recipients
            # 'admin@company.com'                 # as needed
        ],
        'sendgrid_api_key': None  # Will use environment variable SENDGRID_API_KEY
    }
    
    # Check for SendGrid API key
    api_key = os.environ.get('SENDGRID_API_KEY')
    if not api_key:
        print("⚠️ SENDGRID_API_KEY environment variable not found!")
        print("To enable email notifications, set your SendGrid API key:")
        print("export SENDGRID_API_KEY='your-sendgrid-api-key-here'")
        print("\nContinuing without email notifications...\n")
    else:
        print("✅ SendGrid API key found - email notifications enabled\n")
    
    # Create and run the fast scraper
    scraper = FastVulnerabilityScraper(config)
    
    try:
        print("⏱️ Starting 30-second vulnerability collection with email alerts...")
        start_time = time.time()
        
        posts, stats = scraper.run_fast_scraping(timeout_seconds=25)
        
        end_time = time.time()
        total_time = end_time - start_time
        
        print(f"\n✅ SCRAPING COMPLETED in {total_time:.1f} seconds!")
        print(f"📊 Results Summary:")
        print(f"   • Total Posts: {len(posts)}")
        print(f"   • Reddit Posts: {len([p for p in posts if p.platform == 'reddit'])}")
        print(f"   • Stack Overflow Posts: {len([p for p in posts if p.platform == 'stackoverflow'])}")
        
        # Severity breakdown
        severity_counts = {}
        for post in posts:
            severity = post.severity or 'unknown'
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        print(f"   • Critical: {severity_counts.get('critical', 0)}")
        print(f"   • High: {severity_counts.get('high', 0)}")
        print(f"   • Medium: {severity_counts.get('medium', 0)}")
        print(f"   • Unknown: {severity_counts.get('unknown', 0)}")
        
        if api_key and posts:
            print(f"📧 Email alerts sent to {len(config['to_emails'])} recipients")
        
        if total_time > 30:
            print("⚠️ Exceeded 30 seconds - consider reducing limits further")
        else:
            print("🎯 Mission accomplished within time limit!")
        
        # Show next steps
        print(f"\n🚀 Next Steps:")
        print(f"   • Check your email for vulnerability alerts")
        print(f"   • Review the generated CSV file for detailed analysis")
        print(f"   • Monitor your MongoDB database for stored results")
        print(f"   • Set up automated scheduling for regular scans")
        
    except KeyboardInterrupt:
        print(f"\n⚠️ Operation interrupted by user")
        
    except Exception as e:
        print(f"\n❌ Error during execution: {e}")
        import traceback
        traceback.print_exc()

def setup_email_test():
    """Test function to verify email configuration"""
    print("📧 Testing Email Configuration...")
    
    api_key = os.environ.get('SENDGRID_API_KEY')
    if not api_key:
        print("❌ SENDGRID_API_KEY not found in environment variables")
        return False
    
    # Create a test notifier
    notifier = VulnerabilityEmailNotifier(
        from_email='pravartak99@gmail.com',
        to_emails=['shantanukulkarni1229@gmail.com'],
        api_key=api_key
    )
    
    # Create test vulnerability data
    test_vulnerabilities = [
        VulnerabilityPost(
            platform='test',
            post_id='test_001',
            title='Test Critical Vulnerability - Email System Check',
            content='This is a test vulnerability to verify email notifications are working correctly.',
            author='HAWK Security System',
            created_date=datetime.now().isoformat(),
            score=100,
            comments_count=5,
            tags=['test', 'email-check'],
            solutions=[],
            severity='critical',
            url='https://example.com/test-vulnerability'
        )
    ]
    
    # Send test email
    success = notifier.send_vulnerability_alert(test_vulnerabilities)
    
    if success:
        print("✅ Test email sent successfully!")
        print("📧 Check your inbox for the test vulnerability alert")
        return True
    else:
        print("❌ Failed to send test email")
        return False

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--test-email':
        setup_email_test()
    else:
        main()