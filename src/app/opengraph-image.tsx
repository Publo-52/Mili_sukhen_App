import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Mili — A Digital Universe Made For You';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#06040a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(244, 63, 94, 0.25) 0%, rgba(147, 51, 234, 0.15) 50%, transparent 70%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '8px 24px',
            borderRadius: 9999,
            border: '1px solid rgba(244, 63, 94, 0.4)',
            background: 'rgba(244, 63, 94, 0.1)',
            color: '#fb7185',
            fontSize: 20,
            marginBottom: 24,
          }}
        >
          Dedicated to Mili
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            letterSpacing: '-0.02em',
            marginBottom: 16,
          }}
        >
          The Mili Digital Universe
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          Every website, Python art piece, memory, and love note created with you in mind.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
