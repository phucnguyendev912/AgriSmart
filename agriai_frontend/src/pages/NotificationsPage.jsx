import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
    // Dummy state from the design
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'DISEASE',
            title: 'Cảnh báo: Bệnh Đạo Ôn phát hiện',
            isNew: true,
            content: 'AI phát hiện dấu hiệu sớm của bệnh Đạo Ôn tại lô đất A-4. Đề xuất phun thuốc gốc đồng trong vòng 24h.',
            time: '2 phút trước',
            icon: 'coronavirus',
            themeClasses: {
                container: 'bg-primary-container/10 border-primary/10 hover:bg-primary-container/20',
                indicator: 'bg-primary text-on-primary',
                iconArea: 'bg-primary-container text-primary',
                title: 'text-emerald-900',
                button: 'text-primary'
            }
        },
        {
            id: 2,
            type: 'WEATHER',
            title: 'Thời tiết cực đoan sắp tới',
            isNew: true,
            content: 'Dự báo có mưa đá nhẹ vào đêm nay. Vui lòng kiểm tra lại hệ thống lưới che tại khu vực nhà kính.',
            time: '1 giờ trước',
            icon: 'cloud_sync',
            themeClasses: {
                container: 'bg-secondary-container/10 border-secondary/10 hover:bg-secondary-container/20',
                indicator: 'bg-secondary text-on-secondary',
                iconArea: 'bg-secondary-container text-on-secondary-container',
                title: 'text-on-secondary-container',
                button: 'text-secondary'
            }
        },
        {
            id: 3,
            type: 'SYSTEM',
            title: 'Cập nhật hệ thống thành công',
            isNew: false,
            content: 'Phiên bản AgriAI 2.4.0 đã được áp dụng với khả năng nhận diện sâu bệnh tốt hơn 15%.',
            time: 'Hôm qua',
            icon: 'settings_suggest',
            themeClasses: {
                container: 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm border-transparent hover:border-slate-200 dark:hover:border-slate-700',
                indicator: '',
                iconArea: 'bg-surface-container text-slate-400',
                title: 'text-on-surface',
                button: 'text-error'
            }
        },
        {
            id: 4,
            type: 'INSIGHT',
            title: 'Báo cáo năng suất tuần',
            isNew: false,
            content: 'Báo cáo tuần của bạn đã sẵn sàng. Năng suất dự kiến tăng 5% so với cùng kỳ năm ngoái.',
            time: '2 ngày trước',
            icon: 'insights',
            themeClasses: {
                container: 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm border-transparent hover:border-slate-200 dark:hover:border-slate-700',
                indicator: '',
                iconArea: 'bg-surface-container text-slate-400',
                title: 'text-on-surface',
                button: 'text-error'
            }
        }
    ]);

    const handleMarkAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isNew: false })));
    };

    const handleMarkAsRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isNew: false } : n));
    };

    const handleDelete = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const unreadCount = notifications.filter(n => n.isNew).length;

    return (
        <div className="pt-16 min-h-screen bg-surface-container-low relative">
            <main className="max-w-5xl mx-auto p-4 md:p-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-on-surface">Thông báo</h2>
                        <p className="text-on-surface-variant mt-2 text-base">
                            {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc.` : 'Bạn không có thông báo mới nào.'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button 
                                onClick={handleMarkAllAsRead}
                                className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold text-primary bg-primary-container/20 rounded-lg hover:bg-primary-container/30 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">done_all</span>
                                Đánh dấu đã đọc tất cả
                            </button>
                        </div>
                    )}
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center text-slate-400 mb-4">
                                <span className="material-symbols-outlined text-4xl">notifications_off</span>
                            </div>
                            <h3 className="text-xl font-bold text-on-surface">Không có thông báo mới</h3>
                            <p className="text-on-surface-variant mt-2">Chúng tôi sẽ cập nhật cho bạn khi có thông tin quan trọng.</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div 
                                key={notification.id} 
                                className={`${notification.themeClasses.container} border p-5 rounded-xl flex gap-4 relative overflow-hidden group transition-all cursor-pointer`}
                            >
                                {/* Left Indicator Line */}
                                {notification.isNew && (
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${notification.type === 'DISEASE' ? 'bg-primary' : 'bg-secondary'}`}></div>
                                )}
                                
                                {/* Icon */}
                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${notification.themeClasses.iconArea}`}>
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: notification.isNew ? "'FILL' 1" : "'FILL' 0" }}>
                                        {notification.icon}
                                    </span>
                                </div>
                                
                                {/* Content */}
                                <div className={`flex-1 ${!notification.isNew ? 'opacity-70' : ''}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`font-bold ${notification.isNew ? notification.themeClasses.title : 'text-on-surface'}`}>
                                            {notification.title}
                                        </h4>
                                        {notification.isNew ? (
                                            notification.type === 'DISEASE' ? (
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${notification.themeClasses.indicator}`}>Mới</span>
                                            ) : (
                                                <span className={`w-2.5 h-2.5 rounded-full ${notification.type === 'WEATHER' ? 'bg-secondary' : 'bg-primary'}`}></span>
                                            )
                                        ) : null}
                                    </div>
                                    <p className="text-on-surface-variant text-sm leading-relaxed mb-4">{notification.content}</p>
                                    
                                    {/* Action Bar */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">schedule</span> {notification.time}
                                        </span>
                                        <div className="flex gap-2">
                                            {notification.isNew && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/50 transition-colors ${notification.themeClasses.button}`}
                                                >
                                                    Đã đọc
                                                </button>
                                            )}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                                                className={`text-xs font-bold text-error px-3 py-1.5 rounded-lg transition-colors ${notification.isNew ? 'hover:bg-white/50' : 'hover:bg-surface-container-high opacity-0 group-hover:opacity-100'}`}
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Bottom Navigation (Mobile Only) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-surface-variant/20 px-6 py-4 flex justify-between items-center z-50">
                <Link to="/farming-areas" className="flex flex-col items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined">grid_view</span>
                    <span className="text-[10px] font-medium">Khu vực</span>
                </Link>
                <Link to="/diagnosis" className="flex flex-col items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined">search</span>
                    <span className="text-[10px] font-medium">Chẩn đoán</span>
                </Link>
                <Link to="/history" className="flex flex-col items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined">history</span>
                    <span className="text-[10px] font-medium">Lịch sử</span>
                </Link>
                <Link to="/notifications" className="flex flex-col items-center gap-1 text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>
                    <span className="text-[10px] font-bold">Thông báo</span>
                </Link>
            </div>


        </div>
    );
};

export default NotificationsPage;
