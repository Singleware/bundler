import { Settings } from './settings';
/**
 * Helper class.
 */
export declare class Helper {
    /**
     * Read all content of the specified file path.
     * @param path Path.
     * @returns Returns the file content.
     */
    private static readFile;
    /**
     * Read all files from the specified directory path.
     * @param path Path.
     * @returns Returns the list of files.
     */
    private static readDirectory;
    /**
     * Creates a dependency entry for the specified code.
     * @param name Dependency name.
     * @param pack Determines whether the entry is a pack or not.
     * @param code Dependency code.
     * @returns Returns the dependency entry code.
     */
    private static createEntry;
    /**
     * Creates a dependency link to another dependency.
     * @param name Dependency name.
     * @param link Dependency link name.
     * @returns Returns the dependency entry code.
     */
    private static createLink;
    /**
     * Create a model and write it into the target file.
     * @param target Target file.
     * @param entries Input entries.
     */
    private static createModel;
    /**
     * Load the specified file and insert a new entry if the provided file is valid.
     * @param source Source information.
     * @param entries Output entries.
     */
    private static loadFile;
    /**
     * Load the all files from the specified directory and insert all valid output entries.
     * @param source Source information.
     * @param entries Output entries.
     */
    private static loadDirectory;
    /**
     * Load all valid files and directories and insert all valid output entries.
     * @param source Source information.
     * @param entries Output entries.
     */
    private static loadPath;
    /**
     * Load the specified package.json and insert all valid output entries.
     * @param source Source information.
     * @param entries Output entries.
     */
    private static loadPackage;
    /**
     * Compile all specified sources according to the provided settings.
     * @param settings Compiler settings.
     */
    static compile(settings: Settings): Promise<void>;
}
