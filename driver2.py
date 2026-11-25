#!/usr/bin/env python3
# Robust driver: attaches to an ALREADY-RUNNING game process (spawn-gating hung a
# heavy VR title in earlier runs), streams the dump from the agent via send()
# into a host-side file, prints every message immediately (unbuffered), and has a
# hard wall-clock cap so it can never hang the CI for 90 minutes again.
#
# usage: python3 -u driver2.py <serial> <proc-name-or-pid> <agent.js> <out.cs> [max_secs]
import frida, sys, time

serial, target, jsp, outp = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
max_secs = int(sys.argv[5]) if len(sys.argv) > 5 else 360

def log(*a):
    print(*a, flush=True)

dev = frida.get_device(serial, timeout=30)
log("device:", dev.id)

# resolve target to a pid (retry while the app is still coming up)
pid = None
if target.isdigit():
    pid = int(target)
else:
    for attempt in range(30):
        for p in dev.enumerate_processes():
            n = p.name.lower()
            if target.lower() in n or "illa" in n or "playgilla" in n:
                pid = p.pid; log("resolved '%s' -> pid %d (%s)" % (target, p.pid, p.name)); break
        if pid: break
        time.sleep(2)
if pid is None:
    log("FATAL: process '%s' not found" % target); sys.exit(2)

session = dev.attach(pid)
log("attached pid", pid)

outf = open(outp, "w", encoding="utf-8", newline="\n")
state = {"done": False, "classes": 0, "methods": 0, "chunks": 0, "err": None, "calib": None}

def on_message(m, data):
    t = m.get("type")
    if t == "send":
        p = m.get("payload")
        if isinstance(p, dict):
            if "chunk" in p:
                outf.write(p["chunk"]); outf.flush(); state["chunks"] += 1
            elif p.get("dumped"):
                state.update(done=True, classes=p.get("classes"), methods=p.get("methods"), calib=p.get("calib"))
                log("[DONE] classes=%s methods=%s forEach=%s calib=%s" % (p.get("classes"), p.get("methods"), p.get("forEach"), p.get("calib")))
            elif "progress" in p:
                log("[progress]", p["progress"])
            elif "log" in p:
                log(p["log"])
            elif "error" in p:
                state["err"] = p["error"]; log("[AGENT-ERROR]", p["error"])
            else:
                log("[send]", p)
        else:
            log("[send]", p)
    elif t == "error":
        state["err"] = m.get("description"); log("[SCRIPT-ERROR]", m.get("description")); log(m.get("stack"))
    else:
        log("[msg]", m)

script = session.create_script(open(jsp, encoding="utf-8").read())
script.on("message", on_message)
script.load()

t0 = time.time()
while not state["done"] and not state["err"] and (time.time() - t0) < max_secs:
    time.sleep(1)

outf.flush(); outf.close()
log("DRIVER_DONE done=%s classes=%s methods=%s chunks=%s elapsed=%.0fs err=%s" % (
    state["done"], state["classes"], state["methods"], state["chunks"], time.time() - t0, state["err"]))
try: session.detach()
except Exception: pass
sys.exit(0 if state["done"] else 3)
