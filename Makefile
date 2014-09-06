# XXX: This came with grunt-init-command, using Grunt for now
version = `cat package.json | grep version | awk -F'"' '{print $$4}'`
publish:
	@git tag ${version}
	@git push origin ${version}
	@npm publish

test: test-schema

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

test-bin::
	./bin/invidia.js --show-file sugarcrm/modules/Bugs/vardefs.php
	./bin/invidia.js --show-file sugarcrm/modules/Accounts/vardefs.php
	./bin/invidia.js --show-file sugarcrm/metadata/accounts_bugsMetaData.php


# convert RNC to RNG
SRC_RNC := $(wildcard var/schema/*.rnc)
TRGT_RNG := $(SRC_RNC:%.rnc=%.rng)

%.rng: %.rnc
	./vendor/relaxng-gnosis.cx/rnc2rng $< > $@

conv-schema:: $(TRGT_RNG)

# test wether RNC and RNG are valid RelaxNG
TRGT_RNC_VAL := $(SRC_RNC:%.rnc=%-valid-rng.log)

%-valid-rng.log: %.rnc
	@rnv -c $< > $@

validate-schema:: $(TRGT_RNC_VAL) $(TRGT_RNG_VAL)

# test wether example docs are valid against schema
#TRGT_DOC_VAL := $(SRC_RNC:%.xml=%-xml-validate.log)

validate-examples::
	@for type in addressbook sugar simplehtdoc datatypes; do \
		rnv var/schema/$$type.rnc var/schema/example*.$$type.xml; \
	done; \

test-schema:: conv-schema validate-schema validate-examples

#test-schema: var/schema/addressbook.rng 


test-load:: $(TRGT_RNG)
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
