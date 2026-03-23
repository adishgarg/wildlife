const { JSDOM } = require("jsdom");
const fs = require("fs");
const html = fs.readFileSync("admin.html", "utf8");
const dom = new JSDOM(html, {
  url: "http://localhost:3000/admin.html",
  runScripts: "dangerously",
  resources: "usable"
});
dom.window.document.addEventListener("DOMContentLoaded", () => {
    console.log("JSDOM: DOM loaded");
    const adminMain = dom.window.document.querySelector(".admin-main");
    console.log("adminMain inside JSDOM:", adminMain ? "Exists" : "Missing");
    const activeSection = dom.window.document.querySelector(".admin-section.active");
    console.log("activeSection inside JSDOM:", activeSection ? activeSection.id : "None");
});
setTimeout(() => console.log("JSDOM: Timeout reached"), 4000);
