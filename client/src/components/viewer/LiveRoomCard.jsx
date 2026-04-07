import { Eye, PlayCircle } from 'lucide-react';

const getSessionImage = (session) =>
  session?.thumbnail || session?.currentProduct?.images?.[0] || '';

const getHostLabel = (session) => {
  if (session?.hostName) {
    return session.hostName;
  }

  if (session?.hostId) {
    return session.hostId.split('@')[0];
  }

  return 'Live seller';
};

const LiveRoomCard = ({ session, onOpen }) => {
  const sessionImage = getSessionImage(session);
  const sessionDescription =
    session?.description ||
    session?.currentProduct?.description ||
    'Join the live room to see the current showcase, ask questions, and react in real time.';

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-gray-900/75 shadow-xl shadow-black/20">
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-950">
        {sessionImage ? (
          <img src={sessionImage} alt={session.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-500/20 via-gray-950 to-sky-500/10 text-sm text-gray-400">
            Thumbnail coming soon
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute left-3 top-3 rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white">
          Live
        </div>
        <div className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 text-xs text-white backdrop-blur-sm">
          <Eye size={14} />
          {session?.viewerCount || 0}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/90">
            Hosted by {getHostLabel(session)}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">{session?.title}</h3>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <p className="line-clamp-3 text-sm leading-6 text-gray-300">{sessionDescription}</p>

        <div className="rounded-[1.25rem] border border-white/10 bg-gray-950/70 p-3">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Now featuring</p>
          <p className="mt-2 text-sm font-medium text-white">
            {session?.currentProduct?.name || 'The host is preparing the next product'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpen?.(session?.roomId)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-gray-950 transition hover:bg-emerald-400"
        >
          <PlayCircle size={16} />
          Watch live
        </button>
      </div>
    </div>
  );
};

export default LiveRoomCard;
