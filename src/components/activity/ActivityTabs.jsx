const TABS = [
  { id: 'guide', label: 'Guía completa' },
  { id: 'science', label: 'Fundamento' },
  { id: 'journal', label: 'Bitácora' },
]

export default function ActivityTabs({ activeTab, onTabChange }) {
  return (
    <div className="activity-tabs">
      {TABS.map((tab) => (
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
