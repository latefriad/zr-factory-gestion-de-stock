/**
 * API Service for ZR Factory Google Sheets Backend
 * Bulletproof Browser Fetch with no-cors support and instant optimistic cache
 */

const DEFAULT_API_URL = "https://script.google.com/macros/s/AKfycbz5dsEyL82Eqypz3ANiHKD-3Yq_lvhwa76cPU5kojBuGJZugmQ93QHlFcr119ES5v64/exec";
const STORAGE_KEY_URL = "zr_factory_api_url";
const STORAGE_KEY_CACHE = "zr_factory_cache_data";

export const getApiUrl = () => {
  return localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_API_URL;
};

export const setApiUrl = (url) => {
  localStorage.setItem(STORAGE_KEY_URL, url);
};

export const getCachedData = () => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY_CACHE);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    return null;
  }
};

export const saveCacheData = (data) => {
  localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(data));
};

// Fetch live data from Google Sheets
export const fetchAllData = async () => {
  const url = getApiUrl();
  try {
    const res = await fetch(`${url}?action=GET_ALL&t=${Date.now()}`, {
      method: "GET",
      cache: "no-store"
    });
    const data = await res.json();
    if (data && data.status === "success") {
      saveCacheData(data);
      return { success: true, data };
    }
    throw new Error(data.message || "Invalid response");
  } catch (error) {
    console.warn("Fetch live error, using cache:", error);
    const cache = getCachedData();
    return {
      success: false,
      error: error.message,
      data: cache || {
        stock_blanks: [],
        stock_consumables: [],
        clients: [],
        orders: [],
        expenses: [],
        waste: [],
        movements: []
      }
    };
  }
};

// Universal dispatcher: Sends POST to Google Apps Script
const postToSheet = async (payload) => {
  const url = getApiUrl();
  const bodyText = JSON.stringify(payload);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: bodyText
    });
    const result = await res.json();
    return result;
  } catch (err) {
    try {
      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain"
        },
        body: bodyText
      });
      return { status: "success_sent_nocors" };
    } catch (e2) {
      console.error("All fetch attempts failed:", e2);
      return { status: "error", message: e2.message };
    }
  }
};

// CRUD API METHODS
export const addOrderApi = (order) => postToSheet({ action: "ADD_ORDER", order });
export const updateOrderStatusApi = (orderId, newStatus) => postToSheet({ action: "UPDATE_ORDER_STATUS", orderId, newStatus });
export const editOrderApi = (order) => postToSheet({ action: "EDIT_ORDER", order });
export const deleteOrderApi = (orderId) => postToSheet({ action: "DELETE_ORDER", orderId });

export const addStockItemApi = (stockType, item) => postToSheet({ action: "UPDATE_STOCK", stockType, item });
export const editStockItemApi = (stockType, item) => postToSheet({ action: "EDIT_STOCK", stockType, item });
export const deleteStockItemApi = (stockType, id) => postToSheet({ action: "DELETE_STOCK", stockType, id });
export const adjustStockQtyApi = (stockType, id, delta) => postToSheet({ action: "ADJUST_STOCK_QTY", stockType, id, delta });

export const addClientApi = (client) => postToSheet({ action: "ADD_CLIENT", client });
export const editClientApi = (client) => postToSheet({ action: "EDIT_CLIENT", client });
export const deleteClientApi = (clientId) => postToSheet({ action: "DELETE_CLIENT", clientId });

export const addExpenseApi = (expense) => postToSheet({ action: "ADD_EXPENSE", expense });
export const editExpenseApi = (expense) => postToSheet({ action: "EDIT_EXPENSE", expense });
export const deleteExpenseApi = (expenseId) => postToSheet({ action: "DELETE_EXPENSE", expenseId });

export const addWasteApi = (waste) => postToSheet({ action: "ADD_WASTE", waste });
export const deleteWasteApi = (wasteId) => postToSheet({ action: "DELETE_WASTE", wasteId });
