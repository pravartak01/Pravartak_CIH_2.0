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

class RedditAPI:
    def __init__(self, client_id: str, client_secret: str, user_agent: str):
        self.client_id = client_id
        self.client_secret = client_secret
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
                timeout=30  # Add timeout
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
                    'limit': min(limit, 25),  # Reduce batch size
                    'restrict_sr': 'true',
                    't': 'month'  # Reduce time range to avoid timeouts
                }
                
                try:
                    response = requests.get(
                        url, 
                        headers=self.get_headers(), 
                        params=params,
                        timeout=30  # Add timeout
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        posts_found = len(data['data']['children'])
                        print(f"    Found {posts_found} posts")
                        
                        for post in data['data']['children']:
                            post_data = post['data']
                            
                            # Skip getting comments initially to avoid timeouts
                            # comments = self.get_post_comments(subreddit, post_data['id'])
                            comments = []  # Skip comments for now
                            
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
                
                # Rate limiting - be more conservative
                time.sleep(2)
                
                # Progress update
                if total_processed > 0 and total_processed % 10 == 0:
                    print(f"  Processed {total_processed} posts so far...")
        
        print(f"Reddit collection completed. Total posts: {len(posts)}")
        return posts
    
    def get_post_comments(self, subreddit: str, post_id: str):
        """Get comments from a specific post with timeout"""
        url = f"{self.base_url}/r/{subreddit}/comments/{post_id}"
        
        try:
            response = requests.get(url, headers=self.get_headers(), timeout=15)
            time.sleep(1)
            
            solutions = []
            if response.status_code == 200:
                data = response.json()
                if len(data) > 1:  # Comments exist
                    comments = data[1]['data']['children']
                    for comment in comments[:5]:  # Limit to top 5 comments
                        if comment['kind'] == 't1':  # Regular comment
                            comment_data = comment['data']
                            if comment_data.get('body') and len(comment_data['body']) > 50:
                                solution = {
                                    'comment_id': comment_data['id'],
                                    'author': comment_data['author'],
                                    'content': comment_data['body'][:500],  # Truncate long comments
                                    'score': comment_data['score'],
                                    'created': datetime.fromtimestamp(comment_data['created_utc']).isoformat(),
                                    'is_solution': self.is_potential_solution(comment_data['body']),
                                    'depth': comment_data.get('depth', 0)
                                }
                                solutions.append(solution)
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching comments: {e}")
            
        return solutions
    
    def is_potential_solution(self, comment_text: str) -> bool:
        """Determine if a comment contains potential solution keywords"""
        solution_keywords = [
            'fixed', 'solved', 'solution', 'try this', 'worked for me',
            'here\'s how', 'you need to', 'the fix is', 'update to',
            'patch', 'workaround', 'configure', 'install'
        ]
        
        text_lower = comment_text.lower()
        return any(keyword in text_lower for keyword in solution_keywords)

class StackOverflowAPI:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.base_url = "https://api.stackexchange.com/2.3"
        
    def search_vulnerability_questions(self, tags: List[str], keywords: List[str], 
                                     site: str = 'stackoverflow', pagesize: int = 100):
        """Search for vulnerability-related questions with better error handling"""
        posts = []
        total_processed = 0
        
        # Limit the search to avoid timeouts
        limited_tags = tags[:5]  # Use only first 5 tags
        limited_keywords = keywords[:3]  # Use only first 3 keywords
        
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
                    'pagesize': min(pagesize, 30),  # Reduce batch size
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
                            # Skip getting answers initially to avoid timeouts
                            # answers = self.get_question_answers(item['question_id'], site)
                            answers = []  # Skip answers for now
                            
                            vuln_post = VulnerabilityPost(
                                platform='stackoverflow',
                                post_id=str(item['question_id']),
                                title=item['title'],
                                content=item.get('body', '')[:1000],  # Truncate long content
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
                
                # Stack Overflow rate limiting
                time.sleep(0.5)
                
                # Progress update
                if total_processed > 0 and total_processed % 10 == 0:
                    print(f"  Processed {total_processed} questions so far...")
        
        print(f"Stack Overflow collection completed. Total posts: {len(posts)}")
        return posts
    
    def get_question_answers(self, question_id: int, site: str = 'stackoverflow'):
        """Get answers for a specific question with timeout"""
        url = f"{self.base_url}/questions/{question_id}/answers"
        params = {
            'order': 'desc',
            'sort': 'votes',
            'site': site,
            'filter': 'withbody',
            'pagesize': 5  # Limit answers
        }
        
        if self.api_key:
            params['key'] = self.api_key
        
        try:
            response = requests.get(url, params=params, timeout=15)
            time.sleep(0.2)
            
            solutions = []
            if response.status_code == 200:
                data = response.json()
                for answer in data.get('items', []):
                    solution = {
                        'answer_id': answer['answer_id'],
                        'author': answer['owner']['display_name'],
                        'content': answer['body'][:500],  # Truncate content
                        'score': answer['score'],
                        'is_accepted': answer.get('is_accepted', False),
                        'created': datetime.fromtimestamp(answer['creation_date']).isoformat(),
                        'is_solution': True
                    }
                    solutions.append(solution)
                    
        except requests.exceptions.RequestException as e:
            print(f"Error fetching answers: {e}")
            solutions = []
        
        return solutions
    
    def classify_severity(self, text: str) -> str:
        """Enhanced severity classification based on keywords and patterns"""
        text_lower = text.lower()
        
        # Critical vulnerabilities
        critical_keywords = [
            'critical', 'exploit', 'rce', 'remote code execution', 
            'privilege escalation', 'arbitrary code execution',
            'buffer overflow', 'heap overflow', 'stack overflow vulnerability'
        ]
        
        # High severity vulnerabilities
        high_keywords = [
            'sql injection', 'sqli', 'xss', 'cross-site scripting',
            'csrf', 'cross-site request forgery', 'authentication bypass',
            'authorization bypass', 'path traversal', 'directory traversal',
            'xxe', 'xml external entity'
        ]
        
        # Medium severity
        medium_keywords = [
            'information disclosure', 'information leakage',
            'denial of service', 'dos', 'ddos', 'session hijacking',
            'clickjacking', 'open redirect', 'security misconfiguration'
        ]
        
        # Low severity
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
            # Test connection
            self.client.server_info()
            self.db = self.client[database_name]
            self.posts_collection = self.db.vulnerability_posts
            self.solutions_collection = self.db.solutions
            self.analytics_collection = self.db.analytics
            
            # Create indexes for better performance
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
            # Posts collection indexes
            self.posts_collection.create_index([("post_id", 1), ("platform", 1)], unique=True)
            self.posts_collection.create_index([("platform", 1)])
            self.posts_collection.create_index([("severity", 1)])
            self.posts_collection.create_index([("score", -1)])
            self.posts_collection.create_index([("created_date", -1)])
            self.posts_collection.create_index([("tags", 1)])
            
            # Text index for search functionality
            self.posts_collection.create_index([
                ("title", "text"), 
                ("content", "text")
            ])
            
            # Solutions collection indexes
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
            
            # Extract solutions separately
            solutions = post_dict.pop('solutions', [])
            
            # Add metadata
            post_dict['created_at'] = datetime.utcnow()
            post_dict['updated_at'] = datetime.utcnow()
            
            posts_to_insert.append(post_dict)
            
            # Prepare solutions with reference to post
            for solution in solutions:
                solution_doc = {
                    'post_id': post.post_id,
                    'platform': post.platform,
                    'created_at': datetime.utcnow(),
                    **solution
                }
                solutions_to_insert.append(solution_doc)
        
        # Bulk insert posts (with upsert to handle duplicates)
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
        
        # Bulk insert solutions
        if solutions_to_insert:
            try:
                # Remove duplicates based on comment_id/answer_id
                unique_solutions = []
                seen_ids = set()
                
                for solution in solutions_to_insert:
                    solution_id = solution.get('comment_id') or solution.get('answer_id')
                    if solution_id and solution_id not in seen_ids:
                        seen_ids.add(solution_id)
                        unique_solutions.append(solution)
                
                if unique_solutions:
                    self.solutions_collection.insert_many(unique_solutions, ordered=False)
                    print(f"Stored {len(unique_solutions)} solutions")
                    
            except Exception as e:
                print(f"Error storing solutions: {e}")
    
    def get_vulnerability_stats(self):
        """Generate vulnerability statistics"""
        if not self.db:
            return []
            
        try:
            pipeline = [
                {
                    '$group': {
                        '_id': '$severity',
                        'count': {'$sum': 1},
                        'avg_score': {'$avg': '$score'},
                        'total_solutions': {'$sum': '$comments_count'}
                    }
                },
                {'$sort': {'count': -1}}
            ]
            
            return list(self.posts_collection.aggregate(pipeline))
        except Exception as e:
            print(f"Error getting stats: {e}")
            return []
    
    def export_to_csv(self, filename: str = 'vulnerability_data.csv', posts: List[VulnerabilityPost] = None):
        """Export data to CSV - can work with or without database"""
        try:
            if posts:
                # Export from provided posts list
                with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                    fieldnames = ['platform', 'post_id', 'title', 'author', 'score', 'severity', 'url', 'created_date']
                    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                    writer.writeheader()
                    
                    for post in posts:
                        writer.writerow({
                            'platform': post.platform,
                            'post_id': post.post_id,
                            'title': post.title[:100],  # Truncate long titles
                            'author': post.author,
                            'score': post.score,
                            'severity': post.severity or 'unknown',
                            'url': post.url,
                            'created_date': post.created_date
                        })
                
                print(f"Exported {len(posts)} posts to {filename}")
            
            elif self.db:
                # Export from database
                posts_data = list(self.posts_collection.find({}))
                
                with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                    if posts_data:
                        fieldnames = ['platform', 'post_id', 'title', 'author', 'score', 'severity', 'url', 'created_date']
                        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                        writer.writeheader()
                        
                        for post in posts_data:
                            writer.writerow({
                                'platform': post.get('platform', ''),
                                'post_id': post.get('post_id', ''),
                                'title': str(post.get('title', ''))[:100],
                                'author': post.get('author', ''),
                                'score': post.get('score', 0),
                                'severity': post.get('severity', 'unknown'),
                                'url': post.get('url', ''),
                                'created_date': post.get('created_date', '')
                            })
                        
                        print(f"Exported {len(posts_data)} posts to {filename}")
            
        except Exception as e:
            print(f"Error exporting to CSV: {e}")
    
    def close_connection(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()

def main():
    """Main execution function with better error handling"""
    print("Starting Vulnerability Data Collector...")
    print("=" * 50)
    
    # Configuration
    MONGODB_CONFIG = {
        'connection_string': 'mongodb://localhost:27017/',
        'database_name': 'vulnerability_intelligence'
    }
    
    REDDIT_CONFIG = {
        'client_id': 'w7WA7ojvZ8WJlANRJVCB7Q',
        'client_secret': 'SS3AnwhLsf7-9YOk4QG1o5ggc_yIIQ',
        'user_agent': 'VulnDataCollector/2.0 by Weekly_Ad_7786'
    }
    
    STACKOVERFLOW_CONFIG = {
        'api_key': None  # Set to None if you don't have one
    }
    
    # Reduced keywords and subreddits to avoid timeouts
    VULNERABILITY_KEYWORDS = [
        'vulnerability', 'exploit', 'CVE', 'security bug'
    ]
    
    REDDIT_SUBREDDITS = [
        'netsec', 'cybersecurity', 'AskNetsec'
    ]
    
    STACKOVERFLOW_TAGS = [
        'security', 'vulnerability', 'authentication'
    ]
    
    # Initialize MongoDB database
    db = VulnerabilityMongoDB(**MONGODB_CONFIG)
    all_posts = []
    
    try:
        # Collect from Reddit
        print("Phase 1: Collecting data from Reddit...")
        print("-" * 30)
        reddit_api = RedditAPI(**REDDIT_CONFIG)
        
        reddit_posts = []
        if reddit_api.authenticate():
            reddit_posts = reddit_api.search_vulnerability_posts(
                REDDIT_SUBREDDITS, VULNERABILITY_KEYWORDS, limit=20
            )
            if reddit_posts:
                db.store_posts(reddit_posts)
                all_posts.extend(reddit_posts)
                print(f"✓ Collected {len(reddit_posts)} posts from Reddit")
            else:
                print("No posts collected from Reddit")
        else:
            print("✗ Failed to authenticate with Reddit")
        
        # Collect from Stack Overflow
        print("\nPhase 2: Collecting data from Stack Overflow...")
        print("-" * 30)
        so_api = StackOverflowAPI(**STACKOVERFLOW_CONFIG)
        so_posts = so_api.search_vulnerability_questions(
            STACKOVERFLOW_TAGS, VULNERABILITY_KEYWORDS, pagesize=20
        )
        if so_posts:
            db.store_posts(so_posts)
            all_posts.extend(so_posts)
            print(f"✓ Collected {len(so_posts)} posts from Stack Overflow")
        else:
            print("No posts collected from Stack Overflow")
        
        # Generate analytics
        print(f"\nPhase 3: Analytics and Export")
        print("-" * 30)
        print(f"Total posts collected: {len(all_posts)}")
        
        if all_posts:
            # Count by platform
            reddit_count = len([p for p in all_posts if p.platform == 'reddit'])
            so_count = len([p for p in all_posts if p.platform == 'stackoverflow'])
            print(f"Reddit posts: {reddit_count}")
            print(f"Stack Overflow posts: {so_count}")
            
            # Count by severity
            severity_counts = {}
            for post in all_posts:
                severity = post.severity or 'unknown'
                severity_counts[severity] = severity_counts.get(severity, 0) + 1
            
            print("\nSeverity distribution:")
            for severity, count in sorted(severity_counts.items()):
                print(f"  {severity}: {count}")
        
        # Export data
        print("\nExporting data...")
        db.export_to_csv('vulnerability_discussions.csv', all_posts)
        
        # Get database stats if available
        stats = db.get_vulnerability_stats()
        if stats:
            print("\nDatabase Statistics:")
            for stat in stats:
                print(f"Severity: {stat['_id']}, Count: {stat['count']}, Avg Score: {stat.get('avg_score', 0):.2f}")
        
        print("\n✓ Data collection completed successfully!")
        
    except KeyboardInterrupt:
        print("\n\nCollection interrupted by user")
    except Exception as e:
        print(f"\nError in main execution: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        db.close_connection()
        print("Database connection closed")

if __name__ == "__main__":
    main()