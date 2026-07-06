-- Supabase Database Schema for Women's Fashion E-Commerce (Aura)

-- 1. Profiles Table (Linked to Supabase Auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  phone text,
  address text,
  role text default 'user' check (role in ('user', 'admin')),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) for profiles
alter table profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone" 
  on profiles for select 
  using (true);

drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile" 
  on profiles for insert 
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile" 
  on profiles for update 
  using (auth.uid() = id);

-- 2. Products Table
create table if not exists products (
  id serial primary key,
  name text not null,
  description text,
  price numeric not null,
  discount_price numeric,
  category text not null,
  brand text,
  color text[] default '{}',
  sizes text[] default '{}',
  images text[] default '{}',
  stock integer default 0,
  rating numeric(3,2) default 5.0,
  featured boolean default false,
  trending boolean default false,
  best_seller boolean default false,
  new_arrival boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for products
alter table products enable row level security;

drop policy if exists "Products are viewable by everyone" on products;
create policy "Products are viewable by everyone" 
  on products for select 
  using (true);

drop policy if exists "Admins can modify products" on products;
create policy "Admins can modify products" 
  on products for all 
  using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 3. Carts Table
create table if not exists carts (
  id text primary key, -- formatted as user_id-product_id-size-color
  user_id uuid references auth.users on delete cascade not null,
  product_id integer references products on delete cascade not null,
  quantity integer default 1 check (quantity > 0),
  selected_size text not null,
  selected_color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table carts enable row level security;

drop policy if exists "Users can view their own cart items" on carts;
create policy "Users can view their own cart items" 
  on carts for select 
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own cart items" on carts;
create policy "Users can insert their own cart items" 
  on carts for insert 
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own cart items" on carts;
create policy "Users can update their own cart items" 
  on carts for update 
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own cart items" on carts;
create policy "Users can delete their own cart items" 
  on carts for delete 
  using (auth.uid() = user_id);

-- 4. Wishlists Table
create table if not exists wishlists (
  id serial primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id integer references products on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, product_id)
);

alter table wishlists enable row level security;

drop policy if exists "Users can view their own wishlist" on wishlists;
create policy "Users can view their own wishlist" 
  on wishlists for select 
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own wishlist" on wishlists;
create policy "Users can insert their own wishlist" 
  on wishlists for insert 
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own wishlist" on wishlists;
create policy "Users can delete their own wishlist" 
  on wishlists for delete 
  using (auth.uid() = user_id);

-- 5. Orders Table
create table if not exists orders (
  id text primary key,
  user_id uuid references auth.users on delete set null,
  total_price numeric not null,
  shipping_address jsonb not null,
  payment_method text not null,
  payment_status text default 'Pending',
  order_status text default 'Processing',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table orders enable row level security;

drop policy if exists "Users can view their own orders" on orders;
create policy "Users can view their own orders" 
  on orders for select 
  using (auth.uid() = user_id);

drop policy if exists "Users can place orders" on orders;
create policy "Users can place orders" 
  on orders for insert 
  with check (auth.uid() = user_id);

drop policy if exists "Admins can view and edit all orders" on orders;
create policy "Admins can view and edit all orders" 
  on orders for all 
  using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 6. Order Items Table
create table if not exists order_items (
  id serial primary key,
  order_id text references orders on delete cascade not null,
  product_id integer references products on delete set null,
  quantity integer not null,
  price numeric not null,
  selected_size text,
  selected_color text
);

alter table order_items enable row level security;

drop policy if exists "Users can view their own order items" on order_items;
create policy "Users can view their own order items" 
  on order_items for select 
  using (
    exists (
      select 1 from orders 
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

drop policy if exists "Users can create order items" on order_items;
create policy "Users can create order items" 
  on order_items for insert 
  with check (
    exists (
      select 1 from orders 
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

drop policy if exists "Admins can manage all order items" on order_items;
create policy "Admins can manage all order items" 
  on order_items for all 
  using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 7. Reviews Table
create table if not exists reviews (
  id serial primary key,
  product_id integer references products on delete cascade not null,
  user_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table reviews enable row level security;

drop policy if exists "Reviews are viewable by everyone" on reviews;
create policy "Reviews are viewable by everyone" 
  on reviews for select 
  using (true);

drop policy if exists "Logged-in users can write reviews" on reviews;
create policy "Logged-in users can write reviews" 
  on reviews for insert 
  with check (auth.role() = 'authenticated');

-- 8. Coupons Table
create table if not exists coupons (
  id serial primary key,
  code text unique not null,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  value numeric not null,
  min_spend numeric,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table coupons enable row level security;

drop policy if exists "Coupons are viewable by authenticated users" on coupons;
create policy "Coupons are viewable by authenticated users" 
  on coupons for select 
  using (auth.role() = 'authenticated');

drop policy if exists "Admins can manage coupons" on coupons;
create policy "Admins can manage coupons" 
  on coupons for all 
  using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 9. Automatic Profile Creation Trigger on Sign Up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, phone, address, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Anonymous Client'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'address',
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
