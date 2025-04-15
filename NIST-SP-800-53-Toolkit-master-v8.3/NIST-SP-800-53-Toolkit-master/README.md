# NIST-SP-800-53-Toolkit

A lightweight, web-based toolkit designed to help organizations assess their compliance with the NIST SP 800-53 cybersecurity framework. Built as part of a capstone project for ISN 2615, the toolkit includes features like control checklists, compliance scoring, case study simulations, and CSV reporting.

## What you'll find here

### Raw docs

The PDF and the XML file are pulled directly from the [NIST SP library](http://csrc.nist.gov/publications/PubsSPs.html). These are the unedited versions, and I've really just put them here for quick reference. Feel free to use it however you see fit. I'm going to try my best to keep it up-to-date.

### MySQL exports

The SQL file is a MySQL self-contained, structure and data export. You can load the file into a MySQL install, and explore the following schema:

* families *# 18 rows*
  * family
  * acronym
* controls *# 922 rows - includes control enhancements*
  * family
  * number
  * title
  * priority
  * is_baseline_impact_low
  * is_baseline_impact_moderate
  * is_baseline_impact_high
  * is_withdrawn
  * is_enhancement
* references *# 331 rows*
  * number
  * reference *# E.g., document title*
  * link *# A hyper one*
* statements *# 1682 rows*
  * number
  * description
  * is_odv *# Some component of the description is a Madlib*
* supplemental_guidance *# 752 rows*
  * number
  * description
  * related *# Other pertinent controls*
* withdrawls *# 96 rows*
  * number
  * incorporated_into *# Some other control*

### SQLite file

This is a straight dump of the MySQL structure and data into a SQLite version, for lightweight reference.

### XLSX file

This Microsoft Excel file is a Workbook of Worksheets (for you guys that speak VBA) mapping to the tables in the above databases. Apologies for any crazy character formatting issues that may have sprouted up in translation.

### Text and SQL
A bunch of CSVs and SQL files for getting all the data into various databases. The row IDs and datetimes columns are to support standard data schemas for Rails app models.

### The script

This is **quick and dirty** Ruby/Nokogiri script to tear the XML file from NIST into pieces. The NIST schema is sort of wonky (e.g., the way numbers and statements are listed throughout is not optimal), so the script makes some assumptions. As a result, I had to go back and fill some of the gaps (e.g., references to families in the "controls" table) after the fact. It's not perfect, but meh, it works.

### Features
Dynamic NIST 800-53 Control Checklist
Weighted Risk Scoring (Low=2, Mod=3, High=5)
Real-time Risk Category & Recommendations
Case Study Simulations (e.g., SolarWinds Breach)
CSV Export for Audit Documentation
Live Search Filter and UI Dashboard

### Technologies Used
Frontend: HTML, CSS, JavaScript
Backend: Python Flask
Database: SQLite (preloaded with NIST controls)
Testing: Pytest, Selenium
Dev Tools: VS Code, Postman, Chrome DevTools

### Project Structure

├── app.py                    # Flask server & API routes
├── static/
│   ├── toolkit_script.js     # JS logic (scoring, UI updates)
│   ├── toolkit_styles.css    # Styling
├── templates/
│   └── toolkit.html          # Main dashboard UI
├── 800-53-controls.sqlite    # SQLite database of NIST controls
├── test_api.py               # API testing (Pytest)
├── test_ui.py                # UI testing (Selenium)
