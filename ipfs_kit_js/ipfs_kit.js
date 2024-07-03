import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

class ipfs_kit {
    constructor(resources, meta = null) {
        this.resources = resources;
        this.meta = meta;
        this.thisDir = path.dirname(__filename);
        process.env.PATH += ":" + path.join(this.thisDir, "bin");
        this.pathString = "PATH=" + process.env.PATH;

        if (meta) {
            if (meta.config) {
                this.config = meta.config;
            }
            if (meta.role) {
                this.role = meta.role;
                if (!["master", "worker", "leecher"].includes(this.role)) {
                    this.role = "leecher";
                }
            }
            if (meta.cluster_name) {
                this.cluster_name = meta.cluster_name;
            }
            if (meta.ipfs_path) {
                this.ipfs_path = meta.ipfs_path;
            }

            if (["leecher", "worker", "master"].includes(this.role)) {
                this.ipfs = new Ipfs(resources, meta);
                this.ipget = new Ipget(resources, meta);
            }
            if (this.role === "worker") {
                this.ipfs_cluster_follow = new IpfsClusterFollow(resources, meta);
            }
            if (this.role === "master") {
                this.ipfs_cluster_ctl = new IpfsClusterCtl(resources, meta);
                this.ipfs_cluster_service = new IpfsClusterService(resources, meta);
            }
        }
    }

    async call(method, kwargs) {
        switch (method) {
            case "ipfs_kit_stop":
                return this.ipfs_kit_stop(kwargs);
            case "ipfs_kit_start":
                return this.ipfs_kit_start(kwargs);
            case "ipfs_kit_ready":
                return this.ipfs_kit_ready(kwargs);
            case "ipfs_get_pinset":
                return this.ipfs.ipfs_get_pinset(kwargs);
            case "ipfs_follow_list":
                if (this.role !== "master") {
                    return this.ipfs_cluster_ctl.ipfs_follow_list(kwargs);
                } else {
                    throw new Error("role is not master");
                }
            case "ipfs_follow_ls":
                if (this.role !== "master") {
                    return this.ipfs_cluster_follow.ipfs_follow_ls(kwargs);
                } else {
                    throw new Error("role is not master");
                }
            case "ipfs_follow_info":
                if (this.role !== "master") {
                    return this.ipfs_cluster_follow.ipfs_follow_info(kwargs);
                } else {
                    throw new Error("role is not master");
                }
            case "ipfs_cluster_get_pinset":
                return this.ipfs_cluster_get_pinset(kwargs);
            case "ipfs_ls_pinset":
                return this.ipfs.ipfs_ls_pinset(kwargs);
            case "ipfs_cluster_ctl_add_pin":
                if (this.role === "master") {
                    return this.ipfs_cluster_ctl.ipfs_cluster_ctl_add_pin(kwargs);
                } else {
                    throw new Error("role is not master");
                }
            case "ipfs_cluster_ctl_rm_pin":
                if (this.role === "master") {
                    return this.ipfs_cluster_ctl.ipfs_cluster_ctl_rm_pin(kwargs);
                } else {
                    throw new Error("role is not master");
                }
            case "ipfs_add_pin":
                return this.ipfs_add_pin(kwargs);
            case "ipfs_remove_pin":
                return this.ipfs_remove_pin(kwargs);
            case "ipfs_get":
                return this.ipfs_get(kwargs);
            case "ipget_download_object":
                this.method = 'download_object';
                return this.ipget.ipget_download_object(kwargs);
            case "ipfs_upload_object":
                this.method = 'ipfs_upload_object';
                return this.ipfs.ipfs_upload_object(kwargs);
            case "load_collection":
                return this.load_collection(kwargs);
            default:
                throw new Error("Method not recognized");
        }
    }

    ipfs_kit_ready(kwargs) {
        let cluster_name = kwargs.cluster_name || this.cluster_name;
        if (!cluster_name && this.role !== "leecher") {
            throw new Error("cluster_name is not defined");
        }

        let ready = false;
        let ipfs_ready = false;
        let ipfs_cluster_ready = false;

        let command1 = "ps -ef | grep ipfs | grep daemon | grep -v grep | wc -l";
        let execute1 = execSync(command1).toString().trim();
        if (parseInt(execute1) > 0) {
            ipfs_ready = true;
        }

        if (this.role === "master") {
            return this.ipfs_cluster_service.ipfs_cluster_service_ready();
        } else if (this.role === "worker") {
            let data_ipfs_follow = this.ipfs_cluster_follow.ipfs_follow_info();
            if (data_ipfs_follow.cluster_peer_online === 'true' && data_ipfs_follow.ipfs_peer_online === 'true' && data_ipfs_follow.cluster_name === cluster_name) {
                ipfs_cluster_ready = true;
            }
        }

        if (this.role === "leecher" && ipfs_ready) {
            ready = true;
        } else if (this.role !== "leecher" && ipfs_ready && ipfs_cluster_ready) {
            this.ipfs_follow_info = data_ipfs_follow;
            ready = true;
        } else {
            ready = {
                ipfs: ipfs_ready,
                ipfs_cluster: ipfs_cluster_ready
            };
        }
        return ready;
    }

    load_collection(cid, kwargs) {
        if (!cid) {
            throw new Error("collection is None");
        }
        let dst_path = kwargs.path || this.ipfs_path;
        if (!fs.existsSync(dst_path)) {
            fs.mkdirSync(dst_path, { recursive: true });
        }
        dst_path = path.join(dst_path, "pins");
        if (!fs.existsSync(dst_path)) {
            fs.mkdirSync(dst_path, { recursive: true });
        }
        dst_path = path.join(dst_path, cid);

        let ipget;
        try {
            ipget = this.ipget.ipget_download_object(cid, dst_path);
        } catch (e) {
            ipget = e.toString();
        }

        let collection;
        try {
            collection = fs.readFileSync(dst_path, 'utf8');
            collection = JSON.parse(collection);
        } catch (e) {
            collection = e;
        }

        return collection;
    }


    async ensureDir(dirPath) {
        try {
            await fs.access(dirPath);
        } catch (e) {
            await fs.mkdir(dirPath, { recursive: true });
        }
    }
    
    async ipfs_add_pin(pin, kwargs = {}) {
        let dstPath = kwargs.path || this.ipfsPath;
        if (!await exists(dstPath)) {
            await mkdir(dstPath, { recursive: true });
        }
        dstPath = path.join(dstPath, "pins");
        if (!await exists(dstPath)) {
            await mkdir(dstPath, { recursive: true });
        }
        dstPath = path.join(dstPath, pin);

        let ipget;
        try {
            ipget = await this.ipget.ipget_download_object({ cid: pin, path: dstPath });
        } catch (e) {
            ipget = e.toString();
        }

        let result1 = null;
        let result2 = null;
        if (this.role === "master") {
            result1 = await this.ipfsClusterCtl.ipfs_cluster_ctl_add_pin(dstPath, kwargs);
            result2 = await this.ipfs.ipfs_add_pin(pin, kwargs);
        } else if (this.role === "worker" || this.role === "leecher") {
            result2 = await this.ipfs.ipfs_add_pin(pin, kwargs);
        }

        return {
            ipfs_cluster_ctl_add_pin: result1,
            ipfs_add_pin: result2
        };
    }

    async ipfs_add_path(path, kwargs = {}) {
        let result1 = null;
        let result2 = null;
        if (this.role === "master") {
            result2 = await this.ipfs.ipfs_add_path(path, kwargs);
            result1 = await this.ipfsClusterCtl.ipfs_cluster_ctl_add_path(path, kwargs);
        } else if (this.role === "worker" || this.role === "leecher") {
            result2 = await this.ipfs.ipfs_add_path(path, kwargs);
        }

        return {
            ipfs_cluster_ctl_add_path: result1,
            ipfs_add_path: result2
        };
    }

    async ipfs_ls_path(path, kwargs = {}) {
        let result1 = await this.ipfs.ipfs_ls_path(path, kwargs);
        result1 = result1.filter(item => item !== "");

        return {
            ipfs_ls_path: result1
        };
    }

    async name_resolve(kwargs = {}) {
        let result1 = await this.ipfs.ipfs_name_resolve(kwargs);
        return {
            ipfs_name_resolve: result1
        };
    }

    async name_publish(path, kwargs = {}) {
        let result1 = await this.ipfs.ipfs_name_publish(path, kwargs);
        return {
            ipfs_name_publish: result1
        };
    }

    async ipfs_remove_path(path, kwargs = {}) {
        let result1 = null;
        let result2 = null;
        if (this.role === "master") {
            result1 = await this.ipfsClusterCtl.ipfs_cluster_ctl_remove_path(path, kwargs);
            result2 = await this.ipfs.ipfs_remove_path(path, kwargs);
        } else if (this.role === "worker" || this.role === "leecher") {
            result2 = await this.ipfs.ipfs_remove_path(path, kwargs);
        }

        return {
            ipfs_cluster_ctl_rm_path: result1,
            ipfs_rm_path: result2
        };
    }

    async ipfs_remove_pin(pin, kwargs = {}) {
        let result1 = null;
        let result2 = null;
        if (this.role === "master") {
            result1 = await this.ipfsClusterCtl.ipfs_cluster_ctl_remove_pin(pin, kwargs);
            result2 = await this.ipfs.ipfs_remove_pin(pin, kwargs);
        } else if (this.role === "worker" || this.role === "leecher") {
            result2 = await this.ipfs.ipfs_remove_pin(pin, kwargs);
        }

        return {
            ipfs_cluster_ctl_rm_pin: result1,
            ipfs_rm_pin: result2
        };
    }


    async testInstall() {
        if (this.role === "master") {
            return {
                ipfs_cluster_service: await this.install_ipfs.ipfs_cluster_service_test_install(),
                ipfs_cluster_ctl: await this.install_ipfs.ipfs_cluster_ctl_test_install(),
                ipfs: await this.install_ipfs.ipfs_test_install()
            };
        } else if (this.role === "worker") {
            return {
                ipfs_cluster_follow: await this.install_ipfs.ipfs_cluster_follow_test_install(),
                ipfs: await this.install_ipfs.ipfs_test_install()
            };
        } else if (this.role === "leecher") {
            return await this.install_ipfs.ipfs_test_install();
        } else {
            throw new Error("role is not master, worker, or leecher");
        }
    }

    async ipfsGetPinset() {
        const ipfs_pinset = await this.ipfs.ipfs_get_pinset();

        let ipfs_cluster = null;
        if (this.role === "master") {
            ipfs_cluster = await this.ipfs_cluster_ctl.ipfs_cluster_get_pinset();
        } else if (this.role === "worker") {
            ipfs_cluster = await this.ipfs_cluster_follow.ipfs_follow_list();
        } else if (this.role === "leecher") {
            // No action for leecher
        }

        return {
            ipfs_cluster: ipfs_cluster,
            ipfs: ipfs_pinset
        };
    }

    async ipfsKitStop() {
        let ipfs_cluster_service = null;
        let ipfs_cluster_follow = null;
        let ipfs = null;

        if (this.role === "master") {
            try {
                ipfs_cluster_service = await this.ipfs_cluster_service.ipfs_cluster_service_stop();
            } catch (e) {
                ipfs_cluster_service = e.message;
            }
            try {
                ipfs = await this.ipfs.daemon_stop();
            } catch (e) {
                ipfs = e.message;
            }
        } else if (this.role === "worker") {
            try {
                ipfs_cluster_follow = await this.ipfs_cluster_follow.ipfs_follow_stop();
            } catch (e) {
                ipfs_cluster_follow = e.message;
            }
            try {
                ipfs = await this.ipfs.daemon_stop();
            } catch (e) {
                ipfs = e.message;
            }
        } else if (this.role === "leecher") {
            try {
                ipfs = await this.ipfs.daemon_stop();
            } catch (e) {
                ipfs = e.message;
            }
        }

        return {
            ipfs_cluster_service: ipfs_cluster_service,
            ipfs_cluster_follow: ipfs_cluster_follow,
            ipfs: ipfs
        };
    }

    async ipfsKitStart() {
        let ipfs_cluster_service = null;
        let ipfs_cluster_follow = null;
        let ipfs = null;

        if (this.role === "master") {
            try {
                ipfs = await this.ipfs.daemon_start();
            } catch (e) {
                ipfs = e.message;
            }
            try {
                ipfs_cluster_service = await this.ipfs_cluster_service.ipfs_cluster_service_start();
            } catch (e) {
                ipfs_cluster_service = e.message;
            }
        } else if (this.role === "worker") {
            try {
                ipfs = await this.ipfs.daemon_start();
            } catch (e) {
                ipfs = e.message;
            }
            try {
                ipfs_cluster_follow = await this.ipfs_cluster_follow.ipfs_follow_start();
            } catch (e) {
                ipfs_cluster_follow = e.message;
            }
        } else if (this.role === "leecher") {
            try {
                ipfs = await this.ipfs.daemon_start();
            } catch (e) {
                ipfs = e.message;
            }
        }

        return {
            ipfs_cluster_service: ipfs_cluster_service,
            ipfs_cluster_follow: ipfs_cluster_follow,
            ipfs: ipfs
        };
    }

    async ipfsGetConfig() {
        const command = "ipfs config show";
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
        const filename = "/tmp/config_" + Date.now() + ".json";
        await writeFileProm(filename, JSON.stringify(newConfig));
        const command = "ipfs config replace " + filename;
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
        const command = `ipfs config ${key}`;
        try {
            const { stdout } = await execProm(command);
            return JSON.parse(stdout);
        } catch (error) {
            console.error("command failed", command, error);
            throw new Error("command failed");
        }
    }

    async ipfsSetConfigValue(key, value) {
        const command = `ipfs config ${key} ${value}`;
        try {
            const { stdout } = await execProm(command);
            return JSON.parse(stdout);
        } catch (error) {
            console.error("command failed", command, error);
            throw new Error("command failed");
        }
    }


    async checkCollection(collection) {
        let status = {
            orphanModels: [],
            orphanPins: [],
            activePins: [],
            activeModels: []
        };
        let collectionKeys = Object.keys(collection);
        let pinsetKeys = Object.keys(this.pinset);

        for (let thisModel of collectionKeys) {
            if (thisModel !== "cache") {
                let thisManifest = collection[thisModel];
                let thisCache = thisManifest["cache"];
                let thisIpfsCache = thisCache["ipfs"];
                let thisIpfsCacheKeys = Object.keys(thisIpfsCache);
                let foundAll = true;

                for (let thisCacheBasename of thisIpfsCacheKeys) {
                    let thisCacheItem = thisIpfsCache[thisCacheBasename];
                    let thisCacheItemPath = thisCacheItem["path"];

                    if (pinsetKeys.includes(thisCacheItemPath)) {
                        status.activePins.push(thisCacheItemPath);
                    } else {
                        foundAll = false;
                    }
                }

                if (foundAll) {
                    status.activeModels.push(thisModel);
                } else {
                    status.orphanModels.push(thisModel);
                }
            }
        }

        for (let thisPin of pinsetKeys) {
            if (!status.activePins.includes(thisPin)) {
                status.orphanPins.push(thisPin);
            }
        }

        return status;
    }

    async ipfsUploadObject({ file }) {
        return this.uploadObject(file);
    }

    async ipgetDownloadObject(kwargs) {
        return this.ipget.ipgetDownloadObject(kwargs);
    }

    static async updateCollectionIpfs(collection, collectionPath) {
        let thisCollectionIpfs = null;
        let command1 = `ipfs add -r ${collectionPath}`;

        try {
            let { stdout: results1 } = await execProm(command1);
            results1 = results1.split("\n").map(line => line.split(" "));

            if (results1.length === 2) {
                thisCollectionIpfs = results1[results1.length - 2][1];
            }

            let metadata = ["path=/collection.json"];
            let argstring = metadata.map(item => ` --metadata ${item}`).join('');

            let command2 = `ipfs-cluster-ctl pin add ${thisCollectionIpfs}${argstring}`;
            await execProm(command2);

            if ("cache" in collection) {
                collection["cache"]["ipfs"] = thisCollectionIpfs;
            } else {
                collection["cache"] = { "ipfs": thisCollectionIpfs };
            }

            return thisCollectionIpfs;
        } catch (error) {
            console.error("An error occurred", error);
        }
    }

}


if (import.meta.url === import.meta.url) {
    const meta = {
        role: "master",
        clusterName: "cloudkit_storage",
        clusterLocation: "/ip4/167.99.96.231/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv",
        secret: "96d5952479d0a2f9fbf55076e5ee04802f15ae5452b5faafc98e2bd48cf564d3",
    };
    const ipfs_kit_instance = new ipfs_kit();
    const test_ipfs = await ipfs_kit_instance.test_ipfs();
    console.log(test_ipfs);
}