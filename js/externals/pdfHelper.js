import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Fonction pour créer un PDF simple
export async function createSimplePDF() {
  // Créer un nouveau document PDF
  const pdfDoc = await PDFDocument.create();

  // Ajouter une page vierge au document
  const page = pdfDoc.addPage([600, 400]);

  // Définir une police de caractères
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  // Ajouter du texte à la page
  page.drawText('Hello from the helper file!', {
    x: 50,
    y: 350,
    size: 30,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  // Sauvegarder le PDF sous forme de tableau d'octets (Uint8Array)
  return await pdfDoc.save();
}