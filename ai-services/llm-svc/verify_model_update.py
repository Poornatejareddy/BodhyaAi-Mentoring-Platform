import requests
import json

BASE_URL = "http://localhost:8003"

def verify_model():
    print("Verifying model update...")
    
    # Test with gemini-2.5-flash
    payload = {
        "message": "Hello, what model are you?",
        "student_id": "test_user",
        "model": "gemini-2.5-flash"
    }
    
    try:
        res = requests.post(f"{BASE_URL}/rag/chat", json=payload)
        data = res.json()
        
        print("Response Status:", res.status_code)
        print("Full Response:", json.dumps(data, indent=2))
        
        if res.status_code == 200 and data.get("success"):
            print("\n✅ SUCCESS!")
            print(f"Model used: {data.get('model')}")
            print(f"Reply: {data.get('reply')[:100]}...")
        else:
            print("\n❌ FAILED!")
            print(f"Error: {data.get('error', 'Unknown error')}")
            
    except Exception as e:
        print("❌ Exception:", e)

if __name__ == "__main__":
    verify_model()
