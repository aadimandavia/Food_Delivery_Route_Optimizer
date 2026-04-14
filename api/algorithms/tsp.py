import itertools
import time
import math

def calculate_route_distance(route, dist_matrix):
    total = 0
    for i in range(len(route) - 1):
        total += dist_matrix[route[i]][route[i+1]]
    total += dist_matrix[route[-1]][route[0]] # Return to start
    return total

def brute_force_tsp(dist_matrix):
    n = len(dist_matrix)
    start_time = time.time()
    
    # Generate all permutations starting at 0
    points = list(range(1, n))
    min_dist = float('inf')
    best_route = []
    
    for p in itertools.permutations(points):
        route = [0] + list(p)
        d = calculate_route_distance(route, dist_matrix)
        if d < min_dist:
            min_dist = d
            best_route = route
            
    execution_time = (time.time() - start_time) * 1000 # in ms
    return {
        "route": best_route,
        "distance": round(min_dist, 2),
        "time": round(execution_time, 2),
        "type": "Optimal"
    }

def greedy_tsp(dist_matrix):
    n = len(dist_matrix)
    start_time = time.time()
    
    unvisited = set(range(1, n))
    current_node = 0
    route = [0]
    
    while unvisited:
        next_node = min(unvisited, key=lambda x: dist_matrix[current_node][x])
        unvisited.remove(next_node)
        route.append(next_node)
        current_node = next_node
        
    d = calculate_route_distance(route, dist_matrix)
    execution_time = (time.time() - start_time) * 1000
    
    return {
        "route": route,
        "distance": round(d, 2),
        "time": round(execution_time, 2),
        "type": "Approximate"
    }

def held_karp_tsp(dist_matrix):
    n = len(dist_matrix)
    if n <= 2:
        return brute_force_tsp(dist_matrix)
        
    start_time = time.time()
    
    # dp[mask][i] = (min_dist, prev_node)
    # mask: bitmask of visited nodes
    # i: last node visited
    dp = [[(float('inf'), -1)] * n for _ in range(1 << n)]
    
    # Base case: start from 0
    for i in range(1, n):
        dp[1 << i | 1][i] = (dist_matrix[0][i], 0)
        
    # Iterate through subset sizes
    for size in range(3, n + 1):
        for mask in range(1 << n):
            if bin(mask).count('1') != size or not (mask & 1):
                continue
                
            for i in range(1, n):
                if not (mask & (1 << i)):
                    continue
                    
                prev_mask = mask ^ (1 << i)
                res = (float('inf'), -1)
                for j in range(1, n):
                    if j == i or not (prev_mask & (1 << j)):
                        continue
                    
                    new_dist = dp[prev_mask][j][0] + dist_matrix[j][i]
                    if new_dist < res[0]:
                        res = (new_dist, j)
                dp[mask][i] = res
                
    # Find full path returning to 0
    full_mask = (1 << n) - 1
    min_dist = float('inf')
    last_node = -1
    
    for i in range(1, n):
        dist = dp[full_mask][i][0] + dist_matrix[i][0]
        if dist < min_dist:
            min_dist = dist
            last_node = i
            
    # Reconstruct route
    route = [0]
    temp_route = []
    mask = full_mask
    while last_node != 0:
        temp_route.append(last_node)
        new_last_node = dp[mask][last_node][1]
        mask ^= (1 << last_node)
        last_node = new_last_node
    
    route.extend(reversed(temp_route))
        
    execution_time = (time.time() - start_time) * 1000
    return {
        "route": route,
        "distance": round(min_dist, 2),
        "time": round(execution_time, 2),
        "type": "Optimal"
    }

def two_opt_tsp(dist_matrix):
    # Start with greedy
    greedy_res = greedy_tsp(dist_matrix)
    route = greedy_res["route"]
    n = len(route)
    start_time = time.time()
    
    def get_dist(r):
        return calculate_route_distance(r, dist_matrix)

    improved = True
    while improved:
        improved = False
        for i in range(1, n - 2):
            for j in range(i + 1, n):
                if j - i == 1: continue
                # Swap section
                new_route = route[:i] + route[i:j][::-1] + route[j:]
                if get_dist(new_route) < get_dist(route):
                    route = new_route
                    improved = True
        if not improved: break

    d = get_dist(route)
    execution_time = (time.time() - start_time) * 1000 + greedy_res["time"]
    
    return {
        "route": route,
        "distance": round(d, 2),
        "time": round(execution_time, 2),
        "type": "Optimized Approx"
    }
