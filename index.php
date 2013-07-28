<html>
    <head>
        <title>Bizarre Accelerator</title>
        
        <script type="text/javascript" src="js/jquery-2.0.3.js"></script>
        <script type="text/javascript" src="js/kinetic-v4.5.4.min.js"></script>
        
        <script type="text/javascript" src="js/constants.js"></script>
        <script type="text/javascript" src="js/images-loader.js"></script>
        <script type="text/javascript" src="js/utils.js"></script>
        <script type="text/javascript" src="js/objects.js"></script>
        <script type="text/javascript" src="js/stage.js"></script>
        
        <script type="text/javascript" src="js/page-controller.js"></script>
        <script type="text/javascript" src="js/play-controller.js"></script>
        
        <style type="text/css">
            #loading {
                display: none;
                width: 100%;
                height: 100%;
                position: absolute;
                z-index: 10;
                background: #ffffff;
            }
            #content {
                display: block;
                width: 100%;
                height: 100%;
                position: absolute;
            }
        </style>
        
    </head>
    <body>
        <div id="loading">
            Loading ...
        </div>
        
        <!-- main content should go here! -->
        <div id="content">
            &nbsp;
        </div>
        
        <script type="text/javascript">
            $(document).ready(function(){
                $(document).ready();
                loadPage("front-page.html");
            });
        </script>
    </body>
</html>
