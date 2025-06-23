import logging

from pymongo import ASCENDING, MongoClient
from pymongo.errors import PyMongoError

from config import COLLECTION_NAME, DB_NAME, MONGO_URI


class MongoDB:
    def __init__(self):
        self.client = None
        self.db = None
        self.collection = None

    def connect(self):
        try:
            self.client = MongoClient(MONGO_URI)
            self.db = self.client[DB_NAME]
            self.collection = self.db[COLLECTION_NAME]
            
            # Create indexes
            self.collection.create_index([("uniqueID", ASCENDING)], unique=True)
            self.collection.create_index([("publishedDate", ASCENDING)])
            
            logging.info("Successfully connected to MongoDB")
        except PyMongoError as e:
            logging.error(f"Failed to connect to MongoDB: {str(e)}")
            raise

    def insert_vulnerability(self, data):
        try:
            result = self.collection.insert_one(data)
            return result.inserted_id
        except Exception as e:
            logging.error(f"Failed to insert data: {str(e)}")
            raise

    def close(self):
        if self.client:
            self.client.close()