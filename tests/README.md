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
    "bash": false
  },
  "testFollowList": false,
  "testFollowInfo": {
    "clusterName": "cloudkit_storage",
    "configFolder": "/home/barberb/.ipfs-cluster-follow/cloudkit_storage",
    "configSource": "Available ()",
    "clusterPeerOnline": "false",
    "ipfsPeerOnline": "true"
  }
}
```
ipfs_cluster_service_test
```json
{
  "detect": "/home/barberb/ipfs_kit_js/ipfs_kit_js/bin/ipfs-cluster-service",
  "testServiceStart": {
    "_events": {},
    "_eventsCount": 2,
    "_closesNeeded": 3,
    "_closesGot": 0,
    "connected": false,
    "signalCode": null,
    "exitCode": null,
    "killed": false,
    "spawnfile": "/bin/sh",
    "_handle": {
      "pid": 1039995
    },
    "spawnargs": [
      "/bin/sh",
      "-c",
      "PATH=/home/barberb/.local/bin:/home/barberb/.nvm/versions/node/v22.5.1/bin:/home/barberb/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/home/barberb/ipfs_kit_js/ipfs_kit_js/bin IPFS_CLUSTER_PATH=/home/barberb/.cache/ipfs ipfs-cluster-service daemon "
    ],
    "pid": 1039995,
    "stdin": {
      "connecting": false,
      "_hadError": false,
      "_parent": null,
      "_host": null,
      "_closeAfterHandlingError": false,
      "_events": {},
      "_readableState": {
        "highWaterMark": 65536,
        "buffer": [],
        "bufferIndex": 0,
        "length": 0,
        "pipes": [],
        "awaitDrainWriters": null,
        "readable": false
      },
      "_writableState": {
        "highWaterMark": 65536,
        "length": 0,
        "corked": 0,
        "writelen": 0,
        "bufferedIndex": 0,
        "pendingcb": 0
      },
      "allowHalfOpen": false,
      "_eventsCount": 1,
      "_sockname": null,
      "_pendingData": null,
      "_pendingEncoding": "",
      "server": null,
      "_server": null
    },
    "stdout": {
      "connecting": false,
      "_hadError": false,
      "_parent": null,
      "_host": null,
      "_closeAfterHandlingError": false,
      "_events": {},
      "_readableState": {
        "highWaterMark": 65536,
        "buffer": [],
        "bufferIndex": 0,
        "length": 0,
        "pipes": [],
        "awaitDrainWriters": null
      },
      "_writableState": {
        "highWaterMark": 65536,
        "length": 0,
        "corked": 0,
        "writelen": 0,
        "bufferedIndex": 0,
        "pendingcb": 0
      },
      "allowHalfOpen": false,
      "_eventsCount": 3,
      "_sockname": null,
      "_pendingData": null,
      "_pendingEncoding": "",
      "server": null,
      "_server": null
    },
    "stderr": {
      "connecting": false,
      "_hadError": false,
      "_parent": null,
      "_host": null,
      "_closeAfterHandlingError": false,
      "_events": {},
      "_readableState": {
        "highWaterMark": 65536,
        "buffer": [],
        "bufferIndex": 0,
        "length": 0,
        "pipes": [],
        "awaitDrainWriters": null
      },
      "_writableState": {
        "highWaterMark": 65536,
        "length": 0,
        "corked": 0,
        "writelen": 0,
        "bufferedIndex": 0,
        "pendingcb": 0
      },
      "allowHalfOpen": false,
      "_eventsCount": 3,
      "_sockname": null,
      "_pendingData": null,
      "_pendingEncoding": "",
      "server": null,
      "_server": null
    },
    "stdio": [
      {
        "connecting": false,
        "_hadError": false,
        "_parent": null,
        "_host": null,
        "_closeAfterHandlingError": false,
        "_events": {},
        "_readableState": {
          "highWaterMark": 65536,
          "buffer": [],
          "bufferIndex": 0,
          "length": 0,
          "pipes": [],
          "awaitDrainWriters": null,
          "readable": false
        },
        "_writableState": {
          "highWaterMark": 65536,
          "length": 0,
          "corked": 0,
          "writelen": 0,
          "bufferedIndex": 0,
          "pendingcb": 0
        },
        "allowHalfOpen": false,
        "_eventsCount": 1,
        "_sockname": null,
        "_pendingData": null,
        "_pendingEncoding": "",
        "server": null,
        "_server": null
      },
      {
        "connecting": false,
        "_hadError": false,
        "_parent": null,
        "_host": null,
        "_closeAfterHandlingError": false,
        "_events": {},
        "_readableState": {
          "highWaterMark": 65536,
          "buffer": [],
          "bufferIndex": 0,
          "length": 0,
          "pipes": [],
          "awaitDrainWriters": null
        },
        "_writableState": {
          "highWaterMark": 65536,
          "length": 0,
          "corked": 0,
          "writelen": 0,
          "bufferedIndex": 0,
          "pendingcb": 0
        },
        "allowHalfOpen": false,
        "_eventsCount": 3,
        "_sockname": null,
        "_pendingData": null,
        "_pendingEncoding": "",
        "server": null,
        "_server": null
      },
      {
        "connecting": false,
        "_hadError": false,
        "_parent": null,
        "_host": null,
        "_closeAfterHandlingError": false,
        "_events": {},
        "_readableState": {
          "highWaterMark": 65536,
          "buffer": [],
          "bufferIndex": 0,
          "length": 0,
          "pipes": [],
          "awaitDrainWriters": null
        },
        "_writableState": {
          "highWaterMark": 65536,
          "length": 0,
          "corked": 0,
          "writelen": 0,
          "bufferedIndex": 0,
          "pendingcb": 0
        },
        "allowHalfOpen": false,
        "_eventsCount": 3,
        "_sockname": null,
        "_pendingData": null,
        "_pendingEncoding": "",
        "server": null,
        "_server": null
      }
    ]
  },
  "testServiceStop": {
    "ipfsClusterService": ""
  }
}
```
