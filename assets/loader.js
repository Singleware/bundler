/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
'use strict';
var Loader;
(function(Loader) {
  /**
   * All modules.
   */
  const modules = '!MODULES!';

  /**
   * All initialized modules.
   */
  const cache = {};

  /**
   * Determines whether the specified path is relative or not.
   * @param path Path.
   * @returns Returns the base path.
   */
  function relative(path) {
    const char = path.substr(0, 1);
    return char !== '/' && char !== '@';
  }

  /**
   * Gets the base path of the specified path.
   * @param path Path.
   * @returns Returns the base path.
   */
  function dirname(path) {
    const output = normalize(path).split('/');
    return output.splice(0, output.length - 1).join('/');
  }

  /**
   * Gets the normalized from the specified path.
   * @param path Path.
   * @return Returns the normalized path.
   */
  function normalize(path) {
    const input = path.split('/');
    const output = [];
    for (let i = 0; i < input.length; ++i) {
      const directory = input[i];
      if (i === 0 || (directory.length && directory !== '.')) {
        if (directory === '..') {
          output.pop();
        } else {
          output.push(directory);
        }
      }
    }
    return output.join('/');
  }

  /**
   * Loads the module that corresponds to the specified path.
   * @param path Module path.
   * @returns Returns all exported members.
   */
  function loadModule(path) {
    const module = modules[path];
    if (!module) {
      throw new Error(`Module "${path}" does not found.`);
    }
    const exports = {};
    const current = Loader.baseDirectory;
    try {
      Loader.baseDirectory = module.pack ? path : dirname(path);
      module.invoke(exports, Loader.require);
    } catch (exception) {
      throw exception;
    } finally {
      Loader.baseDirectory = current;
      return exports;
    }
  }

  /**
   * Global base directory.
   */
  Loader.baseDirectory = '.';

  /**
   * Requires the module that corresponds to the specified path.
   * @param path Module path.
   * @returns Returns all exported members.
   */
  Loader.require = path => {
    const module = normalize(relative(path) ? `${Loader.baseDirectory}/${path}` : path);
    if (!cache[module]) {
      cache[module] = loadModule(module);
    }
    return cache[module];
  };

  // Setups the require method.
  if (!window.require) {
    window.require = Loader.require;
  }
})(Loader || (Loader = {}));
