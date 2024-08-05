import { exec, execSync } from 'child_process';
import fs from 'fs';
import os, { type } from 'os';
import path from 'path';
import { start } from 'repl';
import { installIpfs } from './install_ipfs.js';
import util from 'util';

const execProm = util.promisify(exec);
const writeFileProm = util.promisify(fs.writeFile);

export default class ipfs {
    constructor(resources, meta) {
        this.thisDir = path.dirname(import.meta.url);
        if (this.thisDir.startsWith("file://")) {
            this.thisDir = this.thisDir.replace("file://", "");
        }
        this.meta = meta;
        this.resources = resources;
        this.path = process.env.PATH;
        this.path = this.path + ":" + path.join(this.thisDir, "bin")
        this.pathString = "PATH="+ this.path
        let localPath;
        if (os.userInfo().uid === 0) {
            localPath = '/cloudkit_storage/';
        } else {
            localPath = path.join(os.homedir(), '.cache');
        }
        this.localPath = localPath
        if (meta !== null && typeof meta === 'object') {
            if (Object.keys(meta).includes('config') && meta['config'] !== null) {
                this.config = meta['config'];
            }
            if (Object.keys(meta).includes('role') && meta['role'] !== null) {
                this.role = meta['role'];
                if (['master', 'worker', 'leecher'].includes(this.role) === false) {
                    console.error('role is not either master, worker, leecher');
                    this.role = 'leecher';
                }
            }
            if (Object.keys(meta).includes('clusterName') && meta['clusterName'] !== null) {
                this.clusterName = meta['clusterName'];
            }
            if (Object.keys(meta).includes('ipfsPath') && meta['ipfsPath'] !== null) {
                this.ipfsPath = meta['ipfsPath'];
            }
            else{
                this.ipfsPath = path.join(this.localPath, "ipfs")
            }
            if (this.role === 'leecher' || this.role === 'worker' || this.role === 'master') {
                this.commands = {};
            }
        }
        if (Object.keys(this).includes('ipfsPath') === false) {
            if (os.userInfo().uid === 0) {
                this.ipfsPath = '/ipfs/';
            }
            else{
                this.ipfsPath = path.join(path.join(os.homedir(), '.cache'), 'ipfs');
            }
        }
        if(Object.keys(this).includes('role') === false){
            this.role = 'leecher';
        }

        // if (!homedir_files.includes(".ipfs") && !ipfs_path_files.includes("ipfs") && os.path.existsSync(ipfs_path)){
        //     this.installIpfs = new InstallIpfs();
        //     this.installIpfs.install_ipfs_daemon().then((result) => {
        //     this.installIpfs.install_ipget()
        //     let stats = this.test_fio.stats(this.ipfsPath)
        //     this.installIpfs.config_ipfs(
        //         disk_stats = stats,
        //         ipfs_path = this.ipfsPath,
        //     )
        // }
    }

    async daemonStart(kwargs = {}) {
        let clusterName;
        if ('clusterName' in this) {
            clusterName = this.clusterName;
        }
        if ('clusterName' in kwargs) {
            clusterName = kwargs['clusterName'];
        }
        let homedir_files = fs.readdirSync(os.homedir());
        let ipfsPathFiles = [];
        if (fs.existsSync(this.ipfsPath)) {
            ipfsPathFiles = fs.readdirSync(this.ipfsPath);
        }
        if (!fs.existsSync(this.ipfsPath) ){
            ipfsPathFiles = []
            this.installIpfs = new InstallIpfs(this.resources, this.meta);
            await new Promise((resolve, reject) => {
                try{
                    this.installIpfs.installAndConfigure().then((result) => {
                        resolve(result);
                    });
                }
                catch (error) {
                    reject(error);
                }
            });
            ipfsPathFiles = fs.readdirSync(this.ipfsPath);
        }

        let startDaemonSystemCtlResults = null;
        let startDaemonCmdResults = false;
        let ipfsReady = false;

        // Run this if root and check if it passes 
        if (os.userInfo().uid === 0) {
            try {
                const start_daemon_systemctl = "systemctl start ipfs";
                exec(start_daemon_systemctl, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`Error starting ipfs: ${error.message}`);
                        startDaemonSystemCtlResults = error.message;
                    } else {
                        startDaemonSystemCtlResults = stdout;
                        const checkDaemonCmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | wc -l";
                        exec(checkDaemonCmd, (error, stdout, stderr) => {
                            if (!error && parseInt(stdout.trim()) > 0) {
                                ipfsReady = true;
                            }
                        });
                    }
                });
            } catch (error) {
                startDaemonSystemCtlResults = error.message;
            }
        }

        // Run this if user is not root or root user fails check if it passes
        if (os.userInfo().uid !== 0 || ipfsReady === false) {
            const psCommand = "ps -ef | grep ipfs | grep daemon | grep -v grep | wc -l";
            const psRootCommand = "ps -ef | grep ipfs | grep daemon | grep -v grep | grep root | wc -l";
            let psDaemonCmdResults = null;
            try {
                psDaemonCmdResults = execSync(psCommand).toString().trim();
                if (parseInt(psDaemonCmdResults) > 0) {
                    let psRootDaemonCmdResults = execSync(psRootCommand).toString().trim();
                    if (psDaemonCmdResults > psRootDaemonCmdResults && psDaemonCmdResults > 0) {
                        await this.daemonStop();
                        ipfsReady = false;
                    }
                    else if (psDaemonCmdResults == psRootDaemonCmdResults && psRootDaemonCmdResults > 0) {
                        console.log("Daemon already running as root, not starting daemon");
                        ipfsReady = true;
                    }
                }
            }
            catch (error) {
                psDaemonCmdResults = error;
            }            
            if (ipfsReady === false) {
                try {
                    const startDaemonCmd = `export IPFS_PATH=${path.resolve(path.join(this.ipfsPath))} &&  ` + this.pathString   + ` ipfs daemon --enable-gc --enable-pubsub-experiment`;
                    //const execute2 = execSync(command2);
                    const executeStartDaemonCmd = exec(startDaemonCmd, (error, stdout, stderr) => {
                        if (error) {
                            console.error(error);
                            startDaemonCmdResults = error.message;
                        }
                        if (stdout) {
                            startDaemonCmdResults = stdout;
                        }
                        if (stderr) {
                            console.error(stderr);
                            startDaemonCmdResults = stderr;
                        }
                    });
                    // add a sleep here to wait for the daemon to start
                    let milliseconds = 2000;
                    let start = new Date().getTime();
                    while (startDaemonCmdResults == false) {
                        if ((new Date().getTime() - start) > milliseconds) {
                            break;
                        }
                    }

                    return new Promise((resolve, reject) => {
                        const checkDaemonCmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | wc -l";
                        exec(checkDaemonCmd, (error, stdout, stderr) => {
                            let len_stdout = parseInt(stdout.trim());
                            if (!error && len_stdout > 0) {
                                ipfsReady = true;
                            }
                            if (error) {
                                console.error(error);
                                ipfsReady = false;
                            }
                            if (stderr) {
                                console.error(stderr);
                                ipfsReady = false;
                            }
                            const results = {
                                "systemctl": startDaemonSystemCtlResults,
                                "bash": startDaemonCmdResults,
                                "ipfsReady": ipfsReady,
                            };
                            resolve(results);
                        });
                    });
                } catch (error) {
                    console.error(error);
                    startDaemonCmdResults = error;
                }
            }
            else if (ipfsReady === true) {
                console.log("IPFS Daemon already running");
                return {
                    "systemctl": startDaemonSystemCtlResults,
                    "bash": startDaemonCmdResults,
                    "ipfsReady": ipfsReady,
                };
            }
        }
    }

    async daemonStop(kwargs = {}) {
        let clusterName;
        if ('clusterName' in this) {
            clusterName = this.clusterName;
        }
        if ('clusterName' in kwargs) {
            clusterName = kwargs['clusterName'];
        }
        let ipfsStopSystemCtlResults = null;
        let ipfsStopCmdResults = null;
        let ipfsStopCmd = null;
        let ipfsStopSystemCtl = null;
        let ipfsReady = false;

        // Run this if root and check if it passes 
        if (os.userInfo().uid === 0) {
            try {
                ipfsStopSystemCtl = "systemctl stop ipfs";
                exec(ipfsStopSystemCtl, (error, stdout, stderr) => {
                    if (error) {
                        ipfsStopSystemCtlResults = error;
                    }
                    if (stderr) {
                        ipfsStopSystemCtlResults = stderr;
                    }
                    if (stdout) {
                        ipfsStopSystemCtlResults = stdout;

                        let psDaemonCmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | wc -l";
                        exec(psDaemonCmd, (error, stdout, stderr) => {
                            if (!error && parseInt(stdout.trim()) === 0) {
                                ipfsReady = true;
                            }
                            if (error) {
                                console.error(error);
                                ipfsReady = false;
                            }
                            if (stderr) {
                                console.error(stderr);
                                ipfsReady = false;
                            }   
                        });
                    }
                });
            } catch (error) {
                ipfsStopSystemCtl = error;
            }
        }

        let psDaemonCmdResults = null;
        if (os.userInfo().uid !== 0 || ipfsReady === false) {
            try {
                let psDaemonCmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | awk '{print $2}'";
                exec(psDaemonCmd, (error, stdout, stderr) => {
                    if (error) {
                        psDaemonCmdResults  = error;
                        console.error(error);
                    }
                    if (stdout) {
                        psDaemonCmdResults = stdout;
                    }
                    if (stderr) {
                        psDaemonCmdResults = stderr;
                        console.error(stderr);
                    }
                });
            } catch (error) {
                psDaemonCmdResults = error;
            }

            if (parseInt(psDaemonCmdResults) > 0) {
                try {
                    ipfsStopCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs shutdown`;
                    exec(ipfsStopCmd, (error, stdout, stderr) => {
                        if (error) {
                            ipfsStopCmdResults = error;
                            console.error(error);
                        }
                        if (stderr) {
                            ipfsStopCmdResults = stderr;
                            console.error(stderr);
                        }
                        if (stdout) {
                            ipfsStopCmdResults = stdout;
                        }
                    });
                } catch (error) {
                    ipfsStopCmdResults = error;
                }
            }
            else {
                ipfsStopCmdResults = "No ipfs daemon running";
            }    
        }

        const results = {
            "systemctl": ipfsStopSystemCtl,
            "bash": psDaemonCmdResults
        };

        return results;
    }


    async ipfsResize(size, kwargs = {}) {
        const stopDaemonResults = await this.daemonStop();
        const resizeDaemonCmd = this.pathString + ` ipfs config --json Datastore.StorageMax ${size}GB`;
        let resizeDaemonCmdResults = null;
        await new Promise((resolve, reject) => {
            exec(resizeDaemonCmd, (error, stdout, stderr) => {
                if (error) {
                    resizeDaemonCmdResults = error;
                    reject(error);
                }
                if (stdout) {
                    resizeDaemonCmdResults = stdout;
                    resolve(stdout);
                }
                if (stderr) {
                    resizeDaemonCmdResults = stderr;
                    reject(stderr);
                }
            });
        });
        const startDaemonCmd = await this.daemonStart();
        return resizeDaemonCmdResults;
    }

    async ipfsLsPin(kwargs = {}) {
        if ('hash' in kwargs) {
            const hash = kwargs['hash'];
            let ipfsLsPinResults = false;
            let ipfsLsPinCmd = "";
            try {
                ipfsLsPinCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs ls ${hash}`;
                await new Promise((resolve, reject) => {
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            ipfsLsPinResults = error;
                            console.error(error);
                            reject(error);
                        }
                        if (stdout) {
                            ipfsLsPinResults = stdout;
                            resolve(stdout);
                        }
                        if (stderr) {
                            ipfsLsPinResults = stderr;
                            console.error(stderr);
                            reject(stderr);
                        }
                    });
                });
            } catch (error) {
                console.error(error);
            }
            if (ipfsLsPinResults != undefined) {
                return ipfsLsPinResults;
            }
        }
        else {
            throw new Error("hash not found in kwargs");
        }
    }



    async ipfsCatPin(kwargs = {}) {
        if ('hash' in kwargs) {
            const hash = kwargs['hash'];
            let ipfsCatPinResults = false;
            try {
                const command = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs cat ${hash}`;
                await new Promise((resolve, reject) => {
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            ipfsCatPinResults = error;
                            console.error(error);
                            reject(error.message);
                        }
                        if (stderr) {
                            ipfsCatPinResults = stderr;
                            console.error(stderr);
                            reject(stderr);
                        }
                        if (stdout) {
                            ipfsCatPinResults = stdout;
                            resolve(stdout);
                        }
                    });
                });
            } catch (error) {
                console.error(error);
            }
            if (ipfsCatPinResults != undefined) {
                return ipfsCatPinResults;
            }
        }
        else {
            throw new Error("hash not found in kwargs");
        }
    }


    async ipfsGetPinset(kwargs = {}) {
        const thisTempFile = path.join(os.tmpdir(), 'temp.txt');
        const ipfsGetPinsetCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs pin ls -s > ${thisTempFile}`;
        await new Promise((resolve, reject) => {
            exec(ipfsGetPinsetCmd, (error, stdout, stderr) => {
                if (error) {
                    reject(error.message);
                } else {
                    resolve(stdout);
                }
            });
        });
        const file_data = fs.readFileSync(thisTempFile, 'utf8');
        const pinset = {};
        const parseResults = file_data.split("\n");
        for (let i = 0; i < parseResults.length; i++) {
            const data = parseResults[i].split(" ");
            if (data.length > 1) {
                pinset[data[0]] = data[1];
            }
        }
        return pinset;
    }

    async ipfsAddPin(pin, kwargs = {}) {
        const dirname = this.thisDir;
        let ipfsAddPinCmd = "";
        let ipfsAddPinResults = null;
        try {
            ipfsAddPinCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs pin add ${pin}`;
            await new Promise((resolve, reject) => {
                exec(ipfsAddPinCmd, (error, stdout, stderr) => {
                    if (error) {
                        ipfsAddPinResults = error.message;
                        console.error(error);
                        reject(error.message);
                    }
                    if (stdout) {
                        ipfsAddPinResults = stdout;
                        resolve(stdout);
                    }
                    if (stderr) {
                        ipfsAddPinResults = stderr;
                        console.error(stderr);
                        reject(stderr);
                    }
                });
            });
        } catch (error) {
            console.error(error);
            ipfsAddPinResults = error;
        }
        return ipfsAddPinResults;
    }

    async ipfsMkdir(srcPath, kwargs = {}) {
        const thisPathSplit = srcPath.split("/");
        let thisPath = "";
        let ipfsMkdirResults = [];

        return new Promise((resolve, reject) => {
            for (let i = 0; i < thisPathSplit.length; i++) {
                try{
                    thisPath += thisPathSplit[i] + "/";
                    const lsPath = this.ipfsLsPath(thisPath, kwargs).then((lsResults) => {
                        if(lsResults == false){
                            const ipfsMkdirCmd = `export IPFS_PATH=${this.ipfsPath} &&  ` + this.pathString + ` ipfs files mkdir ${thisPath}`;
                            exec(ipfsMkdirCmd, (error, stdout, stderr) => {
                                if (error) {
                                    console.error(error);
                                    reject(error.message);
                                }
                                if (stderr) {
                                    console.error(stderr);
                                    reject(stderr);
                                }
                                if(stdout){
                                    ipfsMkdirResults.push(stdout);
                                    resolve(stdout);
                                }
                            });
                        }
                    });
                }
                catch (error) {
                    console.error(error);
                }
            }
        })
    }

    async ipfsGetConfig() {
        const command = this.pathString + ` IPFS_PATH=${this.ipfsPath}` + " ipfs config show";
        try {
            const { stdout } = await execProm(command);
            this.ipfs_config = JSON.parse(stdout);
            return this.ipfs_config;
        } catch (error) {
            console.error("command failed", command, error);
            throw error;
        }
    }

    async ipfsSetConfig(newConfig) {

        if (newConfig == undefined) {
            throw new Error("newConfig not found");
        }
        if (!fs.existsSync(newConfig)) {
            throw new Error("ipfsPath not found");
        }
        const command = this.pathString + ` IPFS_PATH=${this.ipfsPath}` + " ipfs config replace " + newConfig;
        try {
            const { stdout } = await execProm(command);
            this.ipfs_config = JSON.parse(stdout);
            return this.ipfs_config;
        } catch (error) {
            console.error("command failed", command, error);
            throw error;
        }
    }

    async ipfsGetConfigValue(key) {

        if (key == undefined) {
            throw new Error("key not found");
        }

        const command = this.pathString + ` IPFS_PATH=${this.ipfsPath}` + ` ipfs config ${key}`;
        try {
            const stdout = await execProm(command);
            return stdout;
        } catch (error) {
            console.error("command failed", command, error);
            throw new Error("command failed");
        }
    }

    async ipfsSetConfigValue(key, value) {

        if (key == undefined) {
            throw new Error("key not found");
        }
        if (value == undefined) {
            throw new Error("value not found");
        }

        const command = this.pathString + ` IPFS_PATH=${this.ipfsPath}` + ` ipfs config ${key} ${value}`;
        try {
            const stdout  = await execProm(command);
            return stdout;
        } catch (error) {
            console.error("command failed", command, error);
            throw new Error("command failed");
        }
    }

    async ipfsAddPath(srcPath, kwargs = {}) {
        let argstring = "";
        let ls_dir = srcPath;
        let ipfsAddPathCmd = "";
        let ipfsAddPathResults = null;
        if (!fs.existsSync(srcPath)) {
            throw new Error("path not found");
        }
        try{
            if (fs.lstatSync(srcPath).isFile()) {
                await this.ipfsMkdir(path.dirname(srcPath), kwargs);
            } else if (fs.lstatSync(srcPath).isDirectory()) {
                await this.ipfsMkdir(srcPath, kwargs);
            }
            argstring += `--recursive --to-files=${ls_dir} `;
            ipfsAddPathCmd  = `ipfs add ${argstring}${ls_dir}`;
            await new Promise((resolve, reject) => {
                exec(ipfsAddPathCmd, (error, stdout, stderr) => {
                    if (error) {
                        ipfsAddPathResults = error;
                        console.error(error);
                        reject(error.message);
                    }
                    if (stderr) {
                        ipfsAddPathResults = stderr;
                        console.error(stderr);
                        reject(stderr);
                    }
                    if (stdout) {
                        ipfsAddPathResults = stdout;
                        resolve(stdout);
                    }
                });
            });    
        }
        catch (error) {
            console.error(error);
        }
        if (ipfsAddPathResults != null) {
            let ipfsAddPathResultsParts = {};
            let ipfsAddPathResultsSplitParts = {};
            let ipfsAddPathResultsSplit = ipfsAddPathResults.split("\n");
            for (let i = 0; i < ipfsAddPathResultsSplit.length; i++) {
                ipfsAddPathResultsSplitParts = ipfsAddPathResultsSplit[i].split(" ");
                if (ipfsAddPathResultsSplitParts.length > 1) {
                    ipfsAddPathResultsParts[parts[2]] = parts[1];
                }
            }
            return ipfsAddPathResultsParts;
        }
        else{
            return false;
        }
    }


    async ipfsRemovePath(srcPath, kwargs = {}) {
        let result1 = null;
        let result2 = null;
        let ipfsRemovePathResults = null;
        let ipfsRemovePathCmd = "";
        let ipfsRemovePinResults = null;
        let ipfsRemovePinCmd = "";
        const stats = await this.ipfsStatPath(srcPath, kwargs);
        if (Object.keys(stats).length === 0) {
            throw new Error("path not found");
        }
        const pin = stats['pin'];
        if (stats["type"] === "file") {
            try{
                ipfsRemovePathCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs files rm ${srcPath}`;
                await new Promise((resolve, reject) => {
                    exec(ipfsRemovePathCmd, (error, stdout, stderr) => {
                        if (error) {
                            let ipfsRemovePathResults = error.message;
                            reject(error.message);
                        }
                        if (stdout) {
                            ipfsRemovePathResults = stdout;
                            resolve(stdout);
                        }
                        if (stderr) {
                            ipfsRemovePathResults = stderr;
                            reject(stderr);
                        }
                    });
                });
                ipfsRemovePinCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs pin rm ${pin}`;
                await new Promise((resolve, reject) => {
                    exec(ipfsRemovePinCmd, (error, stdout, stderr) => {
                        if (error) {
                            ipfsRemovePinResults = error;
                            reject(error.message);
                        }
                        if (stdout) {
                            ipfsRemovePinResults = stdout;
                            resolve(stdout);
                        }
                        if (stderr) {
                            ipfsRemovePinResults = stderr;
                            reject(stderr);
                        }
                    });
                });
                ipfsRemovePinResults = ipfsRemovePinResults.split("\n");    
            }
            catch (error) {
                console.error(error);
            }
        } else if (stats["type"] === "directory") {
            const contents = await this.ipfsLsPath(path, kwargs);
            for (let i = 0; i < contents.length; i++) {
                if (contents[i].length > 0) {
                    ipfsRemovePinResults = await this.ipfsRemovePath(`${path}/${contents[i]}`, kwargs);
                }
            }
        } else {
            throw new Error("unknown path type");
        }
        const results = {
            "filesRm": ipfsRemovePathResults,
            "pinRm": ipfsRemovePinResults
        };
        return results;
    }

    async ipfsStatPath(srcPath, kwargs = {}) {
        let ipfsStatsPathCmd = "";
        let ipfsStatsPathResults = null;
        try {
            ipfsStatsPathCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs files stat "${srcPath}"`;
            await new Promise((resolve, reject) => {
                exec(ipfsStatsPathCmd, (error, stdout, stderr) => {
                    if (error) {
                        ipfsStatsPathResults = error.message;
                        reject(error.message);
                    } 
                    if (stdout) {
                        ipfsStatsPathResults = stdout;
                        resolve(stdout);
                    }
                    if (stderr) {
                        ipfsStatsPathResults = stderr;
                        reject(stderr);
                    }
                });
            });
            const resultsSplit = ipfsStatsPathResults.split("\n");
            if (resultsSplit.length > 0 && Array.isArray(resultsSplit)) {
                const pin = resultsSplit[0];
                const size = parseFloat(resultsSplit[1].split(": ")[1]);
                const culumulativeSize = parseFloat(resultsSplit[2].split(": ")[1]);
                const childBlocks = parseFloat(resultsSplit[3].split(": ")[1]);
                const type = resultsSplit[4].split(": ")[1];
                const results = {
                    "pin": pin,
                    "size": size,
                    "culumulativeSize": culumulativeSize,
                    "childBlocks": childBlocks,
                    "type": type
                };
                return results;
            } else {
                return false;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    }


    async ipfsNameResolve(srcPath, kwargs = {}) {
        if (typeof srcPath !== 'string') {
            throw new Error("srcPath must be a string");
        }


        let ipfsNameResolveResults = null;
        let ipfsNamePublishCmd = "";
        try {
            ipfsNamePublishCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString +  ` ipfs name resolve "${srcPath}"`;
            await new Promise((resolve, reject) => {
                exec(ipfsNamePublishCmd, (error, stdout, stderr) => {
                    if (error) {
                        ipfsNameResolveResults = error.message;
                        reject(error.message);
                    }
                    if (stdout) {
                        ipfsNameResolveResults = stdout;
                        resolve(stdout);
                    }
                    if (stderr) {
                        ipfsNameResolveResults = stderr;
                        reject(stderr);
                    }
                });
            });
        } catch (error) {
            console.error(error);
        }
        return ipfsNamePublishCmd;
    }

    async ipfsNamePublish(srcIPNS, kwargs = {}) {
        let ipfsNamePublishResults = null;
        let ipfsNamePublishCmd = "";
        let ipfsAddPinCmd = "";
        let ipfsAddPinResults = null;
        try {
            ipfsAddPinCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs add --cid-version 1 ${srcPath}`;
            await new Promise((resolve, reject) => {
                exec(ipfsAddPinCmd, (error, stdout, stderr) => {
                    if (error) {
                        ipfsAddPinResults = error.message;
                        reject(error.message);
                    }
                    if (stdout) {
                        ipfsAddPinResults = stdout;
                        resolve(stdout);
                    }
                    if (stderr) {
                        ipfsAddPinResults = stderr;
                        reject(stderr);
                    }
                });
            });
            ipfsAddPinResults = ipfsAddPinResults.trim();
            const cid = ipfsAddPinResults.split(" ")[1];
            const fname = ipfsAddPinResults.split(" ")[2];
            ipfsAddPinResults = {
                [fname]: cid
            };
        } catch (error) {
            ipfsAddPinResults = error;
        }

        try {
            ipfsNamePublishCmd = `export IPFS_PATH=${this.ipfsPath} &&  ` + this.pathString +  `  ipfs name publish ${Object.keys(ipfsAddPinResults)[0]}`;
            await new Promise((resolve, reject) => {
                exec(ipfsNamePublishCmd, (error, stdout, stderr) => {
                    if (error) {
                        ipfsNamePublishResults = error.message;
                        reject(error.message);
                    }
                    if (stdout) {
                        ipfsNamePublishResults = stdout;
                        resolve(stdout);
                    }
                    if (stderr) {
                        ipfsNamePublishResults = stderr;
                        reject(stderr);
                    }
                });
            });
            ipfsNamePublishResults = ipfsNamePublishResults.split(":")[0].split(" ")[ipfsNamePublishResults.split(":")[0].split(" ").length - 1];
        } catch (error) {
            ipfsNamePublishResults = error;
        }

        const results = {
            "add": ipfsAddPinResults,
            "publish": ipfsNamePublishResults
        };

        return results;
    }


    async ipfsLsPath(srcPath, kwargs = {}) {
        let ipfsLsPathResults = null;
        let ipfsLsPathCmd = "";
        try {
            ipfsLsPathCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs files ls ${srcPath}`;
            await new Promise((resolve, reject) => {
                exec(ipfsLsPathCmd, (error, stdout, stderr) => {
                    if (error) {
                        ipfsLsPathResults = error.message;
                        reject(error.message);
                    }
                    if (stdout) {
                        ipfsLsPathResults = stdout;
                        resolve(stdout);
                    }
                    if (stderr) {
                        ipfsLsPathResults = stderr;
                        reject(stderr);
                    }
                });
            });
            ipfsLsPathResults = ipfsLsPathResults.split("\n");
        } catch (error) {
            ipfsLsPathResults = error;
        }
        if (ipfsLsPathResults != null && ipfsLsPathResults.length > 0 && Array.isArray(ipfsLsPathResults)) {
            return ipfsLsPathResults;
        } else {
            return false;
        }
    }

    async ipfsRemovePin(cid, kwargs = {}) {
        let ipfsRemovePinResults = null;
        let ipfsRemovePinCmd = "";
        let result1 = null;
        let stdout = null;
        let stderr = null;
        try {
            ipfsRemovePinCmd = `export IPFS_PATH=${this.ipfsPath} &&  ` + this.pathString + `  ipfs pin rm ${cid}`;
            ipfsRemovePinResults = await new Promise((resolve, reject) => {
                exec(ipfsRemovePinCmd, (error, stdout, stderr) => {
                    if (error) {
                        ipfsRemovePinResults = error.message;
                        reject(stderr);
                    }
                    if (stdout) {
                        ipfsRemovePinResults = stdout;
                        resolve(stdout);
                    }
                    if (stderr) {
                        ipfsRemovePinResults = stderr;
                        reject(stderr);
                    }
                });
            });
        } catch (error) {
            ipfsRemovePinResults = error;
        }
        if (ipfsRemovePinResults  && ipfsRemovePinResults.includes("unpinned")) {
            ipfsRemovePinResults = true;
        }
        return ipfsRemovePinResults;
    }

    async ipfsExecute(command, kwargs = {}) {
        if (typeof kwargs !== 'object') {
            throw new Error("kwargs must be an object");
        }

        const executable = "ipfs ";
        const options = ["add", "pin", "unpin", "get", "cat", "ls", "refs", "refs-local", "refs-local-recursive", "refs-remote", "refs-remote-recursive", "repo", "version"];
        let execute = "";

        if (command === "add") {
            execute = `${executable}add ${kwargs.file}`;
        }

        if (!kwargs.hash) {
            throw new Error("hash not found in kwargs");
        }

        if (command === "get") {
            execute = `${executable}get ${kwargs.hash} -o ${kwargs.file}`;
        }

        if (command === "pin") {
            execute = `${executable}pin add ${kwargs.hash}`;
        }

        if (command === "unpin") {
            execute = `${executable}pin rm ${kwargs.hash}`;
        }

        if (command === "cat") {
            execute = `${executable}cat ${kwargs.hash}`;
        }

        if (command === "ls") {
            execute = `${executable}ls ${kwargs.hash}`;
        }

        if (command === "refs") {
            execute = `${executable}refs ${kwargs.hash}`;
        }

        if (command === "refs-local") {
            execute = `${executable}refs local ${kwargs.hash}`;
        }

        if (command === "refs-local-recursive") {
            execute = `${executable}refs local --recursive ${kwargs.hash}`;
        }

        if (command === "refs-remote") {
            execute = `${executable}refs remote ${kwargs.hash}`;
        }

        if (command === "refs-remote-recursive") {
            execute = `${executable}refs remote --recursive ${kwargs.hash}`;
        }

        if (command === "repo") {
            execute = `${executable}repo ${kwargs.hash}`;
        }

        if (command === "version") {
            execute = `${executable}version ${kwargs.hash}`;
        }

        try {
            const output = await new Promise((resolve, reject) => {
                exec(execute, (error, stdout, stderr) => {
                    if (error) {
                        reject(error.message);
                    } else {
                        resolve(stdout);
                    }
                });
            });
            console.log(`stdout: ${output}`);
            return output;
        } catch (error) {
            console.log(`error: ${error}`);
            return error;
        }
    }

    async testIpfs() {
        let testCidDownload =  "QmccfbkWLYs9K3yucc6b3eSt8s8fKcyRRt24e3CDaeRhM1";
        testCidDownload = 'bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m'
        testCidDownload = 'QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq'

        let testDownloadPath = "/tmp/test";
        let thisScriptName = path.join(this.thisDir, path.basename(import.meta.url));

        let detect = null;
        try {
            detect = await new Promise((resolve, reject) => {
                let detectCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString +  " which ipfs";
                exec( detectCmd , (error, stdout, stderr) => {
                    if (error) {
                        detect = error.message;
                        console.error(error);
                        reject(error.message);
                    }
                    if (stderr) {
                        detect = stderr;
                        console.error(stderr);
                        reject(stderr);
                    }
                    if (stdout) {
                        detect = stdout;
                        resolve(stdout);
                    }
                });
            });
        } catch (error) {
            detect = error;
        }

        let testDaemonStart = null;   
        try {
            testDaemonStart = await this.daemonStart();
            console.log(testDaemonStart);
        }
        catch (error) {
            testDaemonStart = error;
            console.error(error);
        }

        let testAddPin = null;
        try{
            testAddPin = await this.ipfsAddPin(testCidDownload);
            console.log(testAddPin);
        } catch (error) {
            testAddPin = error;
            console.error(error);
        }

        let testLsPin = null;
        try {
            testLsPin = await this.ipfsLsPin( { "hash": testCidDownload } );
            console.log(testLsPin);
        } catch (error) {
            testLsPin = error;
            console.error(error);
        }


        let testGetPinset = null;
        try {
            testGetPinset = await this.ipfsGetPinset();
            console.log(testGetPinset);
        } catch (error) {
            testGetPinset = error;
            console.error(error);
        }


        let testAddPath = null;
        try {
            testAddPath = await this.ipfsAddPath(thisScriptName);
            console.log(testAddPath);
        } catch (error) {
            testAddPath = error;
            console.error(error);
        }

        let testRemovePath = null;
        try {
            testRemovePath = await this.ipfsRemovePath(thisScriptName);
            console.log(testRemovePath);
        } catch (error) {
            testRemovePath = error;
            console.error(error);
        }

        let testStatPath = null;
        try {
            testStatPath = await this.ipfsStatPath(thisScriptName);
            console.log(testStatPath);
        } catch (error) {
            testStatPath = error;
            console.error(error);
        }

        let testNameResolve = null;
        try {
            testNameResolve = await this.ipfsNameResolve(thisScriptName);
            console.log(testNameResolve);
        } catch (error) {
            testNameResolve = error;
            console.error(error);
        }

        let testNamePublish = null;
        try {
            testNamePublish = await this.ipfsNamePublish(thisScriptName);
            console.log(testNamePublish);
        } catch (error) {
            testNamePublish = error;
            console.error(error);
        }

        let testLsPath = null;
        try {
            testLsPath = await this.ipfsLsPath(thisScriptName);
            console.log(testLsPath);
        } catch (error) {
            testLsPath = error;
            console.error(error);
        }

        let testRemovePin = null;
        try {
            testRemovePin = await this.ipfsRemovePin(testCidDownload);
            console.log(testRemovePin);
        } catch (error) {
            testRemovePin = error;
            console.error(error);
        }

        let testStopDaemon = null;
        try {
            testStopDaemon = await this.daemonStop();
            console.log(testStopDaemon);
        } catch (error) {
            testStopDaemon = error;
            console.error(error);
        }

        let results = {
            "which_ipfs": detect,
            "daemon_start": testDaemonStart,
            "ls_pin": testLsPin,
            "add_pin": testAddPin,
            "get_pinset": testGetPinset,
            "add_path": testAddPath,
            "remove_path": testRemovePath,
            "stat_path": testStatPath,
            "name_resolve": testNameResolve,
            "name_publish": testNamePublish,
            "ls_path": testLsPath,
            "remove_pin": testRemovePin,
            "daemon_stop": testStopDaemon
        };

        return results;
    }

}

// create a test that runs only if the script is run directly, and it is an es Module without require

if (import.meta.url === import.meta.url) {
    const meta = {
        role: "master",
        clusterName: "cloudkit_storage",
        clusterLocation: "/ip4/167.99.96.231/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv",
        secret: "96d5952479d0a2f9fbf55076e5ee04802f15ae5452b5faafc98e2bd48cf564d3",
    };
    // const ipfs_instance = new ipfs(null, meta);
    // const test_ipfs = await ipfs_instance.testIpfs();
    // console.log(test_ipfs);
}