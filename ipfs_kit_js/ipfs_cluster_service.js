 
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
        if (os.userInfo().uid === 0) {
            const command = this.pathString + " systemctl start ipfs-cluster-service";
            const results = execSync(command).toString();
            return results;
        }
        else{
            // const command = this.pathString + ` IPFS_CLUSTER_PATH=${this.ipfsPath} ipfs-cluster-service daemon --bootstrap /ip4/167.99.96.231/tcp/9096/p2p/12D3KooWDYKMnVLKnP2SmM8umJEEKdhug93QYybmNUEiSe1Kwjmu`
            const command = this.pathString + ` IPFS_CLUSTER_PATH=${this.ipfsPath} ipfs-cluster-service daemon `
            const results = exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return;
                }
                if (stdout) {
                    console.log(`stdout: ${stdout}`);
                }
            });
            // return results;
        }
    }

    async ipfsClusterServiceStop() {
        let ipfsClusterServiceCmd = null
        let ipfsClusterServiceResults = null;
        if (os.userInfo().uid === 0) {
            ipfsClusterServiceCmd = this.pathString + " systemctl stop ipfs-cluster-service";
            ipfsClusterServiceResults = execSync(ipfsClusterServiceCmd).toString();
        }
        else{
            ipfsClusterServiceCmd = "ps -ef | grep ipfs-cluster-service | grep -v grep | awk '{print $2}' | xargs kill -9"
            ipfsClusterServiceResults = execSync(ipfsClusterServiceCmd).toString();
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