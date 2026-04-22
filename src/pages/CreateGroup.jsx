import { supabase } from '../supabase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addMember = () => {
    if (newMember.trim() === '') return;
    if (members.includes(newMember.trim())) {
      alert('Member already added!');
      return;
    }
    setMembers([...members, newMember.trim()]);
    setNewMember('');
  };

  const removeMember = (name) => {
    setMembers(members.filter(m => m !== name));
  };

  const createGroup = async () => {
    if (groupName.trim() === '') return alert('Please enter a group name');
    if (members.length < 2) return alert('Please add at least 2 members');

    setLoading(true);
    try {
      // Get current logged in user
      const { data: { user } } = await supabase.auth.getUser();

      // Save group with created_by user id
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert([{
          name: groupName.trim(),
          created_by: user.id        // ← save who created it
        }])
        .select()
        .single();

      if (groupError) throw groupError;

      const memberRows = members.map(name => ({
        name: name,
        group_id: groupData.id
      }));

      const { error: memberError } = await supabase
        .from('members')
        .insert(memberRows);

      if (memberError) throw memberError;

      navigate(`/dashboard/${groupData.id}`);

    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold text-blue-600 mb-1">Create a Group</h2>
        <p className="text-gray-400 text-sm mb-6">Name your group and add members</p>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Group Name
          </label>
          <input
            type="text"
            placeholder="e.g. Goa Trip, Flat Expenses"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Add Members
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Member name"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addMember()}
              className="flex-1 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={addMember}
              className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-600 transition"
            >
              + Add
            </button>
          </div>
        </div>

        {members.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Members ({members.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => (
                <span
                  key={member}
                  className="bg-blue-50 dark:bg-slate-700 text-blue-600 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {member}
                  <button
                    onClick={() => removeMember(member)}
                    className="text-blue-300 hover:text-red-400 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={createGroup}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? 'Creating...' : '🚀 Create Group'}
        </button>

      </div>
    </div>
  );
}

export default CreateGroup;