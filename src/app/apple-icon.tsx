import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at center, #260d28 0%, #0c0615 70%, #06040a 100%)',
          borderRadius: 40,
          border: '4px solid rgba(244, 63, 94, 0.5)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <span style={{ color: '#c084fc', fontSize: 68, fontWeight: 900, letterSpacing: '-0.02em' }}>S</span>
          <span style={{ color: '#f43f5e', fontSize: 44, margin: '0 4px', filter: 'drop-shadow(0 0 10px rgba(244,63,94,0.8))' }}>❤</span>
          <span style={{ color: '#fb7185', fontSize: 68, fontWeight: 900, letterSpacing: '-0.02em' }}>M</span>
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.8)',
            marginTop: 4,
          }}
        >
          Sukhen & Mili
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
