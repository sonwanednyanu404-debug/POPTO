package popto;

import java.util.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * POPTO Lemon Marketplace Simulation (Java Module)
 * Brand: POPTO - From Farmers to Buyers
 * Focus: Multi-entity marketplace design, Farmer-to-Consumer transactions, and Inventory lifecycle
 */
public class Main {

    static class Farmer {
        private final String id;
        private final String name;
        private final String district;
        private double totalEarnings;

        public Farmer(String id, String name, String district) {
            this.id = id;
            this.name = name;
            this.district = district;
            this.totalEarnings = 0.0;
        }

        public String getName() { return name; }
        public String getDistrict() { return district; }
        public double getTotalEarnings() { return totalEarnings; }

        public void credit(double amount) {
            this.totalEarnings += amount;
        }
    }

    static class LemonProduct {
        private final String id;
        private final String name;
        private final Farmer farmer;
        private double pricePerKg;
        private int stockKg;
        private final boolean isOrganic;

        public LemonProduct(String id, String name, Farmer farmer, double pricePerKg, int stockKg, boolean isOrganic) {
            this.id = id;
            this.name = name;
            this.farmer = farmer;
            this.pricePerKg = pricePerKg;
            this.stockKg = stockKg;
            this.isOrganic = isOrganic;
        }

        public String getId() { return id; }
        public String getName() { return name; }
        public Farmer getFarmer() { return farmer; }
        public double getPricePerKg() { return pricePerKg; }
        public int getStockKg() { return stockKg; }
        public boolean isOrganic() { return isOrganic; }

        public synchronized boolean buy(int quantityKg) {
            if (quantityKg <= stockKg) {
                stockKg -= quantityKg;
                farmer.credit(quantityKg * pricePerKg);
                return true;
            }
            return false;
        }
    }

    static class Marketplace {
        private final List<LemonProduct> catalog = new ArrayList<>();

        public void listProduct(LemonProduct product) {
            catalog.add(product);
        }

        public void printCatalog() {
            System.out.println("\n==========================================================================");
            System.out.println(" POPTO DIGITAL LEMON MARKETPLACE — ACTIVE MAHARASHTRA CATALOG");
            System.out.println("==========================================================================");
            System.out.printf("%-6s | %-24s | %-14s | %-10s | %-8s | %-8s%n",
                    "ID", "Lemon Variety", "Farmer / District", "Price/Kg", "Stock", "Organic");
            System.out.println("--------------------------------------------------------------------------");
            for (LemonProduct p : catalog) {
                System.out.printf("%-6s | %-24s | %-14s | Rs. %-6.2f | %-5d kg | %-8s%n",
                        p.getId(), p.getName(),
                        p.getFarmer().getName() + " (" + p.getFarmer().getDistrict() + ")",
                        p.getPricePerKg(), p.getStockKg(),
                        p.isOrganic() ? "Yes" : "Standard");
            }
            System.out.println("==========================================================================\n");
        }
    }

    public static void main(String[] args) {
        System.out.println("Starting POPTO Java Marketplace Core Engine...\n");

        Marketplace marketplace = new Marketplace();

        // Register farmers
        Farmer f1 = new Farmer("F-101", "Rajesh Patil", "Solapur");
        Farmer f2 = new Farmer("F-102", "Sunita Jadhav", "Jalgaon");
        Farmer f3 = new Farmer("F-103", "Vikram Deshmukh", "Ahmednagar");

        // Register lemon varieties
        LemonProduct p1 = new LemonProduct("L-01", "Solapur Kagzi Premium", f1, 85.0, 500, true);
        LemonProduct p2 = new LemonProduct("L-02", "Jalgaon Seedless Fresh", f2, 95.0, 300, true);
        LemonProduct p3 = new LemonProduct("L-03", "Commercial Baramasi Box", f3, 65.0, 750, false);

        marketplace.listProduct(p1);
        marketplace.listProduct(p2);
        marketplace.listProduct(p3);

        // Display catalog
        marketplace.printCatalog();

        // Simulate customer purchase
        System.out.println("Simulating Order Placed by Customer Amit More (Pune)...");
        int purchaseQty = 25; // 25 kg for local restaurant
        if (p1.buy(purchaseQty)) {
            System.out.printf("Success: Purchased %d kg of '%s'%n", purchaseQty, p1.getName());
            System.out.printf("Total Transaction: Rs. %.2f%n", purchaseQty * p1.getPricePerKg());
            System.out.printf("Direct Payout to Farmer %s: Rs. %.2f%n", f1.getName(), f1.getTotalEarnings());
            System.out.printf("Remaining Orchard Stock: %d kg%n", p1.getStockKg());
        }

        System.out.println("\nPOPTO Java Simulation Complete. Discover. Plan. Progress.");
    }
}
