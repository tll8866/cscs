import postgres from 'postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

// 使用 DATABASE_URL，这是 Neon 推荐的连接字符串
const sql = postgres(process.env.DATABASE_URL!, { 
  ssl: {
    rejectUnauthorized: true
  },
  connection: {
    timeout: 60000 // 增加连接超时时间
  }
});

async function seedUsers() {
  try {
    console.log('Starting to seed users...');
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;

    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        return sql`
          INSERT INTO users (id, name, email, password)
          VALUES (${user.id}, ${user.name}, ${user.email}, ${user.password})
          ON CONFLICT (id) DO NOTHING;
        `;
      }),
    );

    console.log(`Seeded ${insertedUsers.length} users`);
    return insertedUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function seedCustomers() {
  try {
    console.log('Starting to seed customers...');
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL
      );
    `;

    const insertedCustomers = await Promise.all(
      customers.map(
        (customer) => sql`
          INSERT INTO customers (id, name, email, image_url)
          VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
          ON CONFLICT (id) DO NOTHING;
        `,
      ),
    );

    console.log(`Seeded ${insertedCustomers.length} customers`);
    return insertedCustomers;
  } catch (error) {
    console.error('Error seeding customers:', error);
    throw error;
  }
}

async function seedInvoices() {
  try {
    console.log('Starting to seed invoices...');
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        customer_id UUID NOT NULL,
        amount INT NOT NULL,
        status VARCHAR(255) NOT NULL,
        date DATE NOT NULL
      );
    `;

    const insertedInvoices = await Promise.all(
      invoices.map(
        (invoice) => sql`
          INSERT INTO invoices (customer_id, amount, status, date)
          VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
          ON CONFLICT (id) DO NOTHING;
        `,
      ),
    );

    console.log(`Seeded ${insertedInvoices.length} invoices`);
    return insertedInvoices;
  } catch (error) {
    console.error('Error seeding invoices:', error);
    throw error;
  }
}

async function seedRevenue() {
  try {
    console.log('Starting to seed revenue...');
    await sql`
      CREATE TABLE IF NOT EXISTS revenue (
        month VARCHAR(4) NOT NULL UNIQUE,
        revenue INT NOT NULL
      );
    `;

    const insertedRevenue = await Promise.all(
      revenue.map(
        (rev) => sql`
          INSERT INTO revenue (month, revenue)
          VALUES (${rev.month}, ${rev.revenue})
          ON CONFLICT (month) DO NOTHING;
        `,
      ),
    );

    console.log(`Seeded ${insertedRevenue.length} revenue items`);
    return insertedRevenue;
  } catch (error) {
    console.error('Error seeding revenue:', error);
    throw error;
  }
}

export async function GET() {
  try {
    console.log('Starting database seeding...');
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
    
    return Response.json({ message: 'Database seeded successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error seeding database:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ error: 'Failed to seed database' }, { status: 500 });
  } finally {
    await sql.end();
  }
} 