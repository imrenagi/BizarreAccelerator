<?php

require_once '../config/config.php';

//This class is using for making a connection between mysql and php
class sql
{
  public static $con;

  //create the connection
  public function sqlConnect()
  {
    self::$con = mysqli_connect(DB_HOST, DB_USER, DB_PWD, DB_DB);
    if (mysqli_connect_errno())
    {
      echo "Failed to connect to MySQL: " . mysqli_connect_error() . "<br>";
    }
    else{
      echo "connected <br>";
    }
  }
   
  //Close The Connection
  public function sqlDisconnect()
  {
    mysqli_close($con);
  }
}

class Cookie
{
  public function CreateNewCookie($cookies_name)
  {
     $sql = mysqli_query(sql::$con , "INSERT INTO cookies (cookies) VALUES ('$cookies_name')");
  }
  
  public function ClearCookiesTable()
  {
     
  }
}

class gameDetails
{
  public function InitGameDetails($cookies)
  {
      $sql = mysqli_query(sql::$con , "INSERT INTO gameDetails (cookies, last_stage, high_score) VALUES ('$cookies','1','0')");
  }

  public function EditGameDetails ($cook, $stage, $score)
  {
      $sql = mysqli_query(sql::$con , "update gameDetails set last_stage= '$stage', high_score='$score' where cookies='$cook'");
  }  
}


$sql = new sql;
$sql->sqlConnect();
$cook = new Cookie;
$gDetails = new gameDetails;


?>
