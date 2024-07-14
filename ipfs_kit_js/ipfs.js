import { exec, execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { start } from 'repl';
import { InstallIPFS } from './install_ipfs.js';

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
                if (!['master', 'worker', 'leecher'].includes(this.role)) {
                    throw new Error('role is not either master, worker, leecher');
                } else {
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
        //     this.installIpfs = new InstallIPFS();
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
        let cluster_name;
        if ('cluster_name' in this) {
            cluster_name = this.cluster_name;
        }
        if ('cluster_name' in kwargs) {
            cluster_name = kwargs['cluster_name'];
        }
        let homedir_files = fs.readdirSync(os.homedir());
        let ipfsPathFiles = [];
        if (fs.existsSync(this.ipfsPath)) {
            ipfsPathFiles = fs.readdirSync(this.ipfsPath);
        }
        if (!fs.existsSync(this.ipfsPath) ){
            ipfsPathFiles = []
            this.installIpfs = new InstallIPFS(this.resources, this.meta);
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

        let start_daemon_systemctl_results = null;
        let start_daemon_cmd_results = false;
        let ipfs_ready = false;

        // Run this if root and check if it passes 
        if (os.userInfo().uid === 0) {
            try {
                const start_daemon_systemctl = "systemctl start ipfs";
                exec(start_daemon_systemctl, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`Error starting ipfs: ${error.message}`);
                        start_daemon_systemctl_results = error.message;
                    } else {
                        start_daemon_systemctl_results = stdout;
                        const check_daemon_cmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | wc -l";
                        exec(check_daemon_cmd, (error, stdout, stderr) => {
                            if (!error && parseInt(stdout.trim()) > 0) {
                                ipfs_ready = true;
                            }
                        });
                    }
                });
            } catch (error) {
                start_daemon_systemctl_results = error.message;
            }
        }

        // Run this if user is not root or root user fails check if it passes
        if (os.userInfo().uid !== 0 || ipfs_ready === false) {
            try {
                const start_daemon_cmd = `export IPFS_PATH=${path.resolve(path.join(this.ipfsPath))} &&  ` + this.pathString   + ` ipfs daemon --enable-gc --enable-pubsub-experiment`;
                //const execute2 = execSync(command2);
                const execute_start_daemon_cmd = exec(start_daemon_cmd, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`Error starting ipfs: ${error.message}`);
                        start_daemon_cmd_results = error.message;
                    }
                    if (stdout) {
                        start_daemon_cmd_results = stdout;
                    }
                });
                // add a sleep here to wait for the daemon to start
                let milliseconds = 2000;
                let start = new Date().getTime();
                while (start_daemon_cmd_results == false) {
                    if ((new Date().getTime() - start) > milliseconds) {
                        break;
                    }
                }

                return new Promise((resolve, reject) => {
                    const check_daemon_cmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | wc -l";
                    exec(check_daemon_cmd, (error, stdout, stderr) => {
                        let len_stdout = parseInt(stdout.trim());
                        if (!error && len_stdout > 0) {
                            ipfs_ready = true;
                        }
                        else {
                            // handle error
                        }
                        const results = {
                            "systemctl": start_daemon_systemctl_results,
                            "bash": start_daemon_cmd_results,
                            "ipfs_ready": ipfs_ready,
                        };
                        resolve(results);
                    });
                });
            } catch (error) {
                console.log(`Error starting ipfs: ${error.message}`);
                start_daemon_cmd_results = error.message;
            }
        }


    }

    async daemonStop(kwargs = {}) {
        let cluster_name;
        if ('cluster_name' in this) {
            cluster_name = this.cluster_name;
        }
        if ('cluster_name' in kwargs) {
            cluster_name = kwargs['cluster_name'];
        }
        let ipfs_stop_systemctl_results = null;
        let ipfs_stop_cmd_results = null;
        let ipfs_stop_cmd = null;
        let ipfs_stop_systemctl = null;
        let ipfs_ready = false;

        // Run this if root and check if it passes 
        if (os.userInfo().uid === 0) {
            try {
                ipfs_stop_systemctl = "systemctl stop ipfs";
                exec(ipfs_stop_systemctl, (error, stdout, stderr) => {
                    if (error) {
                        ipfs_stop_systemctl_results = error.message;
                    } else {
                        ipfs_stop_systemctl_results = stdout;

                        let ps_daemon_cmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | wc -l";
                        exec(ps_daemon_cmd, (error, stdout, stderr) => {
                            if (!error && parseInt(stdout.trim()) === 0) {
                                ipfs_ready = true;
                            }
                        });
                    }
                });
            } catch (error) {
                ipfs_stop_systemctl = error;
            }
        }

        // Run this if user is not root or root user fails check if it passes
        if (os.userInfo().uid !== 0 || ipfs_ready === false) {
            try {
                let ps_daemon_cmd_results = null;
                let ps_daemon_cmd = "ps -ef | grep ipfs | grep daemon | grep -v grep | awk '{print $2}'";
                exec(ps_daemon_cmd, (error, stdout, stderr) => {
                    if (error) {
                        ps_daemon_cmd_results  = error.message;
                    }
                    if (stdout) {
                        ps_daemon_cmd_results = stdout;
                    }
                    if (stderr) {
                        ps_daemon_cmd_results = stderr;
                    }
                });
            } catch (error) {
                ps_daemon_cmd_results = error;
            }

            if (parseInt(ps_daemon_cmd_results) > 0) {
                try {
                    ipfs_stop_cmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs shutdown`;
                    exec(ipfs_stop_cmd, (error, stdout, stderr) => {
                        if (error) {
                            ipfs_stop_cmd_results = error.message;
                        } else {
                            ipfs_stop_cmd_results = stdout;
                        }
                    });
                } catch (error) {
                    ipfs_stop_cmd_results = error;
                }
            }
            else {
                ipfs_stop_cmd_results = "No ipfs daemon running";
            }    
        }

        const results = {
            "systemctl": ipfs_stop_systemctl,
            "bash": ps_daemon_cmd_results
        };

        return results;
    }


    async ipfsResize(size, kwargs = {}) {
        const stop_daemon_results = await this.daemon_stop();
        const resize_daemon_cmd = this.pathString + ` ipfs config --json Datastore.StorageMax ${size}GB`;
        let resize_daemon_cmd_results = null;
        await new Promise((resolve, reject) => {
            exec(resize_daemon_cmd, (error, stdout, stderr) => {
                if (error) {
                    resize_daemon_cmd_results = error.message;
                    reject(error.message);
                }
                if (stdout) {
                    resize_daemon_cmd_results = stdout;
                    resolve(stdout);
                }
                if (stderr) {
                    resize_daemon_cmd_results = stderr;
                    reject(stderr);
                }
            });
        });
        const start_daemon_cmd = await this.daemonStart();
        return resize_daemon_cmd_results;
    }

    async ipfsLsPin(kwargs = {}) {
        if ('hash' in kwargs) {
            const hash = kwargs['hash'];
            let request1 = false;
            try {
                const command = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs ls ${hash}`;
                request1 = await new Promise((resolve, reject) => {
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            reject(error.message);
                        } else {
                            resolve(stdout);
                        }
                    });
                });
            } catch (error) {
                console.error(error);
            }
            if (request1 != undefined) {
                return request1;
            }
        }
        else {
            throw new Error("hash not found in kwargs");
        }
    }



    async ipfsCatPin(kwargs = {}) {
        if ('hash' in kwargs) {
            const hash = kwargs['hash'];
            let request1 = false;
            try {
                const command = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs cat ${hash}`;
                request1 = await new Promise((resolve, reject) => {
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            reject(error.message);
                        } else {
                            resolve(stdout);
                        }
                    });
                });
            } catch (error) {
                console.error(error);
            }
            if (request1 != undefined) {
                return request1;
            }
        }
        else {
            throw new Error("hash not found in kwargs");
        }
    }


    async ipfsGetPinset(kwargs = {}) {
        const this_tempfile = path.join(os.tmpdir(), 'temp.txt');
        const command = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs pin ls -s > ${this_tempfile}`;
        await new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error.message);
                } else {
                    resolve(stdout);
                }
            });
        });
        const file_data = fs.readFileSync(this_tempfile, 'utf8');
        const pinset = {};
        const parse_results = file_data.split("\n");
        for (let i = 0; i < parse_results.length; i++) {
            const data = parse_results[i].split(" ");
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
        } catch (error) {
            console.error(error);
            ipfsAddPinResults = error;
        }
        return ipfsAddPinResults;
    }

    async ipfsMkdir(src_path, kwargs = {}) {
        const this_path_split = src_path.split("/");
        let this_path = "";
        let  results = [];

        return new Promise((resolve, reject) => {
            for (let i = 0; i < this_path_split.length; i++) {
                try{
                    this_path += this_path_split[i] + "/";
                    const ipfsMkdirCmd = `export IPFS_PATH=${this.ipfsPath} &&  ` + this.pathString + ` ipfs files mkdir ${this_path}`;
                    exec(ipfsMkdirCmd, (error, stdout, stderr) => {
                        if (error) {
                            reject(error.message);
                        }
                        if(stdout){
                            results.push(stdout);
                            resolve(stdout);
                        }
                    });
                }
                catch (error) {
                    console.error(error);
                }
            }
        })
    }

    async ipfsAddPath(src_path, kwargs = {}) {
        let argstring = "";
        let ls_dir = src_path;
        let ipfsAddPathCmd = "";
        let ipfsAddPathResults = null;
        if (!fs.existsSync(src_path)) {
            throw new Error("path not found");
        }
        try{
            if (fs.lstatSync(src_path).isFile()) {
                await this.ipfsMkdir(path.dirname(src_path), kwargs);
            } else if (fs.lstatSync(src_path).isDirectory()) {
                await this.ipfsMkdir(src_path, kwargs);
            }
            argstring += `--recursive --to-files=${ls_dir} `;
            ipfsAddPathCmd  = `ipfs add ${argstring}${ls_dir}`;
            await new Promise((resolve, reject) => {
                exec(ipfsAddPathCmd, (error, stdout, stderr) => {
                    if (error) {
                        ipfsAddPathResults = error.message;
                        // reject(error.message);
                    } else {
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
            const results = {};
            const result_split = ipfsAddPathResults.split("\n");
            for (let i = 0; i < result_split.length; i++) {
                const parts = result_split[i].split(" ");
                if (parts.length > 1) {
                    results[parts[2]] = parts[1];
                }
            }
            return results;
        }
        else{
            return false;
        }
    }


    async ipfsRemovePath(src_path, kwargs = {}) {
        let result1 = null;
        let result2 = null;
        let ipfsRemovePathResults = null;
        let ipfsRemovePathCmd = "";
        let ipfsRemovePinResults = null;
        let ipfsRemovePinCmd = "";
        const stats = await this.ipfsStatPath(src_path, kwargs);
        if (Object.keys(stats).length === 0) {
            throw new Error("path not found");
        }
        const pin = stats['pin'];
        if (stats["type"] === "file") {
            try{
                ipfsRemovePathCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs files rm ${src_path}`;
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
            "files_rm": ipfsRemovePathResults,
            "pin_rm": ipfsRemovePinResults
        };
        return results;
    }

    async ipfsStatPath(src_path, kwargs = {}) {
        let ipfsStatsPathCmd = "";
        let ipfsStatsPathResults = null;
        try {
            ipfsStatsPathCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs files stat "${src_path}"`;
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
                const culumulative_size = parseFloat(resultsSplit[2].split(": ")[1]);
                const child_blocks = parseFloat(resultsSplit[3].split(": ")[1]);
                const type = resultsSplit[4].split(": ")[1];
                const results = {
                    "pin": pin,
                    "size": size,
                    "culumulative_size": culumulative_size,
                    "child_blocks": child_blocks,
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


    async ipfsNameResolve(src_path, kwargs = {}) {
        let ipfsNameResolveResults = null;
        let ipfsNamePublishCmd = "";
        try {
            ipfsNamePublishCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString +  ` ipfs name resolve "${src_path}"`;
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

    async ipfsNamePublish(src_path, kwargs = {}) {
        if (!fs.existsSync(src_path)) {
            throw new Error("path not found");
        }
        let ipfsNamePublishResults = null;
        let ipfsNamePublishCmd = "";
        let ipfsAddPinCmd = "";
        let ipfsAddPinResults = null;
        try {
            ipfsAddPinCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs add --cid-version 1 ${src_path}`;
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


    async ipfsLsPath(src_path, kwargs = {}) {
        let ipfsLsPathResults = null;
        let ipfsLsPathCmd = "";
        try {
            ipfsLsPathCmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs files ls ${src_path}`;
            await new Promise((resolve, reject) => {
                exec(stat1, (error, stdout, stderr) => {
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
        let test_cid_download =  "QmccfbkWLYs9K3yucc6b3eSt8s8fKcyRRt24e3CDaeRhM1";
        test_cid_download = 'bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m'
        test_cid_download = 'QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq'

        let test_download_path = "/tmp/test";
        let this_script_name = path.join(this.thisDir, path.basename(import.meta.url));

        let detect = null;
        try {
            detect = await new Promise((resolve, reject) => {
                let detect_cmd = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString +  " which ipfs";
                exec( detect_cmd , (error, stdout, stderr) => {
                    if (error) {
                        reject(error.message);
                    } else {
                        resolve(stdout);
                    }
                });
            });
        } catch (error) {
            detect = error;
        }

        let test_daemon_start = null;   
        try {
            test_daemon_start = await this.daemonStart();
            console.log(test_daemon_start);
        }
        catch (error) {
            test_daemon_start = error;
            console.error(error);
        }

        let test_add_pin = null;
        try{
            test_add_pin = await this.ipfsAddPin(test_cid_download);
            console.log(test_add_pin);
        } catch (error) {
            test_add_pin = error;
            console.error(error);
        }

        let test_ls_pin = null;
        try {
            test_ls_pin = await this.ipfsLsPin( { "hash": test_cid_download } );
            console.log(test_ls_pin);
        } catch (error) {
            test_ls_pin = error;
            console.error(error);
        }


        let test_get_pinset = null;
        try {
            test_get_pinset = await this.ipfsGetPinset();
            console.log(test_get_pinset);
        } catch (error) {
            test_get_pinset = error;
            console.error(error);
        }


        let test_add_path = null;
        try {
            test_add_path = await this.ipfsAddPath(this_script_name);
            console.log(test_add_path);
        } catch (error) {
            test_add_path = error;
            console.error(error);
        }

        let test_remove_path = null;
        try {
            test_remove_path = await this.ipfsRemovePath(this_script_name);
            console.log(test_remove_path);
        } catch (error) {
            test_remove_path = error;
            console.error(error);
        }

        let test_stat_path = null;
        try {
            test_stat_path = await this.ipfsStatPath(this_script_name);
            console.log(test_stat_path);
        } catch (error) {
            test_stat_path = error;
            console.error(error);
        }

        let test_name_resolve = null;
        try {
            test_name_resolve = await this.ipfsNameResolve(this_script_name);
            console.log(test_name_resolve);
        } catch (error) {
            test_name_resolve = error;
            console.error(error);
        }

        let test_name_publish = null;
        try {
            test_name_publish = await this.ipfsNamePublish(this_script_name);
            console.log(test_name_publish);
        } catch (error) {
            test_name_publish = error;
            console.error(error);
        }

        let test_ls_path = null;
        try {
            test_ls_path = await this.ipfsLsPath(this_script_name);
            console.log(test_ls_path);
        } catch (error) {
            test_ls_path = error;
            console.error(error);
        }

        let test_remove_pin = null;
        try {
            test_remove_pin = await this.ipfsRemovePin(test_cid_download);
            console.log(test_remove_pin);
        } catch (error) {
            test_remove_pin = error;
            console.error(error);
        }

        let test_stop_daemon = null;
        try {
            test_stop_daemon = await this.daemonStop();
            console.log(test_stop_daemon);
        } catch (error) {
            test_stop_daemon = error;
            console.error(error);
        }

        let results = {
            "which_ipfs": detect,
            "daemon_start": test_daemon_start,
            "ls_pin": test_ls_pin,
            "add_pin": test_add_pin,
            "get_pinset": test_get_pinset,
            "add_path": test_add_path,
            "remove_path": test_remove_path,
            "stat_path": test_stat_path,
            "name_resolve": test_name_resolve,
            "name_publish": test_name_publish,
            "ls_path": test_ls_path,
            "remove_pin": test_remove_pin,
            "daemon_stop": test_stop_daemon
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
    const ipfs_instance = new ipfs(null, meta);
    const test_ipfs = await ipfs_instance.testIpfs();
    console.log(test_ipfs);
}