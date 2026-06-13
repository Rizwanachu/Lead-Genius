import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { getConversations, saveConversations, Conversation, ConversationMessage, getLeads, Lead } from "@/lib/storage";
import { generateConversationReply } from "@/lib/aiUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Mail, Instagram, Facebook, MessageSquare, Send, Sparkles, Bot, Clock, ChevronRight, Copy, CheckCircle2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Conversations() {
  const [search] = useSearch();
  const preselectedLeadId = new URLSearchParams(search).get("lead");
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(!!preselectedLeadId);
  const [newFormData, setNewFormData] = useState({
    leadId: preselectedLeadId || "",
    channel: "email" as Conversation['channel'],
  });

  const [replyMode, setReplyMode] = useState<'paste' | 'send'>('paste');
  const [draftContent, setDraftContent] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<{message: string, reasoning: string} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setConversations(getConversations());
    setLeads(getLeads());
  }, []);

  const activeConv = conversations.find(c => c.id === activeConvId);

  const handleCreateConversation = (): void => {
    if (!newFormData.leadId) { toast.error("Select a lead"); return; }
    
    const lead = leads.find(l => l.id === newFormData.leadId);
    if (!lead) return;

    const newConv: Conversation = {
      id: Math.random().toString(36).substring(7),
      leadId: lead.id,
      leadName: lead.businessName,
      channel: newFormData.channel,
      status: 'new',
      messages: [{
        id: Math.random().toString(36).substring(7),
        role: 'sent',
        content: `Hi there, noticed you don't have a website yet for ${lead.businessName}. I help local ${lead.category}s get online quickly. Open to a chat?`,
        timestamp: new Date().toISOString(),
        channel: newFormData.channel
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newConv, ...conversations];
    setConversations(updated);
    saveConversations(updated);
    setIsNewDialogOpen(false);
    setActiveConvId(newConv.id);
    toast.success("Conversation started");
  };

  const handlePasteReply = () => {
    if (!activeConv || !draftContent.trim()) return;

    const newMsg: ConversationMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'received',
      content: draftContent,
      timestamp: new Date().toISOString(),
      channel: activeConv.channel
    };

    updateConversation(activeConv.id, {
      status: 'in_progress',
      messages: [...activeConv.messages, newMsg],
      updatedAt: new Date().toISOString()
    });

    setDraftContent("");
    generateAiReply(draftContent);
  };

  const handleSendReply = (contentToSend: string = draftContent) => {
    if (!activeConv || !contentToSend.trim()) return;

    const newMsg: ConversationMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'sent',
      content: contentToSend,
      timestamp: new Date().toISOString(),
      channel: activeConv.channel
    };

    updateConversation(activeConv.id, {
      messages: [...activeConv.messages, newMsg],
      updatedAt: new Date().toISOString()
    });

    setDraftContent("");
    setAiSuggestion(null);
    setReplyMode('paste');
    toast.success("Message recorded as sent");
  };

  const generateAiReply = (prospectText: string) => {
    if (!activeConv) return;
    const lead = leads.find(l => l.id === activeConv.leadId);
    if (!lead) return;

    setIsGenerating(true);
    setTimeout(() => {
      const suggestion = generateConversationReply(
        lead.businessName, 
        lead.category, 
        activeConv.channel, 
        activeConv.messages, 
        prospectText
      );
      setAiSuggestion(suggestion);
      setReplyMode('send');
      setIsGenerating(false);
    }, 1200);
  };

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    const updated = conversations.map(c => c.id === id ? { ...c, ...updates } : c);
    setConversations(updated);
    saveConversations(updated);
  };

  const getChannelIcon = (channel: string, className = "w-4 h-4") => {
    switch (channel) {
      case 'email': return <Mail className={className} />;
      case 'instagram': return <Instagram className={className} />;
      case 'facebook': return <Facebook className={className} />;
      case 'whatsapp': return <MessageSquare className={className} />;
      default: return <MessageCircle className={className} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'interested': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';
      case 'converted': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'dead': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredConversations = conversations.filter(c => filter === 'all' || c.status === filter);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground mt-1">Manage all your outreach threads and let AI handle the objections.</p>
        </div>
        <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> New Chat</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Outreach</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Lead</label>
                <Select value={newFormData.leadId} onValueChange={v => setNewFormData({...newFormData, leadId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select a lead" /></SelectTrigger>
                  <SelectContent>
                    {leads.map(l => <SelectItem key={l.id} value={l.id}>{l.businessName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Channel</label>
                <Select value={newFormData.channel} onValueChange={v => setNewFormData({...newFormData, channel: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleCreateConversation}>Start Thread</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
        {/* Left: List */}
        <Card className="lg:col-span-4 flex flex-col border-border/50 bg-card/50 overflow-hidden">
          <div className="p-4 border-b space-y-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-9 bg-background/50" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {['all', 'new', 'in_progress', 'interested', 'converted'].map(f => (
                <Badge 
                  key={f} 
                  variant={filter === f ? "default" : "secondary"}
                  className="cursor-pointer capitalize whitespace-nowrap"
                  onClick={() => setFilter(f)}
                >
                  {f.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
          <ScrollArea className="flex-1">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">No conversations found</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filteredConversations.map(conv => (
                  <div 
                    key={conv.id} 
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${activeConvId === conv.id ? 'bg-muted border-l-2 border-l-primary' : ''}`}
                    onClick={() => setActiveConvId(conv.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-sm truncate pr-2">{conv.leadName}</h4>
                      <Badge variant="outline" className={`text-[10px] px-1.5 h-5 capitalize ${getStatusColor(conv.status)}`}>
                        {conv.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {getChannelIcon(conv.channel, "w-3 h-3")}
                      <span className="capitalize">{conv.channel}</span>
                      <span>•</span>
                      <span className="truncate">{conv.messages[conv.messages.length - 1]?.content}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Right: Thread */}
        <Card className="lg:col-span-8 flex flex-col border-border/50 bg-card/50 overflow-hidden">
          {activeConv ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b flex items-center justify-between bg-card/80 backdrop-blur shrink-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {getChannelIcon(activeConv.channel, "w-5 h-5")}
                  </div>
                  <div>
                    <h3 className="font-bold">{activeConv.leadName}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{activeConv.channel} Thread</p>
                  </div>
                </div>
                <Select value={activeConv.status} onValueChange={(v) => updateConversation(activeConv.id, {status: v as any})}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="dead">Dead</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4 bg-muted/10">
                <div className="space-y-6">
                  {activeConv.messages.map((msg, i) => (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex flex-col max-w-[80%] ${msg.role === 'sent' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                        msg.role === 'sent' 
                          ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                          : 'bg-card border border-border rounded-tl-sm'
                      }`}>
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground px-1">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </motion.div>
                  ))}
                  {isGenerating && (
                    <div className="flex items-start max-w-[80%] mr-auto">
                      <div className="p-4 rounded-2xl bg-card border rounded-tl-sm text-muted-foreground flex items-center gap-2">
                        <Sparkles className="w-4 h-4 animate-pulse text-primary" /> AI is crafting a response...
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 bg-card border-t shrink-0">
                <AnimatePresence mode="wait">
                  {aiSuggestion && replyMode === 'send' ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                          <Bot className="w-4 h-4" /> AI Suggested Reply
                        </div>
                        <span className="text-xs text-muted-foreground italic">{aiSuggestion.reasoning}</span>
                      </div>
                      <p className="text-sm bg-background p-3 rounded border font-medium">
                        {aiSuggestion.message}
                      </p>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button variant="outline" size="sm" onClick={() => {
                          setDraftContent(aiSuggestion.message);
                          setAiSuggestion(null);
                        }}>Edit First</Button>
                        <Button size="sm" className="gap-2" onClick={() => {
                          navigator.clipboard.writeText(aiSuggestion.message);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                          handleSendReply(aiSuggestion.message);
                        }}>
                          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />} 
                          Copy & Mark Sent
                        </Button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="flex gap-2">
                  <div className="flex bg-muted rounded-md p-1 shrink-0 flex-col gap-1">
                    <Button 
                      variant={replyMode === 'paste' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      className="text-xs h-7 px-2 justify-start"
                      onClick={() => setReplyMode('paste')}
                    >
                      Record Reply
                    </Button>
                    <Button 
                      variant={replyMode === 'send' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      className="text-xs h-7 px-2 justify-start"
                      onClick={() => setReplyMode('send')}
                    >
                      Send Message
                    </Button>
                  </div>
                  
                  <div className="flex-1 relative">
                    <Textarea 
                      value={draftContent}
                      onChange={e => setDraftContent(e.target.value)}
                      placeholder={replyMode === 'paste' ? "Paste what the prospect replied here..." : "Type your message..."}
                      className="min-h-[80px] pr-12 resize-none bg-background focus-visible:ring-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          replyMode === 'paste' ? handlePasteReply() : handleSendReply();
                        }
                      }}
                    />
                    <Button 
                      size="icon" 
                      className="absolute bottom-2 right-2 h-8 w-8"
                      disabled={!draftContent.trim() || isGenerating}
                      onClick={() => replyMode === 'paste' ? handlePasteReply() : handleSendReply()}
                    >
                      {replyMode === 'paste' ? <Sparkles className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <h3 className="text-lg font-medium">Select a conversation</h3>
              <p className="text-sm mt-1">Or start a new chat with a lead</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}