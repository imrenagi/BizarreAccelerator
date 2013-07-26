<?php

$filename = $_GET["f"];
$content = file_get_contents("dc/".$filename);

if ($content === false) {
    $retval = array("status" => 0, "msg" => "File not found", "content" => "");
}
else {
    $retval = array("status" => 1, "msg" => "Success", "content" => $content);
}
echo json_encode($retval);

?>
