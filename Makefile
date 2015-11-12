# special rule targets
STRGTS := \
   default \
   lint \
   test \
   test-unit coverage test-bin test-json \
   validate-examples \
   test-schema test-load \
   loc tree srctree srcdirs \
   sql \
   install \
   update \
   publish

.PHONY: $(STRGTS)

empty :=
space := $(empty) $(empty)
default:
	@echo 'usage:'
	@echo '# npm [test]'
	@echo '# grunt [lint|..]'
	@echo '# make [$(subst $(space),|,$(STRGTS))]'

install:
	npm install
	make test

update:
	npm update
	bower update

# XXX: This came with grunt-init-command, using Grunt for now
version = `cat package.json | grep version | awk -F'"' '{print $$4}'`

lint:
	@grunt lint

test: test-unit test-bin

test-unit:
	@NODE_ENV=testing grunt test

# produde (generate/open) coverage report for mocha tests
coverage:
	@rm -rf lib-cov
	@./node_modules/.bin/jscoverage lib lib-cov
	@COVERAGE=1 ./node_modules/.bin/mocha -R html-cov > coverage.html 
	@open coverage.html

# XXX test all and pass to coveralls?
test-coveralls:
	@rm -rf lib-cov
	@./node_modules/.bin/jscoverage lib lib-cov
	@ICOV=1 ./node_modules/.bin/mocha -R mocha-lcov-reporter | ./node_modules/.bin/coveralls

# check commands keep working
test-bin:: ENV=testing
test-bin::
	NODE_ENV=$(ENV) ./bin/invidia.js --read-file sugarcrm/modules/Contacts/vardefs.php > test1.log
	NODE_ENV=$(ENV) ./bin/invidia.js --read-file sugarcrm/modules/Contacts/vardefs.php --path=dictionary/Contact/indices/6 > test2.log
	NODE_ENV=$(ENV) ./bin/invidia.js --show-file sugarcrm/modules/Contacts/vardefs.php > test3.log
	php ./bin/php2json.php test/testdata.php myDict,foo,* > test4.log
	#./bin/invidia.js --show-file sugarcrm/modules/Accounts/vardefs.php
	#./bin/invidia.js --show-file sugarcrm/metadata/accounts_contactsMetaData.php
	NODE_ENV=$(ENV) ./bin/invidia.js --x-create-schema test --file test/testdata.php --path myDict/foo --map myDict/foo:amazing
	md5sum -c *.md5

test-json:
	# Test using jsonschema (Python)
	# Test is sidecar.json is valid JSON schema
	yaml2json var/schema/sidecar.yaml > var/schema/sidecar.json
	-jsonschema -i var/schema/sidecar.json var/schema/draft-04.json
	# Test if sidecar example complies with sidecar schema
	yaml2json var/data/sidecar.yaml > var/data/sidecar.json
	-jsonschema -i var/data/sidecar.json var/schema/sidecar.json
	# Test sugarcrm schema/data
	yaml2json var/schema/sugarcrm.yaml > var/schema/sugarcrm.json
	-jsonschema -i var/schema/sugarcrm.json var/schema/draft-04.json
	yaml2json var/data/sugarcrm.yaml > var/data/sugarcrm.json
	-jsonschema -i var/data/sugarcrm.json var/schema/sugarcrm.json
	# Test using TV4
	-coffee var/schema/test.coffee



info:
	npm run srctree
	npm run srcloc

build: todo.list

# Produce list of tagged lines/comments
todo.list::
	grep -srI 'XXX\|FIXME\|TODO' ./ \
		--exclude-dir vendor \
		--exclude-dir node_modules \
		--exclude-dir lib-cov > $@


### RelaxNG schema rules

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
srctree:
	tree -I node_modules
srcdirs:
	tree -d -I node_modules

.invidia/dev.sqlite3: lib/sql.coffee
	-[ -e $@ ] && rm $@
	knex migrate:latest
	@echo DB reset

sql: .invidia/dev.sqlite3
	sqlite3 .invidia/dev.sqlite3


VERSION :=

publish:
	@[ -z "$(VERSION)" ] && { \
		echo "Specify VERSION"; exit 1; \
	} || echo Publishing $(VERSION)
	grep version..$(VERSION) ReadMe.rst
	@./check.coffee $(VERSION)
	grep '^$(VERSION)' Changelog.rst
	git push


