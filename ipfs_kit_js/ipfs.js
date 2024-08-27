import { exec, execSync } from 'child_process';
import fs from 'fs';
import os, { type } from 'os';
import path from 'path';
// import { start } from 'repl';
import { installIpfs } from './install_ipfs.js';
import util from 'util';

const execProm = util.promisify(exec);
const writeFileProm = util.promisify(fs.writeFile);

export class ipfs {
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
        let startDaemonCmdResults = {};
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
                    let stdout = ""
                    let stderr = ""
                    const executeStartDaemonCmd = exec(startDaemonCmd);
                    executeStartDaemonCmd.stdout.on('data', (data) => { 
                        stdout += data;
                    });
                    executeStartDaemonCmd.stderr.on('data', (data) => {
                        stderr += data;
                    });
                    await new Promise(resolve => {
                        executeStartDaemonCmd.on('close', () => {
                            resolve();
                        });
                        executeStartDaemonCmd.stderr.on('data', (data) => {
                            if(data.includes("Error")){
                                console.error(data);
                                startDaemonCmdResults.error = data;
                                resolve();
                            }
                        });
                        executeStartDaemonCmd.on('error', (error) => {
                            console.error(error);
                            startDaemonCmdResults = error;
                            throw new Error(error);
                            resolve();
                        });
                        setTimeout(resolve, 2000);
                    });
                    startDaemonCmdResults.stdout = stdout;
                    startDaemonCmdResults.stderr = stderr;
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
            let ipfsLsPinResults = {  };
            let ipfsLsPinCmd = "";
            try {
                ipfsLsPinCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs ls ${hash}`;
                let ipfsLsPinCmdResults = exec(ipfsLsPinCmd);
                let stdout = ""
                let stderr = ""
                ipfsLsPinCmdResults.stdout.on('data', (data) => {
                    stdout += data;
                });
                ipfsLsPinCmdResults.stderr.on('data', (data) => {
                    stderr += data;
                });
                await new Promise(resolve => {
                    ipfsLsPinCmdResults.on('close', () => {
                        resolve();
                    });
                    ipfsLsPinCmdResults.stderr.on('data', (data) => {
                        if(data.includes("Error")){
                            console.error(data);
                            ipfsLsPinResults.error = data;
                            resolve();
                        }
                    });
                    ipfsLsPinCmdResults.on('error', (error) => {
                        console.error(error);
                        ipfsLsPinResults.error = error;
                        resolve();
                    });
                    setTimeout(resolve, 2000);
                });
                ipfsLsPinResults.stdout = stdout;
                ipfsLsPinResults.stderr = stderr;
            } catch (error) {
                console.error(error);
                ipfsLsPinResults.error = error;
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



    async ipfsMkDirBak(srcPath, kwargs = {}) {
        const thisPathSplit = srcPath.split("/");
        let thisPath = "";
        let ipfsMkdirResults = [];
        let lsPath = [];
        return new Promise((resolve, reject) => {
            for (let i = 0; i < thisPathSplit.length; i++) {
                try{
                    ipfsMkdirResults[i] = {};
                    thisPath += thisPathSplit[i] + "/";
                    lsPath[i] = this.ipfsLsPath(thisPath, kwargs).then((lsResults) => {
                        if(lsResults == false){
                            const ipfsMkdirCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs files mkdir ${thisPath}`;
                            const ipfsMkdirCmdResults = exec(ipfsMkdirCmd);
                            let stdout = ""
                            let stderr = ""
                            ipfsMkdirCmdResults.stdout.on('data', (data) => {
                                stdout += data;
                            });
                            ipfsMkdirCmdResults.stderr.on('data', (data) => {
                                stderr += data;
                            });
                            new Promise(resolve => {
                                ipfsMkdirCmdResults.on('close', () => {
                                    resolve();
                                });
                                ipfsMkdirCmdResults.stderr.on('data', (data) => {
                                    if(data.includes("Error")){
                                        console.error(data);
                                        ipfsMkdirResults.error = data;
                                        throw new Error(data);
                                        resolve();
                                    }
                                });
                                ipfsMkdirCmdResults.on('error', (error) => {
                                    console.error(error);
                                    ipfsMkdirResults[i].error = error;
                                    throw new Error(error);
                                    resolve();
                                });
                                setTimeout(resolve, 2000);
                            });
                            ipfsMkdirResults[i].stdout = stdout;
                            ipfsMkdirResults[i].stderr = stderr;
                        }
                    });
                }
                catch (error) {
                    console.error(error);
                }
            }
            resolve(ipfsMkdirResults);
        })
    }


    async ipfsMkDir(srcPath, kwargs = {}) {
        const thisPathSplit = srcPath.split("/");
        let thisPath = "";
        let ipfsMkdirResults = [];
        let lsPath = [];

        for (let i = 0; i < thisPathSplit.length; i++) {
            thisPath += thisPathSplit[i] + "/";
            lsPath[i] = await this.ipfsLsPath(thisPath, kwargs)
        }
        thisPath = "";
        return new Promise((resolve, reject) => {
            for (let i = 0; i < thisPathSplit.length; i++) {
                try{
                    ipfsMkdirResults[i] = {};
                    thisPath += thisPathSplit[i] + "/";
                    if(lsPath[i] != false && lsPath[i].stderr != ''){
                        const ipfsMkdirCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs files mkdir ${thisPath}`;
                        const ipfsMkdirCmdResults = exec(ipfsMkdirCmd);
                        let stdout = ""
                        let stderr = ""
                        ipfsMkdirCmdResults.stdout.on('data', (data) => {
                            stdout += data;
                        });
                        ipfsMkdirCmdResults.stderr.on('data', (data) => {
                            stderr += data;
                        });
                        new Promise(resolve => {
                            ipfsMkdirCmdResults.on('close', () => {
                                resolve();
                            });
                            ipfsMkdirCmdResults.stderr.on('data', (data) => {
                                if(data.includes("Error")){
                                    console.error(data);
                                    ipfsMkdirResults.error = data;
                                    throw new Error(data);
                                    resolve();
                                }
                            });
                            ipfsMkdirCmdResults.on('error', (error) => {
                                console.error(error);
                                ipfsMkdirResults[i].error = error;
                                throw new Error(error);
                                resolve();
                            });
                            setTimeout(resolve, 2000);
                        });
                        ipfsMkdirResults[i].stdout = stdout;
                        ipfsMkdirResults[i].stderr = stderr;
                    }
                }
                catch (error) {
                    console.error(error);
                }
            }
            resolve(ipfsMkdirResults);
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
            throw new Error("newConfig file is undefined");
        }
        if (!fs.existsSync(newConfig)) {
            throw new Error("newConfig file not found");
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
        let ipfsAddPathResults = {};
        if (!fs.existsSync(srcPath)) {
            throw new Error("path not found");
        }
        try{
            if (fs.lstatSync(srcPath).isFile()) {
                await this.ipfsMkDir(path.dirname(srcPath), kwargs);
            } else if (fs.lstatSync(srcPath).isDirectory()) {
                await this.ipfsMkDir(srcPath, kwargs);
            }
            argstring += `--recursive --to-files=${ls_dir} `;
            ipfsAddPathCmd  = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs add ${argstring}${ls_dir}`;
            let stdout = ""
            let stderr = ""
            let ipfsAddPathCmdResults = exec(ipfsAddPathCmd);

            ipfsAddPathCmdResults.stdout.on('data', (data) => {
                stdout += data;
            });

            ipfsAddPathCmdResults.stderr.on('data', (data) => {
                stderr += data;
            });

            await new Promise(resolve => {
                ipfsAddPathCmdResults.on('close', () => {
                    resolve();
                });
                ipfsAddPathCmdResults.stderr.on('data', (data) => {
                    if(data.includes("Error")){
                        console.error(data);
                        ipfsAddPathResults.error = data;
                        if (data.includes("directory already has entry by that name") === false) {
                            throw new Error(data);
                            resolve();
                        }
                    }
                });
                ipfsAddPathCmdResults.on('error', (error) => {
                    console.error(error);
                    ipfsAddPathResults.error = error;
                    throw new Error(error);
                    resolve();
                });
                setTimeout(resolve, 2000);
            });
            ipfsAddPathResults.stdout = stdout;
            ipfsAddPathResults.stderr = stderr;  
        }
        catch (error) {
            console.error(error);
        }
        if (ipfsAddPathResults.stdout != undefined) {
            let ipfsAddPathResultsParts = {};
            let ipfsAddPathResultsSplit = ipfsAddPathResults.stdout.split("\n");
            for (let i = 0; i < ipfsAddPathResultsSplit.length; i++) {
                let thisSplit = ipfsAddPathResultsSplit[i];
                let ipfsAddPathResultsSplitParts = thisSplit.split(" ");
                if (ipfsAddPathResultsSplitParts.length > 1) {
                    ipfsAddPathResultsParts[ipfsAddPathResultsSplitParts[2]] = ipfsAddPathResultsSplitParts[1];
                }
            }
            ipfsAddPathResults.parts = ipfsAddPathResultsParts;
            return ipfsAddPathResults;
        }
        else{
            return ipfsAddPathResults;
        }
    }


    async ipfsRemovePath(srcPath, kwargs = {}) {
        let ipfsRemovePathResults = {};
        let ipfsRemovePathCmd = "";
        let ipfsRemovePinResults = {};
        let ipfsRemovePinCmd = "";
        let pin = '';
        const stats = await this.ipfsStatPath(srcPath, kwargs);
        if (Object.keys(stats.results).length === 0) {
            console.error("path not found");
            ipfsRemovePathResults.error = "path not found";
        }
        else if (stats.results["type"] === "file") {
            pin = stats.results['pin'];
            try{
                ipfsRemovePathCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs files rm ${srcPath}`;
                let ipfsRemovePathCmdResults = exec(ipfsRemovePathCmd);
                let stdout = ""
                let stderr = ""
                ipfsRemovePathCmdResults.stdout.on('data', (data) => {
                    stdout += data;
                });
                ipfsRemovePathCmdResults.stderr.on('data', (data) => {
                    stderr += data;
                });
                await new Promise(resolve => {
                    ipfsRemovePathCmdResults.on('close', () => {
                        resolve();
                    });
                    ipfsRemovePathCmdResults.stderr.on('data', (data) => {
                        if(data.includes("Error")){
                            console.error(data);
                            ipfsRemovePathResults.error = data;
                            resolve();
                        }
                    });
                    ipfsRemovePathCmdResults.on('error', (error) => {
                        console.error(error);
                        ipfsRemovePathResults.error = error;
                        resolve();
                    });
                    setTimeout(resolve, 2000);
                });
                ipfsRemovePathResults.stdout = stdout;
                ipfsRemovePathResults.stderr = stderr;
            }
            catch (error) {
                console.error(error);
                ipfsRemovePathResults.error = error;
            }
            try{
                ipfsRemovePinCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs pin rm ${pin}`;
                let ipfsRemovePinCmdResults = exec(ipfsRemovePinCmd);
                let stdout = ""
                let stderr = ""

                ipfsRemovePinCmdResults.stdout.on('data', (data) => {
                    stdout += data;
                });
                ipfsRemovePinCmdResults.stderr.on('data', (data) => {
                    stderr += data;
                });

                await new Promise(resolve => {
                    ipfsRemovePinCmdResults.on('close', () => {
                        resolve();
                    });

                    ipfsRemovePinCmdResults.stderr.on('data', (data) => {
                        if(data.includes("Error")){
                            console.error(data);
                            ipfsRemovePinResults.error = data;
                            resolve();
                        }
                    });

                    ipfsRemovePinCmdResults.on('error', (error) => {
                        console.error(error);
                        ipfsRemovePinResults.error = error;
                        resolve();
                    });

                    setTimeout(resolve, 2000);
                });

                ipfsRemovePinResults.stdout = stdout.split("\n");
                ipfsRemovePinResults.stderr = stderr;
               
            }
            catch (error) {
                ipfsRemovePinResults.error = error;
                console.error(error);
            }
        } else if (stats.results["type"] === "directory") {
            pin = stats.results['pin'];
            const contents = await this.ipfsLsPath(path, kwargs);
            for (let i = 0; i < contents.stdout.length; i++) {
                if (contents[i].length > 0) {
                    ipfsRemovePinResults = await this.ipfsRemovePath(`${path}/${contents[i]}`, kwargs);
                }
            }
        } else {
            console.error("unknown path type");
            ipfsRemovePinResults.error = "unknown path type";
        }
        const results = {
            "filesRm": ipfsRemovePathResults,
            "pinRm": ipfsRemovePinResults
        };
        return results;
    }

    async ipfsStatPath(srcPath, kwargs = {}) {
        let ipfsStatsPathCmd = "";
        let ipfsStatsPathResults = {};
        try {
            ipfsStatsPathCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs files stat ${srcPath}`;
            let ipfsStatsPathCmdResults = exec(ipfsStatsPathCmd);
            let stdout = ""
            let stderr = ""

            ipfsStatsPathCmdResults.stdout.on('data', (data) => {
                stdout += data;
            });

            ipfsStatsPathCmdResults.stderr.on('data', (data) => {
                stderr += data;
            });

            await new Promise(resolve => {
                ipfsStatsPathCmdResults.on('close', () => {
                    resolve();
                });
                ipfsStatsPathCmdResults.stderr.on('data', (data) => {
                    if(data.includes("Error")){
                        console.error(data);
                        ipfsStatsPathResults.error = data;
                        resolve();
                    }
                });
                ipfsStatsPathCmdResults.on('error', (error) => {
                    console.error(error);
                    ipfsStatsPathResults.error = error;
                    resolve();
                });
                setTimeout(resolve, 2000);
            });

            ipfsStatsPathResults.stderr = stderr;
            ipfsStatsPathResults.stdout = stdout;

        } catch (error) {
            console.error(error);
            ipfsStatsPathResults.error = error;
        }

        try {  
            const resultsSplit = ipfsStatsPathResults.stdout.split("\n");
            if (resultsSplit.length > 5 && Array.isArray(resultsSplit)) {
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
                ipfsStatsPathResults.results = results;     
            }
            else{
                ipfsStatsPathResults.results = {};
            }
        } catch (error) {
            console.error(error);
            ipfsStatsPathResults.error = error;
        }
        return ipfsStatsPathResults;
    }

    async ipfsNameResolve(srcPath, kwargs = {}) {
        if (typeof srcPath !== 'string') {
            throw new Error("srcPath must be a string");
        }
        let ipfsNameResolveResults = {};
        let ipfsNamePublishCmd = "";
        try {
            ipfsNamePublishCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString +  ` ipfs name resolve "${srcPath}"`;
            let ipfsNamePublishCmdResults = exec(ipfsNamePublishCmd);

            let stdout = ""
            let stderr = ""
            
            ipfsNamePublishCmdResults.stdout.on('data', (data) => {
                stdout += data;
            });
            ipfsNamePublishCmdResults.stderr.on('data', (data) => {
                stderr += data;
            });

            await new Promise(resolve => {
                ipfsNamePublishCmdResults.on('close', () => {
                    resolve();
                });
                ipfsNamePublishCmdResults.stderr.on('data', (data) => {
                    if(data.includes("Error")){
                        console.error(data);
                        ipfsNameResolveResults.error = data;
                        resolve();
                    }
                });
                ipfsNamePublishCmdResults.on('error', (error) => {
                    console.error(error);
                    ipfsNameResolveResults.error = error;
                    resolve();
                });
                setTimeout(resolve, 2000);
            });

            ipfsNameResolveResults.stdout = stdout;
            ipfsNameResolveResults.stderr = stderr;
        } catch (error) {
            console.error(error);
            ipfsNameResolveResults.error = error;
        }
        return ipfsNameResolveResults;
    }

    async ipfsNamePublish(srcIPNS, kwargs = {}) {
        let ipfsNamePublishResults = {};
        let ipfsNamePublishCmd = "";
        let ipfsAddPinCmd = "";
        let ipfsAddPinResults = {};
        try {
            ipfsAddPinCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs add --cid-version 1 ${srcPath}`;
            let ipfsAddPinCmdResults = exec(ipfsAddPinCmd);
            let stdout = ""
            let stderr = ""
            ipfsAddPinCmdResults.stdout.on('data', (data) => {
                stdout += data;
            });
            ipfsAddPinCmdResults.stderr.on('data', (data) => {
                stderr += data;
            });

            await new Promise(resolve => {
                ipfsAddPinCmdResults.on('close', () => {
                    resolve();
                });

                ipfsAddPinCmdResults.stderr.on('data', (data) => {
                    if(data.includes("Error")){
                        console.error(data);
                        ipfsAddPinResults.error = data;
                        resolve();
                    }
                });

                ipfsAddPinCmdResults.on('error', (error) => {
                    console.error(error);
                    ipfsAddPinResults.error = error;
                    resolve();
                });

                setTimeout(resolve, 2000);
            });

            ipfsAddPinResults.stdout = stdout.trim();
            ipfsAddPinResults.stderr = stderr;
        } catch (error) {
            console.error(error);
            ipfsAddPinResults.error = error;
        }
        try{
            const cid = ipfsAddPinResults.stdout.split(" ")[1];
            const fname = ipfsAddPinResults.stdout.split(" ")[2];
            ipfsAddPinResults.results = {
                [fname]: cid
            };
        } catch (error) {
            console.log(error);
            ipfsAddPinResults.error = error;
        }

        try {
            ipfsNamePublishCmd = `export IPFS_PATH=${this.ipfsPath} &&  ` + this.pathString +  `  ipfs name publish ${Object.keys(ipfsAddPinResults)[0]}`;
            let ipfsNamePublishCmdResults = exec(ipfsNamePublishCmd);
            let stdout = ""
            let stderr = ""

            ipfsNamePublishCmdResults.stdout.on('data', (data) => {
                stdout += data;
            });

            ipfsNamePublishCmdResults.stderr.on('data', (data) => {
                stderr += data;
            });

            await new Promise(resolve => {
                ipfsNamePublishCmdResults.on('close', () => {
                    resolve();
                });
                ipfsNamePublishCmdResults.stderr.on('data', (data) => {
                    if(data.includes("Error")){
                        console.error(data);
                        ipfsNamePublishResults.error = data;
                        resolve();
                    }
                });
                ipfsNamePublishCmdResults.on('error', (error) => {
                    console.error(error);
                    ipfsNamePublishResults.error = error;
                    resolve();
                });
                setTimeout(resolve, 2000);
            });

            ipfsNamePublishResults.stdout = stdout;
            ipfsNamePublishResults.stderr = stderr;
        } catch (error) {
            console.error(error);
            ipfsNamePublishResults.error = error;
        }
        if (ipfsNamePublishResults.stdout != '') {
            ipfsNamePublishResults.results = ipfsNamePublishResults.stdout.split(":")[0].split(" ")[ipfsNamePublishResults.split(":")[0].split(" ").length - 1];
        }
        else{
            ipfsNamePublishResults.results = ipfsNamePublishResults.stderr;
        }
        const results = {
            "add": ipfsAddPinResults,
            "publish": ipfsNamePublishResults
        };
        return results;
    }


    async ipfsLsPath(srcPath, kwargs = {}) {
        let ipfsLsPathResults = {};
        let ipfsLsPathCmd = "";
        ipfsLsPathCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs files ls ${srcPath}`;
        try {
            let ipfsLSPathCmdResults = exec(ipfsLsPathCmd);
            let stdout = ""
            let stderr = ""
            ipfsLSPathCmdResults.stdout.on('data', (data) => {
                stdout += data;
            });
            ipfsLSPathCmdResults.stderr.on('data', (data) => {
                stderr += data;
            });
            await new Promise(resolve => {
                ipfsLSPathCmdResults.on('close', () => {
                    resolve();
                });
                ipfsLSPathCmdResults.stderr.on('data', (data) => {
                    if(data.includes("Error")){
                        console.error(data);
                        ipfsLsPathResults.error = data;
                        resolve();
                    }
                });
                ipfsLSPathCmdResults.on('error', (error) => {
                    console.error(error);
                    ipfsLsPathResults.error = error;
                    resolve();
                });
                setTimeout(resolve, 2000);
            });
            ipfsLsPathResults.stdout = stdout;
            ipfsLsPathResults.stderr = stderr;
        } catch (error) {
            ipfsLsPathResults.error = error;
        }
        if (ipfsLsPathResults != null && ipfsLsPathResults.stdout.length > 0) {
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

}

export default ipfs;