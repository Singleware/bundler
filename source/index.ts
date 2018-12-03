/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Helper } from './helper';
import { Settings } from './settings';

/**
 * Compile all specified sources according to the provided settings.
 * @param settings Compiler settings.
 */
export const compile = async (settings: Settings): Promise<void> => await Helper.compile(settings);
