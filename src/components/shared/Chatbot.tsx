'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import axios from '@/lib/axios'

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
  suggestions?: string[]
  quickActions?: QuickAction[]
}

interface QuickAction {
  label: string
  action: string
  icon?: string
}

interface ChatbotProps {
  className?: string
}

export default function Chatbot({ className = '' }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isInitialized) {
      initializeChatbot()
    }
  }, [isOpen, isInitialized])

  // Load conversation history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatbot-messages')
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
      } catch (error) {
        console.error('Failed to load chat history:', error)
      }
    }
  }, [])

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatbot-messages', JSON.stringify(messages))
    }
  }, [messages])

  const initializeChatbot = async () => {
    try {
      const response = await axios.get('/api/chatbot/welcome')
      if (response.data.success) {
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          content: response.data.message,
          isBot: true,
          timestamp: new Date(),
          suggestions: response.data.suggestions,
          quickActions: response.data.quickActions || []
        }
        setMessages([welcomeMessage])
        setIsInitialized(true)
      }
    } catch (error) {
      console.error('Failed to initialize chatbot:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Hello! I'm BeautyBot, your salon assistant. How can I help you today?",
        isBot: true,
        timestamp: new Date(),
        suggestions: [
          "What services are available?",
          "How do I book an appointment?",
          "Show me my appointments"
        ],
        quickActions: [
          { label: "Book Appointment", action: "navigate:/services-marketplace", icon: "calendar" },
          { label: "View Services", action: "navigate:/services", icon: "list" }
        ]
      }
      setMessages([errorMessage])
      setIsInitialized(true)
    }
  }

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setIsTyping(true)
    
    // Simulate typing delay
    setTimeout(() => setIsTyping(false), 1000)

    try {
      const response = await axios.post('/api/chatbot/chat', {
        message: message
      })

      if (response.data.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.response,
          isBot: true,
          timestamp: new Date(),
          suggestions: response.data.suggestions,
          quickActions: response.data.quickActions || []
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        isBot: true,
        timestamp: new Date(),
        quickActions: [
          { label: "Try Again", action: "retry", icon: "refresh" },
          { label: "Contact Support", action: "contact", icon: "help" }
        ]
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const handleQuickAction = (action: QuickAction) => {
    if (action.action.startsWith('navigate:')) {
      const path = action.action.replace('navigate:', '')
      window.location.href = path
    } else if (action.action === 'retry') {
      // Retry last message
      const lastUserMessage = messages.filter(m => !m.isBot).pop()
      if (lastUserMessage) {
        sendMessage(lastUserMessage.content)
      }
    } else if (action.action === 'contact') {
      sendMessage('I need to contact support')
    } else if (action.action === 'clear') {
      setMessages([])
      localStorage.removeItem('chatbot-messages')
      initializeChatbot()
    } else {
      sendMessage(action.label)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const toggleChatbot = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      // Focus input when opening
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  return (
    <div className={`fixed bottom-4 right-4 z-[9999] ${className}`}>
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-96 h-[500px] flex flex-col shadow-2xl rounded-2xl bg-white border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bot className="h-6 w-6" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <span className="font-semibold text-lg">BeautyBot</span>
                <div className="text-xs text-white/80">Your AI Assistant</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChatbot}
              className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full transition-all duration-200 hover:scale-110"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div
                  className={`flex ${
                    message.isBot ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      message.isBot
                        ? 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border border-gray-200'
                        : 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg'
                    } animate-in fade-in-50 slide-in-from-bottom-2 duration-300`}
                  >
                    <div className="flex items-start space-x-3">
                      {message.isBot && (
                        <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mt-0.5">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      {!message.isBot && (
                        <div className="flex-shrink-0 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className="text-sm leading-relaxed flex-1">{message.content}</div>
                    </div>
                    {message.isBot && (
                      <div className="text-xs text-gray-500 mt-2 ml-10">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Suggestions */}
                {message.isBot && message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 ml-10 animate-in fade-in-50 delay-200">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs h-8 px-3 border-2 border-pink-200 text-pink-700 hover:bg-pink-50 hover:border-pink-300 rounded-full transition-all duration-200 hover:scale-105 bg-white/80 backdrop-blur-sm"
                        disabled={isLoading}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Quick Actions */}
                {message.isBot && message.quickActions && message.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 ml-10 mt-3 animate-in fade-in-50 delay-300">
                    {message.quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="default"
                        size="sm"
                        onClick={() => handleQuickAction(action)}
                        className="text-xs h-9 px-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 font-medium"
                        disabled={isLoading}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in-50">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl px-4 py-3 max-w-[85%] border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="text-sm pr-12 rounded-full border-2 border-gray-200 focus:border-pink-300 focus:ring-pink-200 bg-white shadow-sm transition-all duration-200"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoading || !inputValue.trim()}
                    className="h-8 w-8 p-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
            <div className="text-xs text-gray-500 mt-2 text-center">
              Powered by AI • Press Enter to send
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <Button
        onClick={toggleChatbot}
        className={`h-16 w-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'rotate-180' : 'hover:rotate-12'
        } relative overflow-hidden group`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {isOpen ? (
          <X className="h-7 w-7 transition-transform duration-300" />
        ) : (
          <>
            <MessageCircle className="h-7 w-7 transition-transform duration-300" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </>
        )}
      </Button>
    </div>
  )
}
