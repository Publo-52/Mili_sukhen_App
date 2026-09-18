// Server-Only Authentication Configuration
// NEVER import this file into client components ('use client')

export const AUTH_USERS = {
  mili: {
    id: 'mili',
    name: 'Mili',
    role: 'mili' as const,
    title: 'Queen & Co-Admin',
    phone: '9732934032',
    formattedPhone: '+91 97329 34032',
    emails: [
      'mandalsharmili06@gmail.com',
      '9732934032',
      '+919732934032',
      '+91 97329 34032',
    ],
    defaultEmail: 'mandalsharmili06@gmail.com',
    getPasswords(): string[] {
      const list = ['mili@123'];
      if (process.env.MILI_PASSWORD && process.env.MILI_PASSWORD.trim()) {
        list.push(process.env.MILI_PASSWORD.trim());
      }
      return list;
    },
    avatar: 'M',
    greeting: 'Welcome back, Mili! Your Sanctuary & Admin Studio are ready.',
    themeColor: 'from-rose-500 to-pink-600',
    glowColor: 'rgba(244, 63, 94, 0.4)',
  },
  sukhen: {
    id: 'sukhen',
    name: 'Sukhen',
    role: 'sukhen' as const,
    title: 'Creator & Admin',
    phone: '9832695291',
    formattedPhone: '+91 98326 95291',
    emails: [
      'dassukhen@gmail.com',
      '9832695291',
      '+919832695291',
      '+91 98326 95291',
    ],
    defaultEmail: 'dassukhen@gmail.com',
    getPasswords(): string[] {
      const list = ['das@123'];
      if (process.env.SUKHEN_PASSWORD && process.env.SUKHEN_PASSWORD.trim()) {
        list.push(process.env.SUKHEN_PASSWORD.trim());
      }
      if (process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.trim()) {
        list.push(process.env.ADMIN_PASSCODE.trim());
      }
      return list;
    },
    avatar: 'S',
    greeting: 'Welcome back, Sukhen! Creator Studio & Admin active.',
    themeColor: 'from-purple-600 to-indigo-600',
    glowColor: 'rgba(147, 51, 234, 0.4)',
  },
};

export function getServerAdminPasscode(): string {
  return (process.env.ADMIN_PASSCODE || process.env.SUKHEN_PASSWORD || 'das@123').trim();
}
