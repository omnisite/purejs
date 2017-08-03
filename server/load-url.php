<?php

	$url = isset($_REQUEST['url'])?$_REQUEST['url']:false;

	if (!$url) return json_encode(array(
		'result' => false,
		'error'  => 'no url'
	));

	$vars['headers'] = array();

	$headers = array();
	foreach($vars['headers'] as $key => $value) {
		if (isset($value)) $headers[] = $key.': '.$value;
	}
	$headers[] = 'Accept:';
	$headers[] = 'Expect:';

	$request_do = curl_init();
	curl_setopt($request_do, CURLOPT_URL, $url);
	curl_setopt($request_do, CURLOPT_PORT , 443);
	curl_setopt($request_do, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($request_do, CURLOPT_CONNECTTIMEOUT, 10);
 	curl_setopt($request_do, CURLOPT_TIMEOUT,        10);
	curl_setopt($request_do, CURLOPT_RETURNTRANSFER, true );
	curl_setopt($request_do, CURLOPT_SSL_VERIFYPEER, false );
	curl_setopt($request_do, CURLOPT_SSL_VERIFYHOST, false );
	curl_setopt($request_do, CURLOPT_POST,           true );
	// curl_setopt($request_do, CURLOPT_POSTFIELDS,     $body);
	// curl_setopt($request_do, CURLOPT_HTTPHEADER,     $headers);
	curl_setopt($request_do, CURLOPT_VERBOSE,		  true);
	curl_setopt($request_do, CURLINFO_HEADER_OUT,    true);

	$response = curl_exec($request_do);
	$info = curl_getinfo($request_do);
	print_r(array(
		'request' => $body,
		'info' => $info, 'response' => $response
	));

	if(!$response) {
	    $err = 'Curl error: ' . curl_error($request_do);
	    curl_close($request_do);
	    print $err;
	} else {
	    curl_close($request_do);
	    //print 'Operation completed without any errors';
	    return $response;
	}
?>

