import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
    const {prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat, newChat} = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Ref for textarea  field
    const inputRef = useRef(null);

    // Always focus input on mount, new chat, existing chat change
    useEffect(() => {
        inputRef.current?.focus();
    }, [newChat, currThreadId]);  

    // Fetch assistant reply
    const getReply = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setNewChat(false);

        try {
            const response = await fetch("http://localhost:8080/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: prompt,
                    threadId: currThreadId,
                }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const res = await response.json();
            setReply(res.reply);
        } catch(err) {
            console.log(err);
        } finally {
            setLoading(false);
        }

        // Keep focus after sending
        inputRef.current?.focus();
    };

    //Append new chat to prevChats
    useEffect(() => {
        if(prompt && reply) {
            setPrevChats((prevChats) => [
                ...prevChats,
                { role: "user", content: prompt },
                { role: "assistant", content: reply },
            ]);
            setPrompt("");
            inputRef.current?.focus(); 
        }
    }, [reply]);

    // Dropdown toggle
    const handleProfileClick = () => setIsOpen((prev) => !prev);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleInput = (e) => {
        const el = inputRef.current;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 180)}px`; 
        setPrompt(e.target.value);
    };

    return (
        <div className="chatWindow">
            {/* Top Navbar */}
            <div className="navbar">
                <span>
                    HelloGPT 
                </span>
                <div className="userIconDiv" onClick={handleProfileClick}>
                    <span className="userIcon">
                        <i className="fa-solid fa-user"></i>
                    </span>
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="dropDown" ref={dropdownRef}>
                <div className="dropDownItem">
                    <i className="fa-solid fa-gear"></i> Settings
                </div>
                <div className="dropDownItem">
                    <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan
                </div>
                <div className="dropDownItem">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                </div>
                </div>
            )}

            {/* Chat Component */}
            <Chat />

            {/* Loader */}
            {loading && (
                <div className="loader">
                    <ScaleLoader 
                        color="#fff" 
                        loading={loading} 
                    />
                </div>
            )}
            
            {/* Input Area */}
            <div className="chatInput">
                <div className="inputBox">
                    <textarea
                        placeholder="Ask anything..."
                        rows={1}
                        ref={inputRef} 
                        value={prompt}
                        onChange={handleInput}  
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), getReply())}
                    />

                    <div id="submit" onClick={getReply}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </div>
                </div>
                <p className="info">
                    HelloGPT can make mistakes. Double-check important info.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;