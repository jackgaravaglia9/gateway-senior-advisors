/**
 * Gateway Senior Advisors - lead webhook (Google Apps Script)
 *
 * Lives in the lead Sheet: Extensions > Apps Script > Code.gs
 * The website's /api/submit route POSTs each lead here. This script:
 *   1. appends the lead as a new row,
 *   2. emails a NEW LEAD alert (a mail failure never blocks the row),
 *   3. if the Sheet write FAILS, emails you the full lead with a subject starting
 *      "LEAD NOT SAVED IN SHEET" so nothing is lost (a mail failure here never throws),
 *   4. replies with JSON {ok:true} or {ok:false,error:"..."} so the site can tell
 *      whether the lead was really saved.
 *
 * No secrets live in this file. Alerts go to the Google account that owns and
 * runs the script unless ALERT_EMAIL is filled in below.
 *
 * Sheet columns (row 1 headers, in this order):
 *   A submittedAt  B fullName  C phone  D email  E relationship  F age
 *   G careType  H location  I livingSituation  J budget  K timeline
 *   L contactConsent  M shareConsent  N utm_source  O utm_medium  P utm_campaign
 *   Q utm_term  R utm_content  S gclid  T receivedAt
 */

var SHEET_NAME = "Sheet1";
var ALERT_EMAIL = ""; // optional. Blank = email the account that deployed this script.

// ---- Kauhale fit rules (edit here if the criteria change) ----
var KAUHALE_CARE_TYPE = "Memory care";
var BUDGETS_7500_PLUS = ["$7,500 to $10,000", "$10,000+"];
var BUDGETS_UNDER_7500 = ["Under $4,500", "$4,500 to $6,500", "$6,500 to $7,500"];

// "St. Louis County" is judged from the free-text location box, so this is a keyword/ZIP
// check, not geography. A miss means "verify", not "no". Names are lowercase, no punctuation.
var ST_LOUIS_COUNTY_PLACES = [
  "st louis county", "stl county", "west county", "south county", "north county",
  "affton", "ballwin", "bella villa", "bellefontaine neighbors", "bel nor", "bel ridge",
  "berkeley", "beverly hills", "black jack", "breckenridge hills", "brentwood", "bridgeton",
  "calverton park", "charlack", "chesterfield", "clarkson valley", "clayton", "cool valley",
  "crestwood", "creve coeur", "crystal lake park", "dellwood", "des peres", "edmundson",
  "ellisville", "eureka", "fenton", "ferguson", "flordell hills", "florissant", "frontenac",
  "glen echo park", "grantwood village", "greendale", "hanley hills", "hazelwood", "huntleigh",
  "jennings", "kinloch", "kirkwood", "ladue", "lakeshire", "lemay", "manchester", "maplewood",
  "marlborough", "maryland heights", "mehlville", "moline acres", "normandy", "northwoods",
  "norwood court", "oakville", "olivette", "overland", "pagedale", "pasadena hills",
  "pasadena park", "pine lawn", "richmond heights", "rock hill", "shrewsbury", "spanish lake",
  "st ann", "st john", "sunset hills", "sycamore hills", "town and country", "twin oaks",
  "university city", "uplands park", "valley park", "velda city", "velda village hills",
  "vinita park", "vinita terrace", "warson woods", "webster groves", "wellston",
  "wildwood", "woodson terrace"
];
var ST_LOUIS_COUNTY_ZIPS = [
  "63005", "63006", "63011", "63017", "63021", "63025", "63026", "63031", "63033", "63034",
  "63038", "63040", "63042", "63043", "63044", "63045", "63074", "63088", "63099", "63105",
  "63114", "63117", "63119", "63121", "63122", "63123", "63124", "63125", "63126", "63127",
  "63128", "63129", "63130", "63131", "63132", "63133", "63134", "63135", "63136", "63137",
  "63138", "63140", "63141", "63143", "63144", "63146"
];

/** Entry point for the website. */
function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: "invalid_json" });
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return json_({ ok: false, error: "invalid_payload" });
  }

  // 1. Save the row first. Nothing below this may undo it.
  var failure = saveRow_(data);

  // 1b. Could not save: email you the whole lead so it is never lost. Any mail error here is
  //     logged and reported, never thrown, and the site still gets its {ok:false} answer.
  if (failure) {
    Logger.log("lead NOT saved: " + failure.code + " - " + failure.detail);
    var failed = { ok: false, error: failure.code, backupEmailSent: false };
    try {
      sendFailureBackup_(data, failure, false);
      failed.backupEmailSent = true;
    } catch (err) {
      Logger.log("backup email failed: " + err);
      failed.backupEmailError = errText_(err).slice(0, 200);
    }
    return json_(failed);
  }

  // 2. Alert email. Any error here is logged and reported, never thrown.
  var result = { ok: true, emailSent: false };
  try {
    sendLeadAlert_(data, false);
    result.emailSent = true;
  } catch (err) {
    Logger.log("alert email failed: " + err);
    result.emailError = errText_(err).slice(0, 200);
  }
  return json_(result);
}

/**
 * Run these once from the editor (Run > sendTestAlert, then Run > sendTestFailureAlert)
 * after pasting the script. The first run asks for the "send email" permission; both send a
 * [TEST] email to you. Neither adds a row to the Sheet.
 */
function sendTestAlert() {
  sendLeadAlert_(sampleLead_(), true);
}

function sendTestFailureAlert() {
  sendFailureBackup_(
    sampleLead_(),
    { code: "append_failed", detail: "Example only. This is a test, nothing actually failed." },
    true
  );
}

// ---------- helpers ----------

function sampleLead_() {
  return {
    submittedAt: "2026-01-01T15:00:00.000Z",
    receivedAt: "2026-01-01T15:00:01.000Z",
    fullName: "Test Lead",
    phone: "314-555-0100",
    email: "test@example.com",
    relationship: "My parent",
    age: "82",
    livingSituation: "Living at home with family",
    timeline: "Immediately (within 30 days)",
    budget: "$7,500 to $10,000",
    careType: "Memory care",
    location: "Kirkwood, MO 63122",
    contactConsent: true,
    shareConsent: true,
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "test-campaign",
    utm_term: "memory care st louis",
    utm_content: "",
    gclid: "TEST-GCLID"
  };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/** Appends the row. Returns null on success, or {code, detail} saying why it failed. */
function saveRow_(data) {
  var sheet;
  try {
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  } catch (err) {
    return { code: "sheet_unavailable", detail: errText_(err) };
  }
  if (!sheet) {
    return { code: "sheet_not_found", detail: 'No tab named "' + SHEET_NAME + '" in the spreadsheet' };
  }
  try {
    sheet.appendRow(buildRow_(data));
  } catch (err) {
    return { code: "append_failed", detail: errText_(err) };
  }
  return null;
}

function errText_(err) {
  return String(err && err.message ? err.message : err).replace(/\s+/g, " ").slice(0, 300);
}

/** Defense in depth: a leading = + - @ can make Sheets run a cell as a formula. */
function cell_(value) {
  if (value === null || value === undefined) return "";
  var s = String(value).replace(/[\u0000-\u001f\u007f]/g, " ");
  return s.replace(/^[\s=+\-@]+/, "").slice(0, 500);
}

function buildRow_(d) {
  return [
    cell_(d.submittedAt), // A
    cell_(d.fullName), // B
    cell_(d.phone), // C
    cell_(d.email), // D
    cell_(d.relationship), // E
    cell_(d.age), // F
    cell_(d.careType), // G
    cell_(d.location), // H
    cell_(d.livingSituation), // I
    cell_(d.budget), // J
    cell_(d.timeline), // K
    d.contactConsent === true, // L
    d.shareConsent === true, // M
    cell_(d.utm_source), // N
    cell_(d.utm_medium), // O
    cell_(d.utm_campaign), // P
    cell_(d.utm_term), // Q
    cell_(d.utm_content), // R
    cell_(d.gclid), // S
    cell_(d.receivedAt || new Date().toISOString()) // T
  ];
}

function oneLine_(value) {
  return cell_(value).replace(/\s+/g, " ");
}

function sheetUrl_() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet().getUrl();
  } catch (err) {
    return "(sheet link unavailable)";
  }
}

/** The lead's fields, one per line. Shared by the NEW LEAD and LEAD NOT SAVED emails. */
function leadLines_(d) {
  return [
    "Name: " + oneLine_(d.fullName),
    "Phone: " + oneLine_(d.phone),
    "Email: " + oneLine_(d.email),
    "Relationship: " + oneLine_(d.relationship),
    "Age: " + oneLine_(d.age),
    "Living situation: " + oneLine_(d.livingSituation),
    "Timeline: " + oneLine_(d.timeline),
    "Budget: " + oneLine_(d.budget),
    "Care type: " + oneLine_(d.careType),
    "Location: " + oneLine_(d.location),
    "OK to share with communities: " + (d.shareConsent === true ? "Yes" : "No"),
    "UTM source: " + (oneLine_(d.utm_source) || "(none)"),
    "gclid: " + (oneLine_(d.gclid) || "(none)")
  ];
}

function sendLeadAlert_(d, isTest) {
  var to = ALERT_EMAIL || Session.getEffectiveUser().getEmail();
  var subject =
    (isTest ? "[TEST] " : "") +
    "NEW LEAD: " +
    oneLine_(d.careType) + ", " +
    oneLine_(d.budget) + ", " +
    oneLine_(d.location);

  var body = [kauhaleFit_(d), ""]
    .concat(leadLines_(d))
    .concat(["", "Sheet: " + sheetUrl_()])
    .join("\n");

  MailApp.sendEmail({
    to: to,
    subject: subject.slice(0, 200),
    body: body,
    name: "Gateway Leads"
  });
}

/** Emailed when the Sheet write fails: the whole lead plus why, so you can add it by hand. */
function sendFailureBackup_(d, failure, isTest) {
  var to = ALERT_EMAIL || Session.getEffectiveUser().getEmail();
  var subject =
    (isTest ? "[TEST] " : "") +
    "LEAD NOT SAVED IN SHEET (" + failure.code + "): " +
    oneLine_(d.careType) + ", " +
    oneLine_(d.budget) + ", " +
    oneLine_(d.location);

  var body = [
    "THIS LEAD IS NOT IN THE SHEET. Add it by hand, and call them.",
    "Why it failed: " + failure.code + " - " + failure.detail,
    "",
    kauhaleFit_(d),
    ""
  ]
    .concat(leadLines_(d))
    .concat([
      "Contact consent given: " + (d.contactConsent === true ? "Yes" : "No"),
      "UTM medium: " + (oneLine_(d.utm_medium) || "(none)"),
      "UTM campaign: " + (oneLine_(d.utm_campaign) || "(none)"),
      "UTM term: " + (oneLine_(d.utm_term) || "(none)"),
      "UTM content: " + (oneLine_(d.utm_content) || "(none)"),
      "Submitted (visitor's clock): " + (oneLine_(d.submittedAt) || "(none)"),
      "Received (server clock): " + (oneLine_(d.receivedAt) || "(none)"),
      "",
      "Sheet: " + sheetUrl_(),
      "",
      "Raw data exactly as received:",
      rawJson_(d)
    ])
    .join("\n");

  MailApp.sendEmail({
    to: to,
    subject: subject.slice(0, 200),
    body: body,
    name: "Gateway Leads"
  });
}

function rawJson_(d) {
  var s;
  try {
    s = JSON.stringify(d, null, 2);
  } catch (err) {
    return "(could not serialize)";
  }
  return s.length > 8000 ? s.slice(0, 8000) + "\n... (truncated)" : s;
}

/** One line: does this lead fit Kauhale (memory care, $7,500+/mo, St. Louis County)? */
function kauhaleFit_(d) {
  var misses = []; // definite no
  var checks = []; // can't tell, verify by phone

  if (d.careType !== KAUHALE_CARE_TYPE) {
    misses.push("care type is " + (oneLine_(d.careType) || "unknown") + ", not memory care");
  }

  if (BUDGETS_7500_PLUS.indexOf(d.budget) === -1) {
    if (BUDGETS_UNDER_7500.indexOf(d.budget) !== -1) {
      misses.push("budget " + d.budget + " is under $7,500");
    } else {
      checks.push("budget is \"" + (oneLine_(d.budget) || "blank") + "\", confirm $7,500+");
    }
  }

  if (!inStLouisCounty_(d.location)) {
    checks.push("location \"" + (oneLine_(d.location) || "blank") + "\" not recognized as St. Louis County, verify");
  }

  if (misses.length) return "KAUHALE FIT: NO - " + misses.concat(checks).join("; ");
  if (checks.length) return "KAUHALE FIT: CHECK - memory care; " + checks.join("; ");
  return "KAUHALE FIT: YES - memory care, budget $7,500+, St. Louis County";
}

function inStLouisCounty_(location) {
  var text = " " + String(location || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ") + " ";
  var zips = text.match(/\b\d{5}\b/g) || [];
  for (var z = 0; z < zips.length; z++) {
    if (ST_LOUIS_COUNTY_ZIPS.indexOf(zips[z]) !== -1) return true;
  }
  for (var i = 0; i < ST_LOUIS_COUNTY_PLACES.length; i++) {
    if (text.indexOf(" " + ST_LOUIS_COUNTY_PLACES[i] + " ") !== -1) return true;
  }
  return false;
}
