#!/usr/bin/env python3
"""
Backend API Test Suite for License Plate Recognition System
Tests all CRUD operations for Sites, Plates, Cameras, Doors, and System APIs
"""

import requests
import json
import uuid
from datetime import datetime, timezone
import time

# Backend URL from environment
BACKEND_URL = "https://lprconnect.preview.emergentagent.com/api"

class LPRSystemTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        self.created_resources = {
            'sites': [],
            'plates': [],
            'cameras': [],
            'doors': []
        }
    
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat()
        }
        if response_data:
            result['response'] = response_data
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
    
    def make_request(self, method, endpoint, data=None, params=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        try:
            if method == "GET":
                response = requests.get(url, params=params, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, timeout=10)
            elif method == "PUT":
                response = requests.put(url, json=data, timeout=10)
            elif method == "DELETE":
                response = requests.delete(url, timeout=10)
            
            return response
        except requests.exceptions.RequestException as e:
            return None
    
    # ==================== SITES API TESTS ====================
    
    def test_sites_api(self):
        """Test Sites CRUD operations"""
        print("\n=== TESTING SITES API ===")
        
        # Test GET all sites (initial)
        response = self.make_request("GET", "/sites")
        if response and response.status_code == 200:
            self.log_test("GET /sites", True, f"Retrieved sites successfully. Count: {len(response.json())}")
        else:
            self.log_test("GET /sites", False, f"Failed to get sites. Status: {response.status_code if response else 'No response'}")
        
        # Test POST new site
        site_data = {
            "name": "Sunset Residences",
            "blocks": [
                {"name": "A Block", "apartments": 24},
                {"name": "B Block", "apartments": 20},
                {"name": "C Block", "apartments": 18}
            ]
        }
        
        response = self.make_request("POST", "/sites", site_data)
        if response and response.status_code == 200:
            site_id = response.json()["id"]
            self.created_resources['sites'].append(site_id)
            self.log_test("POST /sites", True, f"Created site successfully. ID: {site_id}")
        else:
            self.log_test("POST /sites", False, f"Failed to create site. Status: {response.status_code if response else 'No response'}")
            return
        
        # Test GET specific site
        response = self.make_request("GET", f"/sites/{site_id}")
        if response and response.status_code == 200:
            self.log_test("GET /sites/{id}", True, "Retrieved specific site successfully")
        else:
            self.log_test("GET /sites/{id}", False, f"Failed to get specific site. Status: {response.status_code if response else 'No response'}")
        
        # Test PUT update site
        updated_site_data = {
            "name": "Sunset Residences Updated",
            "blocks": [
                {"name": "A Block", "apartments": 24},
                {"name": "B Block", "apartments": 20},
                {"name": "C Block", "apartments": 18},
                {"name": "D Block", "apartments": 16}
            ]
        }
        
        response = self.make_request("PUT", f"/sites/{site_id}", updated_site_data)
        if response and response.status_code == 200:
            self.log_test("PUT /sites/{id}", True, "Updated site successfully")
        else:
            self.log_test("PUT /sites/{id}", False, f"Failed to update site. Status: {response.status_code if response else 'No response'}")
    
    # ==================== DOORS API TESTS ====================
    
    def test_doors_api(self):
        """Test Doors CRUD operations"""
        print("\n=== TESTING DOORS API ===")
        
        # Test GET all doors
        response = self.make_request("GET", "/doors")
        if response and response.status_code == 200:
            self.log_test("GET /doors", True, f"Retrieved doors successfully. Count: {len(response.json())}")
        else:
            self.log_test("GET /doors", False, f"Failed to get doors. Status: {response.status_code if response else 'No response'}")
        
        # Test POST new door
        door_data = {
            "name": "Main Entrance Door",
            "ip": "192.168.1.100",
            "endpoint": "/kapiac"
        }
        
        response = self.make_request("POST", "/doors", door_data)
        if response and response.status_code == 200:
            door_id = response.json()["id"]
            self.created_resources['doors'].append(door_id)
            self.log_test("POST /doors", True, f"Created door successfully. ID: {door_id}")
        else:
            self.log_test("POST /doors", False, f"Failed to create door. Status: {response.status_code if response else 'No response'}")
            return
        
        # Test PUT update door
        updated_door_data = {
            "name": "Main Entrance Door - Updated",
            "ip": "192.168.1.101",
            "endpoint": "/kapiac1"
        }
        
        response = self.make_request("PUT", f"/doors/{door_id}", updated_door_data)
        if response and response.status_code == 200:
            self.log_test("PUT /doors/{id}", True, "Updated door successfully")
        else:
            self.log_test("PUT /doors/{id}", False, f"Failed to update door. Status: {response.status_code if response else 'No response'}")
        
        # Test POST trigger door open (will fail due to fake IP, but should return proper error)
        response = self.make_request("POST", f"/doors/{door_id}/open")
        if response:
            if response.status_code == 500:
                self.log_test("POST /doors/{id}/open", True, "Door open endpoint working (expected timeout error for fake IP)")
            elif response.status_code == 200:
                self.log_test("POST /doors/{id}/open", True, "Door opened successfully")
            else:
                self.log_test("POST /doors/{id}/open", False, f"Unexpected response. Status: {response.status_code}")
        else:
            self.log_test("POST /doors/{id}/open", False, "No response from door open endpoint")
    
    # ==================== CAMERAS API TESTS ====================
    
    def test_cameras_api(self):
        """Test Cameras CRUD operations"""
        print("\n=== TESTING CAMERAS API ===")
        
        if not self.created_resources['doors']:
            self.log_test("Cameras API", False, "No doors available for camera testing")
            return
        
        door_id = self.created_resources['doors'][0]
        
        # Test GET all cameras
        response = self.make_request("GET", "/cameras")
        if response and response.status_code == 200:
            self.log_test("GET /cameras", True, f"Retrieved cameras successfully. Count: {len(response.json())}")
        else:
            self.log_test("GET /cameras", False, f"Failed to get cameras. Status: {response.status_code if response else 'No response'}")
        
        # Test POST new camera
        camera_data = {
            "name": "Entrance Camera 1",
            "type": "webcam",
            "url": "0",
            "door_id": door_id,
            "fps": 15,
            "position": 0
        }
        
        response = self.make_request("POST", "/cameras", camera_data)
        if response and response.status_code == 200:
            camera_id = response.json()["id"]
            self.created_resources['cameras'].append(camera_id)
            self.log_test("POST /cameras", True, f"Created camera successfully. ID: {camera_id}")
        else:
            self.log_test("POST /cameras", False, f"Failed to create camera. Status: {response.status_code if response else 'No response'}")
            return
        
        # Test PUT update camera
        updated_camera_data = {
            "name": "Entrance Camera 1 - Updated",
            "type": "rtsp",
            "url": "rtsp://192.168.1.200:554/stream",
            "door_id": door_id,
            "fps": 20,
            "position": 1
        }
        
        response = self.make_request("PUT", f"/cameras/{camera_id}", updated_camera_data)
        if response and response.status_code == 200:
            self.log_test("PUT /cameras/{id}", True, "Updated camera successfully")
        else:
            self.log_test("PUT /cameras/{id}", False, f"Failed to update camera. Status: {response.status_code if response else 'No response'}")
        
        # Test camera start
        response = self.make_request("POST", f"/cameras/{camera_id}/start")
        if response and response.status_code == 200:
            self.log_test("POST /cameras/{id}/start", True, "Camera start endpoint working")
        else:
            self.log_test("POST /cameras/{id}/start", False, f"Failed to start camera. Status: {response.status_code if response else 'No response'}")
        
        # Test camera stop
        response = self.make_request("POST", f"/cameras/{camera_id}/stop")
        if response and response.status_code == 200:
            self.log_test("POST /cameras/{id}/stop", True, "Camera stop endpoint working")
        else:
            self.log_test("POST /cameras/{id}/stop", False, f"Failed to stop camera. Status: {response.status_code if response else 'No response'}")
    
    # ==================== PLATES API TESTS ====================
    
    def test_plates_api(self):
        """Test Plates CRUD operations"""
        print("\n=== TESTING PLATES API ===")
        
        if not self.created_resources['sites']:
            self.log_test("Plates API", False, "No sites available for plate testing")
            return
        
        site_id = self.created_resources['sites'][0]
        
        # Test GET all plates
        response = self.make_request("GET", "/plates")
        if response and response.status_code == 200:
            self.log_test("GET /plates", True, f"Retrieved plates successfully. Count: {len(response.json())}")
        else:
            self.log_test("GET /plates", False, f"Failed to get plates. Status: {response.status_code if response else 'No response'}")
        
        # Test POST new plate
        plate_data = {
            "site_id": site_id,
            "block_name": "A Block",
            "apartment_number": "A-101",
            "owner_name": "Ahmet Yılmaz",
            "plates": ["34ABC123", "34DEF456"],
            "valid_until": "2025-12-31T23:59:59Z",
            "status": "allowed"
        }
        
        response = self.make_request("POST", "/plates", plate_data)
        if response and response.status_code == 200:
            plate_id = response.json()["id"]
            self.created_resources['plates'].append(plate_id)
            self.log_test("POST /plates", True, f"Created plate successfully. ID: {plate_id}")
        else:
            self.log_test("POST /plates", False, f"Failed to create plate. Status: {response.status_code if response else 'No response'}")
            return
        
        # Test GET specific plate
        response = self.make_request("GET", f"/plates/{plate_id}")
        if response and response.status_code == 200:
            self.log_test("GET /plates/{id}", True, "Retrieved specific plate successfully")
        else:
            self.log_test("GET /plates/{id}", False, f"Failed to get specific plate. Status: {response.status_code if response else 'No response'}")
        
        # Test PUT update plate
        updated_plate_data = {
            "site_id": site_id,
            "block_name": "A Block",
            "apartment_number": "A-101",
            "owner_name": "Ahmet Yılmaz",
            "plates": ["34ABC123", "34DEF456", "34GHI789"],
            "valid_until": "2026-12-31T23:59:59Z",
            "status": "blocked"
        }
        
        response = self.make_request("PUT", f"/plates/{plate_id}", updated_plate_data)
        if response and response.status_code == 200:
            self.log_test("PUT /plates/{id}", True, "Updated plate successfully")
        else:
            self.log_test("PUT /plates/{id}", False, f"Failed to update plate. Status: {response.status_code if response else 'No response'}")
        
        # Test GET plates with filters
        response = self.make_request("GET", "/plates", params={"site_id": site_id})
        if response and response.status_code == 200:
            self.log_test("GET /plates?site_id", True, f"Retrieved plates by site successfully. Count: {len(response.json())}")
        else:
            self.log_test("GET /plates?site_id", False, f"Failed to get plates by site. Status: {response.status_code if response else 'No response'}")
        
        response = self.make_request("GET", "/plates", params={"status": "blocked"})
        if response and response.status_code == 200:
            self.log_test("GET /plates?status", True, f"Retrieved plates by status successfully. Count: {len(response.json())}")
        else:
            self.log_test("GET /plates?status", False, f"Failed to get plates by status. Status: {response.status_code if response else 'No response'}")
    
    # ==================== SYSTEM API TESTS ====================
    
    def test_system_apis(self):
        """Test System and Detection APIs"""
        print("\n=== TESTING SYSTEM APIs ===")
        
        # Test system status
        response = self.make_request("GET", "/system/status")
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("GET /system/status", True, f"System status retrieved. CPU: {data.get('cpu_percent', 'N/A')}%, Memory: {data.get('memory_percent', 'N/A')}%")
        else:
            self.log_test("GET /system/status", False, f"Failed to get system status. Status: {response.status_code if response else 'No response'}")
        
        # Test detections
        response = self.make_request("GET", "/detections")
        if response and response.status_code == 200:
            self.log_test("GET /detections", True, f"Retrieved detections successfully. Count: {len(response.json())}")
        else:
            self.log_test("GET /detections", False, f"Failed to get detections. Status: {response.status_code if response else 'No response'}")
        
        # Test recent detections
        response = self.make_request("GET", "/detections/recent")
        if response and response.status_code == 200:
            self.log_test("GET /detections/recent", True, f"Retrieved recent detections successfully. Count: {len(response.json())}")
        else:
            self.log_test("GET /detections/recent", False, f"Failed to get recent detections. Status: {response.status_code if response else 'No response'}")
        
        # Test detection stats
        response = self.make_request("GET", "/detections/stats")
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("GET /detections/stats", True, f"Detection stats retrieved. Total today: {data.get('total_today', 'N/A')}")
        else:
            self.log_test("GET /detections/stats", False, f"Failed to get detection stats. Status: {response.status_code if response else 'No response'}")
        
        # Test settings
        response = self.make_request("GET", "/settings")
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("GET /settings", True, f"Settings retrieved. Engine: {data.get('engine', 'N/A')}")
        else:
            self.log_test("GET /settings", False, f"Failed to get settings. Status: {response.status_code if response else 'No response'}")
        
        # Test settings update
        settings_update = {
            "detection_confidence": 0.7,
            "camera_size": "large"
        }
        response = self.make_request("PUT", "/settings", settings_update)
        if response and response.status_code == 200:
            self.log_test("PUT /settings", True, "Settings updated successfully")
        else:
            self.log_test("PUT /settings", False, f"Failed to update settings. Status: {response.status_code if response else 'No response'}")
    
    # ==================== CLEANUP ====================
    
    def cleanup_test_data(self):
        """Clean up created test data"""
        print("\n=== CLEANING UP TEST DATA ===")
        
        # Delete plates
        for plate_id in self.created_resources['plates']:
            response = self.make_request("DELETE", f"/plates/{plate_id}")
            if response and response.status_code == 200:
                self.log_test(f"DELETE /plates/{plate_id}", True, "Plate deleted successfully")
            else:
                self.log_test(f"DELETE /plates/{plate_id}", False, f"Failed to delete plate. Status: {response.status_code if response else 'No response'}")
        
        # Delete cameras
        for camera_id in self.created_resources['cameras']:
            response = self.make_request("DELETE", f"/cameras/{camera_id}")
            if response and response.status_code == 200:
                self.log_test(f"DELETE /cameras/{camera_id}", True, "Camera deleted successfully")
            else:
                self.log_test(f"DELETE /cameras/{camera_id}", False, f"Failed to delete camera. Status: {response.status_code if response else 'No response'}")
        
        # Delete doors
        for door_id in self.created_resources['doors']:
            response = self.make_request("DELETE", f"/doors/{door_id}")
            if response and response.status_code == 200:
                self.log_test(f"DELETE /doors/{door_id}", True, "Door deleted successfully")
            else:
                self.log_test(f"DELETE /doors/{door_id}", False, f"Failed to delete door. Status: {response.status_code if response else 'No response'}")
        
        # Delete sites
        for site_id in self.created_resources['sites']:
            response = self.make_request("DELETE", f"/sites/{site_id}")
            if response and response.status_code == 200:
                self.log_test(f"DELETE /sites/{site_id}", True, "Site deleted successfully")
            else:
                self.log_test(f"DELETE /sites/{site_id}", False, f"Failed to delete site. Status: {response.status_code if response else 'No response'}")
    
    # ==================== MAIN TEST RUNNER ====================
    
    def run_all_tests(self):
        """Run all API tests"""
        print(f"Starting License Plate Recognition System API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test root endpoint
        response = self.make_request("GET", "/")
        if response and response.status_code == 200:
            self.log_test("GET /", True, f"API root accessible: {response.json().get('message', 'OK')}")
        else:
            self.log_test("GET /", False, f"API root not accessible. Status: {response.status_code if response else 'No response'}")
        
        # Run all tests in order
        self.test_sites_api()
        self.test_doors_api()
        self.test_cameras_api()
        self.test_plates_api()
        self.test_system_apis()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t['success']])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\nFAILED TESTS:")
            for test in self.test_results:
                if not test['success']:
                    print(f"  ❌ {test['test']}: {test['message']}")
        
        print("\n" + "=" * 60)

if __name__ == "__main__":
    tester = LPRSystemTester()
    tester.run_all_tests()