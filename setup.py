import setuptools

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setuptools.setup(
    name="nb2py",
    version="0.1",
    author="Bardia Khosravi",
    author_email="bardiakhosravi95@gmail.com",
    description="Reliable Notebook to Python converter",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/BardiaKh/nb2py",
    packages = setuptools.find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    install_requires=[
        "argparse",
    ],
    entry_points={
        'console_scripts': [
            'np2py=np2py.main:main',
        ],
    },
    python_requires='>=3.6',
)