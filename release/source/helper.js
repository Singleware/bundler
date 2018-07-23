"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Helper_1;
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Fs = require("fs");
const Path = require("path");
const Util = require("util");
const Class = require("@singleware/class");
/**
 * Helper class.
 */
let Helper = Helper_1 = class Helper {
    /**
     * Read all content of the specified file path.
     * @param path Path.
     * @returns Returns the file content.
     */
    static async readFile(path) {
        return (await Util.promisify(Fs.readFile)(path)).toString('utf-8');
    }
    /**
     * Read all files from the specified directory path.
     * @param path Path.
     * @returns Returns the list of files.
     */
    static async readDirectory(path) {
        return await Util.promisify(Fs.readdir)(path);
    }
    /**
     * Creates a dependency entry for the specified code.
     * @param name Dependency name.
     * @param pack Determines whether the entry is a pack or not.
     * @param code Dependency code.
     * @returns Returns the dependency entry code.
     */
    static createEntry(name, pack, code) {
        return `"${name}":{pack:${pack ? 'true' : 'false'}, invoke:function(exports, require){${code}}}`;
    }
    /**
     * Creates a dependency link to another dependency.
     * @param name Dependency name.
     * @param link Dependency link name.
     * @returns Returns the dependency entry code.
     */
    static createLink(name, link) {
        return Helper_1.createEntry(name, true, `Object.assign(exports, require('${link}'));`);
    }
    /**
     * Create a model and write it into the target file.
     * @param target Target file.
     * @param entries Input entries.
     */
    static async createModel(target, entries) {
        const path = Path.join(Path.dirname(Path.dirname(__dirname)), '/assets/loader.js');
        const model = await Helper_1.readFile(path);
        await Util.promisify(Fs.writeFile)(target, model.replace(`'!MODULES!'`, `{${entries.join(',')}}`));
    }
    /**
     * Load the specified file and insert a new entry if the provided file is valid.
     * @param source Source information.
     * @param entries Output entries.
     */
    static async loadFile(source, entries) {
        if (Path.extname(source.path) === '.js') {
            const code = await Helper_1.readFile(source.path);
            const file = Path.basename(source.name);
            if (file === 'index') {
                entries.push(Helper_1.createEntry(source.name, false, code));
                entries.push(Helper_1.createLink(Path.dirname(source.name), file));
            }
            else {
                entries.push(Helper_1.createEntry(source.name, false, code));
            }
        }
    }
    /**
     * Load the all files from the specified directory and insert all valid output entries.
     * @param source Source information.
     * @param entries Output entries.
     */
    static async loadDirectory(source, entries) {
        const files = await Helper_1.readDirectory(source.path);
        for (const file of files) {
            const path = Path.join(source.path, file);
            const stat = Fs.statSync(path);
            if (stat.isDirectory()) {
                await Helper_1.loadDirectory({ name: `${source.name}/${file}`, path: path }, entries);
            }
            else if (stat.isFile()) {
                await Helper_1.loadFile({ name: `${source.name}/${file.substr(0, file.length - 3)}`, path: path }, entries);
            }
        }
    }
    /**
     * Load all valid files and directories and insert all valid output entries.
     * @param source Source information.
     * @param entries Output entries.
     */
    static async loadPath(source, entries) {
        const stat = Fs.statSync(source.path);
        if (stat.isDirectory()) {
            await Helper_1.loadDirectory(source, entries);
        }
        else if (stat.isFile()) {
            await Helper_1.loadFile(source, entries);
        }
    }
    /**
     * Load the specified package.json and insert all valid output entries.
     * @param source Source information.
     * @param entries Output entries.
     */
    static async loadPackage(source, entries, cache) {
        const json = JSON.parse(await Helper_1.readFile(Path.join(source.path, 'package.json')));
        const dependencies = json.dependencies || {};
        for (const name in dependencies) {
            if (!cache.has(name)) {
                cache.add(name);
                await Helper_1.loadPackage({ name: name, path: `node_modules/${name}`, package: true }, entries, cache);
            }
        }
        if (json.main) {
            await Helper_1.loadDirectory({ name: source.name, path: Path.join(source.path, Path.dirname(json.main)) }, entries);
        }
    }
    /**
     * Compile all specified sources according to the provided settings.
     * @param settings Compiler settings.
     */
    static async compile(settings) {
        const entries = [];
        const cache = new Set();
        for (const source of settings.sources) {
            if (source.package) {
                await Helper_1.loadPackage(source, entries, cache);
            }
            else {
                await Helper_1.loadPath(source, entries);
            }
        }
        await Helper_1.createModel(settings.output, entries);
    }
};
__decorate([
    Class.Private()
], Helper, "readFile", null);
__decorate([
    Class.Private()
], Helper, "readDirectory", null);
__decorate([
    Class.Private()
], Helper, "createEntry", null);
__decorate([
    Class.Private()
], Helper, "createLink", null);
__decorate([
    Class.Private()
], Helper, "createModel", null);
__decorate([
    Class.Private()
], Helper, "loadFile", null);
__decorate([
    Class.Private()
], Helper, "loadDirectory", null);
__decorate([
    Class.Private()
], Helper, "loadPath", null);
__decorate([
    Class.Private()
], Helper, "loadPackage", null);
__decorate([
    Class.Public()
], Helper, "compile", null);
Helper = Helper_1 = __decorate([
    Class.Describe()
], Helper);
exports.Helper = Helper;
