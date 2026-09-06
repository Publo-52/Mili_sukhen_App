import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppNotification, getWhatsAppConfigStatus, WhatsAppNotificationParams } from '@/lib/whatsapp';
import { getSessionFromRequest } from '@/lib/sessions';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    config: getWhatsAppConfigStatus(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const body = await request.json().catch(() => ({}));

    // Determine target and sender
    const requestedTarget = body.targetRole === 'sukhen' ? 'sukhen' : 'mili';
    const senderRole: 'sukhen' | 'mili' = requestedTarget === 'mili' ? 'sukhen' : 'mili';
    const senderName = senderRole === 'sukhen' ? 'সুখেন' : 'মিলি';

    const testType = body.type || 'love_note';
    const testTitle = body.title || (senderRole === 'sukhen' ? 'একটি বিশেষ টেস্ট রোমান্টিক বার্তা 💖' : 'একটি মিষ্টি টেস্ট মেসেজ ✨');
    const testBody = body.body || 'ওয়েবসাইটে হোয়াটসঅ্যাপ নোটিফিকেশন সিস্টেম সফলভাবে সক্রিয় ও টেস্ট করা হয়েছে!';

    const result = await sendWhatsAppNotification({
      type: testType,
      title: testTitle,
      body: testBody,
      url: '/#home',
      senderRole,
      senderName,
    });

    return NextResponse.json({
      success: true,
      whatsapp: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to trigger test WhatsApp notification',
      },
      { status: 500 }
    );
  }
}
