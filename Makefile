# XXX: This came with grunt-init-command, using Grunt for now
version = `cat package.json | grep version | awk -F'"' '{print $$4}'`
publish:
	@git tag ${version}
	@git push origin ${version}
	@npm publish

test:
	@echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	@./node_modules/.bin/mocha -R spec
	@make test-coveralls
	@make test-bin

coverage:
	@rm -rf lib-cov
	@./node_modules/.bin/jscoverage lib lib-cov
	@COVERAGE=1 ./node_modules/.bin/mocha -R html-cov > coverage.html 
	@open coverage.html

test-coveralls:
	@rm -rf lib-cov
	@./node_modules/.bin/jscoverage lib lib-cov
	@ICOV=1 ./node_modules/.bin/mocha -R mocha-lcov-reporter | ./node_modules/.bin/coveralls

test-bin:
	./bin/invidia.js --show-file sugarcrm/modules/Bugs/vardefs.php
	./bin/invidia.js --show-file sugarcrm/modules/Accounts/vardefs.php
	./bin/invidia.js --show-file sugarcrm/metadata/accounts_bugsMetaData.php

%.rng: %.rnc
	./rnc2rng $< > $@


var/schema/addressbook.rng: var/schema/addressbook.rnc
var/schema/sugar.rng: var/schema/sugar.rnc

#test-schema: var/schema/addressbook.rng 
test-schema: var/schema/sugar.rng
	./bin/invidia.js --load-schema $<

loc:
	find bin/ lib/ test/ -iname '*.js' -exec cat {} + | wc -l
tree:
	tree bin/ lib/ test/ doc/ tmp/

.invidia/dev.sqlite3: lib/sql.coffee
	-[ -e $@ ] && rm $@
	knex migrate:latest
	@echo DB reset

sql: .invidia/dev.sqlite3
	sqlite3 .invidia/dev.sqlite3

.PHONY: test loc tree
