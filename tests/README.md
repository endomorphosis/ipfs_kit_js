ipfs_kit_test
```json
{
  "test_ipfs_kit_start": {
    "ipfsClusterService": {
      "systemctl": false,
      "bash": {
        "stdout": "",
        "stderr": "2024-08-27T21:06:41.059-0700\tINFO\tservice\tipfs-cluster-service/daemon.go:50\tInitializing. For verbose output run with \"-l debug\". Please wait...\n2024-08-27T21:06:41.062-0700\tWARN\tpebble\tpebble/pebble.go:33\tPebble's format_major_version is set to 1, but newest version is 16.\n\nIt is recommended to increase format_major_version and restart. If an error\noccurrs when increasing the number several versions at once, it may help to\nincrease them one by one, restarting the daemon every time.\n\n2024-08-27T21:06:41.064-0700\tINFO\tpebble\tpebble@v0.0.0-20231218155426-48b54c29d8fe/open.go:993\t[JOB 1] WAL file /home/barberb/.cache/ipfs/pebble/000769.log with log number 000769 stopped reading at offset: 0; replayed 0 keys in 0 batches\n2024-08-27T21:06:41.097-0700\tINFO\tservice\tipfs-cluster-service/daemon.go:276\tDatastore backend: pebble\n2024-08-27T21:06:41.186-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:137\tIPFS Cluster v1.0.8 listening on:\n        /ip4/127.0.0.1/tcp/9096/p2p/12D3KooWGZuDqJbNPQPdnBvsi4X8qrFNgq5em7Um9XCg4CmKpED8\n        /ip4/172.17.18.157/tcp/9096/p2p/12D3KooWGZuDqJbNPQPdnBvsi4X8qrFNgq5em7Um9XCg4CmKpED8\n\n\n2024-08-27T21:06:59.192-0700\tINFO\tpinsvcapi\tcommon/api.go:454\tPINSVCAPI (HTTP): /ip4/127.0.0.1/tcp/9097\n2024-08-27T21:06:59.192-0700\tINFO\trestapi\tcommon/api.go:454\tRESTAPI (HTTP): /ip4/127.0.0.1/tcp/9094\n2024-08-27T21:06:59.193-0700\tINFO\tcrdt\tgo-ds-crdt@v0.5.2/set.go:122\tTombstones have bloomed: 11 tombs. Took: 242.104µs\n2024-08-27T21:06:59.192-0700\tINFO\tipfsproxy\tipfsproxy/ipfsproxy.go:335\tIPFS Proxy: /ip4/127.0.0.1/tcp/9095 -> /ip4/127.0.0.1/tcp/5001\n2024-08-27T21:06:59.193-0700\tINFO\tcrdt\tgo-ds-crdt@v0.5.2/crdt.go:292\tcrdt Datastore created. Number of heads: 1. Current max-height: 59623. Dirty: false\n2024-08-27T21:06:59.194-0700\tINFO\tcrdt\tcrdt/consensus.go:320\t'trust all' mode enabled. Any peer in the cluster can modify the pinset.\n2024-08-27T21:06:59.194-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:735\tCluster Peers (without including ourselves):\n2024-08-27T21:06:59.194-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:737\t    - No other peers\n2024-08-27T21:06:59.194-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:747\tWaiting for IPFS to be ready...\n2024-08-27T21:06:59.194-0700\tINFO\tcrdt\tgo-ds-crdt@v0.5.2/crdt.go:502\tstore is marked clean. No need to repair\n2024-08-27T21:06:59.199-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:756\tIPFS is ready. Peer ID: 12D3KooWFTmuTUHbokKfeYudhA2Sy5nWkFq66o9prQhDe1pEQBPu\n2024-08-27T21:06:59.200-0700\tINFO\tcluster\tipfs-cluster@v1.0.8/cluster.go:764\t** IPFS Cluster is READY **\n2024-08-27T21:06:59.202-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmPHry5tHL3YCF9ePU4eyHr79FfayWgHB8K95dPsypcvwV\n2024-08-27T21:06:59.204-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmPL29RW6QqnV1r2bVCwzKGduw474EDcbwPxcjp4KdWU1s\n2024-08-27T21:06:59.204-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmPP3drKFdpNJkCaaummoa3fy7GpMx8m8Fcti26FbhrEp6\n2024-08-27T21:06:59.204-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmNW5DDMUztokoYYtMQjQKozQRNLnqdzt7gjU2o1mPrgVj\n2024-08-27T21:06:59.204-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmNVhusTkM9hhTwY2c1oXSKyeseW9FrgDEkzZDcTdsBo2s\n2024-08-27T21:06:59.204-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmNZhpegacrzYdzRhXDUqgN6DRHYhkMahCsEnC815EzC6i\n2024-08-27T21:06:59.204-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmNjjSEdHyYevKcb9pJZ2jyXwtwED3AZUbgBzqQ1Vgaaai\n2024-08-27T21:06:59.204-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmNiVGSoVDDajNNQFefHtb8HCw5BombVu6qULWmXfxfZ32\n2024-08-27T21:06:59.204-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmNoe7qMPsRimNiP4hRS11x9Ja48i5AUJGSAsB8EB39F4y\n2024-08-27T21:06:59.204-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmNoK7fQyCf9H3MhEsuSj6jzZ8MQT2PPQsC3wRYCyuBx7V\n2024-08-27T21:06:59.204-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmNqp7gXBkdmiSSnaAd5GNG23WLuAU9KFunXqbeYw4vyjg\n2024-08-27T21:06:59.204-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmNsUceGKxVjsUYpzk4CV13FZ3GhCkbebP7STVGzFT3FEz\n2024-08-27T21:06:59.204-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmNtZTNtBpJX1zPQ4EfgHmfV9exNMozStHa3puSwzm1u6J\n2024-08-27T21:06:59.205-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmNxzAwjfim6w5RpFFTzZNyP8UAoBFEFb2gshPRMxzJPMh\n2024-08-27T21:06:59.205-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmP1koa2tu6Ge6omHEWNhBDsHCbrWJj9QBd6ScDqZJrWox\n2024-08-27T21:06:59.205-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmP4c6EyDDKeyYwhVPDgiWz6uPkZ3ouWQaXNFRMzk74HbX\n2024-08-27T21:06:59.205-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmPBQhLG4ZXAnz7ba1aNaFqnU9nLSD5zDFWMQnnBGnSihN\n2024-08-27T21:06:59.205-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmQJsDWdupdEoRbqLZk6sih47AJCY7ZX1biTayfNxoZ3Tv\n2024-08-27T21:06:59.205-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmQL1mgujmfvkuRmtEE9uCYFVtcC6e2Cpewm2rqhKWeZjU\n2024-08-27T21:06:59.205-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmQNeJbS2PMPrQ7tKcuuNmZava2DSRYXAQv1F8mn9RGXZ9\n2024-08-27T21:06:59.206-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmPc4uCZrLw3z3Mt14ein8fS4QeDNLEjDjYwNUoY4onRvZ\n2024-08-27T21:06:59.206-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmPcF8DErEfuu2wusGgFfu48XxuZCJLdAmEcP6bxZeNjqw\n2024-08-27T21:06:59.206-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmPmqiA73ymdtn1bESCeuKaUtCuMmG1CiNWdTyk316N8hF\n2024-08-27T21:06:59.206-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmPn1MjzhxzVKTVaRYskZmMmuGV3SuLb9j8oFf3XCieDoT\n2024-08-27T21:06:59.206-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmPpGkSwb2HfThks9hPd4uQcW2k8ZesZYu2bQU7333Bn6o\n2024-08-27T21:06:59.206-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmPvKTzUS31nztRNrzfudn36n2HpaNLoMpRKyqAUsobnmm\n2024-08-27T21:06:59.206-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmPyBSZH4VwsoxFzgJs949bwnkbWoRF8qoXNN8Jx8jFnXm\n2024-08-27T21:06:59.207-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmQ5wy2KFAdtSBSKWt2HvLb6c5xzd3GQTLjWLJXQK9GGF6\n2024-08-27T21:06:59.207-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmQDQgswp3s6ZcPDinWurvs9Ts7unMNPKcLckHiM34e4wA\n2024-08-27T21:06:59.207-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmRQ7e6KgyqCHoWo8LDbAMjfb6RuNk6Unq8FUeANiBPFZK\n2024-08-27T21:06:59.207-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmRQHbp3nmVE23meRaFurYMU5e3BKPjXeWzdtD1xkgxr4B\n2024-08-27T21:06:59.207-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmRVEQU2bpqVX9vMEXAjVhrEGVyXCyQciFn8PUm1Wg9okN\n2024-08-27T21:06:59.208-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmRX78GywVuhQXRG25GZuSDg4ut9ohffKaeiWomQPCRq7D\n2024-08-27T21:06:59.208-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmRXDmdWVQiedPknidzyP86GFVTKiZX7fDywaz1aTq9k1b\n2024-08-27T21:06:59.208-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmQXRSwknE1bTWWhLzUQkUWAX5RKMJZkRAdfHYiJffKVRA\n2024-08-27T21:06:59.208-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmQarLrjqEmMFK6cjXT8uCWuU2Ec385a6TdgcZ8WbW7z3M\n2024-08-27T21:06:59.208-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmQbcha2oKUP9q4mrEuKe8yBNooMadPf11eLyPnnEPL8xv\n2024-08-27T21:06:59.208-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmQcT6zC3sU9dYbSD23yjgnMZiwqCieoUABgcs2msuvsB9\n2024-08-27T21:06:59.209-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmQmv9xZYgFNB9Z2g69C2bUGKKk8PMHcTtZTSdYwWekLY9\n2024-08-27T21:06:59.209-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmQqveNVhRkvsuTNUN6Hj3cJDpH7SLqzfuVgvmzuGCkJzG\n2024-08-27T21:06:59.210-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmQutVUPPBHWdwSt9fK8n3wKjhcRFKzGBxca6fDoLF1mBt\n2024-08-27T21:06:59.210-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmQwtiwHGmmoWgPxiFa5a5KE5kXqUkV6Mtj4go7Pffq77a\n2024-08-27T21:06:59.211-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmR2LcHRt9EUaHA435o4SngWf8eWCujqoC3j5cjHP5tLaB\n2024-08-27T21:06:59.211-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmRAH7FucRyB1Tkn66ryQeTR426JcnnS6NiE1EUkNhLVHN\n2024-08-27T21:06:59.211-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmRDg2MCyNrg16qpWVsNVMJwhtgqJrQHjaEUjMeVMzM1Gs\n2024-08-27T21:06:59.211-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmRJDXEPgNRtzFKSNvW2CQND2aHxhBjmBCaqYDWsRcBCq1\n2024-08-27T21:06:59.212-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmRGpJKiWvWAkujjeyoonQ45iFzjSkogEqybY5wdGUYGyr\n2024-08-27T21:06:59.212-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmSUS2uUJX1h9iS2CjqWmiHc6Ek8ENPsrfRHrfdRNpFXgZ\n2024-08-27T21:06:59.213-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmRt9po6dv5hD15Fnx2SxziH3KBmcUMB85RYmdLkB4bov2\n2024-08-27T21:06:59.213-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmRvyLUvVcVPa7Nc1HA2xKDiH8mm9A29SvSTekk86KRMqn\n2024-08-27T21:06:59.213-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmRyhsJ8X6yibGn1cj8Vvwobt7z15tNByiiSxEmjdsFnAP\n2024-08-27T21:06:59.217-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmS34N7bYjuvYtxenMHqZ4ekG7asRHxek1EjPmC9oB2m2t\n2024-08-27T21:06:59.218-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmS2FPKdd2QVPSPbtLXpPPrzYeNdRhV4g4TQ4WWjGZx7mX\n2024-08-27T21:06:59.218-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmS2XTPJLn4GEmPFcncAihY5jtYhvdTXkqQ1yVasS8JEa7\n2024-08-27T21:06:59.218-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmS9Ks795S34KqU2uTaCU3tdpdDQ8PxrF6xu5vkHPF3oUC\n2024-08-27T21:06:59.218-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmS9VXw1g1dcz51YmzTTo2JDHEVcyqXqnrXRBMZZeaVaz3\n2024-08-27T21:06:59.218-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmSEt8roJi4g9pEuuFCGgt75qVtxzwG5ZfPNgp4zRyiq6S\n2024-08-27T21:06:59.218-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmSEfDzGbMCzcpSVv61bn9WZdc9qvvZbS9Y518cNuQqmSn\n2024-08-27T21:06:59.219-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmSLg482meu9xpNTpewViRmUaRUUK4k3apZoXa2vAE7vyg\n2024-08-27T21:06:59.219-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmSL4ma6JVjjLXRPt7KHD2rH1NU5iVbYnphe27PTbizF1S\n2024-08-27T21:06:59.219-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmSM594MCa3VPvXFijULP6UsX6PyMp72HX7caUKWcV6RJC\n2024-08-27T21:06:59.219-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmSMZNXcT6GHCktixQP49Q49myjT1tTdUKbs1jijH1cJmT\n2024-08-27T21:06:59.220-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmSPkuNQDuQ2ghkzorvpJYag8UAzNh6xFibjJaLFtr8vWL\n2024-08-27T21:06:59.220-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmSRh7yUbXSPkXzbts1yGngipSsM8NSH7hVa4XVKUgZ5yt\n2024-08-27T21:06:59.220-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmTXPPA4593QUk6QkFtH2MY8GWyFymp7vrhAL24dghpoga\n2024-08-27T21:06:59.221-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmTb7Hvw1sRgKL5xkWqwoFdVp2tjuyFpbPrKv9bGpMcD46\n2024-08-27T21:06:59.221-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmTdwxhphkz6UKJTDAs7CCvzt6eHrNBhSLLcQXyRNDwp9m\n2024-08-27T21:06:59.221-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmTfG9YcnLCYmQoHWfsqKb4byWWcLiq95RFPYWLM9JoZ74\n2024-08-27T21:06:59.222-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmTfJdRiiX87NthJJaYbntgDdEmuMHrLDF2bnRxZiJw9TK\n2024-08-27T21:06:59.222-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmSheEDe7nPHpt8yW7xPJfmPg86ez8tzHTSGevbpGMx5rK\n2024-08-27T21:06:59.222-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmSiZfLUnomYhWyW152jD1GPsBrPsCRTBu3HKVY6483BV2\n2024-08-27T21:06:59.223-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmSnTyPoGWBvMhwV9ErVs4kkCfV4DtRgNoG6yUmdDnZK1G\n2024-08-27T21:06:59.224-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmSq5zyYWHGUyheoGAiK6nzt3kTkZvhk4CEdUyiC49D58c\n2024-08-27T21:06:59.224-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmSqKif6wLtPnmQG5Rb1wZjxz4EDTJJwh6GEAuTXqKxC4q\n2024-08-27T21:06:59.224-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmSxqsHKeNiArpTGZU8A3Wdme6K8pF35GpCf7x3w9exDoZ\n2024-08-27T21:06:59.224-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmT2tz4EaNXvMzLr6ZoB1S114kqgaXUjb45ikPMCJu3rLn\n2024-08-27T21:06:59.224-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmTJoSFbHVwt1WrCW1ch3gaoFkt9ZeaUtJeeb7QcTJNbKR\n2024-08-27T21:06:59.224-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmTKyXZ6UWR59Seh2qnAvwKz7XTx56tAKfGhFmvngyY13v\n2024-08-27T21:06:59.225-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmUhie3qfb4Dt5ACfUkAHUkZB9SMVGrskXb4EVLaKUYPLs\n2024-08-27T21:06:59.225-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmTj9tFkL3LVojtFkJmaGU7UHooJB5pu2KvJyAZVpwhXTd\n2024-08-27T21:06:59.225-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmTnanD5aQMTgB1oCoScuayxso79qk5uCeN74f1yVzucNq\n2024-08-27T21:06:59.225-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmTroBSt1mcWk8MyG7oWjgCYMAY228RCnm3ATVJzy9s5kt\n2024-08-27T21:06:59.226-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmTvgL6v9B1bLmryYkdfBEF5EJUzcxYzbC1xwkFHaYuWyw\n2024-08-27T21:06:59.226-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmTybR8sPbbAQcFciZyHTRs2BY1potFNDcGJ8tnhVRV7NA\n2024-08-27T21:06:59.226-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmU15SzstR4GYLmGNHoqS5EeVdw2sh7HuZgLzWT6ub52Ar\n2024-08-27T21:06:59.226-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmU4hkGuLKH67Qp7JHv83HnS5QVucoNc964XnNLLYk6XTV\n2024-08-27T21:06:59.226-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmUASjUqfhd8HYft9cMmeRPYutrtj2qXZMbQrxUpbQQ3Fh\n2024-08-27T21:06:59.227-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmUDD4FtKC9yFg4so5AqVcH1g7nVw5wTzsqyrVY7GcNj8Y\n2024-08-27T21:06:59.227-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmUEEnCZb13LpXm2qu6bRgqPnQwHEbSzvvrByVKWngVZfC\n2024-08-27T21:06:59.227-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmUFUDe3nepshHnjneuonL3j1jKtEQ7USnMk9Xdqd4gmhS\n2024-08-27T21:06:59.227-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmUJAPWEH6R6ycop7uVE7AcAmtBCmRfhYuuWiM76cXwNt9\n2024-08-27T21:06:59.227-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmUJUU2nd2fqwcb1mUpHVpmygcFnGazAw9TaSdZftx81o3\n2024-08-27T21:06:59.229-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmUJxP1L3eL1EkXEupNc9f6Jtm2pLrbKxoUh3CiToeNT6W\n2024-08-27T21:06:59.230-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmUQL8zHmUtbxjqphGG4Vad73z1smZ7qZEiuDUNrcoUmah\n2024-08-27T21:06:59.230-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmUSCsYkVee2Cwqv4YfPbwXxZFtGDn845BhquxXRwmgfmP\n2024-08-27T21:06:59.230-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmUVLEhPYk85WQLRdb98MGFoo9x4kX7uhmovtcfKfMZ1To\n2024-08-27T21:06:59.230-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmUYFBW714T93ZCtL2Cp2Px9PY14jgq21WPgKDsmgEQeQ1\n2024-08-27T21:06:59.231-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmUaCjUcEzk2eoDUveXF3ETdZrHfRFvZ5C3Qm9tnzZhSLx\n2024-08-27T21:06:59.231-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmVgFjJNWjGfMAqmc36LMDNLJiCFHT5Yig99DGkcjoS1rp\n2024-08-27T21:06:59.231-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmVgyQSqaRhtujZwy5BvHQyYWjmiUdWZRXfGruLx4EtGzy\n2024-08-27T21:06:59.231-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmVnY5Di5dDkEgp9wf4WGdMTn3gbQvhqw7NzBJkBSXtdyR\n2024-08-27T21:06:59.232-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmVo1aJobyuZCVf6PSAiNxQZJWuGRnipbkhpVRJHo6ECbi\n2024-08-27T21:06:59.232-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmUub6E1X73VmtYPNGz6F7xyjnc6k9iuWgDfcTRLyCmV1p\n2024-08-27T21:06:59.232-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmV2tgxSLoCKjwSggBKqK9KGXCUjTGBEimnyYSoa1WfV83\n2024-08-27T21:06:59.232-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmV4VE6wufxa3dnnoiC3v4ejXcCRG3k1CLAahE7d1Doeo3\n2024-08-27T21:06:59.233-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmVGsm6Mu4rhqbC2wRWCek7UgH4bgsBDfNbXUKPZKdx1pC\n2024-08-27T21:06:59.233-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmVUYoZonfq5MWVXwhFyKx6qnLsCTMonNcK6gvGDyYpHVR\n2024-08-27T21:06:59.233-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmVW1JirzXViRSPdCnSXhVxbWPkozmuW5kED6oWEgwYjQu\n2024-08-27T21:06:59.237-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmVdSWEuXgHStqgFwAvTWz48wPJFfFhNKTjpYvuz3gFg81\n2024-08-27T21:06:59.238-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmWpKUJRd8ukSLF45p6tSgxfC4Kz1hT8SoAsijDY8mGti8\n2024-08-27T21:06:59.238-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmWnigdCFUPzie3AyVTZJj6sux9pob5jH4Fs9BA2AbLs7e\n2024-08-27T21:06:59.238-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmWr8m6pvPrJUdzKxcArH1SywbpK1iuSQUXythkq7UsHRE\n2024-08-27T21:06:59.238-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmWtnQGtmkHzmAv5enBfPsJnxYx53ShkipvpjJr3gq4HFj\n2024-08-27T21:06:59.238-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmWukvVRLXejaeYdqqidj22U12xRPkipJoYWx5tztYN4bo\n2024-08-27T21:06:59.238-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmVtndEYAzMFEwD2BtwycqrrbTXNzcxN65XZy4qY4A3oLS\n2024-08-27T21:06:59.238-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmVvdX9n7dV1tAUBmJJMq5HqULF1Bi6vWaPrwhU8eKLPNz\n2024-08-27T21:06:59.239-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmW1dam1zdMKFHTpxDjW9ihwg5Jr4BwqDxR3todo1vux6N\n2024-08-27T21:06:59.239-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmVyofkLr5x5zZushSvNxQvqT9Y8ggWDx3YmBSiCSgmnM8\n2024-08-27T21:06:59.239-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmVyw8dYvc7DmYoxg1VBmDD6e7R2T8huxwHjC3B44oe9HD\n2024-08-27T21:06:59.239-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmW2QA91mHGnKwfwzfYjfQen5s6CAHiQipVDpBJqpqzcoo\n2024-08-27T21:06:59.239-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmW4ip4GauunK6TpMxp9yhbTWZ2UfrYD8yNJUGZ2Z6uZDB\n2024-08-27T21:06:59.240-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmW4kqntH2zgfHf8sbVyDQWWHzzGuC6gaubMN8B5MfPCop\n2024-08-27T21:06:59.240-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmWCBLCEF3u697a96yhQr83i59hiUeaBHEuaEAW3KqRGaW\n2024-08-27T21:06:59.240-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmWDrfVMc3dDfvdeqgxLpQpyeFnVj3o6zq6iSxdF4C5Z4N\n2024-08-27T21:06:59.240-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmWKNLYWyUCtafpgToGM4YisC86avHAsSgGMA4VNvjz1yj\n2024-08-27T21:06:59.240-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmWNiLrSUr7haHNEXoSvnPXpHQ7zuP7uJWopKeUBh2mgEP\n2024-08-27T21:06:59.240-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmWT1y2BygA9aQWwumWHYC3Mp1ApfM4SXujdEy3rWjkUhP\n2024-08-27T21:06:59.241-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmWRr8P7RbfE74R6ZRHqcLU7fXpLZX3rb9GMYuDYwoKg94\n2024-08-27T21:06:59.241-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmWTynUTNY3EhM3TDJr9XNi6NaC3FqCeS87vkqEw5uAw1a\n2024-08-27T21:06:59.241-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmWVV1PRYJ84Ngekp1b8ZaZRAzsGWBD9P8N9Z9V72MXchT\n2024-08-27T21:06:59.241-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmWi7HeF3LRZKsdsb8pQYzXa9PFppy1h9vzRMtaNKSkVz3\n2024-08-27T21:06:59.241-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmXv1urWdz94XCam3fXX6iekLJTtgD87bHeqVRn2doPvge\n2024-08-27T21:06:59.242-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmXxmxu3Xb7EUXiMefZCXw2d2GXW32FSEPqtEHhKKjshdE\n2024-08-27T21:06:59.242-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmXyTHLtRT3i3aBEreQhpvyFfHxSNhWun2VxWSpW9h5X8g\n2024-08-27T21:06:59.242-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmX5FTvAcJNmE1EpwYNg771S4KpSB8dPtiLQQWwv2wXo8G\n2024-08-27T21:06:59.242-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmX7SzUQg7unfsDhp5XTRPrwiyyedXzoa5rdFkKPn8h5i5\n2024-08-27T21:06:59.242-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmX9tykVKJsEuX46QNF3j1ssAR4cUuzHxKP8SLFcsvn6it\n2024-08-27T21:06:59.243-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmX8TdrzbZBPQDG2kYc3Lcii9VJjeR4Aq429rxeyKL6FhJ\n2024-08-27T21:06:59.243-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmXC2W5PxxLEyMkFD9VZXYx7exCv8G4VReV9zSEB5zBqEh\n2024-08-27T21:06:59.243-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmXJbCV1nyCD9xi61Eeqiysjc7Q4arF12da8Zh52kRgYZ8\n2024-08-27T21:06:59.243-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmXPXmeC6h9i7nLagg7DpuuTiYexGdMrJqkZ4fRm47Qjoa\n2024-08-27T21:06:59.243-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmXWRbzjEdJR1QxuT8VWYV1s4AnJ5kS5eiLbgLGEjL78x7\n2024-08-27T21:06:59.243-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmXcvFuRHAnznunKPHb8E5V3eoYqWv4kRxQ4exaaeFcDjf\n2024-08-27T21:06:59.243-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmXm5i67utD1kxwYtKUPp2gLd9zhd2C53esCJm6RhAhMAw\n2024-08-27T21:06:59.244-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmXnDjEgi9Eju3SZsZHnTfYuqeufftcdnCSyDzkcFf3FNG\n2024-08-27T21:06:59.244-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmZ4ofhEqzoBASgV4w3fJi8qjy4zFqHzLDNtitbcKg4t2r\n2024-08-27T21:06:59.244-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmZ5kvbJSuz69s1k3MsQZnNWzWDzLY6J3cytZwhEdgsiwM\n2024-08-27T21:06:59.244-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmZ6AA2NenhUf37omjXfmnrWC1GYPP778G524dSkUHpvf3\n2024-08-27T21:06:59.244-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmYDWCM2g3vEzfL2CcGuA7j3myMd1QZPJoF5bKAtkr3W1d\n2024-08-27T21:06:59.245-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmYKfedCryB7xvjxEM7GDPwXco54B3odshGjvMXdnNwCjS\n2024-08-27T21:06:59.245-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmYMtWFbvcY6Z6UQMymSLA3SEbMfSXj9SsSiPs1XAAoRPV\n2024-08-27T21:06:59.245-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmYNKHRQHjEPvJCNwL1VJJiBLs664s7u7VidFuPuNgYKNw\n2024-08-27T21:06:59.245-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmYS55c42dMyvjDPjvV4o4t9KZTp32bSErzQhnmSyf3dot\n2024-08-27T21:06:59.245-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmYSrbWiqCBrQEYm8M6yaQCNR754QsuGcTpRY3BB9zfktg\n2024-08-27T21:06:59.245-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmYVcpdN3s9ncjH3Zbvio7ta9emavWUKcb1DczY2nwdDud\n2024-08-27T21:06:59.246-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmYaPH5eabGNn8ThbemeEScPw3XnjFSaaNm9tFY4kYJht3\n2024-08-27T21:06:59.246-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmYeR6geq86WvfokW2PngRBHmGEkLrwzbWFFfpoEffLntF\n2024-08-27T21:06:59.246-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmYgjFH8MsT5zPFhMy4cC3TpWDvEcjZMYb25jumF1tH95N\n2024-08-27T21:06:59.246-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmYhH2LMXFegJC2bPas3zzugdbz4KMwHxHuEeKcN2Uea2Z\n2024-08-27T21:06:59.246-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmYqvXHknSPbtDQdaDMbiDcXJtTP98bSetMLwBBLoQ9wrJ\n2024-08-27T21:06:59.247-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmYr8i7AmeSyQPv9mw4zyNbiR3zGwBWP3Se8Xgo1GCug45\n2024-08-27T21:06:59.247-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmYtsLpA1ZnadiXd1NaEH9BAnMXtwzMmGTaV7Cx4o32MyD\n2024-08-27T21:06:59.247-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qma1A8n9yxJ7JuGrZUXjLf1YrUxQkYXoGpEqgcfJQ1NqrB\n2024-08-27T21:06:59.248-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmaBUZiQZb8DDRktAZjZhiFGbc8eAsJ23dYqw9Q1WgcyF1\n2024-08-27T21:06:59.248-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmZAqxFd6LRf1oQB2WqU1foTXnxWt5LjsYVss5rMCY2oFc\n2024-08-27T21:06:59.248-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmZHAqAZzAzeCiLmvUDF7nErs9tKgNMPQw1a9PUjuKm11n\n2024-08-27T21:06:59.248-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmZMHDEa53cUvmYakJ7XaFQ4a7NQyh9r3DXN1XZ1ndzULX\n2024-08-27T21:06:59.249-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmZPNaYQrrEKWZkKKKWQKqkE85hFAp6zG9xmbHQVwAkcQv\n2024-08-27T21:06:59.249-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmZTBjYir638BesBAdyQmu7u658NuoMoPtuzzLn3eunMn4\n2024-08-27T21:06:59.249-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmZc2f7aEm7UbrkhBBEVhiYzGs1QrMC9TYwPAx2NP6AF7g\n2024-08-27T21:06:59.249-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmZcuvz9eNfp1ujcXt7yPvb9Rixi6Po7NQEsfMEVkiBjmR\n2024-08-27T21:06:59.249-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmZfz71ZiGNXcT1S9w8SSMCNvNY5AjhZE6bJpMmFpN7snj\n2024-08-27T21:06:59.249-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmZmVGvy1XNvLETGwDZV6AZ2mfbEiq78Dcp7vrVJYg2T1e\n2024-08-27T21:06:59.250-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmZokVYhw4M8At9f9TBRetvbABT3QU8SH4EVzEBjNSnESt\n2024-08-27T21:06:59.250-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmZqn4H3zFhMUFEGBres3VfPzAfyyMNhzmnhRr91tAFSQr\n2024-08-27T21:06:59.250-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmZyuc4ZJdYp3EUkoCccesiVdUhaA1LKgDzJY6JsvpSxKD\n2024-08-27T21:06:59.250-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmZxcsvEF9DU9i9RkRyPAjczTw1joKUZj2yXJnNpuXaQtD\n2024-08-27T21:06:59.250-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmb81LV21p5tYk8zgp9thowTuB3yGz81Xv1ZbPqYUMWRaG\n2024-08-27T21:06:59.251-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmb86LaeLEdRPAwJ5zYRENVE34nRKUuYVFF8xCEF5wS6v7\n2024-08-27T21:06:59.251-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmb9zgL2d815icq2h1VpCGjRb7rW7duK5sS6RZwxJWbmaq\n2024-08-27T21:06:59.251-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmaR1zDyy6FsEvNcM73pcEboY6pA1H1FTx3CA9TiCtakVb\n2024-08-27T21:06:59.251-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmaRhZn3QUMNpr3FdKe8DceZsPi8D7DaHwcWUHWYXQdSbs\n2024-08-27T21:06:59.252-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmaSNb64su7i3TPjTBxe4YbMMg9vBPjmu7NAfNC3LGbYfj\n2024-08-27T21:06:59.252-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmaUwyXinFx6M8cytCTj1BFwgndqTAH1E7TjfoAdDyii6U\n2024-08-27T21:06:59.252-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmaYrWKZRTD4mmd5uaVP1dcMwKQxuumn4ouGi1owZtcJhq\n2024-08-27T21:06:59.252-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmaXZa4L4mDud1VeqwEK1dgXhBUqutcPms1Guog32Ae6zJ\n2024-08-27T21:06:59.253-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmae5bBVwbt7TiaTDe7xVsdLWhgLwMsaALHi9rUprEro9V\n2024-08-27T21:06:59.253-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmapk3TwSUEfj2Je2JNRXL2cndSqpVgt9YKu84paXzPd1A\n2024-08-27T21:06:59.253-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmanwKHtMr871gkzXmQcfGdjLTyUMiRNwPrFNFr3vJKmwk\n2024-08-27T21:06:59.253-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmapqcYaDXpGffp2AMoiwgybo5zmUcBRizp3yLTfrAnskR\n2024-08-27T21:06:59.253-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmauFWsrCFDC54iWgXkz5N2QHnriPZ76S8Jb8KHJRzkbJJ\n2024-08-27T21:06:59.253-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmb1UpPuc5nvxHUKmJNCbshun6dHSCQzHXqWURSSWNVbHX\n2024-08-27T21:06:59.254-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmb3S4s2tPvaFKCETu24fTkbAFarPF4a7Yt7TNgxYsR97e\n2024-08-27T21:06:59.254-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmc9iUANY8tZe9EonbEaW1RtFfLaV23JVScdB6Gi673cuW\n2024-08-27T21:06:59.254-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmbH8VenhxUhirdWkFJzW6qe54U8eEzDrtxJFAJqSp1gi9\n2024-08-27T21:06:59.254-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmbJdsyo6fptnP8RrLLYzA6gnKoj9VmbSrZ8RW1fYBjt9U\n2024-08-27T21:06:59.254-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmbLJtpna6JmURxzf13f6wtFw5NuHFAgXH2k6swbVkiikJ\n2024-08-27T21:06:59.255-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmbLMUp3yCJW86URnJMR5YZRb36kpLCzMWWrhhuuMXCe3i\n2024-08-27T21:06:59.255-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmbTisLYzDmbTcJRcgMh3PXh4kdXdyjm2sFuPmhLZqD6oc\n2024-08-27T21:06:59.255-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmbVakr5hqigZDrwfChSvjAjo9FjERSgt9WZeA8hADKCty\n2024-08-27T21:06:59.255-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmbZis52qVp4McfFQYnQtnL7WA5P37RkX7VSr4u1LNuaVi\n2024-08-27T21:06:59.255-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmbcSNb7WQmiwUZtEfpaXXwGZ4Nc6YbcSLGsjgbUYrRWAx\n2024-08-27T21:06:59.256-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmbeFkxsyHKT8nCwoJznBt8S619PE9aNxHFE1feHtvW83V\n2024-08-27T21:06:59.256-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmbjBj2DfuEHhMcN2hR3u8C2643MLWDoMzUGmjHbJxx2Ba\n2024-08-27T21:06:59.256-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmbiZqKa4Y6NNooBG3MH1vKxF8BygGZrAWjPQKRYKfu738\n2024-08-27T21:06:59.256-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmbjiFfVuxQeY4388RtwwasbC9yCiFJJv3jAJ931Nnqhjv\n2024-08-27T21:06:59.256-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmbvy6gagF2HEhriWjHEpnicr82235fLBpmG32xJQbZJoR\n2024-08-27T21:06:59.257-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmc3TUGG8vJyFyX2rXmUAH3v4h1aaqVYhhu27FvSVPf7Hf\n2024-08-27T21:06:59.257-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmc6uDuH3LBSGQaYxJeKAYJDrZcfG3a1MLWvUMMeoi6XnF\n2024-08-27T21:06:59.258-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmc5UUjPJ46G5FNBPF4NnSBqqRbZ9cDYpqxv4S5KFEMSb3\n2024-08-27T21:06:59.258-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmc8a8wEQSLGrHVXGBD7i2EteDLTo4VtxBDvm4Y6m9Mo1V\n2024-08-27T21:06:59.258-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmc725wptCLayV94LwQLP33C6BXH8Zbzub81q55kDfes3a\n2024-08-27T21:06:59.259-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmcPNdUGNKVAn45KNKR19hfuSNmY83hd1s3WLgc4PZxX6T\n2024-08-27T21:06:59.259-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmcXHzg661heeGmyJawsuVDnMUQeqB5UDCvuuEZcDjYzDk\n2024-08-27T21:06:59.259-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmcffTEt1sN1GZpxg2HrQ1NjZ57eMwRP5n7ZwgJCEETESG\n2024-08-27T21:06:59.260-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmcgGj1NzNHKiQU3DsysacuDXzLpRzyUuRyW7bRj5KzPWj\n2024-08-27T21:06:59.260-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmchRWaxvoesMJAoQ5bC7zCrj3SUz7gQDAiXBJLLdBpd6b\n2024-08-27T21:06:59.260-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmcjpzQWcHF22U9afxwruUmFXnZgpSLkUMNYGrX127PS8K\n2024-08-27T21:06:59.261-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmcibgmkMnXTWSBC3QZ2bKG8PA9GvvRtpYZwNMB5hLV5w2\n2024-08-27T21:06:59.261-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmcm2Gtojp9u4EZtJZtowZy7Zrk8PGpu46TgnSp61bTury\n2024-08-27T21:06:59.261-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmcvhw3c8YfQyTp8CSegehjDuuNov77B6AZipk3GwB72bS\n2024-08-27T21:06:59.262-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmd2a3Jz3KWfxvYjCgNDv9GrzAwfzo4XSjR9Uv8GJtyqPj\n2024-08-27T21:06:59.262-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmd75W2Bh9tuqApGWgiYy45784YTwcp8SHVugiHzmFAGX5\n2024-08-27T21:06:59.263-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmdBJ6aHLntp8HGt8qnT1iPPQ1R2DoLjE8fHf3qyhvzoDp\n2024-08-27T21:06:59.263-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmeKCaLc9umWu4XkyRJzfp9YFV9oATDQzudk1gKAZ6mg2y\n2024-08-27T21:06:59.263-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmeLSB4ovmAfsPcCiWFYAsW6RLH5qKrTDsoy1hwi31ptBF\n2024-08-27T21:06:59.264-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmdUTGK11ZphYtBEzBLdkgEW8Jd4fghzNS5zs2R2uwQADs\n2024-08-27T21:06:59.264-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmdegBo7z93GBZ3C31icFbSxWQNHWvfpse2fzgrVrfUjDC\n2024-08-27T21:06:59.264-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmdg8NRkwAaNAZ31Emp76phzn4uTWGkoXcxAApNGMTPK2Q\n2024-08-27T21:06:59.265-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmdrpWFHdqaCEnBNNLUWWsWuDMUEn3gQeRTUbMTHwjcX5X\n2024-08-27T21:06:59.265-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmdv2LjNGpRZtYYCz877hHyktAT4gQ1PNLCMoo9eYPU872\n2024-08-27T21:06:59.265-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmdy6irWVHNJM7iYCnFNCHEyw6KRVSN6scAm6MmkamB925\n2024-08-27T21:06:59.266-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qme629iX97fFjy2kZRhUwtEYNgxi1MQpTRFxTZBZV4V7L8\n2024-08-27T21:06:59.266-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qme7i6umezt8JHeQS2hA9d75ADjC3XRNW5TvJ8Sb2PUmZR\n2024-08-27T21:06:59.266-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmeEWrnTfMo4G2TLt9wumoX8Dbz4i9652kt6xFfozgPhSt\n2024-08-27T21:06:59.267-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmfPJTM2G1byzHfNBhQFudCyc17XQe8jbYCZGZb3nwjkft\n2024-08-27T21:06:59.267-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmfTqFRcYTCDzHY1AZa9QzWFrNWVUGbBgPX8xN5FcirPEK\n2024-08-27T21:06:59.267-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmfYnuVnPvgcggWS9jheVgu7JYSJo2f1UFhsLoaBXrD2jA\n2024-08-27T21:06:59.268-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmeWrotyxw1EjrjZD2D69cwV1ucGW1Su3QxMN5SMnuFQPj\n2024-08-27T21:06:59.268-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmeWz8ECbecuFqqLofe2C77cprbvpffU7GEK3G1ymBLQky\n2024-08-27T21:06:59.268-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmebb6ZSAJEEGjdbRUMHRJpcGKqU31PEAxoMkLg5okywMS\n2024-08-27T21:06:59.269-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmejv4CP9jkX69CABgCrHiB6jMMRPTB3GVHDAu1KVVa6S3\n2024-08-27T21:06:59.269-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmeokKiNoBDHTCQXmLYrr3vJveEHK6XQNkWocW1d5BGWZG\n2024-08-27T21:06:59.269-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmeqHJCt2tq5KdMBQ6GPBNhYozLzz3AwnJxtUpXjgXjn7a\n2024-08-27T21:06:59.269-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for Qmf9cvu52V1kQRddP6oXZYPEsuhfJww9SLMuMjFLDPcMt5\n2024-08-27T21:06:59.270-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmfFHQ79WfnkVT9G1Knq2PSQ4ZFXZTLbmueSbc7Huw4uGd\n2024-08-27T21:06:59.270-0700\tINFO\tpintracker\tstateless/stateless.go:636\tRestarting pin operation for QmfGcoapsxp8Fu3z8QiDb6szhn7tjW8K4FT9PVC7QFBpYj\n"
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
  "test_ipfs_get_pinset": null,
  "test_ipfs_add_pin": {},
  "test_ipfs_remove_pin": {},
  "test_ipget_download_object": {
    "ipgetDownloadObject": {}
  },
  "test_ipfs_upload_object": {
    "ipfsUploadObject": {},
    "fileStat": {}
  },
  "test_load_collection": null,
  "test_ipfs_add_path": {
    "ipfsClusterCtlAddPath": {
      "/home/barberb/ipfs_kit_js/tests/test.js": "QmPNk6cEry89hRAaafuixRx1f6D1i1ac2ixccH1zA4PTCm:\n    > worker-1             : PIN_QUEUED | 2024-08-27T21:07:02.238722581-07:00 | Attempts: 0 | Priority: true\n"
    },
    "ipfsAddPath": {
      "stdout": "added QmPNk6cEry89hRAaafuixRx1f6D1i1ac2ixccH1zA4PTCm test.js\n",
      "stderr": "\r 28.22 KiB / ? \u001b[2K\r\r 28.22 KiB / ? ",
      "results": {
        "test.js": "QmPNk6cEry89hRAaafuixRx1f6D1i1ac2ixccH1zA4PTCm"
      }
    }
  },
  "test_ipfs_remove_path": {
    "ipfsClusterCtlRemovePath": [
      "Unpinned: /home/barberb/ipfs_kit_js/tests/test.js"
    ],
    "ipfsRemovePath": {
      "filesRm": {
        "stdout": "",
        "stderr": "",
        "results": ""
      },
      "pinRm": {
        "stdout": [
          "unpinned QmPNk6cEry89hRAaafuixRx1f6D1i1ac2ixccH1zA4PTCm"
        ],
        "stderr": "",
        "results": [
          "unpinned QmPNk6cEry89hRAaafuixRx1f6D1i1ac2ixccH1zA4PTCm"
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
        "stdout": "added bafkreiduu6w4t4qxck2q6jika4y4g3ak7wsizwyvtdhxzcaszm74h3k6ta test.js",
        "stderr": "\r 28.22 KiB / ? \u001b[2K\r\r 28.22 KiB / ? ",
        "results": {
          "test.js": "bafkreiduu6w4t4qxck2q6jika4y4g3ak7wsizwyvtdhxzcaszm74h3k6ta"
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
        "/ipfs/Qmc1zp5L56VMbfgfrQsGTRK9QmbzHWUtSMGaJ43jYPYRcZ/introduction/",
        ""
      ]
    }
  },
  "test_ipfs_get_config_value": {
    "ipfsGetConfigValue": {
      "stdout": "bar\n",
      "stderr": ""
    }
  },
  "test_ipfs_set_config_value": {
    "ipfsSetConfigValue": {
      "stdout": "",
      "stderr": ""
    }
  },
  "test_update_collection_ipfs": null
}
```
