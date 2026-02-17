"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <ul className="divide-y divide-border">
                {cartItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-6 py-6 bg-white dark:bg-slate-800/90 rounded-xl px-4 shadow-md border border-blue-200/50 dark:border-blue-700/30"
                  >
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-blue-200 dark:border-blue-700">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {item.name}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 rounded-full border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-bold w-8 text-center text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 rounded-full border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-600 dark:text-slate-400 hover:text-red-500 mt-2"
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-slate-800/90 p-8 rounded-2xl border border-blue-200/50 dark:border-blue-700/30 shadow-xl shadow-blue-500/10 lg:sticky lg:top-32">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent mb-6">
                Order Summary
              </h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Calculated at next step</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>Calculated at next step</span>
                </div>
              </div>
              <div className="border-t border-blue-200 dark:border-blue-700 pt-6 mt-6">
                <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <Link href="/checkout">
                  <Button
                    size="lg"
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-bold rounded-full py-3 shadow-xl shadow-blue-500/50"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl bg-white dark:bg-slate-800/50">
            <ShoppingBag className="w-16 h-16 mx-auto text-blue-400 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Your Cart is Empty
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 mb-6">
              Add some products to get started!
            </p>
            <Link href="/products">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-bold rounded-full py-3 px-8 shadow-xl shadow-blue-500/50"
              >
                Start Shopping
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
export default CartPage;
