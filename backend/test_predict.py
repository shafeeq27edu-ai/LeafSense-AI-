import requests

url = "http://127.0.0.1:8000/predict"
# Create a dummy small image
with open("test_leaf.jpg", "wb") as f:
    f.write(b"\xff\xd8\xff\xe0" + b"\x00" * 100 + b"\xff\xd9")

files = {'file': ('test_leaf.jpg', open('test_leaf.jpg', 'rb'), 'image/jpeg')}
response = requests.post(url, files=files)

print("Status:", response.status_code)
print("Content:", response.text)
