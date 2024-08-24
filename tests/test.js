import { ipfsKitJs } from "../ipfs_kit_js/ipfs_kit.js";
import { IpfsClusterService } from "../ipfs_kit_js/ipfs_cluster_service.js";
import { IpfsClusterFollow } from "../ipfs_kit_js/ipfs_cluster_follow.js";
import { ipget } from "../ipfs_kit_js/ipget.js";
import { requireConfig } from "../config/config.js";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { t } from "tar";

export default class ipfs_kit_tests {
    constructor() {
        let meta = {
            role: "master",
            clusterName: "cloudkit_storage",
            clusterLocation: "/ip4/167.99.96.231/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv",
            secret: "96d5952479d0a2f9fbf55076e5ee04802f15ae5452b5faafc98e2bd48cf564d3",
        };
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
        for (let key in this.config) {
            this[key] = meta[key];
        }
        this.ipfsKitJs = new ipfsKitJs(null, meta);   
    }



    async ipfs_kit_test() {

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

        let testCidDownload =  "QmccfbkWLYs9K3yucc6b3eSt8s8fKcyRRt24e3CDaeRhM1";
        testCidDownload = 'QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq'

        let testIPNS = '/ipns/docs.ipfs.tech/introduction/'


        let testDownloadPath = "/tmp/test";
        let thisScriptName = path.join(this.thisDir, path.basename(import.meta.url));
        let thisScriptFolderName = path.dirname(thisScriptName);
        let thisConfig = path.join(thisScriptFolderName, "config");

        try {
            test_ipfs_kit_start = await this.ipfsKitJs.ipfsKitStart();
        } catch (e) {
            test_ipfs_kit_start = e;
            console.error(e);
        }

        try {
            test_ipfs_kit_ready = await this.ipfsKitJs.ipfsKitReady();
        } catch (e) {
            test_ipfs_kit_ready = e;
            console.error(e);
        }

        try{
            test_ipfs_get_config = await this.ipfsKitJs.ipfsGetConfig();
        }
        catch(e){
            test_ipfs_get_config = e;
            console.error(e);
        }

        try{
            test_ipfs_set_config = await this.ipfsKitJs.ipfsSetConfig(thisConfig);
        }
        catch(e){
            test_ipfs_set_config = e;
            console.error(e);
        }

        try{
            test_ipfs_name_publish = await this.ipfsKitJs.namePublish(thisScriptName);
        }
        catch(e){
            test_ipfs_name_publish = e;
            console.error(e);
        }

        try{
            test_ipfs_name_resolve = await this.ipfsKitJs.nameResolve(testIPNS);
        }
        catch(e){
            test_ipfs_name_resolve = e;
            console.error(e);
        }

        try{
            test_ipfs_set_config_value = await this.ipfsKitJs.ipfsSetConfigValue('foo', 'bar');
        }
        catch(e){
            test_ipfs_set_config_value = e;
            console.error(e);
        }

        try{
            test_ipfs_get_config_value = await this.ipfsKitJs.ipfsGetConfigValue('foo');
        }
        catch(e){
            test_ipfs_get_config_value = e;
            console.error(e);
        }

        try {
            test_ipfs_add_path = await this.ipfsKitJs.ipfsAddPath(thisScriptName);
        }
        catch (e) {
            test_ipfs_add_path = e;
            console.error(e);
        }

        try {
            test_ipfs_remove_path = await this.ipfsKitJs.ipfsRemovePath(thisScriptName);
        }
        catch (e) {
            test_ipfs_remove_path = e;
            console.error(e);
        }

        try {
            test_ipfs_ls_path = await this.ipfsKitJs.ipfsLsPath(thisScriptName);
        }
        catch (e) {
            test_ipfs_ls_path = e;
            console.error(e);
        }

        try {
            test_ipfs_get_pinset = await this.ipfsKitJs.ipfsGetPinset();
        } catch (e) {
            test_ipfs_get_pinset = e;
            console.error(e);
        }

        try {
            test_ipfs_add_pin = await this.ipfsKitJs.ipfsAddPin(testCidDownload);
        } catch (e) {
            test_ipfs_add_pin = e;
            console.error(e);
        }

        try {
            test_ipfs_remove_pin = await this.ipfsKitJs.ipfsRemovePin(testCidDownload);
        } catch (e) {
            test_ipfs_remove_pin = e;
            console.error(e);
        }

        try {
            test_ipget_download_object = await this.ipfsKitJs.ipgetDownloadObject(testCidDownload, testDownloadPath);
        } catch (e) {
            test_ipget_download_object = e;
            console.error(e);
        }

        try {
            test_ipfs_upload_object = await this.ipfsKitJs.ipfsUploadObject(thisScriptName);
        }
        catch (e) {
            test_ipfs_upload_object = e;
            console.error(e);
        }

        try {
            test_ipfs_kit_stop = await this.ipfsKitJs.ipfsKitStop();
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
            test_ipget_download_object: test_ipget_download_object,
            test_ipfs_upload_object: test_ipfs_upload_object,
            test_load_collection: test_load_collection
        };

        return results;

    }

}

export class ipfs_cluster_service_tests {
    constructor() {
        let meta = {
            role: "master",
            clusterName: "cloudkit_storage",
            clusterLocation: "/ip4/167.99.96.231/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv",
            secret: "96d5952479d0a2f9fbf55076e5ee04802f15ae5452b5faafc98e2bd48cf564d3",
        };
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
        for (let key in this.config) {
            this[key] = meta[key];
        }
        this.ipfsClusterService = new IpfsClusterService(null, meta); 
    }
    
    async ipfs_cluster_service_test(){
        let detect;
        try {
            detect = execSync(this.pathString + ' which ipfs-cluster-service').toString();
        } catch (error) {
            detect = '';
        }
    
        let testServiceStart = null;
        try{
            testServiceStart = await this.ipfsClusterService.ipfsClusterServiceStart();
        }
        catch(error){
            console.error(error);
            testServiceStart = error;
        }
        
        let testServiceStop = null;
        try{
            testServiceStop = await this.ipfsClusterService.ipfsClusterServiceStop();
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


export class ipfs_cluster_follow_tests {
    constructor() {
        let meta = {
            role: "master",
            clusterName: "cloudkit_storage",
            clusterLocation: "/ip4/167.99.96.231/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv",
            secret: "96d5952479d0a2f9fbf55076e5ee04802f15ae5452b5faafc98e2bd48cf564d3",
        };
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
        for (let key in this.config) {
            this[key] = meta[key];
        }
        this.ipfsClusterFollow = new IpfsClusterFollow(null, meta);
    }

    async ipfs_cluster_follow_test(){        
        let detect;
        try {
            detect = execSync( this.ipfsClusterFollow.pathString + ' which ipfs-cluster-follow').toString();
            detect = detect.trim();
        } catch (error) {
            detect = '';
        }

        let ipfsFollowStop = null;
        try{
            ipfsFollowStop = await this.ipfsClusterFollow.ipfsFollowStop();
        }
        catch(error){
            console.error(error);
            ipfsFollowStop = error;
        }

        let ipfsFollowStart = null;
        try{
            ipfsFollowStart = await this.ipfsClusterFollow.ipfsFollowStart();
        }
        catch(error){
            console.error(error);
            ipfsFollowStart = error;
        }

        // let testFollowRun = null;
        // try{
        //     testFollowRun = await this.ipfsFollowRun();
        // }
        // catch(error){
        //     console.error(error);
        //     testFollowRun = error;
        // }

        let testFollowList = null;
        try{
            testFollowList = await this.ipfsClusterFollow.ipfsFollowList();
        }
        catch(error){
            console.error(error);
            testFollowList = error;
        }

        let testFollowInfo = null;
        try{
            testFollowInfo = await this.ipfsClusterFollow.ipfsFollowInfo();
        }
        catch(error){
            console.error(error);
            testFollowInfo = error;
        }

        let results = {
            "detect": detect,
            // "testFollowRun": testFollowRun,
            "ipfsFollowStop": ipfsFollowStop,
            "ipfsFollowStart": ipfsFollowStart,
            "testFollowList": testFollowList,
            "testFollowInfo": testFollowInfo
        };
        return results;
    }
}

export class ipget_tests {
    constructor() {
        let meta = {
            role: "master",
            clusterName: "cloudkit_storage",
            clusterLocation: "/ip4/167.99.96.231/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv",
            secret: "96d5952479d0a2f9fbf55076e5ee04802f15ae5452b5faafc98e2bd48cf564d3",
        };
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
        for (let key in this.config) {
            this[key] = meta[key];
        }
        this.ipget = new ipget(null, meta);
    }

    async ipget_test() {
        try {
            // const whichIpget = execSync(this.pathString + ' which ipget').toString().trim();
            const ipgetDownloadObject = await this.ipget.ipgetDownloadObject({
                cid: "QmccfbkWLYs9K3yucc6b3eSt8s8fKcyRRt24e3CDaeRhM1",
                path: "/tmp/test"
            });
            let tmpFileSize = fs.statSync("/tmp/test").size;
            if (ipgetDownloadObject.cid !== "QmccfbkWLYs9K3yucc6b3eSt8s8fKcyRRt24e3CDaeRhM1") {
                return false;
            }
            if (fs.existsSync("/tmp/test") === false || tmpFileSize != ipgetDownloadObject.filesize) {
                return false;
            }
            return true;
        } catch (error) {
            console.log(error);
            return error;
        }
    }
}

if (import.meta.url === 'file://' + process.argv[1]) {
    let test_ipfs_kit = new ipfs_kit_tests();
    let test_ipfs_cluster_service = new ipfs_cluster_service_tests();
    let test_ipfs_cluster_follow = new ipfs_cluster_follow_tests();
    let test_ipget = new ipget_tests();
    let test_results = {}
    try{    
        await test_ipget.ipget_test().then((results) => {
            console.log("ipget_test results: ");
            console.log(results);
            test_results.ipget_test = results;
        }).catch((e) => {
            test_results.ipget_test = e;
            console.error(e);
            throw e;
        });

        await test_ipfs_cluster_follow.ipfs_cluster_follow_test().then((results) => {
            console.log("ipfs_cluster_follow_test results: ");
            console.log(results);
            test_results.ipfs_cluster_follow_test = results;
            test_ipfs_cluster_follow.ipfsClusterFollow.ipfsFollowStop().then((results) => {
                console.log(results);
            }).catch((e) => {
                console.error(e);
                throw e;
            })
        }).catch((e) => {
            test_results.ipfs_cluster_follow_test = e;
            test_ipfs_cluster_follow.ipfsClusterFollow.ipfsFollowStop().then((results) => {
                console.log(results);
            }).catch((e) => {
                console.error(e);
            })
            console.error(e);
            throw e;
        });

        await test_ipfs_cluster_service.ipfs_cluster_service_test().then((results) => {
            console.log("ipfs_cluster_service_test results: ");
            console.log(results);
            test_results.ipfs_cluster_service_test = results;
            test_ipfs_cluster_service.ipfsClusterService.ipfsClusterServiceStop().then((results) => {
                console.log(results);
            }).catch((e) => {
                console.error(e);
                throw e;
            });
        }).catch((e) => {
            testResults.ipfs_cluster_service_test = e;
            test_ipfs_cluster_service.ipfsClusterService.ipfsClusterServiceStop().then((results) => {
                console.log(results);
            }).catch((e) => {
                console.error(e);
            })
            console.error(e);
            throw e;
        });

        await test_ipfs_kit.ipfs_kit_test().then((results) => {
            console.log("ipfs_kit_test results: ");
            console.log(results);
            test_results.ipfs_kit_test = results;
            test_ipfs_kit.ipfsKitJs.ipfsKitStop().then((results) => {
                console.log(results);
            }).catch((e) => {
                console.error(e);
                throw e;
            });
        }).catch((e) => {
            testResults.ipfs_kit_test = e;
            test_ipfs_kit.ipfsKitJs.ipfsKitStop().then((results) => {
                console.log(results);
            }).catch((e) => {
                console.error(e);
            })
            console.error(e);
            throw e;
        })

    }
    catch(e){
        console.error(e);
        test_results.test_results = e;
    }
    console.log(test_results);
    fs.writeFileSync("./test_results.json", JSON.stringify(test_results, null, 2));
    let testResultsFile = path.join(thisScriptFolderName, "README.md");
    let testResults = "";
    for (let key in test_results) {
        testResults += key + "\n";
        testResults += "```json\n";
        testResults += JSON.stringify(test_results[key], null, 2);
        testResults += "\n```\n";
    }
    fs.writeFileSync(testResultsFile, testResults);
    if (Object.keys(test_results).includes("test_results") === false) {
        process.exit(0);
    }
    else{
        process.exit(1);
    }   
}
