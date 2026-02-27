import requests
import os

url = "http://127.0.0.1:8000/predict"
image_path = r"c:\Projects\PROJECTS\GEN AI - PJ\venv\Lib\site-packages\sklearn\datasets\images\flower.jpg"

if not os.path.exists(image_path):
    print("Image not found")
    exit(1)

files = {'file': ('flower.jpg', open(image_path, 'rb'), 'image/jpeg')}
response = requests.post(url, files=files)

print("Status:", response.status_code)
print("Content:", response.text)
