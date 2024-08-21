import { ipfsKitJs } from "../ipfs_kit_js/ipfs_kit";
import { IpfsClusterService } from "../ipfs_kit_js/ipfs_cluster_service";
import { IpfsClusterFollow } from "../ipfs_kit_js/ipfs_cluster_follow";

export default class ipfs_kit_tests {
    constructor() {

    }

    async init() {
        const meta = {
            role: "master",
            clusterName: "cloudkit_storage",
            clusterLocation: "/ip4/167.99.96.231/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv",
            secret: "96d5952479d0a2f9fbf55076e5ee04802f15ae5452b5faafc98e2bd48cf564d3",
        };
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

        try{
            test_ipfs_get_config = await this.ipfsGetConfig();
        }
        catch(e){
            test_ipfs_get_config = e;
            console.error(e);
        }

        try{
            test_ipfs_set_config = await this.ipfsSetConfig(thisConfig);
        }
        catch(e){
            test_ipfs_set_config = e;
            console.error(e);
        }

        try{
            test_ipfs_name_publish = await this.namePublish(thisScriptName);
        }
        catch(e){
            test_ipfs_name_publish = e;
            console.error(e);
        }

        try{
            test_ipfs_name_resolve = await this.nameResolve(testIPNS);
        }
        catch(e){
            test_ipfs_name_resolve = e;
            console.error(e);
        }

        try{
            test_ipfs_set_config_value = await this.ipfsSetConfigValue('foo', 'bar');
        }
        catch(e){
            test_ipfs_set_config_value = e;
            console.error(e);
        }

        try{
            test_ipfs_get_config_value = await this.ipfsGetConfigValue('foo');
        }
        catch(e){
            test_ipfs_get_config_value = e;
            console.error(e);
        }

        // try {
        //     test_update_collection_ipfs = await this.updateCollectionIpfs();
        // }
        // catch (e) {
        //     test_update_collection_ipfs = e;
        //     console.error(e);
        // }

        try {
            test_ipfs_add_path = await this.ipfsAddPath(thisScriptName);
        }
        catch (e) {
            test_ipfs_add_path = e;
            console.error(e);
        }

        try {
            test_ipfs_remove_path = await this.ipfsRemovePath(thisScriptName);
        }
        catch (e) {
            test_ipfs_remove_path = e;
            console.error(e);
        }

        try {
            test_ipfs_ls_path = await this.ipfsLsPath(thisScriptName);
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
            test_ipfs_add_pin = await this.ipfsAddPin(testCidDownload);
        } catch (e) {
            test_ipfs_add_pin = e;
            console.error(e);
        }

        try {
            test_ipfs_remove_pin = await this.ipfsRemovePin(testCidDownload);
        } catch (e) {
            test_ipfs_remove_pin = e;
            console.error(e);
        }

        try {
            test_ipget_download_object = await this.ipgetDownloadObject(testCidDownload, testDownloadPath);
        } catch (e) {
            test_ipget_download_object = e;
            console.error(e);
        }

        try {
            test_ipfs_upload_object = await this.ipfsUploadObject(thisScriptName);
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
            test_ipget_download_object: test_ipget_download_object,
            test_ipfs_upload_object: test_ipfs_upload_object,
            test_load_collection: test_load_collection
        };

        return results;

    }

    async ipfs_cluster_serice_test(){
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
    
    async ipfs_cluster_service_test(){
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

    async ipfs_cluster_follow_test(){
        const meta = {
            role: "master",
            clusterName: "cloudkit_storage",
            clusterLocation: "/ip4/167.99.96.231/tcp/9096/p2p/12D3KooWKw9XCkdfnf8CkAseryCgS3VVoGQ6HUAkY91Qc6Fvn4yv",
            secret: "96d5952479d0a2f9fbf55076e5ee04802f15ae5452b5faafc98e2bd48cf564d3",
        };
        const thisIpfsClusterFollow = new IpfsClusterFollow(null, meta);
        const results = await thisIpfsClusterFollow.testIpfsClusterFollow();
        console.log(results);
    }

    async ipget_test() {
        
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

if (import.meta.url === import.meta.url) {
    let test = new ipfs_kit_tests();
    test.init().then(() => {
        test.ipfs_kit_test().then((results) => {
            console.log(results);
        }).catch((e) => {
            console.error(e);
        })
    }).catch((e) => {
        console.error(e);
    });
}
