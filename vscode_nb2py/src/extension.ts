import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function isImportLine(line: string): boolean {
    return line.startsWith('import ') || line.startsWith('from ');
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
            cellContent.push(`# %%\n"""${cell.source.join('\n')}"""`);
        } else if (cellType === 'code') {
            for (const line of cell.source) {
                if (line.startsWith('!nb2py')) continue;
                if (isImportLine(line)) imports.push(line);
                else if (line.includes('os.environ')) osModifications.push(line);
                else if (line.includes('sys.path')) sysModifications.push(line);
                else cellContent.push(...prepList(line).map(l => l.startsWith('!') || l.startsWith('%') ? `##${l}` : l));
            }
        }
        if (cellContent.length) mainCode.push(cellContent.join('\n'));
    }

    // Insert os.environ and sys.path modifications after their imports
    const importSection = imports.join('\n') +
                          osModifications.join('\n') +
                          sysModifications.join('\n');
    const mainCodeStr = cellSeparator + mainCode.join(cellSeparator);
    const disclaimer = `\n\n\n` +
                       `##########################################################################\n` +
                       `# This file was converted using nb2py: https://github.com/BardiaKh/nb2py #\n` +
                       `##########################################################################\n`;

    const finalOutput = `${importSection}\n\nif __name__ == '__main__':\n    ${mainCodeStr.replace(/\n/g, '\n    ')}${disclaimer}`;
    fs.writeFileSync(outputPath, finalOutput, 'utf8');
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
