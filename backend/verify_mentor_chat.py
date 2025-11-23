import requests
import json

BASE_URL = "http://localhost:5000/api"

def verify_mentor_chat():
    # 1. Login
    print("Logging in...")
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "mentor@test.com",
        "password": "password123"
    })
    
    if login_res.status_code != 200:
        print("Login failed:", login_res.text)
        return

    token = login_res.json()["token"]
    print("Login successful.")

    # 2. Ask about Manikanta
    print("Sending message about Manikanta...")
    chat_res = requests.post(
        f"{BASE_URL}/chat/ai-chat",
        headers={"Authorization": f"Bearer {token}"},
        json={"message": "What is the risk analysis of Manikanta?"}
    )

    print("Response Status:", chat_res.status_code)
    print("Response Body:", json.dumps(chat_res.json(), indent=2))

if __name__ == "__main__":
    verify_mentor_chat()
