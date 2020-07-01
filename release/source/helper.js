"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Helper = void 0;
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Fs = require("fs");
const Path = require("path");
const Util = require("util");
const Class = require("@singleware/class");
/**
 * Helper class.
 */
let Helper = class Helper extends Class.Null {
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
        return `"${name}":{pack:${pack ? 'true' : 'false'}, invoke:function(module, exports, require){\n${code}\n}}`;
    }
    /**
     * Creates a dependency link to another dependency.
     * @param name Dependency name.
     * @param link Dependency link name.
     * @returns Returns the dependency entry code.
     */
    static createLink(name, link) {
        return this.createEntry(name, true, `Object.assign(exports, require('./${link}'));`);
    }
    /**
     * Create a model and write it into the target file.
     * @param entries Input entries.
     * @param target Target file.
     */
    static async createModel(entries, target) {
        const path = Path.join(Path.dirname(Path.dirname(__dirname)), '/assets/loader.js');
        const bundle = (await this.readFile(path)).replace(`'%MODULES%'`, () => `{${entries.join(`,\n`)}}`);
        await Util.promisify(Fs.writeFile)(target, bundle);
    }
    /**
     * Load the specified file and insert a new entry if the given file is valid.
     * @param entries Output entries.
     * @param source Source object.
     */
    static async loadFile(entries, source) {
        var _a;
        const ext = Path.extname(source.path).toLowerCase();
        if (ext === '.js' || ext === '.cjs' || ext === '.mjs') {
            const code = await this.readFile(source.path);
            const file = Path.basename(source.name);
            if (file === ((_a = source.index) !== null && _a !== void 0 ? _a : 'index')) {
                entries.push(this.createEntry(source.name, false, code));
                entries.push(this.createLink(Path.dirname(source.name), file));
            }
            else {
                entries.push(this.createEntry(source.name, false, code));
            }
        }
    }
    /**
     * Load the all files from the specified directory and insert all valid output entries.
     * @param entries Output entries.
     * @param source Source object.
     */
    static async loadDirectory(entries, source) {
        const files = await this.readDirectory(source.path);
        for (const file of files) {
            const path = Path.join(source.path, file);
            const stat = Fs.statSync(path);
            if (stat.isDirectory()) {
                await this.loadDirectory(entries, {
                    name: `${source.name}/${file}`,
                    path: path
                });
            }
            else if (stat.isFile()) {
                const ext = Path.extname(file);
                await this.loadFile(entries, {
                    name: `${source.name}/${file.substr(0, file.length - ext.length)}`,
                    index: source.index,
                    path: path
                });
            }
        }
    }
    /**
     * Load all valid files and directories and insert all valid output entries.
     * @param entries Output entries.
     * @param source Source object.
     */
    static async loadPath(entries, source) {
        const stat = Fs.statSync(source.path);
        if (stat.isDirectory()) {
            await this.loadDirectory(entries, source);
        }
        else if (stat.isFile()) {
            await this.loadFile(entries, source);
        }
    }
    /**
     * Load the specified package.json and insert all valid output entries.
     * @param source Source object.
     * @param entries Output entries.
     * @param cache Loaded packages cache. (To prevent circular calling)
     */
    static async loadPackage(entries, cache, source) {
        if (!cache.has(source.name)) {
            const json = JSON.parse(await this.readFile(Path.join(source.path, 'package.json')));
            const dependencies = json.dependencies || {};
            cache.add(source.name);
            for (const name in dependencies) {
                await this.loadPackage(entries, cache, {
                    name: name,
                    path: `node_modules/${name}`,
                    package: true
                });
            }
            if (json.main) {
                await this.loadDirectory(entries, {
                    name: source.name,
                    index: Path.basename(json.main, Path.extname(json.main)),
                    path: Path.join(source.path, Path.dirname(json.main))
                });
            }
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
                await this.loadPackage(entries, cache, source);
            }
            else {
                await this.loadPath(entries, source);
            }
        }
        await this.createModel(entries, settings.output);
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
Helper = __decorate([
    Class.Describe()
], Helper);
exports.Helper = Helper;
