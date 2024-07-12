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
            if (Object.keys(meta).includes('cluster_name') && meta['cluster_name'] !== null) {
                this.cluster_name = meta['cluster_name'];
            }
            if (Object.keys(meta).includes('ipfs_path') && meta['ipfs_path'] !== null) {
                this.ipfsPath = meta['ipfs_path'];
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

        let results1 = null;
        let results2 = null;
        let ipfs_ready = false;

        // Run this if root and check if it passes 
        if (os.userInfo().uid === 0) {
            try {
                const command1 = "systemctl stop ipfs";
                exec(command1, (error, stdout, stderr) => {
                    if (error) {
                        results1 = error.message;
                    } else {
                        results1 = stdout;

                        const command2 = "ps -ef | grep ipfs | grep daemon | grep -v grep | wc -l";
                        exec(command2, (error, stdout, stderr) => {
                            if (!error && parseInt(stdout.trim()) === 0) {
                                ipfs_ready = true;
                            }
                        });
                    }
                });
            } catch (error) {
                results1 = error.message;
            }
        }

        // Run this if user is not root or root user fails check if it passes
        if (os.userInfo().uid !== 0 || ipfs_ready === false) {
            try {
                const command2 = "ps -ef | grep ipfs | grep daemon | grep -v grep | awk '{print $2}' | xargs kill -9";
                exec(command2, (error, stdout, stderr) => {
                    if (error) {
                        results2 = error.message;
                    } else {
                        results2 = stdout;
                    }
                });
            } catch (error) {
                results2 = error.message;
            }
        }

        const results = {
            "systemctl": results1,
            "bash": results2
        };

        return results;
    }


    async ipfsResize(size, kwargs = {}) {
        const command1 = this.daemon_stop();
        const command2 = this.pathString + ` ipfs config --json Datastore.StorageMax ${size}GB`;
        const results1 = await new Promise((resolve, reject) => {
            exec(command2, (error, stdout, stderr) => {
                if (error) {
                    reject(error.message);
                } else {
                    resolve(stdout);
                }
            });
        });
        const command3 = this.daemonStart();
        return results1;
    }

    async ipfsLsPin(kwargs = {}) {
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
        let result1;
        try {
            const command1 = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs pin add ${pin}`;
            result1 = await new Promise((resolve, reject) => {
                exec(command1, (error, stdout, stderr) => {
                    if (error) {
                        reject(error.message);
                    } else {
                        resolve(stdout);
                    }
                });
            });
        } catch (error) {
            result1 = error;
        }
        return result1;
    }

    async ipfsMkdir(path, kwargs = {}) {
        const this_path_split = path.split("/");
        let this_path = "";
        const results = [];
        for (let i = 0; i < this_path_split.length; i++) {
            this_path += this_path_split[i] + "/";
            const command1 = `export IPFS_PATH=${this.ipfsPath} &&  ` + this.pathString + ` ipfs files mkdir ${this_path}`;
            const result1 = await new Promise((resolve, reject) => {
                exec(command1, (error, stdout, stderr) => {
                    if (error) {
                        reject(error.message);
                    } else {
                        resolve(stdout);
                    }
                });
            });
            results.push(result1);
        }
        return results;
    }


    async ipfsAddPath2(path, kwargs = {}) {
        let ls_dir = [];
        if (!fs.existsSync(path)) {
            throw new Error("path not found");
        }
        if (fs.lstatSync(path).isFile()) {
            ls_dir = [path];
            await this.ipfsMkdir(path.dirname(path), kwargs);
		} else if (fs.lstatSync(path).isDirectory()) {
            await this.ipfsMkdir(path, kwargs);
            ls_dir = fs.readdirSync(path).map(file => path.join(path, file));
        }
        const results1 = [];
        for (let i = 0; i < ls_dir.length; i++) {
            let argstring = ` --to-files=${ls_dir[i]} `;
            const command1 = this.pathString + ` ipfs add ${argstring}${ls_dir[i]}`;
            const result1 = await new Promise((resolve, reject) => {
                exec(command1, (error, stdout, stderr) => {
                    if (error) {
                        reject(error.message);
                    } else {
                        resolve(stdout);
                    }
                });
            });
            results1.push(result1);
        }
        return results1;
    }

    async ipfsAddPath(path, kwargs = {}) {
        let argstring = "";
        let ls_dir = path;
        if (!fs.existsSync(path)) {
            throw new Error("path not found");
        }
        if (fs.lstatSync(path).isFile()) {
            await this.ipfsMkdir(path.dirname(path), kwargs);
        } else if (fs.lstatSync(path).isDirectory()) {
            await this.ipfsMkdir(path, kwargs);
        }
        argstring += `--recursive --to-files=${ls_dir} `;
        const command1 = `ipfs add ${argstring}${ls_dir}`;
        const result1 = await new Promise((resolve, reject) => {
            exec(command1, (error, stdout, stderr) => {
                if (error) {
                    reject(error.message);
                } else {
                    resolve(stdout);
                }
            });
        });
        const results = {};
        const result_split = result1.split("\n");
        for (let i = 0; i < result_split.length; i++) {
            const parts = result_split[i].split(" ");
            if (parts.length > 1) {
                results[parts[2]] = parts[1];
            }
        }
        return results;
    }


    async ipfsRemovePath(path, kwargs = {}) {
        let result1 = null;
        let result2 = null;
        const stats = await this.ipfsStatPath(path, kwargs);
        if (Object.keys(stats).length === 0) {
            throw new Error("path not found");
        }
        const pin = stats['pin'];
        if (stats["type"] === "file") {
            const command1 = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs files rm ${path}`;
            result1 = await new Promise((resolve, reject) => {
                exec(command1, (error, stdout, stderr) => {
                    if (error) {
                        reject(error.message);
                    } else {
                        resolve(stdout);
                    }
                });
            });
            const command2 = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs pin rm ${pin}`;
            result2 = await new Promise((resolve, reject) => {
                exec(command2, (error, stdout, stderr) => {
                    if (error) {
                        reject(error.message);
                    } else {
                        resolve(stdout);
                    }
                });
            });
            result2 = result2.split("\n");
        } else if (stats["type"] === "directory") {
            const contents = await this.ipfs_ls_path(path, kwargs);
            for (let i = 0; i < contents.length; i++) {
                if (contents[i].length > 0) {
                    result1 = await this.ipfs_remove_path(`${path}/${contents[i]}`, kwargs);
                }
            }
        } else {
            throw new Error("unknown path type");
        }
        const results = {
            "files_rm": result1,
            "pin_rm": result2
        };
        return results;
    }

    async ipfsStatPath(path, kwargs = {}) {
        try {
            const stat1 = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs files stat ${path}`;
            const results1 = await new Promise((resolve, reject) => {
                exec(stat1, (error, stdout, stderr) => {
                    if (error) {
                        reject(error.message);
                    } else {
                        resolve(stdout);
                    }
                });
            });
            const results1Split = results1.split("\n");
            if (results1Split.length > 0 && Array.isArray(results1Split)) {
                const pin = results1Split[0];
                const size = parseFloat(results1Split[1].split(": ")[1]);
                const culumulative_size = parseFloat(results1Split[2].split(": ")[1]);
                const child_blocks = parseFloat(results1Split[3].split(": ")[1]);
                const type = results1Split[4].split(": ")[1];
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
            console.error(error.message);
            return false;
        }
    }


    async ipfsNameResolve(kwargs = {}) {
        let result1 = null;
        try {
            const command1 = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString +  ` ipfs name resolve ${kwargs['path']}`;
            result1 = await new Promise((resolve, reject) => {
                exec(command1, (error, stdout, stderr) => {
                    if (error) {
                        reject(error.message);
                    } else {
                        resolve(stdout);
                    }
                });
            });
        } catch (error) {
            result1 = error.message;
        }
        return result1;
    }

    async ipfsNamePublish(path, kwargs = {}) {
        if (!fs.existsSync(path)) {
            throw new Error("path not found");
        }
        let results1 = null;
        let results2 = null;
        try {
            const command1 = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs add --cid-version 1 ${path}`;
            results1 = await new Promise((resolve, reject) => {
                exec(command1, (error, stdout, stderr) => {
                    if (error) {
                        reject(error.message);
                    } else {
                        resolve(stdout);
                    }
                });
            });
            results1 = results1.trim();
            const cid = results1.split(" ")[1];
            const fname = results1.split(" ")[2];
            results1 = {
                [fname]: cid
            };
        } catch (error) {
            results1 = error.message;
        }

        try {
            const command2 = `export IPFS_PATH=${this.ipfsPath} &&  ` + this.pathString +  `  ipfs name publish ${results1[Object.keys(results1)[0]]}`;
            results2 = await new Promise((resolve, reject) => {
                exec(command2, (error, stdout, stderr) => {
                    if (error) {
                        reject(error.message);
                    } else {
                        resolve(stdout);
                    }
                });
            });
            results2 = results2.split(":")[0].split(" ")[results2.split(":")[0].split(" ").length - 1];
        } catch (error) {
            results2 = error.message;
        }

        const results = {
            "add": results1,
            "publish": results2
        };
        return results;
    }


    async ipfsLsPath(path, kwargs = {}) {
        let results1 = null;
        try {
            const stat1 = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs files ls ${path}`;
            results1 = await new Promise((resolve, reject) => {
                exec(stat1, (error, stdout, stderr) => {
                    if (error) {
                        reject(error.message);
                    } else {
                        resolve(stdout);
                    }
                });
            });
            results1 = results1.split("\n");
        } catch (error) {
            results1 = error.message;
        }
        if (results1 != null && results1.length > 0 && Array.isArray(results1)) {
            return results1;
        } else {
            return false;
        }
    }

    async ipfsRemovePin(cid, kwargs = {}) {
        let result1 = null;
        let stdout = null;
        let stderr = null;
        try {
            const command1 = `export IPFS_PATH=${this.ipfsPath} &&  ` + this.pathString + `  ipfs pin rm ${cid}`;
            const output = await new Promise((resolve, reject) => {
                exec(command1, (error, stdout, stderr) => {
                    if (error) {
                        reject({ stdout, stderr });
                    } else {
                        resolve({ stdout, stderr });
                    }
                });
            });
            stdout = output.stdout;
            stderr = output.stderr;
        } catch (error) {
            result1 = error.message;
        }
        if (stdout && stdout.includes("unpinned")) {
            result1 = true;
        }
        return result1;
    }


    async ipfsRemovePin(cid, kwargs = {}) {
        let result1 = null;
        let stdout = null;
        let stderr = null;
        try {
            const command1 = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString +  `ipfs pin rm ${cid}`;
            const output = await new Promise((resolve, reject) => {
                exec(command1, (error, stdout, stderr) => {
                    if (error) {
                        reject({ stdout, stderr });
                    } else {
                        resolve({ stdout, stderr });
                    }
                });
            });
            stdout = output.stdout;
            stderr = output.stderr;
        } catch (error) {
            result1 = error.message;
        }
        if (stdout && stdout.includes("unpinned")) {
            result1 = true;
        }
        return result1;
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
            test_add_path = await this.ipfsAddPath(test_download_path);
            console.log(test_add_path);
        } catch (error) {
            test_add_path = error;
            console.error(error);
        }

        let test_remove_path = null;
        try {
            test_remove_path = await this.ipfsRemovePath({ "path": test_download_path });
            console.log(test_remove_path);
        } catch (error) {
            test_remove_path = error;
            console.error(error);
        }

        let test_stat_path = null;
        try {
            test_stat_path = await this.ipfsStatPath({ "path": test_download_path });
            console.log(test_stat_path);
        } catch (error) {
            test_stat_path = error;
            console.error(error);
        }

        let test_name_resolve = null;
        try {
            test_name_resolve = await this.ipfsNameResolve();
            console.log(test_name_resolve);
        } catch (error) {
            test_name_resolve = error;
            console.error(error);
        }

        let test_name_publish = null;
        try {
            test_name_publish = await this.ipfsNamePublish(test_download_path);
            console.log(test_name_publish);
        } catch (error) {
            test_name_publish = error;
            console.error(error);
        }

        let test_ls_path = null;
        try {
            test_ls_path = await this.ipfsLsPath(test_download_path);
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