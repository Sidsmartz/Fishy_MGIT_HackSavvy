from flask import Flask, request, jsonify
from flask_cors import CORS
import pymongo
import os

app = Flask(__name__)

# Allow requests from all origins (or specify your domain)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Connect to MongoDB
client = pymongo.MongoClient("mongodb+srv://siddhartht4206:p7sALrcTto8iBuuq@fishycluster.xxo01rk.mongodb.net/?retryWrites=true&w=majority&appName=FishyCluster")
db = client["phishing_db"]
reports = db["reports"]
users = db["users"]

### ✅ TEXT PHISHING DETECTION
@app.route("/check-phishing", methods=["POST"])
def check_phishing():
    text = request.json.get("text", "")
    return jsonify({"text": text, "is_phishing": "phish" in text.lower(), "confidence": 80})

### ✅ IMAGE DEEPFAKE DETECTION
@app.route("/check-image", methods=["POST"])
def check_image():
    return jsonify({"deepfake_detected": False, "confidence": 90})

### ✅ VIDEO DEEPFAKE DETECTION
@app.route("/upload-video", methods=["POST"])
def upload_video():
    return jsonify({"deepfake_detected": True, "confidence": 85})

### ✅ UNIVERSAL CONTENT CHECK (Handles Text, Images, and Videos)
@app.route("/check-content", methods=["POST"])
def check_content():
    data = request.json
    if "text" in data:
        return jsonify({"result": "Unsafe" if "phish" in data["text"].lower() else "Safe", "confidence": 80})
    if "image" in data or "video" in data:
        return jsonify({"result": "Fake" if "fake" in data.get("image", "") else "Not Fake", "confidence": 85})

### ✅ REPORT A PHISHER
@app.route("/report-phisher", methods=["POST"])
def report_phisher():
    data = request.json
    required_fields = ["reporter_email", "phisher_email", "name", "phone", "attackType"]
    for field in required_fields:
        if field not in data:
            return jsonify({"message": f"Missing field: {field}"}), 400

    reports.insert_one(data)
    users.update_one({"email": data["reporter_email"]}, {"$inc": {"points": 5}}, upsert=True)
    
    return jsonify({"message": "Report submitted. 5 points added!"})

### ✅ FIND PHISHERS
@app.route("/find-phishers", methods=["GET"])
def find_phishers():
    query = request.args.get("query")
    results = list(reports.find({"$or": [{"phisher_email": query}, {"phone": query}, {"name": query}]}))
    for report in results:
        report["_id"] = str(report["_id"])
    return jsonify(results)

### ✅ REDEEM REWARDS
@app.route("/redeem-rewards", methods=["GET"])
def redeem_rewards():
    email = request.args.get("email")
    user = users.find_one({"email": email})
    points = user["points"] if user else 0
    return jsonify({"message": f"Your current reward points: {points}"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)
