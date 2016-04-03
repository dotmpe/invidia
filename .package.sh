
package_test="make test"
package_check="git-versioning check && grunt lint"
package_pd_meta_check="vchk grunt:lint"
package_pd_meta_test="vchk grunt make:test"
package_pd_meta_git_hooks_pre_commit=./script/scm/pre-commit.sh
package_pd_meta_init="npm install; ./install-dependencies.sh git"

