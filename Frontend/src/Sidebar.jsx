import "./Sidebar.css";
import { useContext, useEffect, useCallback, useState } from "react";
import { MyContext } from "./MyContext.jsx";
import {v1 as uuidv1} from "uuid";

function Sidebar() {
    const {allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats} = useContext(MyContext);
    const [isOpen, setIsOpen] = useState(false); 

    // Fetch all threads
    const getAllThreads = useCallback(async () => {
        try {
            const response = await fetch("https://hellogpt-wr5v.onrender.com/api/thread");
            const res = await response.json();

            const filteredData = res.map((thread) => ({
                threadId: thread.threadId,
                title: thread.title,
            }));
            setAllThreads(filteredData);
        } catch(err) {
            console.log(err);
        }
    }, [setAllThreads]);

    useEffect(() => {
        getAllThreads();
    }, [getAllThreads, currThreadId]);

    // Create new chat
    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
        setIsOpen(false); 
    };

    // Change thread
    const changeThread = useCallback(async (newThreadId) => {
        setCurrThreadId(newThreadId);
        try {
            const response = await fetch(`https://hellogpt-wr5v.onrender.com/api/thread/${newThreadId}`);
            const res = await response.json();
            setPrevChats(res);
            setNewChat(false);
            setReply(null);
            setIsOpen(false); 
        } catch(err) {
            console.log(err);
        }
    }, [setCurrThreadId, setPrevChats, setNewChat, setReply]);

    // Delete thread
    const deleteThread = async (threadId) => {
        // console.log("FRONTEND DELETE:", threadId);
        try {
            const response = await fetch(`https://hellogpt-wr5v.onrender.com/api/thread/${threadId}`, {method: "DELETE"});
            const data = await response.json();
            // console.log(res);

            if (!response.ok) {
                console.error("Delete failed:", data.error);
                return;
            }

            //updated threads re-render
            setAllThreads((prev) => prev.filter((thread) => thread.threadId !== threadId));

            if(threadId === currThreadId) {
                createNewChat();
            }
        } catch(err) {
            console.error("Delete error:", err);
        }
    };

    return (
        <>
            {/* Hamburger button (only mobile) */}
            <button
                className="hamburger"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <i className="fa-solid fa-bars"></i>
            </button>

            {/* Sidebar with dynamic class */}
            <section className={`sidebar ${isOpen ? "active" : ""}`}>
                <div className="logodiv">
                    <img src="src/assets/blacklogo.png" alt="gpt logo" className="logo"></img>
                </div>
                <button onClick={createNewChat}>
                    <span>
                        <i className="fa-solid fa-pen-to-square"></i>&nbsp;&nbsp;
                        <span>New chat</span>
                    </span>
                </button>

                <ul className="history">
                    <p className="chatspara">Chats</p>
                    {
                        allThreads?.map((thread) => (
                            <li
                                key={thread.threadId}
                                onClick={(e) => changeThread(thread.threadId)}
                                className={thread.threadId === currThreadId ? "highlighted": ""}
                            >
                                {thread.title}
                                <i className="fa-solid fa-trash"
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        deleteThread(thread.threadId);
                                    }}
                                ></i>
                            </li>
                        ))
                    }
                </ul>
    
                <div className="sign">
                    <p>Made by Nilesh Sharma</p>
                </div>
            </section>
        </>
    );
}

export default Sidebar;