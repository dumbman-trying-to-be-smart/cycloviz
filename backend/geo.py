"""Convert UTM coordinates (ETRS89 / UTM zone 32N, as used in data/road_info.csv) to latitude/longitude.

Plain Python so the backend does not need an extra package such as pyproj.
Accurate to well under a metre, which is far more than a map marker needs.
"""
import math

_A = 6378137.0                 # GRS80 semi-major axis
_F = 1 / 298.257222101         # GRS80 flattening
_K0 = 0.9996                   # UTM scale factor
_E2 = _F * (2 - _F)
_EP2 = _E2 / (1 - _E2)


def utm_to_latlng(easting, northing, zone=32):
    x = easting - 500000
    m = northing / _K0
    mu = m / (_A * (1 - _E2 / 4 - 3 * _E2**2 / 64 - 5 * _E2**3 / 256))
    e1 = (1 - math.sqrt(1 - _E2)) / (1 + math.sqrt(1 - _E2))
    phi = (mu
           + (3 * e1 / 2 - 27 * e1**3 / 32) * math.sin(2 * mu)
           + (21 * e1**2 / 16 - 55 * e1**4 / 32) * math.sin(4 * mu)
           + (151 * e1**3 / 96) * math.sin(6 * mu))

    c = _EP2 * math.cos(phi)**2
    t = math.tan(phi)**2
    n = _A / math.sqrt(1 - _E2 * math.sin(phi)**2)
    r = _A * (1 - _E2) / (1 - _E2 * math.sin(phi)**2)**1.5
    d = x / (n * _K0)

    lat = phi - (n * math.tan(phi) / r) * (
        d**2 / 2
        - (5 + 3 * t + 10 * c - 4 * c**2 - 9 * _EP2) * d**4 / 24
        + (61 + 90 * t + 298 * c + 45 * t**2 - 252 * _EP2 - 3 * c**2) * d**6 / 720)
    lng = (d
           - (1 + 2 * t + c) * d**3 / 6
           + (5 - 2 * c + 28 * t - 3 * c**2 + 8 * _EP2 + 24 * t**2) * d**5 / 120) / math.cos(phi)

    return math.degrees(lat), (zone * 6 - 183) + math.degrees(lng)
