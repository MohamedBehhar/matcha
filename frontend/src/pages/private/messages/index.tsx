import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useUserStore from "@/store/userStore";
import { socket } from "@/utils/socket";
import toast from "react-hot-toast";
import userImg from "@/assets/images/user.png";
import { FiSend, FiSearch, FiMoreVertical } from "react-icons/fi";
import { IoMdArrowBack } from "react-icons/io";
import { BsImage } from "react-icons/bs";
import { MdClose } from "react-icons/md";
import { format, isToday, isYesterday } from "date-fns";

// Assume you have these API methods
import {
  getFriends,
  getMessagesByConversationId,
} from "@/api/methods/interactions";
import Badge from "@/components/badge";

function MessagesPage() {
  const { user } = useUserStore();
  interface Match {
    id: string | number;
    first_name: string;
    last_name: string;
    profile_picture?: string;
    online?: boolean;
    last_active?: Date;
    last_message?: string;
    last_message_time?: Date;
    conversation_id?: string | number;
    unread_count?: number;
  }

  interface Message {
    sender_id: string | number;
    receiver_id: string | number;
    content: string;
    created_at: Date;
    media_url?: string | null;
    type?: "text" | "image" | "video";
  }

  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  // const videoInputRef = useRef<HTMLInputElement>(null);

  // New states for media handling
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch user matches
  const fetchMatches = async () => {
    if (!user?.id) return;

    try {
      const response = await getFriends(user.id + "");
      setMatches(response || []);
    } catch (error) {
      console.error("Failed to fetch matches:", error);
      toast.error("Failed to load your matches");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async (
    conversation_id: string | number | undefined
  ) => {
    if (!user?.id || !conversation_id) return;

    try {
      const response = await getMessagesByConversationId(
        String(conversation_id)
      );
      setMessages(response);
      setSelectedMatch(
        matches.find((m) => m.conversation_id === conversation_id) || null
      );
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast.error("Failed to load conversation");
    }
    return [];
  };

  // Handle file selection
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should not exceed 5MB");
      return;
    }

    // Set file and create preview
    setSelectedMedia(file);
    setMediaType(type);

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Cancel media upload
  const cancelMediaUpload = () => {
    setSelectedMedia(null);
    setMediaPreview(null);
    setMediaType(null);

    // Reset file inputs
    if (fileInputRef.current) fileInputRef.current.value = "";
    // if (videoInputRef.current) videoInputRef.current.value = "";
  };

  // Send message with or without media
  const sendMessage = async (
    e:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement>
      | null
  ) => {
    e?.preventDefault();

    // Return if no message and no media
    if (!newMessage.trim() && !selectedMedia) return;
    if (!selectedMatch?.id) return;

    try {
      setIsUploading(selectedMedia ? true : false);
      const messageData: Message = {
        sender_id: user.id as string | number,
        receiver_id: selectedMatch.id,
        content: (mediaType ? mediaPreview : newMessage.trim()) || "",
        type: mediaType || "text",
        created_at: new Date(),
      };

      console.log("Sending message:", messageData);
      // Optimistic update
      setMessages((prev) => [...prev, messageData]);
      setNewMessage("");
      cancelMediaUpload();

      // Send to API
      // await apiSendMessage(messageData);

      // Emit socket event
      socket.emit("message", {
        to: selectedMatch.id,
        from: user.id,
        content: mediaPreview || newMessage.trim(),
        type: mediaType || "text",
        conversation_id: selectedMatch.conversation_id,
      });
      setMatches((prev) =>
        prev.map((match) =>
          match.id === selectedMatch.id
            ? {
                ...match,
                last_message: newMessage.trim(),
                last_message_time: new Date(),
                unread_count: 0,
              }
            : match
        )
      );
      messageEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      setMessages((prev) =>
        prev.filter(
          (msg) =>
            msg.content !== (mediaType ? mediaPreview : newMessage.trim()) ||
            msg.type !== (mediaType || "text")
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Format created_at for display
  const formatMessageTime = (created_at: Date) => {
    const date = new Date(created_at);

    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMM d");
    }
  };

  // Format date for message groups
  const formatMessageDate = (created_at: Date) => {
    const date = new Date(created_at);

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
    interface MessageGroup {
      date: string;
      messages: Message[];
    }

    const groups: Record<string, MessageGroup> = {};

    messages.forEach((message) => {
      const date = new Date(message.created_at);
      const dateKey = format(date, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: formatMessageDate(message.created_at),
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
    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }, [selectedMatch]);

  // Fetch matches on component mount
  useEffect(() => {
    fetchMatches();
  }, [user?.id]);

  // Socket event listeners
  useEffect(() => {
    if (!user?.id) return;
    socket.emit("join", user.id);
    // socket.on(`messages-conversation-${}`
    socket.on("message", (data) => {
      //// update last_message and last_message_time in matches
      const updatedMatches = matches.map((match) => {
        if (match.conversation_id === data.conversation_id) {
          return {
            ...match,
            last_message: data.content,
            last_message_time: new Date(),
            unread_count: (match.unread_count || 0) + 1,
          };
        }
        return match;
      });
      setMatches(updatedMatches);

      if (selectedMatch && data.to !== user.id && data.from !== user.id) return;
      setMessages((prev) => [
        ...prev,
        {
          sender_id: data.from,
          receiver_id: data.to,
          content: data.content,
          media_url: data.media_url || null,
          type: data.type || "text",
          created_at: new Date(),
        },
      ]);
    });
    socket.on("status", (data) => {
      console.log("🔔 Status update received:", data);
    });

    return () => {
      socket.off("message");
      socket.off("status");
    };
  }, [user?.id, selectedMatch, matches]);

  // Fetch messages when selected match changes
  useEffect(() => {
    if (selectedMatch?.id) {
      fetchMessages(selectedMatch.conversation_id);
    }
  }, [selectedMatch]);

  // Render message content based on type
  const renderMessageContent = (message: {
    type: "image" | "video" | "text";
    content: string;
    media_url?: string;
  }) => {
    if (message.type === "image") {
      return (
        <img
          src={
            message.content.includes("data:image")
              ? message.content
              : `http://localhost:3000/${message.content}`
          }
          alt="Message content"
          className="size-[30rem] rounded-lg aspect-video object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = userImg; // Fallback image
          }}
          onClick={() => {
            window.open(message.media_url || message.content, "_blank");
          }}
        />
      );
    }
    return message.content;
  };

  return (
    <div className=" dark h-full px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full overflow-hidden  flex ">
        {/* Matches Sidebar */}
        <div
          className={`border-r border-gray-200 dark:border-gray-700 w-[30%] flex flex-col   min-w-[30rem] ${
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

          <div className="overflow-y-auto  w-full flex-1 ">
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
                  onClick={() => {
                    setSelectedMatch(match);
                    setMatches((prev) =>
                      prev.map((m) =>
                        m.id === match.id
                          ? { ...m, unread_count: 0 } // Reset unread count
                          : m
                      )
                    );
                  }}
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
                      {match.last_message &&
                      (match.last_message.includes("data:image") ||
                        match.last_message.includes("/uploads/"))
                        ? "** Sent a image message **"
                        : match.last_message || "No messages yet"}
                      {match.last_message
                        ? match.last_message.length > 50
                          ? `...`
                          : ""
                        : match.last_message_time
                        ? ` - ${formatMessageTime(match.last_message_time)}`
                        : match.last_message_time || "No messages yet"}
                    </p>
                  </div>
                  {(match.unread_count ?? 0) > 0 && (
                    <Badge variant="red-primary" className="ml-2">
                      {match.unread_count}
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
                <div className="bg-red-100 text-red-500 p-4 rounded-full mb-4 ">
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
          className={`col-span-2 flex flex-col h-full  flex-1  max-w-full [&>*]:
            truncate [&>*]:overflow-hidden
             ${selectedMatch ? "block" : "hidden md:block"}`}
        >
          {selectedMatch ? (
            <div className="flex flex-col h-full">
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
                    {/* {selectedMatch.online && (
                      <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                        Online
                      </Badge>
                    )} */}
                  </div>
                  {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedMatch.online
                      ? "Active now"
                      : selectedMatch.last_active
                      ? `Last active ${formatMessageTime(
                          selectedMatch.last_active
                        )}`
                      : "Offline"}
                  </p> */}
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
                className=" overflow-y-auto p-4 space-y-4 h-full  max-h-[calc(100vh-190px)] max-w-full flex-1 flex flex-col [&>*]:w-full [&>*]:max-w-full [&>*]:flex-shrink-0"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#ccc #f8f8f8",
                }}
                onScroll={() => {
                  // Handle scroll events if needed
                }}
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
                        const time = formatMessageTime(message.created_at);

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

                            <div className="max-w-[75%] flex flex-col">
                              <div
                                className={`px-4 py-2 rounded-t-lg  min-h-fit
                                   ${
                                     isMe
                                       ? "bg-red-500 text-white rounded-bl-lg"
                                       : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-br-lg"
                                   }`}
                              >
                                {renderMessageContent({
                                  type: message.type || "text",
                                  content: message.content,
                                  media_url: message.media_url || undefined,
                                })}
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

              {/* Media Preview */}
              {mediaPreview && (
                <div className="px-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="relative inline-block">
                    {mediaType === "image" ? (
                      <img
                        src={mediaPreview}
                        alt="Upload preview"
                        className="h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <video
                        src={mediaPreview}
                        className="h-20 rounded-lg object-cover"
                      />
                    )}
                    <button
                      onClick={cancelMediaUpload}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                    >
                      <MdClose size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <form
                className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center"
                onSubmit={sendMessage}
              >
                {/* Hidden file inputs */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, "image")}
                />
                {/* <input
                  type="file"
                  accept="video/*"
                  ref={videoInputRef}
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, "video")}
                /> */}

                {/* Emoji button */}
                {/* <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                >
                  <BsEmojiSmile />
                </button> */}

                {/* Image upload button */}
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <BsImage />
                </button>

                {/* Message input */}
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 p-2 mx-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />

                {/* Send button */}
                <button
                  type="submit"
                  className={`p-2 rounded-full ${
                    isUploading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : newMessage.trim() || selectedMedia
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={
                    isUploading || (!newMessage.trim() && !selectedMedia)
                  }
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  ) : (
                    <FiSend />
                  )}
                </button>
              </form>
            </div>
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
  );
}

export default MessagesPage;
