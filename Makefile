SHELL = /bin/bash

.PHONY: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help

install-wireguard:		## install wireguard
	sudo apt install wireguard

connect:		## connect using stored wg0.conf
	wg-quick up ./wg0.conf

disconnect:		## disconnect using stored wg0.conf
	wg-quick down ./wg0.conf
