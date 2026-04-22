import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const categorizeExpense = (title) => {
  const text = title.toLowerCase();
  const categories = {
    '🍔 Food': ['food', 'dinner', 'lunch', 'breakfast', 'restaurant',
                'swiggy', 'zomato', 'snack', 'coffee', 'tea', 'pizza',
                'burger', 'biryani', 'cake', 'juice', 'eat', 'meal'],
    '🚗 Transport': ['uber', 'ola', 'cab', 'petrol', 'diesel', 'bus',
                     'train', 'auto', 'transport', 'fuel', 'flight',
                     'metro', 'taxi', 'bike', 'toll', 'parking',
                     'travel', 'trip', 'journey', 'ride'],
    '🏠 Stay': ['hotel', 'rent', 'airbnb', 'stay', 'room', 'hostel',
                'accommodation', 'house', 'flat', 'pg', 'lodge'],
    '🎉 Entertainment': ['movie', 'party', 'game', 'cricket', 'concert',
                         'club', 'show', 'fun', 'entertainment', 'sports',
                         'birthday', 'celebration', 'ticket', 'event'],
    '💊 Health': ['medicine', 'doctor', 'hospital', 'pharmacy', 'health',
                  'medical', 'clinic', 'tablet', 'injection', 'test'],
    '🛒 Shopping': ['shopping', 'clothes', 'shoes', 'amazon', 'flipkart',
                    'grocery', 'market', 'mall', 'buy', 'purchase'],
  };
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(k => text.includes(k))) return category;
  }
  return '📦 Other';
};

function Dashboard() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');

  useEffect(() => { fetchData(); }, [groupId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: groupData } = await supabase
        .from('groups').select('*').eq('id', groupId).single();
      setGroup(groupData);

      const { data: membersData } = await supabase
        .from('members').select('*').eq('group_id', groupId);
      setMembers(membersData || []);

      const { data: expensesData } = await supabase
        .from('expenses').select('*').eq('group_id', groupId)
        .order('created_at', { ascending: false });
      setExpenses(expensesData || []);

    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    if (!title.trim()) return alert('Enter expense title');
    if (!amount || isNaN(amount)) return alert('Enter valid amount');
    if (!paidBy) return alert('Select who paid');
    setSaving(true);
    try {
      const { error } = await supabase.from('expenses').insert([{
        title: title.trim(),
        amount: parseFloat(amount),
        paid_by: paidBy,
        split_type: splitType,
        group_id: parseInt(groupId),
        category: categorizeExpense(title)
      }]);
      if (error) throw error;
      setTitle(''); setAmount(''); setPaidBy(''); setSplitType('equal');
      fetchData();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const calculateBalances = () => {
    const paid = {};
    const share = {};
    members.forEach(m => { paid[m.name] = 0; share[m.name] = 0; });
    expenses.forEach(exp => {
      const amt = parseFloat(exp.amount);
      if (paid[exp.paid_by] !== undefined) paid[exp.paid_by] += amt;
      if (exp.split_type === 'equal') {
        const perPerson = amt / members.length;
        members.forEach(m => { share[m.name] += perPerson; });
      }
    });
    const balances = {};
    members.forEach(m => { balances[m.name] = paid[m.name] - share[m.name]; });
    return balances;
  };

  const getCategorySummary = () => {
    const summary = {};
    const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    expenses.forEach(exp => {
      const cat = exp.category || '📦 Other';
      summary[cat] = (summary[cat] || 0) + parseFloat(exp.amount);
    });
    return { summary, total };
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const { summary, total } = getCategorySummary();

    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246);
    doc.text(`SplitSmart - ${group?.name}`, 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);

    doc.setFontSize(13);
    doc.setTextColor(30);
    doc.text('Expenses', 14, 40);
    autoTable(doc, {
      startY: 45,
      head: [['Title', 'Amount', 'Paid By', 'Split', 'Category']],
      body: expenses.map(exp => [
        exp.title,
        `Rs.${exp.amount}`,
        exp.paid_by,
        exp.split_type,
        (exp.category || 'Other').replace(/[\u{1F000}-\u{1FFFF}]/gu, '').trim()
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    const balances = calculateBalances();
    const balanceY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.text('Balances', 14, balanceY);
    autoTable(doc, {
      startY: balanceY + 5,
      head: [['Member', 'Status', 'Amount']],
      body: Object.entries(balances).map(([name, bal]) => [
        name,
        bal > 0 ? 'Gets Back' : bal < 0 ? 'Owes' : 'Settled',
        `Rs.${Math.abs(bal).toFixed(2)}`
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    const summaryY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.text('Category Summary', 14, summaryY);
    autoTable(doc, {
      startY: summaryY + 5,
      head: [['Category', 'Amount', 'Percentage']],
      body: Object.entries(summary).map(([cat, amt]) => [
        cat.replace(/[\u{1F000}-\u{1FFFF}]/gu, '').trim(),
        `Rs.${amt.toFixed(2)}`,
        `${((amt / total) * 100).toFixed(1)}%`
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`${group?.name}-expenses.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 dark:bg-slate-900 flex items-center justify-center">
        <p className="text-blue-400 text-lg">Loading...</p>
      </div>
    );
  }

  const { summary, total } = getCategorySummary();

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-slate-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Group Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-blue-600">{group?.name}</h2>
              <div className="flex flex-wrap gap-2 mt-3">
                {members.map(m => (
                  <span key={m.id}
                    className="bg-blue-50 dark:bg-slate-700 text-blue-500 px-3 py-1 rounded-full text-sm">
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={downloadPDF}
              className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-600 transition"
            >
              📄 PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['expenses', 'summary', 'balances'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition capitalize
                ${activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-gray-500'}`}>
              {tab === 'expenses' ? '🧾 Expenses' :
               tab === 'summary' ? '📊 Summary' : '💰 Balances'}
            </button>
          ))}
        </div>

        {/* Tab: Expenses */}
        {activeTab === 'expenses' && (
          <>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                + Add Expense
              </h3>
              <div className="mb-3">
                <label className="text-sm text-gray-500 mb-1 block">Expense Title</label>
                <input type="text" placeholder="e.g. Dinner, Hotel, Petrol"
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="mb-3">
                <label className="text-sm text-gray-500 mb-1 block">Amount (₹)</label>
                <input type="number" placeholder="e.g. 500"
                  value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="mb-3">
                <label className="text-sm text-gray-500 mb-1 block">Paid By</label>
                <select value={paidBy} onChange={e => setPaidBy(e.target.value)}
                  className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="">Select member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-5">
                <label className="text-sm text-gray-500 mb-1 block">Split Type</label>
                <div className="flex gap-3">
                  {['equal', 'custom'].map(type => (
                    <button key={type} onClick={() => setSplitType(type)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition
                        ${splitType === type
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white dark:bg-slate-700 text-gray-500 border-gray-200'}`}>
                      {type === 'equal' ? 'Equal Split' : 'Custom Split'}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={addExpense} disabled={saving}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition disabled:opacity-50">
                {saving ? 'Saving...' : '+ Add Expense'}
              </button>
            </div>

            {/* Expenses List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Expenses
              </h3>
              {expenses.length === 0 ? (
                <p className="text-gray-300 text-center text-sm py-4">
                  No expenses yet. Add your first one!
                </p>
              ) : (
                <div className="space-y-3">
                  {expenses.map(exp => (
                    <div key={exp.id}
                      className="flex items-center justify-between p-3 bg-blue-50 dark:bg-slate-700 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {exp.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          Paid by {exp.paid_by} · {exp.split_type} split
                        </p>
                        <p className="text-xs text-blue-400 mt-1">
                          {exp.category || '📦 Other'}
                        </p>
                      </div>
                      <p className="text-blue-600 font-semibold">₹{exp.amount}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab: Summary */}
        {activeTab === 'summary' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
              📊 Spending Summary
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Total Spent: <span className="text-blue-500 font-bold">₹{total.toFixed(2)}</span>
            </p>
            {Object.keys(summary).length === 0 ? (
              <p className="text-gray-300 text-center text-sm py-4">No expenses yet</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(summary).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
                  const percent = ((amt / total) * 100).toFixed(1);
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-200">{cat}</span>
                        <span className="text-blue-500 font-medium">
                          ₹{amt.toFixed(2)} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-blue-100 dark:bg-slate-600 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Balances */}
        {activeTab === 'balances' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
              💰 Balances
            </h3>
            {expenses.length === 0 ? (
              <p className="text-gray-300 text-center text-sm py-4">
                Add expenses to see balances
              </p>
            ) : (
              <div className="space-y-2">
                {Object.entries(calculateBalances()).map(([name, balance]) => (
                  <div key={name}
                    className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-slate-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{name}</p>
                    <p className={`text-sm font-semibold ${
                      balance > 0 ? 'text-green-500' :
                      balance < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {balance > 0 ? `gets back ₹${balance.toFixed(2)}` :
                       balance < 0 ? `owes ₹${Math.abs(balance).toFixed(2)}` :
                       'settled up ✅'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;