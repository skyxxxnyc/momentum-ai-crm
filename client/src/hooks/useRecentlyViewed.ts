import { useEffect, useState } from "react";

export interface RecentlyViewedItem {
  id: number;
  type: "contact" | "company" | "deal";
  name: string;
  path: string;
  viewedAt: number;
}

const STORAGE_KEY = "siaCRM_recently_viewed";
const MAX_ITEMS = 5;

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setItems(parsed);
      }
    } catch (error) {
      console.error("Failed to load recently viewed items:", error);
    }
  };

  const addItem = (item: Omit<RecentlyViewedItem, "viewedAt">) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let current: RecentlyViewedItem[] = stored ? JSON.parse(stored) : [];

      // Remove existing item with same id and type
      current = current.filter((i) => !(i.id === item.id && i.type === item.type));

      // Add new item at the beginning
      const newItem: RecentlyViewedItem = {
        ...item,
        viewedAt: Date.now(),
      };
      current.unshift(newItem);

      // Keep only MAX_ITEMS
      current = current.slice(0, MAX_ITEMS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      setItems(current);
    } catch (error) {
      console.error("Failed to add recently viewed item:", error);
    }
  };

  const clearItems = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setItems([]);
    } catch (error) {
      console.error("Failed to clear recently viewed items:", error);
    }
  };

  return {
    items,
    addItem,
    clearItems,
  };
}
