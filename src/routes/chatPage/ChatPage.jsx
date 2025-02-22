import "./chatPage.css";
import NewPrompt from "../../components/newPrompt/NewPrompt";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import Markdown from "react-markdown";
import { IKImage } from "imagekitio-react";

const ChatPage = () => {
  const path = useLocation().pathname;
  const chatId = path.split("/").pop();

  const { isPending, error, data } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  // Scroll to bottom whenever data changes
  const scrollToBottom = () => {
    const chatContainer = document.getElementById("chatContainer");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  // Trigger scroll to bottom on new data load or update
  if (data) {
    scrollToBottom();
  }

  return (
    <div className="chatPage">
      <div className="wrapper">
        <div className="chat" id="chatContainer">
          {isPending ? (
            "Loading..."
          ) : error ? (
            "Something went wrong!"
          ) : (
            data?.history?.map((message, i) => (
              <div key={i}>
                {/* Display image if available */}
                {message.img && (
                  <IKImage
                    urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                    path={message.img}
                    height="300"
                    width="400"
                    transformation={[{ height: 300, width: 400 }]}
                    loading="lazy"
                    lqip={{ active: true, quality: 20 }}
                  />
                )}
                <div className="container">
                {/* Display message text if available */}
                {message.parts && message.parts[0]?.text && (
                  <div
                    className={
                      message.role === "user" ? "message user" : "message"
                    }
                  >
                    <Markdown>{message.parts[0].text}</Markdown>
                  </div>
                )}

                {/* Display video if available */}
                {message.video && (
                  <div className="video-container">
                    <iframe
                      id="youtube-iframe"
                      width="560"
                      height="315"
                      src={`${message.video.url.replace(
                        "watch?v=",
                        "embed/"
                      )}?enablejsapi=1`}
                      title={message.video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
                </div>
              </div>
            ))
          )}
          {/* Ensure the last message is visible */}
          {data && <NewPrompt data={data} />}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;