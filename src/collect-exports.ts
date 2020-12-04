import { readFileSync, promises } from "fs";
import * as ts from "typescript";
import * as path from "path";
import { Statement } from "typescript";

(async function main() {
    const filesDir = path.join(process.cwd(), "input-files");
    console.log("filesDir", filesDir);
    const files = await getFiles(filesDir);
    console.log("files", files);
    for (const fileName of files) {
        console.log("Timestamp", Date.now());
        collectExports(fileName);
    }
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

function collectExports(fileName: string) {
    console.log(fileName);
    const sourceFile: ts.SourceFile = ts.createSourceFile(
        fileName,
        readFileSync(fileName).toString(),
        ts.ScriptTarget.ES2015,
        /*setParentNodes */ true
    );
    sourceFile.statements.forEach((statement) => {
        console.log("statement.kind", statement.kind);
        let name = "";
        if (ts.isFunctionDeclaration(statement)) {
            console.log("isFunctionDeclaration");
            name = statement.name.text;
        } else if (ts.isVariableStatement(statement)) {
            console.log("isVariableStatement");
            name = statement.declarationList.declarations[0].name.getText(sourceFile);
        } else if (ts.isClassDeclaration(statement)) {
            console.log("isClassDeclaration");
            name = statement.name.text;
        } else if (ts.isEnumDeclaration(statement)) {
            console.log("isEnumDeclaration");
            name = statement.name.text;
        }
        console.log("NAME:", name);

        const hasExport = testHasExport(statement);
        console.log("hasExport", hasExport);
    });

    function testHasExport(statement: Statement) {
        let hasExport = false;
        ts.forEachChild(statement, (childNode) => {
            // console.log("childNode kind", childNode.kind);
            if (childNode.kind === ts.SyntaxKind.ExportKeyword) {
                hasExport = true;
            }
        });
        return hasExport;
    }
}
