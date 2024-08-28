import { execSync, exec } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import * as test_fio from './test_fio.js';
import util from 'util';
import process from 'process';
import { ChildProcess } from 'child_process';
import { spawnSync } from 'child_process';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import crypto from 'crypto';
import https from 'https';
import * as tar from 'tar';
import { time } from 'console';

// TODO: This fails if aria2c is not installed but doesn't fail gracefully and in a way that diagnoses the problem to the user 
//       Either add a check for aria2c and report to user or add aria2c to the install that is ran before hand

export class installIpfs {
    constructor(resources, meta = null) {
        this.resources = resources;
        this.meta = meta;
        this.thisDir = path.dirname(import.meta.url);
        if (this.thisDir.startsWith("file://")) {
            this.thisDir = this.thisDir.replace("file://", "");
        }
        this.path = process.env.PATH;
        this.path = this.path + ":" + path.join(this.thisDir, "bin")
        this.pathString = "PATH=" + this.path
        this.ipfsTestInstall = this.ipfsTestInstall.bind(this);
        this.ipfsDistTar = "https://dist.ipfs.tech/kubo/v0.29.0/kubo_v0.29.0_linux-amd64.tar.gz";
        this.libp2pRelayDistTar = "https://dist.ipfs.tech/libp2p-relay/v0.3.0/libp2p-relay_v0.3.0_linux-amd64.tar.gz";
        this.ipfsFollowDistTar = "https://dist.ipfs.tech/ipfs-cluster-follow/v1.1.1/ipfs-cluster-follow_v1.1.1_linux-amd64.tar.gz";
        this.ipfsClusterCtlDistTar = "https://dist.ipfs.tech/ipfs-cluster-ctl/v1.1.1/ipfs-cluster-ctl_v1.1.1_linux-amd64.tar.gz";
        this.ipfsClusterServiceDistTar = "https://dist.ipfs.tech/ipfs-cluster-service/v1.1.1/ipfs-cluster-service_v1.1.1_linux-amd64.tar.gz";
        this.ipfsIpgetDistTar = "https://dist.ipfs.tech/ipget/v0.10.0/ipget_v0.10.0_linux-amd64.tar.gz";
        // NOTE: implement libp2p relay install
        if (meta !== null) {
            this.config = meta.config ? meta.config : null;
            this.secret = meta.secret ? meta.secret : null;

            if (this.secret == null) {
                // generate 64 character hex string
                this.secret = crypto.randomBytes(32).toString('hex');
            }

            if (meta.role) {
                this.role = meta['role'];
                if (['master', 'worker', 'leecher'].includes(this.role) === false) {
                    console.error('role is not either master, worker, leecher');
                    this.role = 'leecher';
                }
            }
            if (meta.ipfsPath) {
                this.tmpDir = "/tmp";
                this.ipfsPath = meta.ipfsPath;
                if (!fs.existsSync(this.ipfsPath)) {
                    fs.mkdirSync(this.ipfsPath, { recursive: true });
                }
                let testDisk = new test_fio.TestFio();
                this.diskName = testDisk.diskDeviceNameFromLocation(this.ipfsPath);
                this.diskStats = {
                    diskSize: testDisk.diskDeviceTotalCapacity(this.diskName),
                    diskUsed: testDisk.diskDeviceUsedCapacity(this.diskName),
                    diskAvail: testDisk.diskDeviceAvailCapacity(this.diskName),
                    diskName: this.diskName
                };
            } else {
                if (Object.keys(this).includes('ipfsPath') === false) {
                    if (os.userInfo().uid === 0) {
                        this.ipfsPath = '/ipfs/';
                        this.tmpDir = "/tmp";
                    }
                    else{
                        this.ipfsPath = path.join(path.join(os.homedir(), '.cache'), 'ipfs');
                        this.tmpDir = "/tmp";
                    }
                }
                let testDisk = new test_fio.TestFio();
                this.diskName = testDisk.diskDeviceNameFromLocation(this.ipfsPath);
                this.diskStats = {
                    diskSize: testDisk.diskDeviceTotalCapacity(this.diskName),
                    diskUsed: testDisk.diskDeviceUsedCapacity(this.diskName),
                    diskAvail: testDisk.diskDeviceAvailCapacity(this.diskName),
                    diskName: this.diskName
                };
            }

            this.clusterName = meta.clusterName ? meta.clusterName : null;
            this.clusterLocation = meta.clusterLocation ? meta.clusterLocation : "/ip4/167.99.96.231/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv";

            if (['leecher', 'worker', 'master'].includes(this.role) && this.ipfsPath) {
                // Bind the methods for installing and configuring IPFS
                this.ipfsInstallCommand = this.installIpfsDaemon.bind(this);
                this.ipfsConfigCommand = this.configIpfs.bind(this);
            }

            if (this.role === "worker" && this.clusterName && this.ipfsPath) {
                // Bind methods for worker role
                this.clusterInstall = this.installIpfsClusterFollow.bind(this);
                this.clusterConfig = this.configIpfsClusterFollow.bind(this);
            }

            if (this.role === "master" && this.clusterName && this.ipfsPath) {
                // Bind methods for master role
                this.clusterCtlInstall = this.installIpfsClusterCtl.bind(this);
                this.clusterCtlConfig = this.configIpfsClusterCtl.bind(this);
                this.clusterService_install = this.installIpfsClusterService.bind(this);
                this.clusterServiceConfig = this.configIpfsClusterService.bind(this);
            }
        }
    }

    async installIpfsDaemon(options = {}) {
        let detect = '';
        try {
            detect = execSync(this.pathString + " which ipfs").toString().trim();
            if (detect.length > 0) {
                return true;
            }
        } catch (e) {
            // console.error(e.message);
            detect = '';
        }
        let thisDir = this.thisDir || decodeURI(path.dirname(new URL(import.meta.url).pathname));

        if (!detect) {
            try {
                const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ipfs-'));
                const tarFile = path.join(tmpDir, "kubo.tar.gz");
                execSync(`wget ${this.ipfsDistTar} -O ${tarFile}`);
                execSync(`tar -xvzf ${tarFile} -C ${tmpDir}`);
                if (os.userInfo().username == "root") {
                    execSync(`cd ${tmpDir}/kubo && bash install.sh`);
                    const serviceConfig = fs.readFileSync(path.join(thisDir, 'ipfs.service')).toString();
                    fs.writeFileSync("/etc/systemd/system/ipfs.service", serviceConfig);
                    execSync("systemctl enable ipfs");
                } else {
                    // TODO: Add non root user install ( move to thisDir/bin/ipfs and add path)
                    console.log('Please run as root user to enable systemd service');
                    // Maybe need to change command if bin/ipfs exists it causes error for half baked installs etc. 
                    execSync(`cd ${tmpDir}/kubo && mkdir -p "${thisDir}/bin/" && mv ipfs "${thisDir}/bin/" && chmod +x "${thisDir}/bin/ipfs"`);
                }
                const results = execSync("ipfs --version").toString().trim();
                return results.includes("ipfs");
            } catch (e) {
                console.error(e);
                return false;
            }
        }
    }

    async installIpfsClusterFollow(options = {}) {
        // Check if ipfs-cluster-follow is already installed
        let followCmdExists = execSync('which ipfs-cluster-follow')
        if (followCmdExists.length > 0) {
            console.log('ipfs-cluster-follow is already installed.');
            return true;
        } else {
            console.log('ipfs-cluster-follow is not installed, proceeding with installation.');
            // Downloading tarball
            const url = this.ipfsFollowDistTar;
            const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ipfs-cluster-follow-'));
            const tarPath = path.join(tmpDir, url.split('/')[-1]);
            let thisDir = this.thisDir || decodeURI(path.dirname(new URL(import.meta.url).pathname));

            const file = fs.createWriteStream(tarPath);
            new Promise((resolve, reject) => {
                https.get(url, function (response) {
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        console.log('Download completed.');
                        // Extracting tarball
                        tar.x({
                            file: tarPath,
                            C: tmpDir,
                        }).then(() => {
                            console.log('Extraction completed.');
                            const binPath = path.join(tmpDir, 'ipfs-cluster-follow', 'ipfs-cluster-follow');
                            try {
                                if (os.userInfo().username == "root") {
                                    execSync(`sudo mv ${binPath} /usr/local/bin/ipfs-cluster-follow`);
                                    let serviceConfig = fs.readFileSync(path.join(thisDir, 'ipfs_clusterFollow.service')).toString();
                                    fs.writeFileSync('/etc/systemd/system/ipfs-cluster-follow.service', serviceConfig);
                                    execSync('systemctl enable ipfs-cluster-follow');
                                    console.log('ipfs-cluster-follow service enabled.');
                                }
                                else {
                                    // FIXME: Add non root user install ( move to thisDir/bin/ipfs-cluster-follow and add path)
                                    console.log('Please run as root user to enable systemd service');
                                }
                                // Verify installation
                                const version = execSync('ipfs-cluster-follow --version').toString().trim();
                                console.log(`Installed ipfs-cluster-follow version: ${version}`);

                            } catch (e) {
                                console.error('Error verifying ipfs-cluster-follow installation:', e);
                                return false;
                            }
                        }).catch((err) => {
                            console.error('Error extracting file:', err);
                        });
                    });
                }).on('error', (err) => {
                    // Handle errors
                    console.error('Error downloading file:', err);
                    fs.unlink(dest);
                });
                reject(err)
            });
        }
        return results
    }

    async installIpfsClusterCtl(options = {}) {

        try {
            const detect = execSync(this.pathString + ` which ipfs-cluster-ctl`).toString().trim();
            if (detect) {
                console.log('ipfs-cluster-ctl is already installed.');
                return true;
            }
        } catch (e) {
            console.error(e.message);
        }

        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ipfs-cluster-ctl-'));
        const tarPath = path.join(tmpDir, 'ipfs-cluster-ctl.tar.gz');
        const url = this.ipfsClusterCtlDistTar;
        // Download and extract the tarball
        const file = fs.createWriteStream(tarPath);
        return new Promise((resolve, reject) => {
            https.get(url, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log('Download completed.');
                    tar.x({
                        file: tarPath,
                        C: tmpDir,
                    }).then(() => {
                        console.log('Extraction completed.');
                        const binPath = path.join(tmpDir, 'ipfs-cluster-ctl', 'ipfs-cluster-ctl');
                        if (os.userInfo().username == "root") {
                            execSync(`sudo mv ${binPath} /usr/local/bin/ipfs-cluster-ctl`);
                        } else {
                            execSync(`mv "${binPath}" "${this.thisDir}/bin/ipfs-cluster-ctl"`);
                        }
                        try {
                            // Verify installation
                            const version = execSync(`ipfs-cluster-ctl --version`).toString().trim();
                            console.log(`Installed ipfs-cluster-ctl version: ${version}`);
                            resolve(true); // Resolve the promise here
                        } catch (e) {
                            console.error('Error verifying ipfs-cluster-ctl installation:', e);
                            reject(e); // Reject the promise if there's an error
                        }
                    }).catch((err) => {
                        console.error('Error extracting file:', err);
                        reject(err); // Reject the promise if there's an error
                    });
                });
            }).on('error', (err) => {
                console.error('Error downloading file:', err);
                fs.unlink(tarPath, () => { // Unlink regardless of whether there's an error
                    reject(err); // Reject the promise if there's an error
                });
            });
        });
    }

    async installIpfsClusterService(options = {}) {
        try {
            const detect = execSync( this.pathString + ` which ipfs-cluster-service`).toString().trim();
            if (detect) {
                console.log('ipfs-cluster-service is already installed.');
                return true;
            }
        } catch (e) {
            console.error(e.message);
        }

        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ipfs-cluster-service-'));
        const tarPath = path.join(tmpDir, 'ipfs-cluster-service.tar.gz');
        const url = this.ipfsClusterServiceDistTar;
        // const url = "https://dist.ipfs.tech/ipfs-cluster-service/v1.0.8/ipfs-cluster-service_v1.0.8_linux-amd64.tar.gz";
        let thisDir = this.thisDir || decodeURI(path.dirname(new URL(import.meta.url).pathname));

        // Download and extract the tarball
        const file = fs.createWriteStream(tarPath);
        return new Promise((resolve, reject) => {
            https.get(url, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log('Download completed.');
                    tar.x({
                        file: tarPath,
                        C: tmpDir,
                    }).then(() => {
                        console.log('Extraction completed.');
                        const binPath = path.join(tmpDir, 'ipfs-cluster-service', 'ipfs-cluster-service');
                        try {
                            // Verify installation
                            if (os.userInfo().username == "root") {
                                execSync(`sudo mv ${binPath} /usr/local/bin/ipfs-cluster-service`);
                                let serviceConfig = fs.readFileSync(path.join(thisDir, 'ipfs_clusterFollow.service')).toString();
                                fs.writeFileSync('/etc/systemd/system/ipfs-cluster-follow.service', serviceConfig);
                                execSync('systemctl enable ipfs-cluster-service');
                                console.log('ipfs-cluster-service service enabled.');
                                execSync('systemctl daemon-reload');
                                console.log('systemctl daemon reloaded.');
                            }
                            else {
                                console.log('Please run as root user to enable systemd service');
                                execSync(`mv "${binPath}" "${this.thisDir}/bin/ipfs-cluster-service"`);
                            }
                            const version = execSync( this.pathString + ` ipfs-cluster-service --version`).toString().trim();
                            console.log(`Installed ipfs-cluster-service version: ${version}`);
                            resolve(true); // Resolve the promise here
                        } catch (e) {
                            console.error('Error verifying ipfs-cluster-service installation:', e);
                            reject(e); // Reject the promise if there's an error
                        }
                    }).catch((err) => {
                        console.error('Error extracting file:', err);
                        reject(err); // Reject the promise if there's an error
                    });
                });
            }).on('error', (err) => {
                console.error('Error downloading file:', err);
                fs.unlink(tarPath, (err) => {
                    if (err) console.error(`Error removing temporary tarball: ${err}`);
                });
                reject(err); // Reject the promise if there's an error
            });
        });
    }

    // async installIPGet(options = {}) {
    //     try {
    //         // Check if ipget is already installed
    //         const detect = execSync(`"${this.pathString}" which ipget`).toString().trim();
    //         if (detect) {
    //             //console.log('ipget is already installed.');
    //             return true;
    //         }
    //     } catch (e) {
    //         // console.error(e.message);
    //     }

    //     // Prepare for download and extraction
    //     const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ipget-'));
    //     const tarPath = path.join(tmpDir, 'ipget.tar.gz');
    //     // const url = "https://dist.ipfs.tech/ipget/v0.10.0/ipget_v0.10.0_linux-amd64.tar.gz";
    //     const url = this.ipfsIpgetDistTar;
    //     // Download the tarball
    //     return new Promise((resolve, reject) => {
    //         https.get(url, (response) => {
    //             const fileStream = fs.createWriteStream(tarPath);
    //             response.pipe(fileStream);
    //             fileStream.on('finish', () => {
    //                 fileStream.close();
    //                 console.log('Downloaded ipget tarball.');
    //                 // Extract the tarball
    //                 tar.x({
    //                     file: tarPath,
    //                     C: tmpDir,
    //                 }).then(() => {
    //                     console.log('Extracted ipget.');
    //                     // Move to bin and install
    //                     if (os.userInfo().username == "root") {
    //                         const binPath = path.join(tmpDir, 'ipget', 'ipget');
    //                         execSync(`sudo mv ${binPath} /usr/local/bin/ipget`);
    //                         const installScriptPath = path.join(tmpDir, 'ipget', 'install.sh');
    //                         execSync(`cd ${tmpDir}/ipget && sudo bash install.sh`);
    //                         // Update system settings
    //                         execSync('sudo sysctl -w net.core.rmem_max=2500000');
    //                         execSync('sudo sysctl -w net.core.wmem_max=2500000');
    //                     }
    //                     else {
    //                         console.log('Please run as root user to install ipget globally');
    //                         //FIXME: Remove install move to bin and add to path 
    //                         // let tmpCommand = `cd ${tmpDir}/ipget && bash install.sh`;
    //                         // let tmpCommand2 = `mkdir -p "`+ this.thisDir  + `/bin" && cd ${tmpDir}/ipget && mv ipget "`+ this.thisDir  + `/bin/ipget" && chmod +x "`+ this.thisDir  + `/bin/ipget"`;
    //                         execSync(`cd ${tmpDir}/ipget && mv ipget "${this.thisDir}/bin/" && chmod +x "${this.thisDir}/bin/ipget"`)

    //                         // execSync(tmpCommand);
    //                         // execSync(tmpCommand2);
    //                         // execSync(`cd ${tmpDir}/ipget && bash install.sh`);      
    //                     }
    //                     // Verify installation
    //                     try {
    //                         const version = execSync(this.pathString + ` ipget --version`).toString().trim();
    //                         console.log(`Installed ipget version: ${version}`);
    //                         resolve(true); // Resolve the promise here
    //                     } catch (verificationError) {
    //                         console.error('Error verifying ipget installation:', verificationError);
    //                         reject(verificationError); // Reject the promise if there's an error
    //                     }
    //                 }).catch((extractionError) => {
    //                     console.error('Error extracting ipget:', extractionError);
    //                     reject(extractionError); // Reject the promise if there's an error
    //                 });
    //             });
    //         }).on('error', (downloadError) => {
    //             console.error('Error downloading ipget:', downloadError);
    //             reject(downloadError); // Reject the promise if there's an error
    //         });
    //     });
    // }

    async configIpfsClusterService(kwargs) {
        let clusterName = kwargs.clusterName || this.clusterName;
        let secret = kwargs.secret || this.secret;
        let diskStats = kwargs.diskStats || this.diskStats;
        let ipfsPath = kwargs.ipfsPath || this.ipfsPath;

        if (!diskStats) throw new Error("diskStats is None");
        if (!ipfsPath) throw new Error("ipfsPath is None");
        if (!clusterName) throw new Error("clusterName is None");
        if (!secret) throw new Error("secret is None");

        let thisDir = this.thisDir;
        let servicePath = "";
        let clusterPath = path.join(ipfsPath, clusterName);
        let results = {};

        try {
            if (os.userInfo().username === "root") {
                servicePath = path.join("/root", ".ipfs-cluster");
            } else {
                servicePath = path.join(ipfsPath);
            }
            if (!fs.existsSync(servicePath)) {
                fs.mkdirSync(servicePath, { recursive: true });
            }
            if (clusterName && ipfsPath && diskStats) {
                if (os.userInfo().username === "root") {
                    let enableClusterService = "systemctl enable ipfs-cluster";
                    let enableClusterServiceResults = execSync(enableClusterService).toString();
                    let ipfs_cluster_service = fs.readFileSync(path.join(thisDir, "service.json"), "utf8");
                    fs.writeFileSync(path.join(servicePath, "service.json"), ipfs_cluster_service);
                    let initClusterService = `${this.pathString} IPFS_PATH=${ipfsPath}  IPFS_CLUSTER_PATH=${ipfsPath}  ipfs-cluster-service init -f`;
                    let initClusterServiceResults = execSync(initClusterService).toString();
                    results["initClusterServiceResults"] = initClusterServiceResults;
                } else {
                    let initClusterService = `${this.pathString} IPFS_PATH=${ipfsPath}  IPFS_CLUSTER_PATH=${ipfsPath}  ipfs-cluster-service init -f`;
                    let initClusterServiceResults = execSync(initClusterService).toString();
                    results["initClusterServiceResults"] = initClusterServiceResults;
                }
            }
        } catch (e) {
            console.error(e);
            results["initClusterServiceResults"] = e.toString();
        }

        if (this.role === "worker" || this.role === "master") {
            try {
                let serviceConfig = fs.readFileSync(path.join(thisDir, "service.json"), "utf8");
                let workerID = crypto.randomBytes(32);
                workerID = "worker-" + workerID.toString('hex');
                serviceConfig = serviceConfig.replace('"clusterName": "ipfs-cluster"', `"clusterName": "${clusterName}"`);
                serviceConfig = serviceConfig.replace('"secret": "96d5952479d0a2f9fbf55076e5ee04802f15ae5452b5faafc98e2bd48cf564d3"', `"secret": "${secret}"`);
                fs.writeFileSync(path.join(servicePath, "service.json"), serviceConfig);
                let peerlist = fs.readFileSync(path.join(thisDir, "peerstore"), "utf8");
                fs.writeFileSync(path.join(servicePath, "peerstore"), peerlist);
                let pebbleLink = path.join(servicePath, "pebble");
                let pebbleDir = path.join(clusterPath, "pebble");
                if (clusterPath !== servicePath) {
                    if (fs.existsSync(pebbleLink)) {
                        execSync(`rm -rf ${pebbleLink}`);
                    }
                    // else if (fs.lstatSync(pebbleLink).isSymbolicLink()){
                    //     execSync(`rm -rf  ${pebbleLink}`);
                    // }
                }
                if (os.userInfo().username === "root") {
                    let serviceFile = fs.readFileSync(path.join(thisDir, "ipfs-cluster.service"), "utf8");
                    serviceFile = serviceFile.replace("ExecStart=/usr/local/bin/", `ExecStart= bash -c "export IPFS_PATH=${this.ipfsPath} && export PATH=${this.path} && ipfs-cluster-service daemon "`);
                    fs.writeFileSync("/etc/systemd/system/ipfs-cluster.service", serviceFile);
                    execSync("systemctl enable ipfs-cluster");
                    execSync("systemctl daemon-reload");
                }
            } catch (e) {
                throw new Error(e.toString());
            }
        }

        try {
            let runDaemonResults = "";
            if (os.userInfo().username === "root") {
                execSync("systemctl daemon-reload");
                execSync("systemctl enable ipfs-cluster");
                execSync("systemctl start ipfs-cluster");
                setTimeout(() => {
                    runDaemonResults = execSync("systemctl status ipfs-cluster").toString();
                    results["runDaemon"] = runDaemonResults;
                }, 2000);
            } else {
                let runDaemonCmd = `${this.pathString} IPFS_PATH=${this.ipfsPath} IPFS_CLUSTER_PATH=${this.ipfsPath} ipfs-cluster-service -d daemon`;
                let daemonProcess = exec(runDaemonCmd, (error, stdout, stderr=null) => { 
                    if (error) {
                        // console.error(`exec error: ${error}`);
                        results["runDaemon"] = error.toString();
                    }
                    if (stdout) {
                        results["runDaemon"] = stdout;
                    }
                    if (stderr) {
                        results["runDaemon"] = stderr;
                        // console.error(`stderr: ${stderr}`);
                    }
                });
                
                let findDaemonCommandResults = execSync("sleep 1; ps -ef | grep ipfs-cluster-service | grep -v grep | wc -l").toString().trim();
                results["runDaemon"] = findDaemonCommandResults;
                if (parseInt(findDaemonCommandResults) <= 0) {
                    console.error("ipfs-cluster-service daemon did not start");
                    throw new Error("ipfs-cluster-service daemon did not start");
                }
            }
        } catch (e) {
            console.error(e);
        }

        return results;
    }

    async configIpfsClusterCtl(kwargs) {
        let results = {};

        let clusterName = kwargs.clusterName || this.clusterName;
        let secret = kwargs.secret || this.secret;
        let diskStats = kwargs.diskStats || this.diskStats;
        let ipfsPath = kwargs.ipfsPath || this.ipfsPath;

        if (!diskStats) throw new Error("diskStats is None");
        if (!ipfsPath) throw new Error("ipfsPath is None");
        if (!clusterName) throw new Error("clusterName is None");
        if (!secret) throw new Error("secret is None");

        let runClusterCtl = null;

        try {
            let runClusterCtlCmd = this.pathString + ` ipfs-cluster-ctl --version`;
            exec(runClusterCtlCmd, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    results["runClusterCtl"] = error.toString();
                    return false;
                }
                runClusterCtl = stdout;
                results["runClusterCtl"] = runClusterCtl;
                // Assuming there's a mechanism to handle async results
                this.handleResults(results);
            });
        } catch (e) {
            console.error(e);
            return false;
        }

        // Placeholder for async handling, actual implementation depends on the use case
        return "Operation started, results will be handled asynchronously.";
    }

    // Placeholder for results handling method
    handleResults(results) {
        console.log(results);
    }

    async configIpfsClusterFollow(kwargs = {}) {
        let results = {};
        let clusterName = kwargs.clusterName || this.clusterName;
        let diskStats = kwargs.diskStats || this.diskStats;
        let ipfsPath = kwargs.ipfsPath || this.ipfsPath;
        let secret = kwargs.secret || this.secret;
        let thisDir = this.thisDir;
        let homeDir = os.homedir();
        let clusterPath = path.join(path.dirname(ipfsPath), 'ipfs-cluster', clusterName);
        let followPath = path.join(ipfsPath, "ipfs_cluster") + "/";
        let runDaemon = null;
        let followInitcmdResults = null;
        let worker_id = "worker-" + crypto.randomBytes(32).toString('hex');

        if (!diskStats) throw new Error("diskStats is None");
        if (!ipfsPath) throw new Error("ipfsPath is None");
        if (!clusterName) throw new Error("clusterName is None");
        if (!secret) throw new Error("secret is None");

        followPath = os.userInfo().username === "root" ? path.join("/root", ".ipfs-cluster-follow", clusterName) + "/" : path.join(os.homedir(), ".ipfs-cluster-follow", clusterName);

        if (clusterName && ipfsPath && diskStats) {
            try {
                let rmCommand = "rm -rf " + followPath;
                let rmResults = execSync(rmCommand).toString();
                let followInitcmd = this.pathString + " ipfs-cluster-follow " + clusterName + " init " + ipfsPath;
                followInitcmdResults = execSync(followInitcmd).toString();

                if (!fs.existsSync(clusterPath)) fs.mkdirSync(clusterPath, { recursive: true });
                if (!fs.existsSync(followPath)) fs.mkdirSync(followPath, { recursive: true });

                let serviceConfig = fs.readFileSync(path.join(thisDir, "service_follower.json"), "utf8");
                serviceConfig = serviceConfig.replace('"clusterName": "ipfs-cluster"', '"clusterName": "' + clusterName + '"');
                serviceConfig = serviceConfig.replace('"peername": "worker"', '"peername": "' + worker_id + '"');
                serviceConfig = serviceConfig.replace('"secret": "96d5952479d0a2f9fbf55076e5ee04802f15ae5452b5faafc98e2bd48cf564d3"', '"secret": "' + secret + '"');
                fs.writeFileSync(path.join(followPath, "service.json"), serviceConfig);

                let peer_store = fs.readFileSync(path.join(thisDir, "peerstore"), "utf8");
                fs.writeFileSync(path.join(followPath, "peerstore"), peer_store);

                let pebbleLink = path.join(followPath, "pebble");
                let pebbleDir = path.join(clusterPath, "pebble");
                if (clusterPath !== followPath) {
                    if (fs.existsSync(pebbleLink)) {
                        execSync("rm -rf " + pebbleLink);
                    }
                    if (!fs.existsSync(pebbleDir)) {
                        fs.mkdirSync(pebbleDir, { recursive: true });
                    }
                    execSync("ln -s " + pebbleDir + " " + pebbleLink);
                }

                if (clusterNameuid() === 0) {
                    let serviceFile = fs.readFileSync(path.join(thisDir, "ipfs-cluster-follow.service"), "utf8");
                    let newService = serviceFile.replace("ExecStart=", 'ExecStart= bash -c "export IPFS_PATH=' + ipfsPath + ' && export PATH=' + this.path + " && /usr/local/bin/ipfs-cluster-follow " + clusterName + ' run "');
                    newService = newService.replace("Description=IPFS Cluster Follow", "Description=IPFS Cluster Follow " + clusterName);
                    fs.writeFileSync("/etc/systemd/system/ipfs-cluster-follow.service", newService);
                    execSync("systemctl enable ipfs-cluster-follow");
                    execSync("systemctl daemon-reload");
                }
            } catch (e) {
                console.error(e);
                throw e;
            }
        }

        try {
            let findDaemon = "ps -ef | grep ipfs-cluster-follow | grep -v grep | wc -l";
            let findDaemonResults = execSync(findDaemon).toString().trim();
            if (parseInt(findDaemonResults) > 0) {
                this.killProcessByPattern("ipfs-cluster-follow");
            }

            if (clusterNameuid() === 0) {
                execSync("systemctl daemon-reload");
                execSync("systemctl enable ipfs-cluster-follow");
                execSync("systemctl start ipfs-cluster-follow");
                setTimeout(() => {
                    let runDaemonResults = execSync("systemctl status ipfs-cluster-follow").toString();
                    findDaemonResults = execSync(findDaemon).toString().trim();
                    if (parseInt(findDaemonResults) === 0) {
                        console.error("ipfs-cluster-follow daemon did not start");
                        throw new Error("ipfs-cluster-follow daemon did not start");
                    }
                    if (parseInt(findDaemonResults) > 0) {
                        this.killProcessByPattern("ipfs-cluster-follow");
                    }
                }, 2000);
            } else {
                let rundaemonCmd = "ipfs-cluster-follow " + clusterName + " run";
                let runDaemonProcess = exec(rundaemonCmd);
                if (runDaemonProcess !== null) {
                    results["runDaemon"] = true;
                }
                setTimeout(() => {
                    findDaemonResults = execSync(findDaemon).toString().trim();
                    if (parseInt(findDaemonResults) === 0) {
                        console.error("ipfs-cluster-follow daemon did not start");
                        throw new Error("ipfs-cluster-follow daemon did not start");
                    } else if (parseInt(findDaemonResults) > 0) {
                        this.killProcessByPattern("ipfs-cluster-follow");
                    }
                }, 2000);
            }
        } catch (e) {
            console.error(e);
        }

        results["runDaemon"] = parseInt(execSync(findDaemon).toString().trim()) > 0;
        results["followInitcmdResults"] = followInitcmdResults;
        return results;
    }

    async killProcessByPattern(pattern) {
        let cmd = `pkill -f ${pattern}`;
        try {
            execSync(cmd);
        } catch (e) {
            console.error(`Failed to kill process with pattern ${pattern}: ${e}`);
        }
    }

    async configIpfs(kwargs) {
        let results = {};
        this.clusterName = kwargs.clusterName || this.clusterName;
        this.diskStats = kwargs.diskStats || this.diskStats;
        this.ipfsPath = kwargs.ipfsPath || this.ipfsPath;
        this.secret = kwargs.secret || this.secret;

        if (!this.diskStats) throw new Error("diskStats is None");
        if (!this.ipfsPath) throw new Error("ipfsPath is None");
        if (!this.clusterName) throw new Error("clusterName is None");
        if (!this.secret) throw new Error("secret is None");

        let homeDir = os.homedir();
        let identity = null;
        let config = null;
        let peerId = null;
        let runDaemon = null;
        let public_key = null;
        let ipfsDaemon = null;
        let ipfsDirContents = []
        if (fs.existsSync(this.ipfsPath)) {
            let ipfsDirContents = fs.readdirSync(this.ipfsPath);
        }   
        if (ipfsDirContents.length > 0) {
            console.log("ipfs directory is not empty");
            for (let delFile of ipfsDirContents) {
                let delFilePath = path.join(this.ipfsPath, delFile);
                if (fs.lstatSync(delFilePath).isFile()) {
                    fs.unlinkSync(delFilePath);
                } else if (fs.lstatSync(delFilePath).isDirectory()) {
                    fs.rmdirSync(delFilePath, { recursive: true });
                } else {
                    console.log("unknown file type " + delFile + " in ipfs directory");
                }
            }

            results = {
                "config": null,
                "identity": null,
                "public_key": null
            };
        }

        if (this.diskStats && this.ipfsPath) {
            try {
                let peerId = null;
                let diskAvailable = null;

                let minFreeSpace = 32 * 1024 * 1024 * 1024;
                let allocate = null;
                diskAvailable = this.diskStats['diskAvail'];

                // Note: The following commands are synchronous and may block the event loop
                // Consider using child_process.exec or child_process.spawn for async execution
                let ipfsInitResults 
                if (!fs.existsSync(path.join(this.ipfsPath, "config"))) { 
                    let ipfsInitCommand = `IPFS_PATH=${this.ipfsPath} `+ this.pathString + ` ipfs init --profile=badgerds`;
                    ipfsInitResults = execSync(ipfsInitCommand).toString().trim();
                }
                let peerIdcommand = `IPFS_PATH=${this.ipfsPath} ` + this.pathString + ` ipfs id`;
                let peerIdResults = execSync(peerIdcommand).toString();
                peerId = JSON.parse(peerIdResults);

                let ipfsProfileApply = `IPFS_PATH=${this.ipfsPath} ` +  this.pathString+ ` ipfs config profile apply badgerds`;
                let ipfsProfileApplyResults = execSync(ipfsProfileApply).toString();
                let ipfsProfileApplyJson = JSON.parse(ipfsProfileApplyResults);

                if (diskAvailable > minFreeSpace) {
                    allocate = Math.ceil(((diskAvailable - minFreeSpace) * 0.8) / 1024 / 1024 / 1024);
                    let datastoreCommand = `IPFS_PATH=${this.ipfsPath} ` + this.pathString + ` ipfs config Datastore.StorageMax ${allocate}GB`;
                    let datastoreCommandResults = execSync(datastoreCommand).toString();
                }

                let peerListPath = path.join(this.thisDir, "peerstore");
                if (fs.existsSync(peerListPath)) {
                    let peerlist = fs.readFileSync(peerListPath, "utf8").split("\n");
                    for (let peer of peerlist) {
                        if (peer) {
                            let bootstrapAddCommand = `IPFS_PATH=${this.ipfsPath}  ` + this.pathString + ` ipfs bootstrap add ${peer}`;
                            let bootstrapAddCommandResults = execSync(bootstrapAddCommand).toString();
                        }
                    }
                }
                if (process.getuid() === 0) {
                    let ipfsService = fs.readFileSync(path.join(this.thisDir, "ipfs.service"), "utf8");
                    let ipfsServiceText = ipfsService.replace("ExecStart=", `ExecStart= bash -c "export IPFS_PATH=${this.ipfsPath} && export PATH=${this.path_string} && ipfs daemon --enable-gc --enable-pubsub-experiment "`);
                    fs.writeFileSync("/etc/systemd/system/ipfs.service", ipfsServiceText);
                }

                let configGetCmd = this.pathString + ` IPFS_PATH=${this.ipfsPath} ipfs config show`;
                let configData = execSync(configGetCmd).toString();
                configData = JSON.parse(configData);
                results["config"] = configData;
                results["identity"] = peerId["ID"];
                results["public_key"] = peerId["PublicKey"];
                results["agent_version"] = peerId["AgentVersion"];
                results["addresses"] = peerId["Addresses"];
            } catch (e) {
                console.log("error configuring IPFS in config_ipfs()");
                console.error(e);
            }
        }

        // Note: The following code assumes the script is running with root privileges
        // This may not be the case in all environments

        if (process.getuid() === 0) {
            try {
                let enableDaemonCmd = "systemctl enable ipfs";
                let enabledaemonResults = execSync(enableDaemonCmd).toString();

                let reloadDaemonCmd = "systemctl daemon-reload";
                let reloadDaemonResults = execSync(reloadDaemonCmd).toString();

                let findDaemonCmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | wc -l";
                let findDaemonResults = execSync(findDaemonCmd).toString().trim();
                let stopDaemonCmd = "systemctl stop ipfs";

                if (parseInt(findDaemonResults) > 0) {
                    let stop_daemon_results = execSync(stopDaemonCmd).toString();
                }

                let startDaemonCmd = "systemctl start ipfs";
                let startDaemonResults = execSync(startDaemonCmd).toString();
                setTimeout(() => {
                    findDaemonResults = execSync(findDaemonCmd).toString().trim();

                    if (parseInt(findDaemonResults) > 0) {
                        let testDaemon = `bash -c "export IPFS_PATH=${this.ipfsPath} && export PATH=${this.path_string} && ipfs cat /ipfs/QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq > /tmp/test.jpg"`;
                        let testDaemonResults = execSync(testDaemon).toString();
                        setTimeout(() => {
                            if (fs.existsSync("/tmp/test.jpg")) {
                                if (fs.statSync("/tmp/test.jpg").size > 0) {
                                    fs.unlinkSync("/tmp/test.jpg");
                                    testDaemonResults = true;
                                } else {
                                    throw new Error("ipfs failed to download test file");
                                }
                            }

                            let stopDaemonCmdResults = execSync(stopDaemonCmd).toString();
                            findDaemonResults = execSync(findDaemonCmd).toString().trim();
                        }, 5000);
                    } else {
                        throw new Error("ipfs daemon did not start");
                    }
                }, 2000);
            } catch (e) {
                console.log("error starting ipfs daemon");
                console.error(e);
            } finally {
                if (parseInt(findDaemonResults) > 0) {
                    let stopDaemonCmd = "systemctl stop ipfs";
                    let stopDaemonResults = execSync(stopDaemonCmd).toString();
                }
            }
        } else {
            let findDaemonCmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | wc -l";
            let findDaemonResults = execSync(findDaemonCmd).toString().trim();
            if (parseInt(findDaemonResults) > 0) {
                let psCmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | awk '{print $2}'";
                let psResults = execSync(psCmd).toString().split("\n");
                let userPsCmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | awk '{print $1}'";
                let userPsResults = execSync(userPsCmd).toString().split("\n");
                for (let pid of psResults) {
                    if (pid != "" && userPsResults[psResults.indexOf(pid)] == os.userInfo().username) {
                        let kill_daemon_cmd = `kill -9 ${pid}`;
                        let kill_daemon_results = execSync(kill_daemon_cmd).toString();
                    }
                }
                findDaemonResults = execSync(findDaemonCmd).toString();
            }
            let rundaemonCmd = `IPFS_PATH=${this.ipfsPath} ` + this.pathString + ` ipfs daemon --enable-pubsub-experiment`;
            let runDaemon = exec(rundaemonCmd, { shell: true });
            // wait 2000 ms for the daemon to start
            await new Promise(resolve => setTimeout(resolve, 2000));
            let runDaemonResults = runDaemon.stderr.read();
            let testDaemonResults = null;
            setTimeout(() => {
                findDaemonResults = execSync(findDaemonCmd).toString().trim();
                try {
                    if (fs.existsSync("/tmp/test.jpg")) {
                        fs.unlinkSync("/tmp/test.jpg");
                    }
                    let testDaemon = `bash -c "IPFS_PATH=${this.ipfsPath} ` + this.pathString + ` ipfs cat /ipfs/QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq > /tmp/test.jpg"`;
                    testDaemonResults = execSync(testDaemon).toString();
                    setTimeout(() => {
                        if (fs.existsSync("/tmp/test.jpg")) {
                            if (fs.statSync("/tmp/test.jpg").size > 0) {
                                testDaemonResults = true;
                                fs.unlinkSync("/tmp/test.jpg");
                            } else {
                                throw new Error("ipfs failed to download test file");
                            }
                        } else {
                            throw new Error("ipfs failed to download test file");
                        }
                    }, 5000);
                } catch (e) {
                    console.log("error starting ipfs daemon");
                    console.error(e);
                }
            }, 5000);
            let private_key = null;
            if (results["identity"] && results["identity"].length === 52) {
                identity = results["identity"];
                config = results["config"];
                if (config["Identity"]["PrivKey"]) {
                    private_key = config["Identity"]["PrivKey"];
                }
                ipfsDaemon = testDaemonResults;
            }
        }

        // this.killProcessByPattern("ipfs");
        results = {
            "config": config,
            "identity": identity,
            "public_key": null,
            "ipfs_daemon": ipfsDaemon
        };

        return results;
    }

    killProcessByPattern(pattern) {
        let killCmd = `pkill -f ${pattern}`;
        execSync(killCmd);
    }


    async runIpfsClusterService(options = {}) {
        let ipfsPath = options.ipfsPath || this.ipfsPath;
        // ipfsPath = path.join(ipfsPath, "ipfs");
        fs.mkdirSync(ipfsPath, { recursive: true });

        const runIpfsClusterServiceCommand = this.pathString + ` IPFS_PATH=${ipfsPath} IPFS_CLUSTER_PATH=${ipfsPath} ipfs-cluster-service -d -l debug daemon`;
        const runIpfsClusterServiceCommandResults = exec(runIpfsClusterServiceCommand);

        runIpfsClusterServiceCommandResults.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        runIpfsClusterServiceCommandResults.stderr.on('data', (data) => {
            // console.error(`stderr: ${data}`);
        });

        runIpfsClusterServiceCommandResults.on('close', (code) => {
            console.log(`ipfs-cluster-service process exited with code ${code}`);
        });

        return runIpfsClusterServiceCommandResults;
    }

    async runIpfsClusterCtl(options = {}) {
        let ipfsPath = options.ipfsPath || this.ipfsPath;
        ipfsPath = path.join(ipfsPath, "ipfs");
        fs.mkdirSync(ipfsPath, { recursive: true });

        const command = this.pathString + ` IPFS_CLUSTER_PATH=${ipfsPath} ipfs-cluster-ctl`;
        const process = exec(command);

        process.stdout.on('data', (data) => {
            // console.log(`stdout: ${data}`);
        });

        process.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        process.on('close', (code) => {
            console.log(`ipfs-cluster-ctl process exited with code ${code}`);
        });

        return process;
    }


    async ensureDirSync(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    async runIpfsClusterFollow(options = {}) {
        this.ensureDirSync(this.ipfsPath);
        const command = "ipfs-cluster-follow";
        let clusterName = options.clusterName || this.clusterName;
        const args = ["init", clusterName]; // Example, adjust as needed
        const env = { ipfsPath: this.ipfsPath };
        const exportCommand = Object.entries(env).map(([key, value]) => `export ${key}=${value}`).join(" && ");
        const processCommand = exportCommand + command + " " + args.join(" ");
        try {
            const { stdout, stderr } = await exec(processCommand);
            console.log(stdout);
            console.error(stderr);
            return true;
        } catch (error) {
            console.error(error);
        }
    }

    async runIpfsDaemon(options = {}) {
        const ipfsPath = path.join(this.ipfsPath);
        const psDaemon = "ps -ef | grep ipfs | grep daemon | grep -v grep | awk '{print $2}' | wc -l";
        const psDaemonResults = execSync(psDaemon).toString();
        if (parseInt(psDaemonResults) > 0) {
            const psCmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | awk '{print $2}' ";
            const pids = execSync(psCmd).toString().split("\n");
            const userPsCmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | awk '{print $1}'";
            const userPsResults = execSync(userPsCmd).toString().split("\n");
            const thisUser = os.userInfo().username;
            for (let i = 0; i < pids.length; i++) {
                if (userPsResults[i] == thisUser) {
                    if (pids[i] != "") {
                        const killDaemon = `kill -9 ${pids[i]}`;
                        execSync(killDaemon);
                    }
                }
            }
        }
        const lockFile = path.join(ipfsPath, "repo.lock");
        if (fs.existsSync(lockFile)) {
            fs.unlinkSync(lockFile);
        }
        this.ensureDirSync(this.ipfsPath);
        const command = this.pathString + " ipfs";
        const args = ["daemon", "--enable-pubsub-experiment", "--enable-gc"];
        const env = { IPFS_PATH : ipfsPath };
        const exportCommand = Object.entries(env).map(([key, value]) => ` ${key}=${value}`).join(" ");
        const processCommand = exportCommand + " " + command + " " + args.join(" ");
        try {
            let runDaemon = exec(
                processCommand,
                (error, stdout, stderr) => {
                    if (stdout.length > 0) {
                        // console.log(stdout);
                    }
                    if (stderr.length > 0) {
                        console.error(stderr);
                    }
                }
            );
            return true;
        } catch (error) {
            console.error(error);
        }
        finally {
            return true;
        }
    }

    async removeDirectorySync(dirPath) {
        // Recursive removal using rmSync in newer Node.js versions, for older versions consider rimraf package
        try {
            fs.rmSync(dirPath, { recursive: true, force: true });
            return true;
        } catch (error) {
            console.error(`Failed to remove directory ${dirPath}: ${error}`);
            return false;
        }
    }

    async uninstallIpfs(options = {}) {
        await this.killProcessByPattern('ipfs.*daemon');
        await this.killProcessByPattern('ipfs-cluster-follow');
        await this.removeDirectorySync(this.ipfsPath);
        await this.removeDirectorySync(path.join(os.homedir(), '.ipfs-cluster-follow', 'ipfs_cluster', 'api-socket'));
        return true;
    }


    async killProcessByPattern(pattern) {
        try {
            // Using pgrep and pkill for more precise process management
            let pids = execSync(`pgrep -f '${pattern}'`).toString().trim();
            pids = pids.split('\n');
            for (let pid of pids) {
                let find_pid = execSync(`ps -ef | grep ${pid} | grep -v grep | wc -l`).toString().trim();
                if (parseInt(find_pid) > 0) {    
                    execSync(`kill -9 ${pid}`);
                }
            }
            return true;
        } catch (error) {
            console.error(`Failed to kill process with pattern ${pattern}: ${error}`);
            return false;
        }
    }

    async removeDirectorySync(dirPath) {
        // Recursive removal using rmSync in newer Node.js versions, for older versions consider rimraf package
        try {
            fs.rmSync(dirPath, { recursive: true, force: true });
            return true;
        } catch (error) {
            console.error(`Failed to remove directory ${dirPath}: ${error}`);
            return false;
        }
    }

    async removeBinariesSync(binPath, binList) {
        // Recursive removal using rmSync in newer Node.js versions, for older versions consider rimraf package
        // FIXME: Need elevated permissions to remove binaries from /usr/local/bin
        try {
            for (const binary of binList) {
                const filePath = path.join(binPath, binary);
                fs.rmSync(filePath, { force: true });
            }
            return true;
        } catch (error) {
            console.error(`Failed to remove binaries: ${error}`);
            return false;
        }
    }

    // TODO: Implement the uninstall methods for testing
    async uninstallIpfs(options = {}) {
        await this.killProcessByPattern('ipfs.*daemon');
        await this.killProcessByPattern('ipfs-cluster-follow');
        await this.removeDirectorySync(this.ipfsPath);
        await this.removeDirectorySync(path.join(os.homedir(), '.ipfs-cluster-follow', 'ipfs_cluster', 'api-socket'));
        await this.removeBinariesSync('/usr/local/bin', ['ipfs', 'ipget', 'ipfs-cluster-service', 'ipfs-cluster-ctl']);
        return true;
    }
    // NOTE: check that fregg implemented this correctly.

    async testUninstall(options = {}) {
        if (['leecher', 'worker', 'master'].includes(this.role)) {
            this.uninstallIpfs();
        }
        if (this.role === "master") {
            this.uninstallIpfsClusterService();
            this.uninstallIpfsClusterCtl();
        }
        if (this.role === "worker") {
            this.uninstallIpfsClusterFollow();
        }
    }

    async installExecutables(options = {}) {
        let results = {};
        if (['leecher', 'worker', 'master'].includes(this.role)) {
            let ipfs = await this.installIpfsDaemon();
            results["ipfs"] = ipfs;
        }
        if (this.role === "master") {
            let clusterService = await this.installIpfsClusterService();
            let clusterCtl = await this.installIpfsClusterCtl();
            results["clusterService"] = clusterService;
            results["clusterCtl"] = clusterCtl;
        }
        if (this.role === "worker") {
            let clusterFollow = await this.installIpfsClusterFollow();
            results["clusterFollow"] = clusterFollow;
        }
        return results;
    }


    async configExecutables(options = {}) {
        let results = {};
        if (['leecher', 'worker', 'master'].includes(this.role)) {
            let ipfsConfig = await this.configIpfs();
            results["ipfs_config"] = ipfsConfig.config;
        }
        if (this.role === "master") {
            let clusterServiceConfig = await this.configIpfsClusterService();
            let clusterCtlConfig = await this.configIpfsClusterCtl();
            results["clusterServiceConfig"] = clusterServiceConfig.config;
            results["clusterCtlConfig"] = clusterCtlConfig.config;
        }
        if (this.role === "worker") {
            let clusterFollowConfig = this.configIPFSClusterFollow();
            results["clusterFollowConfig"] = clusterFollowConfig.config;
        }
        return results;
    }

    async ipfsTestInstall() {
        try {
            execSync('which ipfs');
            return true;
        } catch (error) {
            return false;
        }
    }

    async ipfsClusterServiceTestInstall() {
        try {
            execSync('which ipfs-cluster-service');
            return true;
        } catch (error) {
            return false;
        }
    }

    async ipfsClusterFollowTestInstall() {
        try {
            execSync('which ipfs-cluster-follow');
            return true;
        } catch (error) {
            return false;
        }
    }

    async ipfsClusterCtlTestInstall() {
        try {
            execSync('which ipfs-cluster-ctl');
            return true;
        } catch (error) {
            return false;
        }
    }

    async ipgetTestInstall() {
        try {
            execSync('which ipget');
            return true;
        } catch (error) {
            return false;
        }
    }

    async installAndConfigure() {
        let results = {};
        if (['leecher', 'worker', 'master'].includes(this.role)) {
            let ipget = await this.installIPGet( this.ipfsIpgetDistTar, path.join(this.tmpDir, 'ipget.tar.gz'), this.tmpDir);
            let ipfs = await this.installIpfsDaemon();
            let ipfsConfig = await this.configIpfs(this.clusterName, this.ipfsPath);
            let ipfsExecute = await this.runIpfsDaemon();
            // NOTE: This fails sometimes but never when debugging so probably some sort of race issue
            results.ipfs = ipfs;
            results.ipfsConfig = ipfsConfig.config;
            results.ipfsExecute = ipfsExecute;
        }
        if (this.role === 'master') {
            let clusterService = await this.installIpfsClusterService();
            let clusterCtl = await this.installIpfsClusterCtl();
            let clusterServiceConfig = await this.configIpfsClusterService(this.clusterName, this.ipfsPath);     
            let clusterCtlConfig = await this.configIpfsClusterCtl(this.clusterName, this.ipfsPath);
            results.clusterService = clusterService;
            results.clusterCtl = clusterCtl;
            results.clusterServiceConfig = clusterServiceConfig;
            results.clusterCtlConfig = clusterCtlConfig;
            await this.killProcessByPattern("ipfs-cluster-service");
            results.clusterServiceExecute = await this.runIpfsClusterService();
            results.clusterCtlExecute = await this.runIpfsClusterCtl();
        }
        if (this.role === 'worker') {
            let clusterFollow = await this.installIpfsClusterFollow();
            let clusterFollowConfig = await this.configIpfsClusterFollow(this.clusterName, this.ipfsPath);
            results.clusterFollow = clusterFollow;
            results.clusterFollowConfig = clusterFollowConfig;
            results.clusterFollowExecute = await this.runIpfsClusterFollow();
        }

        await this.killProcessByPattern("ipfs daemon");
        await this.killProcessByPattern("ipfs-cluster-follow");
        await this.killProcessByPattern("ipfs-cluster-service");
        await this.killProcessByPattern("ipfs-cluster-ctl");

        if (os.userInfo().uid === 0) {
            let systemctlReload = "systemctl daemon-reload";
            results.systemctlReload = await this.executeCommand(systemctlReload);
        }

        return results;
    }


    async installIPGet(url, tarPath, tmpDir) {
        return new Promise((resolve, reject) => {
            const request = https.get(url, { timeout: 30000 }, (response) => { // Increase timeout to 30 seconds
                const fileStream = fs.createWriteStream(tarPath);
                response.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    console.log('Downloaded ipget tarball.');
                    tar.x({
                        file: tarPath,
                        C: tmpDir,
                    }).then(() => {
                        console.log('Extracted ipget.');
                        // Move to bin and install
                        if (os.userInfo().username == "root") {
                            const binPath = path.join(tmpDir, 'ipget', 'ipget');
                            execSync(`sudo mv ${binPath} /usr/local/bin/ipget`);
                            const installScriptPath = path.join(tmpDir, 'ipget', 'install.sh');
                            execSync(`cd ${tmpDir}/ipget && sudo bash install.sh`);
                            // Update system settings
                            execSync('sudo sysctl -w net.core.rmem_max=2500000');
                            execSync('sudo sysctl -w net.core.wmem_max=2500000');
                        }
                        else {
                            console.log('Please run as root user to install ipget globally');
                            //FIXME: Remove install move to bin and add to path 
                            // let tmpCommand = `cd ${tmpDir}/ipget && bash install.sh`;
                            // let tmpCommand2 = `mkdir -p "`+ this.thisDir  + `/bin" && cd ${tmpDir}/ipget && mv ipget "`+ this.thisDir  + `/bin/ipget" && chmod +x "`+ this.thisDir  + `/bin/ipget"`;
                            execSync(`cd ${tmpDir}/ipget && mv ipget "${this.thisDir}/bin/" && chmod +x "${this.thisDir}/bin/ipget"`)

                            // execSync(tmpCommand);
                            // execSync(tmpCommand2);
                            // execSync(`cd ${tmpDir}/ipget && bash install.sh`);      
                        }
                        // Verify installation
                        try {
                            const version = execSync(this.pathString + ` ipget --version`).toString().trim();
                            console.log(`Installed ipget version: ${version}`);
                            resolve(true); // Resolve the promise here
                        } catch (verificationError) {
                            console.error('Error verifying ipget installation:', verificationError);
                            reject(verificationError); // Reject the promise if there's an error
                        }
                    }).catch((extractionError) => {
                        console.error('Error extracting ipget:', extractionError);
                        reject(extractionError); // Reject the promise if there's an error
                    });
                });
            }).on('error', (error) => {
                console.error('Error downloading ipget:', error);
                reject(error); // Reject the promise if there's an error
            });
    
            request.on('timeout', () => {
                request.abort(); // Abort the request on timeout
                console.error('Request timed out. Trying again...');
                // Retry logic or reject the promise
                reject(new Error('Request timed out'));
            });
        });
    }
}
