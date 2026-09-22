import React from 'react'
import { User } from 'lucide-react'
import zeloOrbitSvg from '../../assets/zelo-orbit.svg'
import { AIActionCard } from './AIActionCard'

export const AIMessage = ({ message }) => {
  const isUser = message.sender === 'user'
  const timeStr = message.created_at
    ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className={`flex gap-2.5 my-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}>
      {/* Z-AI Avatar Icon for assistant */}
      {!isUser && (
        <div className="w-8 h-8 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25 mt-0.5 border border-white p-1">
          <img src={zeloOrbitSvg} alt="Z-AI" className="w-full h-full object-contain" />
        </div>
      )}

      {/* Message Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-3.5 rounded-3xl text-xs font-semibold leading-relaxed shadow-2xs ${
            isUser
              ? 'bg-slate-900 text-white rounded-br-none font-medium'
              : 'bg-white text-slate-900 border border-slate-200/90 rounded-bl-none shadow-xs'
          }`}
        >
          {message.metadata?.intent && !isUser && (
            <div className="mb-1.5 flex items-center gap-1">
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {message.metadata.intent}
              </span>
            </div>
          )}

          <p className="whitespace-pre-wrap">{message.content}</p>

          {/* Embedded Query Data Card if applicable */}
          {message.metadata && <AIActionCard metadata={message.metadata} />}
        </div>

        <div className={`text-[10px] font-bold text-slate-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {timeStr}
        </div>
      </div>

      {/* User Icon for user */}
      {isUser && (
        <div className="w-8 h-8 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 border border-slate-300">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  )
}
