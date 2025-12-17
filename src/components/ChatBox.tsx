

"use client";
import { useState } from "react";

export default function ChatBox() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role:string, content:string}[]>([]);

  const sendMessage = async () => {
    if(!input) return;
    setMessages([...messages, {role:"user", content:input}]);
    const res = await fetch("/api/ai", { method:"POST", body:JSON.stringify({question: input}), headers:{"Content-Type":"application/json"}});
    const data = await res.json();
    setMessages([...messages, {role:"user", content:input}, {role:"ai", content:data.answer}]);
    setInput("");
  }

  return (
    <div className="border p-4 rounded w-full max-w-md">
      <div className="h-64 overflow-y-auto mb-2">
        {messages.map((m,i) => <p key={i} className={m.role==="user"?"text-right":"text-left"}>{m.content}</p>)}
      </div>
      <input value={input} onChange={e=>setInput(e.target.value)} className="border p-2 w-full" />
      <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 mt-2 rounded">Envoyer</button>
    </div>
  );
}

