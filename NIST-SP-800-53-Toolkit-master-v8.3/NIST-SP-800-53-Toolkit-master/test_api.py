import requests

BASE_URL = "http://127.0.0.1:5000"

# Test 1: Get control families
def test_get_families():
    response = requests.get(f"{BASE_URL}/api/families")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# Test 2: Get control statements
def test_get_statements():
    response = requests.get(f"{BASE_URL}/api/statements/AC-1")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# Test 3: Get supplemental guidance
def test_get_supplemental_guidance():
    response = requests.get(f"{BASE_URL}/api/supplemental_guidance/AC-1")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# Test 4: Get controls by family
def test_get_controls_by_family():
    response = requests.get(f"{BASE_URL}/api/controls/ACCESS CONTROL")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# Test 5: Get all controls
def test_get_all_controls():
    response = requests.get(f"{BASE_URL}/api/controls")
    assert response.status_code == 200
    data = response.json()
    assert "control_id" in data[0]

# Test 6: Generate report (optional family param)
def test_generate_report():
    response = requests.get(f"{BASE_URL}/api/generate_report?family=ACCESS CONTROL")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# Test 7: Assessment generator for toolkit
def test_generate_assessment():
    payload = {"selectedControls": ["AC-1", "AU-2", "IA-5"]}
    response = requests.post(f"{BASE_URL}/api/generate_assessment", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "risk_score" in data
    assert "risk_category" in data
    assert isinstance(data.get("details", []), list)

'''def test_generate_assessment():
    payload = {
        "controls": ["AC-1", "AU-2", "IA-5"]  # example control IDs known to exist in your DB
    }
    response = requests.post(f"{BASE_URL}/api/generate_assessment", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "risk_score" in data
    assert "risk_category" in data
    assert isinstance(data.get("selected_controls", []), list)'''

# Test 8:  assessment for toolkit
def test_assessment():
    payload = { "selectedControls": ["AC-1", "AC-2", "AU-2"] }
    response = requests.post(f"{BASE_URL}/api/assessment", json=payload)
    assert response.status_code == 200
    result = response.json()
    assert "risk_category" in result
    assert "risk_score" in result


