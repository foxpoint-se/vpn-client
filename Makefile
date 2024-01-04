SHELL = /bin/bash

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help

.PHONY: setup-client
setup-client:
	cd api-client && yarn

.PHONY: connect
connect:		## connect using stored wg0.conf
	wg-quick up ./wg0.conf

.PHONY: disconnect
disconnect:		## disconnect using stored wg0.conf
	wg-quick down ./wg0.conf

.PHONY: build
build: setup-client		## build
	cd api-client && yarn build

.PHONY: clientconf
clientconf: build		## get client conf, e.g. `CLIENT=myclient make clientconf`
	@@if [ -z "$(CLIENT)" ]; then \
			echo "Call like this: CLIENT=myclient make clientconf"; \
		else \
			cd api-client && yarn clientconf -- $(CLIENT); \
		fi

.PHONY: clean
clean:		## clean generated stuff
	rm -rf wg0.conf dds.xml api-client/dist api-client/node_modules

.PHONY: ddsconf
ddsconf: build		## create dds.xml
	cd api-client && yarn ddsconf

.PHONY: multicast
multicast:		## enable multicast on the wg0 interface
	sudo ifconfig wg0 multicast
