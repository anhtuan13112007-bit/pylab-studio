"""Prepare explicitly requested distributions, then infer remaining imports."""
import importlib.util
import json
import sys
from pathlib import Path

catalog = json.loads(catalog_json)
specified = [line.strip() for line in declarations.splitlines()
             if line.strip() and not line.lstrip().startswith("#")]


def available(name):
    try:
        return name in sys.modules or importlib.util.find_spec(name) is not None
    except (ImportError, ValueError):
        return False


def reason(error):
    text = " ".join(str(error).split())
    return text[:600]


async def pip_install(requirements):
    if not available("micropip"):
        await load_catalog("micropip")
    import micropip
    await micropip.install(requirements)


if specified:
    show_progress(", ".join(specified))
    try:
        await pip_install(specified)
    except Exception as error:
        raise ValueError("Không cài được gói đã khai báo: " + ", ".join(specified) + ". "
                         + reason(error) + " · Kiểm tra tên, phiên bản hoặc xuất notebook để chạy bằng CPython.") from None

for module in workspace_imports(Path("/home/pyodide"), entry):
    if available(module):
        continue
    package = catalog.get(module)
    if not package and (module in sys.stdlib_module_names or module.startswith("_")):
        continue
    show_progress(package or module)
    try:
        if package:
            await load_catalog(package)
        else:
            await pip_install(module)
    except Exception as error:
        # Optional imports (try/except or platform branches) must still get to
        # execute. Show the installation detail if the actual import fails.
        remember_error(module, "Không nạp được " + (package or module) + ": " + reason(error))
