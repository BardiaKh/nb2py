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

    for cell in notebook['cells']:
        cell_type = cell['cell_type']
        if cell_type == 'markdown':
            main_code.append(f'{header_comment}"""\n{" ".join(cell["source"])}\n"""')
        elif cell_type == 'code':
            cell_code = ''.join(cell['source'])
            lines = cell_code.split('\n')
            for line in lines:
                if is_import_line(line):
                    imports.append(line.strip())
                    continue
                if line.strip().startswith('os.environ'):
                    os_modifications.append(line.strip())
                    continue
                if line.strip().startswith('sys.path.append'):
                    sys_modifications.append(line.strip())
                    continue
                if line.startswith("!") or line.startswith("%"):
                    line = f"##{line}"
                main_code.append(line)

    # Insert os.environ and sys.path modifications after their imports
    for i, line in enumerate(imports):
        if 'import os' in line:
            for mod in sorted(os_modifications, reverse=True):
                imports.insert(i + 1, mod)
            break

    for i, line in enumerate(imports):
        if 'import sys' in line or 'from sys import' in line:
            for mod in sorted(sys_modifications, reverse=True):
                imports.insert(i + 1, mod)
            break

    imports_code = '\n'.join(imports)
    main_code_str = '\n\n---\n\n'.join(main_code)
    indent = '    '
    if_main_template = "\n\nif __name__ == '__main__':\n"
    main_code_indented = '\n'.join(f"{indent}{line}" for line in main_code_str.split('\n'))
    return f"{imports_code}{if_main_template}{main_code_indented}"

def convert(in_file, out_file):
    with open(in_file, 'r', encoding='utf-8') as f:
        notebook = json.load(f)
    py_str = nb2py(notebook)
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(py_str)

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
