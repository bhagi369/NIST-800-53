from selenium import webdriver
from selenium.webdriver.common.by import By
import time

from selenium.webdriver.support.select import Select

BASE_URL = "http://127.0.0.1:5000/toolkit"


def test_ui_loads():
    driver = webdriver.Chrome()
    driver.get(BASE_URL)

    assert "Cybersecurity Compliance Toolkit" in driver.title

    checklist = driver.find_element(By.ID, "controls-list")
    assert checklist is not None

    submit_button = driver.find_element(By.XPATH, "//button[contains(text(),'Check Compliance')]")
    assert submit_button is not None

    driver.quit()


def test_compliance_submission():
    driver = webdriver.Chrome()
    driver.get(BASE_URL)

    checkboxes = driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")
    if checkboxes:
        checkboxes[0].click()  # Select first control

    submit_button = driver.find_element(By.XPATH, "//button[contains(text(),'Check Compliance')]")
    submit_button.click()
    time.sleep(2)

    score_text = driver.find_element(By.ID, "compliance-score").text
    assert "%" in score_text

    driver.quit()


def test_search_filter():
    driver = webdriver.Chrome()
    driver.get(BASE_URL)

    search_box = driver.find_element(By.ID, "checklistSearch")
    search_box.send_keys("AC-1")

    time.sleep(1)
    list_items = driver.find_elements(By.CSS_SELECTOR, "#controls-list li")
    assert any("AC-1" in item.text for item in list_items)

    driver.quit()


def test_run_assessment():
    driver = webdriver.Chrome()
    driver.get(BASE_URL)

    checkboxes = driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")
    if checkboxes:
        checkboxes[0].click()

    run_button = driver.find_element(By.XPATH, "//button[contains(text(),'Run Assessment')]")
    run_button.click()
    time.sleep(2)

    result = driver.find_element(By.ID, "assessment-result").text
    assert "Risk Category" in result

    driver.quit()


def test_case_study_dropdown():
    driver = webdriver.Chrome()
    driver.get(BASE_URL)

    dropdown = Select(driver.find_element(By.ID, "caseSelector"))
    dropdown.select_by_value("solarwinds")
    time.sleep(2)

    summary = driver.find_element(By.ID, "caseSummary").text
    assert "SolarWinds" in summary

    driver.quit()


def test_csv_export_button():
    driver = webdriver.Chrome()
    driver.get(BASE_URL)

    # Select a control to avoid the alert
    checkboxes = driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")
    if checkboxes:
        checkboxes[0].click()

    # Now attempt to generate the report
    download_button = driver.find_element(By.XPATH, "//button[contains(text(),'Download CSV Report')]")
    download_button.click()
    time.sleep(2)

    assert download_button.is_displayed()

    driver.quit()
