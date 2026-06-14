"""
run.py — One-command launcher for Vortex
Usage:  python run.py
"""
import sys, os
import subprocess
import atexit

# ensure project root on path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.database import init_db
from backend.app import app

if __name__ == "__main__":
    print("=" * 50)
    print("  VORTEX -- Adaptive Study Planner")
    print("=" * 50)
    init_db()

    frontend_process = None
    # Prevent werkzeug reloader from starting the frontend server multiple times
    if os.environ.get("WERKZEUG_RUN_MAIN") != "true":
        print("  Starting frontend server on port 8080...")
        frontend_process = subprocess.Popen(
            [sys.executable, "-m", "http.server", "8080", "--directory", "frontend"]
        )

        def cleanup():
            if frontend_process:
                frontend_process.terminate()
        atexit.register(cleanup)

    print("\n  API :  http://localhost:5000")
    print("  UI  :  http://localhost:8080")
    print("  Ctrl+C to stop\n")
    try:
        app.run(debug=True, port=5000, host="0.0.0.0")
    except KeyboardInterrupt:
        pass
