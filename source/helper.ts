/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Fs from 'fs';
import * as Path from 'path';
import * as Util from 'util';

import * as Class from '@singleware/class';

import { Settings } from './settings';
import { Source } from './source';

/**
 * Helper class.
 */
@Class.Describe()
export class Helper extends Class.Null {
  /**
   * Read all content of the specified file path.
   * @param path Path.
   * @returns Returns the file content.
   */
  @Class.Private()
  private static async readFile(path: string): Promise<string> {
    return (await Util.promisify(Fs.readFile)(path)).toString('utf-8');
  }

  /**
   * Read all files from the specified directory path.
   * @param path Path.
   * @returns Returns the list of files.
   */
  @Class.Private()
  private static async readDirectory(path: string): Promise<string[]> {
    return await Util.promisify(Fs.readdir)(path);
  }

  /**
   * Creates a dependency entry for the specified code.
   * @param name Dependency name.
   * @param pack Determines whether the entry is a pack or not.
   * @param code Dependency code.
   * @returns Returns the dependency entry code.
   */
  @Class.Private()
  private static createEntry(name: string, pack: boolean, code: string): string {
    return `"${name}":{pack:${pack ? 'true' : 'false'}, invoke:function(exports, require){\n${code}\n}}`;
  }

  /**
   * Creates a dependency link to another dependency.
   * @param name Dependency name.
   * @param link Dependency link name.
   * @returns Returns the dependency entry code.
   */
  @Class.Private()
  private static createLink(name: string, link: string): string {
    return this.createEntry(name, true, `Object.assign(exports, require('${link}'));`);
  }

  /**
   * Create a model and write it into the target file.
   * @param target Target file.
   * @param entries Input entries.
   */
  @Class.Private()
  private static async createModel(target: string, entries: string[]): Promise<void> {
    const path = Path.join(Path.dirname(Path.dirname(__dirname)), '/assets/loader.js');
    const model = await this.readFile(path);
    await Util.promisify(Fs.writeFile)(target, model.replace(`'%MODULES%'`, () => `{${entries.join(`,\n`)}}`));
  }

  /**
   * Load the specified file and insert a new entry if the provided file is valid.
   * @param source Source information.
   * @param entries Output entries.
   */
  @Class.Private()
  private static async loadFile(source: Source, entries: string[]): Promise<void> {
    if (Path.extname(<string>source.path) === '.js') {
      const code = await this.readFile(<string>source.path);
      const file = Path.basename(source.name);
      if (file === 'index') {
        entries.push(this.createEntry(source.name, false, code));
        entries.push(this.createLink(Path.dirname(source.name), file));
      } else {
        entries.push(this.createEntry(source.name, false, code));
      }
    }
  }

  /**
   * Load the all files from the specified directory and insert all valid output entries.
   * @param source Source information.
   * @param entries Output entries.
   */
  @Class.Private()
  private static async loadDirectory(source: Source, entries: string[]): Promise<void> {
    const files = await this.readDirectory(source.path);
    for (const file of files) {
      const path = Path.join(source.path, file);
      const stat = Fs.statSync(path);
      if (stat.isDirectory()) {
        await this.loadDirectory({ name: `${source.name}/${file}`, path: path }, entries);
      } else if (stat.isFile()) {
        await this.loadFile({ name: `${source.name}/${file.substr(0, file.length - 3)}`, path: path }, entries);
      }
    }
  }

  /**
   * Load all valid files and directories and insert all valid output entries.
   * @param source Source information.
   * @param entries Output entries.
   */
  @Class.Private()
  private static async loadPath(source: Source, entries: string[]): Promise<void> {
    const stat = Fs.statSync(source.path);
    if (stat.isDirectory()) {
      await this.loadDirectory(source, entries);
    } else if (stat.isFile()) {
      await this.loadFile(source, entries);
    }
  }

  /**
   * Load the specified package.json and insert all valid output entries.
   * @param source Source information.
   * @param entries Output entries.
   */
  @Class.Private()
  private static async loadPackage(source: Source, entries: string[], cache: Set<string>): Promise<void> {
    if (!cache.has(source.name)) {
      const json = JSON.parse(await this.readFile(Path.join(source.path, 'package.json')));
      const dependencies = json.dependencies || {};
      cache.add(source.name);
      for (const name in dependencies) {
        await this.loadPackage({ name: name, path: `node_modules/${name}`, package: true }, entries, cache);
      }
      if (json.main) {
        await this.loadDirectory({ name: source.name, path: Path.join(source.path, Path.dirname(json.main)) }, entries);
      }
    }
  }

  /**
   * Compile all specified sources according to the provided settings.
   * @param settings Compiler settings.
   */
  @Class.Public()
  public static async compile(settings: Settings): Promise<void> {
    const entries = <string[]>[];
    const cache = new Set<string>();
    for (const source of settings.sources) {
      if (source.package) {
        await this.loadPackage(source, entries, cache);
      } else {
        await this.loadPath(source, entries);
      }
    }
    await this.createModel(settings.output, entries);
  }
}
