import React, { useState, useRef, useEffect } from 'react';

const ChatBotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text: 'Chào bạn! Mình là trợ lý AgriAI. Bạn đang gặp vấn đề gì về cây lúa hôm nay? Ví dụ: Bệnh đạo ôn lá, khô vằn, sâu cuốn lá...',
            type: 'text'
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    const suggestions = [
        "Bệnh Đạo Ôn Lá nên phun thuốc gì?",
        "Thời tiết hôm nay có nguy cơ bệnh không?",
        "Hướng dẫn chụp ảnh lá bị bệnh"
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = (text) => {
        const msgText = text || input;
        if (!msgText.trim()) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: msgText,
            type: 'text'
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            const aiMsg = {
                id: Date.now() + 1,
                sender: 'ai',
                text: getMockResponse(msgText),
                type: 'text'
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1500);
    };

    const getMockResponse = (query) => {
        const q = query.toLowerCase();
        if (q.includes('đạo ôn')) return "Đối với bệnh Đạo Ôn, bạn nên sử dụng các hoạt chất như Tricyclazole, Fenoxanil hoặc Isoprothiolane. Hãy kiểm tra độ ẩm ruộng và tránh bón thừa đạm nhé.";
        if (q.includes('thời tiết')) return "Dựa trên dữ liệu hiện tại, độ ẩm cao (trên 85%) và nhiệt độ mát mẻ ban đêm là điều kiện lý tưởng cho nấm bệnh phát triển. Bạn nên thăm đồng thường xuyên hơn.";
        if (q.includes('chụp ảnh')) return "Để AI nhận diện tốt nhất, bạn hãy chụp cận cảnh vết bệnh, giữ điện thoại song song với mặt lá và đảm bảo đủ ánh sáng (tránh chụp ngược sáng).";
        return "Cảm ơn bạn đã chia sẻ. Mình đang phân tích thông tin này và sẽ hỗ trợ bạn tốt nhất dựa trên dữ liệu từ chuyên gia AgriAI.";
    };

    return (
        <>
            {/* Floating Action Button */}
            <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-[100]">
                <button 
                    onClick={() => setIsOpen(true)}
                    className={`w-14 h-14 md:w-16 md:h-16 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group relative ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
                >
                    <span className="material-symbols-outlined text-2xl md:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                    <span className="absolute right-full mr-4 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">Chat với AgriBot</span>
                </button>
            </div>

            {/* Chatbox Modal Backdrop */}
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-8 bg-on-surface/20 backdrop-blur-sm animate-in fade-in duration-200">
                    {/* Modal Content */}
                    <div className="w-full max-w-5xl h-full max-h-[870px] bg-white rounded-none md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
                        {/* Modal Header */}
                        <header className="bg-[#00A651] px-6 py-4 flex items-center justify-between text-white shrink-0">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="hover:bg-white/10 p-2 rounded-full transition-colors flex items-center"
                                >
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg leading-tight">Trợ lý AgriAI</h2>
                                        <p className="text-xs text-white/80 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span> Đang trực tuyến
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/10 p-1 rounded-full transition-colors"
                            >
                                <span className="material-symbols-outlined text-3xl">close</span>
                            </button>
                        </header>

                        {/* Chat Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse max-w-[85%] ml-auto' : 'max-w-[85%]'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'ai' ? 'bg-primary-container' : 'bg-slate-200'}`}>
                                        <span className={`material-symbols-outlined ${msg.sender === 'ai' ? 'text-on-primary-container' : 'text-slate-500'}`}>
                                            {msg.sender === 'ai' ? 'smart_toy' : 'person'}
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className={`p-4 rounded-2xl shadow-sm border border-outline-variant/10 ${msg.sender === 'ai' ? 'bg-white rounded-tl-none text-on-surface-variant' : 'bg-slate-200 rounded-tr-none text-on-surface font-medium'}`}>
                                            <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                                        </div>
                                        
                                        {msg.id === 1 && (
                                            <div className="flex flex-wrap gap-2">
                                                {suggestions.map((s, idx) => (
                                                    <button 
                                                        key={idx}
                                                        onClick={() => handleSend(s)}
                                                        className="px-4 py-2 border border-primary text-primary text-xs md:text-sm font-medium rounded-full hover:bg-primary/5 transition-colors whitespace-nowrap"
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex items-start gap-3 max-w-[85%]">
                                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-on-primary-container">smart_toy</span>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-outline-variant/10">
                                        <div className="flex gap-1 items-center py-1">
                                            <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Bar */}
                        <div className="p-4 md:p-6 bg-white border-t border-outline-variant/20">
                            <div className="relative flex items-center gap-3">
                                <button className="text-slate-400 hover:text-primary transition-colors hidden sm:block">
                                    <span className="material-symbols-outlined">attach_file</span>
                                </button>
                                <button className="text-slate-400 hover:text-primary transition-colors hidden sm:block">
                                    <span className="material-symbols-outlined">image</span>
                                </button>
                                <input 
                                    className="flex-1 bg-surface-container-low border-none rounded-full px-5 md:px-6 py-3 md:py-4 focus:ring-2 focus:ring-primary/20 text-on-surface text-sm md:text-base placeholder:text-outline" 
                                    placeholder="Nhập câu hỏi của bạn..." 
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <button 
                                    onClick={() => handleSend()}
                                    className="w-10 h-10 md:w-12 md:h-12 bg-[#00A651] text-white rounded-full flex items-center justify-center hover:brightness-95 active:scale-95 transition-all shadow-lg shrink-0"
                                >
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatBotWidget;
