import logging
from datetime import datetime

import requests
from bs4 import BeautifulSoup

from config import NVD_API_KEY, NVD_API_URL, VULNERS_API_KEY, VULNERS_API_URL


class VulnerabilityExtractor:
    def __init__(self):
        self.session = requests.Session()

    def extract_nvd_data(self):
        try:
            headers = {'apiKey': NVD_API_KEY}
            params = {
                'resultsPerPage': 20,  # Limit results for testing
                'startIndex': 0
            }
            response = self.session.get(NVD_API_URL, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            vulnerabilities = []
            for vuln in data.get('vulnerabilities', []):
                processed_vuln = self._process_nvd_vulnerability(vuln)
                if processed_vuln:
                    vulnerabilities.append(processed_vuln)
            
            return vulnerabilities
        except Exception as e:
            logging.error(f"Error extracting NVD data: {str(e)}")
            return []

    

    def extract_vulners_data(self, query="type:cve"):
        try:
            headers = {'apiKey': VULNERS_API_KEY}
            data = {'query': query}
            response = self.session.post(VULNERS_API_URL, headers=headers, json=data)
            response.raise_for_status()
            data = response.json()
            
            vulnerabilities = []
            for vuln in data.get('data', {}).get('search', []):
                processed_vuln = self._process_vulners_vulnerability(vuln)
                if processed_vuln:
                    vulnerabilities.append(processed_vuln)
            
            return vulnerabilities
        except Exception as e:
            logging.error(f"Error extracting Vulners data: {str(e)}")
            return []

    def _process_nvd_vulnerability(self, vuln):
        try:
            cve = vuln.get('cve', {})
            metrics = cve.get('metrics', {}).get('cvssMetricV31', [{}])[0].get('cvssData', {})
            
            return {
                'productName': self._extract_product_name(cve),
                'productVersion': self._extract_product_version(cve),
                'oemName': self._extract_vendor_name(cve),
                'severityLevel': metrics.get('baseSeverity', 'Unknown'),
                'vulnerabilityDescription': cve.get('descriptions', [{}])[0].get('value', ''),
                'mitigationStrategy': self._extract_mitigation(cve),
                'publishedDate': cve.get('published', ''),
                'uniqueID': cve.get('id', ''),
                'references': self._extract_references(cve),
                'additionalInfo': {
                    'cvssScore': float(metrics.get('baseScore', 0.0)),
                    'vector': metrics.get('vectorString', ''),
                    'exploitabilityScore': float(metrics.get('exploitabilityScore', 0.0))
                }
            }
        except Exception as e:
            logging.error(f"Error processing NVD vulnerability: {str(e)}")
            return None

    def _process_vulners_vulnerability(self, vuln):
        try:
            return {
                'productName': vuln.get('title', '').split(' ')[0],
                'productVersion': self._extract_version_from_title(vuln.get('title', '')),
                'oemName': vuln.get('reporter', ''),
                'severityLevel': self._convert_cvss_to_severity(vuln.get('cvss', {}).get('score', 0)),
                'vulnerabilityDescription': vuln.get('description', ''),
                'mitigationStrategy': vuln.get('solution', ''),
                'publishedDate': vuln.get('published', ''),
                'uniqueID': vuln.get('id', ''),
                'references': vuln.get('references', []),
                'additionalInfo': {
                    'cvssScore': float(vuln.get('cvss', {}).get('score', 0)),
                    'vector': vuln.get('cvss', {}).get('vector', ''),
                    'exploitabilityScore': float(vuln.get('cvss', {}).get('exploitability', 0))
                }
            }
        except Exception as e:
            logging.error(f"Error processing Vulners vulnerability: {str(e)}")
            return None

    def _extract_product_name(self, cve):
        try:
            configurations = cve.get('configurations', [])
            if configurations:
                nodes = configurations[0].get('nodes', [])
                if nodes:
                    cpe_match = nodes[0].get('cpeMatch', [])
                    if cpe_match:
                        cpe = cpe_match[0].get('criteria', '')
                        parts = cpe.split(':')
                        if len(parts) > 4:
                            return parts[4]
        except Exception:
            pass
        return 'Unknown Product'

    def _extract_product_version(self, cve):
        try:
            configurations = cve.get('configurations', [])
            if configurations:
                nodes = configurations[0].get('nodes', [])
                if nodes:
                    cpe_match = nodes[0].get('cpeMatch', [])
                    if cpe_match:
                        cpe = cpe_match[0].get('criteria', '')
                        parts = cpe.split(':')
                        if len(parts) > 5:
                            return parts[5]
        except Exception:
            pass
        return 'Unknown Version'

    def _extract_vendor_name(self, cve):
        try:
            configurations = cve.get('configurations', [])
            if configurations:
                nodes = configurations[0].get('nodes', [])
                if nodes:
                    cpe_match = nodes[0].get('cpeMatch', [])
                    if cpe_match:
                        cpe = cpe_match[0].get('criteria', '')
                        parts = cpe.split(':')
                        if len(parts) > 3:
                            return parts[3]
        except Exception:
            pass
        return 'Unknown Vendor'

    def _extract_mitigation(self, cve):
        try:
            for ref in cve.get('references', []):
                if 'patch' in ref.get('tags', []) or 'mitigation' in ref.get('tags', []):
                    return f"See patch/mitigation at: {ref.get('url', '')}"
        except Exception:
            pass
        return 'No mitigation information available'

    def _extract_references(self, cve):
        try:
            return [ref.get('url', '') for ref in cve.get('references', [])]
        except Exception:
            return []

    def _extract_version_from_title(self, title):
        import re
        version_match = re.search(r'\d+\.[\d\.]+', title)
        return version_match.group(0) if version_match else 'Unknown Version'

    def _convert_cvss_to_severity(self, score):
        try:
            score = float(score)
            if score >= 9.0:
                return 'Critical'
            elif score >= 7.0:
                return 'High'
            elif score >= 4.0:
                return 'Medium'
            else:
                return 'Low'
        except:
            return 'Unknown'