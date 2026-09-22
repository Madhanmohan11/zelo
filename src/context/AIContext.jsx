import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import {
  getOrCreateActiveConversation,
  getConversationMessages,
  sendAIMessage,
  executeConfirmedAction
} from '../services/aiService'

const AIContext = createContext(null)

export const AIProvider = ({ children }) => {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false)
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState(null) // { intent, data, message }

  // Load conversation & messages
  const loadConversation = useCallback(async () => {
    if (!user) return
    try {
      const conv = await getOrCreateActiveConversation(user.id)
      setActiveConversation(conv)
      if (conv) {
        const msgs = await getConversationMessages(user.id, conv.id)
        setMessages(msgs || [])
      }
    } catch (err) {
      console.error('Failed to load AI conversation:', err)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadConversation()
    }
  }, [user, loadConversation])

  const openAIPanel = useCallback((initialPrompt = '') => {
    setIsAIPanelOpen(true)
    if (initialPrompt && user && activeConversation) {
      handleSendMessage(initialPrompt)
    }
  }, [user, activeConversation])

  const closeAIPanel = useCallback(() => {
    setIsAIPanelOpen(false)
  }, [])

  const toggleAIPanel = useCallback(() => {
    setIsAIPanelOpen((prev) => !prev)
  }, [])

  const handleSendMessage = async (text) => {
    if (!user || !text.trim() || isLoading) return
    setIsLoading(true)
    setPendingAction(null)

    // Optimistically add user message to state
    const tempUserMsg = {
      id: `temp_${Date.now()}`,
      sender: 'user',
      content: text.trim(),
      created_at: new Date().toISOString()
    }
    setMessages((prev) => [...prev, tempUserMsg])

    try {
      const convId = activeConversation?.id || `local_conv_${user.id}`
      const response = await sendAIMessage(user.id, convId, text.trim())

      // Refresh messages
      const updatedMsgs = await getConversationMessages(user.id, convId)
      setMessages(updatedMsgs)

      // If action requires confirmation, set pending action
      if (response && response.requiresConfirmation && response.intent) {
        setPendingAction({
          intent: response.intent,
          data: response.data,
          message: response.message
        })
      }
    } catch (err) {
      showToast(err.message || 'Failed to send message to ZELO AI', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmAction = async (intent, actionData) => {
    if (!user || isLoading) return
    setIsLoading(true)
    try {
      const resultMessage = await executeConfirmedAction(user.id, intent, actionData)
      showToast(resultMessage, 'success')
      setPendingAction(null)

      const convId = activeConversation?.id || `local_conv_${user.id}`
      const updatedMsgs = await getConversationMessages(user.id, convId)
      setMessages(updatedMsgs)
    } catch (err) {
      showToast(err.message || 'Failed to execute action', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelAction = () => {
    setPendingAction(null)
    showToast('Action cancelled', 'info')
  }

  const handleClearHistory = () => {
    if (!user) return
    localStorage.removeItem(`zelo_ai_messages_${user.id}`)
    setMessages([])
    setPendingAction(null)
    showToast('Conversation cleared', 'info')
  }

  return (
    <AIContext.Provider
      value={{
        isAIPanelOpen,
        openAIPanel,
        closeAIPanel,
        toggleAIPanel,
        messages,
        isLoading,
        pendingAction,
        sendMessage: handleSendMessage,
        confirmAction: handleConfirmAction,
        cancelAction: handleCancelAction,
        clearHistory: handleClearHistory
      }}
    >
      {children}
    </AIContext.Provider>
  )
}

export const useAI = () => {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}
