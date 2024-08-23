import { exec,  execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export class ipget {
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


    async ipgetDownloadObject(thisCid, thisPath) {
        let cid
        let dstPath
        
        if (typeof(thisCid) === 'object' && thisCid.path !== null) {
            dstPath = thisCid.path;
        }
        else if (typeof(thisPath) === 'string') {
            dstPath = thisPath;
        }

        if (typeof(thisCid) === 'object' && thisCid.cid !== null) {
            cid = thisCid.cid;
        }
        else if (typeof(thisCid) === 'string') {
            cid = thisCid;
        }
        
        if (!dstPath) {
            throw new Error("path not found in kwargs");
        }
        if (!cid) {
            throw new Error("cid not found in kwargs");
        }

        if (fs.existsSync(dstPath)) {
            // pass
        }
        //check if folder exists
        if (!fs.existsSync(path.dirname(dstPath))) {
            fs.mkdirSync(path.dirname(dstPath), { recursive: true });
        }
        if (!fs.existsSync(dstPath)) {
            fs.mkdirSync(dstPath);
        }
        
        const command = `export IPFS_PATH=${this.ipfsPath} && ` + this.pathString + ` ipfs get ${cid} -o ${dstPath}`;
        const process = exec(command);

        const start_time = Date.now();
        const timeout = 5000; // 5 seconds

        return new Promise((resolve, reject) => {
            process.on('exit', (code, signal) => {
                if (signal) {
                    reject(new Error("Command timed out"));
                } else {
                    const stats = fs.statSync(dstPath);
                    const metadata = {
                        "cid": cid,
                        "path": dstPath,
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

} 
export default ipget;