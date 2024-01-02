# VPN Client

A project that simplifies connecting to our VPN server.

## Get started

Run `make` to get all possible commands. At the moment of writing the available commands are:

```bash
build                          build
clientconf                     get client conf, e.g. `CLIENT=myclient make clientconf`
connect                        connect using stored wg0.conf
disconnect                     disconnect using stored wg0.conf
install-wireguard              install wireguard
```

One procedure could be as follows:

1. Make sure you have the correct AWS permissions to read secrets.
1. Run `make install-wireguard` if you haven't already.
1. Run `make build` to compile the API client.
1. Run `CLIENT=myclient make clientconf` to get a file `wg0.conf`.
1. Run `make connect` to connect to the VPN.
1. Run `make disconnect` to disconnect from the VPN.
