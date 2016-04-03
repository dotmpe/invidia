#!/usr/bin/env bash

set -e

test -z "$Build_Debug" || set -x

test -n "$sudo" || sudo=



generate_git_hooks()
{
	test -e "$package_pd_meta_git_hooks_pre_commit" || {
		test -n "$package_pd_meta_git_hooks_pre_commit_script" || {
			test -n "$package_pd_meta_check" && {
				package_pd_meta_git_hooks_pre_commit_script="$package_pd_meta_check"
			} || {
				echo "No default git pre-commit script. "
				return
			}
		}

		mkdir -vp $(dirname $package_pd_meta_git_hooks_pre_commit)
		echo "$package_pd_meta_git_hooks_pre_commit_script" \
			>$package_pd_meta_git_hooks_pre_commit
	}
}

install_git_hooks()
{
	for script in pre-commit
	do
		#t=script/git/$script.sh
		t=$(eval echo \$package_pd_meta_git_hooks_$(echo $script|tr '-' '_'))
		test -n "$t" || continue
		l=.git/hooks/$script
		test ! -e "$l" || {
			test -h $l && {
				test "$(readlink $l)" = "$t" || {
					rm $l
				}
			} ||	{
				echo "Git hook exists and is not a symlink: $l"
				continue
			}
		}
		( cd .git/hooks; ln -s ../../$t $script )
		echo "Symlinked GIT hook to script: $script -> $t"
	done
}


main_entry()
{
  test -n "$1" || set -- '*'

  case "$1" in build )
			test -n "$SRC_PREFIX" || {
				echo "Not sure where checkout"
				exit 1
			}

			test -n "$PREFIX" || {
				echo "Not sure where to install"
				exit 1
			}

			test -d $SRC_PREFIX || ${sudo} mkdir -vp $SRC_PREFIX
			test -d $PREFIX || ${sudo} mkdir -vp $PREFIX
		;;
	esac

  case "$1" in '*'|project|git )
      git --version >/dev/null || { echo "Sorry, GIT is a pre-requisite"; exit 1; }
			test -x $(which jsotk.py 2>/dev/null) || {
				test -e .package.sh || {
					echo "Sorry, jsotk.py is a pre-requisite"; exit 1;
				}
			}
			test -e .package.sh || jsotk.py yaml2sh .package.yaml [id=invidia]
			source .package.sh
    ;; esac

  case "$1" in '*'|project|git )
  		generate_git_hooks || return $?
  		install_git_hooks || return $?
    ;; esac

  echo "OK. All pre-requisites for '$1' checked"
}

test "$(basename $0)" = "install-dependencies.sh" && {
  main_entry $@ || exit $?
}

# Id: invidia/0.0.1 install-dependencies.sh
