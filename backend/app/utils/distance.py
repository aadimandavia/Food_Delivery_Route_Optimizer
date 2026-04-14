import math

def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    """
    # Convert decimal degrees to radians 
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a)) 
    r = 6371 # Radius of earth in kilometers. Use 3956 for miles
    return c * r

def generate_distance_matrix(locations):
    """
    Generate an adjacency matrix of distances between all locations.
    locations: list of dicts with 'lat' and 'lng'
    """
    n = len(locations)
    matrix = [[0.0 for _ in range(n)] for _ in range(n)]
    
    for i in range(n):
        for j in range(i + 1, n):
            dist = haversine(
                locations[i]['lat'], locations[i]['lng'],
                locations[j]['lat'], locations[j]['lng']
            )
            matrix[i][j] = dist
            matrix[j][i] = dist
            
    return matrix
