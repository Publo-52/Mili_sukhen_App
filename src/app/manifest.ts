import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Suksharmi — Digital Universe',
    short_name: 'Suksharmi',
    description: 'A personal cinematic memory universe created for Mili by Sukhen.',
    start_url: '/',
    display: 'standalone',
    background_color: '#06040a',
    theme_color: '#06040a',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
  };
}
