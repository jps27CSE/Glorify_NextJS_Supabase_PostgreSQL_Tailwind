import type { Metadata } from "next";
import getSongsByArtist from "@/actions/getSongsByArtist";
import Header from "@/components/Header";
import ArtistContent from "./components/ArtistContent";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: { artistName: string } }): Promise<Metadata> {
  const artistName = decodeURIComponent(params.artistName);
  return {
    title: `${artistName} - Glorify | Soren Family Worship Music`,
    description: `Listen to ${artistName}'s worship songs on Glorify.`,
    openGraph: {
      title: `${artistName} - Glorify`,
      description: `Worship songs by ${artistName}`,
      type: "website",
    },
  };
}

const ArtistPage = async ({ params }: { params: { artistName: string } }) => {
  const artistName = decodeURIComponent(params.artistName);
  const songs = await getSongsByArtist(artistName);

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <div className="mt-20">
          <div className="flex flex-col md:flex-row items-center gap-x-5">
            <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
              <p className="hidden md:block font-semibold text-sm">Artist</p>
              <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-bold">
                {artistName}
              </h1>
              <p className="text-neutral-400 text-sm">
                {songs.length} {songs.length === 1 ? "song" : "songs"}
              </p>
            </div>
          </div>
        </div>
      </Header>
      <ArtistContent songs={songs} />
    </div>
  );
};

export default ArtistPage;
