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
    return `"${name}":{pack:${pack ? 'true' : 'false'}, invoke:function(module, exports, require){\n${code}\n}}`;
  }

  /**
   * Creates a dependency link to another dependency.
   * @param name Dependency name.
   * @param link Dependency link name.
   * @returns Returns the dependency entry code.
   */
  @Class.Private()
  private static createLink(name: string, link: string): string {
    return this.createEntry(name, true, `Object.assign(exports, require('./${link}'));`);
  }

  /**
   * Create a model and write it into the target file.
   * @param entries Input entries.
   * @param target Target file.
   */
  @Class.Private()
  private static async createModel(entries: string[], target: string): Promise<void> {
    const path = Path.join(Path.dirname(Path.dirname(__dirname)), '/assets/loader.js');
    const bundle = (await this.readFile(path)).replace(`'%MODULES%'`, () => `{${entries.join(`,\n`)}}`);
    await Util.promisify(Fs.writeFile)(target, bundle);
  }

  /**
   * Load the specified file and insert a new entry if the given file is valid.
   * @param entries Output entries.
   * @param source Source object.
   */
  @Class.Private()
  private static async loadFile(entries: string[], source: Source): Promise<void> {
    const ext = Path.extname(source.path).toLowerCase();
    if (ext === '.js' || ext === '.cjs' || ext === '.mjs') {
      const code = await this.readFile(source.path);
      const file = Path.basename(source.name);
      if (file === (source.index ?? 'index')) {
        entries.push(this.createEntry(source.name, false, code));
        entries.push(this.createLink(Path.dirname(source.name), file));
      } else {
        entries.push(this.createEntry(source.name, false, code));
      }
    }
  }

  /**
   * Load the all files from the specified directory and insert all valid output entries.
   * @param entries Output entries.
   * @param source Source object.
   */
  @Class.Private()
  private static async loadDirectory(entries: string[], source: Source): Promise<void> {
    const files = await this.readDirectory(source.path);
    for (const file of files) {
      const path = Path.join(source.path, file);
      const stat = Fs.statSync(path);
      if (stat.isDirectory()) {
        await this.loadDirectory(entries, {
          name: `${source.name}/${file}`,
          path: path
        });
      } else if (stat.isFile()) {
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
  @Class.Private()
  private static async loadPath(entries: string[], source: Source): Promise<void> {
    const stat = Fs.statSync(source.path);
    if (stat.isDirectory()) {
      await this.loadDirectory(entries, source);
    } else if (stat.isFile()) {
      await this.loadFile(entries, source);
    }
  }

  /**
   * Load the specified package.json and insert all valid output entries.
   * @param source Source object.
   * @param entries Output entries.
   * @param cache Loaded packages cache. (To prevent circular calling)
   */
  @Class.Private()
  private static async loadPackage(entries: string[], cache: Set<string>, source: Source): Promise<void> {
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
  @Class.Public()
  public static async compile(settings: Settings): Promise<void> {
    const entries = <string[]>[];
    const cache = new Set<string>();
    for (const source of settings.sources) {
      if (source.package) {
        await this.loadPackage(entries, cache, source);
      } else {
        await this.loadPath(entries, source);
      }
    }
    await this.createModel(entries, settings.output);
  }
}
