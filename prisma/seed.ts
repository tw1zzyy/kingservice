import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database for KING SERVICE...')

  // Hash the password for the test user
  const passwordHash = await bcrypt.hash('password123', 10)

  // Clear existing data in correct dependency order
  await prisma.auditLog.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.delivery.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.salesOrder.deleteMany()
  await prisma.purchaseOrderItem.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.inventoryMovement.deleteMany()
  await prisma.stock.deleteMany()
  await prisma.promotionalPrice.deleteMany()
  await prisma.customerPrice.deleteMany()
  await prisma.product.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.warehouse.deleteMany()
  await prisma.category.deleteMany()
  await prisma.customerAddress.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Categories
  const foodCategory = await prisma.category.create({
    data: {
      name: 'Food Ingredients',
      slug: 'food-ingredients',
      description: 'Kebab meat, bread, dairy, and sauces',
    },
  })

  const packagingCategory = await prisma.category.create({
    data: {
      name: 'Packaging Supplies',
      slug: 'packaging-supplies',
      description: 'Boxes, containers, and bags',
    },
  })

  const equipmentCategory = await prisma.category.create({
    data: {
      name: 'Professional Catering Equipment',
      slug: 'professional-catering-equipment',
      description: 'Grills, fridges, and ovens',
    },
  })

  // 2. Create Supplier
  const supplier = await prisma.supplier.create({
    data: {
      name: 'Global Foods & Equipment s.r.o.',
      contactPerson: 'Jan Novak',
      phone: '+420 602 123 456',
      email: 'orders@globalfoods.cz',
      currency: 'CZK',
      paymentTerms: '14 days',
    },
  })

  // 3. Create Warehouse
  const warehouse = await prisma.warehouse.create({
    data: {
      name: 'Main Central Warehouse Ústí nad Labem',
      code: 'WH-USTI-01',
      address: 'Všpulkova 123, Ústí nad Labem',
      isDefault: true,
    },
  })

  // 4. Create Products
  const product1 = await prisma.product.create({
    data: {
      sku: 'KS-DURUM-01',
      name: 'Dürüm KING 30cm (Pack of 100)',
      slug: 'durum-king-30cm',
      description: 'High-quality wheat tortilla wraps for kebabs and burritos.',
      categoryId: foodCategory.id,
      supplierId: supplier.id,
      purchasePrice: 95.00,
      standardPrice: 125.00,
      currency: 'CZK',
      unitOfMeasure: 'pack',
      packSize: 1,
      minOrderQty: 1,
      weightKg: 10.5,
    },
  })

  const product2 = await prisma.product.create({
    data: {
      sku: 'KS-SAUCE-GARLIC',
      name: 'Garlic Special Sauce 5L',
      slug: 'garlic-special-sauce-5l',
      description: 'Professional catering garlic sauce specially formulated for kebab shops.',
      categoryId: foodCategory.id,
      supplierId: supplier.id,
      purchasePrice: 320.00,
      standardPrice: 420.00,
      currency: 'CZK',
      unitOfMeasure: 'pcs',
      packSize: 1,
      minOrderQty: 1,
      weightKg: 5.2,
    },
  })

  const product3 = await prisma.product.create({
    data: {
      sku: 'KS-EQ-GRILL',
      name: 'Commercial Kebab Grill Electric 4 Burners',
      slug: 'commercial-kebab-grill-electric-4-burners',
      description: 'Heavy duty commercial electric vertical kebab machine.',
      categoryId: equipmentCategory.id,
      supplierId: supplier.id,
      purchasePrice: 18000.00,
      standardPrice: 24900.00,
      currency: 'CZK',
      unitOfMeasure: 'pcs',
      packSize: 1,
      minOrderQty: 1,
      weightKg: 35.0,
    },
  })

  // Set initial stock
  await prisma.stock.createMany({
    data: [
      { productId: product1.id, warehouseId: warehouse.id, quantity: 150, minStock: 20 },
      { productId: product2.id, warehouseId: warehouse.id, quantity: 80, minStock: 15 },
      { productId: product3.id, warehouseId: warehouse.id, quantity: 5, minStock: 2 },
    ],
  })

  // 5. Create Test Customer & User
  const customerUser = await prisma.user.create({
    data: {
      email: 'boss@kebabdecin.cz',
      passwordHash: passwordHash,
      firstName: 'Ahmet',
      lastName: 'Yilmaz',
      role: 'B2B_CUSTOMER',
      phone: '+420 777 888 999',
    },
  })

  const customer = await prisma.customer.create({
    data: {
      userId: customerUser.id,
      companyName: 'THE BOSS KEBAB DĚČÍN',
      ico: '28491029',
      dic: 'CZ28491029',
      contactPerson: 'Ahmet Yilmaz',
      phone: '+420 777 888 999',
      email: 'boss@kebabdecin.cz',
      creditLimit: 50000.00,
      currentBalance: 0.00,
    },
  })

  await prisma.customerAddress.create({
    data: {
      customerId: customer.id,
      street: 'Masarykova 45',
      city: 'Děčín',
      postalCode: '405 02',
      country: 'Czech Republic',
      isDefault: true,
      notes: 'Back entrance loading dock',
    },
  })

  // 6. Assign Customer-Specific Price
  await prisma.customerPrice.create({
    data: {
      customerId: customer.id,
      productId: product1.id,
      price: 115.00, // Discounted custom price for this customer!
    },
  })

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
