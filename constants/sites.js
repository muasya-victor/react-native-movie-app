export const availableSites = [
  {
    id: '1',
    name: 'Construction Site A',
    address: '123 Main St, Nairobi',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=100&h=100&fit=crop&crop=center',
    type: 'Construction',
    workers: 25,
    status: 'Active',
    manager: 'John Mwangi',
    amountBorrowed: 7500,
    revenueFromBorrowing: 9200,
    revenueFromFood: 5350,
    teamMembers: [
      { id: '1', name: 'Ethan Carter', role: 'Supervisor' },
      { id: '2', name: 'Liam Harper', role: 'Worker' },
      { id: '3', name: 'Sarah Bennett', role: 'Safety Officer' },
      { id: '4', name: 'Oliver Hayes', role: 'Worker' },
    ]
  },
  {
    id: '2', 
    name: 'Renovation Project B',
    address: '456 Oak Ave, Mombasa',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=100&h=100&fit=crop&crop=center',
    type: 'Renovation',
    workers: 18,
    status: 'Active',
    manager: 'Grace Wanjiku',
    amountBorrowed: 5200,
    revenueFromBorrowing: 6800,
    revenueFromFood: 3200,
    teamMembers: [
      { id: '1', name: 'Grace Wanjiku', role: 'Manager' },
      { id: '2', name: 'David Ochieng', role: 'Worker' },
    ]
  },
  {
    id: '3',
    name: 'Landscaping Job C', 
    address: '789 Pine Ln, Kisumu',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=100&h=100&fit=crop&crop=center',
    type: 'Landscaping',
    workers: 12,
    status: 'Active',
    manager: 'Peter Kamau',
    amountBorrowed: 3000,
    revenueFromBorrowing: 4100,
    revenueFromFood: 2800,
    teamMembers: [
      { id: '1', name: 'Peter Kamau', role: 'Manager' },
      { id: '2', name: 'Alice Nyong', role: 'Worker' },
    ]
  }
];