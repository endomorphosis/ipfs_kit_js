import { exec, execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";


export class IpfsClusterCtl {
    constructor(resources, meta = null) {
        this.config = {};
        this.thisDir = path.dirname(import.meta.url);
        if (this.thisDir.startsWith("file://")) {
            this.thisDir = this.thisDir.replace("file://", "");
        }
        this.path = process.env.PATH;
        this.path = this.path + ":" + path.join(this.thisDir, "bin")
        this.pathString = "PATH="+ this.path
        
        if (meta !== null) {
            if ("config" in meta && meta['config'] !== null) {
                this.config = meta['config'];
            }
            if ("role" in meta && meta['role'] !== null) {
                if (["master", "worker", "leecher"].includes(meta['role'])) {
                    this.role = meta['role'];
                } else {
                    throw new Error("role is not either master, worker, leecher");
                }
            }
        }

        // Any additional setup for roles can be added here
        if (["leecher", "worker", "master"].includes(this.role)) {
            // Perform role-specific initialization
        }
    }
    
    // Helper function to recursively walk through directory
    walkSync(dir, fileList = []) {
        fs.readdirSync(dir).forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                this.walkSync(filePath, fileList);
            } else {
                fileList.push(filePath);
            }
        });
        return fileList;
    }

    async ipfsClusterCtlAddPin(dirPath, metadata = {}) {
        if (!fs.existsSync(dirPath)) {
            throw new Error("Path not found");
        }
        
        const files = this.walkSync(dirPath);
        const results = files.map(file => {
            const relativePath = path.relative(dirPath, file);
            let argString = metadata[relativePath] ? ` --metadata ${metadata[relativePath]}` : "";
            let command = this.pathString + ` ipfs-cluster-ctl pin add ${file}${argString}`;
            try {
                const output = execSync(command).toString();
                return output;
            } catch (error) {
                console.error(`Failed to execute command for file ${file}: ${error}`);
                return null;
            }
        });

        return results.filter(result => result !== null);
    }


    async ipfsClusterCtlRemovePin(dirPath) {
        if (!fs.existsSync(dirPath)) {
            throw new Error("Path not found");
        }

        const files = this.walkSync(dirPath);
        const results = files.map(file => {
            let command = this.pathString + ` ipfs-cluster-ctl pin rm ${file}`;
            try {
                const output = execSync(command).toString();
                return `Unpinned: ${file}`;
            } catch (error) {
                console.error(`Failed to execute command for file ${file}: ${error}`);
                return `Failed to unpin: ${file}`;
            }
        });

        return results;
    }


    // Simplified directory traversal for demonstration
    async getDirectories(basePath) {
        return fs.readdirSync(basePath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => path.join(basePath, dirent.name));
    }

    async ipfsClusterCtlAddPinRecursive(dirPath, metadata = {}) {
        if (!fs.existsSync(dirPath)) {
            throw new Error("Path not found");
        }

        // If the path is a directory, traverse and pin each subdirectory recursively.
        // Otherwise, pin the file directly.
        let targets = fs.statSync(dirPath).isDirectory() ? this.getDirectories(dirPath) : [dirPath];
        const results = targets.map(target => {
            const relativePath = path.relative(dirPath, target);
            let argString = metadata[relativePath] ? ` --metadata ${metadata[relativePath]}` : "";
            let command = this.pathString + ` ipfs-cluster-ctl pin add -r ${target}${argString}`;

            try {
                const output = execSync(command, { encoding: 'utf-8' });
                return `Pinned: ${target}`;
            } catch (error) {
                console.error(`Failed to execute command for ${target}: ${error.message}`);
                return `Failed to pin: ${target}`;
            }
        });

        return results;
    }


    async ipfsClusterCtlExecute(args) {
        if (!this.options.includes(args[0])) {
            console.error(`"${args[0]}" is not a valid command.`);
            return;
        }

        let command = `${this.executable}${args[0]}`;

        if (args[1]) {
            command += ` ${args[1]}`;

            // Validate subcommands for certain options
            switch (args[0]) {
                case "peers":
                    if (!["ls", "rm"].includes(args[1])) {
                        throw new Error("Invalid option for 'peers'");
                    }
                    break;
                case "pin":
                    if (!["add", "rm", "ls", "update"].includes(args[1])) {
                        throw new Error("Invalid option for 'pin'");
                    }
                    break;
                case "health":
                    if (!["graph", "metrics", "alerts"].includes(args[1])) {
                        throw new Error("Invalid option for 'health'");
                    }
                    break;
                case "ipfs":
                    if (args[1] !== "gc") {
                        throw new Error("Invalid option for 'ipfs'");
                    }
                    break;
            }
        }

        // Special handling for the 'add' command with multiple options
        if (args[0] === "add" && args.length > 2) {
            const path = args.pop(); // Assuming the last argument is always the path
            const options = args.slice(1).join(" ");
            command = `${this.executable}add ${options} ${path}`;
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
    }


    async getPinset() {
        // Create a temporary file path
        const tempFile = path.join(os.tmpdir(), `pinset-${Date.now()}.txt`);
        try {
            // Redirect output of the command to the temporary file
            execSync(this.pathString + ` ipfs-cluster-ctl pin ls > ${tempFile}`);
            
            // Read and parse the temporary file
            const fileData = fs.readFileSync(tempFile, 'utf8');
            const pinset = this.parsePinsetData(fileData);
            
            // Clean up the temporary file
            fs.unlinkSync(tempFile);

            return pinset;
        } catch (error) {
            console.error(`Failed to get pinset: ${error.message}`);
            // Clean up the temporary file in case of an error
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
            return {};
        }
    }

    parsePinsetData(fileData) {
        const pinset = {};
        const parseResults = fileData.split("\n");
        parseResults.forEach(resultLine => {
            const resultsList = resultLine.split(" | ");
            if (resultsList.length > 1) { // Ensure it's not an empty line
                const resultDict = {};
                resultsList.forEach(cell => {
                    const cellSplit = cell.split(":").map(part => part.trim());
                    if (cellSplit.length > 1) {
                        resultDict[cellSplit[0]] = cellSplit[1];
                    }
                });
                if (Object.keys(resultDict).length > 0) {
                    pinset[resultsList[0]] = resultDict;
                }
            }
        });
        return pinset;
    }

    ipfsClusterCtlStatus() {
        let ipfsClusterCtlStatusCmd = this.pathString + " ipfs-cluster-ctl status";
        let ipfsClusterCtlStatusResults = null;
        try {
            ipfsClusterCtlStatusResults = execSync(command, { encoding: 'utf8' });
        } catch (error) {
            ipfsClusterCtlStatusResults = error;
            console.error(`Error executing command "${ipfsClusterCtlStatusCmd}" : ${error}`);
        }

        return {
            ipfsClusterCtlStatus :ipfsClusterCtlStatusResults
        }
    }

    testIPFSClusterCtl() {
        let detect = null;

        let detect_cmd = this.pathString + " which ipfs-cluster-ctl";
        exec(detect_cmd, (error, stdout) => {
            if (error) {
                console.error(`Error detecting ipfs-cluster-ctl: ${error}`);
                detect = error;                    
            } else {
                detect = stdout.trim();
            }
        });
        
        let test_ipfs_cluster_add_pin = null;
        try {
            test_ipfs_cluster_add_pin = this.ipfsClusterCtlAddPin("/tmp/test", {});
        }
        catch (error) {
            console.error(error);
            test_ipfs_cluster_add_pin = error;
        }

        let test_ipfs_cluster_remove_pin = null;
        try {
            test_ipfs_cluster_remove_pin = this.ipfsClusterCtlRemovePin("/tmp/test");
        }
        catch (error) {
            console.error(error);
            test_ipfs_cluster_remove_pin = error;
        }

        let test_ipfs_cluster_add_pin_recursive = null;
        try {
            test_ipfs_cluster_add_pin_recursive = this.ipfsClusterCtlAddPinRecursive("/tmp/test", {});
        }
        catch (error) {
            console.error(error);
            test_ipfs_cluster_add_pin_recursive = error;
        }

        let test_ipfs_cluster_ctl_execute = null;
        try {
            test_ipfs_cluster_ctl_execute = this.ipfs_cluster_ctl_execute(["peers", "ls"]);
        }
        catch (error) {
            console.error(error);
            test_ipfs_cluster_ctl_execute = error;
        }

        let test_get_pinset = null;

        try {
            test_get_pinset = this.getPinset();
        }
        catch (error) {
            console.error(error);
            test_get_pinset = error;
        }

        let test_parse_pinset_data = null;

        try {
            test_parse_pinset_data = this.parsePinsetData("test");
        }
        catch (error) {
            test_parse_pinset_data = error;
            console.error(error);
        }

        let test_ipfs_cluster_ctl_status = null;

        try {
            test_ipfs_cluster_ctl_status = this.ipfsClusterCtlStatus();
        }
        catch (error) {
            test_ipfs_cluster_ctl_status = error;
            console.error(error);
        }

        let results = {
            "detect": detect,
            "test_ipfs_cluster_add_pin": test_ipfs_cluster_add_pin,
            "test_ipfs_cluster_remove_pin": test_ipfs_cluster_remove_pin,
            "test_ipfs_cluster_add_pin_recursive": test_ipfs_cluster_add_pin_recursive,
            "test_ipfs_cluster_ctl_execute": test_ipfs_cluster_ctl_execute,
            "test_get_pinset": test_get_pinset,
            "test_parse_pinset_data": test_parse_pinset_data,
            "test_ipfs_cluster_ctl_status": test_ipfs_cluster_ctl_status
        };

        return results;

    }
}

function test()
{
    (async () => {

        if (results) {
            const status = thisIpfsClusterCtl.ipfsClusterCtlStatus();
            console.log(status);
        } else {
            console.log("ipfs-cluster-ctl is not installed.");
        }

        const thisIpfsClusterCtl = new IPFSClusterCtl();
        const results = await thisIpfsClusterCtl.testIPFSClusterCtl();
        console.log(results);

    })();

}

if (import.meta.url === import.meta.url) {
    test();
}
