import { getActivityMediaItems } from '../../utils/activityMedia'

const BASE_TABS = [
  { id: 'guide', label: 'Guía completa' },
  { id: 'science', label: 'Evidencia' },
]

export function getActivityTabs(kitpop) {
  const tabs = [...BASE_TABS]

  if (getActivityMediaItems(kitpop).length > 0) {
    tabs.push({ id: 'media', label: 'Recursos' })
  }

  tabs.push({ id: 'journal', label: 'Bitácora' })

  return tabs
}

export default function ActivityTabs({ kitpop, activeTab, onTabChange }) {
  const tabs = getActivityTabs(kitpop)

  return (
    <div className="activity-tabs">
      {tabs.map((tab) => (
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
