import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sukhen & Mili — Digital Universe',
    short_name: 'S❤M Universe',
    description: 'A personal cinematic memory universe created for Mili by Sukhen.',
    start_url: '/',
    display: 'standalone',
    background_color: '#06040a',
    theme_color: '#06040a',
    icons: [
      {
        src: '/icon',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
