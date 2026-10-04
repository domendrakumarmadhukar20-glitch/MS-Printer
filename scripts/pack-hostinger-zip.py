import os
import zipfile

dist_dir = 'dist'
out_zip = 'hostinger_deploy.zip'
public_zip = os.path.join('public', 'hostinger_deploy.zip')

if os.path.exists(dist_dir):
    with zipfile.ZipFile(out_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, dist_dir)
                zipf.write(full_path, rel_path)
    print(f"[Pack] Created {out_zip} successfully ({os.path.getsize(out_zip)} bytes)")

    # Also place in public directory for browser download
    os.makedirs('public', exist_ok=True)
    import shutil
    shutil.copyfile(out_zip, public_zip)
    print(f"[Pack] Copied to {public_zip} for direct browser download")
