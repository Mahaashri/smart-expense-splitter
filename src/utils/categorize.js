export const categorizeExpense = (title) => {
  const text = title.toLowerCase();

  if (['food', 'dinner', 'lunch', 'breakfast', 
       'restaurant', 'swiggy', 'zomato', 'snack',
       'coffee', 'tea'].some(k => text.includes(k))) {
    return '🍔 Food';
  }

  if (['uber', 'ola', 'cab', 'petrol', 'diesel',
       'bus', 'train', 'auto', 'transport',
       'fuel', 'flight'].some(k => text.includes(k))) {
    return '🚗 Transport';
  }

  if (['hotel', 'rent', 'airbnb', 'stay', 
       'room', 'hostel', 'accommodation',
       'house'].some(k => text.includes(k))) {
    return '🏠 Stay';
  }

  if (['movie', 'party', 'game', 'cricket',
       'concert', 'club', 'show', 'fun',
       'entertainment'].some(k => text.includes(k))) {
    return '🎉 Entertainment';
  }

  if (['medicine', 'doctor', 'hospital',
       'pharmacy', 'health', 'medical',
       'clinic'].some(k => text.includes(k))) {
    return '💊 Health';
  }

  return '📦 Other';
};