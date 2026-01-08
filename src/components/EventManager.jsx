import { useState } from 'react'
import { createPortal } from 'react-dom'

function EventManager({ events, onEventsChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    month: 1,
    day: 1,
    endMonth: null,
    endDay: null,
    color: '#60a5fa',
    type: 'personal'
  })
  const [isMultiDay, setIsMultiDay] = useState(false)

  const eventTypes = [
    { name: 'Personal Event', value: 'personal', description: 'Birthdays, anniversaries, holidays' },
    { name: 'Celestial Event', value: 'celestial', description: 'Solstices, equinoxes, perihelion, aphelion' },
    { name: 'Meteor Shower', value: 'meteor-shower', description: 'Annual meteor showers' },
  ]

  const colorOptions = [
    { name: 'Blue', value: '#60a5fa' },
    { name: 'Pink', value: '#f472b6' },
    { name: 'Green', value: '#4ade80' },
    { name: 'Yellow', value: '#fbbf24' },
    { name: 'Orange', value: '#fb923c' },
    { name: 'Purple', value: '#a78bfa' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Cyan', value: '#22d3ee' },
  ]

  const handleAdd = () => {
    setEditingEvent(null)
    setFormData({ name: '', month: 1, day: 1, endMonth: null, endDay: null, color: '#60a5fa', type: 'personal' })
    setIsMultiDay(false)
    setShowForm(true)
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setFormData({
      name: event.name,
      month: event.month,
      day: event.day,
      endMonth: event.endMonth || null,
      endDay: event.endDay || null,
      color: event.color,
      type: event.type || 'personal' // Default to personal for backwards compatibility
    })
    setIsMultiDay(!!(event.endMonth && event.endDay))
    setShowForm(true)
  }

  const handleDelete = (eventId) => {
    if (confirm('Are you sure you want to delete this event?')) {
      onEventsChange(events.filter(e => e.id !== eventId))
      // Close modal and clear editing state after delete
      setIsOpen(false)
      setEditingEvent(null)
      setShowForm(false)
    }
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Please enter an event name')
      return
    }

    const month = parseInt(formData.month, 10)
    const day = parseInt(formData.day, 10)
    const currentYear = new Date().getFullYear()

    // Validate start date
    const daysInMonth = new Date(currentYear, month, 0).getDate()
    if (day < 1 || day > daysInMonth) {
      alert(`Day must be between 1 and ${daysInMonth} for month ${month}`)
      return
    }

    // Validate end date if multi-day event
    let endMonth = null
    let endDay = null
    if (isMultiDay) {
      endMonth = parseInt(formData.endMonth, 10)
      endDay = parseInt(formData.endDay, 10)
      const daysInEndMonth = new Date(currentYear, endMonth, 0).getDate()
      if (endDay < 1 || endDay > daysInEndMonth) {
        alert(`End day must be between 1 and ${daysInEndMonth} for month ${endMonth}`)
        return
      }

      // Validate that end date is after start date (unless crossing year boundary)
      const startDate = new Date(currentYear, month - 1, day)
      const endDate = new Date(currentYear, endMonth - 1, endDay)

      // Only validate if not crossing year boundary
      if (endMonth >= month && endDate <= startDate) {
        alert('End date must be after start date')
        return
      }
    }

    if (editingEvent) {
      // Update existing event
      onEventsChange(events.map(e =>
        e.id === editingEvent.id
          ? { ...e, name: formData.name, month, day, endMonth, endDay, color: formData.color, type: formData.type }
          : e
      ))
    } else {
      // Add new event
      const newEvent = {
        id: Date.now() + Math.random(), // Prevent collision if events created rapidly
        name: formData.name,
        month,
        day,
        endMonth,
        endDay,
        color: formData.color,
        type: formData.type
      }
      onEventsChange([...events, newEvent])
    }

    setShowForm(false)
    setEditingEvent(null)
    setIsMultiDay(false)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingEvent(null)
    setIsMultiDay(false)
  }

  return (
    <div>
      <div className="ios-glass" style={{
        padding: '12px 16px',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
      }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:opacity-80 transition-opacity"
          style={{
            fontSize: '13px',
            padding: '6px 12px',
            background: 'rgba(10, 132, 255, 0.8)',
            borderRadius: '12px',
            fontWeight: '600',
            border: 'none'
          }}
        >
          Events ({events.length})
        </button>
      </div>

      {/* Event Manager Modal */}
      {isOpen && createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999
        }} onClick={() => !showForm && setIsOpen(false)}>
          <div className="ios-glass-thick max-w-2xl w-full max-h-[80vh] overflow-y-auto" style={{
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                {editingEvent ? 'Edit Event' : showForm ? 'Add New Event' : 'Manage Events'}
              </h2>
              {!showForm && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              )}
            </div>

            {/* Event Form - only show when adding/editing */}
            {showForm && (
              <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Birthday, Anniversary"
                  className="w-full text-white focus:outline-none"
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(58, 58, 60, 0.6)',
                    borderRadius: '12px',
                    border: '0.5px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '15px'
                  }}
                />
              </div>

              {/* Event Type Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Event Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full text-white focus:outline-none"
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(58, 58, 60, 0.6)',
                    borderRadius: '12px',
                    border: '0.5px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '15px'
                  }}
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.name} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Month
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full text-white focus:outline-none"
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(58, 58, 60, 0.6)',
                      borderRadius: '12px',
                      border: '0.5px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '15px'
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2024, i, 1).toLocaleString('en-US', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full text-white focus:outline-none"
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(58, 58, 60, 0.6)',
                      borderRadius: '12px',
                      border: '0.5px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '15px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMultiDay}
                    onChange={(e) => {
                      setIsMultiDay(e.target.checked)
                      if (e.target.checked && !formData.endMonth) {
                        // Initialize end date to same as start date
                        setFormData({ ...formData, endMonth: formData.month, endDay: formData.day })
                      }
                    }}
                    className="w-5 h-5 rounded"
                    style={{
                      accentColor: 'rgba(10, 132, 255, 0.8)'
                    }}
                  />
                  <span className="text-sm font-medium text-slate-300">
                    Multi-day event (e.g., vacation)
                  </span>
                </label>
              </div>

              {isMultiDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      End Month
                    </label>
                    <select
                      value={formData.endMonth || formData.month}
                      onChange={(e) => setFormData({ ...formData, endMonth: e.target.value })}
                      className="w-full text-white focus:outline-none"
                      style={{
                        padding: '12px 16px',
                        background: 'rgba(58, 58, 60, 0.6)',
                        borderRadius: '12px',
                        border: '0.5px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '15px'
                      }}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2024, i, 1).toLocaleString('en-US', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      End Day
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.endDay || formData.day}
                      onChange={(e) => setFormData({ ...formData, endDay: e.target.value })}
                      className="w-full text-white focus:outline-none"
                      style={{
                        padding: '12px 16px',
                        background: 'rgba(58, 58, 60, 0.6)',
                        borderRadius: '12px',
                        border: '0.5px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '15px'
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 8px',
                        background: formData.color === color.value ? 'rgba(71, 85, 105, 0.6)' : 'rgba(51, 65, 85, 0.6)',
                        borderRadius: '12px',
                        border: formData.color === color.value ? '2px solid white' : '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: color.value,
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                        }}
                      />
                      <span style={{
                        fontSize: '11px',
                        color: 'rgb(203, 213, 225)',
                        fontWeight: '500'
                      }}>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 text-white font-semibold hover:opacity-80 transition-opacity"
                    style={{
                      padding: '14px',
                      background: 'rgba(10, 132, 255, 0.8)',
                      borderRadius: '14px',
                      border: 'none',
                      fontSize: '15px',
                      fontWeight: '600'
                    }}
                  >
                    {editingEvent ? 'Save Changes' : 'Add Event'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 text-white font-semibold hover:opacity-80 transition-opacity"
                    style={{
                      padding: '14px',
                      background: 'rgba(142, 142, 147, 0.6)',
                      borderRadius: '14px',
                      border: 'none',
                      fontSize: '15px',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Add Event Button - show when not editing */}
            {!showForm && (
              <div className="mb-4">
                <button
                  onClick={handleAdd}
                  className="w-full text-white font-semibold hover:opacity-80 transition-opacity"
                  style={{
                    padding: '14px',
                    background: 'rgba(10, 132, 255, 0.8)',
                    borderRadius: '14px',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: '600'
                  }}
                >
                  + Add New Event
                </button>
              </div>
            )}

            {/* Events List */}
            {!showForm && events.length > 0 && (
              <div style={{
                borderTop: '0.5px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '16px'
              }}>
                <h3 className="text-lg font-semibold text-white mb-3" style={{ fontWeight: '600' }}>Your Events</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {events
                    .sort((a, b) => {
                      const aDate = new Date(2024, a.month - 1, a.day)
                      const bDate = new Date(2024, b.month - 1, b.day)
                      return aDate - bDate
                    })
                    .map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between"
                        style={{
                          background: 'rgba(58, 58, 60, 0.5)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          border: '0.5px solid rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />
                          <div>
                            <div className="text-white font-medium">{event.name}</div>
                            <div className="text-slate-400 text-sm">
                              {new Date(2024, event.month - 1, event.day).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(event)}
                            className="hover:opacity-70 transition-opacity"
                            style={{
                              color: 'rgba(10, 132, 255, 1)',
                              fontSize: '14px',
                              fontWeight: '500',
                              background: 'none',
                              border: 'none',
                              padding: '4px 8px'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="hover:opacity-70 transition-opacity"
                            style={{
                              color: 'rgba(255, 69, 58, 1)',
                              fontSize: '14px',
                              fontWeight: '500',
                              background: 'none',
                              border: 'none',
                              padding: '4px 8px'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default EventManager
