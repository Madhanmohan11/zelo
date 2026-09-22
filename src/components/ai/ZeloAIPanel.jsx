import React, { useState, useRef, useEffect } from 'react'
import { X, Send, Trash2, Bot, ArrowDown, Loader2 } from 'lucide-react'
import zeloOrbitSvg from '../../assets/zelo-orbit.svg'
import { useAI } from '../../context/AIContext'
import { AIMessage } from './AIMessage'
import { AIQuickActions } from './AIQuickActions'
import { AIConfirmation } from './AIConfirmation'

export const ZeloAIPanel = () => {
  const {
    isAIPanelOpen,
    closeAIPanel,
    messages,
    isLoading,
    pendingAction,
    sendMessage,
    confirmAction,
    cancelAction,
    clearHistory
  } = useAI()

  const [input, setInput] = useState('')
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto scroll to bottom of chat when new message arrives
  useEffect(() => {
    if (isAIPanelOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading, pendingAction, isAIPanelOpen])

  // Focus input on panel open
  useEffect(() => {
    if (isAIPanelOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isAIPanelOpen])

  if (!isAIPanelOpen) return null

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const text = input.trim()
    setInput('')
    sendMessage(text)
  }

  const handleSelectQuickAction = (promptText) => {
    setInput(promptText)
    inputRef.current?.focus()
  }

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity animate-in fade-in">
      <div className="w-full max-w-lg bg-white h-[100dvh] sm:h-[85vh] rounded-none sm:rounded-3xl border-0 sm:border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
        
        {/* PANEL HEADER */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-emerald-400/40 shrink-0 p-1.5">
              <img src={zeloOrbitSvg} alt="Z-AI" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                ZELO AI
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Assistant
                </span>
              </h3>
              <p className="text-xs font-semibold text-emerald-100/80">Your intelligent personal life companion</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={clearHistory}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-white/10 transition-colors cursor-pointer"
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={closeAIPanel}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close ZELO AI"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* QUICK SUGGESTIONS PILLS */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-3 py-1.5 shrink-0">
          <AIQuickActions onSelectAction={handleSelectQuickAction} />
        </div>

        {/* CHAT MESSAGES STREAM */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3 max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-3xl bg-emerald-100 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-inner p-2.5">
                <img src={zeloOrbitSvg} alt="Z-AI" className="w-full h-full object-contain" />
              </div>
              <h4 className="text-base font-black text-slate-900 tracking-tight">How can ZELO AI help you today?</h4>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                Log expenses effortlessly, manage tasks, set reminders, or get an overview of your daily progress using simple words.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                💡 Try saying: <span className="italic">"Add an expense of ₹150 for lunch"</span>
              </div>
            </div>
          ) : (
            messages.map((msg) => <AIMessage key={msg.id || msg.created_at} message={msg} />)
          )}

          {/* ACTIVE ACTION CONFIRMATION CARD */}
          {pendingAction && (
            <AIConfirmation
              pendingAction={pendingAction}
              onConfirm={confirmAction}
              onCancel={cancelAction}
              isLoading={isLoading}
            />
          )}

          {/* LOADING INDICATOR */}
          {isLoading && !pendingAction && (
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-500 py-2 px-3 bg-white border border-slate-200/80 rounded-2xl w-fit shadow-2xs animate-pulse">
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>ZELO AI is thinking...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* BOTTOM INPUT BAR */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200/90 shrink-0 pb-safe">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask ZELO AI or log an expense..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-100 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white transition-all cursor-pointer shrink-0 shadow-md ${
                input.trim() && !isLoading
                  ? 'bg-emerald-500 hover:bg-emerald-600 active:scale-95 shadow-emerald-500/30'
                  : 'bg-slate-300 cursor-not-allowed shadow-none'
              }`}
              title="Send message"
            >
              <Send className="w-5 h-5 stroke-[2.5]" />
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
