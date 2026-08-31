import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSessionFromRequest } from '@/lib/sessions';

export interface ActiveCallState {
  id: string;
  caller: string; // 'Sukhen' | 'Mili'
  callerRole: 'sukhen' | 'mili';
  receiver: string;
  receiverRole: 'sukhen' | 'mili';
  type: 'audio' | 'video';
  status: 'ringing' | 'connected' | 'ended' | 'declined';
  startedAt: string;
  connectedAt?: string;
  endedAt?: string;
  sdpOffer?: string;
  sdpAnswer?: string;
  iceCandidates?: { role: 'sukhen' | 'mili'; candidate: any }[];
}

// In-memory active call signaling store
let currentActiveCall: ActiveCallState | null = null;

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);

  // Clear call if ended over 10 seconds ago
  if (currentActiveCall && (currentActiveCall.status === 'ended' || currentActiveCall.status === 'declined')) {
    const elapsed = Date.now() - new Date(currentActiveCall.endedAt || currentActiveCall.startedAt).getTime();
    if (elapsed > 10000) {
      currentActiveCall = null;
    }
  }

  return NextResponse.json({
    success: true,
    activeCall: currentActiveCall,
  });
}

export async function POST(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    const body = await request.json();
    const { type, sdpOffer, role: explicitRole } = body as { type?: 'audio' | 'video'; sdpOffer?: string; role?: 'sukhen' | 'mili' };

    const callerRole: 'sukhen' | 'mili' = session
      ? (session.userRole === 'sukhen' ? 'sukhen' : 'mili')
      : (explicitRole || 'mili');
    const callerName = session?.userName || (callerRole === 'sukhen' ? 'Sukhen' : 'Mili');
    const receiverRole = callerRole === 'sukhen' ? 'mili' : 'sukhen';
    const receiverName = callerRole === 'sukhen' ? 'Mili' : 'Sukhen';

    const newCall: ActiveCallState = {
      id: `call-${Date.now()}`,
      caller: callerName,
      callerRole,
      receiver: receiverName,
      receiverRole,
      type: type || 'video',
      status: 'ringing',
      startedAt: new Date().toISOString(),
      sdpOffer,
      iceCandidates: [],
    };

    currentActiveCall = newCall;

    return NextResponse.json({
      success: true,
      activeCall: newCall,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to initiate call' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = getSessionFromRequest(request);

    const body = await request.json();
    const { status, sdpOffer, sdpAnswer, newCandidate } = body as {
      status?: 'ringing' | 'connected' | 'ended' | 'declined';
      sdpOffer?: string;
      sdpAnswer?: string;
      newCandidate?: { role: 'sukhen' | 'mili'; candidate: any };
    };

    if (currentActiveCall) {
      if (status) {
        currentActiveCall.status = status;
        if (status === 'connected') {
          currentActiveCall.connectedAt = new Date().toISOString();
        } else if (status === 'ended' || status === 'declined') {
          currentActiveCall.endedAt = new Date().toISOString();
        }
      }

      if (sdpOffer) currentActiveCall.sdpOffer = sdpOffer;
      if (sdpAnswer) currentActiveCall.sdpAnswer = sdpAnswer;

      if (newCandidate) {
        if (!currentActiveCall.iceCandidates) currentActiveCall.iceCandidates = [];
        currentActiveCall.iceCandidates.push(newCandidate);
      }
    }

    return NextResponse.json({
      success: true,
      activeCall: currentActiveCall,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update call' }, { status: 500 });
  }
}
