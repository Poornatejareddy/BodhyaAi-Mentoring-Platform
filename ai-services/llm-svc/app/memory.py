from pymongo import MongoClient

client = MongoClient("mongodb+srv://poornateja0079:K.poorna123@bodhyaai.3mgrul0.mongodb.net/?retryWrites=true&w=majority&appName=BodhyaAi")
db = client["bodhya_ai"]
conversations = db["conversations"]

def save_message(user_id: str, role: str, message: str, reply: str):
    conversations.insert_one({
        "userId": user_id,
        "role": role,
        "message": message,
        "reply": reply
    })

def get_recent(user_id: str, limit: int = 3):
    msgs = conversations.find({"userId": user_id}).sort("_id", -1).limit(limit)
    return [f"User: {m['message']} | Bot: {m['reply']}" for m in msgs]
