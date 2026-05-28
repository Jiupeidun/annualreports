export type Report = {
  href: string;
  webp: string;
  image: string;
  alt: string;
  year: string;
  period: string;
  id?: string;
  eager?: boolean;
  versioned?: boolean;
};

export const reports = [
  {
    href: "/2019financialReport.pdf",
    webp: "/compressed/2019financialReport_cover.webp",
    image: "/compressed/2019financialReport_cover.jpg",
    alt: "2019 annual report cover",
    year: "2019",
    period: "Jan 2019 - Mar 2020",
    eager: true
  },
  {
    href: "/2020financialReport.pdf",
    webp: "/compressed/2020financialReport_cover.webp",
    image: "/compressed/2020financialReport_cover.jpg",
    alt: "2020 annual report cover",
    year: "2020",
    period: "Mar 2020 - Jan 2021",
    eager: true
  },
  {
    href: "/2021financialReport.pdf",
    webp: "/compressed/2021financialReport_cover.webp",
    image: "/compressed/2021financialReport_cover.jpg",
    alt: "2021 annual report cover",
    year: "2021",
    period: "Jan 2021 - Feb 2022",
    eager: true
  },
  {
    href: "/2022financialReport.pdf",
    webp: "/compressed/2022financialReport_cover.webp",
    image: "/compressed/2022financialReport_cover.jpg",
    alt: "2022 annual report cover",
    year: "2022",
    period: "Feb 2022 - Jan 2023",
    eager: true
  },
  {
    href: "/2023financialReport.pdf",
    webp: "/compressed/2023financialReport_cover.webp",
    image: "/compressed/2023financialReport_cover.jpg",
    alt: "2023 annual report cover",
    year: "2023",
    period: "Jan 2023 - Feb 2024",
    eager: true
  },
  {
    href: "/Rapport_financier_2024.pdf",
    webp: "/compressed/Rapport_financier_2024_couverture.webp",
    image: "/compressed/Rapport_financier_2024_couverture.jpg",
    alt: "2024 annual report cover",
    year: "2024",
    period: "Feb 2024 - Feb 2025"
  },
  {
    href: "/2025_Annual_Report.pdf",
    webp: "/compressed/2025_Annual_Report_cover.webp",
    image: "/compressed/2025_Annual_Report_cover.jpg",
    alt: "2025 annual report cover",
    year: "2025",
    period: "Feb 2025 - Apr 2026"
  },
  {
    id: "r2026",
    href: "/2026_Annual_Report.pdf",
    webp: "/compressed/2026_Annual_Report_cover.webp",
    image: "/compressed/2026_Annual_Report_cover.jpg",
    alt: "2026 annual report cover",
    year: "2026",
    period: "Apr 2026 - Present",
    versioned: true
  }
] satisfies readonly Report[];
