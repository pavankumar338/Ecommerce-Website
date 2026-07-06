import React from 'react';
import { useShop } from '../context/ShopContext';

export const MyOrders: React.FC = () => {
  const { orders } = useShop();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12 border-b border-brand-beige-dark/15 pb-6">
        <h1 className="font-serif text-3xl font-bold text-brand-charcoal dark:text-white">My Orders</h1>
        <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 mt-1">Review your luxury order history and tracking status.</p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-8">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white dark:bg-brand-charcoal/20 rounded-2xl border border-brand-beige-dark/15 overflow-hidden shadow-xs"
            >
              
              {/* Order Header Summary */}
              <div className="bg-brand-cream dark:bg-brand-charcoal/45 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-brand-beige-dark/10">
                <div className="flex gap-6">
                  <div>
                    <span className="text-[10px] text-brand-charcoal/55 dark:text-brand-cream/55 uppercase font-bold tracking-wider">Date Placed</span>
                    <p className="text-xs font-semibold text-brand-charcoal dark:text-brand-cream mt-0.5">{order.date}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-brand-charcoal/55 dark:text-brand-cream/55 uppercase font-bold tracking-wider">Total Value</span>
                    <p className="text-xs font-semibold text-brand-charcoal dark:text-brand-cream mt-0.5">₹{order.totalPrice}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-brand-charcoal/55 dark:text-brand-cream/55 uppercase font-bold tracking-wider">Order Status</span>
                    <p className="text-xs font-bold text-brand-blush-dark mt-0.5 uppercase tracking-wide">{order.orderStatus}</p>
                  </div>
                </div>

                <div className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 font-mono font-semibold">
                  {order.id}
                </div>
              </div>

              {/* Order items lists */}
              <div className="p-6 divide-y divide-brand-beige-dark/10">
                {order.products.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center py-4 first:pt-0 last:pb-0">
                    <img src={item.image} alt={item.name} className="w-14 h-18 object-contain object-center rounded-lg bg-brand-cream-dark/10" />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-brand-charcoal dark:text-white truncate">{item.name}</h4>
                      <p className="text-[10px] text-brand-charcoal/50 dark:text-brand-cream/50 mt-1">
                        Size: {item.selectedSize} | Color: {item.selectedColor}
                      </p>
                      <p className="text-[10px] text-brand-charcoal/55 dark:text-brand-cream/55 mt-1 font-semibold">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <div className="text-xs font-bold text-brand-charcoal dark:text-white">
                      ₹{item.price * item.quantity}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-brand-charcoal/20 border border-brand-beige-dark/15 rounded-2xl max-w-md mx-auto">
          <p className="text-sm text-brand-charcoal/60 dark:text-brand-cream/60">No order history available.</p>
          <p className="text-xs text-brand-charcoal/40 dark:text-brand-cream/40 mt-1">Once you complete a checkout purchase, it will appear here.</p>
        </div>
      )}

    </div>
  );
};
