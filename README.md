# VPN Client

A project that simplifies connecting to our VPN server.

## Get started

Run `make` to get all possible commands. At the moment of writing the available commands are:

```bash
build                          build
clean                          clean generated stuff
clientconf                     get client conf, e.g. `CLIENT=myclient make clientconf`
connect                        connect using stored wg0.conf
ddsconf                        create dds.xml
disconnect                     disconnect using stored wg0.conf
multicast                      enable multicast on the wg0 interface
```

### To connect to the VPN:

1. Make sure you have the correct AWS permissions to read secrets.
1. Make sure you have installed Wireguard.
1. Run `make build` to compile the API client.
1. Run `CLIENT=myclient make clientconf` to get a file `wg0.conf`.
1. Run `make connect` to connect to the VPN.
1. Run `make disconnect` to disconnect from the VPN.

### To setup things for enabling ROS2 communication over the VPN:

1. Follow all the steps from the previous section if you haven't already.
1. Make sure you have ROS2 installed.
1. Run `source source_me.sh` to get environments variables for DDS.
1. Run `make multicast` to enable multicast for the `wg0` interface.

Follow all of the steps above on each machine where you want ROS2 communication.

Now you can run `ros2 run demo_nodes_cpp listener` on one machine and `ros2 run demo_nodes_cpp talker` on another, and they should be able to talk to each other.
