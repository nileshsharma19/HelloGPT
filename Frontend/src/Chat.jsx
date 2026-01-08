import "./Chat.css";
import { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
    const {newChat, prevChats, reply} = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);

    const bottomRef = useRef(null); 

    useEffect(() => {
        if(reply === null) {
            setLatestReply(null); 
            return;
        }

        if(!prevChats?.length) return;

        const words = reply.split(" ");
        let idx = 0;
        const interval = setInterval(() => {
            setLatestReply(words.slice(0, idx + 1).join(" "));

            idx++;
            if (idx >= words.length) clearInterval(interval);
        }, 40);

        return () => clearInterval(interval);
    }, [prevChats, reply]);

    // Auto-scroll to bottom whenever prevChats or latestReply changes
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [prevChats, latestReply]);


    return (
        <div className ="chatContainer">
            {newChat && <h1 className="welcomeText">Start a New Chat!</h1>}

            <div className="chatWrapper">
                <div className="chats">
                    {prevChats?.slice(0, -1).map((chat, idx) => (
                        <div
                            key={idx}
                            className={chat.role === "user" ? "userDiv" : "gptDiv"}
                        >
                            {chat.role === "user" ? (
                                <p className="userMessage">{chat.content}</p>
                            ) : (
                            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                {chat.content}
                            </ReactMarkdown>
                            )}
                        </div>
                    ))}

                    
                    {/* Show assistant's last message */}
                    {prevChats.length > 0 && (
                        <div className="gptDiv">
                            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                {latestReply || prevChats[prevChats.length - 1].content}
                            </ReactMarkdown>
                        </div>
                    )}

                    {/* Always scroll target at the very bottom */}
                    <div ref={bottomRef} />
                      
                </div>
            </div>
        </div>
    );
}

export default Chat;