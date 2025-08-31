// store/workersStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useWorkersStore = create(
  devtools(
    (set, get) => ({
      // State - Initialize with empty arrays instead of mockWorkers
      workers: [],
      selectedWorker: null,
      
      // Actions for managing workers list
      setWorkers: (workers) => set({ 
        workers: workers.map(worker => ({
          ...worker,
          orders: [] // Ensure each worker starts with empty orders
        }))
      }),
      
      addWorker: (worker) => set((state) => ({
        workers: [...state.workers, { ...worker, orders: [] }]
      })),
      
      removeWorker: (workerId) => set((state) => ({
        workers: state.workers.filter(worker => worker.id !== workerId),
        selectedWorker: state.selectedWorker?.id === workerId ? null : state.selectedWorker
      })),
      
      setSelectedWorker: (worker) => set({ selectedWorker: worker }),
      
      // Find worker by ID (helper function)
      findWorkerById: (workerId) => {
        return get().workers.find(w => w.id === workerId);
      },
      
      // Order management functions
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
              // Remove item if quantity is 0 or less
              return {
                ...worker,
                orders: worker.orders.filter(order => order.id !== itemId)
              };
            } else {
              const existingOrderIndex = worker.orders.findIndex(order => order.id === itemId);
              if (existingOrderIndex >= 0) {
                // Update existing order
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
      
      // Getter functions
      getWorkerOrders: (workerId) => {
        const worker = get().findWorkerById(workerId);
        return worker ? worker.orders : [];
      },
      
      getWorkerOrderTotal: (workerId) => {
        const orders = get().getWorkerOrders(workerId);
        return orders.reduce((total, order) => {
          const price = parseFloat(order.price) || 0;
          const quantity = parseInt(order.quantity) || 0;
          return total + (price * quantity);
        }, 0);
      },
      
      getWorkerOrderItemCount: (workerId) => {
        const orders = get().getWorkerOrders(workerId);
        return orders.reduce((total, order) => {
          const quantity = parseInt(order.quantity) || 0;
          return total + quantity;
        }, 0);
      },
      
      clearWorkerOrders: (workerId) => set((state) => ({
        workers: state.workers.map(worker =>
          worker.id === workerId ? { ...worker, orders: [] } : worker
        )
      })),
      
      clearAllOrders: () => set((state) => ({
        workers: state.workers.map(worker => ({ ...worker, orders: [] }))
      })),
      
      // Bulk operations
      updateWorkerStatus: (workerId, status) => set((state) => ({
        workers: state.workers.map(worker =>
          worker.id === workerId ? { ...worker, status } : worker
        )
      })),
      
      // Analytics/Helper functions
      getTotalOrdersCount: () => {
        const workers = get().workers;
        return workers.reduce((total, worker) => {
          return total + worker.orders.reduce((workerTotal, order) => {
            return workerTotal + (parseInt(order.quantity) || 0);
          }, 0);
        }, 0);
      },
      
      getTotalOrdersValue: () => {
        const workers = get().workers;
        return workers.reduce((total, worker) => {
          return total + worker.orders.reduce((workerTotal, order) => {
            const price = parseFloat(order.price) || 0;
            const quantity = parseInt(order.quantity) || 0;
            return workerTotal + (price * quantity);
          }, 0);
        }, 0);
      },
      
      getWorkersWithOrders: () => {
        return get().workers.filter(worker => worker.orders.length > 0);
      },
      
      getWorkerOrderSummary: (workerId) => {
        const orders = get().getWorkerOrders(workerId);
        const worker = get().findWorkerById(workerId);
        
        return {
          worker: worker,
          orders: orders,
          totalItems: orders.reduce((sum, order) => sum + (parseInt(order.quantity) || 0), 0),
          totalValue: orders.reduce((sum, order) => {
            const price = parseFloat(order.price) || 0;
            const quantity = parseInt(order.quantity) || 0;
            return sum + (price * quantity);
          }, 0),
          orderCount: orders.length
        };
      },
      
      // Debug function to log current state
      logWorkerOrders: (workerId) => {
        const state = get();
        const worker = state.findWorkerById(workerId);
        console.log('Worker Orders Debug:', {
          workerId,
          worker: worker?.name,
          orders: worker?.orders || [],
          total: state.getWorkerOrderTotal(workerId),
          itemCount: state.getWorkerOrderItemCount(workerId),
          allWorkers: state.workers.length
        });
      },
      
      // Debug function to log all workers and their orders
      logAllWorkersOrders: () => {
        const state = get();
        console.log('All Workers Orders Debug:', {
          totalWorkers: state.workers.length,
          workersWithOrders: state.getWorkersWithOrders().length,
          totalOrdersCount: state.getTotalOrdersCount(),
          totalOrdersValue: state.getTotalOrdersValue(),
          workers: state.workers.map(worker => ({
            id: worker.id,
            name: worker.name,
            ordersCount: worker.orders.length,
            totalValue: state.getWorkerOrderTotal(worker.id)
          }))
        });
      }
    }),
    {
      name: 'workers-store', // Name for devtools
    }
  )
);