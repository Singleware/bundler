/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
'use strict';
var Loader;
(function(Loader) {
  /**
   * Loaded modules.
   */
  const cache = {};

  /**
   * Modules repository.
   */
  const repository = {};

  /**
   * Loading locations.
   */
  const loading = [];

  /**
   * Get the directory name of the specified path.
   * @param path Path.
   * @returns Returns the directory name.
   */
  function dirname(path) {
    const output = normalize(path).split('/');
    return output.splice(0, output.length - 1).join('/');
  }

  /**
   * Get the normalized path from the specified path.
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
   * Load the module that corresponds to the specified location.
   * @param location Module location.
   * @returns Returns all exported members.
   */
  function loadModule(location) {
    const baseDir = Loader.baseDirectory;
    const source = repository[location];
    const module = {
      loaded: false,
      filename: location,
      path: dirname(location),
      exports: cache[location]
    };
    let caught;
    try {
      Loader.baseDirectory = source.pack ? module.filename : module.path;
      loading.push(location);
      source.invoke(module, module.exports, require);
      module.loaded = true;
    } catch (exception) {
      caught = exception;
    } finally {
      Loader.baseDirectory = baseDir;
      loading.pop();
      if (caught) {
        throw caught;
      }
      return module.exports;
    }
  }

  /**
   * Require the module that corresponds to the specified path.
   * @param path Module path.
   * @returns Returns all exported members.
   * @throws Throws an error when the specified module doesn't exists.
   */
  function require(path) {
    const relative = path[0] === '.';
    const location = normalize(relative ? `${Loader.baseDirectory}/${path}` : path);
    if (!cache[location]) {
      if (!repository[location]) {
        const current = loading[loading.length - 1] || '.';
        throw new Error(`Module "${path}" required by "${current}" doesn't found.`);
      }
      cache[location] = {};
      return loadModule(location);
    }
    return cache[location];
  }

  /**
   * Register new modules into the loader.
   * @param modules Modules object.
   */
  function register(modules) {
    for (const entry in modules) {
      if (!(entry in repository)) {
        repository[entry] = modules[entry];
      }
    }
  }

  // Setup the loader.
  if (!window.require) {
    // Set the default directory.
    Loader.baseDirectory = '.';
    // Set all properties.
    Object.defineProperties(window, {
      require: {
        value: require,
        configurable: false,
        writable: false
      },
      Loader: {
        value: Loader,
        configurable: false,
        writable: false
      }
    });
  }

  // Set the loader method.
  Object.defineProperties(Loader, {
    register: {
      value: register,
      configurable: false,
      writable: false
    }
  });

  // Register all modules.
  window.Loader.register('%MODULES%');
})(Loader || (Loader = {}));
