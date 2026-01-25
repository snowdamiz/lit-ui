console.log("Hydration complete - components are now interactive");
const o = document.querySelector("#demo-button");
o?.addEventListener("click", () => {
  alert("Button clicked! Hydration is working.");
});
const t = document.querySelector("#open-dialog"), e = document.querySelector("#demo-dialog"), n = document.querySelector("#close-dialog");
t?.addEventListener("click", () => {
  e && (e.open = !0);
});
n?.addEventListener("click", () => {
  e && (e.open = !1);
});
