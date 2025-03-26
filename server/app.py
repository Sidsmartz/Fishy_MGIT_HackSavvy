from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os

app = Flask(__name__)
CORS(app)

# MongoDB Setup
MONGO_URI = "mongodb+srv://siddhartht4206:p7sALrcTto8iBuuq@fishycluster.xxo01rk.mongodb.net/?retryWrites=true&w=majority&appName=FishyCluster"

try:
    client = MongoClient(MONGO_URI)
    db = client["FishyCluster"]
    reports_collection = db["reports"]
    rewards_collection = db["rewards"]
    print("✅ Connected to MongoDB")
except Exception as e:
    print("❌ MongoDB Connection Error:", str(e))

# 🛑 Check Phishing (Dummy Implementation)
@app.route('/check-phishing', methods=['POST'])
def check_phishing():
    try:
        data = request.json.get("text", "")
        phishing_keywords = ["bank", "password", "click here", "urgent", "account suspended"]
        is_phishing = any(keyword in data.lower() for keyword in phishing_keywords)
        return jsonify({"phishing_detected": is_phishing, "confidence": 90 if is_phishing else 10})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🎭 Fake Image Detection (Dummy)
@app.route('/check-image', methods=['POST'])
def check_image():
    try:
        return jsonify({"deepfake_detected": False, "confidence": 95})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🎥 Fake Video Detection (Dummy)
@app.route('/upload-video', methods=['POST'])
def upload_video():
    try:
        return jsonify({"deepfake_detected": True, "confidence": 85})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔎 Find Phishers
@app.route('/find-phishers', methods=['GET'])
def find_phishers():
    try:
        query = request.args.get("query", "").strip()
        if not query:
            return jsonify({"error": "Query parameter is required"}), 400

        results = list(reports_collection.find({"$or": [
            {"phisher_email": query}, {"phone": query}, {"name": query}
        ]}, {"_id": 0}))

        return jsonify(results if results else {"message": "No reports found."})
    except Exception as e:
        print("Error in /find-phishers:", str(e))
        return jsonify({"error": "Internal Server Error"}), 500

# 🚨 Report Phisher
@app.route('/report-phisher', methods=['POST'])
def report_phisher():
    try:
        data = request.json
        required_fields = ["name", "phisher_email", "reporter_email", "attackType"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        reports_collection.insert_one(data)

        # Add 5 points to reporter's account
        email = data["reporter_email"]
        rewards_collection.update_one(
            {"email": email},
            {"$inc": {"points": 5}},
            upsert=True
        )

        return jsonify({"message": "Phisher reported! You earned 5 points."})
    except Exception as e:
        print("Error in /report-phisher:", str(e))
        return jsonify({"error": "Internal Server Error"}), 500

# 🎁 Redeem Rewards
@app.route('/redeem-rewards', methods=['GET'])
def redeem_rewards():
    try:
        email = request.args.get("email")
        if not email:
            return jsonify({"error": "Email parameter is required"}), 400

        user = rewards_collection.find_one({"email": email}, {"_id": 0, "points": 1})
        points = user["points"] if user else 0
        return jsonify({"message": f"You have {points} points."})
    except Exception as e:
        print("Error in /redeem-rewards:", str(e))
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3000, threaded=True)
