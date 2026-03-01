import React, { useState } from 'react';

/**
 * Tabs component for multi-section interfaces
 * Usage:
 * <Tabs defaultValue="tab1">
 *   <Tabs.List>
 *     <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
 *     <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
 *   </Tabs.List>
 *   <Tabs.Content value="tab1">Content 1</Tabs.Content>
 *   <Tabs.Content value="tab2">Content 2</Tabs.Content>
 * </Tabs>
 */
const TabsContext = React.createContext();

const Tabs = ({ defaultValue, children, onValueChange }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (value) => {
    setActiveTab(value);
    onValueChange?.(value);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      {children}
    </TabsContext.Provider>
  );
};

const TabsList = ({ children }) => (
  <div className="flex gap-1 border-b border-slate-200 mb-4">
    {children}
  </div>
);

const TabsTrigger = ({ value, children }) => {
  const { activeTab, setActiveTab } = React.useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={`
        px-4 py-3 font-medium text-sm transition-colors duration-200
        border-b-2 -mb-px
        ${
          isActive
            ? 'border-emerald-500 text-emerald-600'
            : 'border-transparent text-slate-600 hover:text-slate-900'
        }
      `}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className = '' }) => {
  const { activeTab } = React.useContext(TabsContext);

  if (activeTab !== value) return null;

  return (
    <div className={`animate-in fade-in ${className}`}>
      {children}
    </div>
  );
};

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export default Tabs;
