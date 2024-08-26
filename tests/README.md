ipget_test
```json
true
```
ipfs_cluster_follow_test
```json
{
  "detect": "/usr/local/bin/ipfs-cluster-follow",
  "ipfsFollowStop": {
    "systemctl": "",
    "bash": "No ipfs-cluster-follow process found to kill",
    "api-socket": "api-socket not found, deleting not necessary"
  },
  "ipfsFollowStart": {
    "systemctl": false,
    "bash": {
      "stdout": "Starting the IPFS Cluster follower peer for \"cloudkit_storage\".\nCTRL-C to stop it.\nChecking if IPFS is online (will wait for 2 minutes)...\nwaiting for IPFS to become available on /ip4/127.0.0.1/tcp/5001...\n",
      "stderr": "2024-08-25T21:31:05.200-0700\tWARN\tpebble\tpebble/pebble.go:33\tPebble's format_major_version is set to 1, but newest version is 16.\n\nIt is recommended to increase format_major_version and restart. If an error\noccurrs when increasing the number several versions at once, it may help to\nincrease them one by one, restarting the daemon every time.\n\n2024-08-25T21:31:05.200-0700\tINFO\tpebble\tpebble@v0.0.0-20231218155426-48b54c29d8fe/open.go:993\t[JOB 1] WAL file /home/barberb/.ipfs-cluster-follow/cloudkit_storage/pebble/000340.log with log number 000340 stopped reading at offset: 0; replayed 0 keys in 0 batches\n2024-08-25T21:31:05.255-0700\tWARN\tswarm2\tswarm/swarm_listen.go:30\tlistening failed\t{\"on\": \"/ip4/0.0.0.0/udp/9096/quic\", \"error\": \"no transport for protocol\"}\n2024-08-25T21:31:05.268-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:137\tIPFS Cluster v1.0.8 listening on:\n        /ip4/127.0.0.1/tcp/9096/p2p/12D3KooWDmtSUbQYK9zhWGyURFxxdKtDpTp5LceBVxDANmrFf6bs\n        /ip4/172.17.18.157/tcp/9096/p2p/12D3KooWDmtSUbQYK9zhWGyURFxxdKtDpTp5LceBVxDANmrFf6bs\n\n\n"
    }
  },
  "testFollowList": "none",
  "testFollowInfo": {
    "clusterName": "cloudkit_storage",
    "configFolder": "/home/barberb/.ipfs-cluster-follow/cloudkit_storage",
    "configSource": "Available ()",
    "clusterPeerOnline": "true",
    "ipfsPeerOnline": "true"
  }
}
```
