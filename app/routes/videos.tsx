import {useState, useEffect} from 'react';
import {getVideos, type AdminVideo} from '../lib/admin-data';

export default function VideosPage() {
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    setVideos(getVideos());
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-brand-gray">Videos</h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-500">
          Watch product demos, tutorials, and how-to guides from our team.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {videos.map((video) => (
          <div
            key={video.id}
            className="group overflow-hidden rounded-xl border border-gray-200 transition hover:shadow-md"
          >
            {playing === video.youtubeId ? (
              <div className="relative aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            ) : (
              <button
                onClick={() => setPlaying(video.youtubeId)}
                className="relative block w-full aspect-video bg-gray-100"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition group-hover:scale-110">
                    <svg className="ml-1 h-6 w-6 text-brand-red" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </button>
            )}

            <div className="p-4">
              <h3 className="font-bold text-brand-gray">{video.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <p className="mt-10 text-center text-gray-400">No videos yet. Check back soon!</p>
      )}
    </div>
  );
}
