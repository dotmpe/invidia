
# Set env and other per-specfile init
test_init()
{
  test -n "$base" || exit 12
  test -n "$hostname" || hostname=$(hostname -s | tr 'A-Z' 'a-z')
  test -n "$uname" || uname=$(uname)
  test -n "$scriptdir" || scriptdir=$(pwd -P)
}

init()
{
  test_init

  export bin=$scriptdir/$base

  test -n "$TMPDIR" || {
    case "$uname" in
      Darwin ) export TMPDIR=$(cd /tmp/; pwd -P) ;;
      Linux ) export TMPDIR=/tmp/;;
    esac
  }
}




### Misc. helper functions

trueish()
{
  test -n "$1" || return 1
  case "$1" in
		[Oo]n|[Tt]rue|[Yyj]|[Yy]es|1)
      return 0;;
    * )
      return 1;;
  esac
}

file_equal()
{
  sum1=$(md5sum $1 | cut -f 1 -d' ')
  sum2=$(md5sum $2 | cut -f 1 -d' ')
  test "$sum1" = "$sum2" || return 1
}

noop()
{
  set --
}

fnmatch()
{
  case "$2" in $1 ) return 0 ;; *) return 1 ;; esac
}

