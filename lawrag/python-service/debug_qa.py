import requests
import json

def test_qa_endpoint():
    url = "http://localhost:8000/qa"
    payload = {
        "question": "民事诉讼时效是多久？",
        "sessionId": "test-session-123"
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    print(f"Sending request to {url}...")
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    
    print(f"Status Code: {response.status_code}")
    try:
        print("Response Body:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    except:
        print("Response is not JSON:")
        print(response.text)

if __name__ == "__main__":
    test_qa_endpoint()
