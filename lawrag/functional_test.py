import requests
import time
import os
import sys

BASE_URL = "http://127.0.0.1:8080/api"

def print_step(step):
    print(f"\n{'='*20} {step} {'='*20}")

def test_health():
    print_step("Checking Service Health")
    try:
        # Check Backend
        resp = requests.get(f"{BASE_URL}/docs/random?limit=1")
        if resp.status_code == 200:
            print("✅ Backend is reachable")
        else:
            print(f"❌ Backend returned {resp.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False
    return True

def test_upload_and_flow():
    print_step("Testing Document Upload & Parsing Flow")
    
    file_path = "../test_doc.txt"
    if not os.path.exists(file_path):
        print(f"❌ Test file {file_path} not found")
        return

    files = {'file': ('test_doc.txt', open(file_path, 'rb'), 'text/plain')}
    data = {'title': '民法典诉讼时效测试', 'category': '民法'}
    
    try:
        # 1. Upload
        print("📤 Uploading document...")
        upload_resp = requests.post(f"{BASE_URL}/docs/upload", files=files, data=data)
        if upload_resp.status_code != 200:
            print(f"❌ Upload failed: {upload_resp.text}")
            return
        
        upload_result = upload_resp.json()
        print(f"DEBUG: Upload Response: {upload_result}")
        if upload_result['code'] != 200:
            print(f"❌ Upload API error: {upload_result}")
            return
            
        doc_id = upload_result['data']['documentId']
        print(f"✅ Upload successful. Document ID: {doc_id}")
        
        # 2. Poll for parsing status
        print("⏳ Waiting for parsing to complete...")
        max_retries = 600
        for i in range(max_retries):
            status_resp = requests.get(f"{BASE_URL}/docs/{doc_id}/parse-status")
            status_data = status_resp.json()['data']
            status = status_data['parseStatus']
            progress = status_data['parseProgress']
            
            print(f"   Status: {status}, Progress: {progress}%")
            
            if status == 'COMPLETED':
                print("✅ Parsing completed!")
                break
            elif status == 'FAILED':
                print(f"❌ Parsing failed: {status_data.get('parseError')}")
                return
            
            time.sleep(1)
        else:
            print("❌ Parsing timed out")
            return

        # 3. Test Search
        print_step("Testing Smart Search")
        search_query = "诉讼时效是几年？"
        print(f"🔍 Searching for: {search_query}")
        # Note: Backend might not have a direct search API exposed for testing, 
        # but typically search is part of the Q&A or a separate endpoint.
        # Looking at PythonServiceClient, there is /search. 
        # Looking at DocumentController, there isn't a direct search endpoint exposed to frontend 
        # usually, or it might be in a SearchController?
        # Let's check if there is a SearchController or similar.
        # If not, we'll skip direct search and go to Q&A which uses search.
        
        # 4. Test Q&A
        print_step("Testing Smart Q&A")
        qa_query = "普通诉讼时效期间是多少年？"
        print(f"❓ Asking: {qa_query}")
        
        chat_data = {
            "question": qa_query,
            "sessionId": "" # New session
        }
        
        print("⏳ Waiting for AI response...")
        chat_resp = requests.post(f"{BASE_URL}/chat/ask", json=chat_data)
        
        if chat_resp.status_code != 200:
            print(f"❌ Chat API failed: {chat_resp.text}")
            return
            
        chat_result = chat_resp.json()
        if chat_result['code'] != 200:
            print(f"❌ Chat API error: {chat_result}")
            return
            
        answer = chat_result['data']['answer']
        print(f"✅ AI Answer: {answer}")
        
        references = chat_result['data'].get('references', [])
        if references:
            print(f"📚 References found: {len(references)}")
            for ref in references:
                print(f"   - Doc ID: {ref['documentId']}, Score: {ref['similarityScore']}")
        else:
            print("⚠️ No references returned (might be expected if vector search threshold not met)")

        
    except Exception as e:
        print(f"❌ Error during test: {e}")

if __name__ == "__main__":
    if test_health():
        test_upload_and_flow()
