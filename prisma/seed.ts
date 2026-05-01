import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

console.log('1. Iniciando configuração...')
// Cria a pool de conexões com o banco de dados
const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL não configurada no .env')
}
console.log('2. DATABASE_URL OK:', DATABASE_URL)

const pool = new Pool({
  connectionString: DATABASE_URL,
})
console.log('3. Pool criada')

// Cria o adaptador para o Prisma (PASSO CRUCIAL)
const adapter = new PrismaPg(pool)
console.log('4. Adapter criado')

// Instancia o PrismaClient passando o adaptador como parâmetro
const prisma = new PrismaClient({ adapter })
console.log('5. PrismaClient criado:', !!prisma)
console.log('6. PrismaClient.product existe?', !!prisma?.products)

async function main() {
  console.log('Starting seed...')

  // Limpar dados existentes (opcional)
  console.log('8. Tentando deleteMany...')
  const deleted = await prisma.products.deleteMany()
  console.log(`9. ${deleted.count} produtos removidos`)


  // Criar produtos
  const products = [
    {
      name: "Camiseta Básica Preta",
      slug: "camiseta-basica-preta",
      description: "Camiseta 100% algodão, confortável e durável. Perfeita para uso diário.",
      price: 49.99,
      comparePrice: 89.99,
      images: [
        "/products/camiseta-preta-1.jpg",
        "/products/camiseta-preta-2.jpg",
      ],
      category: "Roupas",
      tags: ["camiseta", "basico", "algodao"],
      stock: 50,
      sku: "CAM-001-PRE",
      rating: 4.5,
      numReviews: 12,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Camiseta Básica Branca",
      slug: "camiseta-basica-branca",
      description: "Camiseta branca 100% algodão, ideal para estamparia.",
      price: 49.99,
      comparePrice: 89.99,
      images: ["/products/camiseta-branca-1.jpg"],
      category: "Roupas",
      tags: ["camiseta", "basico", "algodao"],
      stock: 45,
      sku: "CAM-002-BRA",
      rating: 4.8,
      numReviews: 8,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Calça Jeans Skinny",
      slug: "calca-jeans-skinny",
      description: "Calça jeans skinny com elastano, modelagem perfeita.",
      price: 149.99,
      comparePrice: 199.99,
      images: ["/products/calça-jeans-1.jpg"],
      category: "Roupas",
      tags: ["calça", "jeans", "skinny"],
      stock: 30,
      sku: "CAL-001-JEA",
      rating: 4.2,
      numReviews: 15,
      isActive: true,
      isFeatured: false,
    },
    {
      name: "Tênis Esportivo",
      slug: "tenis-esportivo",
      description: "Tênis confortável para corrida e uso diário.",
      price: 199.99,
      comparePrice: 299.99,
      images: ["/products/tenis-1.jpg"],
      category: "Calçados",
      tags: ["tenis", "esportivo", "corrida"],
      stock: 20,
      sku: "TEN-001-ESP",
      rating: 4.7,
      numReviews: 23,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Mochila Executiva",
      slug: "mochila-executiva",
      description: "Mochila para notebook de até 15.6 polegadas.",
      price: 259.99,
      comparePrice: 349.99,
      images: ["/products/mochila-1.jpg"],
      category: "Acessórios",
      tags: ["mochila", "executiva", "notebook"],
      stock: 15,
      sku: "MOC-001-EXE",
      rating: 4.9,
      numReviews: 31,
      isActive: true,
      isFeatured: true,
    },
  ]

  for (const product of products) {
    await prisma.products.upsert({
      where: { sku: product.sku },
      update: {},
      create: product as any,
    })
    console.log(`Created product: ${product.name}`)
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })