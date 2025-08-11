'use client';
import { useState } from 'react';
import '../app/css/add-poll.css'; // ✅ Add Poll styling

export default function AddPoll({messageText, sb, channelUrl, setShowForm, submitPoll }) {
  const [title, setTitle] = useState(messageText);
  const [options, setOptions] = useState(['']);
  const [loading, setLoading] = useState(false);

  const handleAddOption = () => setOptions([...options, '']);

  const handleChangeOption = (value, index) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleCreatePoll = async () => {
    submitPoll(options)
  };

  return (
    <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
      <div className="bg-[#161b22] p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4 text-white">Create Poll</h2>
        <input
          type="text"
          placeholder="Poll Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white border border-gray-600"
        />

        {options.map((opt, idx) => (
          <input
            key={idx}
            type="text"
            placeholder={`Option ${idx + 1}`}
            value={opt}
            onChange={(e) => handleChangeOption(e.target.value, idx)}
            className="w-full mb-2 px-3 py-2 rounded bg-gray-800 text-white border border-gray-600"
          />
        ))}

        <button
          onClick={handleAddOption}
          className="w-full mb-4 bg-purple-700 py-1 rounded hover:bg-gray-600"
        >
          + Add Option
        </button>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowForm(false)}
            className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleCreatePoll}
            className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
