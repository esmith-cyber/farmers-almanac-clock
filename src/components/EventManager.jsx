import { useState } from 'react'

function EventManager({ events, onEventsChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    month: 1,
    day: 1,
    color: '#60a5fa'
  })

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
    setFormData({ name: '', month: 1, day: 1, color: '#60a5fa' })
    setIsOpen(true)
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setFormData({
      name: event.name,
      month: event.month,
      day: event.day,
      color: event.color
    })
    setIsOpen(true)
  }

  const handleDelete = (eventId) => {
    if (confirm('Are you sure you want to delete this event?')) {
      onEventsChange(events.filter(e => e.id !== eventId))
    }
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Please enter an event name')
      return
    }

    const month = parseInt(formData.month)
    const day = parseInt(formData.day)

    // Validate date
    const daysInMonth = new Date(2024, month, 0).getDate()
    if (day < 1 || day > daysInMonth) {
      alert(`Day must be between 1 and ${daysInMonth} for month ${month}`)
      return
    }

    if (editingEvent) {
      // Update existing event
      onEventsChange(events.map(e =>
        e.id === editingEvent.id
          ? { ...e, name: formData.name, month, day, color: formData.color }
          : e
      ))
    } else {
      // Add new event
      const newEvent = {
        id: Date.now(),
        name: formData.name,
        month,
        day,
        color: formData.color
      }
      onEventsChange([...events, newEvent])
    }

    setIsOpen(false)
    setEditingEvent(null)
  }

  const handleCancel = () => {
    setIsOpen(false)
    setEditingEvent(null)
  }

  return (
    <div>
      <div className="bg-slate-800/90 backdrop-blur rounded-lg px-4 py-2 flex items-center gap-3">
        <button
          onClick={handleAdd}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
        >
          + Add Event
        </button>

        {events.length > 0 && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-md transition-colors"
          >
            Events ({events.length})
          </button>
        )}
      </div>

      {/* Event Manager Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h2>

            {/* Event Form */}
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
                  className="w-full bg-slate-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Month
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full bg-slate-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full bg-slate-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                        formData.color === color.value
                          ? 'bg-slate-600 ring-2 ring-white'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-sm text-slate-300">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
                >
                  {editingEvent ? 'Save Changes' : 'Add Event'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Existing Events List */}
            {!editingEvent && events.length > 0 && (
              <div className="border-t border-slate-700 pt-4">
                <h3 className="text-lg font-semibold text-white mb-3">Your Events</h3>
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
                        className="flex items-center justify-between bg-slate-700 rounded-md px-4 py-3"
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
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
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
        </div>
      )}
    </div>
  )
}

export default EventManager
