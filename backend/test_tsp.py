import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.algorithms.tsp import brute_force_tsp, held_karp_tsp, greedy_tsp, two_opt_tsp
from app.utils.distance import generate_distance_matrix

def test_algorithms():
    # Sample locations
    locations = [
        {"id": "1", "lat": 13.0827, "lng": 80.2707},
        {"id": "2", "lat": 13.05, "lng": 80.25},
        {"id": "3", "lat": 13.0405, "lng": 80.2337},
        {"id": "4", "lat": 13.085, "lng": 80.21},
    ]
    
    matrix = generate_distance_matrix(locations)
    
    print("Testing Algorithms with 4 nodes:")
    
    res_brute = brute_force_tsp(matrix)
    print(f"Brute Force: {res_brute['distance']} km, Time: {res_brute['time']} ms")
    
    res_dp = held_karp_tsp(matrix)
    print(f"DP (Held-Karp): {res_dp['distance']} km, Time: {res_dp['time']} ms")
    
    res_greedy = greedy_tsp(matrix)
    print(f"Greedy: {res_greedy['distance']} km, Time: {res_greedy['time']} ms")
    
    res_2opt = two_opt_tsp(matrix)
    print(f"2-opt: {res_2opt['distance']} km, Time: {res_2opt['time']} ms")
    
    assert res_brute['distance'] == res_dp['distance'], "Optimal algorithms must match"
    print("\nTests passed! Algorithms are consistent.")

if __name__ == "__main__":
    test_algorithms()
