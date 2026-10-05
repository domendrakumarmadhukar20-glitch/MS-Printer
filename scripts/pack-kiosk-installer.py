import os
import zipfile
import shutil

src_dir = 'kiosk_setup'
out_zip_name = 'msprinters_kiosk_installer.zip'
public_zip = os.path.join('public', out_zip_name)
dist_zip = os.path.join('dist', out_zip_name)

if os.path.exists(src_dir):
    with zipfile.ZipFile(public_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(src_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, src_dir)
                zipf.write(full_path, rel_path)
    print(f"[Pack] Created {public_zip} successfully ({os.path.getsize(public_zip)} bytes)")

    if os.path.exists('dist'):
        shutil.copyfile(public_zip, dist_zip)
        print(f"[Pack] Copied to {dist_zip}")

    shutil.copyfile(public_zip, out_zip_name)
    print(f"[Pack] Copied to {out_zip_name}")
