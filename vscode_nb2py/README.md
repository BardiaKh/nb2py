# nb2py

`nb2py` is a comprehensive tool designed to convert Jupyter Notebooks (.ipynb files) into Python scripts (.py files). This tool simplifies the process of transforming interactive notebook cells into a structured Python script, automatically separating import statements and wrapping executable code within an `if __name__ == '__main__':` guard to maintain the script's portability and usability.

This tool has two versions, a **command-line** version based on python and a **vscode extension**.

## Features

- **VSCode Extension**: A one-click solution for converting notebooks to python files.
- **Command-Line Simplicity**: Offers a straightforward command-line interface for easy conversion of notebooks to Python scripts.
- **Import Optimization**: Automatically moves all import statements to the top of the generated Python script.
- **Executable Wrap**: Wraps all executable code within an `if __name__ == '__main__':` block, ensuring that the script can be imported without unintended execution.
- **Markdown Conversion**: Converts markdown cells into Python comments, preserving the notebook's documentation in the script.
- **Handling Multiline Strings**: Converts `""" """` to multiple `" "\` so there is no spacing issues. Especially useful for prompting LLMs. (added in v0.7.0)

## VSCode Extension 

### Installation

You can install the `nb2py` extension directly from the Visual Studio Code Marketplace:

1. Open VS Code.
2. Navigate to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window.
3. Search for `nb2py`. [if not found here is the [link](https://marketplace.visualstudio.com/items?itemName=BardiaKhosravi.nb2py)]
4. Click on the Install button.

## Usage

After installation, open the Jupyter Notebook you wish to convert. You'll see a new icon in the editor title bar that looks like a Python logo. Click this icon to convert the currently open notebook.

The converted Python script will be saved in the same directory as the notebook with the extension of `.py`.

![Convert Notebook to Python Script Button](vscode_nb2py/assets/screenshot.png)

## CLI Tool 

### Installation

To install `nb2py`, run the following setup script. Ensure you have Python 3.6 or later installed on your system.

```bash
pip install cli-nb2py
```

### Usage

To convert a Jupyter Notebook to a Python script, use the following command:

```bash
nb2py input_notebook.ipynb output_script.py
```

If the output file name is not provided, `nb2py` will generate a Python script with the same name as the input notebook (replacing the `.ipynb` extension with `.py`).

## License

`nb2py` is released under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

- Developer: Bardia Khosravi
- Email: bardiakhosravi95@gmail.com
- GitHub: [https://github.com/BardiaKh/nb2py](https://github.com/BardiaKh/nb2py)
