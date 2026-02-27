import sys

try:
    with open("server_debug.log", "rb") as f:
        content = f.read().decode("utf-16le")
        print(content)
except Exception as e:
    print(f"Error reading log: {e}")
