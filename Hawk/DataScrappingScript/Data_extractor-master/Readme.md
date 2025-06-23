Make sure that these all are filled :

NVD_API_KEY=your_actual_nvd_api_key
VULNERS_API_KEY=your_actual_vulners_api_key
MONGO_URI=your_actual_monGO_uri

python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt

python main.py
