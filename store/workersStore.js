// store/workersStore.js
import { create } from "zustand";

export const useWorkersStore = create((set, get) => ({
  workers: [],
  selectedWorker: null,

  setSelectedWorker: (worker) => set({ selectedWorker: worker }),

  addOrderItem: (workerId, item, quantity = 1) =>
    set((state) => ({
      workers: state.workers.map((worker) => {
        if (worker.id === workerId) {
          const existingOrderIndex = worker.orders.findIndex(
            (order) => order.id === item.id
          );
          if (existingOrderIndex >= 0) {
            const updatedOrders = [...worker.orders];
            updatedOrders[existingOrderIndex] = {
              ...updatedOrders[existingOrderIndex],
              quantity: updatedOrders[existingOrderIndex].quantity + quantity,
            };
            return { ...worker, orders: updatedOrders };
          } else {
            return {
              ...worker,
              orders: [...worker.orders, { ...item, quantity }],
            };
          }
        }
        return worker;
      }),
    })),

  updateOrderQuantity: (workerId, itemId, quantity, itemData = null) =>
    set((state) => ({
      workers: state.workers.map((worker) => {
        if (worker.id === workerId) {
          if (quantity <= 0) {
            return {
              ...worker,
              orders: worker.orders.filter((order) => order.id !== itemId),
            };
          } else {
            const existingOrderIndex = worker.orders.findIndex(
              (order) => order.id === itemId
            );
            if (existingOrderIndex >= 0) {
              return {
                ...worker,
                orders: worker.orders.map((order) =>
                  order.id === itemId ? { ...order, quantity } : order
                ),
              };
            } else if (itemData) {
              // Add new item if it doesn't exist and we have item data
              return {
                ...worker,
                orders: [...worker.orders, { ...itemData, quantity }],
              };
            }
          }
        }
        return worker;
      }),
    })),

  getWorkerOrders: (workerId) => {
    const worker = get().workers.find((w) => w.id === workerId);
    return worker ? worker.orders : [];
  },

  getWorkerOrderTotal: (workerId) => {
    const orders = get().getWorkerOrders(workerId);
    return orders.reduce(
      (total, order) => total + order.price * order.quantity,
      0
    );
  },

  getWorkerOrderItemCount: (workerId) => {
    const orders = get().getWorkerOrders(workerId);
    return orders.reduce((total, order) => total + order.quantity, 0);
  },

  clearWorkerOrders: (workerId) =>
    set((state) => ({
      workers: state.workers.map((worker) =>
        worker.id === workerId ? { ...worker, orders: [] } : worker
      ),
    })),

  // Debug function to log current state
  logWorkerOrders: (workerId) => {
    const state = get();
    const worker = state.workers.find((w) => w.id === workerId);
    console.log("Worker Orders Debug:", {
      worker: worker?.name,
      orders: worker?.orders || [],
      total: state.getWorkerOrderTotal(workerId),
      itemCount: state.getWorkerOrderItemCount(workerId),
    });
  },
}));
