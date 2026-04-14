const escapeXml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const buildCsv = (rows) => {
  if (!rows.length) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const serializeValue = (value) => `"${String(value ?? "").replace(/"/g, "\"\"")}"`;

  return [
    headers.map(serializeValue).join(","),
    ...rows.map((row) => headers.map((header) => serializeValue(row[header])).join(",")),
  ].join("\n");
};

export const buildExcelXmlWorkbook = (rows, sheetName = "Orders") => {
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const headerCells = headers
    .map(
      (header) =>
        `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`
    )
    .join("");

  const bodyRows = rows
    .map((row) => {
      const cells = headers
        .map((header) => {
          const value = row[header] ?? "";
          const type = typeof value === "number" ? "Number" : "String";
          return `<Cell><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
        })
        .join("");

      return `<Row>${cells}</Row>`;
    })
    .join("");

  return `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#F5EAFB" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="${escapeXml(sheetName)}">
    <Table>
      <Row>${headerCells}</Row>
      ${bodyRows}
    </Table>
  </Worksheet>
</Workbook>`;
};
