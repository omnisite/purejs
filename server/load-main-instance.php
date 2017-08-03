<?php

	require_once(dirname(__FILE__). "/base.php");

	$inid  = isset($_REQUEST['inid']) ? $_REQUEST['inid'] : 0;
	$items = js_get_items($inid);

	header('Content-Type: application/json;');
	echo json_encode($items); die();

?>