all: read transform

read:
	node index.js

transform:
	node get-html.js
	

