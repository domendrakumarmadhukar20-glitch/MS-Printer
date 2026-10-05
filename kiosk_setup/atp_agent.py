"""
MS PRINTERS — ATP Windows Background Print Service Agent
Hardware Target: HP LaserJet Pro MFP M126nw (USB / Network LAN)
Domain: msprinter.in
"""

import os
import sys
import time
import json
import logging
import urllib.request
import urllib.error

# Windows API bindings
try:
    import win32print
    import win32api
except ImportError:
    win32print = None
    win32api = None

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "kiosk_config.json")
CONFIG = {
    "machine_id": "ATP-ABC-001",
    "domain": "msprinter.in",
    "printer_name": "HP LaserJet Pro MFP M126nw",
    "poll_interval_seconds": 2.0,
    "spool_dir": "C:\\MSPrintersKiosk\\spool"
}

if os.path.exists(CONFIG_FILE):
    try:
        with open(CONFIG_FILE, "r") as f:
            CONFIG.update(json.load(f))
    except Exception as e:
        print(f"Config load error: {e}")

os.makedirs(CONFIG["spool_dir"], exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("C:\\MSPrintersKiosk\\logs\\agent.log", mode='a')
    ]
)

logger = logging.getLogger("MSPrintersAgent")

def print_raw_file(file_path, printer_name):
    """Sends document directly to HP LaserJet M126nw Windows Spooler"""
    if not win32print:
        logger.warning(f"[SIMULATED] win32print not installed. Simulating print: {file_path}")
        time.sleep(2)
        return True

    try:
        # Check printer
        hPrinter = win32print.OpenPrinter(printer_name)
        try:
            hJob = win32print.StartDocPrinter(hPrinter, 1, ("MS_PRINTERS_JOB", None, "RAW"))
            win32print.StartPagePrinter(hPrinter)
            with open(file_path, "rb") as f:
                win32print.WritePrinter(hPrinter, f.read())
            win32print.EndPagePrinter(hPrinter)
            win32print.EndDocPrinter(hPrinter)
            logger.info(f"✓ Print spooled successfully to {printer_name}")
            return True
        finally:
            win32print.ClosePrinter(hPrinter)
    except Exception as e:
        logger.error(f"Failed to print to {printer_name}: {e}")
        # Try win32api ShellExecute print verb fallback
        try:
            win32api.ShellExecute(0, "print", file_path, None, ".", 0)
            return True
        except Exception as e2:
            logger.error(f"ShellExecute print failed: {e2}")
            return False

def run_loop():
    logger.info("MS PRINTERS Hardware Agent initialized.")
    logger.info(f"Machine ID: {CONFIG['machine_id']}")
    logger.info(f"Target Printer: {CONFIG['printer_name']}")

    while True:
        try:
            # Poll for any spool files placed by kiosk web app or cloud
            spool_files = os.listdir(CONFIG["spool_dir"])
            for fname in spool_files:
                if fname.endswith(".pdf") or fname.endswith(".prn") or fname.endswith(".txt"):
                    fpath = os.path.join(CONFIG["spool_dir"], fname)
                    logger.info(f"New print document detected: {fname}")
                    success = print_raw_file(fpath, CONFIG["printer_name"])
                    if success:
                        # Move to printed / delete
                        os.remove(fpath)
            time.sleep(CONFIG["poll_interval_seconds"])
        except KeyboardInterrupt:
            logger.info("Shutting down MS PRINTERS Hardware Agent...")
            break
        except Exception as e:
            logger.error(f"Agent poll error: {e}")
            time.sleep(3)

if __name__ == "__main__":
    run_loop()
