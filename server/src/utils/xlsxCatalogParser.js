import fs from "node:fs";
import yauzl from "yauzl";

const workbookEntryPath = "xl/worksheets/sheet1.xml";
const sharedStringsEntryPath = "xl/sharedStrings.xml";

const decodeXml = (value = "") =>
  String(value)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#10;/g, "\n")
    .replace(/&#13;/g, "\r");

const columnRefToIndex = (cellRef = "") => {
  const letters = String(cellRef).match(/[A-Z]+/i)?.[0] || "";
  return Array.from(letters.toUpperCase()).reduce(
    (total, character) => total * 26 + character.charCodeAt(0) - 64,
    0
  ) - 1;
};

const readZipEntries = async (filePath) =>
  new Promise((resolve, reject) => {
    yauzl.open(filePath, { lazyEntries: true }, (openError, zipFile) => {
      if (openError) {
        reject(openError);
        return;
      }

      const entryMap = new Map();

      const readNext = () => zipFile.readEntry();

      zipFile.on("entry", (entry) => {
        if (
          entry.fileName !== workbookEntryPath &&
          entry.fileName !== sharedStringsEntryPath
        ) {
          readNext();
          return;
        }

        zipFile.openReadStream(entry, (streamError, stream) => {
          if (streamError) {
            reject(streamError);
            return;
          }

          const chunks = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("end", () => {
            entryMap.set(entry.fileName, Buffer.concat(chunks).toString("utf-8"));
            readNext();
          });
          stream.on("error", reject);
        });
      });

      zipFile.on("end", () => resolve(entryMap));
      zipFile.on("error", reject);
      readNext();
    });
  });

const parseSharedStrings = (xml = "") =>
  Array.from(xml.matchAll(/<si[\s\S]*?<\/si>/g)).map(([segment]) =>
    decodeXml(
      Array.from(segment.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g))
        .map((match) => match[1] || "")
        .join("")
    )
  );

const parseRows = (worksheetXml = "", sharedStrings = []) =>
  Array.from(worksheetXml.matchAll(/<row\b[\s\S]*?<\/row>/g)).map(([rowSegment]) => {
    const row = [];

    for (const [, cellAttributes = "", cellBody = ""] of rowSegment.matchAll(
      /<c\b([^>]*)>([\s\S]*?)<\/c>/g
    )) {
      const cellRef = cellAttributes.match(/\br="([^"]+)"/)?.[1] || "";
      const cellType = cellAttributes.match(/\bt="([^"]+)"/)?.[1] || "";
      const columnIndex = columnRefToIndex(cellRef);
      const inlineMatch = cellBody.match(/<is>[\s\S]*?<t[^>]*>([\s\S]*?)<\/t>[\s\S]*?<\/is>/);
      const rawValue = cellBody.match(/<v>([\s\S]*?)<\/v>/)?.[1] || "";

      let cellValue = "";

      if (inlineMatch) {
        cellValue = decodeXml(inlineMatch[1]);
      } else if (cellType === "s") {
        cellValue = sharedStrings[Number(rawValue)] || "";
      } else {
        cellValue = decodeXml(rawValue);
      }

      row[columnIndex] = cellValue;
    }

    return row;
  });

export const parseCatalogWorkbook = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Catalog workbook not found at ${filePath}`);
  }

  const entries = await readZipEntries(filePath);
  const worksheetXml = entries.get(workbookEntryPath);

  if (!worksheetXml) {
    throw new Error("Could not find Sheet1 inside the workbook.");
  }

  const sharedStrings = parseSharedStrings(entries.get(sharedStringsEntryPath) || "");
  const rows = parseRows(worksheetXml, sharedStrings).filter((row) => row.some(Boolean));

  if (!rows.length) {
    return [];
  }

  const header = rows[0].map((value) => String(value || "").trim());

  return rows.slice(1).map((row) => {
    const normalizedRow = {};

    header.forEach((columnName, index) => {
      normalizedRow[columnName] = String(row[index] || "").trim();
    });

    return normalizedRow;
  });
};
