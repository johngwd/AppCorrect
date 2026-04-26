import jsPDF from 'jspdf';
import type { StudentMetadata } from '../types';

/** Prepare une valeur lisible pour le PDF meme si le champ est encore vide. */
const printable = (value: string, fallback: string) => value.trim() || fallback;

/** Genere un PDF A4 clair avec identite, titre centre et texte en interligne 1.5. */
export const exportAssignmentPdf = (metadata: StudentMetadata, text: string) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  const lineHeight = 7.5;
  let cursorY = 24;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nom : ${printable(metadata.lastName, '................................')}`, margin, cursorY);
  cursorY += 6;
  doc.text(`Prenom : ${printable(metadata.firstName, '................................')}`, margin, cursorY);
  cursorY += 6;
  doc.text(`Classe : ${metadata.classLevel}`, margin, cursorY);
  cursorY += 6;
  doc.text(`Professeur : ${printable(metadata.teacherName, '................................')}`, margin, cursorY);
  cursorY += 6;
  doc.text(`Matiere : ${printable(metadata.subject, '................................')}`, margin, cursorY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Correcteur Academique', pageWidth / 2, 58, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  cursorY = 76;
  const lines = doc.splitTextToSize(text.trim() || ' ', contentWidth) as string[];

  lines.forEach((line) => {
    if (cursorY > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
    }
    doc.text(line, margin, cursorY);
    cursorY += lineHeight;
  });

  const fileName = `devoir-${printable(metadata.lastName, 'eleve').toLowerCase()}-${printable(
    metadata.firstName,
    'appcorrect',
  ).toLowerCase()}.pdf`;
  doc.save(fileName.replace(/\s+/g, '-'));
};
