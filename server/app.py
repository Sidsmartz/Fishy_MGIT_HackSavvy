from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pymongo

app = Flask(__name__)
CORS(app)

client = pymongo.MongoClient("mongodb+srv://siddhartht4206:p7sALrcTto8iBuuq@fishycluster.xxo01rk.mongodb.net/?retryWrites=true&w=majority&appName=FishyCluster")
db = client["phishing_db"]
reports = db["reports"]
users = db["users"]

@app.route("/check-phishing", methods=["POST"])
def check_phishing():
    text = request.json.get("text", "")
    return jsonify({"text": text, "is_phishing": "phish" in text.lower()})

@app.route("/check-image", methods=["POST"])
def check_image():
    return jsonify({"deepfake_detected": False})

@app.route("/upload-video", methods=["POST"])
def upload_video():
    return jsonify({"deepfake_detected": True})

@app.route("/report-phisher", methods=["POST"])
def report_phisher():
    data = request.json
    reports.insert_one(data)
    
    users.update_one({"email": data["email"]}, {"$inc": {"points": 5}}, upsert=True)
    return jsonify({"message": "Report submitted. 5 points added!"})

@app.route("/find-phishers", methods=["GET"])
def find_phishers():
    query = request.args.get("query")
    results = list(reports.find({"$or": [{"email": query}, {"phone": query}, {"name": query}]}))
    return jsonify(results)

@app.route("/redeem-rewards", methods=["GET"])
def redeem_rewards():
    email = request.args.get("email")
    user = users.find_one({"email": email})
    return jsonify({"points": user.get("points", 0) if user else 0})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)
