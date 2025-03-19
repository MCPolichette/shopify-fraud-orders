const axios = require("axios");

module.exports = async (req, res) => {
	// ✅ Properly handle CORS headers
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization"
	);

	if (req.method === "OPTIONS") {
		return res.status(204).end(); // ✅ Handles preflight request
	}

	const { store, token, created_at_min } = req.query;

	if (!store || !token) {
		return res
			.status(400)
			.json({ error: "Missing store name or access token" });
	}

	try {
		const fields =
			"id,name,created_at,total_price,cancel_reason,financial_status,fulfillment_status";

		const url = `https://${store}.myshopify.com/admin/api/2025-01/orders.json?status=canceled&created_at_min=${created_at_min}&fields=${fields}`;

		const response = await axios.get(url, {
			headers: {
				"X-Shopify-Access-Token": token,
				"Content-Type": "application/json",
			},
		});

		res.status(200).json(response.data.orders);
	} catch (error) {
		console.error("Error fetching orders:", error);
		res.status(500).json({ error: "Failed to fetch orders from Shopify" });
	}
};
