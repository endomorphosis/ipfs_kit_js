 
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

    async ipfsClusterServiceStart() {
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

    async ipfsClusterServiceStop() {
        let ipfsClusterServiceCmd = null
        let ipfsClusterServiceResults = null;
        if (os.userInfo().uid === 0) {
            ipfsClusterServiceCmd = this.pathString + " systemctl stop ipfs-cluster-service";
            ipfsClusterServiceResults = execSync(command).toString();
        }
        else{
            ipfsClusterServiceCmd = "ps -ef | grep ipfs-cluster-service | grep -v grep | awk '{print $2}' | xargs kill -9"
            ipfsClusterServiceResults = execSync(command).toString();
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
            const results = execSync(command).toString();
            return results;
        }
    }

    async testIpfsClusterService() {
        let detect;
        try {
            detect = execSync(this.pathString + ' which ipfs-cluster-service').toString();
        } catch (error) {
            detect = '';
        }
    
        let testServiceStart = null;
        try{
            testServiceStart = await this.ipfsClusterServiceStart();
        }
        catch(error){
            console.error(error);
            testServiceStart = error;
        }
        
        let testServiceStop = null;
        try{
            testServiceStop = await this.ipfsClusterServiceStop();
        }
        catch(error){
            console.error(error);
            testServiceStop = error;
        }

        let results = {
            "detect": detect,
            "testServiceStart": testServiceStart,
            "testServiceStop": testServiceStop
        };
    }
}

async function test(){
    const meta = {
        role: "master",
        clusterName: "cloudkit_storage",
        clusterLocation: "/ip4/167.99.96.231/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv",
        secret: "96d5952479d0a2f9fbf55076e5ee04802f15ae5452b5faafc98e2bd48cf564d3",
    };
    const thisIpfsClusterService = new IpfsClusterService(null, meta);
    const results = await thisIpfsClusterService.testIpfsClusterService();
    console.log(results);
}

if (import.meta.url === import.meta.url) {
    test();
}
