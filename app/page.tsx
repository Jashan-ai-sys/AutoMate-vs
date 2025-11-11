"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Plus, X, Search, Mic, Settings } from "lucide-react"

interface Tab {
  id: number
  title: string
}

interface Message {
  type: "user" | "assistant"
  content: string
}

export default function BrowserApp() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: 1, title: "New Tab" }])
  const [activeTabId, setActiveTabId] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { type: "assistant", content: "Hi! I'm your VS Automation Assistant. Ask me anything about this page or the web." },
  ])
  const [inputValue, setInputValue] = useState("")
  const [addressBar, setAddressBar] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isListeningAddress, setIsListeningAddress] = useState(false)
  const [isListeningSearch, setIsListeningSearch] = useState(false)
  const [isListeningChat, setIsListeningChat] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const tabCounter = useRef(1)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = "en-US"
      }
    }
  }, [])

  const handleSpeechRecognition = (callback: (text: string) => void, setListening: (state: boolean) => void) => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in your browser")
      return
    }

    if (isListeningAddress || isListeningSearch || isListeningChat) {
      recognitionRef.current.abort()
      setListening(false)
      return
    }

    setListening(true)
    recognitionRef.current.onstart = () => {
      console.log("[v0] Speech recognition started")
    }

    recognitionRef.current.onresult = (event: any) => {
      let transcript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      callback(transcript)
      console.log("[v0] Recognized text:", transcript)
    }

    recognitionRef.current.onerror = (event: any) => {
      console.log("[v0] Speech recognition error:", event.error)
      setListening(false)
    }

    recognitionRef.current.onend = () => {
      setListening(false)
    }

    recognitionRef.current.start()
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const addTab = () => {
    tabCounter.current += 1
    const newTab = { id: tabCounter.current, title: `New Tab ${tabCounter.current}` }
    setTabs([...tabs, newTab])
    setActiveTabId(newTab.id)
  }

  const closeTab = (id: number) => {
    const newTabs = tabs.filter((tab) => tab.id !== id)
    setTabs(newTabs)
    if (activeTabId === id && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id)
    }
  }

  const sendMessage = () => {
    if (!inputValue.trim()) return

    const userMsg: Message = { type: "user", content: inputValue }
    setMessages((prev) => [...prev, userMsg])
    setInputValue("")

    setTimeout(() => {
      const assistantMsg: Message = {
        type: "assistant",
        content: `I understand you're asking about "${inputValue}". This is a demo response. In a real implementation, I would provide intelligent insights based on your query.`,
      }
      setMessages((prev) => [...prev, assistantMsg])
    }, 800)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  return (
    <div className="h-screen flex flex-col bg-black text-gray-100">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-red-900/30 px-4 py-3 flex items-center gap-3 shadow-lg">
        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
          <Search size={18} className="text-gray-400" />
        </button>
        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Address Bar */}
        <div className="flex-1 flex items-center bg-zinc-800 rounded-full px-4 py-2 border border-zinc-700 hover:border-red-700/50 transition-colors focus-within:border-red-600">
          <input
            type="text"
            value={addressBar}
            onChange={(e) => setAddressBar(e.target.value)}
            placeholder="Enter URL or ask AI..."
            className="bg-transparent flex-1 outline-none text-sm"
          />
          <button
            onClick={() =>
              handleSpeechRecognition((text) => setAddressBar((prev) => prev + " " + text), setIsListeningAddress)
            }
            className={`p-1 ml-2 rounded transition-colors ${
              isListeningAddress ? "bg-red-600 text-white" : "text-gray-500 hover:text-gray-300"
            }`}
            title="Click to speak"
          >
            <Mic size={16} />
          </button>
        </div>

        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
          <Settings size={18} className="text-gray-400" />
        </button>
        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
          U
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-2 px-4 py-2 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg border-b-2 transition-all cursor-pointer whitespace-nowrap group ${
              activeTabId === tab.id
                ? "bg-zinc-800 border-red-600 text-gray-50"
                : "bg-zinc-900/30 border-transparent text-gray-400 hover:bg-zinc-800/50"
            }`}
          >
            <span className="text-sm">{tab.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeTab(tab.id)
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button onClick={addTab} className="p-1 hover:bg-zinc-700 rounded transition-colors ml-auto flex-shrink-0">
          <Plus size={18} className="text-gray-400" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Browser View */}
        <div className="flex-1 overflow-y-auto">
          <div className="h-full flex flex-col items-center justify-center px-6 text-center">
            {/* Logo Section */}
            <div className="mb-12">
              <div className="text-6xl mb-4">⚙️</div>
              <h1 className="text-4xl font-bold text-white mb-2">AUTOMATE-VS</h1>
              <p className="text-gray-400 text-lg">AI-Powered Browsing Experience</p>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-2xl mb-12">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Search size={20} className="text-gray-500" />
                </div>
                <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-full pr-4 focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-600/20 transition-all">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search or enter URL..."
                    className="flex-1 bg-transparent pl-12 pr-2 py-3 text-gray-50 placeholder-gray-500 focus:outline-none"
                  />
                  <button
                    onClick={() =>
                      handleSpeechRecognition(
                        (text) => setSearchQuery((prev) => prev + " " + text),
                        setIsListeningSearch,
                      )
                    }
                    className={`p-2 rounded transition-colors ${
                      isListeningSearch ? "bg-red-600 text-white" : "text-gray-500 hover:text-gray-300"
                    }`}
                    title="Click to speak"
                  >
                    <Mic size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="w-full max-w-3xl">
              <h3 className="text-gray-400 text-sm font-semibold mb-6 tracking-wide">QUICK ACTIONS</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Search, label: "Search" },
                  { icon: Settings, label: "Settings" },
                  { icon: Mic, label: "Voice" },
                  { icon: Plus, label: "New Tab" },
                ].map((action, idx) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={idx}
                      onClick={() => setSidebarOpen(true)}
                      className="group relative overflow-hidden rounded-xl p-6 bg-zinc-800 border border-zinc-700 hover:border-red-600/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-red-900/20"
                    >
                      <div className="relative z-10 flex flex-col items-center gap-3">
                        <Icon size={28} className="text-gray-300 group-hover:text-red-500 transition-colors" />
                        <span className="text-sm font-medium text-gray-300">{action.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Open Assistant Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="mt-12 px-8 py-3 bg-red-600 hover:bg-red-700 rounded-full font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-600/30 hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Settings size={18} />
              Open VS Automation Assistant
            </button>
          </div>
        </div>

        {/* AI Sidebar */}
        <div
          className={`fixed inset-0 z-40 transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className={`absolute right-0 top-0 h-full w-full max-w-md bg-zinc-900 border-l border-red-900/30 shadow-2xl flex flex-col transform transition-transform duration-300 ${
              sidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar Header */}
            <div className="bg-red-900/20 border-b border-red-900/30 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2 text-red-400">
                <span className="text-xl">✨</span> VS Assistant
              </h3>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-zinc-700 rounded transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Chat Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-4 py-3 rounded-lg ${
                      msg.type === "user"
                        ? "bg-red-600 text-white rounded-br-none"
                        : "bg-zinc-800 text-gray-200 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-zinc-800 p-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask AI..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-colors"
                />
                <button
                  onClick={() =>
                    handleSpeechRecognition((text) => setInputValue((prev) => prev + " " + text), setIsListeningChat)
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    isListeningChat ? "bg-red-600 text-white" : "bg-zinc-700 text-gray-400 hover:text-gray-300"
                  }`}
                  title="Click to speak"
                >
                  <Mic size={18} />
                </button>
                <button
                  onClick={sendMessage}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
