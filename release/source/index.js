"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const helper_1 = require("./helper");
/**
 * Compile all specified sources according to the provided settings.
 * @param settings Compiler settings.
 */
exports.compile = async (settings) => await helper_1.Helper.compile(settings);
