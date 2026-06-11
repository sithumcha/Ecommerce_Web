import React, { useState, useEffect, useContext, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Send, UserCircle, Loader2, MessageSquare, Trash2 } from 'lucide-react';

// Helper to format date just for chat
const formatChatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const Messages = () => {
  const { userInfo } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const defaultUserId = searchParams.get('userId');
  const defaultProductId = searchParams.get('productId');

  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  // Fetch conversation list
  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data);
      
      // If a default user was passed via query params, and we don't have an active user selected yet
      if (defaultUserId && !activeUser) {
        // Find if they are in our conversation list
        const existingConv = data.find(c => c.user._id === defaultUserId);
        if (existingConv) {
          setActiveUser(existingConv.user);
        } else {
          // If not, we still set them as active so we can start a new chat!
          // We'd need to fetch their name ideally, but for now we'll set a placeholder
          setActiveUser({ _id: defaultUserId, name: 'New Contact' });
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setLoadingConv(false);
    }
  };

  // Fetch messages for the active user
  const fetchMessages = async (userId, isPolling = false) => {
    if (!userId) return;
    try {
      const { data } = await api.get(`/messages/${userId}`);
      setMessages((prev) => {
        // Only scroll to bottom on initial load or when a new message arrives
        if (!isPolling || data.length > prev.length) {
          setTimeout(scrollToBottom, 50);
        }
        return data;
      });
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoadingMsgs(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, []);

  // Poll for active chat updates
  useEffect(() => {
    let interval;
    if (activeUser) {
      setLoadingMsgs(true);
      fetchMessages(activeUser._id, false);
      
      interval = setInterval(() => {
        fetchMessages(activeUser._id, true);
      }, 3000); // poll every 3 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeUser]);

  // Poll for conversation list updates (less frequent)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser) return;

    setSending(true);
    try {
      const payload = {
        receiverId: activeUser._id,
        content: newMessage,
      };
      
      // Only attach product context if it's the very first message matching the query param
      if (defaultProductId && messages.length === 0) {
        payload.productId = defaultProductId;
      }

      const { data } = await api.post('/messages', payload);
      setMessages([...messages, data]);
      setNewMessage('');
      fetchConversations(); // refresh list to show last message
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!activeUser || !window.confirm(`Are you sure you want to delete your conversation with ${activeUser.name}?`)) return;
    
    try {
      await api.delete(`/messages/${activeUser._id}`);
      setActiveUser(null);
      setMessages([]);
      fetchConversations();
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  };

  return (
    <div className="flex-grow flex flex-col h-[calc(100vh-140px)] pb-8">
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Messages</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Communicate directly with agents and clients.</p>
      </div>

      <div className="glass-panel flex-grow flex rounded-3xl border border-slate-200/60 dark:border-dark-800/80 overflow-hidden shadow-xl">
        
        {/* Left Pane - Conversations List */}
        <div className="w-1/3 min-w-[250px] border-r border-slate-200/60 dark:border-dark-800/80 bg-white/30 dark:bg-dark-950/30 flex flex-col">
          <div className="p-4 border-b border-slate-200/60 dark:border-dark-800/80">
            <h2 className="font-bold text-slate-800 dark:text-slate-200">Recent Chats</h2>
          </div>
          
          <div className="flex-grow overflow-y-auto p-2 space-y-1">
            {loadingConv ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center p-8 text-slate-500 text-sm">
                No conversations yet.
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.user._id}
                  onClick={() => setActiveUser(conv.user)}
                  className={`w-full flex items-start gap-3 p-3 rounded-2xl transition-all text-left ${
                    activeUser?._id === conv.user._id
                      ? 'bg-primary-50 dark:bg-primary-900/20 shadow-sm border border-primary-100 dark:border-primary-800/30'
                      : 'hover:bg-slate-50 dark:hover:bg-dark-900 border border-transparent'
                  }`}
                >
                  <div className="relative">
                    <UserCircle className="w-10 h-10 text-slate-400" />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-dark-950">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate pr-2">
                        {conv.user.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatChatDate(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? 'font-bold text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {conv.lastMessage.sender._id === userInfo._id ? 'You: ' : ''}
                      {conv.lastMessage.content}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Pane - Active Chat */}
        <div className="flex-grow flex flex-col bg-slate-50/50 dark:bg-dark-900/20 relative">
          {activeUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200/60 dark:border-dark-800/80 bg-white/40 dark:bg-dark-950/40 backdrop-blur-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <UserCircle className="w-10 h-10 text-slate-400" />
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{activeUser.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activeUser.isAgent ? 'Agent' : 'Client'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDeleteConversation}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  title="Delete Conversation"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages Area */}
              <div ref={messagesContainerRef} className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4">
                {loadingMsgs ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-dark-800 flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-slate-400" />
                    </div>
                    <p>Send a message to start the conversation.</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender._id === userInfo._id;
                    const showProduct = msg.product && idx === 0;

                    return (
                      <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* Product Context Card (if attached to message) */}
                        {showProduct && (
                          <div className={`mb-2 p-2 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-950 flex items-center gap-3 max-w-[280px] ${isMe ? 'mr-2' : 'ml-2'}`}>
                            <img src={msg.product.image} alt="product" className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{msg.product.name}</p>
                              <p className="text-[10px] text-slate-500">Regarding this item</p>
                            </div>
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                            isMe
                              ? 'bg-primary-600 text-white rounded-tr-sm'
                              : 'bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 mx-1">
                          {formatChatDate(msg.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Area */}
              <div className="p-4 bg-white/40 dark:bg-dark-950/40 border-t border-slate-200/60 dark:border-dark-800/80 backdrop-blur-md">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow form-input rounded-full py-3 px-5 text-sm border-slate-200 dark:border-dark-800"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 shadow-md"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
              <MessageSquare className="w-16 h-16 opacity-20" />
              <p className="text-lg font-medium">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
