// store/workersStore.js
import { create } from 'zustand';

const mockWorkers = [
  {
    id: '1',
    name: 'Ethan Carter',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    department: 'Engineering',
    orders: []
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=100&h=100&fit=crop&crop=face',
    department: 'Marketing',
    orders: []
  },
  {
    id: '3',
    name: 'Michael Chen',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    department: 'Sales',
    orders: []
  },
  {
    id: '4',
    name: 'Jessica Williams',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    department: 'Design',
    orders: []
  },
  {
    id: '5',
    name: 'David Rodriguez',
    status: 'busy',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    department: 'HR',
    orders: []
  },
  {
    id: '6',
    name: 'Emily Davis',
    status: 'offline',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    department: 'Finance',
    orders: []
  }
];

export const useWorkersStore = create((set, get) => ({
  workers: mockWorkers,
  selectedWorker: mockWorkers[0],
  
  setSelectedWorker: (worker) => set({ selectedWorker: worker }),
  
  addOrderItem: (workerId, item, quantity = 1) => set((state) => ({
    workers: state.workers.map(worker => {
      if (worker.id === workerId) {
        const existingOrderIndex = worker.orders.findIndex(order => order.id === item.id);
        if (existingOrderIndex >= 0) {
          const updatedOrders = [...worker.orders];
          updatedOrders[existingOrderIndex] = {
            ...updatedOrders[existingOrderIndex],
            quantity: updatedOrders[existingOrderIndex].quantity + quantity
          };
          return { ...worker, orders: updatedOrders };
        } else {
          return {
            ...worker,
            orders: [...worker.orders, { ...item, quantity }]
          };
        }
      }
      return worker;
    })
  })),
  
  updateOrderQuantity: (workerId, itemId, quantity, itemData = null) => set((state) => ({
    workers: state.workers.map(worker => {
      if (worker.id === workerId) {
        if (quantity <= 0) {
          return {
            ...worker,
            orders: worker.orders.filter(order => order.id !== itemId)
          };
        } else {
          const existingOrderIndex = worker.orders.findIndex(order => order.id === itemId);
          if (existingOrderIndex >= 0) {
            return {
              ...worker,
              orders: worker.orders.map(order =>
                order.id === itemId ? { ...order, quantity } : order
              )
            };
          } else if (itemData) {
            // Add new item if it doesn't exist and we have item data
            return {
              ...worker,
              orders: [...worker.orders, { ...itemData, quantity }]
            };
          }
        }
      }
      return worker;
    })
  })),
  
  getWorkerOrders: (workerId) => {
    const worker = get().workers.find(w => w.id === workerId);
    return worker ? worker.orders : [];
  },
  
  getWorkerOrderTotal: (workerId) => {
    const orders = get().getWorkerOrders(workerId);
    return orders.reduce((total, order) => total + (order.price * order.quantity), 0);
  },
  
  getWorkerOrderItemCount: (workerId) => {
    const orders = get().getWorkerOrders(workerId);
    return orders.reduce((total, order) => total + order.quantity, 0);
  },
  
  clearWorkerOrders: (workerId) => set((state) => ({
    workers: state.workers.map(worker =>
      worker.id === workerId ? { ...worker, orders: [] } : worker
    )
  })),

  // Debug function to log current state
  logWorkerOrders: (workerId) => {
    const state = get();
    const worker = state.workers.find(w => w.id === workerId);
    console.log('Worker Orders Debug:', {
      worker: worker?.name,
      orders: worker?.orders || [],
      total: state.getWorkerOrderTotal(workerId),
      itemCount: state.getWorkerOrderItemCount(workerId)
    });
  }
}));