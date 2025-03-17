const axios = require("axios");

module.exports = async (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");

	if (req.method === "OPTIONS") {
		return res.status(200).end();
	}

	const { store, token } = req.query;

	if (!store || !token) {
		return res
			.status(400)
			.json({ error: "Missing store name or access token" });
	}

	try {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		const createdAtMin = thirtyDaysAgo.toISOString();

		const url = `https://${store}.myshopify.com/admin/api/2025-01/orders.json?status=any&created_at_min=${createdAtMin}`;

		const response = await axios.get(url, {
			headers: {
				"X-Shopify-Access-Token": token,
				"Content-Type": "application/json",
			},
		});

		const orders = response.data.orders;
		const fraudulentOrders = orders.filter(
			(order) =>
				(order.cancel_reason === "fraud" && order.cancelled_at) ||
				(order.refunds.length > 0 &&
					order.refunds.some((refund) => refund.reason === "fraud"))
		);

		res.status(200).json(fraudulentOrders);
	} catch (error) {
		console.error("Error fetching orders:", error);
		res.status(500).json({ error: "Failed to fetch orders from Shopify" });
	}
};
