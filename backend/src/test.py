import requests

url = 'http://127.0.0.1:5000/api'

# Add a new project
response = requests.post(f'{url}/create-project', data=None)
print(response.json()['data'])