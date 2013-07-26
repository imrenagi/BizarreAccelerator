<?php

$stageNum = $_POST["s"];

// for testing purpose only
?>
{
    "eligible": 1,
    "map": {
        "w": 640,
        "h": 480,
        "src": {
            "type": "burst-source",
            "pos": [50, 50],
            "dir": 0
        },
        "goal": {
            "type": "fixed-target",
            "pos": [500, 50],
            "dir": 1,
            "w": 30,
            "h": 20,
            "energy": 1000
        },
        "elmts": [
            {"type": "strong-mag-field", "pos":[300, 40], "dir": 1},
            {"type": "strong-mag-field", "pos":[320, 40], "dir": 1},
            {"type": "strong-mag-field", "pos":[300, 20], "dir": 1},
            {"type": "strong-mag-field", "pos":[320, 20], "dir": 1},
            {"type": "strong-mag-field", "pos":[300, 0], "dir": 1},
            {"type": "strong-mag-field", "pos":[320, 0], "dir": 1},
            {"type": "elec-field", "pos": [150,40], "dir":0},
            {"type": "elec-field", "pos": [200,0], "dir":1.57}
        ],
        "particle": "muon"
    },
    "utilities": []
}
