def get_hr_recommendation(control_number):
    if "AC" in control_number:
        return "Ensure only authorized HR staff have access to employee data."
    elif "IA" in control_number:
        return "Ensure multi-factor authentication is required for HR staff."
    elif "AU" in control_number:
        return "Log all access and modifications to employee data."
    elif "SC" in control_number:
        return "Ensure all employee data is encrypted in transit and at rest."
    elif "RA" in control_number:
        return "Perform quarterly risk assessments for HR data handling processes."
    elif "CM" in control_number:
        return "Maintain secure configuration baselines for HR system components."
    else:
        return "Review general security best practices for HR systems."
