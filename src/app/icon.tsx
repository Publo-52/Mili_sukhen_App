import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 48,
  height: 48,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #180929 0%, #06040a 50%, #2b0b1e 100%)',
          borderRadius: '14px',
          border: '2px solid rgba(244, 63, 94, 0.6)',
          boxShadow: '0 0 16px rgba(244, 63, 94, 0.5)',
          fontFamily: 'sans-serif',
          fontWeight: 900,
        }}
      >
        <span style={{ color: '#c084fc', fontSize: 20, fontWeight: 900, marginRight: 1 }}>S</span>
        <span style={{ color: '#f43f5e', fontSize: 13, margin: '0 1px' }}>❤</span>
        <span style={{ color: '#fb7185', fontSize: 20, fontWeight: 900, marginLeft: 1 }}>M</span>
      </div>
    ),
    {
      ...size,
    }
  );
}
