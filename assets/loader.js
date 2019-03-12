/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
'use strict';
var Loader;
(function(Loader) {
  /**
   * All loaded modules.
   */
  const cache = {};

  /**
   * All loading locations.
   */
  const loading = [];

  /**
   * All modules repository.
   */
  const repository = '%MODULES%';

  /**
   * Determines whether the specified path is relative or not.
   * @param path Path.
   * @returns Returns the base path.
   */
  function relative(path) {
    return path[0] !== '/' && path[0] !== '@';
  }

  /**
   * Gets the directory name of the specified path.
   * @param path Path of extraction.
   * @returns Returns the directory name.
   */
  function dirname(path) {
    const output = normalize(path).split('/');
    return output.splice(0, output.length - 1).join('/');
  }

  /**
   * Gets the normalized path from the specified path.
   * @param path Path to be normalized.
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
   * Loads the module that corresponds to the specified location.
   * @param location Module location.
   * @returns Returns all exported members.
   */
  function loadModule(location) {
    const module = repository[location];
    const current = Loader.baseDirectory;
    const exports = {};
    let caught;
    try {
      Loader.baseDirectory = module.pack ? location : dirname(location);
      loading.push(location);
      module.invoke(exports, require);
    } catch (exception) {
      caught = exception;
    } finally {
      Loader.baseDirectory = current;
      loading.pop();
      if (caught) {
        throw caught;
      }
      return exports;
    }
  }

  /**
   * Requires the module that corresponds to the specified path.
   * @param path Module path.
   * @returns Returns all exported members.
   * @throws Throws an error when the specified module does not exists.
   */
  function require(path) {
    const location = normalize(relative(path) ? `${Loader.baseDirectory}/${path}` : path);
    if (!cache[location]) {
      const current = loading[loading.length - 1] || '.';
      if (!repository[location]) {
        throw new Error(`Module "${path}" loaded by "${current}" does not found.`);
      }
      if (loading.includes(location)) {
        throw new Error(`Module "${current}" with circular reference to module "${path}"`);
      }
      cache[location] = loadModule(location);
    }
    return cache[location];
  }

  /**
   * Global base directory.
   */
  Loader.baseDirectory = '.';

  // Setups the require method.
  if (!window.require) {
    window.require = require;
  }
})(Loader || (Loader = {}));
