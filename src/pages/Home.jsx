import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

function Home() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-slate-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              My Groups
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Select a group or create a new one
            </p>
          </div>
          <Link
            to="/create"
            className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition"
          >
            + New Group
          </Link>
        </div>

        {/* Groups List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-blue-400">Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-12 text-center">
            <p className="text-4xl mb-4">💸</p>
            <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-200 mb-2">
              No groups yet
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Create your first group to start splitting expenses
            </p>
            <Link
              to="/create"
              className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition"
            >
              + Create First Group
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map(group => (
              <Link
                key={group.id}
                to={`/dashboard/${group.id}`}
                className="block bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-5 hover:shadow-md transition hover:border-blue-200 border border-transparent"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">
                      {group.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Created {new Date(group.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-blue-400 text-xl">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Home;