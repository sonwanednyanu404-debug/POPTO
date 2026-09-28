/**
 * POPTO Lemon Order Processing System (C++ Module)
 * Brand: POPTO - From Farmers to Buyers
 * Focus: OOP Order Execution, Discount Engine, and Maharashtra Delivery Processing
 */

#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
#include <memory>

class Product {
private:
    int id;
    std::string name;
    std::string district;
    double price;
    int stock;
    bool isOrganic;

public:
    Product(int id, std::string name, std::string district, double price, int stock, bool isOrganic)
        : id(id), name(name), district(district), price(price), stock(stock), isOrganic(isOrganic) {}

    int getId() const { return id; }
    std::string getName() const { return name; }
    std::string getDistrict() const { return district; }
    double getPrice() const { return price; }
    int getStock() const { return stock; }
    bool getIsOrganic() const { return isOrganic; }

    bool reduceStock(int qty) {
        if (qty <= stock) {
            stock -= qty;
            return true;
        }
        return false;
    }
};

struct OrderItem {
    std::shared_ptr<Product> product;
    int quantity;

    double getTotal() const {
        return product->getPrice() * quantity;
    }
};

class Order {
private:
    std::string orderNumber;
    std::string customerName;
    std::string deliveryCity;
    std::vector<OrderItem> items;
    std::string couponCode;
    double discount;
    double deliveryFee;

public:
    Order(std::string orderNumber, std::string customerName, std::string deliveryCity)
        : orderNumber(orderNumber), customerName(customerName), deliveryCity(deliveryCity), discount(0.0), deliveryFee(49.0) {}

    void addItem(std::shared_ptr<Product> product, int quantity) {
        if (product->reduceStock(quantity)) {
            items.push_back({product, quantity});
        } else {
            std::cout << "Warning: Insufficient stock for " << product->getName() << "!\n";
        }
    }

    void applyCoupon(const std::string& code) {
        couponCode = code;
        double subtotal = getSubtotal();
        if (code == "LEMON10") {
            discount = subtotal * 0.10; // 10% off
            std::cout << "Coupon LEMON10 applied: 10% Discount!\n";
        } else if (code == "POPTO50" && subtotal >= 300) {
            discount = 50.0;
            std::cout << "Coupon POPTO50 applied: Rs. 50 Flat Discount!\n";
        } else {
            std::cout << "Coupon invalid or minimum requirement not met.\n";
        }
    }

    double getSubtotal() const {
        double sub = 0;
        for (const auto& it : items) {
            sub += it.getTotal();
        }
        return sub;
    }

    double getFinalTotal() const {
        double sub = getSubtotal();
        double effectiveDelivery = (sub >= 499.0) ? 0.0 : deliveryFee;
        return std::max(0.0, sub - discount + effectiveDelivery);
    }

    void printInvoice() const {
        std::cout << "\n========================================================\n";
        std::cout << "          POPTO — OFFICIAL TAX INVOICE                  \n";
        std::cout << "========================================================\n";
        std::cout << "Order Number: " << orderNumber << "\n";
        std::cout << "Customer    : " << customerName << "\n";
        std::cout << "Delivery To : " << deliveryCity << ", Maharashtra (Cold-Chain)\n";
        std::cout << "--------------------------------------------------------\n";
        std::cout << std::left << std::setw(24) << "Produce Item"
                  << std::setw(8) << "Qty"
                  << std::setw(12) << "Rate (Rs)"
                  << "Total (Rs)\n";
        std::cout << "--------------------------------------------------------\n";

        for (const auto& it : items) {
            std::cout << std::left << std::setw(24) << it.product->getName()
                      << std::setw(8) << (std::to_string(it.quantity) + " kg")
                      << std::setw(12) << std::fixed << std::setprecision(2) << it.product->getPrice()
                      << it.getTotal() << "\n";
        }

        double sub = getSubtotal();
        double effectiveDelivery = (sub >= 499.0) ? 0.0 : deliveryFee;

        std::cout << "--------------------------------------------------------\n";
        std::cout << std::right << std::setw(44) << "Subtotal: Rs. " << sub << "\n";
        if (discount > 0) {
            std::cout << std::setw(44) << ("Discount (" + couponCode + "): -Rs. ") << discount << "\n";
        }
        std::cout << std::setw(44) << "Maharashtra Cold Delivery: Rs. " << effectiveDelivery << "\n";
        std::cout << "========================================================\n";
        std::cout << std::setw(44) << "FINAL TOTAL PAYABLE: Rs. " << getFinalTotal() << "\n";
        std::cout << "========================================================\n";
        std::cout << "Thank you for empowering Maharashtra Lemon Farmers!\n\n";
    }
};

int main() {
    std::cout << "Initializing POPTO Lemon E-Commerce Engine (C++)...\n\n";

    // Catalog products
    auto p1 = std::make_shared<Product>(1, "Solapur Kagzi Lemon", "Solapur", 80.0, 150, true);
    auto p2 = std::make_shared<Product>(2, "Jalgaon Seedless Batch", "Jalgaon", 95.0, 80, true);
    auto p3 = std::make_shared<Product>(3, "Ahmednagar Commercial Pack", "Ahmednagar", 65.0, 200, false);

    // Demonstrate order flow
    Order order("POPTO-2026-CPP-01", "Priya Kulkarni", "Pune");
    order.addItem(p1, 5);  // 5 kg Solapur Kagzi
    order.addItem(p2, 3);  // 3 kg Jalgaon Seedless

    order.applyCoupon("LEMON10");
    order.printInvoice();

    return 0;
}
