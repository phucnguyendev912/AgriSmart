import React, { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GlobalNotificationListener = () => {
    const navigate = useNavigate();

    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const stompClient = new Client({
            webSocketFactory: () => new SockJS('/ws'),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('Connected to WebSocket for Notifications');
                stompClient.subscribe('/user/queue/location-confirm', (msg) => {
                    const payload = JSON.parse(msg.body);
                    
                    if (payload.message && payload.redirectPath) {
                        toast.info(
                            <div>
                                <p className="font-medium text-sm text-gray-800 dark:text-gray-100">{payload.message}</p>
                                <button 
                                    className="bg-primary text-white px-3 py-1.5 mt-2 rounded font-semibold text-xs hover:bg-hover-primary transition-colors"
                                    onClick={() => navigate(payload.redirectPath)}
                                >
                                    Xem ngay
                                </button>
                            </div>, 
                            {
                                position: "top-center",
                                autoClose: 10000,
                                closeOnClick: false,
                            }
                        );
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
            },
        });

        stompClient.activate();

        return () => {
            if (stompClient.active) {
                stompClient.deactivate();
            }
        };
    }, [navigate, user]);

    return null;
};

export default GlobalNotificationListener;
