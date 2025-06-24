"""
Test script to verify Reddit and Stack Overflow API credentials
Run this before using the main vulnerability collector
"""

import requests
import pymongo
from pymongo import MongoClient

def test_reddit_credentials():
    """Test Reddit API authentication"""
    print("Testing Reddit API credentials...")
    
    # Replace with your actual credentials
    CLIENT_ID = 'w7WA7ojvZ8WJlANRJVCB7Q'
    CLIENT_SECRET = 'SS3AnwhLsf7-9YOk4QG1o5ggc_yIIQ'
    USER_AGENT = 'VulnDataCollector/1.0 by Weekly_Ad_7786 '
    
    if CLIENT_ID == 'YOUR_REDDIT_CLIENT_ID':
        print("❌ Please update CLIENT_ID with your actual Reddit client ID")
        return False
    
    auth_url = "https://www.reddit.com/api/v1/access_token"
    auth = requests.auth.HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET)
    data = {'grant_type': 'client_credentials'}
    headers = {'User-Agent': USER_AGENT}
    
    try:
        response = requests.post(auth_url, auth=auth, data=data, headers=headers)
        
        if response.status_code == 200:
            token_data = response.json()
            if 'access_token' in token_data:
                print("✅ Reddit API authentication successful!")
                
                # Test a simple API call
                test_url = "https://oauth.reddit.com/r/test/hot"
                test_headers = {
                    'Authorization': f'bearer {token_data["access_token"]}',
                    'User-Agent': USER_AGENT
                }
                
                test_response = requests.get(test_url, headers=test_headers)
                if test_response.status_code == 200:
                    print("✅ Reddit API call test successful!")
                    return True
                else:
                    print(f"❌ Reddit API call failed: {test_response.status_code}")
                    return False
            else:
                print("❌ No access token received")
                return False
        else:
            print(f"❌ Reddit authentication failed: {response.status_code}")
            if response.status_code == 401:
                print("   Check your client ID and client secret")
            elif response.status_code == 400:
                error_data = response.json()
                print(f"   Error: {error_data.get('error_description', 'Bad request')}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return False

def test_stackoverflow_credentials():
    """Test Stack Overflow API"""
    print("\nTesting Stack Overflow API...")
    
    # Stack Overflow API key (optional)
    API_KEY = 'YOUR_STACKOVERFLOW_API_KEY'  # Can be None
    
    base_url = "https://api.stackexchange.com/2.3"
    test_url = f"{base_url}/questions"
    
    params = {
        'order': 'desc',
        'sort': 'activity',
        'site': 'stackoverflow',
        'pagesize': 1,
        'tagged': 'security'
    }
    
    if API_KEY and API_KEY != 'YOUR_STACKOVERFLOW_API_KEY':
        params['key'] = API_KEY
        print("Using API key for higher rate limits")
    else:
        print("No API key provided (using lower rate limits)")
    
    try:
        response = requests.get(test_url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            if 'items' in data:
                print("✅ Stack Overflow API test successful!")
                print(f"   Quota remaining: {data.get('quota_remaining', 'Unknown')}")
                return True
            else:
                print("❌ Unexpected response format")
                return False
        else:
            print(f"❌ Stack Overflow API failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return False

def test_mongodb_connection():
    """Test MongoDB connection"""
    print("\nTesting MongoDB connection...")
    
    # MongoDB connection strings to test
    connection_strings = [
        'mongodb://localhost:27017/',
        'mongodb://127.0.0.1:27017/',
    ]
    
    for conn_str in connection_strings:
        try:
            print(f"Trying to connect to: {conn_str}")
            client = MongoClient(conn_str, serverSelectionTimeoutMS=3000)
            
            # Test connection
            client.admin.command('ping')
            
            # Test database operations
            db = client.test_db
            collection = db.test_collection
            
            # Insert test document
            test_doc = {'test': 'document', 'timestamp': '2024-01-01'}
            result = collection.insert_one(test_doc)
            
            # Retrieve test document
            retrieved = collection.find_one({'_id': result.inserted_id})
            
            # Clean up
            collection.delete_one({'_id': result.inserted_id})
            client.close()
            
            if retrieved:
                print("✅ MongoDB connection and operations successful!")
                return True
                
        except pymongo.errors.ServerSelectionTimeoutError:
            print(f"❌ Cannot connect to MongoDB at {conn_str}")
            continue
        except Exception as e:
            print(f"❌ MongoDB error: {e}")
            continue
    
    print("❌ MongoDB connection failed. Make sure MongoDB is running.")
    print("   Start MongoDB:")
    print("   - Windows: Run 'mongod' or start MongoDB service")
    print("   - macOS: brew services start mongodb/brew/mongodb-community")
    print("   - Linux: sudo systemctl start mongod")
    print("   - Docker: docker run -d -p 27017:27017 mongo:latest")
    return False

def main():
    """Run all credential tests"""
    print("🔧 API Credentials and Dependencies Test")
    print("=" * 50)
    
    results = []
    
    # Test Reddit
    results.append(test_reddit_credentials())
    
    # Test Stack Overflow
    results.append(test_stackoverflow_credentials())
    
    # Test MongoDB
    results.append(test_mongodb_connection())
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    
    services = ['Reddit API', 'Stack Overflow API', 'MongoDB']
    for i, (service, result) in enumerate(zip(services, results)):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {service}: {status}")
    
    if all(results):
        print("\n🎉 All tests passed! You're ready to run the vulnerability collector.")
    else:
        print("\n⚠️  Some tests failed. Please fix the issues above before proceeding.")
        print("\nCommon solutions:")
        print("1. Reddit API issues:")
        print("   - Make sure redirect URI is set (use http://localhost:8080)")
        print("   - Verify app type is 'script'")
        print("   - Check client ID and secret are correct")
        print("\n2. MongoDB issues:")
        print("   - Install MongoDB: https://www.mongodb.com/try/download/community")
        print("   - Start MongoDB service")
        print("   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas")

if __name__ == "__main__":
    main()