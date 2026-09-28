# POPTO — C++ Academic Module
## Object-Oriented Lemon Order & Discount Processing

### Description
An object-oriented C++20 program demonstrating classes, encapsulation, smart pointers (`std::shared_ptr`), STL vectors, and a commercial invoice & coupon calculation engine for the POPTO platform.

### Compilation
Using G++ / Clang:
```bash
g++ -std=c++20 main.cpp -o popto_order
./popto_order
```

### Key OOP Concepts Demonstrated
- Classes & Encapsulation: `Product`, `Order`, `OrderItem`
- Resource safety via `std::shared_ptr`
- Maharashtra cold-chain delivery tier calculations (Free delivery for orders >= ₹499)
- Dynamic coupon validation and formatted terminal invoice generation
