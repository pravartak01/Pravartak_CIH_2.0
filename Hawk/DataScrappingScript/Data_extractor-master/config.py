import os

from dotenv import load_dotenv

load_dotenv()

# API Configuration
NVD_API_KEY = os.getenv('NVD_API_KEY')
VULNERS_API_KEY = os.getenv('VULNERS_API_KEY')

# MongoDB Configuration
MONGO_URI = os.getenv('MONGO_URI')
DB_NAME = 'hawk'
COLLECTION_NAME = 'vulnerabilities'

# API Endpoints
NVD_API_URL = 'https://services.nvd.nist.gov/rest/json/cves/2.0'
VULNERS_API_URL = 'https://vulners.com/api/v3/search/lucene/'
