// "use client";
// import React, { useEffect, useState } from "react";
// import {
//   GoogleGenerativeAI,
//   HarmCategory,
//   HarmBlockThreshold,
// } from "@google/generative-ai";
// import ReactMarkdown from "react-markdown";
// import { firestore } from "../../firebase";
// import { getDoc, updateDoc, doc, collection, setDoc } from "firebase/firestore";
// import {
//   Divider,
//   FormControlLabel,
//   Switch,
//   createTheme,
//   ThemeProvider,
//   Button,
// } from "@mui/material";
// import { getAuth } from "firebase/auth";
// import { TbLogout2 } from "react-icons/tb";
// import { useRouter } from "next/navigation";

// const customScrollbarStyles = `
//   .custom-scrollbar::-webkit-scrollbar {
//     width: 8px;
//   }
//   .custom-scrollbar::-webkit-scrollbar-thumb {
//     background-color: #4a90e2;
//     border-radius: 6px;
//   }
//   .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//     background-color: #357abd;
//   }
//   .custom-scrollbar::-webkit-scrollbar-track {
//     background-color: #f0f0f0;
//     border-radius: 6px;
//   }
// `;

// export default function Page() {
//   const [messages, setMessages] = useState([]);
//   const [userInput, setUserInput] = useState("");
//   const [chat, setChat] = useState(null);
//   const [theme, setTheme] = useState("light");
//   const [error, setError] = useState("");
//   const [data, setData] = useState({});
//   const [chatInitialized, setChatInitialized] = useState(false);
//   const [historyMessages, setHistoryMessages] = useState([]);
//   const router = useRouter();

//   const auth = getAuth();
//   const user = auth.currentUser;

//   const API_KEY = "AIzaSyDYmligr0eUjKVNQqXJRKfFacWbWSiaPN0";
//   const genAI = new GoogleGenerativeAI(API_KEY);

//   const model = genAI.getGenerativeModel({
//     model: "gemini-1.5-flash",
//   });

//   useEffect(() => {
//     const styleSheet = document.createElement("style");
//     styleSheet.type = "text/css";
//     styleSheet.innerText = customScrollbarStyles;
//     document.head.appendChild(styleSheet);

//     // Cleanup: Remove the style element when the component unmounts
//     return () => {
//       document.head.removeChild(styleSheet);
//     };
//   }, []);

//   const generationConfig = {
//     temperature: 1,
//     topP: 0.95,
//     topK: 64,
//     maxOutputTokens: 8192,
//     responseMimeType: "text/plain",
//   };

//   const safetySettings = [
//     {
//       category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//     },
//     {
//       category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//     },
//     {
//       category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
//       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//     },
//     {
//       category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
//       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//     },
//   ];

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const response = await fetch("/api/data");
//         if (!response.ok) throw new Error("Failed to fetch data");
//         const result = await response.json();
//         console.log("Fetched data:", result);
//         console.log("User id", user?.uid);

//         setData(result);
//       } catch (err) {
//         console.error("Failed to load data:", err);
//         setError("Failed to load data.");
//       }
//     };
//     loadData();
//   }, []);

//   const retrieveInformation = (userInput) => {
//     const file1Data = Array.isArray(data.file1) ? data.file1 : [];
//     const file2Data = Array.isArray(data.file2) ? data.file2 : [];
//     const combinedData = [...file1Data, ...file2Data];

//     console.log("Combined Data:", combinedData);

//     const lowerCaseInput = userInput.toLowerCase();
//     console.log("User Input (lowercase):", lowerCaseInput);

//     const filteredData = combinedData.filter((item) => {
//       const text = item.name ? item.name.toLowerCase() : "";
//       console.log("Item Text (lowercase):", text);
//       return text.includes(lowerCaseInput);
//     });

//     console.log("Filtered Data:", filteredData);

//     return filteredData;
//   };

//   async function updateChatHistory(newMessages) {
//     if (!user || !user.uid) {
//       console.error("User is not authenticated or UID is missing");
//       return;
//     }

//     try {
//       const docRef = doc(collection(firestore, "UsersHistory"), user.uid);

//       // Fetch the existing chat history
//       const docSnap = await getDoc(docRef);
//       let historyArray = [];

//       if (docSnap.exists()) {
//         historyArray = docSnap.data().history || [];
//       }

//       // Create a Map to filter out old messages
//       const existingMessagesMap = new Map(
//         historyArray.map((msg) => [
//           `${msg.timestamp.toDate().getTime()}-${msg.text}`,
//           msg,
//         ])
//       );

//       // Append only the latest new messages
//       const uniqueMessages = newMessages.filter((newMsg) => {
//         const key = `${newMsg.timestamp.getTime()}-${newMsg.text}`;
//         return !existingMessagesMap.has(key);
//       });

//       if (uniqueMessages.length > 0) {
//         historyArray = [...historyArray, ...uniqueMessages];
//         await setDoc(docRef, { history: historyArray });
//         console.log("Chat history successfully updated!");
//       }
//     } catch (e) {
//       console.error("Error updating chat history: ", e);
//     }
//   }

//   const handleSendMessage = async () => {
//     try {
//       const userMessage = {
//         text: userInput,
//         role: "user",
//         timestamp: new Date(),
//       };

//       const newMessages = [...messages, userMessage];
//       setMessages(newMessages);
//       setUserInput("");

//       const retrievedData = retrieveInformation(userInput);
//       console.log("Retrieved Data", retrievedData);

//       const context = retrievedData
//         .map((item) => {
//           const { name, price, rpm, noise_level } = item;
//           return `name: ${name}, price: ${price}, rpm= ${rpm}, noise_level= ${noise_level}`;
//         })
//         .join("\n");

//       console.log("Context:", context);

//       if (chat) {
//         const contextMessages = newMessages.map((msg) => ({
//           role: msg.role === "user" ? "user" : "model",
//           parts: [{ text: msg.text || "" }],
//         }));

//         const result = await chat.sendMessage(userInput, {
//           context,
//           history: contextMessages,
//         });
//         const botMessage = {
//           text: result.response.text(),
//           role: "model",
//           timestamp: new Date(),
//         };

//         const updatedMessages = [...newMessages, botMessage];
//         setMessages(updatedMessages);

//         // Update Firebase with both user and bot messages
//         await updateChatHistory([userMessage, botMessage]);
//       }
//     } catch (error) {
//       console.error("Error sending message:", error);
//       setError("Failed to send message. Please try again.");
//     }
//   };

//   useEffect(() => {
//     const initChat = async () => {
//       if (!user || !user.uid || chatInitialized) {
//         return;
//       }

//       try {
//         const docRef = doc(collection(firestore, "UsersHistory"), user.uid);
//         const docSnap = await getDoc(docRef);

//         let historyarray = docSnap.exists() ? docSnap.data().history || [] : [];

//         const chatHistory = historyarray.map((msg) => ({
//           role: msg.role === "bot" ? "model" : msg.role,
//           parts: [{ text: msg.text || "" }],
//         }));

//         console.log("Chat history being sent:", chatHistory);

//         const newChat = await model.startChat({
//           history: chatHistory,
//           generationConfig,
//           safetySettings,
//         });

//         setChat(newChat);
//         setChatInitialized(true); // Set chat as initialized
//         setHistoryMessages(
//           chatHistory.map((msg) => ({
//             // Set chat history state
//             text: msg.parts[0].text,
//             role: msg.role,
//             timestamp: new Date(), // Placeholder, you might need to adjust based on your data
//           }))
//         );
//       } catch (error) {
//         console.error("Failed to initialize chat:", error);
//         setError("Failed to initialize chat. Please try again.");
//       }
//     };

//     initChat();
//   }, [user, chatInitialized]); // Use chatInitialized as a dependency

//   const handleThemeChange = () => {
//     setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
//   };

//   const getThemeColors = () => {
//     switch (theme) {
//       case "light":
//         return {
//           primary: "bg-gradient-to-r from-[#9e9e9e] to-[#fafafa]", // Gradient background for dark theme
//           secondary: "bg-gray-100",
//           accent: "bg-blue-500",
//           text: "text-gray-800",
//           sbgbtn: "bg-gray-900",
//           sbtn: "bg-white",
//           bmsg: "#033363",
//         };
//       case "dark":
//         return {
//           primary: "bg-gradient-to-r from-[#033363] to-[#021F3B]",
//           secondary: "bg-gray-800",
//           accent: "bg-yellow-500",
//           text: "text-gray-100",
//           sbgbtn: "bg-gradient-to-r from-[#033363] to-[#021F3B]",
//           sbtn: "bg-white",
//           bmsg: "#021F3B",
//         };
//       default:
//         return {
//           primary: "bg-gradient-to-r from-[#9e9e9e] to-[#fafafa]",
//           secondary: "bg-gray-100",
//           accent: "bg-blue-500",
//           text: "text-gray-800",
//           sbgbtn: "bg-gray-900",
//           sbtn: "bg-white",
//           bmsg: "#033363",
//         };
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const handleLogOut = async () => {
//     // console.log("Logout button clicked"); // Add this line to check if the function is being called
//     try {
//       await auth.signOut();
//       // console.log("User logged out successfully");
//       router.push("/login");
//     } catch (error) {
//       console.error("Error signing out:", error.message);
//     }
//   };

//   const { primary, secondary, accent, text, sbtn, sbgbtn, bmsg } =
//     getThemeColors();

//   return (
//     <div className={`flex h-screen p-4 ${primary}`}>
//       <div className="flex-1 mr-4">
//         {/* Chat History Section */}
//         <div
//           className={`flex flex-col h-full p-4 ${primary}`}
//           style={{
//             borderRadius: "10px",
//           }}
//         >
//           <div className={`flex justify-between items-center mb-4 ${primary}`}>
//             <h1 className={`text-2xl font-bold ${text}`}>Chat</h1>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 className="sr-only"
//                 checked={theme === "dark"}
//                 onChange={handleThemeChange}
//               />
//               <div
//                 className={`w-11 h-5 ${sbgbtn} rounded-full shadow-inner`}
//               ></div>
//               <div
//                 className={`absolute w-6 h-6 ${sbtn} rounded-full shadow transform transition-transform duration-300 ${
//                   theme === "dark" ? "translate-x-5" : "translate-x-0"
//                 }`}
//               ></div>
//             </label>
//             <Button
//               variant="standard"
//               onClick={handleLogOut}
//               sx={{
//                 width: "5vh",
//                 height: "5vh",
//               }}
//             >
//               <TbLogout2
//                 style={{
//                   width: "100%",
//                   height: "100%",
//                 }}
//               />
//             </Button>
//           </div>

// <div
//   className={`flex-1 overflow-y-auto custom-scrollbar ${primary} rounded-md p-2`}
// >
//   {messages.map((msg, index) => (
//     <div
//       key={index}
//       className={`mb-4 ${
//         msg.role === "user" ? "text-right" : "text-left"
//       }`}
//     >
//       <ReactMarkdown
//         className={`inline-block p-2 rounded-lg ${
//           msg.role === "user" ? `${text}` : ` ${text}`
//         }`}
//       >
//         {msg.text}
//       </ReactMarkdown>
//       <p className={`text-xs ${text} mt-1`}>
//         {msg.role === "model" ? "Bot" : "You"} -{" "}
//         {msg.timestamp.toLocaleTimeString()}
//       </p>
//     </div>
//   ))}
// </div>
//           <Divider sx={{ my: 2, backgroundColor: "white", height: "2px" }} />
//           <textarea
//             className={`w-full p-2 border border-gray-300 rounded-lg ${text}`}
//             rows="3"
//             value={userInput}
//             onChange={(e) => setUserInput(e.target.value)}
//             onKeyDown={handleKeyPress}
//             style={{
//               backgroundColor: "transparent",
//             }}
//           />
//           <button
//             className={`mt-2 p-2 bg-blue-500 text-white rounded-lg ${sbgbtn}
// `}
//             onClick={handleSendMessage}
//             style={{
//               borderRadius: "12px",
//               border: "2px solid white",
//             }}
//           >
//             Send
//           </button>
//         </div>
//       </div>
//       <div className="flex-1 mr-4">
//         {/* Chat History Section */}
// <div
//   className={`flex flex-col h-full p-4 ${primary} `}
//   style={{
//     borderRadius: "10px",
//   }}
// >
// <h1
//   className={`text-2xl font-bold ${text}`}
//   style={{
//     textAlign: "center",
//   }}
// >
//   History
// </h1>
// <br />
// <Divider
//   style={{
//     backgroundColor: "white",
//     height: "2px",
//   }}
// />
// <br />
// {/* I want to display chat history which is in the firebase */}
// {historyMessages.length > 0 && (
//   <div className="overflow-y-auto custom-scrollbar">
//     {historyMessages.map((msg, index) => (
//       <div
//         key={index}
//         className={`mb-4 ${
//           msg.role === "user" ? "text-right" : "text-left"
//         }`}
//       >
//         <ReactMarkdown
//           className={`inline-block p-2 rounded-lg ${
//             msg.role === "user" ? `${text}` : ` ${text}`
//           }`}
//         >
//           {msg.text}
//         </ReactMarkdown>
//         <p className={`text-xs ${text} mt-1`}>
//           {msg.role === "model" ? "Bot" : "You"} -{" "}
//           {msg.timestamp.toLocaleTimeString()}
//         </p>
//       </div>
//     ))}
//   </div>
// )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import React, { useEffect, useState } from "react";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import { firestore } from "../../firebase";
import { getDoc, setDoc, doc, collection } from "firebase/firestore";
import { Divider, Button } from "@mui/material";
import { getAuth } from "firebase/auth";
import { TbLogout2 } from "react-icons/tb";
import { useRouter } from "next/navigation";

const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #7b1fa2;
    border-radius: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #6a1b9a;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background-color: #f0f0f0;
    border-radius: 6px;
  }
`;

export default function Page() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [chat, setChat] = useState(null);
  const [error, setError] = useState("");
  const [data, setData] = useState({});
  const [chatInitialized, setChatInitialized] = useState(false);
  const [historyMessages, setHistoryMessages] = useState([]);
  const router = useRouter();

  const auth = getAuth();
  const user = auth.currentUser;

  const API_KEY = "AIzaSyDYmligr0eUjKVNQqXJRKfFacWbWSiaPN0";
  const genAI = new GoogleGenerativeAI(API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = customScrollbarStyles;
    document.head.appendChild(styleSheet);

    // Cleanup: Remove the style element when the component unmounts
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/api/data");
        if (!response.ok) throw new Error("Failed to fetch data");
        const result = await response.json();
        console.log("Fetched data:", result);
        console.log("User id", user?.uid);

        setData(result);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load data.");
      }
    };
    loadData();
  }, []);

  const retrieveInformation = (userInput) => {
    const file1Data = Array.isArray(data.file1) ? data.file1 : [];
    const file2Data = Array.isArray(data.file2) ? data.file2 : [];
    const combinedData = [...file1Data, ...file2Data];

    console.log("Combined Data:", combinedData);

    const lowerCaseInput = userInput.toLowerCase();
    console.log("User Input (lowercase):", lowerCaseInput);

    const filteredData = combinedData.filter((item) => {
      const text = item.name ? item.name.toLowerCase() : "";
      console.log("Item Text (lowercase):", text);
      return text.includes(lowerCaseInput);
    });

    console.log("Filtered Data:", filteredData);

    return filteredData;
  };

  async function updateChatHistory(newMessages) {
    if (!user || !user.uid) {
      console.error("User is not authenticated or UID is missing");
      return;
    }

    try {
      const docRef = doc(collection(firestore, "UsersHistory"), user.uid);

      // Fetch the existing chat history
      const docSnap = await getDoc(docRef);
      let historyArray = [];

      if (docSnap.exists()) {
        historyArray = docSnap.data().history || [];
      }

      // Create a Map to filter out old messages
      const existingMessagesMap = new Map(
        historyArray.map((msg) => [
          `${msg.timestamp.toDate().getTime()}-${msg.text}`,
          msg,
        ])
      );

      // Append only the latest new messages
      const uniqueMessages = newMessages.filter((newMsg) => {
        const key = `${newMsg.timestamp.getTime()}-${newMsg.text}`;
        return !existingMessagesMap.has(key);
      });

      if (uniqueMessages.length > 0) {
        historyArray = [...historyArray, ...uniqueMessages];
        await setDoc(docRef, { history: historyArray });
        console.log("Chat history successfully updated!");
      }
    } catch (e) {
      console.error("Error updating chat history: ", e);
    }
  }

  const handleSendMessage = async () => {
    try {
      const userMessage = {
        text: userInput,
        role: "user",
        timestamp: new Date(),
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setUserInput("");

      const retrievedData = retrieveInformation(userInput);
      console.log("Retrieved Data", retrievedData);

      const context = retrievedData
        .map((item) => {
          const { name, price, rpm, noise_level } = item;
          return `name: ${name}, price: ${price}, rpm= ${rpm}, noise_level= ${noise_level}`;
        })
        .join("\n");

      console.log("Context:", context);

      if (chat) {
        const contextMessages = newMessages.map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text || "" }],
        }));

        const result = await chat.sendMessage(userInput, {
          context,
          history: contextMessages,
        });
        const botMessage = {
          text: result.response.text(),
          role: "model",
          timestamp: new Date(),
        };

        const updatedMessages = [...newMessages, botMessage];
        setMessages(updatedMessages);

        // Update Firebase with both user and bot messages
        await updateChatHistory([userMessage, botMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    }
  };

  useEffect(() => {
    const initChat = async () => {
      if (!user || !user.uid || chatInitialized) {
        return;
      }

      try {
        const docRef = doc(collection(firestore, "UsersHistory"), user.uid);
        const docSnap = await getDoc(docRef);

        let historyarray = docSnap.exists() ? docSnap.data().history || [] : [];

        const chatHistory = historyarray.map((msg) => ({
          role: msg.role === "bot" ? "model" : msg.role,
          parts: [{ text: msg.text || "" }],
        }));

        console.log("Chat history being sent:", chatHistory);

        const newChat = await model.startChat({
          history: chatHistory,
          generationConfig,
          safetySettings,
        });

        setChat(newChat);
        setChatInitialized(true); // Set chat as initialized
        setHistoryMessages(
          chatHistory.map((msg) => ({
            // Set chat history state
            text: msg.parts[0].text,
            role: msg.role,
            timestamp: new Date(), // Placeholder, you might need to adjust based on your data
          }))
        );
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        setError("Failed to initialize chat. Please try again.");
      }
    };

    initChat();
  }, [user, chatInitialized]); // Use chatInitialized as a dependency

  const handleLogOut = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  // Dark theme styles
  const darkThemeColors = {
    primary: "bg-purple-400",
    text: "text-white",
    // bg: "bg-black-100",
    bg: "bg-gradient-to-r from-[#4a148c] to-[#212121]", // Gradient background for dark theme
  };

  return (
    <div
      className={`w-full min-h-screen ${darkThemeColors.bg} ${darkThemeColors.text}`}
    >
      <div className="p-4">
        <Button
          onClick={handleLogOut}
          variant="outlined"
          startIcon={<TbLogout2 />}
          className="text-white border-white hover:bg-white hover:text-black"
        >
          Log Out
        </Button>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            className={`my-4 p-4 ${darkThemeColors.primary} rounded-lg`}
            style={{
              width: "50%",
            }}
          >
            <h1 className="text-2xl font-bold">Chat with AI</h1>

            <div
              className={`overflow-y-auto custom-scrollbar h-80 ${darkThemeColors.primary} rounded-md p-2`}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    msg.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <ReactMarkdown
                    className={`inline-block p-2 rounded-lg ${
                      msg.role === "user"
                        ? `${darkThemeColors.bg} ${darkThemeColors.text}`
                        : `${darkThemeColors.bg} ${darkThemeColors.text}`
                    }`}
                  >
                    {msg.text}
                  </ReactMarkdown>
                  <p className={`text-xs ${darkThemeColors.text} mt-1`}>
                    {msg.role === "model" ? "Bot" : "You"} -{" "}
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
            <Divider className="my-4" />
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows="3"
              className={`w-full p-2 rounded-lg ${darkThemeColors.bg}  text-white border border-gray-600`}
              placeholder="Type your message..."
            />
            <Button
              onClick={handleSendMessage}
              variant="contained"
              className={`w-full mt-2 ${darkThemeColors.bg}`}
            >
              Send
            </Button>
          </div>
          <div
            className={`my-4 p-4 ${darkThemeColors.primary} rounded-lg`}
            style={{
              width: "40%",
              marginLeft: "20px",
            }}
          >
            <h1
              className={`text-2xl font-bold ${darkThemeColors.text}`}
              style={{
                textAlign: "center",
              }}
            >
              History
            </h1>
            <br />
            <Divider
              style={{
                backgroundColor: "white",
                height: "2px",
              }}
            />
            <br />
            {/* I want to display chat history which is in the firebase */}
            {historyMessages.length > 0 && (
              <div className="overflow-y-auto h-80 custom-scrollbar">
                {historyMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      msg.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    <ReactMarkdown
                      className={`inline-block p-2 rounded-lg ${
                        msg.role === "user"
                          ? `${darkThemeColors.bg} ${darkThemeColors.text}`
                          : `${darkThemeColors.bg} ${darkThemeColors.text}`
                      }`}
                    >
                      {msg.text}
                    </ReactMarkdown>
                    <p className={`text-xs ${darkThemeColors.text} mt-1`}>
                      {msg.role === "model" ? "Bot" : "You"} -{" "}
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
