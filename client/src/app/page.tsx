import FileExplorer from "@/components/layout/FileExplorer";
import { getFiles } from "@/services/filesFetchService";

export default async function HomePage() {
  // Fetch initial files for the root directory
  const initialFiles = await getFiles();
  
  return (
    <main className="h-full">
      <FileExplorer initialFiles={initialFiles} />
    </main>
  );
}