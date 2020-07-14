all: read transform opml

read:
	node index.js

transform:
	node get-html.js
	
opml:
	node generate-opml.js
