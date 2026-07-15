.PHONY: photos serve check

photos:
	python3 scripts/build_photography.py

serve: photos
	python3 -m http.server 8000

check: photos
	node --check script.js
	node --check photography/photography.js
