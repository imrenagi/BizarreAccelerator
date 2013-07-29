<?php

$stageNum = $_POST["s"];

if ($stageNum != 0) {
// for testing purpose only
?>
{
    "stageName": "<?php echo $stageNum ?>",
    "eligible": 1,
    "map": {
        "w": 640,
        "h": 200,
        "elmts": [
            {"type": "proton-source", "pos":[50, 50], "dir": 0},
            {"type": "fixed-target", "pos":[500, 40], "dir": 0},
            {"type": "alt-mag-field", "pos":[75, 40], "dir": -1},
            {"type": "strong-mag-field", "pos":[75, 100], "dir": 1},
            {"type": "strong-mag-field", "pos":[350, 100], "dir": 1},
            {"type": "strong-mag-field", "pos":[350, 40], "dir": -1},
            {"type": "elec-field", "pos": [200,0], "dir":1.57}
        ]
    },
    "utilities": {
        "strong-mag-field": {"num":5},
        "alt-mag-field": {"num":4},
        "elec-field": {"num":1},
        "xray": {"num":1}
    }
}
<?php
} else {
?>
{
    "stageName": "Creator",
    "eligible": 1,
    "map": {
        "w": 640,
        "h": 200,
        "elmts": []
    },
    "utilities": {
        "proton-source": {"num":9999},
        "electron-source": {"num":9999},
        "muon-source": {"num":9999},
        
        "strong-mag-field": {"num":9999},
        "alt-mag-field": {"num":9999},
        "elec-field": {"num":9999},
        
        "fixed-target": {"num":9999},
        "collision-target": {"num":9999}
    }
}

<?php
}
?>