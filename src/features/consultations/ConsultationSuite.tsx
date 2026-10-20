import React, { useState, useEffect } from 'react';
import { 
  Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, 
  FileText, Shield, Clock, Send, CheckCircle2, AlertCircle, Share2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ConsultationRoom } from '../../types';

interface ConsultationSuiteProps {
  initialRoomId?: string;
  onClose?: () => void;
}

export const ConsultationSuite: React.FC<ConsultationSuiteProps> = ({ 
  initialRoomId, 
  onClose 
}) => {
  const [roomId, setRoomId] = useState<string>(initialRoomId || 'mano-sess-sample');
  const [room, setRoom] = useState<ConsultationRoom | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [inCall, setInCall] = useState<boolean>(false);
  
  // Media controls
  const [micActive, setMicActive] = useState<boolean>(true);
  const [videoActive, setVideoActive] = useState<boolean>(true);
  const [screenSharing, setScreenSharing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('chat');
  
  // In-room chat & clinical notes
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'Dr. Ananya Sharma', text: 'Hello! I am ready whenever you feel comfortable to begin.', time: '10:00 AM' }
  ]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [clinicalNotes, setClinicalNotes] = useState<string>(
    'Patient presented with mild anticipatory anxiety regarding upcoming life transition. Practiced diaphragmatic breathing; recommended cognitive reframing journal.'
  );
  const [savedNotesNotice, setSavedNotesNotice] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Timer effect when in call
  useEffect(() => {
    let interval: any;
    if (inCall) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [inCall]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setRoom({
        id: roomId,
        appointmentId: 'apt-78421',
        specialistName: 'Dr. Ananya Sharma',
        patientName: 'Kavita Menon',
        status: 'active',
        scheduledTime: '10:30 AM',
        expiresAt: '11:15 AM'
      });
      setInCall(true);
      setLoading(false);
    }, 700);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'You', text: newMessage.trim(), time: timeNow }]);
    setNewMessage('');
  };

  const handleSaveNotes = () => {
    setSavedNotesNotice(true);
    setTimeout(() => setSavedNotesNotice(false), 3000);
  };

  const handleEndCall = () => {
    if (window.confirm('Are you sure you want to exit the consultation room?')) {
      setInCall(false);
      if (onClose) onClose();
    }
  };

  return (
    <section id="consultations" className="py-16 bg-slate-50 dark:bg-[#0a120f] border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="teal" className="mb-3">
            Encrypted Telehealth Room
          </Badge>
          <h2 className="text-3xl font-serif font-medium text-slate-900 dark:text-white tracking-tight">
            Consultation Suite
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            High-definition, end-to-end encrypted video and audio appointments complying with Telemedicine Practice Guidelines India.
          </p>
        </div>

        {!inCall ? (
          <Card className="max-w-md mx-auto shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-[#13221d]">
            <CardHeader className="text-center pb-2">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto mb-3 border border-teal-100 dark:border-teal-800">
                <Video className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl font-serif text-slate-900 dark:text-white">Enter Consultation Room</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your Session ID provided in your booking confirmation
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Session / Room Code
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="e.g. mano-sess-sample"
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <span>Camera & microphone permissions will be requested upon entering. Audio & video streams are never recorded without explicit consent.</span>
              </div>

              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={handleJoinRoom}
                disabled={loading}
              >
                {loading ? 'Connecting Secure Stream...' : 'Join Consultation Room'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white dark:bg-[#13221d] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            {/* Top Room Banner */}
            <div className="px-6 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <span className="text-sm font-medium tracking-tight">
                    {room?.specialistName || 'Dr. Ananya Sharma'} &amp; You
                  </span>
                  <span className="text-xs text-slate-400 ml-2 font-mono">
                    [{roomId}]
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Duration: {formatTimer(elapsedSeconds)}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>256-Bit E2EE</span>
                </div>
              </div>
            </div>

            {/* Main Stage Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[500px]">
              {/* Video Feed Section (2 cols) */}
              <div className="lg:col-span-2 bg-slate-950 p-4 sm:p-6 flex flex-col justify-between relative">
                {/* Main Doctor Screen */}
                <div className="w-full flex-1 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                  <div className="relative z-10 text-center">
                    <div className="w-24 h-24 rounded-full bg-teal-900/40 border-2 border-teal-500/50 flex items-center justify-center mx-auto mb-4 text-teal-300 text-3xl font-serif">
                      AS
                    </div>
                    <h3 className="text-white text-lg font-medium">Dr. Ananya Sharma</h3>
                    <p className="text-slate-400 text-xs">Consultant Psychiatrist (NMC: 64129)</p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Badge variant="teal" className="text-xs py-0.5 bg-teal-900/50 text-teal-200 border-teal-700">
                        HD Video Active
                      </Badge>
                      <Badge variant="slate" className="text-xs py-0.5 bg-slate-800 text-slate-300 border-slate-700">
                        Doctor Mic On
                      </Badge>
                    </div>
                  </div>

                  {/* Patient Self Preview PiP */}
                  <div className="absolute bottom-4 right-4 w-36 sm:w-44 h-24 sm:h-28 rounded-xl bg-slate-800 border-2 border-slate-700 shadow-lg flex items-center justify-center overflow-hidden">
                    {videoActive ? (
                      <div className="text-center">
                        <div className="w-8 h-8 rounded-full bg-slate-700 text-teal-400 flex items-center justify-center mx-auto text-xs font-bold mb-1">
                          YOU
                        </div>
                        <span className="text-[10px] text-slate-300">Your Video</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-slate-400 text-xs">
                        <VideoOff className="w-4 h-4 mb-1 text-rose-400" />
                        <span className="text-[10px]">Camera Paused</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* In-Call Controls Bar */}
                <div className="mt-4 pt-3 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setMicActive(!micActive)}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      micActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white hover:bg-rose-700'
                    }`}
                    title={micActive ? 'Mute Mic' : 'Unmute Mic'}
                  >
                    {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => setVideoActive(!videoActive)}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      videoActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white hover:bg-rose-700'
                    }`}
                    title={videoActive ? 'Turn Off Video' : 'Turn On Video'}
                  >
                    {videoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => setScreenSharing(!screenSharing)}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      screenSharing ? 'bg-teal-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                    title="Share Screen"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleEndCall}
                    className="px-5 h-11 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>Leave Call</span>
                  </button>
                </div>
              </div>

              {/* Sidebar: In-Room Chat & Clinical Notes */}
              <div className="bg-slate-50 dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col h-[520px]">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-3 text-xs font-medium border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      activeTab === 'chat'
                        ? 'border-teal-600 text-teal-800 dark:text-teal-300 bg-teal-50/30 dark:bg-teal-950/40 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Session Chat</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 py-3 text-xs font-medium border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      activeTab === 'notes'
                        ? 'border-teal-600 text-teal-800 dark:text-teal-300 bg-teal-50/30 dark:bg-teal-950/40 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Clinical Care Notes</span>
                  </button>
                </div>

                {activeTab === 'chat' ? (
                  <div className="flex-1 flex flex-col p-4 justify-between overflow-hidden">
                    <div className="overflow-y-auto space-y-3 pr-1 text-xs flex-1">
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">{msg.sender} • {msg.time}</span>
                          <div
                            className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                              msg.sender === 'You'
                                ? 'bg-teal-700 text-white rounded-tr-none'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none shadow-xs'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type message to doctor..."
                        className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <Button type="submit" variant="primary" size="sm" className="px-3">
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col p-4 justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Digital Care Plan &amp; Notes</span>
                        <Badge variant="teal" className="text-[10px]">Confidential</Badge>
                      </div>
                      <textarea
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        rows={12}
                        className="w-full text-xs font-mono p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {savedNotesNotice ? (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Notes synchronized
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Auto-saved to patient medical record</span>
                      )}
                      <Button variant="outline" size="sm" onClick={handleSaveNotes}>
                        Save Notes
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
