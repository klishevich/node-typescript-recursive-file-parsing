import { readFileSync, writeFileSync, promises, appendFileSync } from "fs";
import * as ts from "typescript";
import * as path from "path";
import { Statement } from "typescript";

type TExport = {
    path: string;
    exportName: string;
};

(async function main() {
    const prefixPath = process.cwd();
    const filesDir = path.join(prefixPath, "input-files");
    // console.log("filesDir", filesDir);
    const files = await getFiles(filesDir);
    // console.log("files", files);

    const allExports: TExport[] = [];
    for (const fileName of files) {
        // console.log("Timestamp", Date.now());
        collectExports(allExports, fileName);
    }

    writeAllExportsToFile(allExports, path.join("output", "all-exports.ts"), prefixPath.length);
})();

async function getFiles(pathUrl) {
    const entries = await promises.readdir(pathUrl, { withFileTypes: true });

    // Get files within the current directory and add a path key to the file objects
    const files = entries.filter((file) => !file.isDirectory()).map((file) => path.join(pathUrl, file.name));

    // Get folders within the current directory
    const folders = entries.filter((folder) => folder.isDirectory());

    // Add the found files within the subdirectory to the files array
    for (const folder of folders) {
        files.push(...(await getFiles(path.join(pathUrl, folder.name))));
    }

    return files;
}

function collectExports(allExports: TExport[], fileName: string) {
    // console.log(fileName);
    const sourceFile: ts.SourceFile = ts.createSourceFile(
        fileName,
        readFileSync(fileName).toString(),
        ts.ScriptTarget.ES2015,
        /*setParentNodes */ true
    );
    sourceFile.statements.forEach((statement) => {
        // console.log("statement.kind", statement.kind);
        let name = "";
        if (ts.isFunctionDeclaration(statement)) {
            // console.log("isFunctionDeclaration");
            name = statement.name.text;
        } else if (ts.isVariableStatement(statement)) {
            // console.log("isVariableStatement");
            name = statement.declarationList.declarations[0].name.getText(sourceFile);
        } else if (ts.isClassDeclaration(statement)) {
            // console.log("isClassDeclaration");
            name = statement.name.text;
        } else if (ts.isEnumDeclaration(statement)) {
            // console.log("isEnumDeclaration");
            name = statement.name.text;
        }
        // console.log("NAME:", name);

        const hasExport = testHasExport(statement);
        // console.log("hasExport", hasExport);
        if (hasExport) {
            allExports.push({
                exportName: name,
                path: fileName
            });
        }
    });

    function testHasExport(statement: Statement) {
        let hasExport = false;
        ts.forEachChild(statement, (childNode) => {
            if (childNode.kind === ts.SyntaxKind.ExportKeyword) {
                hasExport = true;
            }
        });
        return hasExport;
    }
}

function writeAllExportsToFile(allExports: TExport[], fileName: string, prefixLength: number) {
    console.log("writeAllExportsToFile RESULT", allExports);
    writeFileSync(fileName, "// This file is generated by collect-exports.ts script, do not edit it manually!\n");

    allExports.forEach((el) => {
        // console.log(el.exportName);
        writeImport(el.exportName, el.path);
    });

    writeConstantAndExport("MyLib", allExports);

    function writeImport(elementName: string, path: string) {
        const lengthWithoutPrefixAndExtension = path.length - prefixLength - 3;
        const relativePath = `..${path.substr(prefixLength, lengthWithoutPrefixAndExtension)}`;
        const textToWrite = `import { ${elementName} } from "${relativePath}";\n`;
        appendFileSync(fileName, textToWrite);
    }

    function writeConstantAndExport(libName: string, allExports: TExport[]) {
        appendFileSync(fileName, `\nconst ${libName} = {`);
        allExports.forEach((el) => {
            appendFileSync(fileName, `\n  ${el.exportName},`);
        });
        appendFileSync(fileName, `\n}\n`);
        appendFileSync(fileName, `export default ${libName};\n`);
    }
}
