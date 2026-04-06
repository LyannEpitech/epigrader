import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      startY?: number;
      head?: string[][];
      body?: string[][];
      theme?: string;
      headStyles?: { fillColor?: number[] };
      styles?: { fontSize?: number };
      columnStyles?: { [key: number]: { cellWidth?: number | string } };
    }) => void;
  }
}