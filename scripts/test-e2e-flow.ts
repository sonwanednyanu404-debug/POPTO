async function testCustomerFlow(baseUrl: string) {
  console.log(`\nTesting End-to-End Customer Flow against: ${baseUrl}\n`);
  
  // Step 1: Home
  console.log("Step 1: Fetching Home Page (/) ...");
  const homeRes = await fetch(`${baseUrl}/`);
  if (!homeRes.ok) throw new Error(`Home returned status ${homeRes.status}`);
  console.log(`  ✓ Home page loaded successfully (HTTP ${homeRes.status})`);

  // Step 2: Shop & Products API
  console.log("Step 2: Fetching Shop & Catalog (/api/products) ...");
  const prodRes = await fetch(`${baseUrl}/api/products`);
  if (!prodRes.ok) throw new Error(`Products API returned status ${prodRes.status}`);
  const prodData: any = await prodRes.json();
  const products = prodData.data || prodData;
  if (!products || products.length === 0) throw new Error("No products found in catalog");
  console.log(`  ✓ Shop catalog loaded with ${products.length} products.`);

  // Step 3: Product Detail
  const selectedProduct = products[0];
  console.log(`Step 3: Fetching Product Detail (/api/products/${selectedProduct.id}) ...`);
  const detailRes = await fetch(`${baseUrl}/api/products/${selectedProduct.id}`);
  if (!detailRes.ok) throw new Error(`Product detail returned ${detailRes.status}`);
  console.log(`  ✓ Product detail verified: "${selectedProduct.name_en}" (₹${selectedProduct.price})`);

  // Step 4: Login
  console.log("Step 4: Customer Login (/api/auth/login) ...");
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "rahul.sharma@example.com", password: "Customer@123" })
  });
  if (!loginRes.ok) throw new Error(`Login failed with status ${loginRes.status}`);
  const loginData: any = await loginRes.json();
  const token = loginData.token;
  if (!token) throw new Error("No JWT token returned from login");
  console.log(`  ✓ Customer logged in as Rahul Sharma (Token received)`);

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };

  // Step 5: Add to Cart
  console.log("Step 5: Add to Cart (/api/cart) ...");
  const cartRes = await fetch(`${baseUrl}/api/cart`, {
    method: "POST",
    headers,
    body: JSON.stringify({ productId: selectedProduct.id, quantity: 1 })
  });
  if (!cartRes.ok) throw new Error(`Add to cart failed with status ${cartRes.status}`);
  console.log(`  ✓ 1x ${selectedProduct.name_en} added to cart`);

  // Step 6: Checkout / Address
  console.log("Step 6: Fetching Addresses (/api/addresses) ...");
  const addrRes = await fetch(`${baseUrl}/api/addresses`, { headers });
  if (!addrRes.ok) throw new Error(`Addresses fetch failed: ${addrRes.status}`);
  const addrData: any = await addrRes.json();
  const addresses = addrData.data || addrData;
  if (!addresses || addresses.length === 0) throw new Error("No address found for test user");
  const addressId = addresses[0].id;
  console.log(`  ✓ Delivery address selected: ${addresses[0].street}, ${addresses[0].city}`);

  // Step 7: Order Placement
  console.log("Step 7: Placing Order (/api/orders) ...");
  const orderRes = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      addressId,
      paymentMethod: "cod",
      deliveryMethod: "standard"
    })
  });
  if (!orderRes.ok) {
    const errBody = await orderRes.text();
    throw new Error(`Order placement failed (${orderRes.status}): ${errBody}`);
  }
  const orderData: any = await orderRes.json();
  const orderId = orderData.data?.id || orderData.orderId || orderData.id;
  console.log(`  ✓ Order created successfully! Order ID: ${orderId}`);

  // Step 8: Order Tracking
  console.log(`Step 8: Tracking Order (/api/orders/${orderId}) ...`);
  const trackRes = await fetch(`${baseUrl}/api/orders/${orderId}`, { headers });
  if (!trackRes.ok) throw new Error(`Order tracking failed (${trackRes.status})`);
  const trackData: any = await trackRes.json();
  console.log(`  ✓ Order verified. Status: ${trackData.data?.status || 'placed'}, Total: ₹${trackData.data?.total || trackData.data?.final_amount || 'N/A'}`);

  console.log("\n========================================================");
  console.log(" 🎉 ALL 8 END-TO-END STEPS COMPLETED SUCCESSFULLY!");
  console.log("========================================================\n");
}

const targetUrl = process.argv[2] || "http://localhost:3000";
testCustomerFlow(targetUrl).catch((err) => {
  console.error("E2E Test Error:", err.message);
  process.exit(1);
});
