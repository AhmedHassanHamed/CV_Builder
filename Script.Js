/* ===== script.js — المنطق الرئيسي ===== */
const KEY = "cvb:v1";
const LIST_FIELDS = {
  exp: ["role", "company", "from", "to", "desc"],
  edu: ["degree", "school", "note", "from", "to"],
  refs: ["name", "role", "phone", "email"],
  proj: ["pname", "plink", "desc"],
  courses: ["cname", "corg", "cyear"],
};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const t = (k) => I18N[S.lang][k];
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

/* ---------- 1. الحالة والحفظ التلقائي ---------- */
const blank = () => ({
  lang: "ar",
  tpl: "modern",
  color: "#0f766e",
  dark: false,
  p: {
    name: "",
    title: "",
    email: "",
    phone: "",
    city: "",
    summary: "",
    photo: "",
    site: "",
  },
  exp: [],
  edu: [],
  refs: [],
  proj: [],
  courses: [],
  interests: "",
  customTitle: "",
  customText: "",
  skills: "",
  langs: "",
});

function load() {
  try {
    return { ...blank(), ...JSON.parse(localStorage.getItem(KEY)) };
  } catch {
    return blank();
  }
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch {}
}
let S = load();

/* ---------- 2. اللغة والمظهر ---------- */
function applyChrome() {
  document.documentElement.lang = S.lang;
  document.documentElement.dir = S.lang === "ar" ? "rtl" : "ltr";
  document.documentElement.dataset.theme = S.dark ? "dark" : "light";
  document.documentElement.style.setProperty("--accent", S.color);
  $$("[data-i]:not([data-list]):not([data-rm]):not(.grip)").forEach(
    (el) => (el.textContent = t(el.dataset.i)),
  );
  $$("[data-ph]").forEach((el) => (el.placeholder = t(el.dataset.ph)));
  $("#btnLang").textContent = S.lang === "ar" ? "EN" : "عربي";
  $("#color").value = S.color;
  $("#tpl").value = S.tpl;
}

/* ---------- 3. الفورم ---------- */
function itemHTML(list, i, item) {
  const f = LIST_FIELDS[list];
  const inp = (k, tag = "input") =>
    `<${tag} data-list="${list}" data-i="${i}" data-f="${k}" placeholder="${esc(t("f_" + k))}" ${tag === "textarea" ? 'rows="3"' : `value="${esc(item[k])}"`}>${tag === "textarea" ? esc(item[k]) + "</textarea>" : ""}`;
  const main = f
    .filter((k) => !["from", "to", "desc"].includes(k))
    .map((k) => inp(k))
    .join("");
  const dates = f.includes("from")
    ? `<div class="row">${inp("from")}${inp("to")}</div>`
    : "";
  const desc = f.includes("desc") ? inp("desc", "textarea") : "";
  return `<div class="item"><button class="rm" data-rm="${list}" data-i="${i}" aria-label="remove">✕</button>${main}${dates}${desc}</div>`;
}
function renderLists() {
  ["exp", "edu", "refs", "proj", "courses"].forEach(
    (l) =>
      ($("#list-" + l).innerHTML = S[l]
        .map((it, i) => itemHTML(l, i, it))
        .join("")),
  );
}
function fillForm() {
  $$("[data-p]").forEach((el) => (el.value = S.p[el.dataset.p] || ""));
  $$("[data-k]").forEach((el) => (el.value = S[el.dataset.k] || ""));
  renderLists();
}

/* ---------- 4. قوالب المعاينة ---------- */
const lines = (s) =>
  String(s || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
const dates = (it) => [it.from, it.to].filter(Boolean).join(" – ");
const jobsHTML = () =>
  S.exp
    .map(
      (e) =>
        `<div class="job"><b>${esc(e.role)}</b><span class="meta">${esc([e.company, dates(e)].filter(Boolean).join(" | "))}</span><ul>${lines(
          e.desc,
        )
          .map((l) => `<li>${esc(l)}</li>`)
          .join("")}</ul></div>`,
    )
    .join("");
const edusHTML = () =>
  S.edu
    .map(
      (e) =>
        `<div class="edu"><b>${esc(e.degree)}</b><span class="meta">${esc([e.school, dates(e)].filter(Boolean).join(" | "))}</span>${e.note ? `<span class="meta">${esc(e.note)}</span>` : ""}</div>`,
    )
    .join("");
const skillList = () =>
  S.skills
    .split(/[,،\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
const block = (title, body) => (body ? `<h2>${title}</h2>${body}` : "");

const TEMPLATES = {
  modern() {
    const p = S.p,
      contact = [p.email, p.phone, p.city, p.site]
        .filter(Boolean)
        .map((x) => `<p>${esc(x)}</p>`)
        .join("");
    return `<div class="cv t-modern"><aside>${block(t("h_contact"), contact)}
      ${block(
        t("h_skills"),
        skillList().length
          ? `<ul>${skillList()
              .map((s) => `<li>${esc(s)}</li>`)
              .join("")}</ul>`
          : "",
      )}
      ${block(
        t("h_langs"),
        lines(S.langs).length
          ? `<ul>${lines(S.langs)
              .map((s) => `<li>${esc(s)}</li>`)
              .join("")}</ul>`
          : "",
      )}</aside>
      <div class="main"><h1>${esc(p.name)}</h1><div class="role">${esc(p.title)}</div>
      ${block(t("h_profile"), p.summary && `<p>${esc(p.summary)}</p>`)}${block(t("h_exp"), jobsHTML())}${block(t("h_edu"), edusHTML())}</div></div>`;
  },
  minimal() {
    const p = S.p,
      contact = [p.email, p.phone, p.city, p.site]
        .filter(Boolean)
        .map(esc)
        .join(" | ");
    return `<div class="cv t-minimal"><header><h1>${esc(p.name)}</h1><div>${esc(p.title)}</div><div class="meta">${contact}</div></header>
      ${block(t("h_profile"), p.summary && `<p>${esc(p.summary)}</p>`)}${block(t("h_exp"), jobsHTML())}${block(t("h_edu"), edusHTML())}
      ${block(t("h_skills"), skillList().length && `<p>${skillList().map(esc).join(", ")}</p>`)}
      ${block(t("h_langs"), lines(S.langs).length && `<p>${lines(S.langs).map(esc).join(", ")}</p>`)}</div>`;
  },
};

/* ---------- 5. المعاينة، التقدم، التحجيم ---------- */
const isEmpty = () =>
  !Object.values(S.p).some(Boolean) &&
  !S.exp.length &&
  !S.edu.length &&
  !S.skills &&
  !S.langs &&
  !S.refs.length &&
  !S.proj.length &&
  !S.courses.length &&
  !S.interests &&
  !S.customText;

function checks() {
  const p = S.p;
  return [
    ["name", p.name],
    ["title", p.title],
    ["email", p.email],
    ["phone", p.phone],
    ["summary", p.summary.length >= 50],
    ["exp", S.exp.length],
    ["edu", S.edu.length],
    ["skills", skillList().length >= 3],
    ["langs", lines(S.langs).length],
  ];
}
function renderProgress() {
  const c = checks(),
    done = c.filter((x) => x[1]).length,
    pct = Math.round((done / c.length) * 100);
  const miss = c
    .filter((x) => !x[1])
    .slice(0, 2)
    .map((x) => t("c_" + x[0]))
    .join("، ");
  $("#barFill").style.width = pct + "%";
  $("#barText").textContent =
    `${t("progress")}: ${pct}%` + (miss ? ` — ${t("missing")}: ${miss}` : "");
}
function fitSheet() {
  const sheet = $("#sheet"),
    wrap = $("#sheetWrap");
  const scale = Math.min(1, wrap.clientWidth / sheet.offsetWidth);
  sheet.style.zoom = scale;
}
function renderPreview() {
  const empty = isEmpty();
  $("#empty").hidden = !empty;
  $("#sheetWrap").hidden = empty;
  if (!empty) {
    $("#sheet").innerHTML = TEMPLATES[S.tpl]();
    fitSheet();
  }
  renderProgress();
}
const update = () => {
  save();
  renderPreview();
};

/* ---------- 6. تنبيه التراجع (Undo) ---------- */
let toastTimer;
function toast(msg, undoSnapshot) {
  const el = $("#toast");
  el.innerHTML =
    `<span>${esc(msg)}</span>` +
    (undoSnapshot ? `<button>${esc(t("undo"))}</button>` : "");
  el.hidden = false;
  if (undoSnapshot)
    $("button", el).onclick = () => {
      S = JSON.parse(undoSnapshot);
      el.hidden = true;
      fillForm();
      update();
    };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 6000);
}

/* ---------- 7. الأحداث ---------- */
function loadDemo() {
  const d = JSON.parse(JSON.stringify(DEMO[S.lang]));
  S = { ...S, ...d };
  fillForm();
  update();
}
$("#form").addEventListener("input", (e) => {
  const el = e.target;
  if (el.dataset.p) S.p[el.dataset.p] = el.value;
  else if (el.dataset.k) S[el.dataset.k] = el.value;
  else if (el.dataset.list)
    S[el.dataset.list][+el.dataset.i][el.dataset.f] = el.value;
  update();
});
$("#form").addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]"),
    rm = e.target.closest("[data-rm]");
  if (add) {
    const l = add.dataset.add;
    S[l].push(Object.fromEntries(LIST_FIELDS[l].map((k) => [k, ""])));
    renderLists();
    update();
  }
  if (rm) {
    const snap = JSON.stringify(S);
    S[rm.dataset.rm].splice(+rm.dataset.i, 1);
    renderLists();
    update();
    toast(t("removed"), snap);
  }
});
$("#tpl").onchange = (e) => {
  S.tpl = e.target.value;
  update();
};
$("#color").oninput = (e) => {
  S.color = e.target.value;
  applyChrome();
  update();
};
$("#btnTheme").onclick = () => {
  S.dark = !S.dark;
  applyChrome();
  save();
};
$("#btnLang").onclick = () => {
  S.lang = S.lang === "ar" ? "en" : "ar";
  applyChrome();
  fillForm();
  update();
};
$("#btnDemo").onclick = loadDemo;
$("[data-act=demo]").onclick = loadDemo;
function printPdf() {
  // اسم ملف الـ PDF = اسم صاحب السيرة
  const old = document.title;
  document.title = (S.p.name || "CV") + " - CV";
  window.print();
  document.title = old;
}
$("#btnPdf").onclick = printPdf;
window.addEventListener("resize", fitSheet);

/* ================= features: قوالب + خطاب + ATS + Word ================= */
/* ===== features.js — قوالب إضافية + خطاب تقديم + فحص ATS + تصدير Word ===== */

/* ---------- 1. نصوص إضافية (تندمج في I18N الأصلي) ---------- */
Object.assign(I18N.ar, {
  tpl_exec: "تنفيذي",
  tpl_creative: "إبداعي",
  btn_letter: "خطاب التقديم",
  btn_cv: "السيرة",
  btn_word: "Word",
  btn_ats: "فحص ATS",
  sec_letter: "خطاب التقديم",
  f_lcompany: "الشركة المقدَّم إليها",
  f_lrole: "الوظيفة المطلوبة",
  close: "إغلاق",
  ats_title: "فحص توافق ATS",
  ats_note: "قائمة فحص بقواعد بسيطة، مش ذكاء اصطناعي",
  word_err: "مكتبة Word لم تُحمَّل، تأكد من الاتصال بالإنترنت",
});
Object.assign(I18N.en, {
  tpl_exec: "Executive",
  tpl_creative: "Creative",
  btn_letter: "Cover letter",
  btn_cv: "CV",
  btn_word: "Word",
  btn_ats: "ATS check",
  sec_letter: "Cover letter",
  f_lcompany: "Target company",
  f_lrole: "Target position",
  close: "Close",
  ats_title: "ATS compatibility check",
  ats_note: "A checklist of simple rules, not AI",
  word_err: "Word library failed to load, check your connection",
});

/* ---------- 2. القالبان الجديدان (بيستخدموا نفس الدوال المساعدة) ---------- */
const contactLine = () =>
  [S.p.email, S.p.phone, S.p.city, S.p.site]
    .filter(Boolean)
    .map(esc)
    .join(" | ");
const listOrEmpty = (arr, fn) => (arr.length ? fn(arr) : "");

TEMPLATES.executive =
  () => `<div class="cv t-exec"><header><h1>${esc(S.p.name)}</h1><div class="role">${esc(S.p.title)}</div><div class="meta">${contactLine()}</div></header>
  ${block(t("h_profile"), S.p.summary && `<p>${esc(S.p.summary)}</p>`)}${block(t("h_exp"), jobsHTML())}${block(t("h_edu"), edusHTML())}
  ${block(
    t("h_skills"),
    listOrEmpty(skillList(), (a) => `<p>${a.map(esc).join(" | ")}</p>`),
  )}
  ${block(
    t("h_langs"),
    listOrEmpty(lines(S.langs), (a) => `<p>${a.map(esc).join(" | ")}</p>`),
  )}</div>`;

TEMPLATES.creative =
  () => `<div class="cv t-creative"><header><h1>${esc(S.p.name)}</h1><div class="role">${esc(S.p.title)}</div></header>
  <div class="body"><div class="col">${block(t("h_profile"), S.p.summary && `<p>${esc(S.p.summary)}</p>`)}${block(t("h_exp"), jobsHTML())}${block(t("h_edu"), edusHTML())}</div>
  <aside>${block(
    t("h_contact"),
    [S.p.email, S.p.phone, S.p.city, S.p.site]
      .filter(Boolean)
      .map((x) => `<p>${esc(x)}</p>`)
      .join(""),
  )}
  ${block(
    t("h_skills"),
    skillList()
      .map((s) => `<span class="pill">${esc(s)}</span>`)
      .join(""),
  )}
  ${block(
    t("h_langs"),
    lines(S.langs)
      .map((x) => `<p>${esc(x)}</p>`)
      .join(""),
  )}</aside></div></div>`;

/* ---------- 3. خطاب التقديم (يتولد من بيانات السيرة) ---------- */
function letterLines() {
  const p = S.p,
    ar = S.lang === "ar",
    e = S.exp[0],
    c = S.letterCompany,
    r = S.letterRole || p.title;
  const sk = skillList()
    .slice(0, 3)
    .join(ar ? "، " : ", ");
  return [
    ar ? `السادة/ ${c || "…"} المحترمين،` : `Dear ${c || "Hiring Manager"},`,
    ar
      ? `يسعدني التقدّم لوظيفة ${r} لديكم. أنا ${p.name}، ${p.title}.`
      : `I am writing to apply for the ${r} position. I am ${p.name}, ${p.title}.`,
    p.summary,
    e && e.role
      ? ar
        ? `كانت خبرتي الأخيرة كـ ${e.role} في ${e.company}.`
        : `Most recently I worked as ${e.role} at ${e.company}.`
      : "",
    sk ? (ar ? `أتميّز بمهارات في ${sk}.` : `My strengths include ${sk}.`) : "",
    ar
      ? "يسعدني الحديث معكم في مقابلة أعرض فيها ما يمكنني تقديمه للفريق."
      : "I would welcome the chance to discuss how I can contribute to your team.",
    ar ? "مع خالص التقدير،" : "Sincerely,",
    p.name,
    [p.phone, p.email].filter(Boolean).join(" | "),
  ].filter(Boolean);
}
const letterHTML = () =>
  `<div class="cv t-minimal">${letterLines()
    .map((l) => `<p>${esc(l)}</p>`)
    .join("")}</div>`;

/* نلفّ دالة المعاينة الأصلية: لو العرض "خطاب" نبدّل المحتوى */
const _renderPreview = renderPreview;
renderPreview = function () {
  _renderPreview();
  if (S.view === "letter" && !isEmpty()) {
    $("#sheet").innerHTML = letterHTML();
    fitSheet();
  }
  $("#btnLetter").textContent = t(
    S.view === "letter" ? "btn_cv" : "btn_letter",
  );
};

/* ---------- 4. فحص ATS ---------- */
const bullets = () => S.exp.flatMap((e) => lines(e.desc));
const ATS_RULES = [
  { ar: "الاسم مكتوب", en: "Name is present", ok: () => !!S.p.name.trim() },
  {
    ar: "إيميل بصيغة صحيحة",
    en: "Valid email format",
    ok: () => /^\S+@\S+\.\S+$/.test(S.p.email),
  },
  {
    ar: "رقم هاتف موجود",
    en: "Phone number present",
    ok: () => S.p.phone.replace(/\D/g, "").length >= 8,
  },
  {
    ar: "النبذة بين ٥٠ و٦٠٠ حرف",
    en: "Summary is 50–600 characters",
    ok: () => S.p.summary.length >= 50 && S.p.summary.length <= 600,
  },
  {
    ar: "خبرة عمل واحدة على الأقل",
    en: "At least one job",
    ok: () => S.exp.length > 0,
  },
  {
    ar: "كل خبرة فيها نقطتين أو أكتر",
    en: "Each job has 2+ bullets",
    ok: () => S.exp.length > 0 && S.exp.every((e) => lines(e.desc).length >= 2),
  },
  {
    ar: "فيه أرقام في الإنجازات",
    en: "Achievements include numbers",
    ok: () => bullets().some((b) => /\d|[٠-٩]/.test(b)),
  },
  { ar: "التعليم مكتوب", en: "Education present", ok: () => S.edu.length > 0 },
  {
    ar: "٥ مهارات أو أكتر",
    en: "5+ skills listed",
    ok: () => skillList().length >= 5,
  },
  {
    ar: "لا نقطة أطول من ٢٠٠ حرف",
    en: "No bullet over 200 characters",
    ok: () => bullets().every((b) => b.length <= 200),
  },
  {
    ar: "قالب بعمود واحد (Minimal أو Executive أو Compact)",
    en: "Single-column template (Minimal, Executive or Compact)",
    ok: () => ["minimal", "executive"].includes(S.tpl),
  },
  {
    ar: "من غير صورة شخصية (ATS بتتجاهلها)",
    en: "No photo (ATS ignores it)",
    ok: () => !S.p.photo,
  },
];
function showATS() {
  const res = ATS_RULES.map((r) => [r[S.lang], r.ok()]);
  const pct = Math.round((res.filter((x) => x[1]).length / res.length) * 100);
  const d = $("#atsDlg");
  d.innerHTML = `<h3>${t("ats_title")}</h3><small>${t("ats_note")}</small><div class="ats-score">${pct}%</div>
    <ul class="ats-list">${res.map(([txt, ok]) => `<li class="${ok ? "ok" : "no"}">${ok ? "✓" : "✗"} ${esc(txt)}</li>`).join("")}</ul>
    <button class="primary" onclick="this.closest('dialog').close()">${t("close")}</button>`;
  d.showModal();
}

/* ---------- 5. تصدير Word (docx.js) ---------- */
async function exportWord() {
  if (!window.docx) return toast(t("word_err"));
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = docx,
    rtl = S.lang === "ar",
    hex = S.color.slice(1);
  const P = (text, o = {}) =>
    new Paragraph({
      bidirectional: rtl,
      alignment: AlignmentType.START,
      spacing: { after: o.after ?? 80 },
      bullet: o.bullet ? { level: 0 } : undefined,
      children: [
        new TextRun({
          text: String(text),
          bold: !!o.b,
          size: o.size || 22,
          color: o.color,
          font: "Arial",
          rightToLeft: rtl,
        }),
      ],
    });
  const H = (x) => P(x, { b: 1, size: 26, color: hex });
  const K = [],
    p = S.p;
  if (S.view === "letter")
    letterLines().forEach((l) => K.push(P(l, { after: 160 })));
  else {
    K.push(
      P(p.name, { b: 1, size: 40 }),
      P(p.title, { size: 26, color: hex }),
      P([p.email, p.phone, p.city, p.site].filter(Boolean).join(" | "), {
        after: 200,
      }),
    );
    if (p.summary) K.push(H(t("h_profile")), P(p.summary));
    if (S.exp.length) {
      K.push(H(t("h_exp")));
      S.exp.forEach((e) => {
        K.push(
          P(e.role, { b: 1, after: 0 }),
          P([e.company, dates(e)].filter(Boolean).join(" | ")),
        );
        lines(e.desc).forEach((l) => K.push(P(l, { bullet: 1 })));
      });
    }
    if (S.edu.length) {
      K.push(H(t("h_edu")));
      S.edu.forEach((e) =>
        K.push(
          P(e.degree, { b: 1, after: 0 }),
          P([e.school, dates(e)].filter(Boolean).join(" | ")),
        ),
      );
    }
    if (skillList().length) K.push(H(t("h_skills")), P(skillList().join(", ")));
    if (lines(S.langs).length)
      K.push(H(t("h_langs")), ...lines(S.langs).map((l) => P(l)));
    if (S.refs.length)
      K.push(
        H(t("h_refs")),
        ...S.refs.map((r) =>
          P([r.name, r.role, r.phone, r.email].filter(Boolean).join(" | ")),
        ),
      );
    if (S.proj.length)
      K.push(
        H(t("h_proj")),
        ...S.proj.flatMap((x) => [
          P(x.pname, { b: 1, after: 0 }),
          ...(x.plink ? [P(x.plink)] : []),
          ...lines(x.desc).map((l) => P(l, { bullet: 1 })),
        ]),
      );
    if (S.courses.length)
      K.push(
        H(t("h_courses")),
        ...S.courses.map((c) =>
          P([c.cname, c.corg, c.cyear].filter(Boolean).join(" | ")),
        ),
      );
    if (S.interests.trim()) K.push(H(t("h_interests")), P(S.interests));
    if (S.customTitle.trim() && S.customText.trim())
      K.push(
        H(S.customTitle),
        ...lines(S.customText).map((l) => P(l, { bullet: 1 })),
      );
  }
  const blob = await Packer.toBlob(
    new Document({ sections: [{ children: K }] }),
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download =
    (p.name || "CV") + (S.view === "letter" ? "-letter" : "") + ".docx";
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ---------- 6. حقن العناصر في الصفحة ---------- */
[
  ["executive", "tpl_exec"],
  ["creative", "tpl_creative"],
].forEach(([v, k]) => {
  const o = document.createElement("option");
  o.value = v;
  o.dataset.i = k;
  $("#tpl").append(o);
});

const fs = document.createElement("fieldset");
fs.innerHTML = `<legend data-i="sec_letter"></legend><input data-k="letterCompany" data-ph="f_lcompany"><input data-k="letterRole" data-ph="f_lrole">`;
$("#form").append(fs);

const dlg = document.createElement("dialog");
dlg.id = "atsDlg";
document.body.append(dlg);

function addBtn(id, key, fn) {
  const b = document.createElement("button");
  b.id = id;
  b.className = "ghost";
  b.dataset.i = key;
  b.onclick = fn;
  $("#btnPdf").before(b);
}
addBtn("btnLetter", "btn_letter", () => {
  S.view = S.view === "letter" ? "cv" : "letter";
  update();
});
addBtn("btnAts", "btn_ats", showATS);
addBtn("btnWord", "btn_word", exportWord);

/* ================= extras: ترتيب بالسحب + ألوان + مهارات + QR + LinkedIn ================= */
/* ===== extras.js — باقي المميزات: قوالب، ترتيب بالسحب، ألوان ومهارات حسب المجال، QR، استيراد LinkedIn ===== */

/* ---------- 1. نصوص ---------- */
Object.assign(I18N.ar, {
  tpl_timeline: "خط زمني",
  tpl_compact: "مضغوط",
  pal: "ألوان حسب المجال",
  skl: "مهارات جاهزة حسب المجال",
  f_qr: "رابط البورتفوليو أو LinkedIn (يتحول QR)",
  btn_import: "استيراد من LinkedIn",
  imp_title: "استيراد من نص LinkedIn",
  imp_note: "الصق نص بروفايلك. تحليل نصي بسيط، مش ربط بـ API، فراجع النتيجة.",
  imp_go: "تحليل واستيراد",
  imp_ph: "الصق هنا...",
  qr_label: "بروفايلي",
  btn_fit: "ملاءمة الصفحة",
  sec_proj: "المشاريع",
  h_proj: "المشاريع",
  sec_courses: "الدورات والشهادات",
  h_courses: "الدورات والشهادات",
  sec_interests: "الاهتمامات",
  h_interests: "الاهتمامات",
  sec_custom: "قسم مخصص (اختياري)",
  f_pname: "اسم المشروع",
  f_plink: "رابط المشروع (اختياري)",
  f_cname: "اسم الدورة / الشهادة",
  f_corg: "الجهة المانحة",
  f_cyear: "السنة",
  f_interests: "اهتماماتك مفصولة بفاصلة: القراءة, التصوير",
  f_ctitle: "عنوان القسم (مثال: الجوائز)",
  f_ctext: "المحتوى (كل سطر نقطة)",
  sec_refs: "المراجع",
  h_refs: "المراجع",
  f_note: "المعدل / ملاحظة (اختياري)",
  f_site: "الموقع أو LinkedIn",
  f_photo: "صورة شخصية (اختياري)",
  photo_rm: "حذف الصورة",
  tpl_pro: "احترافي (شريط جانبي)",
  btn_clear: "مسح الكل",
  cleared: "تم مسح البيانات",
});
Object.assign(I18N.en, {
  tpl_timeline: "Timeline",
  tpl_compact: "Compact",
  pal: "Colors by field",
  skl: "Preset skills by field",
  f_qr: "Portfolio or LinkedIn link (becomes a QR)",
  btn_import: "Import from LinkedIn",
  imp_title: "Import from LinkedIn text",
  imp_note:
    "Paste your profile text. Simple text parsing, not an API link, so review the result.",
  imp_go: "Parse & import",
  imp_ph: "Paste here...",
  qr_label: "My profile",
  btn_fit: "Fit page",
  sec_proj: "Projects",
  h_proj: "Projects",
  sec_courses: "Courses & certificates",
  h_courses: "Courses & certificates",
  sec_interests: "Interests",
  h_interests: "Interests",
  sec_custom: "Custom section (optional)",
  f_pname: "Project name",
  f_plink: "Project link (optional)",
  f_cname: "Course / certificate name",
  f_corg: "Issuer",
  f_cyear: "Year",
  f_interests: "Comma-separated: Reading, Photography",
  f_ctitle: "Section title (e.g. Awards)",
  f_ctext: "Content (one bullet per line)",
  sec_refs: "References",
  h_refs: "References",
  f_note: "GPA / note (optional)",
  f_site: "Website or LinkedIn",
  f_photo: "Profile photo (optional)",
  photo_rm: "Remove photo",
  tpl_pro: "Professional (sidebar)",
  btn_clear: "Clear all",
  cleared: "Data cleared",
});

/* ---------- 2. قالبان إضافيان (إعادة استخدام القوالب الموجودة بتغيير الـ class) ---------- */
/* قالب Professional: شريط جانبي + صورة + مراجع (زي النموذج المرجعي) */
const liList = (a) =>
  a.length ? `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
const refsHTML = () =>
  S.refs.length
    ? `<h2>${t("h_refs")}</h2><div class="refs">${S.refs.map((r) => `<div class="ref"><b>${esc(r.name)}</b><div>${esc(r.role)}</div><small>${esc(r.phone)}</small><small>${esc(r.email)}</small></div>`).join("")}</div>`
    : "";
TEMPLATES.professional = () => {
  const p = S.p,
    contact = [p.phone, p.email, p.city, p.site]
      .filter(Boolean)
      .map((x) => `<p>${esc(x)}</p>`)
      .join(""),
    edu = S.edu
      .map(
        (e) =>
          `<div class="edu"><b>${esc(dates(e))}</b><p>${esc(e.school)}</p><p>${esc(e.degree)}</p>${e.note ? `<p>${esc(e.note)}</p>` : ""}</div>`,
      )
      .join(""),
    jobs = S.exp
      .map(
        (e) =>
          `<div class="job"><div class="jh"><b>${esc(e.company)}</b><span>${esc(dates(e))}</span></div><div class="jr">${esc(e.role)}</div>${liList(lines(e.desc))}</div>`,
      )
      .join("");
  return `<div class="cv t-modern t-pro"><aside>${block(t("h_contact"), contact)}${block(t("h_edu"), edu)}${block(t("h_skills"), liList(skillList()))}${block(t("h_langs"), liList(lines(S.langs)))}</aside>
  <div class="main"><h1>${esc(p.name)}</h1><div class="role">${esc(p.title)}</div>${block(t("h_profile"), p.summary && `<p>${esc(p.summary)}</p>`)}${block(t("h_exp"), jobs)}${refsHTML()}</div></div>`;
};
/* المراجع في باقي القوالب + الصورة في القوالب اللي فيها شريط جانبي */
function addRefs() {
  if (S.view === "letter" || $("#sheet .refs")) return;
  const box = $("#sheet .main") || $("#sheet .col") || $("#sheet .cv");
  if (box) box.insertAdjacentHTML("beforeend", refsHTML());
}
/* أقسام إضافية: المشاريع / الدورات / الاهتمامات / قسم مخصص — بتتحقن في كل القوالب */
function extraBlocks() {
  const interests = S.interests
    .split(/[,،\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
  return {
    proj: S.proj.length
      ? `<h2>${t("h_proj")}</h2>` +
        S.proj
          .map(
            (x) =>
              `<div class="job"><b>${esc(x.pname)}</b>${x.plink ? `<span class="meta">${esc(x.plink)}</span>` : ""}${liList(lines(x.desc))}</div>`,
          )
          .join("")
      : "",
    courses: S.courses.length
      ? `<h2>${t("h_courses")}</h2>` +
        S.courses
          .map(
            (c) =>
              `<div class="edu"><b>${esc(c.cname)}</b><span class="meta">${esc([c.corg, c.cyear].filter(Boolean).join(" | "))}</span></div>`,
          )
          .join("")
      : "",
    interests: interests.length
      ? `<h2>${t("h_interests")}</h2><p>${interests.map(esc).join(" | ")}</p>`
      : "",
    custom:
      S.customTitle.trim() && S.customText.trim()
        ? `<h2>${esc(S.customTitle.trim())}</h2>${liList(lines(S.customText))}`
        : "",
  };
}
function addExtras() {
  if (S.view === "letter") return;
  Object.entries(extraBlocks()).forEach(([k, html]) => {
    // الدورات والاهتمامات (قصيرة) تروح للشريط الجانبي لو موجود، عشان يتوازن الشكل
    const box =
      ((k === "courses" || k === "interests") && $("#sheet aside")) ||
      $("#sheet .main") ||
      $("#sheet .col") ||
      $("#sheet .cv");
    if (html && box) box.insertAdjacentHTML("beforeend", html);
  });
}
/* ملاءمة الصفحة: الخط يكبر (حتى 12.5pt) لو المحتوى قليل، ويصغر (حتى 9.5pt) لو طويل، عشان صفحة A4 تبان متوازنة */
function autoFit() {
  const sheet = $("#sheet"),
    cv = $("#sheet .cv");
  if (!cv) return;
  sheet.style.zoom = 1;
  sheet.style.fontSize = "";
  sheet.classList.add("measuring");
  const page = (297 / 25.4) * 96 - 4;
  if (S.fit !== false) {
    let lo = 9.5,
      hi = 12.5;
    for (let i = 0; i < 7; i++) {
      const mid = (lo + hi) / 2;
      sheet.style.fontSize = mid + "pt";
      if (cv.offsetHeight <= page) lo = mid;
      else hi = mid;
    }
    sheet.style.fontSize = lo + "pt";
    if (cv.offsetHeight > page) sheet.style.fontSize = ""; // مش هيتحشر في صفحة: سيبه عادي
  }
  sheet.classList.remove("measuring");
  fitSheet();
}
function addPhoto() {
  const a = $("#sheet aside");
  if (S.p.photo && a && S.view !== "letter")
    a.insertAdjacentHTML(
      "afterbegin",
      `<img class="photo" src="${S.p.photo}" alt="" />`,
    );
}
$("#photoFile").onchange = (e) => {
  // قص مربع + تصغير 360px عشان التخزين المحلي
  const f = e.target.files[0];
  if (!f) return;
  const img = new Image(),
    url = URL.createObjectURL(f);
  img.onload = () => {
    const s = 360,
      c = document.createElement("canvas"),
      m = Math.min(img.width, img.height);
    c.width = c.height = s;
    c.getContext("2d").drawImage(
      img,
      (img.width - m) / 2,
      (img.height - m) / 2,
      m,
      m,
      0,
      0,
      s,
      s,
    );
    S.p.photo = c.toDataURL("image/jpeg", 0.85);
    URL.revokeObjectURL(url);
    update();
  };
  img.src = url;
  e.target.value = "";
};
$("#photoRm").onclick = () => {
  S.p.photo = "";
  update();
};

TEMPLATES.timeline = () =>
  TEMPLATES.minimal().replace("t-minimal", "t-timeline");
TEMPLATES.compact = () => TEMPLATES.executive().replace("t-exec", "t-compact");
ATS_RULES[10].ok = () => ["minimal", "executive", "compact"].includes(S.tpl); // القوالب أحادية العمود

/* ---------- 3. باقات ألوان + مهارات جاهزة ---------- */
const PALETTES = [
  { ar: "محافظ: قانون/مالية", en: "Conservative: law/finance", c: "#1e3a5f" },
  { ar: "جريء: تسويق/تصميم", en: "Bold: marketing/design", c: "#e11d48" },
  { ar: "تقني: برمجة/IT", en: "Tech: dev/IT", c: "#2563eb" },
  { ar: "طبي/صحي", en: "Medical/health", c: "#0f766e" },
  { ar: "تعليم/بحث", en: "Education/research", c: "#7c3aed" },
  { ar: "محايد", en: "Neutral", c: "#374151" },
];
const SKILL_SETS = [
  {
    ar: "تسويق رقمي",
    en: "Digital marketing",
    ar_s: [
      "إعلانات فيسبوك",
      "تحليل البيانات",
      "كتابة المحتوى",
      "SEO",
      "إدارة الحملات",
      "Canva",
    ],
    en_s: [
      "Facebook Ads",
      "Data analysis",
      "Copywriting",
      "SEO",
      "Campaign management",
      "Canva",
    ],
  },
  {
    ar: "برمجة",
    en: "Development",
    ar_s: ["JavaScript", "HTML/CSS", "Git", "حل المشكلات", "REST APIs", "SQL"],
    en_s: [
      "JavaScript",
      "HTML/CSS",
      "Git",
      "Problem solving",
      "REST APIs",
      "SQL",
    ],
  },
  {
    ar: "محاسبة",
    en: "Accounting",
    ar_s: [
      "Excel متقدم",
      "القوائم المالية",
      "الموازنات",
      "الضرائب",
      "دقة التفاصيل",
      "برامج المحاسبة",
    ],
    en_s: [
      "Advanced Excel",
      "Financial statements",
      "Budgeting",
      "Taxation",
      "Attention to detail",
      "Accounting software",
    ],
  },
  {
    ar: "خدمة عملاء",
    en: "Customer service",
    ar_s: [
      "التواصل الفعال",
      "حل الشكاوى",
      "إدارة الوقت",
      "CRM",
      "الصبر",
      "العمل تحت ضغط",
    ],
    en_s: [
      "Communication",
      "Complaint resolution",
      "Time management",
      "CRM",
      "Patience",
      "Working under pressure",
    ],
  },
  {
    ar: "تصميم",
    en: "Design",
    ar_s: [
      "Photoshop",
      "Illustrator",
      "Figma",
      "الهوية البصرية",
      "الطباعة",
      "الإبداع",
    ],
    en_s: [
      "Photoshop",
      "Illustrator",
      "Figma",
      "Branding",
      "Print design",
      "Creativity",
    ],
  },
];

/* ---------- 4. ترتيب الأقسام والخبرات بالسحب والإفلات ---------- */
S.order = S.order || ["exp", "edu", "skills", "langs"];
["refs", "proj", "courses", "interests", "custom"].forEach((k) => {
  if (!S.order.includes(k)) S.order.push(k);
});
const sectionFs = (k) => $(`[data-i=sec_${k}]`).closest("fieldset");

function applyFormOrder() {
  // يرتب الفورم حسب S.order
  let ref = $("[data-p=name]").closest("fieldset");
  S.order.forEach((k) => {
    const f = sectionFs(k);
    ref.after(f);
    ref = f;
  });
}
function applyOrder() {
  // يرتب أقسام الورقة: يلف كل h2 وما بعده في div
  const keys = {};
  [
    "profile",
    "exp",
    "edu",
    "skills",
    "langs",
    "contact",
    "refs",
    "proj",
    "courses",
    "interests",
  ].forEach((k) => (keys[t("h_" + k)] = k));
  if (S.customTitle.trim()) keys[S.customTitle.trim()] = "custom";
  const rank = (k) =>
    k === "profile" || k === "contact" ? -1 : S.order.indexOf(k);
  $$("#sheet .cv h2")
    .map((h) => h.parentElement)
    .filter((p, i, a) => a.indexOf(p) === i)
    .forEach((parent) => {
      const groups = [];
      let cur = null;
      [...parent.children].forEach((n) => {
        if (n.tagName === "H2") {
          cur = { k: keys[n.textContent], nodes: [n] };
          groups.push(cur);
        } else if (cur) cur.nodes.push(n);
      });
      groups
        .sort((a, b) => rank(a.k) - rank(b.k))
        .forEach((g) => {
          const w = document.createElement("div");
          w.dataset.sec = g.k;
          g.nodes.forEach((n) => w.append(n));
          parent.append(w);
        });
    });
}
function injectGrips() {
  $$("#form .item").forEach((it) => {
    if (it.querySelector(".grip")) return;
    const list = it.closest("[id^=list-]").id.slice(5),
      i = $$(".item", it.parentElement).indexOf(it);
    it.insertAdjacentHTML(
      "afterbegin",
      `<span class="grip" draggable="true" data-list="${list}" data-i="${i}">⋮⋮</span>`,
    );
  });
}
const _renderLists = renderLists;
renderLists = function () {
  _renderLists();
  injectGrips();
};

S.order.forEach((k) =>
  sectionFs(k).insertAdjacentHTML(
    "afterbegin",
    `<span class="grip sec" draggable="true" data-sec="${k}">⋮⋮</span>`,
  ),
);
let drag = null;
const form = $("#form");
form.addEventListener("dragstart", (e) => {
  const g = e.target.closest(".grip");
  if (!g) return;
  drag = { sec: g.dataset.sec, list: g.dataset.list, i: +g.dataset.i };
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", "x");
});
form.addEventListener("dragover", (e) => {
  if (drag) e.preventDefault();
});
form.addEventListener("drop", (e) => {
  if (!drag) return;
  e.preventDefault();
  if (drag.sec) {
    const to = e.target.closest("fieldset"),
      key = to && S.order.find((k) => sectionFs(k) === to);
    if (key && key !== drag.sec) {
      S.order.splice(S.order.indexOf(drag.sec), 1);
      S.order.splice(S.order.indexOf(key), 0, drag.sec);
      applyFormOrder();
      update();
    }
  } else {
    const to = e.target.closest(".item");
    if (to && to.closest("[id^=list-]").id === "list-" + drag.list) {
      const ti = +to.querySelector(".grip").dataset.i,
        arr = S[drag.list];
      arr.splice(ti, 0, arr.splice(drag.i, 1)[0]);
      renderLists();
      update();
    }
  }
});
form.addEventListener("dragend", () => (drag = null));

/* ---------- 5. QR Code ---------- */
function addQR() {
  if (!S.qrUrl || S.view === "letter" || typeof qrcode === "undefined") return;
  const q = qrcode(0, "M");
  q.addData(S.qrUrl);
  q.make();
  const box = `<div class="qr"><img src="${q.createDataURL(4, 0)}" alt="QR"><small>${esc(t("qr_label"))}</small></div>`;
  ($("#sheet aside") || $("#sheet .cv")).insertAdjacentHTML("beforeend", box);
}

/* ---------- 6. استيراد نص LinkedIn (تحليل نصي بسيط) ---------- */
const HEAD = {
  profile: /^(about|summary|نبذة.*)$/i,
  exp: /^(experience|الخبرات?.*)$/i,
  edu: /^(education|التعليم)$/i,
  skills: /^(skills|المهارات)$/i,
  langs: /^(languages|اللغات)$/i,
};
const DATE_RE =
  /((?:[A-Za-z]{3,9}\.?\s)?\d{4})\s*[-–—]\s*((?:[A-Za-z]{3,9}\.?\s)?\d{4}|Present|الآن|حتى الآن)/i;
function entries(arr, k1, k2) {
  // كل سطر تاريخ = مدخل؛ السطران قبله = المسمى والجهة
  const idx = arr
    .map((l, i) => (DATE_RE.test(l) ? i : -1))
    .filter((i) => i >= 0);
  return idx.map((d, n) => {
    const m = arr[d].match(DATE_RE),
      end = n + 1 < idx.length ? idx[n + 1] - 2 : arr.length;
    return {
      [k1]: arr[d - 2] || "",
      [k2]: arr[d - 1] || "",
      from: m[1],
      to: m[2],
      desc: arr.slice(d + 1, Math.max(d + 1, end)).join("\n"),
    };
  });
}
function importProfile(raw) {
  const sec = { top: [] };
  let cur = "top";
  raw
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean)
    .forEach((l) => {
      const k = Object.keys(HEAD).find((k) => HEAD[k].test(l));
      if (k) {
        cur = k;
        sec[k] = [];
      } else sec[cur].push(l);
    });
  const top = sec.top,
    topText = top.join(" "),
    mail = topText.match(/[\w.+-]+@[\w-]+\.[\w.]+/),
    tel = topText.match(/\+?\d[\d\s()-]{8,}\d/);
  const p = { ...S.p, name: top[0] || S.p.name, title: top[1] || S.p.title };
  if (mail) p.email = mail[0];
  if (tel) p.phone = tel[0].trim();
  if (sec.profile) p.summary = sec.profile.join(" ");
  const exp = entries(sec.exp || [], "role", "company"),
    edu = entries(sec.edu || [], "degree", "school");
  S = {
    ...S,
    p,
    exp: exp.length ? exp : S.exp,
    edu: edu.length ? edu : S.edu,
    skills: sec.skills
      ? sec.skills.join(",").replace(/[•·]/g, ",").replace(/,+/g, ",")
      : S.skills,
    langs: sec.langs ? sec.langs.join("\n") : S.langs,
  };
  fillForm();
  update();
}
const imp = document.createElement("dialog");
imp.id = "impDlg";
document.body.append(imp);
function showImport() {
  imp.innerHTML = `<h3>${t("imp_title")}</h3><small>${t("imp_note")}</small><textarea id="impText" rows="9" placeholder="${t("imp_ph")}"></textarea>
    <p><button class="primary" id="impGo">${t("imp_go")}</button> <button onclick="this.closest('dialog').close()">${t("close")}</button></p>`;
  $("#impGo").onclick = () => {
    importProfile($("#impText").value);
    imp.close();
  };
  imp.showModal();
}

/* ---------- 7. حقن العناصر ---------- */
[
  ["timeline", "tpl_timeline"],
  ["compact", "tpl_compact"],
  ["professional", "tpl_pro"],
].forEach(([v, k]) => {
  const o = document.createElement("option");
  o.value = v;
  o.dataset.i = k;
  $("#tpl").append(o);
});

const pal = document.createElement("select");
pal.id = "palette";
$("#color").after(pal);
pal.onchange = () => {
  if (pal.value) {
    S.color = pal.value;
    applyChrome();
    update();
  }
  pal.selectedIndex = 0;
};
const skl = document.createElement("select");
skl.className = "preset";
skl.id = "skillSet";
$("[data-k=skills]").before(skl);
skl.onchange = () => {
  if (skl.value === "") return;
  const add = SKILL_SETS[+skl.value][S.lang + "_s"],
    have = skillList();
  S.skills = [...have, ...add.filter((x) => !have.includes(x))].join(", ");
  $("[data-k=skills]").value = S.skills;
  skl.selectedIndex = 0;
  update();
};
const qr = document.createElement("input");
qr.dataset.k = "qrUrl";
qr.dataset.ph = "f_qr";
qr.type = "url";
$("[data-p=name]").closest("fieldset").append(qr);
$("#btnPdf").before(
  Object.assign(document.createElement("button"), {
    id: "btnImp",
    className: "ghost",
    onclick: showImport,
  }),
);

$("#btnPdf").before(
  Object.assign(document.createElement("button"), {
    id: "btnClear",
    className: "ghost",
    onclick: () => {
      const snap = JSON.stringify(S);
      S = {
        ...blank(),
        lang: S.lang,
        dark: S.dark,
        color: S.color,
        tpl: S.tpl,
        order: S.order,
      };
      fillForm();
      update();
      toast(t("cleared"), snap);
    },
  }),
);

$("#btnPdf").before(
  Object.assign(document.createElement("button"), {
    id: "btnFit",
    className: "ghost",
    onclick: () => {
      S.fit = S.fit === false;
      update();
    },
  }),
);

function syncExtras() {
  $("#btnFit").textContent = t("btn_fit") + (S.fit === false ? " ✗" : " ✓");
  $("#btnClear").textContent = t("btn_clear"); // تحديث نصوص القوائم عند تغيير اللغة
  const L = S.lang,
    fill = (sel, head, items, val) => {
      sel.innerHTML =
        `<option value="">${head}</option>` +
        items
          .map((x, i) => `<option value="${val(x, i)}">${x[L]}</option>`)
          .join("");
    };
  fill(pal, t("pal"), PALETTES, (x) => x.c);
  fill(skl, t("skl"), SKILL_SETS, (x, i) => i);
  $("#btnImp").textContent = t("btn_import");
}

/* نلف دالة المعاينة مرة تانية: ترتيب الأقسام ثم QR */
const _renderPreview2 = renderPreview;
renderPreview = function () {
  _renderPreview2();
  if (!isEmpty()) {
    addRefs();
    addExtras();
    addPhoto();
    applyOrder();
    addQR();
    autoFit();
  }
  syncExtras();
};

/* ===== التشغيل (مرة واحدة بعد تعريف كل الدوال) ===== */
const setHdr = () =>
  document.documentElement.style.setProperty(
    "--hdr",
    $("header").offsetHeight + "px",
  );
addEventListener("resize", setHdr);
setHdr();
$("#currentYear").textContent = new Date().getFullYear();
applyFormOrder();
injectGrips();
applyChrome();
fillForm();
update();
if ("ResizeObserver" in window)
  new ResizeObserver(fitSheet).observe($("#sheetWrap"));
