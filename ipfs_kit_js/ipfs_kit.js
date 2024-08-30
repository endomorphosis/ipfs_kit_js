import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import Ipfs from './ipfs.js';
import ipget from './ipget.js';
import IpfsClusterCtl from './ipfs_cluster_ctl.js';
import IpfsClusterFollow from './ipfs_cluster_follow.js';
import IpfsClusterService from './ipfs_cluster_service.js'; 
const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);
const execProm = promisify(exec);
import { requireConfig } from '../config/config.js';

export class ipfsKitJs {
    constructor(resources, meta = null) {
        this.thisDir = path.dirname(import.meta.url);
        if (this.thisDir.startsWith("file://")) {
            this.thisDir = this.thisDir.replace("file://", "");
        }
        this.parentDir = path.dirname(this.thisDir);
        if (fs.existsSync(path.join(this.parentDir, "config", "config.toml"))) {
            this.config = new requireConfig({config: path.join(this.parentDir, "config", "config.toml")});
        }
        else{
            // this.config = new requireConfig();
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
            else{
                this.clusterName = 'cloudkit_storage';
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
            this.ipget = new ipget(resources, meta);
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

    async ipfsKitReady(kwargs = {} ) {
        let clusterName = kwargs.clusterName || this.clusterName;
        if (!clusterName && this.role !== "leecher") {
            throw new Error("clusterName is not defined");
        }

        let ready = false;
        let ipfsReady = false;
        let ipfsClusterReady = false;

        let psDaemonCmd  = "ps -ef | grep ipfs | grep daemon | grep -v grep | wc -l";
        let psDaemonCmdResults = execSync(psDaemonCmd).toString().trim();
        if (parseInt(psDaemonCmdResults) > 0) {
            ipfsReady = true;
        }

        if (this.role === "master") {
            ipfsClusterReady =  this.ipfsClusterService.ipfsClusterServiceReady();
        } else if (this.role === "worker") {
            let dataIpfsFollow = await this.ipfsClusterFollow.ipfsFollowInfo();
            if (dataIpfsFollow.clusterPeerOnline === 'true' && dataIpfsFollow.ipfsPeerOnline === 'true' && dataIpfsFollow.clusterName === clusterName) {
                ipfsClusterReady = true;
            }
        }

        if (this.role === "leecher" && ipfsReady) {
            ready = true;
        } else if (this.role !== "leecher" && ipfsReady && ipfsClusterReady) {
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
        let dstPath = this.localPath || kwargs.path;
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
            ipget = await this.ipget.ipgetDownloadObject(pin, dstPath);
        } catch (e) {
            ipget = e.toString();
            console.error(e);
        }

        let ipfsAddPinResult = null;
        let ipfsClusterCtlAddPinResult = null;
        if (this.role === "master") {
            ipfsAddPinResult = await this.ipfs.ipfsAddPin(pin, kwargs);
            ipfsClusterCtlAddPinResult = await this.ipfsClusterCtl.ipfsClusterCtlAddPin(pin, ipget);
        } else if (this.role === "worker" || this.role === "leecher") {
            ipfsAddPinResult = await this.ipfs.ipfsAddPin(pin, kwargs);
        }

        return {
            ipfsClusterCtlAddPin: ipfsClusterCtlAddPinResult,
            ipfsAddPin: ipfsAddPinResult,
            ipget: ipget
        };
    }

    async ipfsAddPath(path, kwargs = {}) {
        let ipfsAddPathResult = null;
        let ipfsClusterCtlAddPathResult = null;
        if (this.role === "master") {
            ipfsAddPathResult = await this.ipfs.ipfsAddPath(path, kwargs);
            let cids = ipfsAddPathResult.results
            ipfsClusterCtlAddPathResult = await this.ipfsClusterCtl.ipfsClusterCtlAddPath(path, cids);
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
            if (ipfsLsPathResults.results !== null && typeof ipfsLsPathResults.results === 'object') {
                ipfsLsPathResults.results = ipfsLsPathResults.results.filter(item => item !== "");   
            }
        }
        catch(e){
            ipfsLsPathResults = e;
            console.error(e);
        }

        return {
            ipfsLsPath: ipfsLsPathResults
        };
    }

    async nameResolve(srcIPNS, kwargs = {}) {
        let ipfsNameResolveResults = null;
        try{
            ipfsNameResolveResults = await this.ipfs.ipfsNameResolve(srcIPNS, kwargs);
        }
        catch(e){
            ipfsNameResolveResults = e;
            console.error(e);
        }
        return {
            ipfsNameResolve: ipfsNameResolveResults
        };
    }

    async namePublish(cid, kwargs = {}) {
        let ipfsNamePublishResults = null;
        try{
            ipfsNamePublishResults = await this.ipfs.ipfsNamePublish(cid, kwargs);
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
        let cids = [];
        let ipfsRemovePathResults = null;
        if (this.role === "master") {
            ipfsRemovePathResults = await this.ipfs.ipfsRemovePath(path, kwargs);
            console.log(ipfsRemovePathResults);
            for (var i = 0; i < ipfsRemovePathResults.pinRm.results.length; i++) {
                cids.push(ipfsRemovePathResults.pinRm.results[i].split(" ")[1]);
            }
            ipfsClusterCtlRemovePathResults = await this.ipfsClusterCtl.ipfsClusterCtlRemovePath(path, cids);
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
            ipfsRemovePinResults = await this.ipfs.ipfsRemovePin(pin, kwargs);
            ipfsClusterRemovePinResults = await this.ipfsClusterCtl.ipfsClusterCtlRemovePin(pin, kwargs);
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
                ipfsClusterPinsetResults = await this.ipfsClusterCtl.ipfsClusterCtlGetPinset();
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
                ipfsClusterService = await this.ipfsClusterService.ipfsClusterServiceStop();
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

    async ipfsUploadObject(file) {
        if (!file) {
            throw new Error("file is not defined");
        }

        let thisFile = file;
        let thisFileBasename = path.basename(thisFile);
        let thisFileDirname = path.dirname(thisFile);
        let thisFileStat = fs.statSync(thisFile);
        let ipfsUploadObjectResults = null;
        let ipfsNamePublishResults = null;
        try {
            ipfsUploadObjectResults = await this.ipfs.ipfsAddPath(thisFile);
            ipfsNamePublishResults = await this.ipfs.ipfsNamePublish(thisFile);
        }
        catch (e) {
            ipfsUploadObjectResults = e;
            console.error(e);
        }

        return {
            ipfsUploadObject: ipfsUploadObjectResults,
            fileStat: thisFileStat,
        };
    }

    async ipfsUploadObjectBak({ file }) {
        return this.uploadObject(file);
    }

    async ipgetDownloadObject(thisCid, thisPath, kwargs = {}) {
        let cid = thisCid || kwargs.cid;
        let dstPath = thisPath || kwargs.path;
        let ipgetDownloadObjectResults = null;
        try {
            ipgetDownloadObjectResults = await this.ipget.ipgetDownloadObject(cid, dstPath, kwargs);
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

        if (!collection) {
            throw new Error("collection is not defined");
        }

        if (!collectionPath) {
            throw new Error("collectionPath is not defined");
        }

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

}

export default ipfsKitJs;