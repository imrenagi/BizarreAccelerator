
/* This function load a file dynamically, so the users don't need to refresh their pages
 */
function loadPage(furl) {
    // parse to determine which part is filename, which part is HTTP arguments
    var qmarkIdx  = furl.indexOf("?");
    var filename  = (qmarkIdx == -1) ? furl : furl.substring(0, qmarkIdx);
    var arguments = (qmarkIdx == -1) ? []   : furl.substring(qmarkIdx+1).split("&");
    
    // parse the HTTP arguments into a map of key-value
    var httpArgs = {};
    for (var i = 0; i < arguments.length; i++) {
        var keyVal = arguments[i].split("=");
        httpArgs[keyVal[0]] = decodeURIComponent(keyVal[1]);
    }
    
    $.ajax({
        "url": "page-loader.php?f=" + filename,
        "type": "GET",
        "dataType": "json",
        "data": {"f": filename},
        "success": function(json) {
            // if it's failed to load the page, just back to original page
            if (json.status == 0) {
                pageLoading("hide");
                return;
            }
            
            // change the content according to HTTP arguments from furl
            var content = json.content;
            for (var key in httpArgs) {
                var regexp = new RegExp("\\%"+key+"\\%", "g");
                content = content.replace(regexp, httpArgs[key]);
            }
            
            $("#content").html(content);
            modifyAnchor();
            pageLoading("hide");
        },
        "error": function(a, b, c) {
            console.log(a, b, c);
        }
    });
    
    // show the loading status
    pageLoading("show");
}

/* To show or hide loading status, depends on cmd ("show"/"hide")
 */
function pageLoading(cmd) {
    if (cmd.toLowerCase() == "show") {
        $("#loading").show();
    }
    else if (cmd.toLowerCase() == "hide") {
        $("#loading").hide();
    }
}

function modifyAnchor() {
    // modify all anchors
    $("a").click(function() {
        
        var url = $(this).attr("href");
        
        // if it's external link, just go there
        if (url.indexOf("://") != -1) return true;
        
        // otherwise, load page using loadPage function above and do not reload page
        loadPage(url);
        return false;
    });
}

function disableBackspace() {
    $(document).keydown(function(e) {
        if (e.which == 8) {
            e.preventDefault();
            return false;
        }
    });
}

$(document).ready(function() {
    $(document).ready();
    disableBackspace();
    modifyAnchor();
});
