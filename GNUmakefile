
# web.pid:
# 	fswatch ./ui | xargs -n1 './restart.sh' &

# start-web:	web.pid
# 	touch ./ui/index.html

# stop-web:	web.pid
# 	kill $$( cat web.pid )

start-debug:
	HC_ENABLE_ALL_LOGS=1 hcdev --debug --verbose web
