<?php

	function db_config() {
		return array(
			'hostname'   => 'localhost',
			'database'   => 'purejs_db',
			'username'   => 'purejs_db',
			'password'   => 'Pure!112',
			'persistent' => ini_get('mysqli.allow_persistent')
		);
	}

	function db_connect($config) {
		$db = mysql_connect($config['hostname'], $config['username'], $config['password'], true);
		mysql_select_db($config['database'], $db);
		return $db;
	}

	function db_query($type, $sql, $as_object = FALSE, array $params = NULL)
	{
		// Make sure the database is connected
		global $db;

		// Execute the query
		if (($result = mysql_query($sql, $db)) === FALSE)
		{
			throw new Exception(mysql_error($db), 'db_query');
		}

		if ($type === 'select')
		{
			// Return an iterator of results
			$list = array();
			while (($row = mysql_fetch_assoc($result))) {
				$list[] = $row;
			}
			mysql_free_result($result);
			return $list;
		}
		elseif ($type === 'insert')
		{
			// Return a list of insert id and rows created
			return mysql_insert_id($db);
		}
		else
		{
			// Return the number of rows affected
			return mysql_affected_rows($db);
		}
	}

	function db_select($sql) {
		return db_query('select', $sql);
	}

	function db_insert($sql) {
		return db_query('insert', $sql);
	}

	function db_update($sql) {
		return db_query('update', $sql);
	}

	function db_delete($sql) {
		return db_query('delete', $sql);
	}

	function js_get_items($inid = 0) {
		$where = $inid > 0 ? " where inst_id = ${inid}" : "";
		$items = db_select('select inst_id as dbid, inst_type as type, inst_data as data from pjs_instance'.$where);
		foreach($items as &$inst) {
			$dbid  = $inst['dbid'];
			$nodes = db_select("select inop_id as dbid, inop_type as type, inop_data as data from pjs_instance_op where inop_fk_instance = ${dbid}");
			$data  = json_decode($inst['data'], true);
			foreach($nodes as $item) {
				$type = $item['type'];
				if (!isset($data[$type])) $data[$type] = array();
				$vals = json_decode($item['data'], true);
				$vals['dbid']  = $item['dbid'];
				$data[$type][] = $vals;
			}
			$inst['data'] = $data;
		}
		return $items;
	}

	$db = db_connect(db_config());

?>
