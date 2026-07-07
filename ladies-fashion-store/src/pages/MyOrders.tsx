import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { supabase } from '../services/supabase';

export const MyOrders: React.FC = () => {
  const { orders, user } = useShop();
  const [customOrders, setCustomOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomOrders = async () => {
      try {
        let query = supabase.from('custom_orders').select('*');
        
        // Show user-specific tailoring orders if authenticated
        if (user?.id) {
          query = query.eq('user_id', user.id);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data) {
          setCustomOrders(data);
        }
      } catch (err) {
        console.error("Error fetching custom orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomOrders();
  }, [user]);

  // Map Supabase custom orders to matching view model schema
  const formattedCustomOrders = customOrders.map(co => ({
    id: `TLR-${co.id.slice(0, 6).toUpperCase()}`,
    date: new Date(co.created_at).toISOString().split('T')[0],
    totalPrice: co.total_price,
    orderStatus: co.status,
    isCustom: true,
    advancePaid: co.advance_paid,
    dueAmount: co.due_amount,
    paymentStatus: co.payment_status,
    products: [
      {
        name: `Custom ${co.dress_type}`,
        image: co.dress_type === 'Kurti' ? '/kurtis.png' :
               co.dress_type === 'Anarkali' ? '/anarkalis.png' :
               co.dress_type === 'Lehenga' ? '/lehenga.png' :
               co.dress_type === 'Dupatta' ? '/dupatta.png' : '/kurtaset.png',
        selectedSize: 'Custom Fit',
        selectedColor: co.fabric_color,
        quantity: 1,
        price: co.total_price,
        fabric: co.fabric,
        pattern: co.pattern
      }
    ]
  }));

  // Merge regular purchases and custom tailoring orders chronologically
  const allOrders = [
    ...orders.map(o => ({ ...o, isCustom: false, advancePaid: undefined })),
    ...formattedCustomOrders
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12 border-b border-brand-beige-dark/15 pb-6">
        <h1 className="font-serif text-3xl font-bold text-brand-charcoal dark:text-white">My Orders</h1>
        <p className="text-xs text-brand-charcoal/50 dark:text-brand-cream/50 mt-1">Review your luxury order history and tracking status.</p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-sm text-brand-charcoal/60 dark:text-brand-cream/60">Loading your order history...</p>
        </div>
      ) : allOrders.length > 0 ? (
        <div className="space-y-8">
          {allOrders.map((order) => (
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
                  <div key={idx} className="flex gap-4 items-start sm:items-center py-4 first:pt-0 last:pb-0">
                    <img src={item.image} alt={item.name} className="w-14 h-18 object-contain object-center rounded-lg bg-brand-cream-dark/10" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-brand-charcoal dark:text-white truncate">{item.name}</h4>
                        {order.isCustom && (
                          <span className="text-[8px] bg-brand-gold/10 text-brand-gold font-bold px-1.5 py-0.5 rounded-full border border-brand-gold/20 uppercase tracking-wider">Tailored</span>
                        )}
                      </div>
                      <p className="text-[10px] text-brand-charcoal/50 dark:text-brand-cream/50 mt-1">
                        Size: {item.selectedSize} | Color: {item.selectedColor}
                      </p>
                      {order.isCustom && (
                        <p className="text-[10px] text-brand-charcoal/50 dark:text-brand-cream/50 mt-0.5">
                          Fabric: {(item as any).fabric} | Pattern: {(item as any).pattern}
                        </p>
                      )}
                      <p className="text-[10px] text-brand-charcoal/55 dark:text-brand-cream/55 mt-1 font-semibold">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <div className="text-right flex flex-col justify-between h-full min-h-[50px]">
                      <div className="text-xs font-bold text-brand-charcoal dark:text-white">
                        ₹{item.price * item.quantity}
                      </div>
                      {order.isCustom && (
                        <div className="text-[9px] text-emerald-500 font-semibold mt-1">
                          Advance Paid: ₹{order.advancePaid}
                        </div>
                      )}
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
          <p className="text-xs text-brand-charcoal/40 dark:text-brand-cream/40 mt-1">Once you complete a purchase or tailoring order, it will appear here.</p>
        </div>
      )}

    </div>
  );
};
