from setuptools import setup, find_packages

setup(
    name="crawler",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "fastapi==0.104.1",
        "uvicorn==0.24.0",
        "beautifulsoup4==4.12.2",
        "requests==2.31.0",
        "aiohttp==3.9.1",
        "lxml==4.9.3",
        "python-dotenv==1.0.0",
        "pydantic>=1.7.4,<3.0.0",
        "pydantic-settings>=1.2.0",
        "jieba==0.42.1"
    ]
) 