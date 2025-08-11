'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useSendbirdStateContext } from '@sendbird/uikit-react';
import PollMessage from '@/components/PollMessage';
import sendbirdSelectors from "@sendbird/uikit-react/sendbirdSelectors";
import CustomizedMessageInput from '@/components/CustomizedMessageInput';
import CustomizedMessageItem from '@/components/CustomizedMessageItem';

const ChannelList = dynamic(() => import('@sendbird/uikit-react/ChannelList'), { ssr: false });
const Channel = dynamic(() => import('@sendbird/uikit-react/Channel'), { ssr: false });
const ChannelSettings = dynamic(() => import('@sendbird/uikit-react/ChannelSettings'), { ssr: false });


export default function ChatPage() {
    const [showSettings, setShowSettings] = useState(false);

    const store = useSendbirdStateContext();
    const [currentChannelUrl, setCurrentChannelUrl] = useState(null);
      const [currentChannel, setCurrentChannel] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const updateUserMessage = sendbirdSelectors.getUpdateUserMessage(store);
    const userId = localStorage.getItem('userId')

    var channelChatDiv = document.getElementsByClassName("channel-chat")[0];

    const renderSettingsBar = () => {
        channelChatDiv.style.width = "52%";
        channelChatDiv.style.cssFloat = "left";
    };

    const hideSettingsBar = () => {
        channelChatDiv.style.width = "76%";
        channelChatDiv.style.cssFloat = "right";
    };

    const globalStore = useSendbirdStateContext();
    const sb = globalStore?.stores?.sdkStore?.sdk;

    // 🔍 Search users by nickname
    const handleSearch = async (value) => {
        setSearchTerm(value);

        if (!sb || value.trim() === '') {
            setSearchResults([]);
            return;
        }

        try {
            const query = sb.createApplicationUserListQuery();
            query.nicknameStartsWithFilter = value;
            query.limit = 10;

            if (query.hasNext) {
                const users = await query.next();
                setSearchResults(users.filter((u) => u.userId !== sb.currentUser.userId));
            }
        } catch (err) {
            console.error('User search error:', err);
        }
    };

    // 💬 Start 1-on-1 chat
    const handleUserSelect = async (user) => {
        console.log(sb, 'sb instance');
        if (!sb || !sb.groupChannel) return;

        try {

            const params = {
                invitedUserIds: [user.userId],
                isDistinct: true,
            };

            const channel = await sb.groupChannel.createChannel(params); // ✅ Correct method
            setCurrentChannelUrl(channel.url);
            setSearchResults([]);
            setSearchTerm('');
        } catch (err) {
            console.error('Failed to create/open DM channel:', err);
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-[#0d1117] text-white">
            {/* Sidebar */}
            <div className="w-1/4 border-r border-gray-700 flex flex-col">
                {/* 🔍 Search bar */}
                <div className="p-3">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-600"
                    />
                    {/* User results */}
                    {searchResults.length > 0 && (
                        <ul className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                            {searchResults.map((user) => (
                                <li
                                    key={user.userId}
                                    className="p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer"
                                    onClick={() => handleUserSelect(user)}
                                >
                                    {user.nickname || user.userId}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* 📜 Channel List (without + icon) */}
                <div className="flex-1 overflow-y-auto">
                    <ChannelList
                        onChannelSelect={(channel) => {
                            if (channel?.url) {
                                setCurrentChannelUrl(channel.url);
                            }
                            setCurrentChannel(channel);
                        }}
                        renderHeader={() => (
                            <div className="p-3 text-white font-semibold">
                                My Channels
                                {/* No + button here */}
                            </div>
                        )}
                    />
                </div>
            </div>

            {/* Main chat area */}
            <div className="flex-1 channel-chat">
                {currentChannelUrl ? (
                    <Channel
                        channelUrl={currentChannelUrl}
                        isReactionEnabled={true}
                        showSearchIcon={true}
                        onChatHeaderActionClick={() => {
                            setShowSettings(!showSettings);
                            renderSettingsBar();
                        }}
                        renderMessage={({ message }) => (
                            <CustomizedMessageItem
                                message={message}
                                userId={userId}
                                currentChannel={currentChannel}
                                updateUserMessage={updateUserMessage}
                                sb={sb}
                            />
                        )}
                        renderMessageInput={() => (
                            <CustomizedMessageInput sb={sb} />
                        )}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        Select a chat to begin
                    </div>
                )}
            </div>
            {showSettings && (
                <div className="channel-settings">
                    <ChannelSettings
                        channelUrl={currentChannelUrl}
                        onCloseClick={() => {
                            setShowSettings(false);
                            hideSettingsBar();
                        }}
                    />
                </div>
            )}
        </div>
    );
}
