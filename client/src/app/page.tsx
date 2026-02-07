import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/services/authService';
import FileExplorer from '@/components/layout/FileExplorer';

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  // 1. If no token, don't even try; just send them to login
  if (!token) {
    redirect('/auth');
  }

  const userData = await getUserProfile(token);

  // 2. If backend returns null (invalid/expired token), redirect
  if (!userData) {
    redirect('/auth');
  }

  // 3. Use optional chaining to safely get the root ID
  // Adjust this based on your backend response structure (e.g., userData.root_folder_id)
  const rootFolderId = userData?.root_folder_id || userData?.user?.root_folder_id;

  if (!rootFolderId) {
    return <div>Error: Root folder not found. Please contact support.</div>;
  }

  return (
    <FileExplorer 
      userData={userData.user} 
      initialFolderId={rootFolderId} 
      token={token} 
    />
  );
}