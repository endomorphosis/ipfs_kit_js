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
import { run } from 'shutil'
import { randomUUID } from 'crypto';
import crypto from 'crypto';
import https from 'https';
import * as tar from 'tar';
import { time } from 'console';

// TODO: This fails if aria2c is not installed but doesn't fail gracefully and in a way that diagnoses the problem to the user 
//       Either add a check for aria2c and report to user or add aria2c to the install that is ran before hand

export class InstallIpfs {
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
                this.role = meta.role;
                if (!['master', 'worker', 'leecher'].includes(this.role)) {
                    throw new Error("role is not either master, worker, leecher");
                }
            } else {
                this.role = "leecher";
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
                    disk_size: testDisk.diskDeviceTotalCapacity(this.diskName),
                    disk_used: testDisk.diskDeviceUsedCapacity(this.diskName),
                    disk_avail: testDisk.diskDeviceAvailCapacity(this.diskName),
                    disk_name: this.diskName
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
                    disk_size: testDisk.diskDeviceTotalCapacity(this.diskName),
                    disk_used: testDisk.diskDeviceUsedCapacity(this.diskName),
                    disk_avail: testDisk.diskDeviceAvailCapacity(this.diskName),
                    disk_name: this.diskName
                };
            }

            this.clusterName = meta.clusterName ? meta.clusterName : null;
            this.clusterLocation = meta.clusterLocation ? meta.clusterLocation : "/ip4/167.99.96.231/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv";

            if (['leecher', 'worker', 'master'].includes(this.role) && this.ipfsPath) {
                // Bind the methods for installing and configuring IPFS
                this.ipfs_install_command = this.installIpfsDaemon.bind(this);
                this.ipfs_config_command = this.configIPFS.bind(this);
            }

            if (this.role === "worker" && this.clusterName && this.ipfsPath) {
                // Bind methods for worker role
                this.clusterInstall = this.installIpfsClusterFollow.bind(this);
                this.clusterConfig = this.configIPFSClusterFollow.bind(this);
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
        let service_path = "";
        let cluster_path = path.join(ipfsPath, clusterName);
        let results = {};

        try {
            if (os.userInfo().username === "root") {
                service_path = path.join("/root", ".ipfs-cluster");
            } else {
                service_path = path.join(ipfsPath);
            }
            if (!fs.existsSync(service_path)) {
                fs.mkdirSync(service_path, { recursive: true });
            }
            if (clusterName && ipfsPath && diskStats) {
                if (os.userInfo().username === "root") {
                    let enable_cluster_service = "systemctl enable ipfs-cluster";
                    let enable_cluster_service_results = execSync(enable_cluster_service).toString();
                    let ipfs_cluster_service = fs.readFileSync(path.join(thisDir, "service.json"), "utf8");
                    fs.writeFileSync(path.join(service_path, "service.json"), ipfs_cluster_service);
                    let init_cluster_service = `${this.pathString} IPFS_PATH=${ipfsPath} ipfs-cluster-service init -f`;
                    let init_cluster_service_results = execSync(init_cluster_service).toString();
                    results["init_cluster_service_results"] = init_cluster_service_results;
                } else {
                    let init_cluster_service = `${this.pathString} IPFS_PATH=${ipfsPath} ipfs-cluster-service init -f`;
                    let init_cluster_service_results = execSync(init_cluster_service).toString();
                    results["init_cluster_service_results"] = init_cluster_service_results;
                }
            }
        } catch (e) {
            console.error(e);
            results["init_cluster_service_results"] = e.toString();
        }

        if (this.role === "worker" || this.role === "master") {
            try {
                let service_config = fs.readFileSync(path.join(thisDir, "service.json"), "utf8");
                let workerID = crypto.randomBytes(32);
                workerID = "worker-" + workerID.toString('hex');
                service_config = service_config.replace('"clusterName": "ipfs-cluster"', `"clusterName": "${clusterName}"`);
                service_config = service_config.replace('"secret": "96d5952479d0a2f9fbf55076e5ee04802f15ae5452b5faafc98e2bd48cf564d3"', `"secret": "${secret}"`);
                fs.writeFileSync(path.join(service_path, "service.json"), service_config);
                let peerlist = fs.readFileSync(path.join(thisDir, "peerstore"), "utf8");
                fs.writeFileSync(path.join(service_path, "peerstore"), peerlist);
                let pebble_link = path.join(service_path, "pebble");
                let pebble_dir = path.join(cluster_path, "pebble");
                if (cluster_path !== service_path) {
                    if (fs.existsSync(pebble_link)) {
                        execSync(`rm -rf ${pebble_link}`);
                    }
                    // else if (fs.lstatSync(pebble_link).isSymbolicLink()){
                    //     execSync(`rm -rf  ${pebble_link}`);
                    // }
                }
                if (os.userInfo().username === "root") {
                    let service_file = fs.readFileSync(path.join(thisDir, "ipfs-cluster.service"), "utf8");
                    service_file = service_file.replace("ExecStart=/usr/local/bin/", `ExecStart= bash -c "export IPFS_PATH=${this.ipfsPath} && export PATH=${this.path} && ipfs-cluster-service daemon "`);
                    fs.writeFileSync("/etc/systemd/system/ipfs-cluster.service", service_file);
                    execSync("systemctl enable ipfs-cluster");
                    execSync("systemctl daemon-reload");
                }
            } catch (e) {
                throw new Error(e.toString());
            }
        }

        try {
            let run_daemon_results = "";
            if (os.userInfo().username === "root") {
                execSync("systemctl daemon-reload");
                execSync("systemctl enable ipfs-cluster");
                execSync("systemctl start ipfs-cluster");
                setTimeout(() => {
                    run_daemon_results = execSync("systemctl status ipfs-cluster").toString();
                    results["run_daemon"] = run_daemon_results;
                }, 5000);
            } else {
                let run_daemon_cmd = `${this.pathString} ipfs-cluster-service -d daemon`;
                let daemonProcess = spawn(run_daemon_cmd, { shell: true });
                setTimeout(() => {
                    let find_daemon_command_results = execSync("ps -ef | grep ipfs-cluster-service | grep -v grep | wc -l").toString().trim();
                    results["run_daemon"] = find_daemon_command_results;
                    if (parseInt(find_daemon_command_results) <= 0) {
                        console.error("ipfs-cluster-service daemon did not start");
                        throw new Error("ipfs-cluster-service daemon did not start");
                    }
                }, 5000);
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

        let run_cluster_ctl = null;

        try {
            let run_cluster_ctl_cmd = this.pathString + ` ipfs-cluster-ctl --version`;
            exec(run_cluster_ctl_cmd, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    results["run_cluster_ctl"] = error.toString();
                    return false;
                }
                run_cluster_ctl = stdout;
                results["run_cluster_ctl"] = run_cluster_ctl;
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

    async configIpfsClusterFollow(kwargs) {
        let results = {};
        let clusterName = kwargs.clusterName || this.clusterName;
        let diskStats = kwargs.diskStats || this.diskStats;
        let ipfsPath = kwargs.ipfsPath || this.ipfsPath;
        let secret = kwargs.secret || this.secret;
        let thisDir = this.thisDir;
        let home_dir = os.homedir();
        let cluster_path = path.join(path.dirname(ipfsPath), 'ipfs-cluster', clusterName);
        let follow_path = path.join(ipfsPath, "ipfs_cluster") + "/";
        let run_daemon = null;
        let follow_init_cmd_results = null;
        let worker_id = "worker-" + crypto.randomBytes(32).toString('hex');

        if (!diskStats) throw new Error("diskStats is None");
        if (!ipfsPath) throw new Error("ipfsPath is None");
        if (!clusterName) throw new Error("clusterName is None");
        if (!secret) throw new Error("secret is None");

        follow_path = os.userInfo().username === "root" ? path.join("/root", ".ipfs-cluster-follow", clusterName) + "/" : path.join(os.homedir(), ".ipfs-cluster-follow", clusterName);

        if (clusterName && ipfsPath && diskStats) {
            try {
                let rm_command = "rm -rf " + follow_path;
                let rm_results = execSync(rm_command).toString();
                let follow_init_cmd = "ipfs-cluster-follow " + clusterName + " init " + ipfsPath;
                follow_init_cmd_results = execSync(follow_init_cmd).toString();

                if (!fs.existsSync(cluster_path)) fs.mkdirSync(cluster_path, { recursive: true });
                if (!fs.existsSync(follow_path)) fs.mkdirSync(follow_path, { recursive: true });

                let service_config = fs.readFileSync(path.join(thisDir, "service_follower.json"), "utf8");
                service_config = service_config.replace('"clusterName": "ipfs-cluster"', '"clusterName": "' + clusterName + '"');
                service_config = service_config.replace('"peername": "worker"', '"peername": "' + worker_id + '"');
                service_config = service_config.replace('"secret": "96d5952479d0a2f9fbf55076e5ee04802f15ae5452b5faafc98e2bd48cf564d3"', '"secret": "' + secret + '"');
                fs.writeFileSync(path.join(follow_path, "service.json"), service_config);

                let peer_store = fs.readFileSync(path.join(thisDir, "peerstore"), "utf8");
                fs.writeFileSync(path.join(follow_path, "peerstore"), peer_store);

                let pebble_link = path.join(follow_path, "pebble");
                let pebble_dir = path.join(cluster_path, "pebble");
                if (cluster_path !== follow_path) {
                    if (fs.existsSync(pebble_link)) {
                        execSync("rm -rf " + pebble_link);
                    }
                    if (!fs.existsSync(pebble_dir)) {
                        fs.mkdirSync(pebble_dir, { recursive: true });
                    }
                    execSync("ln -s " + pebble_dir + " " + pebble_link);
                }

                if (clusterNameuid() === 0) {
                    let service_file = fs.readFileSync(path.join(thisDir, "ipfs-cluster-follow.service"), "utf8");
                    let new_service = service_file.replace("ExecStart=", 'ExecStart= bash -c "export IPFS_PATH=' + ipfsPath + ' && export PATH=' + this.path + " && /usr/local/bin/ipfs-cluster-follow " + clusterName + ' run "');
                    new_service = new_service.replace("Description=IPFS Cluster Follow", "Description=IPFS Cluster Follow " + clusterName);
                    fs.writeFileSync("/etc/systemd/system/ipfs-cluster-follow.service", new_service);
                    execSync("systemctl enable ipfs-cluster-follow");
                    execSync("systemctl daemon-reload");
                }
            } catch (e) {
                console.error(e);
                throw e;
            }
        }

        try {
            let find_daemon = "ps -ef | grep ipfs-cluster-follow | grep -v grep | wc -l";
            let find_daemon_results = execSync(find_daemon).toString().trim();
            if (parseInt(find_daemon_results) > 0) {
                this.killProcessByPattern("ipfs-cluster-follow");
            }

            if (clusterNameuid() === 0) {
                execSync("systemctl daemon-reload");
                execSync("systemctl enable ipfs-cluster-follow");
                execSync("systemctl start ipfs-cluster-follow");
                setTimeout(() => {
                    let run_daemon_results = execSync("systemctl status ipfs-cluster-follow").toString();
                    find_daemon_results = execSync(find_daemon).toString().trim();
                    if (parseInt(find_daemon_results) === 0) {
                        console.error("ipfs-cluster-follow daemon did not start");
                        throw new Error("ipfs-cluster-follow daemon did not start");
                    }
                    if (parseInt(find_daemon_results) > 0) {
                        this.killProcessByPattern("ipfs-cluster-follow");
                    }
                }, 2000);
            } else {
                let run_daemon_cmd = "ipfs-cluster-follow " + clusterName + " run";
                let run_daemon_process = exec(run_daemon_cmd);
                if (run_daemon_process !== null) {
                    results["run_daemon"] = true;
                }
                setTimeout(() => {
                    find_daemon_results = execSync(find_daemon).toString().trim();
                    if (parseInt(find_daemon_results) === 0) {
                        console.error("ipfs-cluster-follow daemon did not start");
                        throw new Error("ipfs-cluster-follow daemon did not start");
                    } else if (parseInt(find_daemon_results) > 0) {
                        this.killProcessByPattern("ipfs-cluster-follow");
                    }
                }, 2000);
            }
        } catch (e) {
            console.error(e);
        }

        results["run_daemon"] = parseInt(execSync(find_daemon).toString().trim()) > 0;
        results["follow_init_cmd_results"] = follow_init_cmd_results;
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


    // async configIpfs(options = {}) {
    //     let diskStats = options.diskStats || this.diskStats;
    //     let ipfsPath = options.ipfsPath || this.ipfsPath;
    //     let identity
    //     let config
    //     let peerId
    //     let run_daemon
    //     let public_key
    //     let ipfs_daemon
    //     let run_daemon_results
    //     if (!diskStats) throw new Error("diskStats is None");
    //     if (!ipfsPath) throw new Error("ipfsPath is None");

    //     ipfsPath = path.join(ipfsPath, "ipfs");
    //     fs.mkdirSync(ipfsPath, { recursive: true });

    //     let ipfsDirContents = fs.readdirSync(ipfsPath);
    //     if (ipfsDirContents.length > 0) {
    //         console.log("IPFS directory is not empty. Clearing contents...");
    //         for (let thisFile of ipfsDirContents) {
    //             let delfile = path.join(ipfsPath, thisFile);
    //             if (fs.existsSync(delfile)) {
    //                 if (fs.lstatSync(delfile).isFile()) {
    //                     fs.unlinkSync(delfile);
    //                 }
    //                 else if (fs.lstatSync(delfile).isDirectory()) {
    //                     fs.rmSync(delfile, {
    //                         recursive: true
    //                     });
    //                 }
    //                 else {
    //                     console.log(`Unknown file type: ${delfile}`);
    //                 }
    //             }
    //         }
    //     }

    //     let results = {
    //         config: null,
    //         identity: null,
    //         public_key: null
    //     };

    //     if (diskStats && ipfsPath) {
    //         try {
    //             execSync(`IPFS_PATH=${ipfsPath} ipfs init --profile=badgerds`);
    //             peerId = JSON.parse(execSync(`IPFS_PATH=${ipfsPath} ipfs id`).toString());
    //             execSync(`IPFS_PATH=${ipfsPath} ipfs config profile apply badgerds`);

    //             // Calculate available disk space and adjust storage allocation
    //             // NOTE: test diskAvailable to ensure that there is correct formatting. 
    //             let diskAvailable = parseFloat(diskStats.disk_avail);
    //             let minFreeSpace = 32 * 1024 * 1024 * 1024; // 32 GB
    //             if (diskAvailable > minFreeSpace) {
    //                 let allocate = Math.ceil(((diskAvailable - minFreeSpace) * 0.8) / 1024 / 1024 / 1024);
    //                 execSync(`IPFS_PATH=${ipfsPath} ipfs config Datastore.StorageMax ${allocate}GB`);
    //             }

    //             // Load peer list and add to bootstrap
    //             let peerListPath = path.join(process.cwd(), "peerstore");
    //             if (fs.existsSync(peerListPath)) {
    //                 let peerList = fs.readFileSync(peerListPath).toString().split("\n");
    //                 peerList.forEach(peer => {
    //                     if (peer) {
    //                         execSync(`IPFS_PATH=${ipfsPath} ipfs bootstrap add ${peer}`);
    //                     }
    //                 });
    //             }

    //             //Assuming ipfs_service_text contains the systemd service configuration
    //             if (os.userInfo().username == "root") {
    //                 const original_service = fs.readFileSync("/etc/systemd/system/ipfs.service").toString();
    //                 const new_service_text = original_service.replace("ExecStart=", "ExecStart= bash -c \"export IPFS_PATH=" + ipfsPath + " && ");
    //                 fs.writeFileSync("/etc/systemd/system/ipfs.service", new_service_text);
    //             }

    //             let config_data = execSync(`IPFS_PATH=${ipfsPath} ipfs config show`).toString();

    //             results.config = config_data
    //             results.identity = peerId.ID;
    //             results.public_key = peerId.PublicKey
    //             results.agent_version = peerId.AgentVersion
    //             results.addresses = peerId.Addresses
    //         } catch (error) {
    //             console.error('Error configuring IPFS:', error);
    //         }
    //     }
    //     if (os.userInfo().username == "root") {
    //         try {
    //             // Reload daemon
    //             let reloadDaemonCmd = "systemctl daemon-reload";
    //             let reloadDaemonResults = execSync(reloadDaemonCmd);

    //             // Enable service 
    //             let enableDaemon = "systemctl enable ipfs";
    //             let enableDaemonResults = execSync(enableDaemon);
    //             // NOTE: make sure fregg handled the systemctl commands correctly.
    //             // Check if daemon is running
    //             let findDaemon = "ps -ef | grep ipfs | grep daemon | grep -v grep | wc -l";
    //             let findDaemonResuls = execSync(findDaemon).toString();
    //             if (parseInt(findDaemonResuls) > 0) {
    //                 execSync("systemctl stop ipfs");
    //                 let findDaemonResuls = execSync(findDaemon).toString();
    //             }
    //             // Start daemon
    //             let startDaemon = "systemctl start ipfs";
    //             let startDaemonResults = execSync(startDaemon);

    //             findDaemonResuls = execSync(findDaemon).toString();
    //             if (parseInt(findDaemonResuls) > 0) {
    //                 execSync("systemctl stop ipfs");
    //                 let findDaemonResuls = execSync(findDaemon).toString();
    //             }

    //             if (parseInt(findDaemonResuls) == 0) {
    //                 // Downloads image from ipfs as a test
    //                 let testDaemon = `bash -c "export IPFS_PATH=${ipfsPath} && ipfs cat /ipfs/QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq > ${ipfsPath}/test.jpg"`;
    //                 let testDaemonResults = execSync(testDaemon);

    //                 // Time out for 2 seconds to allow the file to download
    //                 await new Promise(resolve => setTimeout(resolve, 5000));

    //                 if (fs.existsSync(`${ipfsPath}/test.jpg`)) {
    //                     if (fs.statSync(`${ipfsPath}/test.jpg`).size > 0) {
    //                         fs.unlinkSync(`${ipfsPath}/test.jpg`);
    //                     } else {
    //                         throw new Error("ipfs failed to download test file");
    //                     }
    //                     fs.unlinkSync(`${ipfsPath}/test.jpg`);
    //                 }
    //             } else {
    //                 throw new Error("ipfs failed to download test file");
    //             }
    //         } catch (e) {
    //             console.log(e);
    //             return e.toString();
    //         } finally {
    //             let stopDaemon = "systemctl stop ipfs";
    //             let stopDaemonResults = execSync(stopDaemon);
    //         }
    //     } else {
    //         let findDaemon = "ps -ef | grep ipfs | grep daemon | grep -v grep | wc -l";
    //         let findDaemonResuls = execSync(findDaemon).toString();
    //         if (parseInt(findDaemonResuls) > 0) {
    //             let pids = execSync("ps -ef | grep ipfs | grep daemon | grep -v grep | awk '{print $2}' ").toString().split("\n");
    //             let pids_by_user = execSync("ps -ef | grep ipfs | grep daemon | grep -v grep | awk '{print $1}' ").toString().split("\n");
    //             let this_user = os.userInfo().username;
    //             for (let i = 0; i < pids.length; i++) {
    //                 if (pids_by_user[i] == this_user) {
    //                     if (pids[i] != "") {
    //                         execSync(`kill -9 ${pids[i]}`);
    //                     }
    //                 }
    //                 else {
    //                     console.log("ipfs daemon is running by another user");
    //                 }
    //             }

    //             findDaemonResuls = execSync(findDaemon).toString();
    //         }
    //         let run_daemon_cmd = this.pathString + ` IPFS_PATH=${ipfsPath} ipfs daemon --enable-pubsub-experiment --enable-gc`;
    //         run_daemon = exec(
    //             run_daemon_cmd,
    //             (error, stdout, stderr) => {
    //                 if (stdout.length > 0) {
    //                     console.log(stdout);
    //                 }
    //                 if (stderr.length > 0) {
    //                     console.error(stderr);
    //                     //throw new Error(stderr);
    //                 }
    //             }
    //         );
    //         await new Promise(resolve => setTimeout(resolve, 2000));
    //         findDaemon = "ps -ef | grep ipfs | grep daemon | grep -v grep | wc -l";
    //         findDaemonResuls = execSync(findDaemon).toString();
    //         run_daemon_results = run_daemon.stderr.read();
    //         try {
    //             // Start the daemon
    //             let testDaemon = `bash -c 'IPFS_PATH=${ipfsPath} ipfs cat /ipfs/QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq' > ${ipfsPath}/test.jpg`;
    //             let testDaemonResults = execSync(testDaemon).toString();

    //             // Time out for 2 seconds to allow the file to download
    //             await new Promise(resolve => setTimeout(resolve, 2000));

    //             if (fs.existsSync(`${ipfsPath}/test.jpg`)) {
    //                 if (fs.statSync(`${ipfsPath}/test.jpg`).size > 0) {
    //                     fs.unlinkSync(`${ipfsPath}/test.jpg`);
    //                 } else {
    //                     fs.unlinkSync(`${ipfsPath}/test.jpg`);
    //                     throw new Error("ipfs failed to download test file");
    //                 }
    //             }
    //             else {
    //                 throw new Error("ipfs failed to download test file");
    //             }
    //         }
    //         catch (e) {
    //             console.log(e);
    //             return e.toString();
    //         }
    //     }
    //     if (results.identity != undefined && results.identity.length == 52) {
    //         identity = results.identity;
    //         config = JSON.parse(results.config.replace("\n", ""));
    //         public_key = results.public_key;
    //         ipfs_daemon = run_daemon_results;
    //     }
    //     results = {
    //         "config": config,
    //         "identity": identity,
    //         "public_key": public_key,
    //         "ipfs_daemon": ipfs_daemon
    //     };
    //     return results;
    // }

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

        let home_dir = os.homedir();
        let identity = null;
        let config = null;
        let peer_id = null;
        let run_daemon = null;
        let public_key = null;
        let ipfs_daemon = null;
        let ipfs_dir_contents = []
        if (fs.existsSync(this.ipfsPath)) {
            let ipfs_dir_contents = fs.readdirSync(this.ipfsPath);
        }   
        if (ipfs_dir_contents.length > 0) {
            console.log("ipfs directory is not empty");
            for (let del_file of ipfs_dir_contents) {
                let del_file_path = path.join(this.ipfsPath, del_file);
                if (fs.lstatSync(del_file_path).isFile()) {
                    fs.unlinkSync(del_file_path);
                } else if (fs.lstatSync(del_file_path).isDirectory()) {
                    fs.rmdirSync(del_file_path, { recursive: true });
                } else {
                    console.log("unknown file type " + del_file + " in ipfs directory");
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
                let peer_id = null;
                let disk_available = null;

                let min_free_space = 32 * 1024 * 1024 * 1024;
                let allocate = null;
                disk_available = this.diskStats['disk_avail'];

                // Note: The following commands are synchronous and may block the event loop
                // Consider using child_process.exec or child_process.spawn for async execution

                let ipfs_init_command = `IPFS_PATH=${this.ipfsPath} `+ this.pathString + ` ipfs init --profile=badgerds`;
                let ipfs_init_results = execSync(ipfs_init_command).toString().trim();

                let peer_id_command = `IPFS_PATH=${this.ipfsPath} ` + this.pathString + ` ipfs id`;
                let peer_id_results = execSync(peer_id_command).toString();
                peer_id = JSON.parse(peer_id_results);

                let ipfs_profile_apply = `IPFS_PATH=${this.ipfsPath} ` +  this.pathString+ ` ipfs config profile apply badgerds`;
                let ipfs_profile_apply_results = execSync(ipfs_profile_apply).toString();
                let ipfs_profile_apply_json = JSON.parse(ipfs_profile_apply_results);

                if (disk_available > min_free_space) {
                    allocate = Math.ceil(((disk_available - min_free_space) * 0.8) / 1024 / 1024 / 1024);
                    let datastore_command = `IPFS_PATH=${this.ipfsPath} ` + this.pathString + ` ipfs config Datastore.StorageMax ${allocate}GB`;
                    let datastore_command_results = execSync(datastore_command).toString();
                }

                let peer_list_path = path.join(this.thisDir, "peerstore");
                if (fs.existsSync(peer_list_path)) {
                    let peerlist = fs.readFileSync(peer_list_path, "utf8").split("\n");
                    for (let peer of peerlist) {
                        if (peer) {
                            let bootstrap_add_command = `IPFS_PATH=${this.ipfsPath}  ` + this.pathString + ` ipfs bootstrap add ${peer}`;
                            let bootstrap_add_command_results = execSync(bootstrap_add_command).toString();
                        }
                    }
                }
                if (process.getuid() === 0) {
                    let ipfs_service = fs.readFileSync(path.join(this.thisDir, "ipfs.service"), "utf8");
                    let ipfs_service_text = ipfs_service.replace("ExecStart=", `ExecStart= bash -c "export IPFS_PATH=${this.ipfsPath} && export PATH=${this.path_string} && ipfs daemon --enable-gc --enable-pubsub-experiment "`);
                    fs.writeFileSync("/etc/systemd/system/ipfs.service", ipfs_service_text);
                }

                let config_get_cmd = this.pathString + ` IPFS_PATH=${this.ipfsPath} ipfs config show`;
                let config_data = execSync(config_get_cmd).toString();
                config_data = JSON.parse(config_data);
                results["config"] = config_data;
                results["identity"] = peer_id["ID"];
                results["public_key"] = peer_id["PublicKey"];
                results["agent_version"] = peer_id["AgentVersion"];
                results["addresses"] = peer_id["Addresses"];
            } catch (e) {
                console.log("error configuring IPFS in config_ipfs()");
                console.error(e);
            }
        }

        // Note: The following code assumes the script is running with root privileges
        // This may not be the case in all environments

        if (process.getuid() === 0) {
            try {
                let enable_daemon_cmd = "systemctl enable ipfs";
                let enable_daemon_results = execSync(enable_daemon_cmd).toString();

                let reload_daemon_cmd = "systemctl daemon-reload";
                let reload_daemon_results = execSync(reload_daemon_cmd).toString();

                let find_daemon_cmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | wc -l";
                let find_daemon_results = execSync(find_daemon_cmd).toString().trim();
                let stop_daemon_cmd = "systemctl stop ipfs";

                if (parseInt(find_daemon_results) > 0) {
                    let stop_daemon_results = execSync(stop_daemon_cmd).toString();
                }

                let start_daemon_cmd = "systemctl start ipfs";
                let start_daemon_results = execSync(start_daemon_cmd).toString();
                setTimeout(() => {
                    find_daemon_results = execSync(find_daemon_cmd).toString().trim();

                    if (parseInt(find_daemon_results) > 0) {
                        let test_daemon = `bash -c "export IPFS_PATH=${this.ipfsPath} && export PATH=${this.path_string} && ipfs cat /ipfs/QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq > /tmp/test.jpg"`;
                        let test_daemon_results = execSync(test_daemon).toString();
                        setTimeout(() => {
                            if (fs.existsSync("/tmp/test.jpg")) {
                                if (fs.statSync("/tmp/test.jpg").size > 0) {
                                    fs.unlinkSync("/tmp/test.jpg");
                                    test_daemon_results = true;
                                } else {
                                    throw new Error("ipfs failed to download test file");
                                }
                            }

                            let stop_daemon_cmd_results = execSync(stop_daemon_cmd).toString();
                            find_daemon_results = execSync(find_daemon_cmd).toString().trim();
                        }, 5000);
                    } else {
                        throw new Error("ipfs daemon did not start");
                    }
                }, 2000);
            } catch (e) {
                console.log("error starting ipfs daemon");
                console.error(e);
            } finally {
                if (parseInt(find_daemon_results) > 0) {
                    let stop_daemon_cmd = "systemctl stop ipfs";
                    let stop_daemon_results = execSync(stop_daemon_cmd).toString();
                }
            }
        } else {
            let find_daemon_cmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | wc -l";
            let find_daemon_results = execSync(find_daemon_cmd).toString().trim();
            if (parseInt(find_daemon_results) > 0) {
                let ps_cmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | awk '{print $2}'";
                let ps_results = execSync(ps_cmd).toString().split("\n");
                let user_ps_cmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | awk '{print $1}'";
                let user_ps_results = execSync(user_ps_cmd).toString().split("\n");
                for (let pid of ps_results) {
                    if (pid != "" && user_ps_results[ps_results.indexOf(pid)] == os.userInfo().username) {
                        let kill_daemon_cmd = `kill -9 ${pid}`;
                        let kill_daemon_results = execSync(kill_daemon_cmd).toString();
                    }
                }
                find_daemon_results = execSync(find_daemon_cmd).toString();
            }
            let run_daemon_cmd = `IPFS_PATH=${this.ipfsPath} ` + this.pathString + ` ipfs daemon --enable-pubsub-experiment`;
            let run_daemon = exec(run_daemon_cmd, { shell: true });
            // wait 2000 ms for the daemon to start
            await new Promise(resolve => setTimeout(resolve, 2000));
            let run_daemon_results = run_daemon.stderr.read();
            let test_daemon_results = null;
            setTimeout(() => {
                find_daemon_results = execSync(find_daemon_cmd).toString().trim();
                try {
                    if (fs.existsSync("/tmp/test.jpg")) {
                        fs.unlinkSync("/tmp/test.jpg");
                    }

                    let test_daemon = `bash -c "IPFS_PATH=${this.ipfsPath} ` + this.pathString + ` ipfs cat /ipfs/QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq > /tmp/test.jpg"`;
                    test_daemon_results = execSync(test_daemon).toString();
                    setTimeout(() => {
                        if (fs.existsSync("/tmp/test.jpg")) {
                            if (fs.statSync("/tmp/test.jpg").size > 0) {
                                test_daemon_results = true;
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
                ipfs_daemon = test_daemon_results;
            }
        }

        // this.killProcessByPattern("ipfs");
        results = {
            "config": config,
            "identity": identity,
            "public_key": null,
            "ipfs_daemon": ipfs_daemon
        };

        return results;
    }

    killProcessByPattern(pattern) {
        let kill_cmd = `pkill -f ${pattern}`;
        execSync(kill_cmd);
    }


    async runIpfsClusterService(options = {}) {
        let ipfsPath = options.ipfsPath || this.ipfsPath;
        ipfsPath = path.join(ipfsPath, "ipfs");
        fs.mkdirSync(ipfsPath, { recursive: true });

        const runIpfsClusterServiceCommand = this.pathString + ` IPFS_CLUSTER_PATH=${ipfsPath} ipfs-cluster-service`;
        const runIpfsClusterServiceCommandResults = exec(runIpfsClusterServiceCommand);

        runIpfsClusterServiceCommandResults.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        runIpfsClusterServiceCommandResults.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
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
            console.log(`stdout: ${data}`);
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
        const export_command = Object.entries(env).map(([key, value]) => `export ${key}=${value}`).join(" && ");
        const process_command = export_command + command + " " + args.join(" ");
        try {
            const { stdout, stderr } = await exec(process_command);
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
            const ps_cmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | awk '{print $2}' ";
            const pids = execSync(ps_cmd).toString().split("\n");
            const user_ps_cmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | awk '{print $1}'";
            const user_ps_results = execSync(user_ps_cmd).toString().split("\n");
            const this_user = os.userInfo().username;
            for (let i = 0; i < pids.length; i++) {
                if (user_ps_results[i] == this_user) {
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
        const export_command = Object.entries(env).map(([key, value]) => ` ${key}=${value}`).join(" ");
        const process_command = export_command + " " + command + " " + args.join(" ");
        try {
            let run_daemon = exec(
                process_command,
                (error, stdout, stderr) => {
                    if (stdout.length > 0) {
                        console.log(stdout);
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


    async killProcessByPattern(pattern) {
        try {
            // Using pgrep and pkill for more precise process management
            const pids = execSync(`pgrep -f '${pattern}'`).toString().trim();
            if (pids) {
                execSync(`pkill -f '${pattern}'`);
            }
        } catch (error) {
            console.error(`Failed to kill process with pattern ${pattern}: ${error}`);
            return false;
        } finally {
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
            const pids = execSync(`pgrep -f '${pattern}'`).toString().trim();
            if (pids) {
                execSync(`pkill -f '${pattern}'`);
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

        // await this.killProcessByPattern("ipfs");
        // await this.killProcessByPattern("ipfs-cluster-follow");
        // await this.killProcessByPattern("ipfs-cluster-service");
        // await this.killProcessByPattern("ipfs-cluster-ctl");

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

    // async installAndConfigure() {
    //     let results = {};
    //     let options = { diskStats: this.diskStats, ipfsPath: this.ipfsPath, clusterName: this.clusterName, clusterLocation: this.clusterLocation, secret: this.secret };
    //     try {
    //         if (['leecher', 'worker', 'master'].includes(this.role)) {
    //             // Assuming these methods are implemented and properly handle async operations
    //             const installIPGetResults = this.installIPGet();
    //             const installIPFSResults = this.installIpfsDaemon();
    //             const ipfsConfig = await this.configIpfs(options)
    //             results.ipfs = true; // Assuming installation success
    //             results.ipfs_config = ipfsConfig;
    //             //await this.runIpfsDaemon();
    //         }
    //         if (this.role === 'master') {
    //             const clusterService = await this.installIpfsClusterService(options);
    //             // This fails with which ipfs-cluster-service doesn't seem to install anything
    //             const clusterCtl = await this.installIpfsClusterCtl(options);
    //             const clusterServiceConfig = await this.configIpfsClusterService(options);
    //             const clusterCtlConfig = await this.configIpfsClusterCtl(options);
    //             results.clusterService = clusterService;
    //             results.clusterCtl = clusterCtl;
    //             results.clusterServiceConfig = clusterServiceConfig;
    //             results.clusterCtlConfig = clusterCtlConfig;
    //             //await this.runIpfsClusterService(options);
    //         }
    //         if (this.role === 'worker') {
    //             const clusterFollow = this.installIpfsClusterFollow(options);
    //             const clusterFollowConfig = await this.configIPFSClusterFollow(options);
    //             results.clusterFollow = clusterFollow;
    //             results.clusterFollowConfig = clusterFollowConfig;
    //             //await this.runIpfsClusterFollow(options);
    //         }

    //         // Systemctl daemon reload
    //         if (os.userInfo().username == "root") {
    //             exec('systemctl daemon-reload');
    //             results.systemctl_reload = true;
    //         }
    //     } catch (error) {
    //         console.error('Error during installation and configuration:', error);
    //         return null; // Or handle the error as needed
    //     }

    //     return results;
    // }

}
// run this if the script is run directly

async function test() {
    const meta = {
        role: "master",
        clusterName: "cloudkit_storage",
        clusterLocation: "/ip4/167.99.96.231/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv",
        secret: "96d5952479d0a2f9fbf55076e5ee04802f15ae5452b5faafc98e2bd48cf564d3",
    };

    // Initialize the IPFS configuration manager with the provided metadata
    const install_ipfs = new InstallIPFS(undefined, meta);

    const setup = true;

    if (setup) {
        // Execute the installation and configuration process
        async function runInstallationAndConfiguration() {
            try {
                const results = await install_ipfs.installAndConfigure();
                console.log('Installation and Configuration Results:', results);
            } catch (error) {
                console.error('An error occurred during the installation and configuration process:', error);
            }
            return true;
        }
        await runInstallationAndConfiguration();
        // process.exit(0);
        return true;

    } else {
        async function runUninstall() {
            try {
                const results = await install_ipfs.testUninstall();
                console.log('Installation and Configuration Results:', results);
            } catch (error) {
                console.error('An error occurred during the installation and configuration process:', error);
            }
        }

        await runUninstall();
        // process.exit(0);
        return true;

    }

}

if (import.meta.url === import.meta.url) {
    // test();
    // let test = new InstallIPFS();
    // test.installIPGet('https://dist.ipfs.io/ipget/v0.5.0/ipget_v0.5.0_linux-amd64.tar.gz', '/tmp/ipget.tar.gz', '/tmp');
    // test.downloadAndInstallIpget('https://dist.ipfs.io/ipget/v0.5.0/ipget_v0.5.0_linux-amd64.tar.gz', '/tmp/ipget.tar.gz', '/tmp')
}
