const fs = require("fs");
const path = require("path");

const { PDFDocument } = require("pdf-lib");

const createPreviewPdf = async (originalPdfPath) => {
  const pdfBytes = fs.readFileSync(originalPdfPath);

  const originalPdf = await PDFDocument.load(pdfBytes);

  const previewPdf = await PDFDocument.create();

  const pageCount = Math.min(2, originalPdf.getPageCount());

  const pageIndexes = Array.from(
    {
      length: pageCount,
    },
    (_, index) => index
  );

  const copiedPages = await previewPdf.copyPages(
    originalPdf,
    pageIndexes
  );

  copiedPages.forEach((page) => {
    previewPdf.addPage(page);
  });

  const previewBytes = await previewPdf.save();

  const previewFolder = path.join("uploads", "previews");

  if (!fs.existsSync(previewFolder)) {
    fs.mkdirSync(previewFolder, {
      recursive: true,
    });
  }

  const previewFileName = `preview-${Date.now()}.pdf`;

  const previewPath = path.join(
    previewFolder,
    previewFileName
  );

  fs.writeFileSync(previewPath, previewBytes);

  return previewPath;
};

module.exports = createPreviewPdf;