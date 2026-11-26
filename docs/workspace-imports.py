"""Discover imports in the active workspace, without executing student code."""
import ast
from pathlib import Path


def workspace_imports(root, entry):
    pending = [Path(root) / entry]
    visited, external = set(), set()
    while pending:
        file = pending.pop()
        if file in visited:
            continue
        visited.add(file)
        try:
            tree = ast.parse(file.read_text(encoding="utf-8"))
        except (SyntaxError, ValueError):
            continue  # The runner reports the original exception with its line.
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                names = [alias.name for alias in node.names]
            elif isinstance(node, ast.ImportFrom) and node.module and not node.level:
                names = [node.module]
            else:
                continue
            for name in names:
                top = name.partition(".")[0]
                local = Path(root) / (top + ".py")
                if local.is_file():
                    pending.append(local)
                else:
                    external.add(top)
    return sorted(external)
