import frida, sys, time

serial, pkg, jsp = sys.argv[1], sys.argv[2], sys.argv[3]
js = open(jsp, encoding="utf-8").read()

dev = frida.get_device(serial, timeout=30)
print("device:", dev)
pid = dev.spawn([pkg])
print("spawned pid", pid)
session = dev.attach(pid)

done = {"v": False}
def on_message(m, data):
    if m.get("type") == "send":
        print("[send]", m.get("payload")); done["v"] = True
    elif m.get("type") == "log":
        print(m.get("payload"))
    else:
        print("[msg]", m)

script = session.create_script(js)
script.on("message", on_message)
script.load()
dev.resume(pid)

# il2cpp loads a few seconds after start; poll run() until it reports
for i in range(60):
    if done["v"]:
        break
    try:
        ok = script.exports_sync.run()
        if ok:
            time.sleep(1)
            break
    except Exception as e:
        print("[rpc]", e)
    time.sleep(2)

time.sleep(1)
print("DIAG_DONE done=" + str(done["v"]))
try:
    session.detach()
except Exception:
    pass
