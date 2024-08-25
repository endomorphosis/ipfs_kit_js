 
import { rejects } from 'assert';
import { exec, execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

export class IpfsClusterService {
    constructor(resources, meta = null) {
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
            if (Object.keys(meta).includes('role') && meta['role'] !== null && meta['role'] !== undefined) {
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
            if (Object.keys(meta).includes('ipfsPath') && meta['ipfsath'] !== null) {
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
        if(Object.keys(this).includes('clusterName') === false){
            this.clusterName = 'cloudkit_storage';
        }
    }

    async ipfsClusterServiceStart() {
        let results = { systemctl: false, bash: {} };
        let detectResults
    
        let psIpfsCmd = "ps -ef | grep ipfs | grep -v grep | grep -v systemctl";
        let psIpfsCmdResults = '';
        
        try{
            psIpfsCmdResults = execSync(psIpfsCmd).toString().trim();
            // console.log(`psIpfsCmdResults: ${psIpfsCmdResults}`);
        }
        catch (error) {
            //
        }

        if (os.userInfo().uid === 0) {

            if (psIpfsCmdResults.length === 0) {
                try{
                    // Attempt to start the ipfs service
                    let systemctlStart = execSync("systemctl start ipfs").toString();
                    results.systemctl = systemctlStart;
                    // Check if the service is running
                    detectResults = execSync("ps -ef | grep ipfs | grep -v grep").toString().trim();
                    if (detectResults.length === 0) {
                        const homeDir = os.homedir();
                        const ipfsDir = path.join(homeDir, ".ipfs");
                        // Check for and remove the api-socket file if it exists
                        const apiSocketPath = path.join(ipfsDir, "api-socket");
                        if (fs.existsSync(apiSocketPath)) {
                            fs.unlinkSync(apiSocketPath);
                            results.bash = true;
                        }
                        // Attempt to start the ipfs service
                        let systemctlStart = execSync("systemctl start ipfs").toString();
                        results.systemctl = systemctlStart;
                        // Check if the service is running
                        detectResults = execSync("ps -ef | grep ipfs | grep -v grep").toString().trim();
                    }       
                }
                catch (error) {
                    console.log(`Error starting ipfs: ${error.message}`);
                    results.systemctl += `Error: ${error.message}`;
                }
            }
            try{
                const ipfsClusterCmd = this.pathString + " systemctl start ipfs-cluster-service";
                const ipfsClusterCmdResults = execSync(command).toString().trim();
                results.systemctl = ipfsClusterCmdResults;
                return results;
            }
            catch (error) {
                console.log(`Error starting ipfs-cluster-service: ${error.message}`);
                results.systemctl += `Error: ${error.message}`;
                return results;
            }
        }
        else{
            if (psIpfsCmdResults.length === 0) {  
                try{
                    // Attempt to start the ipfs service
                    let ipfsStartCmd = this.pathString + " ipfs daemon";
                    let ipfsStart = exec(ipfsStartCmd, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error starting ipfs: ${error.message}`);
                            // results.bash = `Error: ${error.message}`;
                        }
                        if (stderr) {
                            console.error(`Error starting ipfs: ${stderr}`);
                            // results.bash = stderr;
                        }
                        if (stdout) {
                            console.log(`ipfs output: ${stdout}`);
                            // results.bash = stdout;
                        }
                    });
                    // Check if the service is running
                    detectResults = execSync("ps -ef | grep ipfs | grep -v grep").toString().trim();
                    if (detectResults.length === 0) {
                        const homeDir = os.homedir();
                        const ipfsDir = path.join(homeDir, ".ipfs");
                        // Check for and remove the api-socket file if it exists
                        const apiSocketPath = path.join(ipfsDir, "api-socket");
                        if (fs.existsSync(apiSocketPath)) {
                            fs.unlinkSync(apiSocketPath);
                            results.bash = true;
                        }
                        // Attempt to start the ipfs service
                        let ipfsStartCmd = this.pathString + " ipfs daemon";
                        let ipfsStart = exec(ipfsStartCmd, (error, stdout, stderr) => {
                            if (error) {
                                console.error(`Error starting ipfs: ${error.message}`);
                                // results.bash = `Error: ${error.message}`;
                            }
                            if (stderr) {
                                console.error(`Error starting ipfs: ${stderr}`);
                                // results.bash = stderr;
                            }
                            if (stdout) {
                                console.log(`ipfs output: ${stdout}`);
                                // results.bash = stdout;
                            }
                        });
                        // Check if the service is running
                        detectResults = execSync("ps -ef | grep ipfs | grep -v grep").toString().trim();
                    }
                }
                catch (error) {
                    console.log(`Error starting ipfs: ${error.message}`);
                    results.bash = `Error: ${error.message}`;
                }
            }
            try{
                const ipfsClusterCmd = this.pathString + ` IPFS_CLUSTER_PATH=${this.ipfsPath} ipfs-cluster-service daemon `
                const ipfsClusterCmdResults = exec(ipfsClusterCmd)
                let stdout = '';
                let stderr = '';
                ipfsClusterCmdResults.stdout.on('data', data => {
                    stdout += data;
                    console.log(`stdout: ${data}`);
                });
                await new Promise(resolve => {
                    ipfsClusterCmdResults.stderr.on('data', data => {
                        stderr += data;
                        if (data.includes('ERROR')) {
                            console.error(`stderr: ${data}`);
                            resolve();
                        }
                    });
                    ipfsClusterCmdResults.on('error', error => {
                        console.error(`error: ${error.message}`);
                        resolve();
                    });
                    ipfsClusterCmdResults.stdout.on('end', () => {
                        // resolve();
                        console.log(`stdout: ${stdout}`);
                    });
                    setTimeout(resolve, 20000);
                });
                results.bash.stdout = stdout;
                results.bash.stderr = stderr;
            }
            catch (error) {
                console.log(`Error starting ipfs-cluster-service: ${error.message}`);
                results.bash = `Error: ${error.message}`;
            }
        }
        return results; 
    }

    async ipfsClusterServiceStop() {
        let ipfsClusterServiceCmd = null
        let ipfsClusterServiceResults = null;
        if (os.userInfo().uid === 0) {
            ipfsClusterServiceCmd = this.pathString + " systemctl stop ipfs-cluster-service";
            ipfsClusterServiceResults = execSync(ipfsClusterServiceCmd).toString();
        }
        else{
            ipfsClusterServiceCmd = "ps -ef | grep ipfs-cluster-service | grep -v grep | awk '{print $2}' "
            let ipfsClusterServiceCmdResults = execSync(ipfsClusterServiceCmd).toString().trim().split("\n");
            ipfsClusterServiceResults = [];
            for (let i = 0; i < ipfsClusterServiceCmdResults.length && ipfsClusterServiceCmdResults[i].trim() != '' ; i++) {
                let psCmd = `ps -ef | grep -v grep | grep ${ipfsClusterServiceCmdResults[i]}`;
                let psResults = execSync(psCmd).toString().trim();
                if (psResults.includes('root')){
                    console.log("cannot kill root process" + ipfsClusterServiceCmdResults[i]);
                    ipfsClusterServiceResults[i] = "cannot kill root process " + ipfsClusterServiceCmdResults[i];
                }
                else if (psResults !== "") {
                    let ipfsClusterKillCmd =`kill -9 ${ipfsClusterServiceCmdResults[i]}`;
                    ipfsClusterServiceResults[i] = execSync(ipfsClusterKillCmd).toString();
                }
            }
        }
        return {
            "ipfsClusterService": ipfsClusterServiceResults
        };
    }

    async ipfsClusterServiceStatus() {
        if (os.userInfo().uid === 0) {
            const command = this.pathString + " systemctl status ipfs-cluster-service";
            const results = execSync(command).toString();
            return results;
        }
        else{
            const command = "ps -ef | grep ipfs-cluster-service | grep daemon | grep -v grep | wc -l"
            const results = execSync(command).toString().trim();            
            return results;
        }
    }

    async ipfsClusterServiceReady() {
        let results =  await this.ipfsClusterServiceStatus();
        if (os.userInfo().uid === 0) {
            if (results.includes("active (running)")) {
                return true;
            }
            else{
                return false;
            }
        }
        else{
            if (parseInt(results) > 0) {
                return true;
            }
            else{
                return false;
            }
        }
    }

}
export default IpfsClusterService;