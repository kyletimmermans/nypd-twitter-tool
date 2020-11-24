

<?php

// SSH Storm Vars
$storm_username = getenv('storm_username_pfv');
$storm_password = getenv('stron_password_pfv');


// Connect to Storm via SSH (phpseclib1.0.19)
set_include_path(get_include_path().'/phpseclib');
include('Net/SSH2.php');

$ssh = new Net_SSH2('storm.cis.fordham.edu');
if (!$ssh->login($storm_username, $storm_password)) {
    exit('Login Failed');
}

echo $ssh->exec('ls');

/*

$servername = "localhost"; // Now we are in Storm so switch to localhost
$username = "kthaokar";
$password = "kthaokar!";
$dbname = "CISC2500";

// Create connection to DB
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully";

$conn->disconnect(); // Disconnect from DB 

*/

?>
