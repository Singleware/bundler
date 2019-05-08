/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Source } from './source';

/**
 * Bundler settings interface.
 */
export interface Settings {
  /**
   * Output file.
   */
  output: string;
  /**
   * Input sources.
   */
  sources: Source[];
}
