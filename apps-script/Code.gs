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
 * Each order arrives as a new row. The first columns are the ones she acts on:
 * Status as a dropdown, and a one-tap Call link.
 */

var SECRET = "change-this-to-something-private";

var STATUSES = [
  "New",
  "Payment to verify",
  "Confirmed by Call",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

// Action columns first so she never scrolls right to work an order.
var COLUMNS = [
  "orderId",
  "placedAt",
  "status",
  "callUrl",
  "name",
  "guardian",
  "houseNo",
  "village",
  "street",
  "landmark",
  "postOffice",
  "tehsil",
  "district",
  "state",
  "pincode",
  "phone",
  "altPhone",
  "notes",
  "items",
  "subtotal",
  "delivery",
  "total",
  "payment",
  "paymentRef",
];

var HEADINGS = [
  "Order No",
  "Date & Time",
  "Status",
  "Call",
  "Name",
  "Father's/Husband's Name",
  "House No.",
  "Village/Area",
  "Street/Road",
  "Near By",
  "PO",
  "Tehsil",
  "District",
  "State",
  "Pincode",
  "Phone No.",
  "Alt Phone",
  "Note",
  "Products",
  "Items Rs",
  "Delivery Rs",
  "Receive Rs",
  "Payment",
  "UPI Ref",
];

var COL_ORDER_ID = COLUMNS.indexOf("orderId") + 1;
var COL_STATUS = COLUMNS.indexOf("status") + 1;

// Text-ish fields Sheets would otherwise mangle by dropping leading zeros.
var TEXT_FIELDS = ["phone", "altPhone", "pincode", "houseNo", "paymentRef"];

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

/** Status becomes a dropdown, so she taps instead of typing. */
function applyStatusRule_(sheet, row) {
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUSES, true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange(row, COL_STATUS).setDataValidation(rule);
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
  applyStatusRule_(sheet, sheet.getLastRow());
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
