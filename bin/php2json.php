<?php

/* SugarCRM compatible schema loader */
define('sugarEntry', 1);
class VardefManager { public function createVardef() {} }

function argv_err() {
    exit("Two arguments required: PHP metadata filename and dictionary varname");
}
$dictname = $argv[2];
if (empty($dictname) || empty($argv[1])) {
    argv_err();
}
require $argv[1];

// XXX requires PECL ext: yaml_emit( ${$dictname} );

echo json_encode( $$dictname );

