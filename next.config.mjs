/** @type {import('next').NextConfig} */
export default {
  images: {
    // Card art lives on Renaiss' public blob storage; optimize + downscale it
    // (source renders are up to ~1.2 MB; we display them at 64px).
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
};
