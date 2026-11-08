import requests
import pandas as pd

url="https://opendataapi.dmi.dk/v2/metObs/collections/observation/items"

params = {
    "stationId": "06186",
    "parameterId": "precip_past1h",
    "datetime": "2005-01-01T00:00:00Z/2014-12-31T23:00:00Z",
    "limit": 100000
}

response = requests.get(url, params=params)
print(response.status_code)
data=response.json()
print(data)
print(data.keys())
print(data['features'][0])

