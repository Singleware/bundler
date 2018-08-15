"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 *
 * The proposal of this example is to show how to use the bundler package.
 */
const Bundler = require("../source");
// Make Singleware bundle.
Bundler.compile({
    output: 'singleware.pack.js',
    sources: [
        {
            name: '@singleware/class',
            path: './node_modules/@singleware/class',
            package: true
        }
    ]
});
