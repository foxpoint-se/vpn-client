SHELL = /bin/bash

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help

.PHONY: install-wireguard
install-wireguard:		## install wireguard
	sudo apt install wireguard

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
clientconf:		## get client conf, e.g. `CLIENT=myclient make clientconf`
	@@if [ -z "$(CLIENT)" ]; then \
			echo "Call like this: CLIENT=myclient make clientconf"; \
		else \
			cd api-client && yarn clientconf -- $(CLIENT); \
		fi
