import { useState } from 'react'
import { useHabits } from './hooks/useHabits'
import Header from './components/Header'
import Summary from './components/Summary'
import Tabs from './components/Tabs'
import HabitList from './components/HabitList'
import CalendarView from './components/CalendarView'
import TrophyView from './components/TrophyView'
import Toast from './components/Toast'

export default function App() {
  const [activeTab, setActiveTab] = useState('habits')
  const {
    state,
    isExpected,
    getWeekProgress,
    getTrophyProgress,
    toggleDone,
    addGroup, updateGroup, deleteGroup,
    addHabit, updateHabit, deleteHabit,
    addTrophy, updateTrophy, deleteTrophy, claimTrophy,
    setUserName,
  } = useHabits()

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;0,900;1,300&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      <Header
        userName={state.userName}
        setUserName={setUserName}
        onAddGroup={() => document.dispatchEvent(new CustomEvent('openAddGroup'))}
        state={state}
        isExpected={isExpected}
      />

      <Summary
        state={state}
        isExpected={isExpected}
        getWeekProgress={getWeekProgress}
      />

      <Tabs active={activeTab} onChange={setActiveTab} />

      {activeTab === 'habits' && (
        <HabitList
          state={state}
          isExpected={isExpected}
          getWeekProgress={getWeekProgress}
          toggleDone={toggleDone}
          addGroup={addGroup}
          updateGroup={updateGroup}
          deleteGroup={deleteGroup}
          addHabit={addHabit}
          updateHabit={updateHabit}
          deleteHabit={deleteHabit}
        />
      )}

      {activeTab === 'calendar' && (
        <CalendarView
          state={state}
          isExpected={isExpected}
        />
      )}

      {activeTab === 'trophies' && (
        <TrophyView
          state={state}
          getTrophyProgress={getTrophyProgress}
          addTrophy={addTrophy}
          updateTrophy={updateTrophy}
          deleteTrophy={deleteTrophy}
          claimTrophy={claimTrophy}
        />
      )}

      <Toast />
    </>
  )
}