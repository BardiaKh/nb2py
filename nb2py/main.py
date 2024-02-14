import argparse
import json
import os

header_comment = '# %%\n'

def is_import_line(line):
    return line.strip().startswith('import ') or line.strip().startswith('from ')

def nb2py(notebook):
    imports = []
    os_modifications = []
    sys_modifications = []
    main_code = []
    cell_separator = '\n\n#---\n\n'  # Separator for cell contents

    for cell in notebook['cells']:
        cell_type = cell['cell_type']
        cell_content = []
        if cell_type == 'markdown':
            cell_content.append(f'{header_comment}"""\n{" ".join(cell["source"])}\n"""')
        elif cell_type == 'code':
            cell_code = ''.join(cell['source'])
            lines = cell_code.split('\n')
            for line in lines:
                if line.strip().startswith('!nb2py'):
                    continue
                if is_import_line(line):
                    imports.append(line)
                    continue
                if 'os.environ' in line:
                    os_modifications.append(line)
                    continue
                if 'sys.path' in line:
                    sys_modifications.append(line)
                    continue
                if line.startswith("!") or line.startswith("%"):
                    line = f"##{line}"
                cell_content.append(line)
                        
        if cell_content:
            main_code.append('\n'.join(cell_content))


    # Insert os.environ and sys.path modifications after their imports
    for i, line in enumerate(imports):
        if 'import os' in line or 'from os import' in line:
            for mod in sorted(os_modifications, reverse=True):
                imports.insert(i + 1, mod)
            break

    for i, line in enumerate(imports):
        if 'import sys' in line or 'from sys import' in line:
            for mod in sorted(sys_modifications, reverse=True):
                imports.insert(i + 1, mod)
            break

    imports_code = '\n'.join(imports)
    main_code_str = cell_separator.join(main_code)
    indent = '    '
    if_main_template = "\n\nif __name__ == '__main__':\n"
    main_code_indented = '\n'.join(f"{indent}{line}" for line in main_code_str.split('\n'))
    return f"{imports_code}{if_main_template}{main_code_indented}"

def convert(in_file, out_file):
    with open(in_file, 'r', encoding='utf-8') as f:
        notebook = json.load(f)
    py_str = nb2py(notebook)

    disclaimer = "\n\n\n############\n# This file was converted using nb2py: https://github.com/BardiaKh/nb2py\n############"

    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(py_str + disclaimer)

def main():
    parser = argparse.ArgumentParser(description='Convert Jupyter Notebook to Python script.')
    parser.add_argument('input_file', type=str, help='Input Jupyter Notebook (.ipynb file)')
    parser.add_argument('output_file', type=str, nargs='?', help='Output Python script (.py file). Optional. If not provided, the script uses the input file name with a .py extension.')

    args = parser.parse_args()

    input_file = args.input_file
    output_file = args.output_file if args.output_file else os.path.splitext(input_file)[0] + '.py'

    convert(input_file, output_file)
    print(f'Converted {input_file} to {output_file}')

if __name__ == '__main__':
    main()
