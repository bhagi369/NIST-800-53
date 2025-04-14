from flask import Flask, render_template, send_from_directory, jsonify, request
import sqlite3
import os
from hr_assessment.hr_report_logic import get_hr_recommendation

app = Flask(__name__, static_folder="static", template_folder="templates")

def get_db_connection():
    db_path = r"D:\3term\capstone\NIST-SP-800-53-Toolkit-master-v8.3\NIST-SP-800-53-Toolkit-master-v8.3\NIST-SP-800-53-Toolkit-master\800-53-controls.sqlite"
    if not os.path.exists(db_path):
        print("❌ Error: Database file not found at", db_path)
        return None
    try:
        conn = sqlite3.connect(db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        print("✅ Database connected successfully!")
        return conn
    except sqlite3.Error as e:
        print("❌ Database connection error:", e)
        return None

# ✅ Serve HTML page
@app.route("/")
def home():
    return render_template("dashboard.html")

# ✅ Serve static files (CSS & JS)
@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory("static", filename)

@app.route("/hr_dashboard")
def hr_dashboard():
    return render_template("hr_dashboard.html")

@app.route("/toolkit")
def toolkit():
    return render_template('toolkit.html')


# ✅ Fetch control families
@app.route("/api/families", methods=["GET"])
def get_families():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        families = conn.execute("SELECT * FROM families").fetchall()
        conn.close()
        return jsonify([dict(fam) for fam in families])
    except sqlite3.Error as e:
        print("❌ Database query error:", e)
        return jsonify({"error": "Failed to fetch families"}), 500

# ✅ Fetch control statements
@app.route("/api/statements/<string:control_id>", methods=["GET"])
def get_statements(control_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = conn.execute(
            "SELECT description FROM statements WHERE number LIKE ?",
            (f"{control_id}%",)
        )
        statements = cursor.fetchall()
        conn.close()

        print(f"🔍 Debug: Statements for {control_id} → {statements}")

        return jsonify([desc[0] for desc in statements])  # Return only description column
    except sqlite3.Error as e:
        print(f"❌ Database query error: {e}")
        return jsonify({"error": "Failed to fetch statements"}), 500

# ✅ Fetch supplemental guidance
@app.route("/api/supplemental_guidance/<string:control_id>", methods=["GET"])
def get_supplemental_guidance(control_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = conn.execute(
            "SELECT description FROM supplemental_guidance WHERE number LIKE ?",
            (f"{control_id}%",)
        )
        guidance = cursor.fetchall()
        conn.close()

        print(f"🔍 Debug: Guidance for {control_id} → {guidance}")

        return jsonify([desc[0] for desc in guidance])
    except sqlite3.Error as e:
        print(f"❌ Database query error: {e}")
        return jsonify({"error": "Failed to fetch supplemental guidance"}), 500

# ✅ Fetch controls for a selected family
@app.route("/api/controls/<string:family_id>", methods=["GET"])
def get_controls(family_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        controls = conn.execute("SELECT * FROM controls WHERE family = ?", (family_id,)).fetchall()
        conn.close()
        return jsonify([dict(ctrl) for ctrl in controls])
    except sqlite3.Error as e:
        print("❌ Database query error:", e)
        return jsonify({"error": "Failed to fetch controls"}), 500


@app.route("/api/controls", methods=["GET"])
def get_all_controls():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        controls = conn.execute("SELECT number, title, family FROM controls").fetchall()
        conn.close()
        return jsonify([{
            "control_id": row["number"],
            "title": row["title"],
            "family": row["family"]
        } for row in controls])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Generate report for the selected family (Dynamic Filter Applied)
@app.route("/api/generate_report", methods=["GET"])
def generate_report():
    family_id = request.args.get('family')  # Get family from query params
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        if family_id:
            query = "SELECT * FROM controls WHERE family = ?"
            controls = conn.execute(query, (family_id,)).fetchall()
        else:
            query = "SELECT * FROM controls LIMIT 10"  # Fallback if no family is provided
            controls = conn.execute(query).fetchall()

        conn.close()

        if not controls:
            print(f"❌ No data found for family: {family_id}")
            return jsonify({"error": f"No data found for family: {family_id}"}), 500

        report_data = []
        for control in controls:
            print(f"🔍 Control Data: {dict(control)}")  # Debugging Output

            # Convert values to integers before scoring
            score = 0
            if int(control["is_baseline_impact_low"]) == 1: score += 1
            if int(control["is_baseline_impact_moderate"]) == 1: score += 2
            if int(control["is_baseline_impact_high"]) == 1: score += 3

            recommendation = "Increase security measures." if score < 2 else "Security is moderate. Review policies."

            report_data.append({
                "control_id": control["number"],
                "title": control["title"],
                "score": score,
                "recommendation": recommendation
            })

        return jsonify(report_data)

    except sqlite3.Error as e:
        print("❌ Database query error:", e)
        return jsonify({"error": str(e)}), 500


'''@app.route("/api/hr_generate_report", methods=["GET"])
def generate_hr_report():
    conn = get_db_connection()

    query = """
        SELECT number, title, family, 
               CAST(is_baseline_impact_low AS INTEGER) as is_baseline_impact_low,
               CAST(is_baseline_impact_moderate AS INTEGER) as is_baseline_impact_moderate,
               CAST(is_baseline_impact_high AS INTEGER) as is_baseline_impact_high
        FROM controls
        WHERE family IN (
            'ACCESS CONTROL', 
            'IDENTIFICATION AND AUTHENTICATION', 
            'AUDIT AND ACCOUNTABILITY', 
            'SYSTEM AND COMMUNICATIONS PROTECTION', 
            'RISK ASSESSMENT', 
            'CONFIGURATION MANAGEMENT'
        )
    """

    cursor = conn.execute(query)
    controls = cursor.fetchall()
    conn.close()

    total_risk_score = 0
    max_possible_score = len(controls) * 10  # Maximum possible score per control is 10

    report_data = []

    for control in controls:
        is_low = int(control["is_baseline_impact_low"])
        is_moderate = int(control["is_baseline_impact_moderate"])
        is_high = int(control["is_baseline_impact_high"])

        # Weighted scoring: Low = 2, Moderate = 3, High = 5
        control_score = (is_low * 2) + (is_moderate * 3) + (is_high * 5)
        total_risk_score += control_score

        # Debug each control's score
        print(f"🔍 Debug: {control['number']} - Low:{is_low}, Mod:{is_moderate}, High:{is_high}, Score:{control_score}")

        # Assign risk category per control
        risk_category = "Low"
        if control_score >= 7:
            risk_category = "High"
        elif control_score >= 4:
            risk_category = "Medium"

        report_data.append({
            "control_id": control["number"],
            "title": control["title"],
            "score": control_score,
            "risk_category": risk_category,
            "recommendation": "Ensure only authorized HR staff have access to employee data."
        })

    # Normalize score (convert to 0-10 scale)
    normalized_score = (total_risk_score / max_possible_score) * 10 if max_possible_score > 0 else 0

    # Determine overall HR risk category
    overall_risk_category = "Low"
    if normalized_score >= 7:
        overall_risk_category = "High"
    elif normalized_score >= 4:
        overall_risk_category = "Medium"

    print(f"✅ Debug: Overall HR Security Risk: {overall_risk_category}, Score: {normalized_score}/10")

    return jsonify(report_data)'''


@app.route("/api/controls/<family>")
def get_controls_by_family(family):
    conn = get_db_connection()
    cursor = conn.execute("SELECT number, title FROM controls WHERE family = ?", (family,))
    controls = cursor.fetchall()
    conn.close()
    return jsonify([{"number": c["number"], "title": c["title"]} for c in controls])


@app.route("/api/assessment", methods=["POST"])
def process_assessment():
    data = request.json  # Get selected controls from frontend
    selected_controls = data["selectedControls"]

    conn = get_db_connection()

    total_risk_score = 0
    max_possible_score = len(selected_controls) * 10  # Adjust dynamically

    for control_id in selected_controls:
        query = """
            SELECT is_baseline_impact_low, is_baseline_impact_moderate, is_baseline_impact_high 
            FROM controls WHERE number = ?
        """
        cursor = conn.execute(query, (control_id,))
        control = cursor.fetchone()

        if control:
            # Convert fetched values to integers
            is_low = int(control["is_baseline_impact_low"])
            is_moderate = int(control["is_baseline_impact_moderate"])
            is_high = int(control["is_baseline_impact_high"])

            # Weighted scoring: Low = 2, Moderate = 3, High = 5
            control_score = (is_low * 2) + (is_moderate * 3) + (is_high * 5)

            total_risk_score += control_score

    conn.close()

    # Normalize score (convert to 0-10 scale)
    if max_possible_score > 0:
        normalized_score = (total_risk_score / max_possible_score) * 10
    else:
        normalized_score = 0  # Avoid division by zero

    # Determine Risk Category based on normalized score
    if normalized_score >= 7:
        risk_category = "High"
    elif normalized_score >= 4:
        risk_category = "Medium"
    else:
        risk_category = "Low"

    return jsonify({
        "risk_category": risk_category,
        "risk_score": round(normalized_score, 1),  # Keep one decimal place
        "max_possible_score": 10
    })

'''@app.route("/api/generate_assessment", methods=["POST"])
def generate_assessment(cursor=None):
    data = request.json
    selected_controls = data["selectedControls"]

    placeholders = ",".join("?" for _ in selected_controls)
    query = f"SELECT number, title, is_baseline_impact_low, is_baseline_impact_moderate, is_baseline_impact_high FROM controls WHERE number IN ({placeholders})"

    cursor.execute(query, selected_controls)
    controls = cursor.fetchall()

    total_risk_score = 0
    max_possible_score = len(selected_controls) * 10'''


@app.route("/api/generate_assessment", methods=["POST"])
def generate_assessment():
    data = request.json
    selected_controls = data.get("selectedControls", [])

    conn = get_db_connection()
    cursor = conn.cursor()

    if not selected_controls:
        return jsonify({"error": "No controls selected"}), 400

    placeholders = ",".join("?" for _ in selected_controls)
    query = f"""
        SELECT number, title, is_baseline_impact_low, is_baseline_impact_moderate, is_baseline_impact_high
        FROM controls WHERE number IN ({placeholders})
    """
    cursor.execute(query, selected_controls)
    controls = cursor.fetchall()
    conn.close()

    total_risk_score = 0
    control_results = []

    for control in controls:
        is_low = int(control["is_baseline_impact_low"])
        is_moderate = int(control["is_baseline_impact_moderate"])
        is_high = int(control["is_baseline_impact_high"])

        score = (is_low * 2) + (is_moderate * 3) + (is_high * 5)
        total_risk_score += score

        risk_category = "Low"
        if score >= 7:
            risk_category = "High"
        elif score >= 4:
            risk_category = "Medium"

        recommendation = "🟢 Monitor regularly"
        if score >= 7:
            recommendation = "🔴 High priority – ensure full implementation and frequent auditing."
        elif score >= 4:
            recommendation = "🟡 Medium priority – review implementation regularly."

        control_results.append({
            "control_id": control["number"],
            "title": control["title"],
            "score": score,
            "risk_category": risk_category,
            "recommendation": recommendation
        })

    max_possible_score = len(selected_controls) * 10
    normalized_score = (total_risk_score / max_possible_score) * 10 if max_possible_score > 0 else 0

    overall_risk = "Low"
    if normalized_score >= 7:
        overall_risk = "High"
    elif normalized_score >= 4:
        overall_risk = "Medium"

    return jsonify({
        "risk_score": round(normalized_score, 1),
        "max_possible_score": 10,
        "risk_category": overall_risk,
        "recommendation": recommendation,
        "details": control_results
    })



'''@app.route("/api/hr_comparison_report", methods=["POST"])
def compare_hr_assessment():
    data = request.json  # Get selected controls from frontend
    selected_controls = data["selectedControls"]

    conn = get_db_connection()

    comparison_data = []

    for control_id in selected_controls:
        query = """
            SELECT is_baseline_impact_low, is_baseline_impact_moderate, is_baseline_impact_high 
            FROM controls WHERE number = ?
        """
        cursor = conn.execute(query, (control_id,))
        control = cursor.fetchone()

        if control:
            is_low = int(control["is_baseline_impact_low"])
            is_moderate = int(control["is_baseline_impact_moderate"])
            is_high = int(control["is_baseline_impact_high"])

            # Baseline (expected) Score from the database
            baseline_score = (is_low * 2) + (is_moderate * 3) + (is_high * 5)

            # User-implemented score (HR assessment)
            user_score = 10 if control_id in selected_controls else 0

            comparison_data.append({
                "control_id": control_id,
                "baseline_score": baseline_score,
                "user_score": user_score,
                "gap": baseline_score - user_score
            })

    conn.close()

    print(f"🔍 Comparison Report Debug: {comparison_data}")

    return jsonify(comparison_data)'''



if __name__ == "__main__":
    print("🚀 Starting Flask Server...")
    app.run(host="127.0.0.1", port=5000, debug=True, use_reloader=False)
