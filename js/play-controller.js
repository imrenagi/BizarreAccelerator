var stage = 0;
var utils;
var runTimerID = 0;

function requestStage(stageNum) {
    $.ajax({
        "type": "POST",
        "url" : "stage-loader.php",
        "data": {s: stageNum}, // add cookie here ???
        "dataType": "json",
        "success": function(json) {
            console.log(json);
            if (json.eligible) {
            
                var setup = function() {
                    stage = new Stage(json);
                    stage.setup();
                    
                    setTimeout(function() {
                        if (runTimerID != 0) clearTimeout(runTimerID);
                        runTimerID = 0;
                        // enable play // ???
                    }, 2000);
                }
                
                if (json.intro) {
                    showIntroduction(json.intro, setup());
                } else {
                    setup();
                }
                
            }
            else {
                alert("Please pass the previous stages first");
                loadPage("stage-selection.html");
            }
        },
        "error": function(a,b,c){console.log(a,b,c);}
    });
}

function showIntroduction(jsonIntro, closeFunc) {
    // ???
}

function goToNextStage(stageName) {
    var stageNum = parseInt(stageName);
    if (!isNaN(stageNum)) {
        var nextStage = stageNum + 1;
        loadPage("play.html?s=" + nextStage.toString());
    }
    else {
        // loadPage("stage-selection.html");
    }
}
