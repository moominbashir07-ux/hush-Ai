/**
 * Project HUSH - Application Shell
 *
 * Implements the 3-column desktop shell (Sidebar, Central Workspace, Right Inspector),
 * collapsible sidebar, mobile drawer, and status indicators in an obsidian black theme.
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  PlaySquare,
  BarChart2,
  Boxes,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Sliders,
  Menu,
  X,
} from 'lucide-react';
import type { ActiveNav, Conversation, DecisionResult, AttentionPolicy } from '../../types/index.ts';
import { DecisionInspector } from '../decision/DecisionInspector.tsx';

interface AppShellProps {
  activeNav: ActiveNav;
  onSelectNav: (nav: ActiveNav) => void;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  currentDecision: DecisionResult | null;
  decisionHistory: DecisionResult[];
  policy: AttentionPolicy;
  onPolicyChange: (policy: AttentionPolicy) => void;
  onSelectHistoricalDecision: (dec: DecisionResult) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeNav,
  onSelectNav,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  currentDecision,
  decisionHistory,
  policy,
  onPolicyChange,
  onSelectHistoricalDecision,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const navItems = [
    { id: 'overview' as ActiveNav, label: 'Overview', icon: LayoutDashboard, section: 'WORKSPACE' },
    { id: 'chat' as ActiveNav, label: 'Chat Workspace', icon: MessageSquare, section: 'WORKSPACE' },
    { id: 'playground' as ActiveNav, label: 'Decision Playground', icon: PlaySquare, section: 'INTELLIGENCE' },
    { id: 'evaluations' as ActiveNav, label: 'Evaluations', icon: BarChart2, section: 'INTELLIGENCE' },
    { id: 'patterns' as ActiveNav, label: 'Decision Patterns', icon: Boxes, section: 'INTELLIGENCE' },
    { id: 'settings' as ActiveNav, label: 'Settings', icon: Settings, section: 'SYSTEM' },
  ];

  return (
    <div className="flex h-screen w-screen bg-black text-neutral-100 overflow-hidden font-sans">
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-black/95 backdrop-blur-md border-b border-neutral-800/80 px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-neutral-200 via-white to-neutral-400 flex items-center justify-center shadow-sm">
              <span className="text-[10px] font-black text-black">H</span>
            </div>
            <span className="font-bold tracking-widest text-sm text-neutral-100 uppercase">HUSH</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInspectorOpen(!inspectorOpen)}
            className={`p-1.5 rounded-lg border text-xs transition ${
              inspectorOpen
                ? 'bg-neutral-800 border-neutral-600 text-white'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400'
            }`}
            aria-label="Toggle inspector"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-neutral-950 border-r border-neutral-800 p-4 flex flex-col justify-between z-50">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-neutral-200 via-white to-neutral-400 flex items-center justify-center font-black text-black text-xs shadow-sm">
                    H
                  </div>
                  <div>
                    <span className="font-bold tracking-widest text-base block leading-none">HUSH</span>
                    <span className="text-[10px] text-neutral-500 font-mono">Attention Engine</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* New Chat Button */}
              <button
                type="button"
                onClick={() => {
                  onNewChat();
                  onSelectNav('chat');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-100 hover:bg-white text-black font-semibold text-xs shadow-sm mb-4 transition"
              >
                <Plus className="w-4 h-4" />
                <span>New Conversation</span>
              </button>

              {/* Navigation list */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectNav(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-neutral-900 text-white border border-neutral-700 shadow-xs'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-neutral-800 pt-3 text-[11px] font-mono text-neutral-500">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Hush Decider 2B (Local Demo)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col h-full bg-black/[0.96] border-r border-neutral-800/80 transition-all duration-300 shrink-0 z-20 ${
          sidebarCollapsed ? 'w-16' : 'w-60'
        }`}
        aria-label="Main Navigation"
      >
        {/* Brand Header */}
        <div className="h-14 border-b border-neutral-800/80 px-4 flex items-center justify-between shrink-0">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-neutral-200 via-white to-neutral-400 flex items-center justify-center font-black text-black text-xs shadow-sm">
                H
              </div>
              <div>
                <span className="font-extrabold tracking-widest text-sm text-neutral-100 uppercase block leading-none">
                  HUSH
                </span>
                <span className="text-[10px] text-neutral-500 font-mono tracking-tight">
                  Attention Engine
                </span>
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-neutral-200 via-white to-neutral-400 flex items-center justify-center font-black text-black text-xs mx-auto shadow-sm">
              H
            </div>
          )}

          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900 transition"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onSelectNav('chat');
            }}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-100 hover:bg-white text-black font-semibold text-xs shadow-sm transition ${
              sidebarCollapsed ? 'px-0' : ''
            }`}
            title="New Conversation"
          >
            <Plus className="w-4 h-4" />
            {!sidebarCollapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {/* WORKSPACE */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 font-semibold px-2">
                WORKSPACE
              </span>
            )}
            {navItems
              .filter((i) => i.section === 'WORKSPACE')
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectNav(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-neutral-900 text-white border border-neutral-700/80 shadow-xs'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
          </div>

          {/* RECENT CONVERSATIONS LIST (When expanded) */}
          {!sidebarCollapsed && activeNav === 'chat' && conversations.length > 0 && (
            <div className="space-y-1 border-t border-neutral-800/80 pt-3">
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 font-semibold px-2">
                CONVERSATIONS
              </span>
              <div className="space-y-0.5">
                {conversations.map((conv) => {
                  const isCurrent = conv.id === activeConversationId;
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => onSelectConversation(conv.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs truncate transition flex items-center justify-between ${
                        isCurrent
                          ? 'bg-neutral-900 text-white font-medium border border-neutral-800'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
                      }`}
                    >
                      <span className="truncate">{conv.title}</span>
                      <span className="text-[10px] font-mono text-neutral-500 shrink-0 ml-1">
                        {conv.messages.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* INTELLIGENCE */}
          <div className="space-y-1 border-t border-neutral-800/80 pt-3">
            {!sidebarCollapsed && (
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 font-semibold px-2">
                INTELLIGENCE
              </span>
            )}
            {navItems
              .filter((i) => i.section === 'INTELLIGENCE')
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectNav(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-neutral-900 text-white border border-neutral-700/80 shadow-xs'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
          </div>

          {/* SYSTEM */}
          <div className="space-y-1 border-t border-neutral-800/80 pt-3">
            {!sidebarCollapsed && (
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 font-semibold px-2">
                SYSTEM
              </span>
            )}
            {navItems
              .filter((i) => i.section === 'SYSTEM')
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectNav(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-neutral-900 text-white border border-neutral-700/80 shadow-xs'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Bottom System Status */}
        <div className="p-3 border-t border-neutral-800/80 bg-black shrink-0">
          {!sidebarCollapsed ? (
            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neutral-300" />
                  <span>Decider 2B</span>
                </span>
                <span className="text-neutral-200 font-semibold">21ms</span>
              </div>
              <div className="flex items-center justify-between text-neutral-500">
                <span>Attention Gate</span>
                <span className="text-emerald-400 font-semibold">ACTIVE</span>
              </div>
            </div>
          ) : (
            <div className="w-2 h-2 rounded-full bg-neutral-300 mx-auto" title="Decider 2B active" />
          )}
        </div>
      </aside>

      {/* CENTRAL WORKSPACE */}
      <main className="flex-1 flex flex-col h-full overflow-hidden pt-14 md:pt-0 bg-black">
        {children}
      </main>

      {/* RIGHT-SIDE CONTEXTUAL INSPECTOR */}
      {inspectorOpen && (
        <div className="hidden lg:flex shrink-0 h-full">
          <DecisionInspector
            decision={currentDecision}
            history={decisionHistory}
            policy={policy}
            onPolicyChange={onPolicyChange}
            onSelectHistoricalDecision={onSelectHistoricalDecision}
            onClose={() => setInspectorOpen(false)}
          />
        </div>
      )}

      {/* MOBILE DECISION INSPECTOR DRAWER */}
      {inspectorOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setInspectorOpen(false)}
          />
          <div className="relative w-full max-w-sm h-full bg-black z-50 shadow-2xl flex flex-col border-l border-neutral-800">
            <DecisionInspector
              decision={currentDecision}
              history={decisionHistory}
              policy={policy}
              onPolicyChange={onPolicyChange}
              onSelectHistoricalDecision={onSelectHistoricalDecision}
              onClose={() => setInspectorOpen(false)}
              isMobileDrawer
            />
          </div>
        </div>
      )}
    </div>
  );
};
