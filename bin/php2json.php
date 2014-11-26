<?php

/* SugarCRM compatible schema loader */
define('sugarEntry', 1);
class VardefManager { public function createVardef() {} }

function argv_err() {
    exit("Two arguments required: PHP metadata filename and variable name(s). ");
}
$varspec = $argv[2];
if (empty($varspec) || empty($argv[1])) {
    argv_err();
}
require $argv[1];

// XXX requires PECL ext: yaml_emit( ${$varspec} );

$r = array();
foreach (explode(',', $varspec) as $spec) {
    $r[$spec] = $$spec;
}
echo json_encode( $r );

