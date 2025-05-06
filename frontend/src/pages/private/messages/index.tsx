import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useUserStore from "@/store/userStore";
import { socket } from "@/utils/socket";
import toast from "react-hot-toast";
import userImg from "@/assets/images/user.png";
import { FiSend, FiSearch, FiMoreVertical } from "react-icons/fi";
import { IoMdArrowBack } from "react-icons/io";
import { BsEmojiSmile } from "react-icons/bs";
import { format, isToday, isYesterday } from "date-fns";

// Assume you have these API methods
import {
  getMatches,
  getMessages,
  sendMessage as apiSendMessage,
} from "@/api/methods/interactions";
import Badge from "@/components/badge";

function MessagesPage() {
  const { user } = useUserStore();
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const messageEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  // Fetch user matches
  const fetchMatches = async () => {
    if (!user?.id) return;

    try {
      //   const response = await getMatches(user.id);
      const response = [];
      setMatches(response || []);
    } catch (error) {
      console.error("Failed to fetch matches:", error);
      toast.error("Failed to load your matches");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages for a specific match
  const fetchMessages = async (matchId) => {
    if (!user?.id || !matchId) return;

    try {
      const response = [];
      setMessages(response || []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast.error("Failed to load conversation");
    }
  };

  // Send message
  const sendMessage = async (e) => {
    // e?.preventDefault();
    // if (!newMessage.trim() || !selectedMatch?.id) return;
    // try {
    //   const messageData = {
    //     sender_id: user.id,
    //     receiver_id: selectedMatch.id,
    //     content: newMessage.trim(),
    //     timestamp: new Date(),
    //   };
    //   // Optimistic update
    //   setMessages((prev) => [...prev, messageData]);
    //   setNewMessage("");
    //   // Send to API
    //   await apiSendMessage(messageData);
    //   // Emit socket event
    //   socket.emit("message", {
    //     to: selectedMatch.id,
    //     from: user.id,
    //     content: newMessage.trim(),
    //   });
    // } catch (error) {
    //   console.error("Failed to send message:", error);
    //   toast.error("Failed to send message");
    //   // Remove the message from the UI if it failed
    //   setMessages((prev) =>
    //     prev.filter(
    //       (msg) =>
    //         msg.content !== newMessage.trim() ||
    //         msg.timestamp !== messageData.timestamp
    //     )
    //   );
    // }
  };

  // Format timestamp for display
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);

    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMM d");
    }
  };

  // Format date for message groups
  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);

    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMMM d, yyyy");
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};

    messages.forEach((message) => {
      const date = new Date(message.timestamp);
      const dateKey = format(date, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: formatMessageDate(message.timestamp),
          messages: [],
        };
      }

      groups[dateKey].messages.push(message);
    });

    return Object.values(groups);
  };

  // Filter matches by search term
  const filteredMatches = matches.filter(
    (match) =>
      match.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Scroll to bottom of messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch matches on component mount
  useEffect(() => {
    fetchMatches();
  }, [user?.id]);

  // Socket event listeners
  useEffect(() => {
    if (!user?.id) return;

    // Listen for new messages
    const handleNewMessage = (data) => {
      //   if (data.from === selectedMatch?.id) {
      //     setMessages((prev) => [
      //       ...prev,
      //       {
      //         sender_id: data.from,
      //         receiver_id: user.id,
      //         content: data.content,
      //         timestamp: new Date(),
      //       },
      //     ]);
      //   } else {
      //     // Show notification for messages from other matches
      //     const matchName =
      //       matches.find((m) => m.id === data.from)?.first_name || "Someone";
      //     toast(`New message from ${matchName}`);
      //     // Refresh matches list to update unread count
      //     fetchMatches();
      //   }
    };

    // Listen for online status changes
    const handleStatusChange = (data) => {
      //   setMatches((prev) =>
      //     prev.map((match) =>
      //       match.id === data.userId
      //         ? { ...match, online: data.status === "online" }
      //         : match
      //     )
      //   );
    };

    socket.emit("join", user.id);
    socket.on("message", handleNewMessage);
    socket.on("status", handleStatusChange);

    return () => {
      socket.off("message", handleNewMessage);
      socket.off("status", handleStatusChange);
    };
  }, [user?.id, selectedMatch, matches]);

  // Fetch messages when selected match changes
  useEffect(() => {
    if (selectedMatch?.id) {
      fetchMessages(selectedMatch.id);
    }
  }, [selectedMatch]);

  return (
    <div className=" h-full px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-full overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Matches Sidebar */}
          <div
            className={`border-r border-gray-200 dark:border-gray-700 ${
              selectedMatch ? "hidden md:block" : "block"
            }`}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Messages
              </h2>
              <div className="mt-3 relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full p-2 pl-8 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute left-2.5 top-3 text-gray-400" />
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-70px)]">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                </div>
              ) : filteredMatches.length > 0 ? (
                filteredMatches.map((match) => (
                  <div
                    key={match.id}
                    className={`flex items-center p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
                      selectedMatch?.id === match.id
                        ? "bg-red-50 dark:bg-gray-700"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setSelectedMatch(match)}
                  >
                    <div className="relative">
                      <img
                        src={
                          match.profile_picture
                            ? `http://localhost:3000/${match.profile_picture}`
                            : userImg
                        }
                        alt={`${match.first_name}'s profile`}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = userImg;
                        }}
                      />
                      {match.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                          {match.first_name} {match.last_name}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {match.last_message_time
                            ? formatMessageTime(match.last_message_time)
                            : "New"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {match.last_message || "No messages yet"}
                      </p>
                    </div>
                    {match.unread_count > 0 && (
                      <Badge variant="red-primary" className="ml-2">
                        {match.unread_count}
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
                  <div className="bg-red-100 text-red-500 p-4 rounded-full mb-4">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                    No conversations yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    Start matching with people to begin conversations
                  </p>
                  <Link
                    to="/"
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Find Matches
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div
            className={`col-span-2 flex flex-col h-full ${
              selectedMatch ? "block" : "hidden md:block"
            }`}
          >
            {selectedMatch ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <button
                    className="md:hidden mr-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setSelectedMatch(null)}
                  >
                    <IoMdArrowBack className="text-gray-500" />
                  </button>

                  <img
                    src={
                      selectedMatch.profile_picture
                        ? `http://localhost:3000/${selectedMatch.profile_picture}`
                        : userImg
                    }
                    alt={`${selectedMatch.first_name}'s profile`}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = userImg;
                    }}
                  />

                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                        {selectedMatch.first_name} {selectedMatch.last_name}
                      </h3>
                      {selectedMatch.online && (
                        <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                          Online
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedMatch.online
                        ? "Active now"
                        : selectedMatch.last_active
                        ? `Last active ${formatMessageTime(
                            selectedMatch.last_active
                          )}`
                        : "Offline"}
                    </p>
                  </div>

                  <Link
                    to={`/profile/${selectedMatch.id}`}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FiMoreVertical className="text-gray-500" />
                  </Link>
                </div>

                {/* Messages */}
                <div
                  ref={messageContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                        <svg
                          className="w-8 h-8 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          ></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                        No messages yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Send a message to start the conversation
                      </p>
                    </div>
                  ) : (
                    groupMessagesByDate().map((group, groupIndex) => (
                      <div key={groupIndex} className="space-y-3">
                        <div className="flex justify-center">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-full">
                            {group.date}
                          </span>
                        </div>

                        {group.messages.map((message, index) => {
                          const isMe = message.sender_id === user.id;
                          const time = formatMessageTime(message.timestamp);

                          return (
                            <div
                              key={index}
                              className={`flex ${
                                isMe ? "justify-end" : "justify-start"
                              }`}
                            >
                              {!isMe && (
                                <img
                                  src={
                                    selectedMatch.profile_picture
                                      ? `http://localhost:3000/${selectedMatch.profile_picture}`
                                      : userImg
                                  }
                                  alt={`${selectedMatch.first_name}'s profile`}
                                  className="w-8 h-8 rounded-full mr-2 self-end object-cover"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = userImg;
                                  }}
                                />
                              )}

                              <div className="max-w-[75%]">
                                <div
                                  className={`px-4 py-2 rounded-t-lg ${
                                    isMe
                                      ? "bg-red-500 text-white rounded-bl-lg"
                                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-br-lg"
                                  }`}
                                >
                                  {message.content}
                                </div>
                                <div
                                  className={`text-xs text-gray-500 mt-1 ${
                                    isMe ? "text-right" : "text-left"
                                  }`}
                                >
                                  {time}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                  <div ref={messageEndRef} />
                </div>

                {/* Message Input */}
                <form
                  className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center"
                  onSubmit={sendMessage}
                >
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                  >
                    <BsEmojiSmile />
                  </button>

                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 p-2 mx-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />

                  <button
                    type="submit"
                    className={`p-2 rounded-full ${
                      newMessage.trim()
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!newMessage.trim()}
                  >
                    <FiSend />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <div className="bg-red-100 text-red-500 p-6 rounded-full mb-6">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    ></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  Your Messages
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                  Select a conversation from the sidebar or start matching with
                  new people to begin chatting.
                </p>
                <Link
                  to="/"
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Find Matches
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
