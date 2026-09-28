/**
 * POPTO Lemon Inventory Management System (C Module)
 * Brand: POPTO - From Farmers to Buyers
 * Focus: Maharashtra Lemon Marketplace Inventory Tracking
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_VARIETIES 20
#define NAME_LEN 64
#define REGION_LEN 32

typedef struct {
    int id;
    char name[NAME_LEN];
    char district[REGION_LEN];
    float price_per_kg;
    int stock_kg;
    int is_organic; // 1 = Yes, 0 = No
    int total_sold_kg;
} LemonVariety;

typedef struct {
    LemonVariety items[MAX_VARIETIES];
    int count;
} Inventory;

void init_inventory(Inventory *inv) {
    inv->count = 0;

    // Seed realistic Maharashtra lemon varieties
    LemonVariety v1 = {101, "Kagzi Lemon Special", "Solapur", 75.0, 450, 1, 120};
    LemonVariety v2 = {102, "Baramasi Round Lemon", "Ahmednagar", 60.0, 300, 0, 85};
    LemonVariety v3 = {103, "Seedless Juicy Lemon", "Jalgaon", 95.0, 220, 1, 140};
    LemonVariety v4 = {104, "Nagpur Acid Lemon Grade-A", "Nagpur", 70.0, 500, 0, 210};

    inv->items[inv->count++] = v1;
    inv->items[inv->count++] = v2;
    inv->items[inv->count++] = v3;
    inv->items[inv->count++] = v4;
}

void display_inventory(const Inventory *inv) {
    printf("\n=========================================================================================\n");
    printf(" POPTO LEMON INVENTORY — MAHARASHTRA ORCHARDS\n");
    printf("=========================================================================================\n");
    printf("%-5s | %-26s | %-12s | %-10s | %-9s | %-8s | %-10s\n",
           "ID", "Variety Name", "District", "Price/Kg", "Stock", "Organic", "Total Sold");
    printf("-----------------------------------------------------------------------------------------\n");

    for (int i = 0; i < inv->count; i++) {
        const LemonVariety *v = &inv->items[i];
        printf("%-5d | %-26s | %-12s | Rs. %-6.2f | %-5d kg | %-8s | %-5d kg\n",
               v->id, v->name, v->district, v->price_per_kg, v->stock_kg,
               v->is_organic ? "YES (Org)" : "Standard", v->total_sold_kg);
    }
    printf("=========================================================================================\n");
}

void add_variety(Inventory *inv) {
    if (inv->count >= MAX_VARIETIES) {
        printf("\nError: Inventory database is full!\n");
        return;
    }

    LemonVariety v;
    printf("\n--- Register New Harvest Batch ---\n");
    printf("Enter Variety ID: ");
    scanf("%d", &v.id);
    getchar(); // consume newline

    printf("Enter Variety Name: ");
    fgets(v.name, NAME_LEN, stdin);
    v.name[strcspn(v.name, "\n")] = 0;

    printf("Enter Maharashtra District (e.g., Solapur, Jalgaon): ");
    fgets(v.district, REGION_LEN, stdin);
    v.district[strcspn(v.district, "\n")] = 0;

    printf("Enter Price per Kg (INR): ");
    scanf("%f", &v.price_per_kg);

    printf("Enter Initial Stock in Kg: ");
    scanf("%d", &v.stock_kg);

    printf("Is it Organic? (1 for Yes, 0 for No): ");
    scanf("%d", &v.is_organic);

    v.total_sold_kg = 0;

    inv->items[inv->count++] = v;
    printf("\nSuccess: Lemon variety '%s' registered under ID %d!\n", v.name, v.id);
}

void record_sale(Inventory *inv) {
    int id, qty;
    printf("\n--- Record Farm Dispatch / Sale ---\n");
    printf("Enter Variety ID: ");
    scanf("%d", &id);

    int found = -1;
    for (int i = 0; i < inv->count; i++) {
        if (inv->items[i].id == id) {
            found = i;
            break;
        }
    }

    if (found == -1) {
        printf("\nError: Lemon variety with ID %d not found!\n", id);
        return;
    }

    printf("Enter Quantity to Sell (Kg): ");
    scanf("%d", &qty);

    if (qty <= 0) {
        printf("\nError: Quantity must be greater than zero.\n");
        return;
    }

    if (inv->items[found].stock_kg < qty) {
        printf("\nError: Insufficient stock! Available: %d kg, Requested: %d kg\n",
               inv->items[found].stock_kg, qty);
        return;
    }

    inv->items[found].stock_kg -= qty;
    inv->items[found].total_sold_kg += qty;
    float revenue = qty * inv->items[found].price_per_kg;

    printf("\nOrder Confirmed!\n");
    printf("Dispatched: %d kg of %s\n", qty, inv->items[found].name);
    printf("Total Collected: Rs. %.2f\n", revenue);
    printf("Remaining Stock: %d kg\n", inv->items[found].stock_kg);
}

int main() {
    Inventory inv;
    init_inventory(&inv);

    int choice = 0;
    while (1) {
        printf("\n==========================================\n");
        printf("   POPTO — LEMON INVENTORY MANAGER (C)    \n");
        printf("==========================================\n");
        printf("1. View Current Inventory\n");
        printf("2. Record Produce Sale / Dispatch\n");
        printf("3. Register New Lemon Harvest Batch\n");
        printf("4. Exit\n");
        printf("Select an option (1-4): ");
        if (scanf("%d", &choice) != 1) break;

        switch (choice) {
            case 1: display_inventory(&inv); break;
            case 2: record_sale(&inv); break;
            case 3: add_variety(&inv); break;
            case 4:
                printf("\nExiting POPTO C Inventory Manager. Dhanyavaad!\n");
                return 0;
            default:
                printf("\nInvalid selection! Please enter 1 to 4.\n");
        }
    }
    return 0;
}
