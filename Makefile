deploy :
	jekyll build --config _prod.yml --destination _prod
	rsync -rLvz _prod/ lbh@athena.dialup.mit.edu:/mit/9.660/web_scripts