/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */

/**
 * Bundler source interface.
 */
export interface Source {
  /**
   * Source name.
   */
  name: string;
  /**
   * Source path.
   */
  path: string;
  /**
   * Determines whether the source is a package or not.
   */
  package?: boolean;
}
