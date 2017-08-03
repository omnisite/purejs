<?php

	require_once(dirname(__FILE__). "/base.php");

	function js_save_instance($post) {
		$type  = $post['type'];
		$data  = $post['data'];
		$nodes = isset($data['nodes']) ? $data['nodes'] : array();
		unset($data['nodes']);
		$escp  = mysql_real_escape_string(json_encode($data));
		$dbid  = $post['dbid'];
		if ($dbid) {
			db_update("update pjs_instance set inst_data = '${escp}' where inst_id = ${dbid}");
		}else {
			$dbid = db_insert("insert into pjs_instance values (0, '${type}', '${escp}')");
		}

		foreach($nodes as $type => $node) {
			foreach($node as $item) {
				$opid = isset($item['dbid']) ? $item['dbid'] : 0;
				$data = json_encode($item);
				$escp = mysql_real_escape_string($data);
				if ($opid) {
					db_update("update pjs_instance_op set inop_data = '${escp}' where inop_id = ${opid}");
				}else {
					$opid = db_insert("insert into pjs_instance_op values (0, ${dbid}, '${type}', '${escp}')");
				}
			}
		}
		return $dbid;
	}

	$post = json_decode(@file_get_contents("php://input"), true);
	$dbid = js_save_instance($post);

	$item = array_shift(js_get_items($dbid));
	$item['inid'] = $post['inid'];

	header('Content-Type: application/json;');
	echo json_encode($item);

?>