import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_role_awareness():
    # 1. Login as mentor
    print("Logging in as mentor...")
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "mentor@test.com",
        "password": "password123"
    })
    
    if login_res.status_code != 200:
        print("Login failed:", login_res.text)
        return

    token = login_res.json()["token"]
    print("✅ Login successful\n")

    # 2. Send greetings to test role identification
    print("=" * 60)
    print("TEST 1: General greeting")
    print("=" * 60)
    chat_res = requests.post(
        f"{BASE_URL}/chat/ai-chat",
        headers={"Authorization": f"Bearer {token}"},
        json={"message": "Hello, who are you and how can you help me?"}
    )

    if chat_res.status_code == 200:
        data = chat_res.json()
        print(f"Response:\n{data.get('reply')}\n")
    else:
        print("Error:", chat_res.text)

    # 3. Ask for a report
    print("=" * 60)
    print("TEST 2: Request student report")
    print("=" * 60)
    chat_res = requests.post(
        f"{BASE_URL}/chat/ai-chat",
        headers={"Authorization": f"Bearer {token}"},
        json={"message": "Can you give me a summary report of all my students?"}
    )

    if chat_res.status_code == 200:
        data = chat_res.json()
        print(f"Response:\n{data.get('reply')}\n")
    else:
        print("Error:", chat_res.text)

    # 4. Ask about specific student
    print("=" * 60)
    print("TEST 3: Ask about specific student (Manikanta)")
    print("=" * 60)
    chat_res = requests.post(
        f"{BASE_URL}/chat/ai-chat",
        headers={"Authorization": f"Bearer {token}"},
        json={"message": "What interventions do you recommend for Manikanta?"}
    )

    if chat_res.status_code == 200:
        data = chat_res.json()
        print(f"Response:\n{data.get('reply')}\n")
    else:
        print("Error:", chat_res.text)

if __name__ == "__main__":
    test_role_awareness()
