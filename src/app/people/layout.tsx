import { Metadata } from "next";

export const metadata: Metadata = {
  title: "100 Notable Names in the Epstein Files | ChatFiles.org",
  description: "Comprehensive list of 100 notable individuals mentioned in the DOJ Epstein Files releases. Searchable database of public records.",
};

export default function PeopleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
