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

class EmailNotificationService:
    def __init__(self, from_email: str):
        self.from_email = "pravartak99@gmail.com"
        self.api_key = os.environ.get('SENDGRID_API_KEY')
        
    def send_scraping_completion_email(self, to_email: "shantanukulkarni1229@gmail.com", stats: Dict):
        """Send a comprehensive scraping completion notification"""
        
        if not self.api_key:
            print("Warning: SENDGRID_API_KEY not set. Email notification skipped.")
            return False
        
        subject = f"🛡️ HAWK Security: Vulnerability Scraping Completed - {stats['total_posts']} Posts Collected"
        
        # Calculate severity distribution for visual representation
        severity_bars = self._create_severity_bars(stats.get('severity_counts', {}))
        platform_bars = self._create_platform_bars(stats.get('platform_counts', {}))
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">🛡️ HAWK Security Intelligence</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Vulnerability Data Collection Report</p>
            </div>
            
            <!-- Main Content -->
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                
                <!-- Status Banner -->
                <div style="background-color: #10b981; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
                    <h2 style="margin: 0; font-size: 20px;">✅ Scraping Operation Completed Successfully!</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Completed at: {datetime.now().strftime("%B %d, %Y at %I:%M %p")}</p>
                </div>
                
                <!-- Key Metrics -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 25px 0;">
                    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 6px;">
                        <h3 style="margin: 0; color: #1d4ed8; font-size: 24px;">{stats['total_posts']}</h3>
                        <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Total Posts Collected</p>
                    </div>
                    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 6px;">
                        <h3 style="margin: 0; color: #15803d; font-size: 24px;">{stats.get('platforms_scraped', 0)}</h3>
                        <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Platforms Scraped</p>
                    </div>
                    <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 20px; border-radius: 6px;">
                        <h3 style="margin: 0; color: #a16207; font-size: 24px;">{stats.get('critical_vulns', 0)}</h3>
                        <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Critical Vulnerabilities</p>
                    </div>
                    <div style="background: #fdf2f8; border-left: 4px solid #ec4899; padding: 20px; border-radius: 6px;">
                        <h3 style="margin: 0; color: #be185d; font-size: 24px;">{stats.get('execution_time', 'N/A')}</h3>
                        <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Execution Time</p>
                    </div>
                </div>
                
                <!-- Platform Distribution -->
                <div style="margin: 30px 0;">
                    <h3 style="color: #374151; margin-bottom: 15px; font-size: 18px;">📊 Platform Distribution</h3>
                    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        {platform_bars}
                    </div>
                </div>
                
                <!-- Severity Analysis -->
                <div style="margin: 30px 0;">
                    <h3 style="color: #374151; margin-bottom: 15px; font-size: 18px;">🚨 Severity Analysis</h3>
                    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        {severity_bars}
                    </div>
                </div>
                
                <!-- Top Vulnerabilities -->
                {self._create_top_vulnerabilities_section(stats.get('top_posts', []))}
                
                <!-- Summary Stats -->
                <div style="background: #1f2937; color: white; padding: 25px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: #f9fafb; margin-top: 0; font-size: 18px;">📈 Collection Summary</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                        <div>
                            <p style="margin: 0; color: #9ca3af; font-size: 14px;">Reddit Posts</p>
                            <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold;">{stats.get('reddit_posts', 0)}</p>
                        </div>
                        <div>
                            <p style="margin: 0; color: #9ca3af; font-size: 14px;">Stack Overflow Posts</p>
                            <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold;">{stats.get('stackoverflow_posts', 0)}</p>
                        </div>
                        <div>
                            <p style="margin: 0; color: #9ca3af; font-size: 14px;">High Severity Issues</p>
                            <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold;">{stats.get('high_vulns', 0)}</p>
                        </div>
                        <div>
                            <p style="margin: 0; color: #9ca3af; font-size: 14px;">Total Solutions Found</p>
                            <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold;">{stats.get('total_solutions', 0)}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Action Items -->
                <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: #92400e; margin-top: 0; font-size: 16px;">⚡ Recommended Next Steps</h3>
                    <ul style="color: #78350f; margin: 10px 0; padding-left: 20px;">
                        <li>Review critical and high severity vulnerabilities identified</li>
                        <li>Check exported CSV file: vulnerability_discussions.csv</li>
                        <li>Update security monitoring rules based on new intelligence</li>
                        <li>Schedule follow-up analysis for trending vulnerability patterns</li>
                    </ul>
                </div>
                
                <!-- CTA Buttons -->
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:8080/vulnerability-dashboard" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 15px; display: inline-block;">View Dashboard</a>
                    <a href="http://localhost:8080/reports" style="background-color: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Generate Report</a>
                </div>
                
                <!-- System Info -->
                <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                        <strong>System:</strong> HAWK Security Intelligence Platform<br>
                        <strong>Operation ID:</strong> SCRAPE-{datetime.now().strftime("%Y%m%d")}-{hash(datetime.now()) % 10000:04d}<br>
                        <strong>Database:</strong> {stats.get('database_status', 'Connected')}<br>
                        <strong>Data Export:</strong> CSV file generated successfully
                    </p>
                </div>
            </div>
        </div>
        """
        
        try:
            message = Mail(
                from_email=self.from_email,
                to_emails=to_email,
                subject=subject,
                html_content=html_content
            )
            
            sg = SendGridAPIClient(self.api_key)
            response = sg.send(message)
            
            print(f"✅ Completion email sent successfully!")
            print(f"Status Code: {response.status_code}")
            print(f"Message ID: {response.headers.get('X-Message-Id', 'N/A')}")
            return True
            
        except Exception as e:
            print(f"❌ Error sending completion email: {str(e)}")
            return False
    
    def _create_severity_bars(self, severity_counts: Dict) -> str:
        """Create visual bars for severity distribution"""
        if not severity_counts:
            return "<p style='color: #6b7280;'>No severity data available</p>"
        
        total = sum(severity_counts.values())
        if total == 0:
            return "<p style='color: #6b7280;'>No severity data available</p>"
        
        severity_colors = {
            'critical': '#dc2626',
            'high': '#ea580c',
            'medium': '#d97706',
            'low': '#65a30d',
            'unknown': '#6b7280'
        }
        
        bars_html = ""
        for severity, count in severity_counts.items():
            percentage = (count / total) * 100
            color = severity_colors.get(severity.lower(), '#6b7280')
            
            bars_html += f"""
            <div style="margin: 10px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-weight: 500; color: #374151; text-transform: capitalize;">{severity}</span>
                    <span style="color: #6b7280; font-size: 14px;">{count} ({percentage:.1f}%)</span>
                </div>
                <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: {color}; height: 100%; width: {percentage}%; transition: width 0.3s ease;"></div>
                </div>
            </div>
            """
        
        return bars_html
    
    def _create_platform_bars(self, platform_counts: Dict) -> str:
        """Create visual bars for platform distribution"""
        if not platform_counts:
            return "<p style='color: #6b7280;'>No platform data available</p>"
        
        total = sum(platform_counts.values())
        if total == 0:
            return "<p style='color: #6b7280;'>No platform data available</p>"
        
        platform_colors = {
            'reddit': '#ff4500',
            'stackoverflow': '#f48024',
            'github': '#24292e'
        }
        
        bars_html = ""
        for platform, count in platform_counts.items():
            percentage = (count / total) * 100
            color = platform_colors.get(platform.lower(), '#3b82f6')
            
            bars_html += f"""
            <div style="margin: 10px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-weight: 500; color: #374151; text-transform: capitalize;">{platform}</span>
                    <span style="color: #6b7280; font-size: 14px;">{count} ({percentage:.1f}%)</span>
                </div>
                <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: {color}; height: 100%; width: {percentage}%; transition: width 0.3s ease;"></div>
                </div>
            </div>
            """
        
        return bars_html
    
    def _create_top_vulnerabilities_section(self, top_posts: List) -> str:
        """Create a section showing top vulnerabilities found"""
        if not top_posts:
            return ""
        
        section_html = """
        <div style="margin: 30px 0;">
            <h3 style="color: #374151; margin-bottom: 15px; font-size: 18px;">🔍 Top Vulnerabilities Discovered</h3>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
        """
        
        for i, post in enumerate(top_posts[:5], 1):
            severity_color = {
                'critical': '#dc2626',
                'high': '#ea580c',
                'medium': '#d97706',
                'low': '#65a30d',
                'unknown': '#6b7280'
            }.get(post.get('severity', 'unknown').lower(), '#6b7280')
            
            section_html += f"""
            <div style="border-bottom: 1px solid #e5e7eb; padding: 15px 0; {'border-bottom: none;' if i == len(top_posts[:5]) else ''}">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <h4 style="margin: 0; color: #1f2937; font-size: 16px; line-height: 1.4;">{post.get('title', 'Unknown')[:80]}{'...' if len(post.get('title', '')) > 80 else ''}</h4>
                    <span style="background: {severity_color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; text-transform: uppercase; white-space: nowrap; margin-left: 10px;">{post.get('severity', 'unknown')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #6b7280; font-size: 14px;">Platform: {post.get('platform', 'Unknown').title()}</span>
                    <span style="color: #3b82f6; font-size: 14px; font-weight: 500;">Score: {post.get('score', 0)}</span>
                </div>
            </div>
            """
        
        section_html += "</div></div>"
        return section_html

class RedditAPI:
    def __init__(self, client_id: str, client_secret: str, user_agent: str):
        self.client_id = 'w7WA7ojvZ8WJlANRJVCB7Q'
        self.client_secret = 'SS3AnwhLsf7-9YOk4QG1o5ggc_yIIQ'
        self.user_agent = user_agent
        self.access_token = None
        self.base_url = "https://oauth.reddit.com"
        self.auth_url = "https://www.reddit.com/api/v1/access_token"
        
    def authenticate(self):
        """Authenticate with Reddit API with timeout and error handling"""
        print("Authenticating with Reddit...")
        try:
            auth = requests.auth.HTTPBasicAuth(self.client_id, self.client_secret)
            data = {'grant_type': 'client_credentials'}
            headers = {'User-Agent': self.user_agent}
            
            response = requests.post(
                self.auth_url, 
                auth=auth, 
                data=data, 
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                self.access_token = response.json()['access_token']
                print("Reddit authentication successful!")
                return True
            else:
                print(f"Reddit authentication failed: {response.status_code} - {response.text}")
                return False
                
        except requests.exceptions.Timeout:
            print("Reddit authentication timed out")
            return False
        except requests.exceptions.RequestException as e:
            print(f"Reddit authentication error: {e}")
            return False
    
    def get_headers(self):
        return {
            'Authorization': f'bearer {self.access_token}',
            'User-Agent': self.user_agent
        }
    
    def search_vulnerability_posts(self, subreddits: List[str], keywords: List[str], limit: int = 100):
        """Search for vulnerability-related posts with better error handling and timeouts"""
        posts = []
        total_processed = 0
        
        for i, subreddit in enumerate(subreddits):
            print(f"Processing subreddit {i+1}/{len(subreddits)}: r/{subreddit}")
            
            for j, keyword in enumerate(keywords):
                print(f"  Searching for keyword {j+1}/{len(keywords)}: '{keyword}'")
                
                url = f"{self.base_url}/r/{subreddit}/search"
                params = {
                    'q': keyword,
                    'sort': 'relevance',
                    'limit': min(limit, 25),
                    'restrict_sr': 'true',
                    't': 'month'
                }
                
                try:
                    response = requests.get(
                        url, 
                        headers=self.get_headers(), 
                        params=params,
                        timeout=30
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        posts_found = len(data['data']['children'])
                        print(f"    Found {posts_found} posts")
                        
                        for post in data['data']['children']:
                            post_data = post['data']
                            
                            comments = []
                            
                            vuln_post = VulnerabilityPost(
                                platform='reddit',
                                post_id=post_data['id'],
                                title=post_data['title'],
                                content=post_data.get('selftext', ''),
                                author=post_data['author'],
                                created_date=datetime.fromtimestamp(post_data['created_utc']).isoformat(),
                                score=post_data['score'],
                                comments_count=post_data['num_comments'],
                                tags=[subreddit, keyword],
                                solutions=comments,
                                url=f"https://reddit.com{post_data['permalink']}"
                            )
                            posts.append(vuln_post)
                            total_processed += 1
                    
                    elif response.status_code == 401:
                        print("    Authentication expired, re-authenticating...")
                        if not self.authenticate():
                            print("    Re-authentication failed, skipping Reddit")
                            return posts
                    
                    elif response.status_code == 429:
                        print("    Rate limited, waiting longer...")
                        time.sleep(10)
                        continue
                    
                    else:
                        print(f"    Error: {response.status_code}")
                        
                except requests.exceptions.Timeout:
                    print(f"    Timeout for r/{subreddit} with keyword '{keyword}', skipping...")
                    continue
                    
                except requests.exceptions.RequestException as e:
                    print(f"    Request error: {e}")
                    continue
                
                time.sleep(2)
                
                if total_processed > 0 and total_processed % 10 == 0:
                    print(f"  Processed {total_processed} posts so far...")
        
        print(f"Reddit collection completed. Total posts: {len(posts)}")
        return posts

class StackOverflowAPI:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.base_url = "https://api.stackexchange.com/2.3"
        
    def search_vulnerability_questions(self, tags: List[str], keywords: List[str], 
                                     site: str = 'stackoverflow', pagesize: int = 100):
        """Search for vulnerability-related questions with better error handling"""
        posts = []
        total_processed = 0
        
        limited_tags = tags[:5]
        limited_keywords = keywords[:3]
        
        print(f"Stack Overflow: Processing {len(limited_tags)} tags and {len(limited_keywords)} keywords")
        
        for i, tag in enumerate(limited_tags):
            print(f"Processing tag {i+1}/{len(limited_tags)}: {tag}")
            
            for j, keyword in enumerate(limited_keywords):
                print(f"  Searching for keyword {j+1}/{len(limited_keywords)}: '{keyword}'")
                
                url = f"{self.base_url}/search/advanced"
                params = {
                    'order': 'desc',
                    'sort': 'relevance',
                    'q': keyword,
                    'tagged': tag,
                    'site': site,
                    'pagesize': min(pagesize, 30),
                    'filter': 'withbody'
                }
                
                if self.api_key:
                    params['key'] = self.api_key
                
                try:
                    response = requests.get(url, params=params, timeout=30)
                    
                    if response.status_code == 200:
                        data = response.json()
                        items_found = len(data.get('items', []))
                        print(f"    Found {items_found} questions")
                        
                        for item in data.get('items', []):
                            answers = []
                            
                            vuln_post = VulnerabilityPost(
                                platform='stackoverflow',
                                post_id=str(item['question_id']),
                                title=item['title'],
                                content=item.get('body', '')[:1000],
                                author=item['owner']['display_name'],
                                created_date=datetime.fromtimestamp(item['creation_date']).isoformat(),
                                score=item['score'],
                                comments_count=item.get('answer_count', 0),
                                tags=item.get('tags', []) + [keyword],
                                solutions=answers,
                                severity=self.classify_severity(item['title'] + ' ' + item.get('body', '')),
                                url=item['link']
                            )
                            posts.append(vuln_post)
                            total_processed += 1
                    
                    elif response.status_code == 429:
                        print("    Rate limited, waiting...")
                        time.sleep(10)
                        continue
                    
                    else:
                        print(f"    Error: {response.status_code}")
                        
                except requests.exceptions.Timeout:
                    print(f"    Timeout for tag '{tag}' with keyword '{keyword}', skipping...")
                    continue
                    
                except requests.exceptions.RequestException as e:
                    print(f"    Request error: {e}")
                    continue
                
                time.sleep(0.5)
                
                if total_processed > 0 and total_processed % 10 == 0:
                    print(f"  Processed {total_processed} questions so far...")
        
        print(f"Stack Overflow collection completed. Total posts: {len(posts)}")
        return posts
    
    def classify_severity(self, text: str) -> str:
        """Enhanced severity classification based on keywords and patterns"""
        text_lower = text.lower()
        
        critical_keywords = [
            'critical', 'exploit', 'rce', 'remote code execution', 
            'privilege escalation', 'arbitrary code execution',
            'buffer overflow', 'heap overflow', 'stack overflow vulnerability'
        ]
        
        high_keywords = [
            'sql injection', 'sqli', 'xss', 'cross-site scripting',
            'csrf', 'cross-site request forgery', 'authentication bypass',
            'authorization bypass', 'path traversal', 'directory traversal',
            'xxe', 'xml external entity'
        ]
        
        medium_keywords = [
            'information disclosure', 'information leakage',
            'denial of service', 'dos', 'ddos', 'session hijacking',
            'clickjacking', 'open redirect', 'security misconfiguration'
        ]
        
        low_keywords = [
            'information gathering', 'fingerprinting', 
            'missing security headers', 'weak cipher'
        ]
        
        if any(keyword in text_lower for keyword in critical_keywords):
            return 'critical'
        elif any(keyword in text_lower for keyword in high_keywords):
            return 'high'
        elif any(keyword in text_lower for keyword in medium_keywords):
            return 'medium'
        elif any(keyword in text_lower for keyword in low_keywords):
            return 'low'
        else:
            return 'unknown'

class VulnerabilityMongoDB:
    def __init__(self, connection_string: str = 'mongodb://localhost:27017/', 
                 database_name: str = 'vulnerability_db'):
        """Initialize MongoDB connection"""
        try:
            self.client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
            self.client.server_info()
            self.db = self.client[database_name]
            self.posts_collection = self.db.vulnerability_posts
            self.solutions_collection = self.db.solutions
            self.analytics_collection = self.db.analytics
            
            self.create_indexes()
            print("MongoDB connection successful!")
            
        except Exception as e:
            print(f"MongoDB connection failed: {e}")
            print("Continuing without database storage...")
            self.client = None
            self.db = None
    
    def create_indexes(self):
        """Create indexes for optimized queries"""
        if not self.db:
            return
            
        try:
            self.posts_collection.create_index([("post_id", 1), ("platform", 1)], unique=True)
            self.posts_collection.create_index([("platform", 1)])
            self.posts_collection.create_index([("severity", 1)])
            self.posts_collection.create_index([("score", -1)])
            self.posts_collection.create_index([("created_date", -1)])
            self.posts_collection.create_index([("tags", 1)])
            
            self.posts_collection.create_index([
                ("title", "text"), 
                ("content", "text")
            ])
            
            self.solutions_collection.create_index([("post_id", 1)])
            self.solutions_collection.create_index([("is_solution", 1)])
            self.solutions_collection.create_index([("score", -1)])
            
        except Exception as e:
            print(f"Error creating indexes: {e}")
    
    def store_posts(self, posts: List[VulnerabilityPost]):
        """Store posts and solutions in MongoDB"""
        if not self.db:
            print("No database connection, skipping storage")
            return
            
        posts_to_insert = []
        solutions_to_insert = []
        
        for post in posts:
            post_dict = post.to_dict()
            
            solutions = post_dict.pop('solutions', [])
            
            post_dict['created_at'] = datetime.utcnow()
            post_dict['updated_at'] = datetime.utcnow()
            
            posts_to_insert.append(post_dict)
            
            for solution in solutions:
                solution_doc = {
                    'post_id': post.post_id,
                    'platform': post.platform,
                    'created_at': datetime.utcnow(),
                    **solution
                }
                solutions_to_insert.append(solution_doc)
        
        if posts_to_insert:
            try:
                for post in posts_to_insert:
                    self.posts_collection.update_one(
                        {'post_id': post['post_id'], 'platform': post['platform']},
                        {'$set': post},
                        upsert=True
                    )
                print(f"Stored {len(posts_to_insert)} posts")
            except Exception as e:
                print(f"Error storing posts: {e}")
        
        if solutions_to_insert:
            try:
                self.solutions_collection.insert_many(solutions_to_insert, ordered=False)
                print(f"Stored {len(solutions_to_insert)} solutions")
            except Exception as e:
                print(f"Error storing solutions: {e}")
    
    def get_collection_stats(self):
        """Get statistics about the stored data"""
        if not self.db:
            return {}
        
        try:
            total_posts = self.posts_collection.count_documents({})
            
            pipeline = [
                {"$group": {"_id": "$platform", "count": {"$sum": 1}}}
            ]
            platform_stats = list(self.posts_collection.aggregate(pipeline))
            platform_counts = {stat["_id"]: stat["count"] for stat in platform_stats}
            
            severity_pipeline = [
                {"$group": {"_id": "$severity", "count": {"$sum": 1}}}
            ]
            severity_stats = list(self.posts_collection.aggregate(severity_pipeline))
            severity_counts = {stat["_id"]: stat["count"] for stat in severity_stats}
            
            top_posts = list(self.posts_collection.find(
                {"score": {"$gt": 0}}, 
                {"title": 1, "platform": 1, "severity": 1, "score": 1}
            ).sort("score", -1).limit(10))
            
            return {
                "total_posts": total_posts,
                "platform_counts": platform_counts,
                "severity_counts": severity_counts,
                "top_posts": top_posts,
                "platforms_scraped": len(platform_counts),
                "critical_vulns": severity_counts.get("critical", 0),
                "high_vulns": severity_counts.get("high", 0),
                "reddit_posts": platform_counts.get("reddit", 0),
                "stackoverflow_posts": platform_counts.get("stackoverflow", 0),
                "total_solutions": self.solutions_collection.count_documents({}) if self.solutions_collection else 0,
                "database_status": "Connected"
            }
        except Exception as e:
            print(f"Error getting stats: {e}")
            return {}

class VulnerabilityScraper:
    def __init__(self, config: Dict):
        """Initialize the vulnerability scraper with configuration"""
        self.config = config
        self.start_time = None
        
        # Initialize APIs
        self.reddit_api = RedditAPI(
            client_id=config.get('reddit_client_id'),
            client_secret=config.get('reddit_client_secret'),
            user_agent=config.get('reddit_user_agent', 'VulnerabilityScraper/1.0')
        )
        
        self.stackoverflow_api = StackOverflowAPI(
            api_key=config.get('stackoverflow_api_key')
        )
        
        # Initialize database
        self.mongodb = VulnerabilityMongoDB(
            connection_string=config.get('mongodb_connection', 'mongodb://localhost:27017/'),
            database_name=config.get('database_name', 'vulnerability_db')
        )
        
        # Initialize email service
        self.email_service = EmailNotificationService(
            from_email=config.get('from_email', 'pravartak99@gmail.com')
        )
    
    def run_scraping_operation(self):
        """Main method to run the complete scraping operation"""
        print("🛡️  Starting HAWK Security Intelligence Collection...")
        print("=" * 60)
        
        self.start_time = datetime.now()
        all_posts = []
        
        # Reddit scraping
        reddit_subreddits = self.config.get('reddit_subreddits', [
            'cybersecurity', 'netsec', 'AskNetsec', 'SecurityCareerAdvice',
            'python', 'javascript', 'webdev', 'sysadmin', 'networking'
        ])
        
        vulnerability_keywords = self.config.get('vulnerability_keywords', [
            'vulnerability', 'security flaw', 'exploit', 'CVE', 'zero-day',
            'SQL injection', 'XSS', 'CSRF', 'RCE', 'privilege escalation',
            'buffer overflow', 'authentication bypass', 'path traversal'
        ])
        
        print("\n🔍 Phase 1: Reddit Intelligence Gathering")
        print("-" * 40)
        
        if self.reddit_api.authenticate():
            reddit_posts = self.reddit_api.search_vulnerability_posts(
                subreddits=reddit_subreddits,
                keywords=vulnerability_keywords,
                limit=self.config.get('reddit_limit', 50)
            )
            all_posts.extend(reddit_posts)
            print(f"✅ Reddit phase completed: {len(reddit_posts)} posts collected")
        else:
            print("❌ Reddit authentication failed, skipping Reddit scraping")
        
        # Stack Overflow scraping
        stackoverflow_tags = self.config.get('stackoverflow_tags', [
            'security', 'vulnerability', 'authentication', 'encryption',
            'sql-injection', 'xss', 'csrf', 'https', 'oauth'
        ])
        
        print("\n🔍 Phase 2: Stack Overflow Intelligence Gathering")
        print("-" * 40)
        
        stackoverflow_posts = self.stackoverflow_api.search_vulnerability_questions(
            tags=stackoverflow_tags,
            keywords=vulnerability_keywords[:5],  # Limit keywords for SO
            pagesize=self.config.get('stackoverflow_limit', 30)
        )
        all_posts.extend(stackoverflow_posts)
        print(f"✅ Stack Overflow phase completed: {len(stackoverflow_posts)} posts collected")
        
        # Data processing and storage
        print(f"\n💾 Phase 3: Data Processing and Storage")
        print("-" * 40)
        
        # Store in MongoDB
        if all_posts:
            self.mongodb.store_posts(all_posts)
            print(f"✅ Stored {len(all_posts)} posts in database")
        
        # Export to CSV
        csv_filename = self.export_to_csv(all_posts)
        print(f"✅ Exported data to {csv_filename}")
        
        # Generate statistics
        execution_time = datetime.now() - self.start_time
        stats = self.mongodb.get_collection_stats()
        stats.update({
            'execution_time': str(execution_time).split('.')[0],
            'total_posts': len(all_posts)
        })
        
        # Send completion email
        print(f"\n📧 Phase 4: Notification")
        print("-" * 40)
        
        recipient_email = self.config.get('notification_email')
        if recipient_email:
            self.email_service.send_scraping_completion_email(recipient_email, stats)
        else:
            print("No notification email configured, skipping email notification")
        
        # Final summary
        print(f"\n🎯 OPERATION COMPLETE")
        print("=" * 60)
        print(f"Total Posts Collected: {len(all_posts)}")
        print(f"Reddit Posts: {len([p for p in all_posts if p.platform == 'reddit'])}")
        print(f"Stack Overflow Posts: {len([p for p in all_posts if p.platform == 'stackoverflow'])}")
        print(f"Execution Time: {execution_time}")
        print(f"CSV Export: {csv_filename}")
        print("=" * 60)
        
        return all_posts, stats
    
    def export_to_csv(self, posts: List[VulnerabilityPost], filename: str = None):
        """Export collected posts to CSV file"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"vulnerability_discussions_{timestamp}.csv"
        
        try:
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = [
                    'platform', 'post_id', 'title', 'author', 'created_date',
                    'score', 'comments_count', 'severity', 'url', 'tags', 'content_preview'
                ]
                
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                
                for post in posts:
                    # Clean content for CSV
                    content_preview = post.content[:200] + "..." if len(post.content) > 200 else post.content
                    content_preview = re.sub(r'\n+', ' ', content_preview)
                    content_preview = re.sub(r'\s+', ' ', content_preview).strip()
                    
                    writer.writerow({
                        'platform': post.platform,
                        'post_id': post.post_id,
                        'title': post.title,
                        'author': post.author,
                        'created_date': post.created_date,
                        'score': post.score,
                        'comments_count': post.comments_count,
                        'severity': post.severity or 'unknown',
                        'url': post.url or '',
                        'tags': ', '.join(post.tags) if post.tags else '',
                        'content_preview': content_preview
                    })
            
            return filename
            
        except Exception as e:
            print(f"Error exporting to CSV: {e}")
            return None

def main():
    """Main function to run the vulnerability scraper"""
    
    # Configuration - Update these with your actual credentials
    config = {
        # Reddit API credentials
        'reddit_client_id': os.environ.get('REDDIT_CLIENT_ID', 'YOUR_REDDIT_CLIENT_ID'),
        'reddit_client_secret': os.environ.get('REDDIT_CLIENT_SECRET', 'YOUR_REDDIT_CLIENT_SECRET'),
        'reddit_user_agent': 'HAWK-Security-Intelligence/1.0 by YourUsername',
        
        # Stack Overflow API key (optional)
        'stackoverflow_api_key': os.environ.get('STACKOVERFLOW_API_KEY'),  # Optional
        
        # MongoDB configuration
        'mongodb_connection': os.environ.get('MONGODB_CONNECTION', 'mongodb://localhost:27017/'),
        'database_name': 'hawk_security_db',
        
        # Email notification
        'notification_email': os.environ.get('NOTIFICATION_EMAIL', 'your-email@example.com'),
        'from_email': 'hawk-security@your-domain.com',
        
        # Scraping limits
        'reddit_limit': 50,
        'stackoverflow_limit': 30,
        
        # Custom subreddits and keywords
        'reddit_subreddits': [
            'cybersecurity', 'netsec', 'AskNetsec', 'SecurityCareerAdvice',
            'python', 'javascript', 'webdev', 'sysadmin', 'networking',
            'programming', 'webappsec', 'ReverseEngineering'
        ],
        
        'stackoverflow_tags': [
            'security', 'vulnerability', 'authentication', 'encryption',
            'sql-injection', 'xss', 'csrf', 'https', 'oauth', 'cors'
        ],
        
        'vulnerability_keywords': [
            'vulnerability', 'security flaw', 'exploit', 'CVE', 'zero-day',
            'SQL injection', 'XSS', 'CSRF', 'RCE', 'privilege escalation',
            'buffer overflow', 'authentication bypass', 'path traversal',
            'XXE', 'SSRF', 'deserialization', 'race condition'
        ]
    }
    
    # Create and run the scraper
    scraper = VulnerabilityScraper(config)
    
    try:
        posts, stats = scraper.run_scraping_operation()
        print(f"\n✅ Successfully completed vulnerability intelligence collection!")
        print(f"Check the generated CSV file and database for collected data.")
        
    except KeyboardInterrupt:
        print(f"\n⚠️  Operation interrupted by user")
        
    except Exception as e:
        print(f"\n❌ Error during scraping operation: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()