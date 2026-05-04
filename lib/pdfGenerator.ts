import 'client-only';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CellDef, CellHookData, RowInput, UserOptions } from 'jspdf-autotable';
import QRCode from 'qrcode';

interface Subject {
  id: string | number;
  year: number;
  semester?: string;
  name: string;
  weekly_hours?: number;
  total_hours?: number;
  note?: string;
  regulares: (string | number)[];
  aprobadas: (string | number)[];
}

interface Career {
  id: string;
  name: string;
  shortName: string;
  years: number;
  icon?: unknown;
  color?: string;
  curriculum: Subject[];
}

type Rgb = [number, number, number];
type PeriodKey = 'anual' | 'first' | 'second' | 'elective';
type StudyPlanCell = CellDef & {
  weeklyHoursText?: string;
  annualHoursText?: string;
  regularText?: string;
  approvedText?: string;
  isYearTotal?: boolean;
  totalLabel?: string;
  totalValue?: string;
};

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const PAGE_MARGIN_X = 14;
const PAGE_BODY_TOP = 16;
const PAGE_BODY_BOTTOM = 266;
const PAGE_SECTION_GAP = 8;
const FOOTER_TOP = 280;
const FOOTER_HEIGHT = 17;

const SURFACE: Rgb = [252, 249, 244];
const PANEL_BORDER: Rgb = [229, 223, 214];
const INK: Rgb = [45, 38, 33];
const MUTED: Rgb = [120, 108, 97];
const WARM_ACCENT: Rgb = [212, 133, 106];
const SAND: Rgb = [244, 239, 231];

const PERIOD_ORDER: PeriodKey[] = ['anual', 'first', 'second', 'elective'];

const PERIOD_LABELS: Record<PeriodKey, string> = {
  anual: 'Anual',
  first: '1\u00ba Cuatrimestre',
  second: '2\u00ba Cuatrimestre',
  elective: 'Electiva',
};

const clampColor = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

const tintColor = (color: Rgb, amount: number): Rgb => [
  clampColor(color[0] + amount),
  clampColor(color[1] + amount),
  clampColor(color[2] + amount),
];

const shadeColor = (color: Rgb, amount: number): Rgb => [
  clampColor(color[0] - amount),
  clampColor(color[1] - amount),
  clampColor(color[2] - amount),
];

const setFill = (doc: jsPDF, color: Rgb) => doc.setFillColor(color[0], color[1], color[2]);
const setDraw = (doc: jsPDF, color: Rgb) => doc.setDrawColor(color[0], color[1], color[2]);
const setText = (doc: jsPDF, color: Rgb) => doc.setTextColor(color[0], color[1], color[2]);

// Darken light colors to ensure readability on white/light backgrounds
const ensureContrast = (color: Rgb, maxLuminance = 165): Rgb => {
  const luminance = color[0] * 0.299 + color[1] * 0.587 + color[2] * 0.114;
  if (luminance <= maxLuminance) return color;
  const factor = maxLuminance / luminance;
  return [
    clampColor(color[0] * factor),
    clampColor(color[1] * factor),
    clampColor(color[2] * factor),
  ];
};

const extractPrimaryColor = (colorString?: string): Rgb => {
  if (!colorString) return [139, 170, 145];

  const hexMatch = colorString.match(/#([a-fA-F0-9]{6})/);
  if (!hexMatch) return [139, 170, 145];

  const hex = hexMatch[1];
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
};

const getPublicAssetUrl = (assetPath: string) => {
  if (typeof window === 'undefined') return assetPath;
  return new URL(assetPath, window.location.origin).toString();
};

async function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${imageUrl}`);
  }

  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const countHours = (subjects: Subject[]) =>
  subjects.reduce((sum, subject) => {
    if (subject.name.toLowerCase().includes('seminario integrador')) return sum;
    return sum + (subject.total_hours || 0);
  }, 0);

const formatCode = (subjectId: string | number) => subjectId.toString().padStart(3, '0');

const getRequirementNames = (ids: (string | number)[], curriculum: Subject[]) =>
  ids
    .map((id) => curriculum.find((subject) => subject.id === id)?.name)
    .filter((name): name is string => Boolean(name));

const getSemesterKey = (subject: Subject): PeriodKey => {
  const semester = (subject.semester || '').toLowerCase();
  if (semester.includes('anual')) return 'anual';
  if (semester.includes('1') && semester.includes('cuatri')) return 'first';
  if (semester.includes('2') && semester.includes('cuatri')) return 'second';
  return 'elective';
};

const sortSubjects = (subjects: Subject[]) =>
  [...subjects].sort((left, right) => {
    const periodDiff =
      PERIOD_ORDER.indexOf(getSemesterKey(left)) - PERIOD_ORDER.indexOf(getSemesterKey(right));
    if (periodDiff !== 0) return periodDiff;
    return String(left.id).localeCompare(String(right.id));
  });

const buildPeriodPalette = (primaryColor: Rgb) => ({
  anual: { fill: primaryColor, text: [255, 255, 255] as Rgb },
  first: { fill: tintColor(primaryColor, 86), text: shadeColor(primaryColor, 88) },
  second: { fill: tintColor(WARM_ACCENT, 90), text: shadeColor(WARM_ACCENT, 48) },
  elective: { fill: tintColor(SAND, 8), text: [112, 91, 67] as Rgb },
});

const paintPageBackground = (doc: jsPDF, primaryColor: Rgb) => {
  setFill(doc, SURFACE);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

  setFill(doc, tintColor(primaryColor, 108));
  doc.circle(188, 28, 28, 'F');

  setFill(doc, tintColor(SAND, 8));
  doc.circle(20, 258, 26, 'F');
};

const drawRoundedPanel = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor: Rgb,
  borderColor: Rgb = PANEL_BORDER,
) => {
  setFill(doc, fillColor);
  setDraw(doc, borderColor);
  doc.setLineWidth(0.35);
  doc.roundedRect(x, y, width, height, 6, 6, 'FD');
};

const drawFooter = (
  doc: jsPDF,
  primaryColor: Rgb,
  pageNumber: number,
  pageCount: number,
) => {
  setFill(doc, [250, 247, 242]);
  doc.rect(0, FOOTER_TOP, PAGE_WIDTH, FOOTER_HEIGHT, 'F');
  setDraw(doc, [236, 230, 222]);
  doc.setLineWidth(0.5);
  doc.line(0, FOOTER_TOP, PAGE_WIDTH, FOOTER_TOP);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setText(doc, ensureContrast(primaryColor));
  doc.text('UTNHUB', PAGE_MARGIN_X, 288);

  doc.setFont('helvetica', 'normal');
  setText(doc, MUTED);
  doc.text('Relaj\u00e1 tu semestre', 31, 288);

  doc.setFont('helvetica', 'bold');
  setText(doc, ensureContrast(primaryColor));
  doc.text(`P\u00e1gina ${pageNumber} / ${pageCount}`, PAGE_WIDTH - PAGE_MARGIN_X, 288, {
    align: 'right',
  });
};

const drawCoverPage = async (
  doc: jsPDF,
  career: Career,
  curriculum: Subject[],
  primaryColor: Rgb,
) => {
  const summaries = Array.from({ length: career.years }, (_, index) => {
    const year = index + 1;
    const subjects = curriculum.filter((subject) => subject.year === year);

    return {
      year,
      count: subjects.length,
      hours: countHours(subjects),
    };
  }).filter((summary) => summary.count > 0);

  paintPageBackground(doc, primaryColor);

  /* ── Header banner ── */
  const bannerY = 16;
  const bannerH = 40;
  const bannerW = PAGE_WIDTH - PAGE_MARGIN_X * 2;
  const cornerR = 8;

  // 1. Green base — full banner shape; accent strip = cornerR so curve starts exactly at the transition
  setFill(doc, primaryColor);
  doc.roundedRect(PAGE_MARGIN_X, bannerY, bannerW, bannerH, cornerR, cornerR, 'F');

  // 2. Dark overlay (top portion, height = bannerH - cornerR)
  setFill(doc, INK);
  doc.roundedRect(PAGE_MARGIN_X, bannerY, bannerW, bannerH - cornerR, cornerR, cornerR, 'F');
  // 3. Square off the dark overlay's bottom rounding
  doc.rect(PAGE_MARGIN_X, bannerY + bannerH - cornerR * 2, bannerW, cornerR, 'F');

  try {
    const logo = await getBase64ImageFromUrl(getPublicAssetUrl('/icon.png'));
    doc.addImage(logo, 'PNG', 20, bannerY + 6, 16, 16);
  } catch (error) {
    console.error('No se pudo cargar el logo para el PDF', error);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  setText(doc, [255, 255, 255]);
  doc.text(career.name, 42, bannerY + 14);

  doc.setFontSize(11);
  setText(doc, tintColor(primaryColor, 88));
  doc.text('Plan de estudios ordenado por hoja y por a\u00f1o', 42, bannerY + 22);

  // Subtle branding in the top-right corner of the banner
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  setText(doc, tintColor(ensureContrast(primaryColor, 180), 40));
  doc.text('utnhub.com', PAGE_MARGIN_X + bannerW - 6, bannerY + 8, { align: 'right' });

  /* ── Stats cards (flush below banner) ── */
  const statsY = bannerY + bannerH + 5;
  const statsH = 24;
  const totalHours = countHours(curriculum);
  const sectionW = PAGE_WIDTH - PAGE_MARGIN_X * 2;
  const cardGap = 4;
  const cardW = (sectionW - cardGap * 2) / 3;

  const stats = [
    { label: 'A\u00f1os', value: `${career.years}` },
    { label: 'Materias', value: `${curriculum.length}` },
    { label: 'Carga total', value: totalHours > 0 ? `${totalHours} hs` : 'Sin dato' },
  ];

  stats.forEach((stat, index) => {
    const x = PAGE_MARGIN_X + index * (cardW + cardGap);
    drawRoundedPanel(doc, x, statsY, cardW, statsH, [255, 255, 255]);

    // Colored accent strip at the top of each card
    setFill(doc, ensureContrast(tintColor(primaryColor, 68), 210));
    doc.roundedRect(x + cardW * 0.2, statsY + 1.2, cardW * 0.6, 1.8, 0.9, 0.9, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    setText(doc, INK);
    doc.text(stat.value, x + cardW / 2, statsY + 12, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setText(doc, MUTED);
    doc.text(stat.label, x + cardW / 2, statsY + 19, { align: 'center' });
  });

  /* ── Resumen por a\u00f1o ── */
  const summaryColumns = summaries.length > 3 ? 2 : 1;
  const summaryRowH = 20;
  const summaryRows = summaryColumns === 2 ? Math.ceil(summaries.length / 2) : summaries.length;
  const summaryHeaderH = 14;
  const summaryPaddingBottom = 6;
  const summaryPanelH = summaryHeaderH + summaryRows * summaryRowH + summaryPaddingBottom;
  const summaryY = statsY + statsH + 5;

  drawRoundedPanel(doc, PAGE_MARGIN_X, summaryY, sectionW, summaryPanelH, [255, 255, 255]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setText(doc, INK);
  doc.text('Resumen por a\u00f1o', PAGE_MARGIN_X + 8, summaryY + 10);

  const summaryGap = 8;
  const summaryColumnWidth = summaryColumns === 2 ? 78 : sectionW - 16;
  const summaryContentY = summaryY + summaryHeaderH;

  const maxYearHours = Math.max(...summaries.map((s) => s.hours), 1);

  summaries.forEach((summary, index) => {
    const column = summaryColumns === 2 ? index % 2 : 0;
    const row = summaryColumns === 2 ? Math.floor(index / 2) : index;
    const x = PAGE_MARGIN_X + 8 + column * (summaryColumnWidth + summaryGap);
    const rowY = summaryContentY + row * summaryRowH + 6;

    setFill(doc, tintColor(primaryColor, 88));
    doc.roundedRect(x, rowY - 5, 22, 8, 4, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    setText(doc, shadeColor(primaryColor, 86));
    doc.text(`A\u00f1o ${summary.year}`, x + 11, rowY, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    setText(doc, INK);
    doc.text(`${summary.count} materias`, x + 28, rowY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setText(doc, MUTED);
    doc.text(summary.hours > 0 ? `${summary.hours} hs` : 'Sin horas cargadas', x + 28, rowY + 6);

    // Subtle progress bar showing relative hours proportion
    if (summary.hours > 0) {
      const barX = x + 28;
      const barY = rowY + 9;
      const barMaxW = summaryColumnWidth - 38;
      const barH = 1.6;
      const barFill = (summary.hours / maxYearHours) * barMaxW;

      setFill(doc, ensureContrast(tintColor(primaryColor, 102), 230));
      doc.roundedRect(barX, barY, barMaxW, barH, 0.8, 0.8, 'F');

      setFill(doc, ensureContrast(tintColor(primaryColor, 48), 195));
      doc.roundedRect(barX, barY, Math.max(barFill, 2), barH, 0.8, 0.8, 'F');
    }
  });

  /* ── Decorative dot divider ── */
  const dividerY = summaryY + summaryPanelH + 2.5;
  const dotCount = 5;
  const dotSpacing = 4;
  const dotsWidth = (dotCount - 1) * dotSpacing;
  const dotStartX = PAGE_WIDTH / 2 - dotsWidth / 2;
  for (let i = 0; i < dotCount; i++) {
    const dotSize = i === Math.floor(dotCount / 2) ? 1.0 : 0.6;
    setFill(doc, ensureContrast(tintColor(primaryColor, 80), 200));
    doc.circle(dotStartX + i * dotSpacing, dividerY, dotSize, 'F');
  }

  /* ── QR footer section ── */
  const qrY = summaryY + summaryPanelH + 6;

  try {
    const qrDataUrl = await QRCode.toDataURL('https://www.utnhub.com/planes', {
      width: 320,
      margin: 1,
      color: {
        dark: `#${ensureContrast(primaryColor, 140).map((value) => value.toString(16).padStart(2, '0')).join('')}`,
        light: '#FFFFFF',
      },
    });

    drawRoundedPanel(doc, PAGE_MARGIN_X, qrY, sectionW, 26, [255, 255, 255]);
    doc.addImage(qrDataUrl, 'PNG', PAGE_MARGIN_X + 6, qrY + 4, 18, 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    setText(doc, INK);
    doc.text('Segui el plan en su versi\u00f3n interactiva', PAGE_MARGIN_X + 30, qrY + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setText(doc, MUTED);
    doc.text(
      'Escane\u00e1 el QR para revisar correlativas completas, marcar avance y descargar material.',
      PAGE_MARGIN_X + 30,
      qrY + 17,
      { maxWidth: 140 },
    );
  } catch (error) {
    console.error('No se pudo generar el QR del PDF', error);
  }
};

const buildCorrelationText = (subject: Subject, curriculum: Subject[]) => {
  const approvedNames = getRequirementNames(subject.aprobadas, curriculum);
  const regularNames = getRequirementNames(subject.regulares, curriculum);

  if (subject.semester === 'Electiva' && !approvedNames.length && !regularNames.length) {
    return 'Regulares: seg\u00fan electiva\nAprobadas: seg\u00fan electiva';
  }

  return [
    `Regulares: ${regularNames.length ? regularNames.join(', ') : '-'}`,
    `Aprobadas: ${approvedNames.length ? approvedNames.join(', ') : '-'}`,
  ].join('\n');
};

const buildCorrelationDetails = (subject: Subject, curriculum: Subject[]) => {
  const approvedNames = getRequirementNames(subject.aprobadas, curriculum);
  const regularNames = getRequirementNames(subject.regulares, curriculum);

  if (subject.semester === 'Electiva' && !approvedNames.length && !regularNames.length) {
    return {
      regular: 'según electiva',
      approved: 'según electiva',
    };
  }

  return {
    regular: regularNames.length ? regularNames.join(', ') : '-',
    approved: approvedNames.length ? approvedNames.join(', ') : '-',
  };
};

const buildYearTableBody = (
  subjects: Subject[],
  curriculum: Subject[],
  primaryColor: Rgb,
  compact = false,
) => {
  const palette = buildPeriodPalette(primaryColor);
  const body: RowInput[] = [];
  const rowMinH = compact ? 12 : 18;
  const periodPad = compact
    ? { top: 2, right: 2, bottom: 2, left: 2 }
    : { top: 4, right: 3, bottom: 4, left: 3 };

  PERIOD_ORDER.forEach((period) => {
    const periodSubjects = subjects.filter((subject) => getSemesterKey(subject) === period);
    if (periodSubjects.length === 0) return;

    periodSubjects.forEach((subject) => {
      let subjectLabel =
        getSemesterKey(subject) === 'elective'
          ? subject.name
          : `${formatCode(subject.id)} - ${subject.name}`;
      
      if (subject.note) {
        subjectLabel += `\n*${subject.note}`;
      }
      const correlationDetails = buildCorrelationDetails(subject, curriculum);

      body.push([
        {
          content: PERIOD_LABELS[period],
          styles: {
            fillColor: tintColor(palette[period].fill, 108),
            textColor: shadeColor(palette[period].fill, 66),
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
            cellPadding: periodPad,
          },
        },
        {
          content: subjectLabel,
          styles: {
            fontStyle: 'bold',
            textColor: INK,
          },
        },
        {
          content: subject.weekly_hours || subject.total_hours
            ? `${subject.weekly_hours ?? '-'} / ${subject.total_hours ?? '-'}`
            : 'Sin carga horaria',
          weeklyHoursText: subject.weekly_hours ? `${subject.weekly_hours} hs` : '-',
          annualHoursText: subject.total_hours ? `${subject.total_hours} hs` : '-',
          styles: {
            halign: 'center',
            textColor: [255, 255, 255],
            minCellHeight: rowMinH,
          },
        } as StudyPlanCell,
        {
          content: buildCorrelationText(subject, curriculum),
          regularText: correlationDetails.regular,
          approvedText: correlationDetails.approved,
          styles: {
            textColor: [255, 255, 255],
            minCellHeight: rowMinH,
          },
        } as StudyPlanCell,
      ]);
    });
  });

  return body;
};

const buildYearTableConfig = (
  startY: number,
  yearSubjects: Subject[],
  curriculum: Subject[],
  primaryColor: Rgb,
  totalHours: number,
  compact = false,
): UserOptions => {
  const fs = compact ? 6.2 : 7.2;
  const headFs = compact ? 6.6 : 7.6;
  const pad = compact
    ? { top: 2.0, right: 2.0, bottom: 2.0, left: 2.0 }
    : { top: 3.8, right: 2.8, bottom: 3.8, left: 2.8 };
  const footMinH = compact ? 10 : 16;

  return {
  startY,
  margin: { left: PAGE_MARGIN_X, right: PAGE_MARGIN_X },
  theme: 'plain' as const,
  pageBreak: 'avoid' as const,
  showHead: 'everyPage' as const,
  head: [['Per\u00edodo', 'Materia', 'Carga', 'Correlativas']],
  body: buildYearTableBody(yearSubjects, curriculum, primaryColor, compact),
  foot: [[
    { content: '', colSpan: 1, styles: { fillColor: [255, 255, 255], lineWidth: 0 } },
    {
      content: '',
      colSpan: 2,
      isYearTotal: true,
      totalLabel: 'Carga total del a\u00f1o',
      totalValue: totalHours > 0 ? `${totalHours} hs` : '--',
      styles: {
        fillColor: [255, 255, 255],
        lineWidth: 0,
        minCellHeight: footMinH,
      },
    } as StudyPlanCell,
    { content: '', styles: { fillColor: [255, 255, 255], lineWidth: 0 } },
  ]],
  styles: {
    font: 'helvetica',
    fontSize: fs,
    textColor: INK,
    lineColor: PANEL_BORDER,
    lineWidth: { bottom: 0.12 },
    cellPadding: pad,
    overflow: 'linebreak' as const,
    valign: 'middle' as const,
  },
  headStyles: {
    fillColor: tintColor(primaryColor, 116),
    textColor: shadeColor(primaryColor, 74),
    fontStyle: 'bold',
    halign: 'center' as const,
    valign: 'middle' as const,
    fontSize: headFs,
    lineColor: tintColor(primaryColor, 92),
    lineWidth: { bottom: 0.18 },
  },
  bodyStyles: {
    fillColor: [255, 255, 255] as Rgb,
  },
  alternateRowStyles: {
    fillColor: [248, 246, 241] as Rgb,
  },
  footStyles: {
    fontSize: fs,
    lineColor: tintColor(primaryColor, 92),
    lineWidth: { top: 0.18 },
  },
  columnStyles: {
    0: { cellWidth: compact ? 22 : 26 },
    1: { cellWidth: compact ? 68 : 72 },
    2: { cellWidth: compact ? 26 : 28 },
    3: { cellWidth: compact ? 64 : 54 },
  },
  didParseCell: (data: CellHookData) => {
    if (data.section === 'body' && data.column.index === 3) {
      const doc = data.doc as jsPDF;
      const raw = data.cell.raw as StudyPlanCell | undefined;
      const regularText = raw?.regularText ?? '-';
      const approvedText = raw?.approvedText ?? '-';

      const labelFs = compact ? 5.4 : 6.3;
      const valueFs = compact ? 5.2 : 6.1;

      // Same text-wrapping width calculation as used in didDrawCell
      const contentWidth = (compact ? 64 : 54) - 4.4;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(labelFs);
      const regularLabelWidth = doc.getTextWidth('Regulares:') + 1.3;
      const approvedLabelWidth = doc.getTextWidth('Aprobadas:') + 1.3;

      doc.setFontSize(valueFs);
      const regularLines = doc.splitTextToSize(regularText, contentWidth - regularLabelWidth);
      const approvedLines = doc.splitTextToSize(approvedText, contentWidth - approvedLabelWidth);

      const lineH = compact ? 2.8 : 3.4;
      const sectionGap = compact ? 1.0 : 1.5;
      const regularBlockH = Math.max(regularLines.length, 1) * lineH;
      const approvedBlockH = Math.max(approvedLines.length, 1) * lineH;
      
      const totalBlockH = regularBlockH + sectionGap + approvedBlockH;
      const paddingY = compact ? 5 : 7; // Adequate padding sum

      data.cell.styles.minCellHeight = Math.max(
        data.cell.styles.minCellHeight || 0,
        totalBlockH + paddingY
      );
    }
  },
  didDrawCell: (data: CellHookData) => {
    const doc = data.doc as jsPDF;
    const fillColor: Rgb =
      Array.isArray(data.cell.styles.fillColor) && data.cell.styles.fillColor.length >= 3
        ? [
            data.cell.styles.fillColor[0] as number,
            data.cell.styles.fillColor[1] as number,
            data.cell.styles.fillColor[2] as number,
          ]
        : [255, 255, 255];

    // Compact‑aware font sizes
    const labelFs = compact ? 5.4 : 6.3;
    const valueFs = compact ? 5.2 : 6.1;

    /* ── Hours column (column 2) ── */
    if (data.section === 'body' && data.column.index === 2) {
      const raw = data.cell.raw as StudyPlanCell | undefined;
      if (!raw?.weeklyHoursText && !raw?.annualHoursText) return;

      const weeklyText = raw?.weeklyHoursText ?? '-';
      const annualText = raw?.annualHoursText ?? '-';
      const innerX = data.cell.x + 2.2;

      // Two lines separated by lineGap; center the block vertically
      const lineGap = compact ? 3.6 : 4.8;
      const blockH = lineGap;
      const topY = data.cell.y + (data.cell.height - blockH) / 2;

      setFill(doc, fillColor);
      doc.rect(data.cell.x + 0.8, data.cell.y + 0.6, data.cell.width - 1.6, data.cell.height - 1.2, 'F');

      const weeklyLabel = 'Semanales:';
      const annualLabel = 'Anuales:';

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(labelFs);
      setText(doc, shadeColor(primaryColor, 20));
      doc.text(weeklyLabel, innerX, topY);
      const weeklyLabelWidth = doc.getTextWidth(weeklyLabel) + 1.3;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(valueFs);
      setText(doc, weeklyText === '-' ? MUTED : INK);
      doc.text(weeklyText, innerX + weeklyLabelWidth, topY);

      const secondLineY = topY + lineGap;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(labelFs);
      setText(doc, shadeColor([212, 133, 106], 18));
      doc.text(annualLabel, innerX, secondLineY);
      const annualLabelWidth = doc.getTextWidth(annualLabel) + 1.3;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(valueFs);
      setText(doc, annualText === '-' ? MUTED : INK);
      doc.text(annualText, innerX + annualLabelWidth, secondLineY);

      return;
    }

    /* ── Correlatives column (column 3) ── */
    if (data.section === 'body' && data.column.index === 3) {
      const raw = data.cell.raw as StudyPlanCell | undefined;
      const regularText = raw?.regularText ?? '-';
      const approvedText = raw?.approvedText ?? '-';
      const innerX = data.cell.x + 2.2;
      const contentWidth = data.cell.width - 4.4;

      setFill(doc, fillColor);
      doc.rect(data.cell.x + 0.8, data.cell.y + 0.6, data.cell.width - 1.6, data.cell.height - 1.2, 'F');

      const regularLabel = 'Regulares:';
      const approvedLabel = 'Aprobadas:';

      // Pre-calculate line arrays to measure total block height
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(labelFs);
      const regularLabelWidth = doc.getTextWidth(regularLabel) + 1.3;
      doc.setFontSize(valueFs);
      const regularLines = doc.splitTextToSize(regularText, contentWidth - regularLabelWidth);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(labelFs);
      const approvedLabelWidth = doc.getTextWidth(approvedLabel) + 1.3;
      doc.setFontSize(valueFs);
      const approvedLines = doc.splitTextToSize(approvedText, contentWidth - approvedLabelWidth);

      // Compute total content block height and center it
      const lineH = compact ? 2.8 : 3.4;
      const sectionGap = compact ? 1.0 : 1.5;
      const regularBlockH = Math.max(regularLines.length, 1) * lineH;
      const approvedBlockH = Math.max(approvedLines.length, 1) * lineH;
      const totalBlockH = regularBlockH + sectionGap + approvedBlockH;
      const topY = data.cell.y + (data.cell.height - totalBlockH) / 2 + 2;

      // Draw regular section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(labelFs);
      setText(doc, shadeColor([212, 133, 106], 18));
      doc.text(regularLabel, innerX, topY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(valueFs);
      setText(doc, regularText === '-' ? MUTED : INK);
      doc.text(regularLines, innerX + regularLabelWidth, topY);

      // Draw approved section
      const secondLineY = topY + regularBlockH + sectionGap;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(labelFs);
      setText(doc, shadeColor(primaryColor, 20));
      doc.text(approvedLabel, innerX, secondLineY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(valueFs);
      setText(doc, approvedText === '-' ? MUTED : INK);
      doc.text(approvedLines, innerX + approvedLabelWidth, secondLineY);

      return;
    }

    /* ── Year total footer (foot section, column 1 spanning into 2) ── */
    if (data.section === 'foot' && data.column.index === 1) {
      const raw = data.cell.raw as StudyPlanCell | undefined;
      if (!raw?.isYearTotal) return;

      const cellX = data.cell.x;
      const cellY = data.cell.y;
      const cellW = data.cell.width;
      const cellH = data.cell.height;

      // Clear the cell
      setFill(doc, [255, 255, 255]);
      doc.rect(cellX, cellY, cellW, cellH, 'F');

      // Accent line at the top
      setDraw(doc, tintColor(primaryColor, 68));
      doc.setLineWidth(0.6);
      doc.line(cellX + 4, cellY + 2, cellX + cellW - 4, cellY + 2);

      // Pill background for the value
      const pillW = 38;
      const pillH = 9;
      const pillX = cellX + cellW - pillW - 6;
      const pillY = cellY + cellH / 2 - pillH / 2 + 1;

      setFill(doc, primaryColor);
      doc.roundedRect(pillX, pillY, pillW, pillH, 4.5, 4.5, 'F');

      // Value text inside the pill
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      setText(doc, [255, 255, 255]);
      doc.text(raw.totalValue ?? '--', pillX + pillW / 2, pillY + pillH / 2 + 1.2, { align: 'center' });

      // Label text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      setText(doc, shadeColor(primaryColor, 42));
      doc.text(raw.totalLabel ?? 'Carga total', cellX + 6, cellY + cellH / 2 + 2);
    }
  },
};
};

const estimateYearSectionHeight = (
  yearSubjects: Subject[],
  curriculum: Subject[],
  primaryColor: Rgb,
  compact = false,
) => {
  const probe = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  const startY = 20;
  const headerH = compact ? 26 : 34;
  const tableStartY = startY + headerH;
  const totalHours = countHours(yearSubjects);

  autoTable(
    probe,
    buildYearTableConfig(tableStartY, yearSubjects, curriculum, primaryColor, totalHours, compact),
  );

  const finalY =
    (probe as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? tableStartY;
  return Math.max(compact ? 44 : 58, finalY - startY + 10);
};

const drawYearSection = (
  doc: jsPDF,
  career: Career,
  curriculum: Subject[],
  year: number,
  primaryColor: Rgb,
  startY: number,
  compact = false,
) => {
  const yearSubjects = sortSubjects(curriculum.filter((subject) => subject.year === year));
  const totalHours = countHours(yearSubjects);
  const sectionHeight = estimateYearSectionHeight(yearSubjects, curriculum, primaryColor, compact);
  const sectionWidth = PAGE_WIDTH - PAGE_MARGIN_X * 2;
  const headerH = compact ? 26 : 34;
  const headerY = startY + 4;
  const tableStartY = startY + headerH;

  drawRoundedPanel(
    doc,
    PAGE_MARGIN_X,
    startY,
    sectionWidth,
    sectionHeight,
    [255, 255, 255],
    tintColor(primaryColor, 108),
  );

  // Year badge
  const badgeW = compact ? 26 : 31;
  const badgeH = compact ? 10 : 13;
  setFill(doc, primaryColor);
  doc.roundedRect(PAGE_MARGIN_X + 4, headerY, badgeW, badgeH, 5, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(compact ? 10 : 13);
  setText(doc, [255, 255, 255]);
  doc.text(`${year}\u00ba A\u00f1o`, PAGE_MARGIN_X + 4 + badgeW / 2, headerY + badgeH * 0.65, { align: 'center' });

  // Career name
  const textX = PAGE_MARGIN_X + 4 + badgeW + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(compact ? 10 : 13);
  setText(doc, INK);
  doc.text(career.name, textX, headerY + (compact ? 5 : 6.6));

  if (!compact) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setText(doc, MUTED);
    doc.text('Plan de Estudio Interactivo - Vista anual', textX, headerY + 13.2);
  }

  // Stats in the header
  const statsDivX1 = compact ? 148 : 142;
  const statsDivX2 = compact ? 170 : 168;
  setDraw(doc, [238, 232, 225]);
  doc.setLineWidth(0.45);
  doc.line(statsDivX1, headerY + 1, statsDivX1, headerY + (compact ? 14 : 20));
  doc.line(statsDivX2, headerY + 1, statsDivX2, headerY + (compact ? 14 : 20));

  [
    { x: (statsDivX1 + statsDivX2) / 2, label: 'Materias', value: `${yearSubjects.length}` },
    { x: statsDivX2 + (PAGE_MARGIN_X + sectionWidth - statsDivX2) / 2, label: 'Horas', value: totalHours > 0 ? `${totalHours}` : '--' },
  ].forEach((stat) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(compact ? 6 : 7);
    setText(doc, MUTED);
    doc.text(stat.label, stat.x, headerY + (compact ? 4.5 : 5.8), { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(compact ? 10 : 12.5);
    setText(doc, shadeColor(primaryColor, 28));
    doc.text(stat.value, stat.x, headerY + (compact ? 10.5 : 12.9), { align: 'center' });
  });

  autoTable(
    doc,
    buildYearTableConfig(tableStartY, yearSubjects, curriculum, primaryColor, totalHours, compact),
  );

  return startY + sectionHeight;
};

export const generateStudyPlanPDF = async (career: Career, curriculum: Subject[]) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = extractPrimaryColor(career.color);

  await drawCoverPage(doc, career, curriculum, primaryColor);

  const yearsToRender = Array.from({ length: career.years }, (_, index) => index + 1).filter((year) =>
    curriculum.some((subject) => subject.year === year),
  );

  let cursorY = PAGE_BODY_TOP;
  let hasContentPage = false;

  // Per-career compact years — only these specific years need compact rendering
  const COMPACT_YEARS: Record<string, number[] | 'all'> = {
    civil: 'all',
    quimica: [3, 5],
    electromecanica: [5],
  };

  const compactConfig = COMPACT_YEARS[career.id];
  const isCompactYear = (y: number) =>
    compactConfig === 'all' || (Array.isArray(compactConfig) && compactConfig.includes(y));

  yearsToRender.forEach((year) => {
    const compact = isCompactYear(year);
    const yearSubjects = sortSubjects(curriculum.filter((subject) => subject.year === year));
    const sectionHeight = estimateYearSectionHeight(yearSubjects, curriculum, primaryColor, compact);

    if (!hasContentPage) {
      doc.addPage();
      paintPageBackground(doc, primaryColor);
      cursorY = PAGE_BODY_TOP;
      hasContentPage = true;
    } else if (compact || cursorY + sectionHeight > PAGE_BODY_BOTTOM) {
      doc.addPage();
      paintPageBackground(doc, primaryColor);
      cursorY = PAGE_BODY_TOP;
    }

    cursorY = drawYearSection(doc, career, curriculum, year, primaryColor, cursorY, compact) + PAGE_SECTION_GAP;
  });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    drawFooter(doc, primaryColor, page, pageCount);
  }

  return URL.createObjectURL(doc.output('blob'));
};
