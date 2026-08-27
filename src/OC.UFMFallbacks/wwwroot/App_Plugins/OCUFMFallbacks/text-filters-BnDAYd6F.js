function e(t) {
  return t == null ? "" : typeof t == "object" && "markup" in t ? String(t.markup ?? "") : String(t);
}
function o(t) {
  const r = e(t).replace(/<[^>]*>/g, " ");
  return (new DOMParser().parseFromString(r, "text/html").body.textContent ?? "").replace(/\s+/g, " ").trim();
}
function i(t, r = " - ") {
  const n = e(t).trim();
  return n ? `${r}${n}` : "";
}
export {
  i as d,
  o as s
};
//# sourceMappingURL=text-filters-BnDAYd6F.js.map
