import frida, sys, time

serial, pkg, jsp = sys.argv[1], sys.argv[2], sys.argv[3]
js = open(jsp, encoding="utf-8").read()

dev = frida.get_device(serial, timeout=30)
print("device:", dev)

pid = dev.spawn([pkg])
print("spawned pid", pid)
session = dev.attach(pid)

state = {"done": False, "path": None, "classes": None, "methods": None}
def on_message(m, data):
    if m.get("type") == "send":
        p = m.get("payload")
        print("[send]", p)
        if isinstance(p, dict) and p.get("dumped"):
            state.update(done=True, path=p.get("path"),
                         classes=p.get("classes"), methods=p.get("methods"))
    elif m.get("type") == "log":
        print(m.get("payload"))
    else:
        print("[msg]", m)

script = session.create_script(js)
script.on("message", on_message)
script.load()
dev.resume(pid)

# il2cpp init can take a while; the VR game may crash after, so grab it fast
for _ in range(90):
    if state["done"]:
        break
    time.sleep(2)

print("DRIVER_DONE done=%s classes=%s methods=%s path=%s" % (
    state["done"], state["classes"], state["methods"], state["path"]))
try:
    session.detach()
except Exception:
    pass
