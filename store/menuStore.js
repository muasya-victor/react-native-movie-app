import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useMenuStore = create(
  persist(
    (set, get) => ({
      menuItems: [
        { id: '1', name: 'Chipati', time: '8:20', image: null, quantity: 0 },
        { id: '2', name: 'Chai', time: '8:20', image: null, quantity: 0 },
        { id: '3', name: 'Beans', time: '8:40', image: null, quantity: 0 },
        { id: '4', name: 'Mandazi', time: '8:40', image: null, quantity: 0 },
      ],
      
      addMenuItem: (item) => {
        const newItem = {
          id: Date.now().toString(),
          quantity: 0,
          ...item,
        };
        set(state => ({
          menuItems: [...state.menuItems, newItem]
        }));
      },
      
      updateQuantity: (itemId, quantity) => {
        set(state => ({
          menuItems: state.menuItems.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        }));
      },
      
      removeMenuItem: (itemId) => {
        set(state => ({
          menuItems: state.menuItems.filter(item => item.id !== itemId)
        }));
      },
    }),
    { name: 'menu-storage' }
  )
);