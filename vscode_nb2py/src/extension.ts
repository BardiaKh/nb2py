import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function isImportLine(line: string): boolean {
    return line.trim().startsWith('import ') || line.trim().startsWith('from ');
}

function prepList(str: string): string[] {
    return str.split('\n').filter(s => s.trim().length > 0);
}

async function nb2py(notebookPath: string, outputPath: string): Promise<void> {
    const notebookContent = fs.readFileSync(notebookPath, 'utf8');
    const notebook = JSON.parse(notebookContent);
    let imports: string[] = [];
    let osModifications: string[] = [];
    let sysModifications: string[] = [];
    let mainCode: string[] = [];
    const cellSeparator = '\n\n#---\n\n';

    for (const cell of notebook.cells) {
        const cellType = cell.cell_type;
        let cellContent: string[] = [];
        if (cellType === 'markdown') {
            cellContent.push(`# %%\n"""${cell.source.join(' ')}"""`);
        } else if (cellType === 'code') {
            for (const line of cell.source) {
                if (line.trim().startsWith('!nb2py')) {
                    continue;
                } 
                if (isImportLine(line)) {
                    imports.push(line);
                    continue;
                }
                if (line.trim().startsWith('os.environ')) {
                    osModifications.push(line);
                    continue;
                } 
                if (line.trim().startsWith('sys.path')) {
                    sysModifications.push(line);
                    continue;
                } 
                cellContent.push(...prepList(line).map(l => l.startsWith('!') || l.startsWith('%') ? `##${l}` : l));
            }
        }
        if (cellContent.length) mainCode.push(cellContent.join('\n'));
    }

    // Insert os.environ and sys.path modifications after their imports
    insertsAfterImports(imports, osModifications, 'import os', 'from os import');
    insertsAfterImports(imports, sysModifications, 'import sys', 'from sys import');

    const importsCode = imports.join('\n');
    const mainCodeStr = mainCode.join(cellSeparator);
    const indent = '    ';
    const ifMainTemplate = `\n\nif __name__ == '__main__':\n`;
    const mainCodeIndented = mainCodeStr.split('\n').map(line => `${indent}${line}`).join('\n');

    const disclaimer = `\n\n\n` +
                       `##########################################################################\n` +
                       `# This file was converted using nb2py: https://github.com/BardiaKh/nb2py #\n` +
                       `##########################################################################\n`;

    const finalOutput = `${importsCode}${ifMainTemplate}${mainCodeIndented}${disclaimer}`;
    fs.writeFileSync(outputPath, finalOutput, 'utf8');
}

function insertsAfterImports(imports: string[], modifications: string[], importCheck: string, fromImportCheck: string): void {
    modifications.sort().reverse().forEach(mod => {
        const index = imports.findIndex(line => line.includes(importCheck) || line.includes(fromImportCheck));
        if (index !== -1) {
            imports.splice(index + 1, 0, mod);
        }
    });
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.nb2py', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active notebook.');
            return;
        }

        const notebookPath = editor.document.uri.fsPath;
        if (path.extname(notebookPath) !== '.ipynb') {
            vscode.window.showErrorMessage('The active file is not a Jupyter Notebook.');
            return;
        }

        const outputPath = notebookPath.replace('.ipynb', '.py');
        await nb2py(notebookPath, outputPath);
        vscode.window.showInformationMessage(`Notebook converted: ${outputPath}`);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
