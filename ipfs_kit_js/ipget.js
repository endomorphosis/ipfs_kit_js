import { execSync } from 'child_process';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export default class ipget {
    constructor(resources, meta = null) {
        this.thisDir = path.dirname(import.meta.url);
        if (this.thisDir.startsWith("file://")) {
            this.thisDir = this.thisDir.replace("file://", "");
        }
        this.path = process.env.PATH;
        this.path = this.path + ":" + path.join(this.thisDir, "bin")
        this.pathString = "PATH="+ this.path
        if (meta !== null) {    
            if ('config' in meta) {
                if (meta['config'] !== null) {
                    this.config = meta['config'];
                }
            }
            if ('role' in meta) {
                if (meta['role'] !== null) {
                    this.role = meta['role'];
                    if (!["master", "worker", "leecher"].includes(this.role)) {
                        throw new Error("role is not either master, worker, leecher");
                    } else {
                        this.role = "leecher";
                    }
                }
            }
            if ('cluster_name' in meta) {
                if (meta['cluster_name'] !== null) {
                    this.cluster_name = meta['cluster_name'];
                }
            }
            if ('ipfs_path' in meta) {
                if (meta['ipfs_path'] !== null) {
                    this.ipfsPath = meta['ipfs_path'];
                }
            }
            if (this.role === "leecher" || this.role === "worker" || this.role === "master") {
                // pass
            }
        }
    }


    async ipgetDownloadObject(kwargs = {}) {
        // NOTE: Make sure this function can download both files and folders 
        if (!kwargs.cid) {
            throw new Error("cid not found in kwargs");
        }
        if (!kwargs.path) {
            throw new Error("path not found in kwargs");
        }
        if (fs.existsSync(kwargs.path)) {
            // pass
        }
        //check if folder exists
        if (!fs.existsSync(path.dirname(kwargs.path))) {
            fs.mkdirSync(path.dirname(kwargs.path), { recursive: true });
        }
        if (!fs.existsSync(kwargs.path)) {
            fs.mkdirSync(kwargs.path);
        }
        
        const command = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs get ${kwargs.cid} -o ${kwargs.path}`;
        const process = exec(command);

        const start_time = Date.now();
        const timeout = 5000; // 5 seconds

        return new Promise((resolve, reject) => {
            process.on('exit', (code, signal) => {
                if (signal) {
                    reject(new Error("Command timed out"));
                } else {
                    const stats = fs.statSync(kwargs.path);
                    const metadata = {
                        "cid": kwargs.cid,
                        "path": kwargs.path,
                        "mtime": stats.mtimeMs,
                        "filesize": stats.size
                    };
                    resolve(metadata);
                }
            });

            setTimeout(() => {
                process.kill();
            }, timeout);
        });
    }

    async testIpget() {
        
        try {
            const whichIpget = execSync(this.pathString + ' which ipget').toString().trim();
            const ipgetDownloadObject = await this.ipgetDownloadObject({
                cid: "QmccfbkWLYs9K3yucc6b3eSt8s8fKcyRRt24e3CDaeRhM1",
                path: "/tmp/test"
            });
            if (ipgetDownloadObject.cid !== "QmccfbkWLYs9K3yucc6b3eSt8s8fKcyRRt24e3CDaeRhM1") {
                return false;
            }
            if (fs.existsSync("/tmp/test") === false || fs.statSync("/tmp/test").size != ipgetDownloadObject.filesize) {
                return false;
            }
            return true;
        } catch (error) {
            return false;
        }
    }
}

// create a test that runs only if the script is run directly, and it is an es Module without require
if (import.meta.url === import.meta.url) {
    // const ipgetInstance = new ipget();
    // const testIpget = await ipgetInstance.testIpget();
    // console.log(testIpget);
}