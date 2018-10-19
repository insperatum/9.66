deploy :
	read -p "Enter athena username:" user; \
	jekyll build --config _prod.yml --destination _prod; \
	rsync -rLvz _prod/ $$user@athena.dialup.mit.edu:/mit/9.660/web_scripts; \
	ssh $$user@athena.dialup.mit.edu 'chmod 777 /mit/9.660/web_scripts/bower_components/KaTeX/dist/fonts/*'
