from datetime import datetime

from pymongo import MongoClient

vulnerability_schema = {
    'productName': str,
    'productVersion': str,
    'oemName': str,
    'severityLevel': str,
    'vulnerabilityDescription': str,
    'mitigationStrategy': str,
    'publishedDate': str,
    'uniqueID': str,
    'references': list,
    'additionalInfo': {
        'cvssScore': float,
        'vector': str,
        'exploitabilityScore': float
    }
}

def validate_schema(data):
    try:
        assert isinstance(data['productName'], str)
        assert isinstance(data['productVersion'], str)
        assert isinstance(data['oemName'], str)
        assert isinstance(data['severityLevel'], str)
        assert isinstance(data['vulnerabilityDescription'], str)
        assert isinstance(data['mitigationStrategy'], str)
        assert isinstance(data['publishedDate'], str)
        assert isinstance(data['uniqueID'], str)
        assert isinstance(data['references'], list)
        assert isinstance(data['additionalInfo'], dict)
        assert isinstance(data['additionalInfo']['cvssScore'], float)
        assert isinstance(data['additionalInfo']['vector'], str)
        assert isinstance(data['additionalInfo']['exploitabilityScore'], float)
        return True
    except (KeyError, AssertionError):
        return False