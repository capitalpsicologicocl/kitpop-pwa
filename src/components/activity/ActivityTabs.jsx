const TABS = [
  { id: 'guide', label: 'Guía completa' },
  { id: 'timer', label: 'Temporizador' },
  { id: 'science', label: 'Fundamento' },
  { id: 'journal', label: 'Bitácora' },
]

export default function ActivityTabs({
  activeTab,
  onTabChange,
  showTimer = true,
}) {
  const visibleTabs = showTimer
    ? TABS
    : TABS.filter((tab) => tab.id !== 'timer')

  return (
    <div className="activity-tabs">
      {visibleTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`activity-tab ${activeTab === tab.id ? 'on' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
