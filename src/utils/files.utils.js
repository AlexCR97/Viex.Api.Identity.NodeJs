import { readFile, writeFile } from 'fs'

/**
 * Reads a file asynchronously
 * @param {String} path The path to the file
 * @returns A promise that resolves when the file contents are
 * read and rejects if failed to read the file
 */
export async function readFileAsync(path) {
    return new Promise((resolve, reject) => {
        readFile(path, (err, content) => err == undefined || err == null
            ? resolve(content)
            : reject(err))
    })
}

/**
 * Reads a json file asynchronously
 * @param {String} path The path to the file
 * @returns A promise that resolves when the json is read and
 * rejects if failed to read the json
 */
export async function readJsonAsync(path) {
    const content = await readFileAsync(path)
    return JSON.parse(content)
}

/**
 * Writes to a file asynchronously
 * @param {String} path The path where to write the file
 * @param {any} content The content to write into the file
 * @returns A promise that resolved when the file is written
 * and rejects if failed to write to the file
 */
export async function writeFileAsync(path, content) {
    return new Promise((resolve, reject) => {
        writeFile(path, content, (err) => err == undefined || err == null
            ? resolve()
            : reject(err))
    })
}
