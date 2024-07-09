 
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
        this.path = process.env.PATH;
        this.path = this.path + ":" + path.join(this.this_dir, "bin")
        this.pathString = "PATH="+ this.path
        if (meta !== null) {
            if ('config' in meta && meta['config'] !== null) {
                this.config = meta['config'];
            }
            if ('role' in meta && meta['role'] !== null) {
                if (!["master", "worker", "leecher"].includes(meta['role'])) {
                    throw new Error("role is not either master, worker, leecher");
                }
                this.role = meta['role'];
            }
        }
    }

    async ipfs_cluster_service_start() {
        if (os.userInfo().uid === 0) {
            const command = this.pathString + " systemctl start ipfs-cluster-service";
            const results = execSync(command).toString();
            return results;
        }
        else{
            const command = self.path_string + " ipfs-cluster-service daemon --bootstrap /ip4/167.99.96.231/tcp/9096/p2p/12D3KooWDYKMnVLKnP2SmM8umJEEKdhug93QYybmNUEiSe1Kwjmu"
            const results = execSync(command).toString();
            return results;
        }
    }

    async ipfs_cluster_service_stop() {
        if (os.userInfo().uid === 0) {
            const command = this.pathString + " systemctl stop ipfs-cluster-service";
            const results = execSync(command).toString();
            return results;
        }
        else{
            const command = "ps -ef | grep ipfs-cluster-service | grep -v grep | awk '{print $2}' | xargs kill -9"
            const results = execSync(command).toString();
            return results;
        }
    }

    async ipfs_cluster_service_status() {
        if (os.userInfo().uid === 0) {
            const command = this.pathString + " systemctl status ipfs-cluster-service";
            const results = execSync(command).toString();
            return results;
        }
        else{
            const command = "ps -ef | grep ipfs-cluster-service | grep daemon | grep -v grep | wc -l"
            const results = execSync(command).toString();
            return results;
        }
    }

    async test_ipfs_cluster_service() {
        let detect;
        try {
            detect = execSync(this.pathString + ' which ipfs-cluster-service').toString();
        } catch (error) {
            detect = '';
        }
    
        let test_service_start = null;
        try{
            test_service_start = await this.ipfs_cluster_service_start();
        }
        catch(error){
            console.error(error);
            test_service_start = error;
        }
        
        let test_service_stop = null;
        try{
            test_service_stop = await this.ipfs_cluster_service_stop();
        }
        catch(error){
            console.error(error);
            test_service_stop = error;
        }

        let results = {
            "detect": detect,
            "test_service_start": test_service_start,
            "test_service_stop": test_service_stop
        };
    }
}

async function test(){
    const thisIpfsClusterService = new IpfsClusterService();
    const results = await thisIpfsClusterService.test_ipfs_cluster_service();
    console.log(results);
}

if (import.meta.url === import.meta.url) {
    test();
}
