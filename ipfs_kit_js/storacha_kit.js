import { exec,  execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export class storacha_kit {
    constructor(resources=null, metadata = null) {
        this.resources = resources;
        this.metadata = metadata;
    }

    test() {
        console.log("ipget test");
    }
}

export { storacha_kit as default };