<?php

/* SugarCRM compatible schema loader */
define('sugarEntry', 1);
class VardefManager { public function createVardef() {} }

function argv_err() {
    exit("Two arguments required: PHP metadata filename and variable name(s). ");
}
$_varspec = $argv[2];
if (empty($_varspec) || empty($argv[1])) {
    argv_err();
}
require $argv[1];

// XXX requires PECL ext: yaml_emit( ${$_varspec} );

$_r = array();
foreach (explode(',', $_varspec) as $_spec) {

    if (strpos($_spec, '/') !== false) {
        $_x = $GLOBALS;
        $_s = &$_r;
        $_elems = explode('/', trim($_spec, '/'));
        while ($_elems) {
            $_elem = array_shift($_elems);
            $_x = &$_x[$_elem];
            //, $_s ));
            if (count($_elems)) {
                if (!array_key_exists($_elem, $_s)) {
                    $_s[$_elem] = array();
                }
                $_s = &$_s[$_elem];
            } else {
                $_s[$_elem] = $_x;
            }
        }
    } else if ($_spec == '*') {
        foreach ($GLOBALS as $_k => $_v) {
            if (substr($_k, 0, 1) == '_' || ctype_upper($_k)) {
                continue;
            }
            if (!array_key_exists($_k, $_r)) {
                $_r[$_k] = $_v;
            }
        }
        //break;
    } else {
        $_r[$_spec] = $$_spec;
    }
}
echo json_encode( $_r );

