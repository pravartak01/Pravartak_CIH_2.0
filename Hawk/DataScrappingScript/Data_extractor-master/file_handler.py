import os
from datetime import datetime
import logging

class FileHandler:
    def __init__(self, output_dir='output'):
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

    def save_to_file(self, vulnerabilities):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'vulnerabilities_{timestamp}.txt'
        filepath = os.path.join(self.output_dir, filename)

        try:
            with open(filepath, 'w') as f:
                f.write("Vulnerability Report\n")
                f.write("===================\n\n")
                
                for vuln in vulnerabilities:
                    f.write(f"Product: {vuln['productName']} {vuln['productVersion']}\n")
                    f.write(f"Vendor: {vuln['oemName']}\n")
                    f.write(f"Severity: {vuln['severityLevel']}\n")
                    f.write(f"ID: {vuln['uniqueID']}\n")
                    f.write(f"Published: {vuln['publishedDate']}\n")
                    f.write("\nDescription:\n")
                    f.write(f"{vuln['vulnerabilityDescription']}\n")
                    f.write("\nMitigation:\n")
                    f.write(f"{vuln['mitigationStrategy']}\n")
                    f.write("\nReferences:\n")
                    for ref in vuln['references']:
                        f.write(f"- {ref}\n")
                    f.write("\nAdditional Information:\n")
                    f.write(f"CVSS Score: {vuln['additionalInfo']['cvssScore']}\n")
                    f.write(f"Vector: {vuln['additionalInfo']['vector']}\n")
                    f.write(f"Exploitability Score: {vuln['additionalInfo']['exploitabilityScore']}\n")
                    f.write("\n" + "="*50 + "\n\n")

            logging.info(f"Successfully saved vulnerabilities to {filepath}")
            return filepath
        except Exception as e:
            logging.error(f"Error saving to file: {str(e)}")
            raise