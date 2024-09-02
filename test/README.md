install_ipfs_test
```json
true
```
ipget_test
```json
true
```
ipfs_test
```json
{
  "which_ipfs": "/home/barberb/ipfs_kit_js/ipfs_kit_js/bin/ipfs\n",
  "daemon_start": {
    "systemctl": null,
    "bash": {
      "stdout": "Initializing daemon...\nKubo version: 0.26.0\nRepo version: 15\nSystem version: amd64/linux\nGolang version: go1.21.6\nSwarm listening on /ip4/127.0.0.1/tcp/4001\nSwarm listening on /ip4/127.0.0.1/udp/4001/quic-v1\nSwarm listening on /ip4/127.0.0.1/udp/4001/quic-v1/webtransport/certhash/uEiAmBns7l33sXXrnrI4wKwIjgXVbr7aB_TgsqS7JrhWmcg/certhash/uEiCKOTQ8esQXrRYbvGb2gfnyPCHg4uBRtscnZlaKd13YCg\nSwarm listening on /ip4/172.17.18.157/tcp/4001\nSwarm listening on /ip4/172.17.18.157/udp/4001/quic-v1\nSwarm listening on /ip4/172.17.18.157/udp/4001/quic-v1/webtransport/certhash/uEiAmBns7l33sXXrnrI4wKwIjgXVbr7aB_TgsqS7JrhWmcg/certhash/uEiCKOTQ8esQXrRYbvGb2gfnyPCHg4uBRtscnZlaKd13YCg\nSwarm listening on /ip6/::1/tcp/4001\nSwarm listening on /ip6/::1/udp/4001/quic-v1\nSwarm listening on /ip6/::1/udp/4001/quic-v1/webtransport/certhash/uEiAmBns7l33sXXrnrI4wKwIjgXVbr7aB_TgsqS7JrhWmcg/certhash/uEiCKOTQ8esQXrRYbvGb2gfnyPCHg4uBRtscnZlaKd13YCg\nSwarm listening on /p2p-circuit\nSwarm announcing /ip4/127.0.0.1/tcp/4001\nSwarm announcing /ip4/127.0.0.1/udp/4001/quic-v1\nSwarm announcing /ip4/127.0.0.1/udp/4001/quic-v1/webtransport/certhash/uEiAmBns7l33sXXrnrI4wKwIjgXVbr7aB_TgsqS7JrhWmcg/certhash/uEiCKOTQ8esQXrRYbvGb2gfnyPCHg4uBRtscnZlaKd13YCg\nSwarm announcing /ip4/172.17.18.157/tcp/4001\nSwarm announcing /ip4/172.17.18.157/udp/4001/quic-v1\nSwarm announcing /ip4/172.17.18.157/udp/4001/quic-v1/webtransport/certhash/uEiAmBns7l33sXXrnrI4wKwIjgXVbr7aB_TgsqS7JrhWmcg/certhash/uEiCKOTQ8esQXrRYbvGb2gfnyPCHg4uBRtscnZlaKd13YCg\nSwarm announcing /ip4/97.120.194.7/udp/49717/quic-v1\nSwarm announcing /ip4/97.120.194.7/udp/49717/quic-v1/webtransport/certhash/uEiAmBns7l33sXXrnrI4wKwIjgXVbr7aB_TgsqS7JrhWmcg/certhash/uEiCKOTQ8esQXrRYbvGb2gfnyPCHg4uBRtscnZlaKd13YCg\nSwarm announcing /ip6/::1/tcp/4001\nSwarm announcing /ip6/::1/udp/4001/quic-v1\nSwarm announcing /ip6/::1/udp/4001/quic-v1/webtransport/certhash/uEiAmBns7l33sXXrnrI4wKwIjgXVbr7aB_TgsqS7JrhWmcg/certhash/uEiCKOTQ8esQXrRYbvGb2gfnyPCHg4uBRtscnZlaKd13YCg\nRPC API server listening on /ip4/127.0.0.1/tcp/5001\nWebUI: http://127.0.0.1:5001/webui\nGateway server listening on /ip4/127.0.0.1/tcp/8080\nDaemon is ready\n",
      "stderr": "2024/08/28 01:11:40 failed to sufficiently increase receive buffer size (was: 208 kiB, wanted: 2048 kiB, got: 416 kiB). See https://github.com/quic-go/quic-go/wiki/UDP-Buffer-Sizes for details.\n"
    },
    "ipfsReady": true
  },
  "add_pin": {
    "stdout": "pinned QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq recursively\n",
    "results": "pinned QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq recursively\n"
  },
  "get_pinset": {
    "bafkreiaaaquvumr2queebsg5v3ki27tg5d7pakbrw2kj6q2txra6p6pdkm": "recursive",
    "bafkreiap4nwogdf7urspg2nmhgegvpephtpvn6lbnnxq5w7aztuggbqbzi": "recursive",
    "bafkreiasyebhadliiackqn3wlawtjcdax5quk4rjsnhvuzybfanraz26ra": "recursive",
    "bafkreiav2euwvze7fxl2csstlvcf4rloxyude67xzhqrx4srj6icxzh5qa": "recursive",
    "bafkreibpg5caybp5dsaeqf6i4lrj3f424px6cokqqlxssplaml4g2xghgq": "recursive",
    "bafkreibrriauocjriynqlul4hug57a3mmznuu3xv5vl7yrujygd3zkqxvy": "recursive",
    "bafkreicl7eo446mp7klwnmt2t7pydwopcbxg24szsbd7uzsdflf4tlphr4": "recursive",
    "bafkreiduu6w4t4qxck2q6jika4y4g3ak7wsizwyvtdhxzcaszm74h3k6ta": "recursive",
    "bafkreiedbftdvea5h5thvlhzw2ev372z62owtgu5t77sf3onilhowmdnza": "recursive",
    "bafkreieeezop7hqrpylmiixcbwdpbexb3xvwz4oarhvr4pj7qcmt2tzevy": "recursive",
    "bafkreieqvcmsj2l4zgjybesymniawylcub7lc63xnosmrbarjwuncutr7u": "recursive",
    "bafkreifzikwobnuowbb2rgkqce2ds64vpc3dzwqyzea7eu7dlabkryhrt4": "recursive",
    "bafkreig4prpa35xesbctbx7co7x5fg3gpxmz346xvh7qbh5ceqduiv2c7e": "recursive",
    "QmQSbw63x2UDSiPouCjfrTr6uYT9UZcuAyYhCA8svZgPNd": "recursive",
    "QmR2rsCX5WHwA6JywpfA3qhk3poRKmp6h8uyWHLrNmCNUF": "recursive",
    "QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq": "recursive",
    "QmSrx9Ccc4EHVPTWqgkknS53JDUgieKTasRKRvJEsocP39": "recursive",
    "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn": "recursive",
    "QmXLrkZzjvT7gQRdMpY6mzZumWYhv3n6KYgqfEqYTmEMYq": "recursive",
    "QmbJWAESqCsf4RFCqEY7jecCashj8usXiyDNfKtZCwwzGb": "recursive",
    "QmcVPb71rkunHojQzQrhNxz8eFW1nAr4eJrY3AiRG5ibeT": "recursive",
    "QmccS8KtJtPgU46S3WZ5Xuwx1U7rM3igABMNExAVGpbD2E": "recursive",
    "QmUfYrWyvRbdJVpUfp3A7oCKBf13uLouaJ3VBMZtkBnb5b": "indirect",
    "QmdXmL2dyFU5ZT51G7bXzc3D1sPaBLEJiQtDRgzDhEAwx1": "indirect"
  },
  "add_path": {
    "stdout": "added QmbxpSiGo4cSmTmafrDzmE2zmiAtfcdFDo35SYZtsZnfv9 test.js\n",
    "stderr": "\r 27.97 KiB / ? \u001b[2K\r\r 27.97 KiB / ? ",
    "results": {
      "test.js": "QmbxpSiGo4cSmTmafrDzmE2zmiAtfcdFDo35SYZtsZnfv9"
    }
  },
  "remove_path": {
    "filesRm": {
      "stdout": "",
      "stderr": "",
      "results": ""
    },
    "pinRm": {
      "stdout": [
        "unpinned QmbxpSiGo4cSmTmafrDzmE2zmiAtfcdFDo35SYZtsZnfv9"
      ],
      "stderr": "",
      "results": [
        "unpinned QmbxpSiGo4cSmTmafrDzmE2zmiAtfcdFDo35SYZtsZnfv9"
      ]
    }
  },
  "stat_path": {
    "stderr": "",
    "stdout": "QmbxpSiGo4cSmTmafrDzmE2zmiAtfcdFDo35SYZtsZnfv9\nSize: 28638\nCumulativeSize: 28652\nChildBlocks: 0\nType: file\n",
    "results": {
      "pin": "QmbxpSiGo4cSmTmafrDzmE2zmiAtfcdFDo35SYZtsZnfv9",
      "size": 28638,
      "culumulativeSize": 28652,
      "childBlocks": 0,
      "type": "file"
    }
  },
  "name_resolve": {
    "stdout": "/ipfs/Qmc1zp5L56VMbfgfrQsGTRK9QmbzHWUtSMGaJ43jYPYRcZ/introduction/\n",
    "stderr": "",
    "results": [
      "/ipfs/Qmc1zp5L56VMbfgfrQsGTRK9QmbzHWUtSMGaJ43jYPYRcZ/introduction/"
    ]
  },
  "name_publish": {
    "add": {
      "stdout": "added bafkreifznk2i7jlwxysex7fsyg637bhyg3pp7vkqucidm45wezny5gbcx4 test.js",
      "stderr": "\r 27.97 KiB / ? \u001b[2K\r\r 27.97 KiB / 27.97 KiB  100.00%",
      "results": {
        "test.js": "bafkreifznk2i7jlwxysex7fsyg637bhyg3pp7vkqucidm45wezny5gbcx4"
      }
    },
    "publish": {
      "error": "Error: invalid path \"test.js\": path does not have enough components\n",
      "stdout": "",
      "stderr": "Error: invalid path \"test.js\": path does not have enough components\n",
      "results": "Error: invalid path \"test.js\": path does not have enough components\n"
    }
  },
  "ls_path": {
    "error": "Error: file does not exist\n",
    "stdout": "",
    "stderr": "Error: file does not exist\n",
    "results": "Error: file does not exist\n"
  },
  "remove_pin": {
    "stdout": "unpinned QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq\n",
    "stderr": "",
    "results": "unpinned QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq\n"
  },
  "daemon_stop": {
    "systemctl": null,
    "bash": null
  }
}
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
      "stderr": "2024-08-28T01:11:47.401-0700\tWARN\tpebble\tpebble/pebble.go:33\tPebble's format_major_version is set to 1, but newest version is 16.\n\nIt is recommended to increase format_major_version and restart. If an error\noccurrs when increasing the number several versions at once, it may help to\nincrease them one by one, restarting the daemon every time.\n\n2024-08-28T01:11:47.407-0700\tINFO\tpebble\tpebble@v0.0.0-20231218155426-48b54c29d8fe/open.go:993\t[JOB 1] WAL file /home/barberb/.ipfs-cluster-follow/cloudkit_storage/pebble/000379.log with log number 000379 stopped reading at offset: 0; replayed 0 keys in 0 batches\n2024-08-28T01:11:47.459-0700\tWARN\tswarm2\tswarm/swarm_listen.go:30\tlistening failed\t{\"on\": \"/ip4/0.0.0.0/udp/9096/quic\", \"error\": \"no transport for protocol\"}\n2024-08-28T01:11:47.484-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:137\tIPFS Cluster v1.0.8 listening on:\n        /ip4/127.0.0.1/tcp/9096/p2p/12D3KooWDmtSUbQYK9zhWGyURFxxdKtDpTp5LceBVxDANmrFf6bs\n        /ip4/172.17.18.157/tcp/9096/p2p/12D3KooWDmtSUbQYK9zhWGyURFxxdKtDpTp5LceBVxDANmrFf6bs\n\n\n"
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
ipfs_cluster_service_test
```json
{
  "detect": "/home/barberb/ipfs_kit_js/ipfs_kit_js/bin/ipfs-cluster-service",
  "testServiceStart": {
    "systemctl": false,
    "bash": {
      "stdout": "",
      "stderr": "2024-08-28T01:12:03.858-0700\tINFO\tservice\tipfs-cluster-service/daemon.go:50\tInitializing. For verbose output run with \"-l debug\". Please wait...\n2024-08-28T01:12:03.863-0700\tWARN\tpebble\tpebble/pebble.go:33\tPebble's format_major_version is set to 1, but newest version is 16.\n\nIt is recommended to increase format_major_version and restart. If an error\noccurrs when increasing the number several versions at once, it may help to\nincrease them one by one, restarting the daemon every time.\n\n2024-08-28T01:12:03.864-0700\tINFO\tpebble\tpebble@v0.0.0-20231218155426-48b54c29d8fe/open.go:993\t[JOB 1] WAL file /home/barberb/.cache/ipfs/pebble/000004.log with log number 000004 stopped reading at offset: 0; replayed 0 keys in 0 batches\n2024-08-28T01:12:03.888-0700\tINFO\tservice\tipfs-cluster-service/daemon.go:276\tDatastore backend: pebble\n2024-08-28T01:12:03.963-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:137\tIPFS Cluster v1.0.8 listening on:\n        /ip4/127.0.0.1/tcp/9096/p2p/12D3KooWGZuDqJbNPQPdnBvsi4X8qrFNgq5em7Um9XCg4CmKpED8\n        /ip4/172.17.18.157/tcp/9096/p2p/12D3KooWGZuDqJbNPQPdnBvsi4X8qrFNgq5em7Um9XCg4CmKpED8\n\n\n2024-08-28T01:12:18.976-0700\tINFO\trestapi\tcommon/api.go:454\tRESTAPI (HTTP): /ip4/127.0.0.1/tcp/9094\n2024-08-28T01:12:18.977-0700\tINFO\tpinsvcapi\tcommon/api.go:454\tPINSVCAPI (HTTP): /ip4/127.0.0.1/tcp/9097\n2024-08-28T01:12:18.983-0700\tINFO\tipfsproxy\tipfsproxy/ipfsproxy.go:335\tIPFS Proxy: /ip4/127.0.0.1/tcp/9095 -> /ip4/127.0.0.1/tcp/5001\n2024-08-28T01:12:18.991-0700\tINFO\tcrdt\tgo-ds-crdt@v0.5.2/set.go:122\tTombstones have bloomed: 0 tombs. Took: 5.795698ms\n2024-08-28T01:12:18.995-0700\tINFO\tcrdt\tgo-ds-crdt@v0.5.2/crdt.go:292\tcrdt Datastore created. Number of heads: 0. Current max-height: 0. Dirty: false\n2024-08-28T01:12:18.995-0700\tINFO\tcrdt\tcrdt/consensus.go:320\t'trust all' mode enabled. Any peer in the cluster can modify the pinset.\n2024-08-28T01:12:18.996-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:735\tCluster Peers (without including ourselves):\n2024-08-28T01:12:18.996-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:737\t    - No other peers\n2024-08-28T01:12:18.996-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:747\tWaiting for IPFS to be ready...\n2024-08-28T01:12:18.998-0700\tINFO\tcrdt\tgo-ds-crdt@v0.5.2/crdt.go:502\tstore is marked clean. No need to repair\n2024-08-28T01:12:18.998-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:756\tIPFS is ready. Peer ID: 12D3KooWFTmuTUHbokKfeYudhA2Sy5nWkFq66o9prQhDe1pEQBPu\n2024-08-28T01:12:18.999-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:764\t** IPFS Cluster is READY **\n"
    }
  },
  "testServiceStop": {
    "ipfsClusterService": [
      "",
      ""
    ]
  }
}
```
ipfs_kit_test
```json
{
  "test_ipfs_kit_start": {
    "ipfsClusterService": {
      "systemctl": false,
      "bash": {
        "stdout": "",
        "stderr": "2024-08-28T01:12:24.495-0700\tINFO\tservice\tipfs-cluster-service/daemon.go:50\tInitializing. For verbose output run with \"-l debug\". Please wait...\n2024-08-28T01:12:24.500-0700\tWARN\tpebble\tpebble/pebble.go:33\tPebble's format_major_version is set to 1, but newest version is 16.\n\nIt is recommended to increase format_major_version and restart. If an error\noccurrs when increasing the number several versions at once, it may help to\nincrease them one by one, restarting the daemon every time.\n\n2024-08-28T01:12:24.504-0700\tINFO\tpebble\tpebble@v0.0.0-20231218155426-48b54c29d8fe/open.go:993\t[JOB 1] WAL file /home/barberb/.cache/ipfs/pebble/000007.log with log number 000007 stopped reading at offset: 0; replayed 0 keys in 0 batches\n2024-08-28T01:12:24.560-0700\tINFO\tservice\tipfs-cluster-service/daemon.go:276\tDatastore backend: pebble\n2024-08-28T01:12:24.597-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:137\tIPFS Cluster v1.0.8 listening on:\n        /ip4/127.0.0.1/tcp/9096/p2p/12D3KooWGZuDqJbNPQPdnBvsi4X8qrFNgq5em7Um9XCg4CmKpED8\n        /ip4/172.17.18.157/tcp/9096/p2p/12D3KooWGZuDqJbNPQPdnBvsi4X8qrFNgq5em7Um9XCg4CmKpED8\n\n\n2024-08-28T01:12:39.604-0700\tINFO\trestapi\tcommon/api.go:454\tRESTAPI (HTTP): /ip4/127.0.0.1/tcp/9094\n2024-08-28T01:12:39.604-0700\tINFO\tipfsproxy\tipfsproxy/ipfsproxy.go:335\tIPFS Proxy: /ip4/127.0.0.1/tcp/9095 -> /ip4/127.0.0.1/tcp/5001\n2024-08-28T01:12:39.604-0700\tINFO\tpinsvcapi\tcommon/api.go:454\tPINSVCAPI (HTTP): /ip4/127.0.0.1/tcp/9097\n2024-08-28T01:12:39.605-0700\tINFO\tcrdt\tgo-ds-crdt@v0.5.2/set.go:122\tTombstones have bloomed: 0 tombs. Took: 658.234µs\n2024-08-28T01:12:39.605-0700\tINFO\tcrdt\tgo-ds-crdt@v0.5.2/crdt.go:292\tcrdt Datastore created. Number of heads: 0. Current max-height: 0. Dirty: false\n2024-08-28T01:12:39.605-0700\tINFO\tcrdt\tcrdt/consensus.go:320\t'trust all' mode enabled. Any peer in the cluster can modify the pinset.\n2024-08-28T01:12:39.606-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:735\tCluster Peers (without including ourselves):\n2024-08-28T01:12:39.606-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:737\t    - No other peers\n2024-08-28T01:12:39.606-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:747\tWaiting for IPFS to be ready...\n2024-08-28T01:12:39.606-0700\tINFO\tcrdt\tgo-ds-crdt@v0.5.2/crdt.go:502\tstore is marked clean. No need to repair\n2024-08-28T01:12:39.611-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:756\tIPFS is ready. Peer ID: 12D3KooWFTmuTUHbokKfeYudhA2Sy5nWkFq66o9prQhDe1pEQBPu\n2024-08-28T01:12:39.611-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:764\t** IPFS Cluster is READY **\n"
      }
    },
    "ipfsClusterFollow": null,
    "ipfs": {
      "systemctl": null,
      "bash": {
        "error": "Error: lock /home/barberb/.cache/ipfs/repo.lock: someone else has the lock\n",
        "stdout": "Initializing daemon...\nKubo version: 0.26.0\nRepo version: 15\nSystem version: amd64/linux\nGolang version: go1.21.6\n\n",
        "stderr": "Error: lock /home/barberb/.cache/ipfs/repo.lock: someone else has the lock\n"
      },
      "ipfsReady": true
    }
  },
  "test_ipfs_kit_ready": true,
  "test_ipfs_kit_stop": {
    "ipfsClusterService": {
      "ipfsClusterService": [
        "",
        ""
      ]
    },
    "ipfsClusterFollow": null,
    "ipfs": {
      "systemctl": null,
      "bash": null
    }
  },
  "test_ipfs_get_pinset": {
    "ipfsCluster": {},
    "ipfs": {
      "bafkreiaaaquvumr2queebsg5v3ki27tg5d7pakbrw2kj6q2txra6p6pdkm": "recursive",
      "bafkreiap4nwogdf7urspg2nmhgegvpephtpvn6lbnnxq5w7aztuggbqbzi": "recursive",
      "bafkreiasyebhadliiackqn3wlawtjcdax5quk4rjsnhvuzybfanraz26ra": "recursive",
      "bafkreiav2euwvze7fxl2csstlvcf4rloxyude67xzhqrx4srj6icxzh5qa": "recursive",
      "bafkreibpg5caybp5dsaeqf6i4lrj3f424px6cokqqlxssplaml4g2xghgq": "recursive",
      "bafkreibrriauocjriynqlul4hug57a3mmznuu3xv5vl7yrujygd3zkqxvy": "recursive",
      "bafkreicl7eo446mp7klwnmt2t7pydwopcbxg24szsbd7uzsdflf4tlphr4": "recursive",
      "bafkreiduu6w4t4qxck2q6jika4y4g3ak7wsizwyvtdhxzcaszm74h3k6ta": "recursive",
      "bafkreiedbftdvea5h5thvlhzw2ev372z62owtgu5t77sf3onilhowmdnza": "recursive",
      "bafkreieeezop7hqrpylmiixcbwdpbexb3xvwz4oarhvr4pj7qcmt2tzevy": "recursive",
      "bafkreieqvcmsj2l4zgjybesymniawylcub7lc63xnosmrbarjwuncutr7u": "recursive",
      "bafkreifzikwobnuowbb2rgkqce2ds64vpc3dzwqyzea7eu7dlabkryhrt4": "recursive",
      "bafkreifznk2i7jlwxysex7fsyg637bhyg3pp7vkqucidm45wezny5gbcx4": "recursive",
      "bafkreig4prpa35xesbctbx7co7x5fg3gpxmz346xvh7qbh5ceqduiv2c7e": "recursive",
      "QmQSbw63x2UDSiPouCjfrTr6uYT9UZcuAyYhCA8svZgPNd": "recursive",
      "QmR2rsCX5WHwA6JywpfA3qhk3poRKmp6h8uyWHLrNmCNUF": "recursive",
      "QmSrx9Ccc4EHVPTWqgkknS53JDUgieKTasRKRvJEsocP39": "recursive",
      "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn": "recursive",
      "QmXLrkZzjvT7gQRdMpY6mzZumWYhv3n6KYgqfEqYTmEMYq": "recursive",
      "QmbJWAESqCsf4RFCqEY7jecCashj8usXiyDNfKtZCwwzGb": "recursive",
      "QmcVPb71rkunHojQzQrhNxz8eFW1nAr4eJrY3AiRG5ibeT": "recursive",
      "QmccS8KtJtPgU46S3WZ5Xuwx1U7rM3igABMNExAVGpbD2E": "recursive"
    }
  },
  "test_ipfs_add_pin": {
    "ipfsClusterCtlAddPin": {
      "/home/barberb/.cache/pins/QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq": "QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq:\n    > worker-1             : PINNED | 2024-08-28T01:12:46-07:00 | Attempts: 0 | Priority: false\n"
    },
    "ipfsAddPin": {
      "stdout": "pinned QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq recursively\n",
      "results": "pinned QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq recursively\n"
    },
    "ipget": {
      "cid": "QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq",
      "path": "/home/barberb/.cache/pins/QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq",
      "mtime": 1724818643721.8958,
      "filesize": 276382
    }
  },
  "test_ipfs_remove_pin": {
    "ipfsClusterRemovePin": {
      "results": "QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq:\n    > worker-1             : UNPINNED | 2024-08-28T01:12:48.264782969-07:00 | Attempts: 0 | Priority: false"
    },
    "ipfsRemovePin": {
      "stdout": "unpinned QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq\n",
      "stderr": "",
      "results": "unpinned QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq\n"
    }
  },
  "test_ipget_download_object": {
    "ipgetDownloadObject": {
      "cid": "QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq",
      "path": "/tmp/test",
      "mtime": 1724400086428.771,
      "filesize": 2
    }
  },
  "test_ipfs_upload_object": {
    "ipfsUploadObject": {
      "stdout": "added QmbxpSiGo4cSmTmafrDzmE2zmiAtfcdFDo35SYZtsZnfv9 test.js\n",
      "stderr": "\r 27.97 KiB / 27.97 KiB  100.00%\u001b[2K\r\r 27.97 KiB / 27.97 KiB  100.00%",
      "results": {
        "test.js": "QmbxpSiGo4cSmTmafrDzmE2zmiAtfcdFDo35SYZtsZnfv9"
      }
    },
    "fileStat": {
      "dev": 27,
      "mode": 33204,
      "nlink": 1,
      "uid": 1000,
      "gid": 1000,
      "rdev": 0,
      "blksize": 29184,
      "ino": 1984578,
      "size": 28638,
      "blocks": 18,
      "atimeMs": 1724832652026.797,
      "mtimeMs": 1724832652010.7964,
      "ctimeMs": 1724832652010.7964,
      "birthtimeMs": 1721818791655.3608
    }
  },
  "test_load_collection": null,
  "test_ipfs_add_path": {
    "ipfsClusterCtlAddPath": {},
    "ipfsAddPath": {
      "stdout": "added QmbxpSiGo4cSmTmafrDzmE2zmiAtfcdFDo35SYZtsZnfv9 test.js\n",
      "stderr": "\r 27.97 KiB / ? \u001b[2K\r\r 27.97 KiB / 27.97 KiB  100.00%",
      "results": {
        "test.js": "QmbxpSiGo4cSmTmafrDzmE2zmiAtfcdFDo35SYZtsZnfv9"
      }
    }
  },
  "test_ipfs_remove_path": {
    "ipfsClusterCtlRemovePath": [
      "Failed to unpin: /home/barberb/ipfs_kit_js/tests/test.js"
    ],
    "ipfsRemovePath": {
      "filesRm": {
        "stdout": "",
        "stderr": "",
        "results": ""
      },
      "pinRm": {
        "stdout": [
          "unpinned QmbxpSiGo4cSmTmafrDzmE2zmiAtfcdFDo35SYZtsZnfv9"
        ],
        "stderr": "",
        "results": [
          "unpinned QmbxpSiGo4cSmTmafrDzmE2zmiAtfcdFDo35SYZtsZnfv9"
        ]
      }
    }
  },
  "test_ipfs_ls_path": {
    "ipfsLsPath": {
      "stdout": "test.js\n",
      "stderr": "",
      "results": [
        "test.js"
      ]
    }
  },
  "test_ipfs_get_config": {
    "ipfsGetConfig": {
      "API": {
        "HTTPHeaders": {}
      },
      "Addresses": {
        "API": "/ip4/127.0.0.1/tcp/5001",
        "Announce": [],
        "AppendAnnounce": [],
        "Gateway": "/ip4/127.0.0.1/tcp/8080",
        "NoAnnounce": [],
        "Swarm": [
          "/ip4/0.0.0.0/tcp/4001",
          "/ip6/::/tcp/4001",
          "/ip4/0.0.0.0/udp/4001/quic-v1",
          "/ip4/0.0.0.0/udp/4001/quic-v1/webtransport",
          "/ip6/::/udp/4001/quic-v1",
          "/ip6/::/udp/4001/quic-v1/webtransport"
        ]
      },
      "AutoNAT": {},
      "Bootstrap": [
        "/ip4/172.17.0.1/tcp/9096/p2p/12D3KooWFHz8Ze2LyrkkL7q3AqMU6TASaYcW2nmzpYwQodsq2SCV",
        "/ip4/167.99.96.231/tcp/9096/p2p/12D3KooWFHz8Ze2LyrkkL7q3AqMU6TASaYcW2nmzpYwQodsq2SCV",
        "/ip4/127.0.0.1/tcp/9096/p2p/12D3KooWFHz8Ze2LyrkkL7q3AqMU6TASaYcW2nmzpYwQodsq2SCV",
        "/ip4/10.46.0.5/tcp/9096/p2p/12D3KooWFHz8Ze2LyrkkL7q3AqMU6TASaYcW2nmzpYwQodsq2SCV",
        "/ip4/10.120.0.2/tcp/9096/p2p/12D3KooWFHz8Ze2LyrkkL7q3AqMU6TASaYcW2nmzpYwQodsq2SCV",
        "/ip4/10.11.0.1/tcp/9096/p2p/12D3KooWFHz8Ze2LyrkkL7q3AqMU6TASaYcW2nmzpYwQodsq2SCV",
        "/ip4/97.120.209.166/tcp/38053/p2p/12D3KooWJ6mj5yii47Hedtfajahmcq1jhU1CmycvKoKoRFWyY4Ea",
        "/ip4/97.120.209.166/tcp/18100/p2p/12D3KooWJ6mj5yii47Hedtfajahmcq1jhU1CmycvKoKoRFWyY4Ea",
        "/ip4/97.120.166.109/tcp/33661/p2p/12D3KooWECihD8h6TooNoqJAVFDsP5MgUiVcy7XYRRmkFM3yyYME/p2p-circuit/p2p/12D3KooWJ6mj5yii47Hedtfajahmcq1jhU1CmycvKoKoRFWyY4Ea",
        "/ip4/25.18.152.214/tcp/9096/p2p/12D3KooWECihD8h6TooNoqJAVFDsP5MgUiVcy7XYRRmkFM3yyYME/p2p-circuit/p2p/12D3KooWJ6mj5yii47Hedtfajahmcq1jhU1CmycvKoKoRFWyY4Ea",
        "/ip4/167.99.96.231/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv/p2p-circuit/p2p/12D3KooWJ6mj5yii47Hedtfajahmcq1jhU1CmycvKoKoRFWyY4Ea",
        "/ip4/172.17.0.1/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv",
        "/ip4/167.99.96.231/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv",
        "/ip4/127.0.0.1/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv",
        "/ip4/10.46.0.5/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv",
        "/ip4/10.120.0.2/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv",
        "/ip4/10.11.0.1/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv",
        "/ip4/172.17.0.1/tcp/9096/p2p/12D3KooWDYKMnVLKnP2SmM8umJEEKdhug93QYybmNUEiSe1Kwjmu",
        "/ip4/167.99.96.231/tcp/9096/p2p/12D3KooWDYKMnVLKnP2SmM8umJEEKdhug93QYybmNUEiSe1Kwjmu",
        "/ip4/127.0.0.1/tcp/9096/p2p/12D3KooWDYKMnVLKnP2SmM8umJEEKdhug93QYybmNUEiSe1Kwjmu",
        "/ip4/10.46.0.5/tcp/9096/p2p/12D3KooWDYKMnVLKnP2SmM8umJEEKdhug93QYybmNUEiSe1Kwjmu",
        "/ip4/10.120.0.2/tcp/9096/p2p/12D3KooWDYKMnVLKnP2SmM8umJEEKdhug93QYybmNUEiSe1Kwjmu",
        "/ip4/10.11.0.1/tcp/9096/p2p/12D3KooWDYKMnVLKnP2SmM8umJEEKdhug93QYybmNUEiSe1Kwjmu",
        "/ip4/97.120.209.166/tcp/38053/p2p/12D3KooWJ6mj5yii47Hedtfajahmcq1jhU1CmycvKoKoRFWyY4Ea/p2p-circuit/p2p/12D3KooWNJN6azoq29bY4J3GjE8xQHdYZeQ72Ga6cXnnQ11Jx8fP",
        "/ip4/97.120.209.166/tcp/28143/p2p/12D3KooWECihD8h6TooNoqJAVFDsP5MgUiVcy7XYRRmkFM3yyYME/p2p-circuit/p2p/12D3KooWNJN6azoq29bY4J3GjE8xQHdYZeQ72Ga6cXnnQ11Jx8fP",
        "/ip4/97.120.209.166/tcp/18100/p2p/12D3KooWJ6mj5yii47Hedtfajahmcq1jhU1CmycvKoKoRFWyY4Ea/p2p-circuit/p2p/12D3KooWNJN6azoq29bY4J3GjE8xQHdYZeQ72Ga6cXnnQ11Jx8fP",
        "/ip4/192.168.0.20/tcp/57468/p2p/12D3KooWNJN6azoq29bY4J3GjE8xQHdYZeQ72Ga6cXnnQ11Jx8fP",
        "/ip4/172.29.29.10/tcp/9096/p2p/12D3KooWNJN6azoq29bY4J3GjE8xQHdYZeQ72Ga6cXnnQ11Jx8fP",
        "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
        "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
        "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
        "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
        "/ip4/104.131.131.82/udp/4001/quic-v1/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
        "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN"
      ],
      "DNS": {
        "Resolvers": {}
      },
      "Datastore": {
        "BloomFilterSize": 0,
        "GCPeriod": "1h",
        "HashOnRead": false,
        "Spec": {
          "child": {
            "path": "badgerds",
            "syncWrites": false,
            "truncate": true,
            "type": "badgerds"
          },
          "prefix": "badger.datastore",
          "type": "measure"
        },
        "StorageGCWatermark": 90,
        "StorageMax": "10GB"
      },
      "Discovery": {
        "MDNS": {
          "Enabled": true
        }
      },
      "Experimental": {
        "FilestoreEnabled": false,
        "Libp2pStreamMounting": false,
        "OptimisticProvide": false,
        "OptimisticProvideJobsPoolSize": 0,
        "P2pHttpProxy": false,
        "StrategicProviding": false,
        "UrlstoreEnabled": false
      },
      "Gateway": {
        "APICommands": [],
        "DeserializedResponses": null,
        "DisableHTMLErrors": null,
        "ExposeRoutingAPI": null,
        "HTTPHeaders": {},
        "NoDNSLink": false,
        "NoFetch": false,
        "PathPrefixes": [],
        "PublicGateways": null,
        "RootRedirect": ""
      },
      "Identity": {
        "PeerID": "12D3KooWFTmuTUHbokKfeYudhA2Sy5nWkFq66o9prQhDe1pEQBPu"
      },
      "Internal": {},
      "Ipns": {
        "RecordLifetime": "",
        "RepublishPeriod": "",
        "ResolveCacheSize": 128
      },
      "Migration": {
        "DownloadSources": [],
        "Keep": ""
      },
      "Mounts": {
        "FuseAllowOther": false,
        "IPFS": "/ipfs",
        "IPNS": "/ipns"
      },
      "Peering": {
        "Peers": null
      },
      "Pinning": {
        "RemoteServices": {}
      },
      "Plugins": {
        "Plugins": null
      },
      "Provider": {
        "Strategy": ""
      },
      "Pubsub": {
        "DisableSigning": false,
        "Router": ""
      },
      "Reprovider": {},
      "Routing": {
        "AcceleratedDHTClient": false,
        "Methods": null,
        "Routers": null
      },
      "Swarm": {
        "AddrFilters": null,
        "ConnMgr": {},
        "DisableBandwidthMetrics": false,
        "DisableNatPortMap": false,
        "RelayClient": {},
        "RelayService": {},
        "ResourceMgr": {},
        "Transports": {
          "Multiplexers": {},
          "Network": {},
          "Security": {}
        }
      },
      "foo": "bar"
    }
  },
  "test_ipfs_set_config": {
    "ipfsSetConfig": {}
  },
  "test_ipfs_name_publish": {
    "ipfsNamePublish": {
      "add": {
        "stdout": "added bafkreifznk2i7jlwxysex7fsyg637bhyg3pp7vkqucidm45wezny5gbcx4 test.js",
        "stderr": "\r 27.97 KiB / ? \u001b[2K\r\r 27.97 KiB / 27.97 KiB  100.00%",
        "results": {
          "test.js": "bafkreifznk2i7jlwxysex7fsyg637bhyg3pp7vkqucidm45wezny5gbcx4"
        }
      },
      "publish": {
        "error": "Error: invalid path \"test.js\": path does not have enough components\n",
        "stdout": "",
        "stderr": "Error: invalid path \"test.js\": path does not have enough components\n",
        "results": "Error: invalid path \"test.js\": path does not have enough components\n"
      }
    }
  },
  "test_ipfs_name_resolve": {
    "ipfsNameResolve": {
      "stdout": "/ipfs/Qmc1zp5L56VMbfgfrQsGTRK9QmbzHWUtSMGaJ43jYPYRcZ/introduction/\n",
      "stderr": "",
      "results": [
        "/ipfs/Qmc1zp5L56VMbfgfrQsGTRK9QmbzHWUtSMGaJ43jYPYRcZ/introduction/"
      ]
    }
  },
  "test_ipfs_get_config_value": {
    "ipfsGetConfigValue": "bar"
  },
  "test_ipfs_set_config_value": {
    "ipfsSetConfigValue": ""
  },
  "test_update_collection_ipfs": null
}
```
