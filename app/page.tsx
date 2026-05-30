"use client";
import React, { useState, useEffect, useRef } from "react";
import { Lock, User, MessageSquare, Plus, Bell, RefreshCw, Smartphone, Search, Filter, Info, FileCode, Check, Copy, Settings } from "lucide-react";

export default function Page() {
  const [activeTab, setActiveTab] = useState("notifs");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const [chatGroups, setChatGroups] = useState<any[]>([]);

  // Settings State
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Fetch settings on mount
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.success) {
          setTelegramToken(data.data.telegramToken || "");
          setTelegramChatId(data.data.telegramChatId || "");
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      }
    };
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramToken, telegramChatId }),
      });
      alert("Pengaturan Bot Telegram berhasil disimpan.");
    } catch (error) {
      console.error("Failed to save settings", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch notifications from the API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (data.success) {
          setChatGroups(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchNotifications();
    // Poll for new notifications every 5 seconds
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredChatGroups = chatGroups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedGroup = chatGroups.find(g => g.id === selectedChatId);

  return (
    <div className="flex h-screen bg-[#d1d7db] text-[#111b21] overflow-hidden font-sans pt-[20px] lg:pt-[20px] pb-[20px] px-0 lg:px-[10vw]">
      {/* Container to mimic WA Web full screen in typical setup, but floating slightly */}
      <div className="flex w-full h-full bg-[#f0f2f5] overflow-hidden lg:rounded shadow-lg border border-[#d1d7db]/60">
        
        {/* LEFT SIDEBAR */}
        <div className={`${(activeTab !== "notifs" || selectedChatId) ? 'hidden md:flex' : 'flex'} w-full md:w-[35%] lg:w-[32%] xl:w-[400px] border-r border-[#d1d7db] bg-white flex-col z-20 shrink-0`}>
          
          {/* Header */}
          <header className="h-[60px] shrink-0 bg-[#f0f2f5] flex items-center justify-between px-4 text-[#54656f]">
            <div className="w-10 h-10 bg-[#dfe5e7] rounded-full flex items-center justify-center text-[#54656f] font-bold text-lg overflow-hidden shrink-0">
              <User className="w-5 h-5"/>
            </div>
            <div className="flex items-center gap-1.5 md:gap-3 text-[#54656f]">
              <button className="p-2 rounded-full transition-colors hover:bg-[#d1d7db]">
                <Plus className="w-5 h-5" />
              </button>
              <button onClick={() => setActiveTab("notifs")} className={`p-2 rounded-full transition-colors relative ${activeTab === "notifs" ? "bg-[#d1d7db]" : "hover:bg-[#d1d7db]"}`} title="Chats">
                <MessageSquare className="w-5 h-5" />
              </button>
              <button onClick={() => { setActiveTab("settings"); setSelectedChatId(null); }} className={`p-2 rounded-full transition-colors relative ${activeTab === "settings" ? "bg-[#d1d7db]" : "hover:bg-[#d1d7db]"}`} title="Settings">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Search */}
          {activeTab === "notifs" && (
            <div className="p-2 border-b border-[#f0f2f5] bg-white">
              <div className="bg-[#f0f2f5] rounded-xl flex items-center px-4 py-1.5 gap-4">
                <Search className="w-4 h-4 text-[#8696a0]" />
                <input 
                  type="text" 
                  placeholder="Cari atau mulai chat baru" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-[15px] w-full text-[#3b4a54] placeholder-[#8696a0] h-6 font-light"
                />
              </div>
            </div>
          )}

          {/* List or Settings */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
            {activeTab === "notifs" ? (
              filteredChatGroups.map(group => (
                <div 
                  key={group.id}
                  onClick={() => {
                    setSelectedChatId(group.id);
                    setActiveTab("notifs");
                  }}
                  className={`flex flex-row items-center cursor-pointer hover:bg-[#f5f6f6] transition-colors ${selectedChatId === group.id && activeTab === "notifs" ? "bg-[#f0f2f5] hover:bg-[#f0f2f5]" : ""}`}
                >
                  <div className="px-[13px] py-3">
                    <div className="w-[49px] h-[49px] bg-[#dfe5e7] rounded-full flex items-center justify-center text-[#54656f] text-xl font-normal overflow-hidden shrink-0">
                      <User className="w-6 h-6 opacity-70" />
                    </div>
                  </div>
                  <div className="flex-1 pr-4 py-3 border-b border-[#f0f2f5] flex flex-col justify-center min-w-0">
                    <div className="flex justify-between items-center mb-[2px]">
                      <span className="text-[17px] text-[#111b21] truncate font-normal">{group.name}</span>
                      <span className={`text-xs shrink-0 font-medium ${group.unreadCount > 0 ? 'text-[#25D366]' : 'text-[#667781]'}`}>
                        {new Date(group.lastTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[14px] text-[#667781] truncate font-light leading-5">{group.lastMessage}</span>
                      {group.unreadCount > 0 && (
                        <span className="bg-[#25D366] text-white text-[11px] font-bold px-[6px] py-[2px] min-w-[20px] text-center rounded-full shrink-0">
                          {group.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6">
                <h3 className="text-xl font-normal text-[#111b21] mb-6">Pengaturan Telegram Bot</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#54656f] mb-1">Bot Token</label>
                    <input 
                      type="text" 
                      value={telegramToken}
                      onChange={(e) => setTelegramToken(e.target.value)}
                      placeholder="e.g. 123456789:ABCdef"
                      className="w-full bg-[#f0f2f5] text-[#111b21] px-4 py-2 rounded-lg border-none outline-none focus:ring-1 focus:ring-[#25D366]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#54656f] mb-1">Chat ID</label>
                    <input 
                      type="text" 
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="e.g. 987654321"
                      className="w-full bg-[#f0f2f5] text-[#111b21] px-4 py-2 rounded-lg border-none outline-none focus:ring-1 focus:ring-[#25D366]"
                    />
                  </div>
                  <button 
                    onClick={saveSettings}
                    disabled={isSaving}
                    className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
                  </button>

                  <button 
                    onClick={async () => {
                      if (!telegramToken || !telegramChatId) {
                        alert("Harap simpan Bot Token dan Chat ID terlebih dahulu.");
                        return;
                      }
                      try {
                        const res = await fetch("/api/notifications", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            appName: "System",
                            sender: "Test Bot",
                            message: "Halo! Ini adalah pesan uji coba dari Android Forwarder Web. Bot Anda berfungsi dengan baik!"
                          })
                        });
                        const data = await res.json();
                        if (data.success) {
                          alert("Pesan uji coba berhasil dikirim! Silakan periksa Telegram Anda.");
                        } else {
                          alert("Gagal memproses pesan uji coba: " + data.error);
                        }
                      } catch (e) {
                         alert("Terjadi kesalahan saat mengirim pesan uji coba.");
                      }
                    }}
                    className="w-full bg-[#3b4a54] hover:bg-[#202c33] text-white font-medium py-2 px-4 rounded-lg transition-colors mt-2 flex items-center justify-center"
                  >
                    Uji Coba Pengiriman Notifikasi
                  </button>

                  <div className="bg-[#ffeecd] px-3 py-3 rounded-lg shadow-sm border border-[#d1d7db]/30 flex flex-col gap-2 mt-4 text-sm text-[#54656f]">
                    <p className="font-medium text-[#111b21]">Cara Menggunakan:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Buat bot melalui <strong>BotFather</strong> di Telegram untuk mendapatkan Token.</li>
                      <li>Kirim minimal satu pesan ke bot.</li>
                      <li>Gunakan API atau bot pihak ketiga seperti @userinfobot untuk mengetahui <strong>Chat ID</strong> Anda.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={`flex-1 flex flex-col relative ${(activeTab !== "notifs" || selectedChatId) ? 'flex' : 'hidden md:flex'}`}>
          
          {activeTab === "notifs" ? (
             selectedGroup ? (
               <div className="flex flex-col h-full absolute inset-0">
                 {/* Chat Header */}
                 <header className="h-[60px] shrink-0 bg-[#f0f2f5] flex items-center px-4 gap-4 z-10 w-full relative border-l border-[#d1d7db]/40">
                   <button className="md:hidden text-[#54656f] hover:bg-[#d1d7db] p-1.5 rounded-full" onClick={() => setSelectedChatId(null)}>
                     <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                   </button>
                   <div className="w-10 h-10 bg-[#dfe5e7] rounded-full flex items-center justify-center text-[#54656f] overflow-hidden shrink-0">
                     <User className="w-6 h-6 opacity-70" />
                   </div>
                   <div className="flex-1 truncate">
                     <h2 className="text-[#111b21] whitespace-nowrap text-base font-normal">{selectedGroup.name}</h2>
                     <span className="text-[13px] text-[#667781] font-light">Ketuk di sini untuk info kontak</span>
                   </div>
                   <div className="flex items-center gap-2 md:gap-4 text-[#54656f]">
                     <button className="p-2 rounded-full hover:bg-[#d1d7db] transition hidden md:block">
                       <Search className="w-5 h-5" />
                     </button>
                     <button className="p-2 rounded-full hover:bg-[#d1d7db] transition hidden md:block">
                       <div className="flex flex-col gap-1 items-center justify-center w-5 h-5">
                         <div className="w-1 h-1 bg-current rounded-full"></div>
                         <div className="w-1 h-1 bg-current rounded-full"></div>
                         <div className="w-1 h-1 bg-current rounded-full"></div>
                       </div>
                     </button>
                   </div>
                 </header>

                 {/* Messages Area */}
                 <div className="flex-1 overflow-y-auto px-[4%] lg:px-[9%] py-4 space-y-2 custom-scrollbar" style={{ backgroundColor: '#efeae2', backgroundImage: 'url("https://i.pinimg.com/originals/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg")', backgroundRepeat: 'repeat', backgroundSize: '400px', opacity: 1 }}>
                   {/* Encryption header block */}
                   <div className="flex justify-center mb-4 mt-2">
                     <div className="bg-[#ffeecd] px-3 py-1.5 rounded-lg max-w-[90%] md:max-w-md shadow-sm text-center border border-[#d1d7db]/30 flex items-center gap-2">
                       <Lock className="w-3.5 h-3.5 text-[#54656f] shrink-0" />
                       <p className="text-[12.5px] text-[#54656f] leading-tight">Pesan di-mirror dari Android dan dienkripsi ujung ke ujung (E2EE). Tidak ada seorangpun di luar sinkronisasi ini yang dapat membaca konten Anda.</p>
                     </div>
                   </div>

                   {selectedGroup.notifs.map((notif, index) => {
                     return (
                       <div key={notif.id} className="flex flex-col items-start min-w-0 w-full mb-[2px]">
                         <div className="bg-white rounded-lg rounded-tl-none p-2 shadow-sm text-[#111b21] text-sm relative max-w-[85%] md:max-w-[65%] break-words">
                           <p className="whitespace-pre-wrap leading-tight mt-0.5 text-[14.2px] ml-1 mr-[40px]">{notif.message}</p>
                           <span className="text-[10.5px] text-[#667781] float-right mt-1 opacity-80 absolute bottom-1 right-2">
                               {new Date(notif.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </span>
                         </div>
                       </div>
                     );
                   })}
                 </div>

                 {/* Chat Input (Fake Read-only) */}
                 <div className="h-[62px] min-h-[62px] bg-[#f0f2f5] shrink-0 px-4 flex items-center gap-4 text-[#54656f] text-sm z-10 w-full relative">
                   <button className="p-2 hover:bg-[#d1d7db] rounded-full transition-colors"><Plus className="w-6 h-6" /></button>
                   <div className="flex-1 bg-white rounded-lg h-[42px] px-4 flex items-center border border-transparent shadow-sm">
                     <div className="flex items-center gap-2 w-full justify-start text-[#8696a0] font-light text-[15px]">
                       <Lock className="w-4 h-4" />
                       Mode Read-Only (Mirroring Sinkron)
                     </div>
                   </div>
                 </div>
               </div>
             ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] border-b-[6px] border-[#25D366] text-center px-4 w-full h-full relative">
                <div className="mb-6 flex items-center justify-center">
                  <div className="w-[320px] h-[190px] relative overflow-hidden rounded-md opacity-70 mix-blend-multiply flex items-center justify-center">
                    <Smartphone className="w-32 h-32 text-[#54656f]" />
                  </div>
                </div>
                <h1 className="text-3xl text-[#41525d] font-light mb-4 mt-8">Android Forwarder Web</h1>
                <p className="text-sm text-[#667781] max-w-md leading-relaxed font-normal">
                  Kirim pesan dan terima notifikasi tanpa harus memegang ponsel Anda.<br/><br/>
                  Gunakan menu WhatsApp yang ditiru di sebelah kiri untuk melihat pesan yang disinkronkan secara aman.
                </p>
                <div className="absolute bottom-10 text-[13px] flex items-center gap-1.5 text-[#8696a0]">
                  <Lock className="w-3 h-3" />
                  Privasi terlindungi dengan enkripsi AES-GCM 256.
                </div>
              </div>
             )
          ) : null}
        </div>
      </div>
    </div>
  );
}
