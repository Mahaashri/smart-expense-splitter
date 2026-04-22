import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

function Home() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUserName(user?.email?.split('@')[0] || 'there');

      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('created_by', user.id)
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

        {/* Welcome Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-blue-600">
            Hey, {userName} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Select a group below to view expenses and balances
          </p>
        </div>

        {/* My Groups Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">

          {/* Header with single New Group button */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              📂 My Groups
            </h2>
            <Link
              to="/create"
              className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition"
            >
              + New Group
            </Link>
          </div>

          {/* Groups List */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-blue-400">Loading groups...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">💸</p>
              <h2 className="text-base font-semibold text-gray-600 dark:text-gray-200 mb-2">
                No groups yet
              </h2>
              <p className="text-gray-400 text-sm mb-5">
                Create your first group to start splitting expenses
              </p>
              <Link
                to="/create"
                className="bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition"
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
                  className="flex items-center justify-between p-4 bg-blue-50 dark:bg-slate-700 rounded-xl hover:bg-blue-100 dark:hover:bg-slate-600 transition border border-transparent hover:border-blue-200"
                >
                  <div className="flex items-center gap-3">
                    {/* Group Icon */}
                    <div className="bg-blue-500 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold">
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {group.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Created {new Date(group.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-500 font-medium">
                      View →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Home;