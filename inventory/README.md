# Inventory conventions

FILE_INVENTORY.csv and FILE_INVENTORY.json map every outer-package file to its original absolute path when one exists, package-relative path, relationship, size and SHA-256 hash. Created files have no historical origin. Adapted tests name their original file and state the adaptation. Inventory files do not hash themselves; their hash fields are blank to avoid circular self-reference. The outer ZIP has a separate adjacent SHA256 file.

DIRECTORIES.txt preserves the included tree, including empty directory scaffolds. EXCLUSIONS.json lists exact excluded source paths, reasons and counts. These are browser profiles, generated caches and OS metadata; original files were not deleted. ARCHIVE_MEMBERS.csv enumerates each included ZIP/XPI member and its content hash. The generated DOCX is an Office archive and is inventoried as one document rather than extension contents.

The source-package ZIP contains the adopted developer tree except generated dist/test results/profiles/caches. Existing release and test archives are preserved separately. Some historical absolute paths are intentionally retained inside unchanged snapshots. Use developer/ for portable operations, not those old snapshots.
