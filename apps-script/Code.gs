function doGet(e) {
  var uuid = e.parameter.uuid || "";
  var ficha = e.parameter.ficha || "";
  var curp = e.parameter.curp || "";

  var ss = SpreadsheetApp.openById("TU_SPREADSHEET_ID");
  var sheet = ss.getSheetByName("TU_HOJA");
  var data = sheet.getDataRange().getValues();

  // B=UUID (col 1), C=FICHA (col 2), F=CURP (col 5)
  var found = false;
  for (var i = 1; i < data.length; i++) {
    var rowUuid = String(data[i][1]).trim();
    var rowFicha = String(data[i][2]).trim();
    var rowCurp = String(data[i][5]).trim();

    if (rowUuid === uuid && rowFicha === ficha && rowCurp === curp) {
      found = true;
      break;
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ valid: found }))
    .setMimeType(ContentService.MimeType.JSON);
}
