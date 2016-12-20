#!/usr/bin/env bats

load helper
base=bin/invidia.js
init


@test "${bin} --help" {
  run $BATS_TEST_DESCRIPTION
  test $status -eq 0
}

@test "${bin} --scan" {
  run $BATS_TEST_DESCRIPTION
  test $status -eq 1
  fnmatch "*Nothing to do*" "${lines[*]}"
}


