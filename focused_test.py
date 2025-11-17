#!/usr/bin/env python3
"""
Focused test for specific API issues found
"""

import requests
import json

BACKEND_URL = "https://lprconnect.preview.emergentagent.com/api"

def test_missing_endpoints():
    """Test endpoints that were identified as missing"""
    print("Testing missing/problematic endpoints...")
    
    # Test GET /sites/{id} - should return 405 or 404
    response = requests.get(f"{BACKEND_URL}/sites/test-id")
    print(f"GET /sites/{{id}}: Status {response.status_code} - {'Expected 405/404' if response.status_code in [404, 405] else 'Unexpected'}")
    
    # Test GET /plates/{id} - should return 405 or 404  
    response = requests.get(f"{BACKEND_URL}/plates/test-id")
    print(f"GET /plates/{{id}}: Status {response.status_code} - {'Expected 405/404' if response.status_code in [404, 405] else 'Unexpected'}")
    
    # Test GET /cameras/{id} - should return 405 or 404
    response = requests.get(f"{BACKEND_URL}/cameras/test-id")
    print(f"GET /cameras/{{id}}: Status {response.status_code} - {'Expected 405/404' if response.status_code in [404, 405] else 'Unexpected'}")
    
    # Test GET /doors/{id} - should return 405 or 404
    response = requests.get(f"{BACKEND_URL}/doors/test-id")
    print(f"GET /doors/{{id}}: Status {response.status_code} - {'Expected 405/404' if response.status_code in [404, 405] else 'Unexpected'}")

def test_working_endpoints():
    """Test endpoints that should be working"""
    print("\nTesting working endpoints...")
    
    # Test plates API
    response = requests.get(f"{BACKEND_URL}/plates")
    print(f"GET /plates: Status {response.status_code} - {'✅ Working' if response.status_code == 200 else '❌ Failed'}")
    
    # Test sites API
    response = requests.get(f"{BACKEND_URL}/sites")
    print(f"GET /sites: Status {response.status_code} - {'✅ Working' if response.status_code == 200 else '❌ Failed'}")
    
    # Test doors API
    response = requests.get(f"{BACKEND_URL}/doors")
    print(f"GET /doors: Status {response.status_code} - {'✅ Working' if response.status_code == 200 else '❌ Failed'}")
    
    # Test cameras API
    response = requests.get(f"{BACKEND_URL}/cameras")
    print(f"GET /cameras: Status {response.status_code} - {'✅ Working' if response.status_code == 200 else '❌ Failed'}")

if __name__ == "__main__":
    test_missing_endpoints()
    test_working_endpoints()