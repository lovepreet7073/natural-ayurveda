/**
 * Google Apps Script that turns a Google Sheet into the order book.
 *
 * Setup (once, ~5 minutes):
 *  1. Create a new Google Sheet on the shop owner's Google account.
 *  2. Extensions > Apps Script. Delete the sample code, paste this file in.
 *  3. Change SECRET below to any private phrase (it must match ORDER_SHEET_SECRET
 *     in the website's environment variables).
 *  4. Deploy > New deployment > type "Web app".
 *       Execute as: Me
 *       Who has access: Anyone
 *  5. Copy the /exec URL it gives you into ORDER_SHEET_WEBHOOK_URL.
 *
 * The columns match the Excel file she already keeps — City, Pincode, combined
 * name, one-line address, phone, COD amount, a quantity column per product, and
 * Order By — with Status, a Call link and Payment Status added so an order can be
 * worked from the row itself.
 *
 * Money is never recorded as received by the website. A new order is always
 * "Pending"; only she marks it "Received" once it truly is.
 */

var SECRET = "change-this-to-something-private";

// The order's journey. Nothing here says anything about money — that is a
// separate column, because an order can be Delivered and still unpaid.
var STATUSES = [
  "New",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

// Whether the money is actually in hand. The website can only ever write
// "Pending" or "To verify"; only she can honestly set "Received".
var PAYMENT_STATUSES = ["Pending", "To verify", "Received", "Refunded"];

// One quantity column per product, in the same order as SHEET_LABELS in
// lib/products.ts. Add a product in both places or the columns drift.
var PRODUCT_COLUMNS = [
  "Cream",
  "Sunscreen",
  "Lip Balm",
  "Rakta Mantra",
  "Liver Amrit",
  "Hair Oil",
  "D-Tan Kit",
  "Combo 3",
  "Combo 2",
];

// Her existing Excel columns, in her order, with the few operational ones she
// works from placed first so she never scrolls right to action an order.
var BASE_COLUMNS = [
  "orderId",
  "placedAt",
  "status",
  "callUrl",
  "city",
  "pincode",
  "customerName",
  "address",
  "phone",
  "altPhone",
  "codReceive",
];

var TAIL_COLUMNS = [
  "orderBy",
  "note",
  "paymentMode",
  "paymentStatus",
  "paymentRef",
];

var BASE_HEADINGS = [
  "Order No",
  "Date & Time",
  "Status",
  "Call",
  "City",
  "Pincode",
  "Customer & Father/Husband Name",
  "Complete Address",
  "Phone No",
  "Alt Phone",
  "COD Receive",
];

var TAIL_HEADINGS = [
  "Order By",
  "Note",
  "Payment Mode",
  "Payment Status",
  "UPI Ref",
];

var COLUMNS = BASE_COLUMNS.concat(
  PRODUCT_COLUMNS.map(function (label) {
    return "qty:" + label;
  })
).concat(TAIL_COLUMNS);

var HEADINGS = BASE_HEADINGS.concat(PRODUCT_COLUMNS).concat(TAIL_HEADINGS);

var COL_ORDER_ID = COLUMNS.indexOf("orderId") + 1;
var COL_STATUS = COLUMNS.indexOf("status") + 1;
var COL_PAYMENT_STATUS = COLUMNS.indexOf("paymentStatus") + 1;

// Text-ish fields Sheets would otherwise mangle by dropping leading zeros.
var TEXT_FIELDS = ["phone", "altPhone", "pincode", "paymentRef"];

function sheet_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

function stamp_(iso) {
  return Utilities.formatDate(new Date(iso), "Asia/Kolkata", "dd/MM/yyyy hh:mm a");
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow(HEADINGS);
  sheet.getRange(1, 1, 1, HEADINGS.length).setFontWeight("bold");
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);
}

/** Both status columns become dropdowns, so she taps instead of typing. */
function applyDropdown_(sheet, row, column, values) {
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange(row, column).setDataValidation(rule);
}

function addOrder_(body) {
  var sheet = sheet_();
  ensureHeader_(sheet);

  var row = COLUMNS.map(function (key) {
    var value = body[key];
    if (value === undefined || value === null) return "";

    if (TEXT_FIELDS.indexOf(key) !== -1) return value ? "'" + value : "";
    if (key === "placedAt") return stamp_(value);

    // A link, not text: one tap and she is dialling the customer.
    if (key === "callUrl") {
      return value ? '=HYPERLINK("' + value + '","CALL")' : "";
    }
    return value;
  });

  sheet.appendRow(row);
  var added = sheet.getLastRow();
  applyDropdown_(sheet, added, COL_STATUS, STATUSES);
  applyDropdown_(sheet, added, COL_PAYMENT_STATUS, PAYMENT_STATUSES);
  return { ok: true };
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    if (SECRET && body.secret !== SECRET) {
      // Say which side is wrong. None of this reveals the secret itself — only
      // whether one arrived, whether the script is still on the placeholder, and
      // the lengths, which is enough to spot a stray quote or trailing space.
      return json_({
        ok: false,
        error: "unauthorized",
        websiteSentASecret: body.secret ? true : false,
        websiteSecretLength: body.secret ? String(body.secret).length : 0,
        scriptSecretLength: SECRET.length,
        scriptStillOnPlaceholder: SECRET === "change-this-to-something-private",
      });
    }

    // One lock for both actions: two orders landing at the same moment must not
    // append onto the same row.
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      return json_(addOrder_(body));
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json_({ ok: true, message: "Order webhook is running" });
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
