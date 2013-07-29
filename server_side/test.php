<?php
  include 'db_command.php';
  //setcookie("user", $Data.$Seperator.md5($Data.$uniqueID), time()-3600);
?>

<html>
<?php

if (isset($_COOKIE["user"]))
{
  echo "Welcome " . $_COOKIE["user"] . " !<br>";
  $cook->CreateNewCookie($_COOKIE["user"]);
  $gDetails->InitGameDetails($_COOKIE["user"]);
}
else
{
  setcookie("user", $Data.$Seperator.md5($Data.$uniqueID), time()+3600);
  header('Location:test.php');
  echo "Welcome a new user !<br>";
}

$stage = 5;
$score =100;
$gDetails->EditGameDetails($_COOKIE["user"], $stage, $score);


?>

</html>
