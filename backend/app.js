import fs from "node:fs/promises";
import path from "node:path"; // 1. Import path module
import bodyParser from "body-parser";
import express from "express";

const app = express();

// 2. Define an absolute path to your data folder
// process.cwd() points to the project root, so we add 'backend' and 'data'
const dataPath = path.join(process.cwd(), "backend", "data");

app.use(bodyParser.json());
app.use(express.static("public"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// 3. Re-added the Meals route with a try/catch safety net
app.get("/api/meals", async (req, res) => {
  try {
    const filePath = path.join(dataPath, "available-meals.json");
    const meals = await fs.readFile(filePath, "utf8");
    res.json(JSON.parse(meals));
  } catch (error) {
    console.error("Meals Load Error:", error);
    res.status(500).json({ message: "Failed to load meals data." });
  }
});

app.post("/api/orders", async (req, res) => {
  const orderData = req.body.order;

  if (!orderData || !orderData.items || orderData.items.length === 0) {
    return res.status(400).json({ message: "Missing data." });
  }

  // ... (Validation logic stays the same)

  try {
    const newOrder = {
      ...orderData,
      id: (Math.random() * 1000).toString(),
    };

    // 4. Use the absolute dataPath here too
    const ordersFilePath = path.join(dataPath, "orders.json");
    const orders = await fs.readFile(ordersFilePath, "utf8");
    const allOrders = JSON.parse(orders);
    allOrders.push(newOrder);

    await fs.writeFile(ordersFilePath, JSON.stringify(allOrders));
    res.status(201).json({ message: "Order created!" });
  } catch (error) {
    console.error("Order Save Error:", error);
    res.status(500).json({ message: "Failed to save order." });
  }
});

// Diagnostic route to check if backend is alive
app.get("/api/check", (req, res) => {
  res.json({ message: "Backend is reachable!", path: dataPath });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
