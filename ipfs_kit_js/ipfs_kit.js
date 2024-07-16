import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import Ipfs from './ipfs.js';
import Ipget from './ipget.js';
import IpfsClusterCtl from './ipfs_cluster_ctl.js';
import IpfsClusterFollow from './ipfs_cluster_follow.js';
import IpfsClusterService from './ipfs_cluster_service.js';

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

class IpfsKit {
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
                if (['master', 'worker', 'leecher'].includes(this.role) === false) {
                    console.error('role is not either master, worker, leecher');
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
        if (["leecher", "worker", "master"].includes(this.role)) {
            this.ipfs = new Ipfs(resources, meta);
            this.ipget = new Ipget(resources, meta);
        }
        if (this.role === "worker") {
            this.ipfsClusterFollow = new IpfsClusterFollow(resources, meta);
        }
        if (this.role === "master") {
            this.ipfsClusterCtl = new IpfsClusterCtl(resources, meta);
            this.ipfsClusterService = new IpfsClusterService(resources, meta);
        }
    }

    async call(method, kwargs) {
        switch (method) {
            case "ipfs_kit_stop":
                return this.ipfsKitStop(kwargs);
            case "ipfs_kit_start":
                return this.ipfsKitStart(kwargs);
            case "ipfs_kit_ready":
                return this.ipfsKitReady(kwargs);
            case "ipfs_get_pinset":
                return this.ipfs.ipfsGetPinset(kwargs);
            case "ipfs_follow_list":
                if (this.role !== "master") {
                    return this.ipfsClusterCtl.ipfsFollowList(kwargs);
                } else {
                    throw new Error("role is not master");
                }
            case "ipfs_follow_ls":
                if (this.role !== "master") {
                    return this.ipfsClusterFollow.ipfsFollowLs(kwargs);
                } else {
                    throw new Error("role is not master");
                }
            case "ipfs_follow_info":
                if (this.role !== "master") {
                    return this.ipfsClusterFollow.ipfsFollowInfo(kwargs);
                } else {
                    throw new Error("role is not master");
                }
            case "ipfs_cluster_get_pinset":
                return this.ipfsClusterGetPinset(kwargs);
            case "ipfs_ls_pinset":
                return this.ipfs.ipfsLsPinset(kwargs);
            case "ipfs_cluster_ctl_add_pin":
                if (this.role === "master") {
                    return this.ipfsClusterCtl.ipfsClusterCtlAddPin(kwargs);
                } else {
                    throw new Error("role is not master");
                }
            case "ipfs_cluster_ctl_rm_pin":
                if (this.role === "master") {
                    return this.ipfsClusterCtl.ipfsClusterRemovePin(kwargs);
                } else {
                    throw new Error("role is not master");
                }
            case "ipfs_add_pin":
                return this.ipfsAddPin(kwargs);
            case "ipfs_remove_pin":
                return this.ipfsRemovePin(kwargs);
            case "ipfs_get":
                return this.ipget.ipgetDownloadObject(kwargs);
            case "ipget_download_object":
                this.method = 'download_object';
                return this.ipget.ipgetDownloadObject(kwargs);
            case "ipfs_upload_object":
                this.method = 'ipfs_upload_object';
                return this.ipfs.ipfsUploadObject(kwargs);
            case "load_collection":
                return this.loadCollection(kwargs);
            default:
                throw new Error("Method not recognized");
        }
    }

    ipfsKitReady(kwargs) {
        let clusterName = kwargs.clusterName || this.clusterName;
        if (!clusterName && this.role !== "leecher") {
            throw new Error("clusterName is not defined");
        }

        let ready = false;
        let ipfsReady = false;
        let ipfsClusterReady = false;

        let psDaemonCmd  = "ps -ef | grep ipfs | grep daemon | grep -v grep | wc -l";
        let psDaemonCmdResults = execSync(psDaemonCmd).toString().trim();
        if (parseInt(execute1) > 0) {
            ipfsReady = true;
        }

        if (this.role === "master") {
            return this.ipfsClusterService.ipfsClusterServiceReady();
        } else if (this.role === "worker") {
            let dataIpfsFollow = this.ipfsClusterFollow.ipfsFollowInfo();
            if (dataIpfsFollow.cluster_peer_online === 'true' && dataIpfsFollow.ipfs_peer_online === 'true' && dataIpfsFollow.cluster_name === clusterName) {
                ipfsClusterReady = true;
            }
        }

        if (this.role === "leecher" && ipfs_ready) {
            ready = true;
        } else if (this.role !== "leecher" && ipfsReady && ipfsClusterReady) {
            this.ipfsFollowInfo = dataIpfsFollow;
            ready = true;
        } else {
            ready = {
                ipfs: ipfsReady,
                ipfsCluster: ipfsClusterReady
            };
        }
        return ready;
    }

    loadCollection(cid, kwargs) {
        if (!cid) {
            throw new Error("collection is None");
        }
        let dstPath = kwargs.path || this.ipfsPath;
        if (!fs.existsSync(dstPath)) {
            fs.mkdirSync(dstPath, { recursive: true });
        }
        dstPath = path.join(dstPath, "pins");
        if (!fs.existsSync(dstPath)) {
            fs.mkdirSync(dstPath, { recursive: true });
        }
        dstPath = path.join(dstPath, cid);

        let ipget;
        try {
            ipget = this.ipget.ipgetDownloadObject(cid, dstPath);
        } catch (e) {
            console.error(e);
            ipget = e.toString();
        }

        let collection;
        try {
            collection = fs.readFileSync(dstPath, 'utf8');
            collection = JSON.parse(collection);
        } catch (e) {
            collection = e;
        }

        return collection;
    }


    async ensureDir(dirPath) {
        try {
            await exists(dirPath);
        } catch (e) {
            await mkdir(dirPath, { recursive: true });
        }
    }
    
    async ipfsAddPin(pin, kwargs = {}) {
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
            ipget = await this.ipget.ipgetDownloadObject({ cid: pin, path: dstPath });
        } catch (e) {
            ipget = e.toString();
            console.error(e);
        }

        let ipfsAddPinResult = null;
        let ipfsClusterCtlAddPinResult = null;
        if (this.role === "master") {
            ipfsClusterCtlAddPinResult = await this.ipfsClusterCtl.ipfsClusterCtlAddPin(dstPath, kwargs);
            ipfsAddPinResult = await this.ipfs.ipfsAddPin(pin, kwargs);
        } else if (this.role === "worker" || this.role === "leecher") {
            ipfsAddPinResult = await this.ipfs.ipfsAddPin(pin, kwargs);
        }

        return {
            ipfsClusterCtlAddPin: ipfsClusterCtlAddPinResult,
            ipfsAddPin: ipfsAddPinResult
        };
    }

    async ipfsAddPath(path, kwargs = {}) {
        let ipfsAddPathResult = null;
        let ipfsClusterCtlAddPathResult = null;
        if (this.role === "master") {
            ipfsAddPathResult = await this.ipfs.ipfsAddPath(path, kwargs);
            ipfsClusterCtlAddPathResult = await this.ipfsClusterCtl.ipfsClusterCtlAddPath(path, kwargs);
        } else if (this.role === "worker" || this.role === "leecher") {
            ipfsAddPathResult = await this.ipfs.ipfsAddPath(path, kwargs);
        }

        return {
            ipfsClusterCtlAddPath: ipfsClusterCtlAddPathResult,
            ipfsAddPath: ipfsAddPathResult
        };
    }

    async ipfsLsPath(path, kwargs = {}) {
        let ipfsLsPathResults = null
        try{
            ipfsLsPathResults = await this.ipfs.ipfsLsPath(path, kwargs);
            ipfsLsPathResults = ipfsLsPathResults.filter(item => item !== "");    
        }
        catch(e){
            ipfsLsPathResults = e;
            console.error(e);
        }

        return {
            ipfsLsPath: ipfsLsPathResults
        };
    }

    async nameResolve(kwargs = {}) {
        let ipfsNameResolveResults = null;
        try{
            ipfsNameResolveResults = await this.ipfs.ipfsNameResolve(kwargs);
        }
        catch(e){
            ipfsNameResolveResults = e;
            console.error(e);
        }
        return {
            ipfsNameResolve: ipfsNameResolveResults
        };
    }

    async namePublish(path, kwargs = {}) {
        let ipfsNamePublishResults = null;
        try{
            ipfsNamePublishResults = await this.ipfs.ipfsNamePublish(path, kwargs);
        }
        catch(e){
            ipfsNamePublishResults = e;
            console.error(e);
        }
        return {
            ipfsNamePublish: ipfsNamePublishResults
        };
    }

    async ipfsRemovePath(path, kwargs = {}) {
        let ipfsClusterCtlRemovePathResults = null;
        let ipfsRemovePathResults = null;
        if (this.role === "master") {
            ipfsClusterCtlRemovePathResults = await this.ipfsClusterCtl.ipfsClusterCtlRemovePath(path, kwargs);
            ipfsRemovePathResults = await this.ipfs.ipfsRemovePath(path, kwargs);
        } else if (this.role === "worker" || this.role === "leecher") {
            ipfsRemovePathResults = await this.ipfs.ipfsRemovePath(path, kwargs);
        }

        return {
            ipfsClusterCtlRemovePath: ipfsClusterCtlRemovePathResults,
            ipfsRemovePath: ipfsRemovePathResults
        };
    }

    async ipfsRemovePin(pin, kwargs = {}) {
        let ipfsClusterRemovePinResults = null;
        let ipfsRemovePinResults = null;
        if (this.role === "master") {
            ipfsClusterRemovePinResults = await this.ipfsClusterCtl.ipfsClusterCtlRemovePin(pin, kwargs);
            ipfsRemovePinResults = await this.ipfs.ipfsRemovePin(pin, kwargs);
        } else if (this.role === "worker" || this.role === "leecher") {
            ipfsRemovePinResults = await this.ipfs.ipfsRemovePin(pin, kwargs);
        }

        return {
            ipfsClusterRemovePin: ipfsClusterRemovePinResults,
            ipfsRemovePin: ipfsRemovePinResults
        };
    }


    async testInstall() {
        if (this.role === "master") {
            return {
                ipfs_cluster_service: await this.installIpfs.ipfsClusterServiceTestInstall(),
                ipfs_cluster_ctl: await this.installIpfs.ipfsClusterCtlTestInstall(),
                ipfs: await this.installIpfs.ipfsTestInstall()
            };
        } else if (this.role === "worker") {
            return {
                ipfs_cluster_follow: await this.installIpfs.ipfsClusterFollowTestInstall(),
                ipfs: await this.installIpfs.ipfsTestInstall()
            };
        } else if (this.role === "leecher") {
            return await this.installIpfs.ipfsTestInstall();
        } else {
            throw new Error("role is not master, worker, or leecher");
        }
    }

    async ipfsGetPinset() {
        let ipfsPinsetResults = null;
        try{
            ipfsPinsetResults = await this.ipfs.ipfsGetPinset();
        }
        catch(e){
            ipfsPinsetResults = e;
            console.error(e);
        }

        let ipfsClusterPinsetResults = null;

        try{
            if (this.role === "master") {
                ipfsClusterPinsetResults = await ipfsClusterctl.ipfsClusterGetPinset();
            } else if (this.role === "worker") {
                ipfsClusterPinsetResults = await this.ipfsClusterFollow.ipfsFollowList();
            } else if (this.role === "leecher") {
                // No action for leecher
            }    
        }
        catch(e){
            ipfsClusterPinsetResults = e;
            console.error(e);
        }

        return {
            ipfsCluster: ipfsClusterPinsetResults,
            ipfs: ipfsPinsetResults
        };
    }

    async ipfsKitStop() {
        let ipfsClusterService = null;
        let ipfsClusterFollow = null;
        let ipfs = null;

        if (this.role === "master") {
            try {
                ipfsClusterService = await this.ipfsClusterService.ipfsClusterserviceStop();
            } catch (e) {
                ipfsClusterService = e;
                console.error(e);
            }
            try {
                ipfs = await this.ipfs.daemonStop();
            } catch (e) {
                ipfs = e;
                console.error(e);
            }
        } else if (this.role === "worker") {
            try {
                ipfsClusterFollow = await this.ipfsClusterFollow.ipfsFollowStop();
            } catch (e) {
                ipfsClusterFollow = e;
                console.error(e);
            }
            try {
                ipfs = await this.ipfs.daemonStop();
            } catch (e) {
                ipfs = e;
                console.error(e);
            }
        } else if (this.role === "leecher") {
            try {
                ipfs = await this.ipfs.daemonStop();
            } catch (e) {
                ipfs = e;
                console.error(e);
            }
        }

        return {
            ipfsClusterService: ipfsClusterService,
            ipfsClusterFollow: ipfsClusterFollow,
            ipfs: ipfs
        };
    }

    async ipfsKitStart() {
        let ipfsClusterService = null;
        let ipfsClusterFollow = null;
        let ipfs = null;

        if (this.role === "master") {
            try {
                ipfs = await this.ipfs.daemonStart();
            } catch (e) {
                ipfs = e;
                console.error(e);   
            }
            try {
                ipfsClusterService = await this.ipfsClusterService.ipfsClusterServiceStart();
            } catch (e) {
                ipfsClusterService = e;
                console.error(e);
            }
        } else if (this.role === "worker") {
            try {
                ipfs = await this.ipfs.daemonStart();
            } catch (e) {
                ipfs = e
                console.error(e);
            }
            try {
                ipfsClusterFollow = await this.ipfsClusterFollow.ipfsFollowStart();
            } catch (e) {
                ipfsClusterFollow = e;
                console.error(e);
            }
        } else if (this.role === "leecher") {
            try {
                ipfs = await this.ipfs.daemonStart();
            } catch (e) {
                ipfs = e;
                console.error(e);
            }
        }

        return {
            ipfsClusterService: ipfsClusterService,
            ipfsClusterFollow: ipfsClusterFollow,
            ipfs: ipfs
        };
    }


    async ipfsGetConfig() {
        let ipfsGetConfigResults = null;
        try{
            ipfsGetConfigResults = await this.ipfs.ipfsGetConfig();
            this.ipfsConfig = ipfsGetConfigResults;
        }
        catch(e){
            ipfsGetConfigResults = e;
            console.error(e);
        }

        return {
            ipfsGetConfig: ipfsGetConfigResults
        };
    }

    async ipfsSetConfig(newConfig) {
        let ipfsSetConfigResults = null;
        try{
            ipfsSetConfigResults = await this.ipfs.ipfsSetConfig(newConfig);
            this.ipfsConfig = ipfsSetConfigResults;
        }
        catch(e){
            ipfsSetConfigResults = e;
            console.error(e);
        }

        return {
            ipfsSetConfig: ipfsSetConfigResults
        };
    }

    async ipfsGetConfigValue(key) {
        let ipfsGetConfigValueResults = null;
        try{
            ipfsGetConfigValueResults = await this.ipfs.ipfsGetConfigValue(key);
        }
        catch(e){
            ipfsGetConfigValueResults = e;
            console.error(e);
        }
        
        return {
            ipfsGetConfigValue: ipfsGetConfigValueResults
        };
    }

    async ipfsSetConfigValue(key, value) {
        let ipfsSetConfigValueResults = null;
        try{
            ipfsSetConfigValueResults = await this.ipfs.ipfsSetConfigValue(key, value);
        }
        catch(e){
            ipfsSetConfigValueResults = e;
            console.error(e);
        }

        return {
            ipfsSetConfigValue: ipfsSetConfigValueResults
        };
    }
    

    async ipfsGetConfigBak() {
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

    async ipfsSetConfigBak(newConfig) {
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

    async ipfsGetConfigValueBak(key) {
        const command = `ipfs config ${key}`;
        try {
            const { stdout } = await execProm(command);
            return JSON.parse(stdout);
        } catch (error) {
            console.error("command failed", command, error);
            throw new Error("command failed");
        }
    }

    async ipfsSetConfigValueBak(key, value) {
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
        let thisFile = file;
        let thisFileBasename = path.basename(thisFile);
        let thisFileDirname = path.dirname(thisFile);
        let thisFileStat = fs.statSync(thisFile);
        let ipfsUploadObjectResults = null;
        try {
            this.ipfs.add(thisFile, { recursive: true });
            ipfsUploadObjectResults = this.ipfs.namePublish(thisFile);
        }
        catch (e) {
            ipfsUploadObjectResults = e;
            console.error(e);
        }

        return {
            ipfsUploadObject: ipfsUploadObjectResults
        };
    }

    async ipfsUploadObjectBak({ file }) {
        return this.uploadObject(file);
    }

    async ipgetDownloadObject(kwargs) {
        let thisCid = kwargs.cid;
        let thisPath = kwargs.path;
        let ipgetDownloadObjectResults = null;
        try {
            ipgetDownloadObjectResults = this.ipget.ipgetDownloadObject(thisCid, thisPath);
        } catch (e) {
            ipgetDownloadObjectResults = e;
            console.error(e);
        }
        
        return {
            ipgetDownloadObject: ipgetDownloadObjectResults
        };
    }


    async ipgetDownloadObjectBak(kwargs) {
        return this.ipget.ipgetDownloadObject(kwargs);
    }

    async updateCollectionIpfs(collection, collectionPath) {
        let thisCollectionIpfs = null;
        let ipfsAddPathRecursiveCmd = `ipfs add -r ${collectionPath}`;

        try {
            let { stdout: ipfsAddPathRecursiveResults } = await execProm(ipfsAddPathRecursiveCmd);
            ipfsAddPathRecursiveResults = ipfsAddPathRecursiveResults.split("\n").map(line => line.split(" "));

            if (ipfsAddPathRecursiveResults.length === 2) {
                thisCollectionIpfs = ipfsAddPathRecursiveResults[ipfsAddPathRecursiveResults.length - 2][1];
            }

            let metadata = ["path=/collection.json"];
            let argstring = metadata.map(item => ` --metadata ${item}`).join('');

            let ipfsClusterCtlAddPinCmd = `ipfs-cluster-ctl pin add ${thisCollectionIpfs}${argstring}`;
            let ipfsClusterCtlAddPinResults = await execProm(ipfsClusterCtlAddPinCmd);

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

    async testIpfsKit() {

        let test_ipfs_kit_start = null;
        let test_ipfs_kit_ready = null;
        let test_ipfs_kit_stop = null;
        let test_ipfs_get_pinset = null;
        let test_ipfs_add_pin = null;
        let test_ipfs_remove_pin = null;
        let test_ipfs_add_path = null;
        let test_ipfs_remove_path = null;
        let test_ipfs_ls_path = null;
        let test_ipfs_get_config = null;
        let test_ipfs_set_config = null;
        let test_ipfs_name_resolve = null;
        let test_ipfs_name_publish = null;
        let test_ipfs_get_config_value = null;
        let test_ipfs_set_config_value = null;
        let test_update_collection_ipfs = null;
        let test_ipget_download_object = null;
        let test_ipfs_upload_object = null;
        let test_load_collection = null;

        try {
            test_ipfs_kit_start = await this.ipfsKitStart();
        } catch (e) {
            test_ipfs_kit_start = e;
            console.error(e);
        }

        try {
            test_ipfs_kit_ready = await this.ipfsKitReady();
        } catch (e) {
            test_ipfs_kit_ready = e;
            console.error(e);
        }

        try {
            test_load_collection = await this.loadCollection();
        } catch (e) {
            test_load_collection = e;
            console.error(e);
        }

        try{
            test_ipfs_get_config = await this.ipfsGetConfig();
        }
        catch(e){
            test_ipfs_get_config = e;
            console.error(e);
        }

        try{
            test_ipfs_set_config = await this.ipfsSetConfig();
        }
        catch(e){
            test_ipfs_set_config = e;
            console.error(e);
        }

        try{
            test_ipfs_name_resolve = await this.nameResolve();
        }
        catch(e){
            test_ipfs_name_resolve = e;
            console.error(e);
        }

        try{
            test_ipfs_name_publish = await this.namePublish();
        }
        catch(e){
            test_ipfs_name_publish = e;
            console.error(e);
        }

        try{
            test_ipfs_get_config_value = await this.ipfsGetConfigValue();
        }
        catch(e){
            test_ipfs_get_config_value = e;
            console.error(e);
        }

        try{
            test_ipfs_set_config_value = await this.ipfsSetConfigValue();
        }
        catch(e){
            test_ipfs_set_config_value = e;
            console.error(e);
        }

        try {
            test_update_collection_ipfs = await this.updateCollectionIpfs();
        }
        catch (e) {
            test_update_collection_ipfs = e;
            console.error(e);
        }

        try {
            test_ipfs_add_path = await this.ipfsAddPath();
        }
        catch (e) {
            test_ipfs_add_path = e;
            console.error(e);
        }

        try {
            test_ipfs_remove_path = await this.ipfsRemovePath();
        }
        catch (e) {
            test_ipfs_remove_path = e;
            console.error(e);
        }

        try {
            test_ipfs_ls_path = await this.ipfsLsPath();
        }
        catch (e) {
            test_ipfs_ls_path = e;
            console.error(e);
        }

        try {
            test_ipfs_get_pinset = await this.ipfsGetPinset();
        } catch (e) {
            test_ipfs_get_pinset = e;
            console.error(e);
        }

        try {
            test_ipfs_add_pin = await this.ipfsAddPin
        } catch (e) {
            test_ipfs_add_pin = e;
            console.error(e);
        }

        try {
            test_ipfs_remove_pin = await this.ipfsRemovePin();
        } catch (e) {
            test_ipfs_remove_pin = e;
            console.error(e);
        }

        try {
            test_ipget_download_object = await this.ipgetDownloadObject();
        } catch (e) {
            test_ipget_download_object = e;
            console.error(e);
        }

        try {
            test_ipfs_upload_object = await this.ipfsUploadObject();
        }
        catch (e) {
            test_ipfs_upload_object = e;
            console.error(e);
        }

        try {
            test_ipfs_kit_stop = await this.ipfsKitStop();
        }
        catch (e) {
            test_ipfs_kit_stop = e;
            console.error(e);
        }

        let results = {
            test_ipfs_kit_start: test_ipfs_kit_start,
            test_ipfs_kit_ready: test_ipfs_kit_ready,
            test_ipfs_kit_stop: test_ipfs_kit_stop,
            test_ipfs_get_pinset: test_ipfs_get_pinset,
            test_ipfs_add_pin: test_ipfs_add_pin,
            test_ipfs_remove_pin: test_ipfs_remove_pin,
            test_ipfs_get: test_ipfs_get,
            test_ipget_download_object: test_ipget_download_object,
            test_ipfs_upload_object: test_ipfs_upload_object,
            test_load_collection: test_load_collection
        };

        return results;

    }

}


if (import.meta.url === import.meta.url) {
    const meta = {
        role: "master",
        clusterName: "cloudkit_storage",
        clusterLocation: "/ip4/167.99.96.231/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv",
        secret: "96d5952479d0a2f9fbf55076e5ee04802f15ae5452b5faafc98e2bd48cf564d3",
    };
    const ipfs_kit_instance = new IpfsKit(null, meta);
    const test_ipfs = await ipfs_kit_instance.testIpfsKit();
    console.log(test_ipfs);
}


