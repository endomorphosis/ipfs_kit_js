import { execSync, exec } from 'child_process';
import os from 'os';
import path, { parse } from 'path';
import fs from 'fs';
import * as install_ipfs from './install_ipfs.js';

export default class IpfsClusterFollow {
    constructor(resources, meta) {
        this.thisDir = path.dirname(import.meta.url);
        if (this.thisDir.startsWith("file://")) {
            this.thisDir = this.thisDir.replace("file://", "");
        }
        this.path = process.env.PATH;
        this.path = this.path + ":" + path.join(this.thisDir, "bin")
        this.pathString = "PATH="+ this.path

        this.config = {};

        this.role = 'leecher'; // default role
        this.clusterName = '';

        // Set from meta if provided
        if (meta.config) {
            this.config = meta.config;
        }

        if (meta.role && ['master', 'worker', 'leecher'].includes(meta.role)) {
            this.role = meta.role;
        } else if (meta.role) {
            throw new Error("role is not either master, worker, leecher");
        }

        if (meta.ipfsPath) {
            this.ipfsPath = meta.ipfsPath;
        }

        if (meta.clusterName ) {
            this.clusterName = meta.clusterName;
        }
    }

    async ipfsFollowStart(clusterName = this.clusterName) {
        let results = { systemctl: false, bash: false };
        let detectResults
        if (os.userInfo().uid === 0) {
            try {
                // Attempt to start the ipfs-cluster-follow service
                let systemctlStart = execSync("systemctl start ipfs-cluster-follow").toString();
                results.systemctl = systemctlStart;
                // Check if the service is running
                detectResults = execSync("ps -ef | grep ipfs-cluster-follow | grep -v grep").toString().trim();
                        
                if (detectResults.length === 0) {
                    const homeDir = os.homedir();
                    const followDir = path.join(homeDir, ".ipfs-cluster-follow", clusterName);
                    // Check for and remove the api-socket file if it exists
                    const apiSocketPath = path.join(followDir, "api-socket");
                    if (fs.existsSync(apiSocketPath)) {
                        fs.unlinkSync(apiSocketPath);
                        results.bash = true;
                    }
                    // Attempt to start the ipfs-cluster-follow service
                    let systemctlStart = execSync("systemctl start ipfs-cluster-follow").toString();
                    results.systemctl = systemctlStart;
                    // Check if the service is running
                    detectResults = execSync("ps -ef | grep ipfs-cluster-follow | grep -v grep").toString().trim();
                }
            }
            catch (error) {
                console.log(`Error starting ipfs-cluster-follow: ${error.message}`);
                results.systemctl = `Error: ${error.message}`;
            }
        } 
        if (os.userInfo().uid != 0 || results.systemctl.includes('Error') || detectResults.length === 0) {
            try {            
                // Attempt to run the ipfs-cluster-follow command
                const commandRun = this.pathString + ` ipfs-cluster-follow ${clusterName} run`;
                const process = exec(commandRun, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error running ipfs-cluster-follow: ${error}`);
                        if (error.stdout.includes("command not found") || error.stdout.includes("This cluster peer has not been initialized.")) {
                            let InstallIpfs = new install_ipfs.InstallIpfs();
                            let installResults = InstallIpfs.installIpfsClusterFollow();
                            let configResults = InstallIpfs.configIpfsClusterFollow();
                            console.log(`Install IPFS Cluster Follow results: ${installResults}`);
                            console.log(`Configure IPFS Cluster Follow results: ${configResults}`);
                            console.log(`Attempting to run ipfs-cluster-follow again`);
                            exec(commandRun, (error, stdout, stderr) => {
                                if (error) {
                                    console.error(`Error running ipfs-cluster-follow: ${error.message}`);
                                    results.bash = error.message;
                                }
                                if (stderr) {
                                    console.error(`Error running ipfs-cluster-follow: ${stderr}`);
                                    results.bash = stderr;
                                }
                                if (stdout) {
                                    console.log(`ipfs-cluster-follow output: ${stdout}`);
                                    results.bash = stdout;
                                }
                            });
                        }
                        return results;
                    }
                    if (stderr) {
                        console.error(`Error running ipfs-cluster-follow: ${stderr}`);
                        results.bash = stderr;
                        return results;
                    }
                    if (stdout) {
                        console.log(`ipfs-cluster-follow output: ${stdout}`);
                        results.bash = stdout;
                        return results;
                    }
                });
            }
            catch (error) {
                console.log(`Error running ipfs-cluster-follow: ${error.message}`);
                console.error(`Error in ipfsFollowStart: ${error.message}`);
            }
        }
        // return results; 
    }

    async ipfsFollowStop() {
        let results = { systemctl: '', bash: '', 'api-socket': '' };
        let clusterName = this.clusterName;
        
        if (os.userInfo().uid === 0) {
            try {
                // Attempt to stop the ipfs-cluster-follow service
                const systemctlStop = execSync("systemctl stop ipfs-cluster-follow").toString();
                results.systemctl = systemctlStop;
            } catch (error) {
                console.log(`Error stopping ipfs-cluster-follow: ${error.message}`)
                results.systemctl = `Error: ${error.message}`;
            }
        }
        if (os.userInfo().uid != 0 || results.systemctl.includes('Error')){
            try {
                // Forcefully kill the ipfs-cluster-follow process if it's still running
                let listCommand = "ps -ef | grep ipfs-cluster-follow | grep -v grep | wc -l";
                let listResults = execSync(listCommand).toString().trim();
                if (parseInt(listResults) > 0) {
                    listCommand = "ps -ef | grep ipfs-cluster-follow | grep -v grep | grep -v root | awk '{print $2}'";
                    listResults = execSync(listCommand).toString().trim();
                    if (parseInt(listResults) > 0) {            
                        const killCommand = "ps -ef | grep ipfs-cluster-follow | grep -v grep | grep -v root | awk '{print $2}' | xargs kill -9";
                        const killResults = execSync(killCommand).toString();
                        results.bash = killResults;    
                    }
                    listCommand = "ps -ef | grep ipfs-cluster-follow | grep -v grep | grep -v root | awk '{print $2}'";
                    listResults = execSync(listCommand).toString().trim();
                    if (parseInt(listResults) > 0) {
                        results.bash = "ipfs-cluster-follow process found but not killed because it's running as root";
                        console.log ("ipfs-cluster-follow process found but not killed because it's running as root");
                    }
                }
                else{
                    results.bash = "No ipfs-cluster-follow process found to kill";
                }
            } catch (error) {
                console.log(`Error killing ipfs-cluster-follow: ${error.message}`)
                results.bash = `Error: ${error.message}`;
            }
        }

        try {
            // Remove the api-socket file
            const apiSocketPath = path.join(os.homedir(), ".ipfs-cluster-follow", clusterName, "api-socket");
            if (fs.existsSync(apiSocketPath)) {
                fs.unlinkSync(apiSocketPath);
                results['api-socket'] = 'Removed api-socket';
            } else {
                //console.log("api-socket not found, deleting not necessary");
                results['api-socket'] = 'api-socket not found, deleting not necessary';
            }
        } catch (error) {
            console.error(`Error removing api-socket: ${error.message}`);
            results['api-socket'] = `Error removing api-socket: ${error.message}`;
        }

        return results;
    }

    async ipfsFollowList(clusterName = this.clusterName) {
        let ipfsFollowListCmd = this.pathString + ` ipfs-cluster-follow ${clusterName} list`;
        let ipfsFollowListResults = null;
        try {
            ipfsFollowListResults = execSync(command, { encoding: 'utf8' }).trim();

            if (results.length > 0) {
                let resultsArray = results.split("\n");
                let resultsDict = {};

                resultsArray.forEach((result) => {
                    // Replace multiple spaces with a single space
                    result = result.replace(/\s\s+/g, ' ');
                    let parts = result.split(" ");

                    // Assuming the first element is the value and the second is the key
                    if (parts.length >= 2) {
                        let key = parts[1];
                        let value = parts[0];
                        resultsDict[key] = value;
                    }
                });

                return resultsDict;
            } else {
                return false;
            }
        } catch (error) {
            console.error(`Error executing ipfs-cluster-follow list: ${error.message}`);
            return false;
        }
    }


    async ipfsFollowInfo(kwargs = {}) {
        let clusterName = this.clusterName;
        let resultsDict = {};
        const command = this.pathString + ` ipfs-cluster-follow ${clusterName} info`;
        let results = null;
        try {
            results = execSync(command, { encoding: 'utf8' }).trim().split("\n");
            if (results.length > 0) {
                resultsDict = {
                    clusterName: clusterName,
                    configFolder: results[2].split(": ")[1],
                    configSource: results[3].split(": ")[1],
                    clusterPeerOnline: results[4].split(": ")[1],
                    ipfsPeerOnline: results[5].split(": ")[1],
                };
            }
        } catch (error) {
            if (error.stdout.includes("This cluster peer has not been initialized.")){
                let InstallIpfs = new install_ipfs.installIpfs(undefined, { role: 'leecher', clusterName: clusterName, ipfs_path: this.ipfsPath });
                let installResults = await InstallIpfs.installIpfsClusterFollow();
                let configResults = await InstallIpfs.configIpfsClusterFollow();
                console.log(`Install IPFS Cluster Follow results: ${installResults}`);
                console.log(`Configure IPFS Cluster Follow results: ${configResults}`);
                console.log(`Attempting to run ipfs-cluster-follow info again`);
                try{
                    results = execSync(command, { encoding: 'utf8' }).trim().split("\n");;
                }
                catch(error){
                    console.error(`Error executing ipfs-cluster-follow info: ${error.message}`);
                    results = error;
                }
            }
        }

        return resultsDict;
    }

    async ipfsFollowRun(kwargs = {}) {
        let clusterName = this.clusterName;
        if ('clusterName' in kwargs) {
            clusterName = kwargs['clusterName'];
        }

        const command = this.pathString + ` ipfs-cluster-follow ${clusterName} run`;
        let results = execSync(command).toString();
        results = results.split("\n");
        return results;
    }

    async testIpfsClusterFollow() {
        let detect;
        try {
            detect = execSync( this.pathString + ' which ipfs-cluster-follow').toString();
        } catch (error) {
            detect = '';
        }
        
        let testFollowRun = null;
        try{
            testFollowRun = await this.ipfsFollowRun();
        }
        catch(error){
            console.error(error);
            testFollowRun = error;
        }

        let testFollowList = null;
        try{
            testFollowList = await this.ipfsFollowList();
        }
        catch(error){
            console.error(error);
            testFollowList = error;
        }

        let testFollowInfo = null;
        try{
            testFollowInfo = await this.ipfsFollowInfo();
        }
        catch(error){
            console.error(error);
            testFollowInfo = error;
        }

        let results = {
            "detect": detect,
            "testFollowRun": testFollowRun,
            "testFollowList": testFollowList,
            "testFollowInfo": testFollowInfo
        };
        
    }

}