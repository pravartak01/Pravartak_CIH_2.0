import logging
import os
from datetime import datetime

from database import MongoDB
from extractors import VulnerabilityExtractor
from file_handler import FileHandler
from schema import validate_schema

# Configure logging
logging.basicConfig(
    filename=f'vulnerability_extractor_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def main():
    try:
        # Initialize components
        extractor = VulnerabilityExtractor()
        db = MongoDB()
        file_handler = FileHandler()
        
        # Connect to MongoDB
        db.connect()
        
        # Extract vulnerabilities from all sources
        vulnerabilities = []
        
        # NVD Data
        nvd_vulns = extractor.extract_nvd_data()
        logging.info(f"Extracted {len(nvd_vulns)} vulnerabilities from NVD")
        vulnerabilities.extend(nvd_vulns)
    
        # Vulners Data
        vulners_vulns = extractor.extract_vulners_data()
        logging.info(f"Extracted {len(vulners_vulns)} vulnerabilities from Vulners")
        vulnerabilities.extend(vulners_vulns)
        
        # Process and store vulnerabilities
        valid_vulns = []
        for vuln in vulnerabilities:
            if validate_schema(vuln):
                try:
                    db.insert_vulnerability(vuln)
                    valid_vulns.append(vuln)
                    logging.info(f"Successfully stored vulnerability {vuln['uniqueID']}")
                except Exception as e:
                    logging.error(f"Failed to store vulnerability {vuln['uniqueID']}: {str(e)}")
            else:
                logging.warning(f"Invalid vulnerability data format for {vuln.get('uniqueID', 'unknown')}")
        
        # Save to file
        if valid_vulns:
            output_file = file_handler.save_to_file(valid_vulns)
            logging.info(f"Saved {len(valid_vulns)} vulnerabilities to {output_file}")
        
        logging.info("Vulnerability extraction completed successfully")
        
    except Exception as e:
        logging.error(f"Fatal error in main execution: {str(e)}")
        raise
    finally:
        if 'db' in locals():
            db.close()

if __name__ == "__main__":
    main()