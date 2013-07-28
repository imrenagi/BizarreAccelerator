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
            if (json.eligible) {
                stage = new Stage(json);
                stage.setup();
                
                setTimeout(function() {
                    if (runTimerID != 0) clearTimeout(runTimerID);
                    runTimerID = 0;
                    // enable play // ???
                }, 2000);
            }
            else {
                alert("Please pass the previous stages first");
                loadPage("stage-selection.html");
            }
        },
    });
}

function goToNextStage(stageNum) {
    var nextStage = stageNum + 1;
    loadPage("play.html?s=" + nextStage.toString());
    // loadPage("front-page.html");
}
