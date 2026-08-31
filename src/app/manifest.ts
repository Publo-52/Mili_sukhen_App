import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mili ❤️ — Digital Universe',
    short_name: 'Mili ❤️',
    description: 'A personal cinematic memory universe created for Mili by Sukhen.',
    start_url: '/',
    display: 'standalone',
    background_color: '#06040a',
    theme_color: '#06040a',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
