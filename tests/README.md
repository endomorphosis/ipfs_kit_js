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
      "stderr": "2024-08-25T21:24:19.861-0700\tERROR\tipfshttp\tipfshttp/ipfshttp.go:1276\terror posting to IPFS:Post \"http://127.0.0.1:5001/api/v0/id\": dial tcp 127.0.0.1:5001: connect: connection refused\n"
    }
  },
  "testFollowList": "none",
  "testFollowInfo": {
    "clusterName": "cloudkit_storage",
    "configFolder": "/home/barberb/.ipfs-cluster-follow/cloudkit_storage",
    "configSource": "Available ()",
    "clusterPeerOnline": "false",
    "ipfsPeerOnline": "false"
  }
}
```
