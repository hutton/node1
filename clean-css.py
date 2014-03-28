import sys, re, os

rulePattern = r'[#.]{1}([a-zA-Z][a-zA-Z0-9-_]*)'

def matches_in_file(f, pattern):
	matches = []

	for line in f:
		match = re.search(pattern, line, re.I)

		if match:
			matches.append(match.group(1))

	return matches

def find_unused_css(stylesheet, rootdir):
	allRules = []

	for subdir, dirs, files in os.walk(rootdir):
		files = [ fi for fi in files if fi == stylesheet]

		for f in files:
			allRules = allRules + matches_in_file(open(subdir + "/" + f), rulePattern)

	allRules = list(set(allRules))

	for subdir, dirs, files in os.walk(rootdir):
		files = [ fi for fi in files if fi.endswith('.js') or fi.endswith('.html') or fi.endswith('.htm') ]

		for f in files:

			foundStrings = []

			fileContents = open(subdir + "/" + f).read()

			for rule in allRules:
				if rule in fileContents:
					foundStrings.append(rule)

			print 'Checking: ' + f + ' found ' + str(len(foundStrings))

			allRules = [rule for rule in allRules if rule not in foundStrings] 
	
	print ''
	print 'The following ' + str(len(allRules)) + ' css rules are not used.'
	print ''

	for rule in allRules:
		print rule

# python unused-css.py 'event2.css' './site/'

find_unused_css(sys.argv[1], sys.argv[2])
