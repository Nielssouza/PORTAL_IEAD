import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

const TEXT = {
  title: "Formul\u00e1rio de cadastro individual",
  subtitle: "Preencha todos os campos obrigat\u00f3rios.",
  filename: "cadastro-individual.pdf",
};

const FIELDS = [
  "Nome completo:",
  "Data de nascimento:",
  "CPF:",
  "E-mail:",
  "Tipo de v\u00ednculo (membro/congregado):",
  "Possui cargo? (sim/n\u00e3o):",
  "Qual cargo:",
  "\u00c9 batizado? (sim/n\u00e3o):",
  "Data do batismo:",
  "Profiss\u00e3o:",
  "Grau de escolaridade:",
  "Estado civil:",
  "Nome completo do pai:",
  "CPF do pai:",
  "Nome completo da m\u00e3e:",
  "CPF da m\u00e3e:",
  "Endere\u00e7o completo:",
  "Senha:",
  "Confirmar senha:",
];

export async function GET() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 64;
  page.drawText(TEXT.title, { x: 60, y, size: 18, font: fontBold });
  y -= 22;
  page.drawText(TEXT.subtitle, {
    x: 60,
    y,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  y -= 32;
  for (const field of FIELDS) {
    page.drawText(field, { x: 60, y, size: 11, font });
    y -= 18;
    if (field.startsWith("Endere")) {
      y -= 18;
    }
  }

  const pdfBytes = await pdfDoc.save();

  return new Response(pdfBytes as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=\"${TEXT.filename}\"`,
    },
  });
}
