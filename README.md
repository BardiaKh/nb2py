# nb2py

`nb2py` is a command-line tool designed to convert Jupyter Notebooks (.ipynb files) into Python scripts (.py files). This tool simplifies the process of transforming interactive notebook cells into a structured Python script, automatically separating import statements and wrapping executable code within an `if __name__ == '__main__':` guard to maintain the script's portability and usability.

## Features

- **Import Optimization**: Automatically moves all import statements to the top of the generated Python script.
- **Executable Wrap**: Wraps all executable code within an `if __name__ == '__main__':` block, ensuring that the script can be imported without unintended execution.
- **Markdown Conversion**: Converts markdown cells into Python comments, preserving the notebook's documentation in the script.
- **Command-Line Simplicity**: Offers a straightforward command-line interface for easy conversion of notebooks to Python scripts.

## Installation

To install `nb2py`, clone this repository and run the setup script. Ensure you have Python 3.6 or later installed on your system.

```bash
pip install git+https://github.com/BardiaKh/nb2py.git
```

## Usage

To convert a Jupyter Notebook to a Python script, use the following command:

```bash
nb2py input_notebook.ipynb output_script.py
```

If the output file name is not provided, `nb2py` will generate a Python script with the same name as the input notebook (replacing the `.ipynb` extension with `.py`).

## License

`nb2py` is released under the MIT License. See the [LICENSE](LICENSE) file for more details.