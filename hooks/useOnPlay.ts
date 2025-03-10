import { Song } from "@/types";
import useAuthModal from "@/hooks/useAuthModal";
import usePlayer from "@/hooks/usePlayer";
import { useUser } from "@/hooks/useUser";

const useOnPlay = (songs: Song[]) => {
  const player = usePlayer();
  // eslint-disable-next-line
  const authModal = useAuthModal();

  // eslint-disable-next-line
  const { user } = useUser();

  const onPlay = (id: string) => {
    // if (!user) {
    //   return authModal.onOpen();
    // }

    player.setId(id);
    player.setIds(songs.map((song) => song.id));
  };

  return onPlay;
};

export default useOnPlay;
