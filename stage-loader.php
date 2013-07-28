<?php

$stageNum = $_POST["s"];

// for testing purpose only
?>
{
    "stageNum": <?php echo $stageNum ?>,
    "eligible": 1,
    "map": {
        "w": 640,
        "h": 200,
        "src": {
            "type": "burst-source",
            "pos": [50, 50],
            "dir": 0
        },
        "goal": {
            "type": "fixed-target",
            "pos": [500, 40],
            "dir": 1
        },
        "elmts": [
            {"type": "alt-mag-field", "pos":[75, 40], "dir": -1},
            {"type": "strong-mag-field", "pos":[75, 100], "dir": 1},
            {"type": "strong-mag-field", "pos":[350, 100], "dir": 1},
            {"type": "strong-mag-field", "pos":[350, 40], "dir": -1},
            {"type": "elec-field", "pos": [200,0], "dir":1.57}
        ],
        "particle": "muon"
    },
    "utilities": {
        "strong-mag-field": {"num":5},
        "alt-mag-field": {"num":4},
        "mag-field": {"num":2},
        "elec-field": {"num":1}
    }
}
