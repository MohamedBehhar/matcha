import { useState, useEffect, useRef } from "react";
import useUserStore from "@/store/userStore";
import toast from "react-hot-toast";
import userImg from "@/assets/images/user.png";
import { useSocket } from "@/context/SocketContext";
import { getFriends } from "@/api/methods/interactions";
import { getMsgs, getConversations } from "@/api/methods/messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function MessagesPage() {
  const { user } = useUserStore();
  const [matches, setMatches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messageContainerRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const socket = useSocket();

  // Fetch user matches
  const fetchMatches = async () => {
    if (!user?.id) return;
    try {
      const response = await getFriends(user.id.toString());
      setMatches(response || []);
    } catch (error) {
      console.error("Failed to fetch matches:", error);
      toast.error("Failed to load your matches");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async () => {
    if (!user?.id || !selectedConversation) return;
    try {
      const response = await getMsgs(
        user.id.toString(),
        selectedConversation.other_user_id
      );
      setMessages(response || []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast.error("Failed to load messages");
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (!selectedConversation?.other_user_id) {
      toast.error("Please select a conversation");
      return;
    }

    const messageData = {
      sender_id: user.id,
      receiver_id: selectedConversation.other_user_id,
      content: newMessage.trim(),
      media_type: "text",
      timestamp: new Date().toISOString(),
    };

    // Optimistically update UI
    setMessages((prev) => [...prev, messageData]);
    setNewMessage("");

    // Emit message via socket
    socket.emit("direct_message", messageData);
  };

  // Auto-scroll to latest message
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Initialize on mount
  useEffect(() => {
    fetchMatches();
  }, [user?.id]);

  // Setup socket listeners
  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleIncomingMessage = (message) => {
      if (message.sender_id === selectedConversation?.other_user_id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receive_message", handleIncomingMessage);

    return () => {
      socket.off("receive_message", handleIncomingMessage);
    };
  }, [socket, user?.id, selectedConversation]);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (!user?.id) return;
      try {
        const response = await getConversations(user.id.toString());
        setConversations(response || []);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        toast.error("Failed to load conversations");
      }
    };
    loadConversations();
  }, [user?.id]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
    }
  }, [selectedConversation]);

  return (
    <div className="h-full px-4 py-6 bg-gray-100 dark:bg-gray-900 grid grid-cols-12 gap-4">
      {/* Conversations sidebar */}
      <div className="col-span-3  dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-lg">Conversations</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : conversations.length > 0 ? (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <img
                  src={conversation.other_profile_picture || userImg}
                  alt={conversation.other_username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {conversation.other_username}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {conversation.last_message || "No messages yet"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No conversations found
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="col-span-9  dark:bg-gray-800 rounded-lg shadow flex flex-col h-[calc(100vh-3rem)]">
        {" "}
        {selectedConversation ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <img
                src={selectedConversation.other_profile_picture || userImg}
                alt={selectedConversation.other_username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <h3 className="font-semibold">
                {selectedConversation.other_username}
              </h3>
            </div>

            {/* Messages container */}
            <div
              className="flex-1 p-4 overflow-y-auto space-y-3"
              style={{ maxHeight: "calc(100vh - 12rem)" }}
            >
              {" "}
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender_id === user.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                        msg.sender_id === user.id
                          ? "bg-blue-500 "
                          : "bg-gray-200 dark:bg-gray-700 text-gray-800 "
                      }`}
                    >
                      {msg.content}
                      <div className="text-xs mt-1 opacity-70 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              )}
              <div ref={messageContainerRef} />
            </div>

            {/* Message input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Send
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default MessagesPage;
