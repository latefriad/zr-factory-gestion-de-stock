/**
 * =========================================================
 * ZR FACTORY - PRINT ON DEMAND (DTF) BACKEND ENGINE v2.0
 * Full CRUD: Create, Read, Update, Delete for All Tables
 * Currency: DA (Algerian Dinar)
 * =========================================================
 */

function doGet(e) {
  try {
    const action = e.parameter.action || "GET_ALL";
    if (action === "SETUP") {
      return jsonResponse({ status: "success", message: setupDatabase() });
    }
    return jsonResponse(getAllData());
  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = data.action;

    // --- ORDERS CRUD ---
    if (action === "ADD_ORDER") {
      return jsonResponse(handleNewOrder(ss, data.order));
    } else if (action === "UPDATE_ORDER_STATUS") {
      return jsonResponse(handleUpdateOrderStatus(ss, data.orderId, data.newStatus));
    } else if (action === "EDIT_ORDER") {
      return jsonResponse(handleEditOrder(ss, data.order));
    } else if (action === "DELETE_ORDER") {
      return jsonResponse(deleteRowById(ss, "Orders", 0, data.orderId));
    }

    // --- STOCK CRUD ---
    else if (action === "UPDATE_STOCK") {
      return jsonResponse(handleUpdateStock(ss, data.stockType, data.item));
    } else if (action === "EDIT_STOCK") {
      return jsonResponse(handleEditStock(ss, data.stockType, data.item));
    } else if (action === "DELETE_STOCK") {
      const sheetName = data.stockType === "consumable" ? "Stock_Consumables" : "Stock_Blanks";
      return jsonResponse(deleteRowById(ss, sheetName, 0, data.id));
    } else if (action === "ADJUST_STOCK_QTY") {
      return jsonResponse(handleAdjustStockQty(ss, data.stockType, data.id, data.delta));
    }

    // --- CLIENTS CRUD ---
    else if (action === "ADD_CLIENT") {
      return jsonResponse(handleAddClient(ss, data.client));
    } else if (action === "EDIT_CLIENT") {
      return jsonResponse(handleEditClient(ss, data.client));
    } else if (action === "DELETE_CLIENT") {
      return jsonResponse(deleteRowById(ss, "Clients", 0, data.clientId));
    }

    // --- EXPENSES CRUD ---
    else if (action === "ADD_EXPENSE") {
      return jsonResponse(handleAddExpense(ss, data.expense));
    } else if (action === "EDIT_EXPENSE") {
      return jsonResponse(handleEditExpense(ss, data.expense));
    } else if (action === "DELETE_EXPENSE") {
      return jsonResponse(deleteRowById(ss, "Expenses", 0, data.expenseId));
    }

    // --- WASTE CRUD ---
    else if (action === "ADD_WASTE") {
      return jsonResponse(handleAddWaste(ss, data.waste));
    } else if (action === "DELETE_WASTE") {
      return jsonResponse(deleteRowById(ss, "Waste_Rebuts", 0, data.wasteId));
    }

    return jsonResponse({ status: "error", message: "Action non reconnue: " + action });
  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() });
  }
}

// ----------------------------------------------------
// HELPER: DELETE A ROW BY COLUMN VALUE (E.G. ID)
// ----------------------------------------------------
function deleteRowById(ss, sheetName, colIndex, targetValue) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { status: "error", message: "Sheet introuvable: " + sheetName };
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colIndex]).trim() === String(targetValue).trim()) {
      sheet.deleteRow(i + 1);
      return { status: "success", deletedId: targetValue };
    }
  }
  return { status: "not_found", message: "ID non trouvé" };
}

// ----------------------------------------------------
// EDIT ORDER
// ----------------------------------------------------
function handleEditOrder(ss, order) {
  const sheet = ss.getSheetByName("Orders");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(order.Order_ID).trim()) {
      sheet.getRange(i + 1, 3).setValue(order.Client_Name);
      sheet.getRange(i + 1, 4).setValue(order.Client_Phone || "");
      sheet.getRange(i + 1, 8).setValue(Number(order.Quantity));
      sheet.getRange(i + 1, 9).setValue(order.Print_Details);
      sheet.getRange(i + 1, 11).setValue(Number(order.Total_Price_DA));
      sheet.getRange(i + 1, 12).setValue(Number(order.Paid_Amount_DA || 0));
      sheet.getRange(i + 1, 13).setValue(Number(order.Remaining_DA || 0));
      sheet.getRange(i + 1, 14).setValue(order.Status || "Pending");
      sheet.getRange(i + 1, 15).setValue(order.Notes || "");
      return { status: "success" };
    }
  }
  return { status: "not_found" };
}

// ----------------------------------------------------
// EDIT STOCK
// ----------------------------------------------------
function handleEditStock(ss, stockType, item) {
  const sheetName = stockType === "consumable" ? "Stock_Consumables" : "Stock_Blanks";
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const dateStr = new Date().toISOString().slice(0, 10);

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(item.ID).trim()) {
      if (stockType === "consumable") {
        sheet.getRange(i + 1, 2).setValue(item.Category);
        sheet.getRange(i + 1, 3).setValue(item.Item_Name);
        sheet.getRange(i + 1, 4).setValue(Number(item.Quantity));
        sheet.getRange(i + 1, 5).setValue(item.Unit);
        sheet.getRange(i + 1, 6).setValue(Number(item.Min_Alert || 1));
        sheet.getRange(i + 1, 7).setValue(Number(item.Unit_Cost_DA));
        sheet.getRange(i + 1, 8).setValue(dateStr);
      } else {
        sheet.getRange(i + 1, 2).setValue(item.Category);
        sheet.getRange(i + 1, 3).setValue(item.Item_Name);
        sheet.getRange(i + 1, 4).setValue(item.Color);
        sheet.getRange(i + 1, 5).setValue(item.Size);
        sheet.getRange(i + 1, 6).setValue(Number(item.Quantity));
        sheet.getRange(i + 1, 7).setValue(Number(item.Min_Alert || 5));
        sheet.getRange(i + 1, 8).setValue(Number(item.Unit_Cost_DA));
        sheet.getRange(i + 1, 9).setValue(Number(item.Unit_Price_DA));
        sheet.getRange(i + 1, 10).setValue(dateStr);
      }
      return { status: "success" };
    }
  }
  return { status: "not_found" };
}

// ----------------------------------------------------
// QUICK ADJUST STOCK QTY
// ----------------------------------------------------
function handleAdjustStockQty(ss, stockType, id, delta) {
  const sheetName = stockType === "consumable" ? "Stock_Consumables" : "Stock_Blanks";
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const col = stockType === "consumable" ? 4 : 6;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(id).trim()) {
      const current = Number(data[i][col - 1]);
      const next = Math.max(0, current + Number(delta));
      sheet.getRange(i + 1, col).setValue(next);
      return { status: "success", newQty: next };
    }
  }
  return { status: "not_found" };
}

// ----------------------------------------------------
// EDIT CLIENT
// ----------------------------------------------------
function handleEditClient(ss, client) {
  const sheet = ss.getSheetByName("Clients");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(client.ID).trim()) {
      sheet.getRange(i + 1, 2).setValue(client.Name_or_Brand);
      sheet.getRange(i + 1, 3).setValue(client.Phone || "");
      sheet.getRange(i + 1, 4).setValue(client.City || "");
      sheet.getRange(i + 1, 7).setValue(Number(client.Remaining_Debt_DA || 0));
      sheet.getRange(i + 1, 8).setValue(client.Notes || "");
      return { status: "success" };
    }
  }
  return { status: "not_found" };
}

// ----------------------------------------------------
// EDIT EXPENSE
// ----------------------------------------------------
function handleEditExpense(ss, expense) {
  const sheet = ss.getSheetByName("Expenses");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(expense.ID).trim()) {
      sheet.getRange(i + 1, 3).setValue(expense.Category);
      sheet.getRange(i + 1, 4).setValue(expense.Description);
      sheet.getRange(i + 1, 5).setValue(Number(expense.Amount_DA));
      sheet.getRange(i + 1, 6).setValue(expense.Payment_Method || "Cash");
      return { status: "success" };
    }
  }
  return { status: "not_found" };
}

// ----------------------------------------------------
// READ ALL DATA
// ----------------------------------------------------
function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    status: "success",
    timestamp: new Date().toISOString(),
    stock_blanks: sheetToObjects(ss.getSheetByName("Stock_Blanks")),
    stock_consumables: sheetToObjects(ss.getSheetByName("Stock_Consumables")),
    clients: sheetToObjects(ss.getSheetByName("Clients")),
    orders: sheetToObjects(ss.getSheetByName("Orders")),
    expenses: sheetToObjects(ss.getSheetByName("Expenses")),
    waste: sheetToObjects(ss.getSheetByName("Waste_Rebuts")),
    movements: sheetToObjects(ss.getSheetByName("Movements_Log"))
  };
}

function sheetToObjects(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    rows.push(row);
  }
  return rows;
}

// ----------------------------------------------------
// NEW ORDER & INVENTORY DECREMENT
// ----------------------------------------------------
function handleNewOrder(ss, order) {
  const ordersSheet = ss.getSheetByName("Orders");
  const blanksSheet = ss.getSheetByName("Stock_Blanks");
  const movementsSheet = ss.getSheetByName("Movements_Log");
  const clientsSheet = ss.getSheetByName("Clients");

  const orderId = "ORD-" + (ordersSheet.getLastRow() + 1000);
  const dateStr = order.date || new Date().toISOString().slice(0, 10);
  const remaining = Number(order.total_price_da) - Number(order.paid_amount_da || 0);

  ordersSheet.appendRow([
    orderId,
    dateStr,
    order.client_name,
    order.client_phone || "",
    order.blank_item,
    order.color || "",
    order.size || "",
    Number(order.quantity),
    order.print_details || "DTF",
    order.design_ref || "",
    Number(order.total_price_da),
    Number(order.paid_amount_da || 0),
    remaining,
    order.status || "Pending",
    order.notes || ""
  ]);

  // Decrement blank stock (Supports multi-variant items & single item fallback)
  const blanksData = blanksSheet.getDataRange().getValues();
  if (order.items && order.items.length > 0) {
    for (let k = 0; k < order.items.length; k++) {
      const it = order.items[k];
      const prodName = String(it.productName || it.product || order.blank_item).trim().toLowerCase();
      const colName = String(it.color || "").trim().toLowerCase();
      const szName = String(it.size || "").trim().toLowerCase();
      const itQty = Number(it.quantity || 1);

      for (let i = 1; i < blanksData.length; i++) {
        if (
          String(blanksData[i][2]).trim().toLowerCase() === prodName &&
          String(blanksData[i][3]).trim().toLowerCase() === colName &&
          String(blanksData[i][4]).trim().toLowerCase() === szName
        ) {
          const currentQty = Number(blanksData[i][5]);
          const newQty = Math.max(0, currentQty - itQty);
          blanksSheet.getRange(i + 1, 6).setValue(newQty);
          blanksSheet.getRange(i + 1, 10).setValue(dateStr);
          blanksData[i][5] = newQty; // update local cache

          // Log movement for this variant
          movementsSheet.appendRow([
            "MOV-" + Date.now() + "-" + k,
            dateStr,
            "OUT",
            "Blank",
            it.productName + " (" + it.color + " - " + it.size + ")",
            itQty,
            orderId,
            "Commande: " + order.client_name
          ]);
          break;
        }
      }
    }
  } else {
    for (let i = 1; i < blanksData.length; i++) {
      if (
        String(blanksData[i][2]).trim().toLowerCase() === String(order.blank_item).trim().toLowerCase() &&
        String(blanksData[i][3]).trim().toLowerCase() === String(order.color).trim().toLowerCase() &&
        String(blanksData[i][4]).trim().toLowerCase() === String(order.size).trim().toLowerCase()
      ) {
        const currentQty = Number(blanksData[i][5]);
        const newQty = Math.max(0, currentQty - Number(order.quantity));
        blanksSheet.getRange(i + 1, 6).setValue(newQty);
        blanksSheet.getRange(i + 1, 10).setValue(dateStr);

        // Log movement
        movementsSheet.appendRow([
          "MOV-" + Date.now(),
          dateStr,
          "OUT",
          "Blank",
          order.blank_item + " (" + order.color + " - " + order.size + ")",
          Number(order.quantity),
          orderId,
          "Commande: " + order.client_name
        ]);
        break;
      }
    }
  }

  updateClientStats(clientsSheet, order.client_name, order.client_phone, Number(order.total_price_da), remaining);
  return { status: "success", orderId: orderId };
}

function handleUpdateOrderStatus(ss, orderId, newStatus) {
  const sheet = ss.getSheetByName("Orders");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(orderId).trim()) {
      sheet.getRange(i + 1, 14).setValue(newStatus);
      return { status: "success" };
    }
  }
  return { status: "error", message: "Commande introuvable" };
}

function handleUpdateStock(ss, stockType, item) {
  const sheet = ss.getSheetByName(stockType === "consumable" ? "Stock_Consumables" : "Stock_Blanks");
  const dateStr = new Date().toISOString().slice(0, 10);
  if (stockType === "consumable") {
    const id = item.id || ("CSM-" + (sheet.getLastRow() + 100));
    sheet.appendRow([id, item.category, item.item_name, Number(item.quantity), item.unit, Number(item.min_alert || 1), Number(item.unit_cost_da), dateStr]);
  } else {
    const id = item.id || ("BLK-" + (sheet.getLastRow() + 100));
    sheet.appendRow([id, item.category, item.item_name, item.color, item.size, Number(item.quantity), Number(item.min_alert || 5), Number(item.unit_cost_da), Number(item.unit_price_da), dateStr]);
  }
  return { status: "success" };
}

function handleAddClient(ss, client) {
  const sheet = ss.getSheetByName("Clients");
  const id = "CLI-" + (sheet.getLastRow() + 100);
  sheet.appendRow([id, client.name, client.phone || "", client.city || "", 0, 0, 0, client.notes || "", new Date().toISOString().slice(0, 10)]);
  return { status: "success", clientId: id };
}

function handleAddExpense(ss, expense) {
  const sheet = ss.getSheetByName("Expenses");
  const id = "EXP-" + (sheet.getLastRow() + 100);
  sheet.appendRow([id, expense.date || new Date().toISOString().slice(0, 10), expense.category, expense.description, Number(expense.amount_da), expense.payment_method || "Cash"]);
  return { status: "success", expenseId: id };
}

function handleAddWaste(ss, waste) {
  const sheet = ss.getSheetByName("Waste_Rebuts");
  const id = "WST-" + (sheet.getLastRow() + 100);
  sheet.appendRow([id, waste.date || new Date().toISOString().slice(0, 10), waste.item_name, Number(waste.quantity), waste.reason, Number(waste.loss_cost_da || 0)]);
  return { status: "success", wasteId: id };
}

function updateClientStats(sheet, clientName, phone, orderAmount, remainingDebt) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === String(clientName).trim().toLowerCase()) {
      const ordersCount = Number(data[i][4]) + 1;
      const totalSpent = Number(data[i][5]) + orderAmount;
      const debt = Number(data[i][6]) + remainingDebt;
      sheet.getRange(i + 1, 5).setValue(ordersCount);
      sheet.getRange(i + 1, 6).setValue(totalSpent);
      sheet.getRange(i + 1, 7).setValue(debt);
      return;
    }
  }
  const id = "CLI-" + (sheet.getLastRow() + 100);
  sheet.appendRow([id, clientName, phone || "", "", 1, orderAmount, remainingDebt, "", new Date().toISOString().slice(0, 10)]);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
